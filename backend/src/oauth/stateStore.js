import crypto from 'node:crypto';

const STATE_TTL_MS = 10 * 60_000;
const store = new Map();

function base64Url(buffer) {
  return Buffer.from(buffer).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function createPkceVerifier() {
  return base64Url(crypto.randomBytes(32));
}

export function pkceChallenge(verifier) {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64Url(hash);
}

export function createState({ provider, redirectTo }) {
  const state = base64Url(crypto.randomBytes(18));
  const codeVerifier = createPkceVerifier();
  store.set(state, {
    provider,
    redirectTo,
    codeVerifier,
    expiresAt: Date.now() + STATE_TTL_MS,
  });
  return { state, codeVerifier };
}

export function consumeState(state) {
  if (!state) return null;
  const entry = store.get(state);
  store.delete(state);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) return null;
  return entry;
}

export function sanitizeRedirect(value) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return '/dashboard';

  try {
    const baseUrl = 'https://collabkar.invalid';
    const target = new URL(raw, baseUrl);
    if (target.origin !== baseUrl) return '/dashboard';
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return '/dashboard';
  }
}

