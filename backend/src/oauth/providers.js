import crypto from 'node:crypto';

function toFormUrlEncoded(values) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null) continue;
    params.set(key, String(value));
  }
  return params.toString();
}

async function postForm(url, values) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: toFormUrlEncoded(values),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error_description || data?.error?.message || 'oauth_token_exchange_failed';
    throw new Error(message);
  }
  return data;
}

async function getJson(url) {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error('oauth_fetch_failed');
  return data;
}

function base64Url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function createAppleClientSecret() {
  const clientId = process.env.APPLE_CLIENT_ID;
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const privateKeyPem = process.env.APPLE_PRIVATE_KEY_PEM;

  if (!clientId || !teamId || !keyId || !privateKeyPem) {
    throw new Error('apple_oauth_env_missing');
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 10 * 60; // 10 minutes (safe default)

  const header = { alg: 'ES256', kid: keyId, typ: 'JWT' };
  const payload = {
    iss: teamId,
    iat: now,
    exp,
    aud: 'https://appleid.apple.com',
    sub: clientId,
  };

  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const toSign = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto.sign('sha256', Buffer.from(toSign), {
    key: privateKeyPem,
    dsaEncoding: 'ieee-p1363',
  });
  const encodedSig = base64Url(signature);

  return `${toSign}.${encodedSig}`;
}

export async function exchangeGoogleCode({ code, redirectUri, codeVerifier }) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('google_oauth_env_missing');

  return postForm('https://oauth2.googleapis.com/token', {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
  });
}

export async function exchangeFacebookCode({ code, redirectUri }) {
  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('facebook_oauth_env_missing');

  const url = new URL('https://graph.facebook.com/v26.0/oauth/access_token');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('client_secret', clientSecret);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('code', code);
  return getJson(url.toString());
}

export async function fetchFacebookProfile(accessToken) {
  const url = new URL('https://graph.facebook.com/v26.0/me');
  url.searchParams.set('fields', 'id,name,email');
  url.searchParams.set('access_token', accessToken);
  return getJson(url.toString());
}

export async function exchangeAppleCode({ code, redirectUri }) {
  const clientId = process.env.APPLE_CLIENT_ID;
  if (!clientId) throw new Error('apple_oauth_env_missing');

  const clientSecret = createAppleClientSecret();
  return postForm('https://appleid.apple.com/auth/token', {
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });
}

