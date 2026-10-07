import { findOrCreateOAuthUser } from '../auth.js';
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

async function handleDevMockOAuth(req, res, provider, redirectTo, role) {
  const safeRole = role === 'brand' ? 'brand' : 'creator';
  const mockEmail = `${provider}.demo@collabkar.dev`;
  const mockProviderId = `mock_${provider}_demo_id`;
  const displayName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} Demo User`;

  const result = await findOrCreateOAuthUser({
    provider,
    providerId: mockProviderId,
    email: mockEmail,
    role: safeRole,
    displayName,
  });

  if (!result.ok) {
    return res.status(result.status || 500).json({ ok: false, error: result.error });
  }

  const appBaseUrl = getAppBaseUrl();
  const safeRedirect = encodeURIComponent(redirectTo || '/dashboard');
  const authCode = createAuthCode({ token: result.token });
  return res.redirect(`${appBaseUrl}/auth/callback?code=${encodeURIComponent(authCode)}&redirect=${safeRedirect}`);
}

export async function oauthStart(req, res) {
  const provider = String(req.params?.provider || '').toLowerCase();
  const config = requireProvider(provider);
  if (!config) return res.status(400).json({ ok: false, error: 'Unsupported provider.' });

  const redirectTo = sanitizeRedirect(req.query?.redirect);
  const role = req.query?.role === 'brand' ? 'brand' : 'creator';
  const isDev = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';
  const mockEnabled = isDev || process.env.OAUTH_DEV_MOCK_ENABLED === 'true';

  const { state, codeVerifier } = createState({ provider, redirectTo, role });

  if (provider === 'google') {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      if (mockEnabled) {
        return handleDevMockOAuth(req, res, 'google', redirectTo, role);
      }
      return res.status(500).json({ ok: false, error: 'Google OAuth not configured.' });
    }

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
    if (!clientId) {
      if (mockEnabled) {
        return handleDevMockOAuth(req, res, 'facebook', redirectTo, role);
      }
      return res.status(500).json({ ok: false, error: 'Facebook OAuth not configured.' });
    }

    const url = new URL('https://www.facebook.com/v26.0/dialog/oauth');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', config.redirectUri);
    url.searchParams.set('state', state);
    url.searchParams.set('scope', 'email');
    url.searchParams.set('response_type', 'code');
    return res.redirect(url.toString());
  }

  if (provider === 'apple') {
    const clientId = process.env.APPLE_CLIENT_ID;
    if (!clientId) {
      if (mockEnabled) {
        return handleDevMockOAuth(req, res, 'apple', redirectTo, role);
      }
      return res.status(500).json({ ok: false, error: 'Apple OAuth not configured.' });
    }

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

      if (payload?.email_verified !== true && payload?.email_verified !== 'true') {
        throw new Error('google_email_not_verified');
      }
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

      if (payload?.email_verified !== true && payload?.email_verified !== 'true') {
        throw new Error('apple_email_not_verified');
      }
      email = String(payload?.email || '');
      providerId = String(payload?.sub || '');
    }

    const result = await findOrCreateOAuthUser({ provider, providerId, email, role: stateEntry.role });
    if (!result.ok) return res.status(result.status).json({ ok: false, error: result.error });

    const appBaseUrl = getAppBaseUrl();
    const redirectTo = encodeURIComponent(stateEntry.redirectTo || '/dashboard');
    const authCode = createAuthCode({ token: result.token });
    return res.redirect(`${appBaseUrl}/auth/callback?code=${encodeURIComponent(authCode)}&redirect=${redirectTo}`);
  } catch (error) {
    return res.status(400).json({ ok: false, error: 'OAuth login failed.' });
  }
}

export async function oauthExchange(req, res) {
  const { code } = req.body ?? {};
  const entry = consumeAuthCode(code);
  if (!entry) return res.status(400).json({ ok: false, error: 'Invalid or expired code.' });
  return res.json({ ok: true, token: entry.token });
}
