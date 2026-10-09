import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  real,
} from 'drizzle-orm/pg-core';

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

export const waitlist = pgTable('waitlist', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  brandName: text('brand_name').notNull(),
  creatorName: text('creator_name').notNull(),
  source: text('source').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const influencers = pgTable('influencers', {
  username: text('username').primaryKey(),
  followers: real('followers').notNull(),
  avgLikes: real('avg_likes').notNull(),
  avgComments: real('avg_comments').notNull(),
  engagementRate: real('engagement_rate').notNull(),
  postFrequency: real('post_frequency').notNull(),
  niche: text('niche').notNull(),
  location: text('location').notNull().default(''),
  riskLevel: text('risk_level').notNull(),
  verificationCode: text('verification_code').notNull().default(''),
  isVerified: boolean('is_verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const campaigns = pgTable('campaigns', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  ownerEmail: text('owner_email').notNull().default(''),
  ownerName: text('owner_name').notNull().default(''),
  title: text('title').notNull(),
  description: text('description').notNull(),
  targetNiche: text('target_niche').notNull().default(''),
  targetLocation: text('target_location').notNull().default(''),
  budgetMin: real('budget_min').notNull().default(0),
  budgetMax: real('budget_max').notNull().default(0),
  deliverables: jsonb('deliverables').notNull().default([]),
  status: text('status').notNull().default('draft'),
  applicationsCount: real('applications_count').notNull().default(0),
  shortlistedCount: real('shortlisted_count').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
