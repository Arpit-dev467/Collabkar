import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import bcrypt from 'bcryptjs';
import { login, signup } from '../src/auth.js';
import { sanitizeRedirect } from '../src/oauth/stateStore.js';
import { db } from '../src/db/db.js';
import { users as usersTable } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

const envKeys = [
  'NODE_ENV',
  'AUTH_JWT_SECRET',
  'AUTH_ALLOW_DEV_ADMIN_LOGIN',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
];
const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.AUTH_JWT_SECRET = 'test-auth-secret-with-more-than-32-characters';
});

after(async () => {
  for (const key of envKeys) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

async function clearUsers() {
  await db.delete(usersTable);
}

async function insertUser(user) {
  await db.insert(usersTable).values({
    ...user,
    createdAt: new Date(),
  });
}

test('auth security regressions', async (t) => {
  await t.test('does not reveal an unverified account before checking its password', async () => {
    await clearUsers();
    const password = 'correct-horse-battery-staple';
    const passwordHash = await bcrypt.hash(password, 10);
    await insertUser({
      id: 'unverified-user',
      email: 'unverified@example.com',
      role: 'creator',
      passwordHash,
      isEmailVerified: false,
    });

    const wrongPassword = await login({ identifier: 'unverified@example.com', password: 'wrong-password' });
    assert.equal(wrongPassword.status, 401);
    assert.equal(wrongPassword.requiresEmailVerification, undefined);

    const correctPassword = await login({ identifier: 'unverified@example.com', password });
    assert.equal(correctPassword.status, 403);
    assert.equal(correctPassword.requiresEmailVerification, true);
  });

  await t.test('rejects password login for OAuth-only accounts without throwing', async () => {
    await clearUsers();
    await insertUser({
      id: 'oauth-user',
      email: 'oauth@example.com',
      role: 'brand',
      passwordHash: '',
      isEmailVerified: true,
    });

    const result = await login({ identifier: 'oauth@example.com', password: 'any-long-password' });
    assert.equal(result.status, 401);
    assert.equal(result.error, 'Invalid credentials.');
  });

  await t.test('rejects weak signup passwords', async () => {
    await clearUsers();
    const result = await signup({
      email: 'new@example.com',
      password: 'short123',
      role: 'creator',
      profile: { displayName: 'New Creator', creatorCategory: 'beauty' },
    });

    assert.equal(result.status, 400);
    assert.match(result.error, /12 characters/);
    const existing = await db.select().from(usersTable);
    assert.equal(existing.length, 0);
  });

  await t.test('rejects overlong login passwords instead of accepting bcrypt prefixes', async () => {
    await clearUsers();
    const first72Bytes = 'a'.repeat(72);
    await insertUser({
      id: 'long-password-user',
      email: 'long-password@example.com',
      role: 'creator',
      passwordHash: await bcrypt.hash(first72Bytes, 10),
      isEmailVerified: true,
    });

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
    process.env.NODE_ENV = 'test';
  });

  await t.test('requires an explicit strong JWT secret in production', async () => {
    await clearUsers();
    await insertUser({
      id: 'verified-user',
      email: 'verified@example.com',
      role: 'creator',
      passwordHash: await bcrypt.hash('correct-horse-battery-staple', 10),
      isEmailVerified: true,
    });
    const secret = process.env.AUTH_JWT_SECRET;
    delete process.env.AUTH_JWT_SECRET;
    process.env.NODE_ENV = 'production';

    await assert.rejects(
      login({ identifier: 'verified@example.com', password: 'correct-horse-battery-staple' }),
      /AUTH_JWT_SECRET must contain at least 32 characters/
    );
    process.env.NODE_ENV = 'test';
    process.env.AUTH_JWT_SECRET = secret;
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
      await clearUsers();
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
});
