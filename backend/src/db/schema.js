import { pgTable, serial, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  role: text('role').notNull(),
  passwordHash: text('password_hash').default(''),
  isEmailVerified: boolean('is_email_verified').default(false),
  oauth: jsonb('oauth').default({}),
  emailVerificationTokenHash: text('email_verification_token_hash').default(''),
  emailVerificationExpiresAt: timestamp('email_verification_expires_at'),
  profile: jsonb('profile').default({}),
  onboarding: jsonb('onboarding').default({}),
  createdAt: timestamp('created_at').defaultNow(),
});
