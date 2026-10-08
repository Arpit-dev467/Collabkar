import { db } from './db.js';
import { users } from './schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getJwtSecret() {
  const secret = process.env.AUTH_JWT_SECRET;
  if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32)) {
    throw new Error('AUTH_JWT_SECRET must contain at least 32 characters in production.');
  }
  return secret || 'dev-secret-change-me';
}

function getJwtExpiresIn() {
  return process.env.AUTH_JWT_EXPIRES_IN || '7d';
}

function getPasswordPepper() {
  return process.env.AUTH_PASSWORD_PEPPER || '';
}

function issueToken({ sub, role, email }) {
  return jwt.sign({ role, email }, getJwtSecret(), {
    subject: sub,
    expiresIn: getJwtExpiresIn(),
  });
}

export async function findUserByEmail(email) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user;
}

export async function createUser({ email, password, role, profile, onboarding }) {
  if (!EMAIL_REGEX.test(email)) {
    throw new Error('Invalid email address.');
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists.');
  }

  const pepperedPassword = `${password}${getPasswordPepper()}`;
  const passwordHash = await bcrypt.hash(pepperedPassword, 10);

  const [newUser] = await db.insert(users).values({
    id: crypto.randomUUID(),
    email,
    role,
    passwordHash,
    isEmailVerified: false,
    profile,
    onboarding,
    createdAt: new Date(),
  }).returning();

  return newUser;
}

export async function verifyUserPassword(user, password) {
  const pepperedPassword = `${password}${getPasswordPepper()}`;
  return bcrypt.compare(pepperedPassword, user.passwordHash);
}

export async function updateUserProfile(userId, profile) {
  const [updatedUser] = await db.update(users)
    .set({ profile })
    .where(eq(users.id, userId))
    .returning();
  return updatedUser;
}
