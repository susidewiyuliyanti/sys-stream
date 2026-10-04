CREATE TABLE IF NOT EXISTS social_oauth_states (
  state TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  created_by TEXT,
  redirect_uri TEXT,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_social_oauth_states_expiry
ON social_oauth_states(expires_at);

CREATE INDEX IF NOT EXISTS idx_social_oauth_states_platform
ON social_oauth_states(platform);
