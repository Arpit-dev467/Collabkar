import crypto from 'node:crypto';

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${pad}`, 'base64');
}

function decodeJson(part) {
  const buf = base64UrlDecode(part);
  return JSON.parse(buf.toString('utf8'));
}

const jwksCache = new Map();

async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`jwks_fetch_failed_${response.status}`);
  return response.json();
}

async function getJwks(jwksUrl) {
  const cached = jwksCache.get(jwksUrl);
  const now = Date.now();
  if (cached && now < cached.expiresAt) return cached.jwks;

  const jwks = await fetchJson(jwksUrl);
  jwksCache.set(jwksUrl, { jwks, expiresAt: now + 60 * 60_000 });
  return jwks;
}

function pickKey(jwks, kid) {
  const keys = Array.isArray(jwks?.keys) ? jwks.keys : [];
  return keys.find((k) => k.kid === kid) || null;
}

export async function verifyJwtRs256({ token, jwksUrl, issuer, audience }) {
  const raw = typeof token === 'string' ? token.trim() : '';
  const parts = raw.split('.');
  if (parts.length !== 3) throw new Error('jwt_format_invalid');

  const header = decodeJson(parts[0]);
  const payload = decodeJson(parts[1]);
  const signature = base64UrlDecode(parts[2]);

  if (header?.alg !== 'RS256') throw new Error('jwt_alg_invalid');
  const kid = header?.kid;
  if (!kid) throw new Error('jwt_kid_missing');

  const jwks = await getJwks(jwksUrl);
  const jwk = pickKey(jwks, kid);
  if (!jwk) throw new Error('jwt_key_not_found');

  const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
  const data = Buffer.from(`${parts[0]}.${parts[1]}`);
  const ok = crypto.verify('RSA-SHA256', data, publicKey, signature);
  if (!ok) throw new Error('jwt_signature_invalid');

  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(Number(payload?.exp)) || Number(payload.exp) <= now) throw new Error('jwt_expired');
  if (payload?.nbf !== undefined && (!Number.isFinite(Number(payload.nbf)) || Number(payload.nbf) > now)) {
    throw new Error('jwt_not_active');
  }
  if (issuer && payload?.iss !== issuer) throw new Error('jwt_issuer_invalid');
  if (audience) {
    const aud = payload?.aud;
    const okAud = Array.isArray(aud) ? aud.includes(audience) : aud === audience;
    if (!okAud) throw new Error('jwt_audience_invalid');
  }

  return payload;
}

