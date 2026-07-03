import crypto from 'node:crypto';

const CODE_TTL_MS = 2 * 60_000;
const store = new Map();

function base64Url(buffer) {
  return Buffer.from(buffer).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function createAuthCode({ token = null, pending = null } = {}) {
  const code = base64Url(crypto.randomBytes(24));
  store.set(code, { token, pending, expiresAt: Date.now() + CODE_TTL_MS });
  return code;
}

export function consumeAuthCode(code) {
  const raw = typeof code === 'string' ? code.trim() : '';
  if (!raw) return null;

  const entry = store.get(raw);
  store.delete(raw);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) return null;
  return entry;
}

