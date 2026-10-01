-- Record the Terms version accepted at account creation.
ALTER TABLE users ADD COLUMN terms_version TEXT;
ALTER TABLE users ADD COLUMN terms_accepted_at INTEGER;

CREATE TABLE IF NOT EXISTS terms_acceptances (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  terms_version TEXT NOT NULL,
  accepted_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_terms_acceptances_user
  ON terms_acceptances(user_id);

CREATE INDEX IF NOT EXISTS idx_terms_acceptances_version
  ON terms_acceptances(terms_version);
