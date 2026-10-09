CREATE TABLE influencers (
  username TEXT PRIMARY KEY,
  followers REAL NOT NULL,
  avg_likes REAL NOT NULL,
  avg_comments REAL NOT NULL,
  engagement_rate REAL NOT NULL,
  post_frequency REAL NOT NULL,
  niche TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  risk_level TEXT NOT NULL,
  verification_code TEXT NOT NULL DEFAULT '',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  owner_email TEXT NOT NULL DEFAULT '',
  owner_name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_niche TEXT NOT NULL DEFAULT '',
  target_location TEXT NOT NULL DEFAULT '',
  budget_min REAL NOT NULL DEFAULT 0,
  budget_max REAL NOT NULL DEFAULT 0,
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  applications_count REAL NOT NULL DEFAULT 0,
  shortlisted_count REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_campaigns_owner_id ON campaigns(owner_id);
CREATE INDEX idx_campaigns_status_updated_at ON campaigns(status, updated_at);
