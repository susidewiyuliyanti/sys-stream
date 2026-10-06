CREATE TABLE IF NOT EXISTS social_oauth_tokens (
  platform TEXT PRIMARY KEY,
  access_token_enc TEXT NOT NULL,
  refresh_token_enc TEXT,
  token_type TEXT,
  scope TEXT,
  expires_at INTEGER,
  connected_by TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_social_oauth_tokens_expires
ON social_oauth_tokens(expires_at);
