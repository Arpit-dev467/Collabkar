import { findOrCreateOAuthUser, getUserByEmail, createOAuthUser } from '../auth.js';
import { verifyJwtRs256 } from './jwtVerify.js';
import { consumeAuthCode, createAuthCode } from './codeStore.js';
import { consumeState, createState, pkceChallenge, sanitizeRedirect } from './stateStore.js';
import {
  exchangeAppleCode,
  exchangeFacebookCode,
  exchangeGoogleCode,
  fetchFacebookProfile,
} from './providers.js';

function getAppBaseUrl() {
  return process.env.APP_BASE_URL || 'http://localhost:3000';
}

function providerRedirectUri(provider) {
  if (provider === 'google') return process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4001/api/auth/oauth/google/callback';
  if (provider === 'facebook') return process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:4001/api/auth/oauth/facebook/callback';
  if (provider === 'apple') return process.env.APPLE_REDIRECT_URI || 'http://localhost:4001/api/auth/oauth/apple/callback';
  return null;
}

function requireProvider(provider) {
  if (provider !== 'google' && provider !== 'facebook' && provider !== 'apple') return null;
  const redirectUri = providerRedirectUri(provider);
  if (!redirectUri) return null;
  return { provider, redirectUri };
}

export function oauthStart(req, res) {
  const provider = String(req.params?.provider || '').toLowerCase();
  const config = requireProvider(provider);
  if (!config) return res.status(400).json({ ok: false, error: 'Unsupported provider.' });

  const redirectTo = sanitizeRedirect(req.query?.redirect);
  const { state, codeVerifier } = createState({ provider, redirectTo });

  if (provider === 'google') {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return res.status(500).json({ ok: false, error: 'Google OAuth not configured.' });

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', config.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('state', state);
    url.searchParams.set('code_challenge', pkceChallenge(codeVerifier));
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('prompt', 'select_account');
    return res.redirect(url.toString());
  }

  if (provider === 'facebook') {
    const clientId = process.env.FACEBOOK_CLIENT_ID;
    if (!clientId) return res.status(500).json({ ok: false, error: 'Facebook OAuth not configured.' });

    const url = new URL('https://www.facebook.com/v19.0/dialog/oauth');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', config.redirectUri);
    url.searchParams.set('state', state);
    url.searchParams.set('scope', 'email');
    url.searchParams.set('response_type', 'code');
    return res.redirect(url.toString());
  }

  if (provider === 'apple') {
    const clientId = process.env.APPLE_CLIENT_ID;
    if (!clientId) return res.status(500).json({ ok: false, error: 'Apple OAuth not configured.' });

    const url = new URL('https://appleid.apple.com/auth/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', config.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('response_mode', 'form_post');
    url.searchParams.set('scope', 'name email');
    url.searchParams.set('state', state);
    return res.redirect(url.toString());
  }

  return res.status(400).json({ ok: false, error: 'Unsupported provider.' });
}

export async function oauthCallback(req, res) {
  const provider = String(req.params?.provider || '').toLowerCase();
  const config = requireProvider(provider);
  if (!config) return res.status(400).json({ ok: false, error: 'Unsupported provider.' });

  const body = req.body ?? {};
  const query = req.query ?? {};
  const code = String(body.code || query.code || '');
  const state = String(body.state || query.state || '');
  if (!code || !state) return res.status(400).json({ ok: false, error: 'Missing code/state.' });

  const stateEntry = consumeState(state);
  if (!stateEntry || stateEntry.provider !== provider) {
    return res.status(400).json({ ok: false, error: 'Invalid OAuth state.' });
  }

  try {
    let email = '';
    let providerId = '';

    if (provider === 'google') {
      const tokenResponse = await exchangeGoogleCode({
        code,
        redirectUri: config.redirectUri,
        codeVerifier: stateEntry.codeVerifier,
      });

      const idToken = tokenResponse?.id_token;
      const payload = await verifyJwtRs256({
        token: idToken,
        jwksUrl: 'https://www.googleapis.com/oauth2/v3/certs',
        issuer: 'https://accounts.google.com',
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      email = String(payload?.email || '');
      providerId = String(payload?.sub || '');
    }

    if (provider === 'facebook') {
      const tokenResponse = await exchangeFacebookCode({ code, redirectUri: config.redirectUri });
      const accessToken = tokenResponse?.access_token;
      const profile = await fetchFacebookProfile(accessToken);
      email = String(profile?.email || '');
      providerId = String(profile?.id || '');
    }

    if (provider === 'apple') {
      const tokenResponse = await exchangeAppleCode({ code, redirectUri: config.redirectUri });
      const idToken = tokenResponse?.id_token;
      const payload = await verifyJwtRs256({
        token: idToken,
        jwksUrl: 'https://appleid.apple.com/auth/keys',
        issuer: 'https://appleid.apple.com',
        audience: process.env.APPLE_CLIENT_ID,
      });

      email = String(payload?.email || '');
      providerId = String(payload?.sub || '');
    }

    // If user already exists, update their oauth fields and issue a token immediately.
    const existing = await getUserByEmail(email);
    const appBaseUrl = getAppBaseUrl();
    const redirectTo = encodeURIComponent(stateEntry.redirectTo || '/dashboard');

    if (existing) {
      const result = await findOrCreateOAuthUser({ provider, providerId, email });
      if (!result.ok) return res.status(result.status).json({ ok: false, error: result.error });
      const authCode = createAuthCode({ token: result.token });
      return res.redirect(`${appBaseUrl}/auth/callback?code=${encodeURIComponent(authCode)}&redirect=${redirectTo}`);
    }

    // New user: create a pending auth entry and redirect to frontend role-selection before creating the account.
    const pendingCode = createAuthCode({ pending: { provider, providerId, email } });
    return res.redirect(`${appBaseUrl}/onboarding/role?code=${encodeURIComponent(pendingCode)}&redirect=${redirectTo}`);
  } catch (error) {
    return res.status(400).json({ ok: false, error: 'OAuth login failed.' });
  }
}

export async function oauthComplete(req, res) {
  try {
    const { code, role } = req.body ?? {};
    if (!code || !role) return res.status(400).json({ ok: false, error: 'Missing code or role.' });

    const entry = consumeAuthCode(code);
    if (!entry || !entry.pending) return res.status(400).json({ ok: false, error: 'Invalid or expired code.' });

    const { provider, providerId, email } = entry.pending;
    // Create the user now with the chosen role
    const creation = await createOAuthUser({ provider, providerId, email, role });
    if (!creation.ok) return res.status(400).json({ ok: false, error: creation.error });

    return res.json({ ok: true, token: creation.token });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Failed to complete OAuth signup.' });
  }
}

export async function oauthExchange(req, res) {
  const { code } = req.body ?? {};
  const entry = consumeAuthCode(code);
  if (!entry) return res.status(400).json({ ok: false, error: 'Invalid or expired code.' });
  return res.json({ ok: true, token: entry.token });
}
