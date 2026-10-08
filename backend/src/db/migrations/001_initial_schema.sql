-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  password_hash TEXT DEFAULT '',
  is_email_verified BOOLEAN DEFAULT FALSE,
  oauth JSONB DEFAULT '{}'::jsonb,
  email_verification_token_hash TEXT DEFAULT '',
  email_verification_expires_at TIMESTAMP,
  profile JSONB DEFAULT '{}'::jsonb,
  onboarding JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
