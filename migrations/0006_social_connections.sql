CREATE TABLE IF NOT EXISTS social_connections (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  account_id TEXT,
  account_name TEXT,
  status TEXT NOT NULL DEFAULT 'DISCONNECTED',
  scopes TEXT,
  connected_at INTEGER,
  updated_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_social_connections_platform_account
ON social_connections(platform, account_id);

CREATE INDEX IF NOT EXISTS idx_social_connections_platform
ON social_connections(platform);
