import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import bcrypt from 'bcryptjs';
import { login, signup } from '../src/auth.js';
import { oauthStart } from '../src/oauth/handlers.js';
import { sanitizeRedirect } from '../src/oauth/stateStore.js';

const envKeys = [
  'NODE_ENV',
  'AUTH_USERS_FILE_PATH',
  'AUTH_JWT_SECRET',
  'AUTH_ALLOW_DEV_ADMIN_LOGIN',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
];
const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
let tempDir;
let usersFile;

before(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), 'collabkar-auth-'));
  usersFile = path.join(tempDir, 'users.json');
  process.env.NODE_ENV = 'test';
  process.env.AUTH_USERS_FILE_PATH = usersFile;
  process.env.AUTH_JWT_SECRET = 'test-auth-secret-with-more-than-32-characters';
  await writeFile(usersFile, '[]', 'utf8');
});

after(async () => {
  for (const key of envKeys) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
  await rm(tempDir, { recursive: true, force: true });
});

async function writeUsers(users) {
  await writeFile(usersFile, JSON.stringify(users), 'utf8');
}

test('auth security regressions', async (t) => {
  await t.test('does not reveal an unverified account before checking its password', async () => {
    const password = 'correct-horse-battery-staple';
    const passwordHash = await bcrypt.hash(password, 10);
    await writeUsers([{
      id: 'unverified-user',
      email: 'creator@example.com',
      role: 'creator',
      passwordHash,
      isEmailVerified: false,
    }]);

    const wrongPassword = await login({ identifier: 'creator@example.com', password: 'wrong-password' });
    assert.equal(wrongPassword.status, 401);
    assert.equal(wrongPassword.requiresEmailVerification, undefined);

    const correctPassword = await login({ identifier: 'creator@example.com', password });
    assert.equal(correctPassword.status, 403);
    assert.equal(correctPassword.requiresEmailVerification, true);
  });

  await t.test('rejects password login for OAuth-only accounts without throwing', async () => {
    await writeUsers([{
      id: 'oauth-user',
      email: 'oauth@example.com',
      role: 'brand',
      passwordHash: '',
      isEmailVerified: true,
    }]);

    const result = await login({ identifier: 'oauth@example.com', password: 'any-long-password' });
    assert.equal(result.status, 401);
    assert.equal(result.error, 'Invalid credentials.');
  });

  await t.test('rejects weak signup passwords', async () => {
    await writeUsers([]);
    const result = await signup({
      email: 'new@example.com',
      password: 'short123',
      role: 'creator',
      profile: { displayName: 'New Creator', creatorCategory: 'beauty' },
    });

    assert.equal(result.status, 400);
    assert.match(result.error, /12 characters/);
    assert.deepEqual(JSON.parse(await readFile(usersFile, 'utf8')), []);
  });

  await t.test('rejects overlong login passwords instead of accepting bcrypt prefixes', async () => {
    const first72Bytes = 'a'.repeat(72);
    await writeUsers([{
      id: 'long-password-user',
      email: 'long-password@example.com',
      role: 'creator',
      passwordHash: await bcrypt.hash(first72Bytes, 10),
      isEmailVerified: true,
    }]);

    const result = await login({
      identifier: 'long-password@example.com',
      password: `${first72Bytes}different-suffix`,
    });
    assert.equal(result.status, 401);
  });

  await t.test('does not use the development admin shortcut in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.AUTH_ALLOW_DEV_ADMIN_LOGIN = 'true';

    const result = await login({ identifier: 'admin', password: '1234' });
    assert.notEqual(result.ok, true);
    assert.notEqual(result.user?.role, 'admin');
  });

  await t.test('requires an explicit strong JWT secret in production', async () => {
    await writeUsers([{
      id: 'verified-user',
      email: 'verified@example.com',
      role: 'creator',
      passwordHash: await bcrypt.hash('correct-horse-battery-staple', 10),
      isEmailVerified: true,
    }]);
    delete process.env.AUTH_JWT_SECRET;

    await assert.rejects(
      login({ identifier: 'verified@example.com', password: 'correct-horse-battery-staple' }),
      /AUTH_JWT_SECRET must contain at least 32 characters/
    );
  });

  await t.test('reports verification email delivery failure without logging the token', async () => {
    process.env.AUTH_JWT_SECRET = 'test-auth-secret-with-more-than-32-characters';
    process.env.RESEND_API_KEY = 'test-key';
    process.env.RESEND_FROM_EMAIL = 'Collabkar <test@example.com>';
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({ ok: false, status: 503 });
    const originalConsoleError = console.error;
    const originalConsoleLog = console.log;
    const output = [];
    console.error = (...args) => output.push(args.join(' '));
    console.log = (...args) => output.push(args.join(' '));

    try {
      await writeUsers([]);
      const result = await signup({
        email: 'delivery@example.com',
        password: 'correct-horse-battery-staple',
        role: 'creator',
        profile: { displayName: 'New Creator', creatorCategory: 'beauty' },
      });

      assert.equal(result.ok, true);
      assert.equal(result.verificationEmailSent, false);
      assert.equal(output.some((line) => line.includes('verify-email?token=')), false);
    } finally {
      console.error = originalConsoleError;
      console.log = originalConsoleLog;
      globalThis.fetch = originalFetch;
      delete process.env.RESEND_API_KEY;
      delete process.env.RESEND_FROM_EMAIL;
      process.env.NODE_ENV = 'test';
    }
  });

  await t.test('restricts OAuth return URLs to same-origin paths', () => {
    assert.equal(sanitizeRedirect('/dashboard?tab=campaigns'), '/dashboard?tab=campaigns');
    assert.equal(sanitizeRedirect('//attacker.example'), '/dashboard');
    assert.equal(sanitizeRedirect('/\\attacker.example'), '/dashboard');
    assert.equal(sanitizeRedirect('https://attacker.example'), '/dashboard');
  });

  await t.test('allows dev admin login in development mode', async () => {
    process.env.NODE_ENV = 'development';
    process.env.AUTH_ALLOW_DEV_ADMIN_LOGIN = 'true';
    try {
      const result = await login({ identifier: 'admin', password: '1234' });
      assert.equal(result.ok, true);
      assert.equal(result.user?.role, 'admin');
      assert.ok(result.token);
    } finally {
      process.env.NODE_ENV = 'test';
    }
  });

  await t.test('auto-verifies signup in development mode with token', async () => {
    process.env.NODE_ENV = 'development';
    process.env.AUTH_AUTO_VERIFY_DEV = 'true';
    try {
      await writeUsers([]);
      const result = await signup({
        email: 'dev@example.com',
        password: 'correct-horse-battery-staple',
        role: 'creator',
        profile: { displayName: 'Dev Creator', creatorCategory: 'tech' },
      });

      assert.equal(result.ok, true);
      assert.equal(result.requiresEmailVerification, false);
      assert.ok(result.token);
      assert.equal(result.user?.isEmailVerified, true);
    } finally {
      process.env.NODE_ENV = 'test';
      delete process.env.AUTH_AUTO_VERIFY_DEV;
    }
  });

  await t.test('handles dev mock OAuth redirects for google, facebook, and apple', async () => {
    process.env.NODE_ENV = 'development';
    process.env.OAUTH_DEV_MOCK_ENABLED = 'true';
    process.env.APP_BASE_URL = 'http://localhost:3000';

    try {
      for (const provider of ['google', 'facebook', 'apple']) {
        let redirectUrl = '';
        const req = {
          params: { provider },
          query: { redirect: '/dashboard', role: 'brand' },
        };
        const res = {
          redirect(url) {
            redirectUrl = url;
          },
          status() {
            return this;
          },
          json() {
            return this;
          },
        };

        await oauthStart(req, res);
        assert.ok(redirectUrl.startsWith('http://localhost:3000/auth/callback?code='));
        assert.ok(redirectUrl.includes('&redirect=%2Fdashboard'));
      }
    } finally {
      process.env.NODE_ENV = 'test';
      delete process.env.OAUTH_DEV_MOCK_ENABLED;
    }
  });
});