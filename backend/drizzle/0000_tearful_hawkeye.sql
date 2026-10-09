CREATE TABLE "campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"owner_email" text DEFAULT '' NOT NULL,
	"owner_name" text DEFAULT '' NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"target_niche" text DEFAULT '' NOT NULL,
	"target_location" text DEFAULT '' NOT NULL,
	"budget_min" real DEFAULT 0 NOT NULL,
	"budget_max" real DEFAULT 0 NOT NULL,
	"deliverables" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"applications_count" real DEFAULT 0 NOT NULL,
	"shortlisted_count" real DEFAULT 0 NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "influencers" (
	"username" text PRIMARY KEY NOT NULL,
	"followers" real NOT NULL,
	"avg_likes" real NOT NULL,
	"avg_comments" real NOT NULL,
	"engagement_rate" real NOT NULL,
	"post_frequency" real NOT NULL,
	"niche" text NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"risk_level" text NOT NULL,
	"verification_code" text DEFAULT '' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"password_hash" text DEFAULT '',
	"is_email_verified" boolean DEFAULT false,
	"oauth" jsonb DEFAULT '{}'::jsonb,
	"email_verification_token_hash" text DEFAULT '',
	"email_verification_expires_at" timestamp,
	"profile" jsonb DEFAULT '{}'::jsonb,
	"onboarding" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
