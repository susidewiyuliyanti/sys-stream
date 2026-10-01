-- Admin accounts and auditable promotional jackpot grants.
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ADMIN',
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

ALTER TABLE admin_sessions ADD COLUMN admin_user_id TEXT;

CREATE INDEX IF NOT EXISTS idx_admin_users_active
  ON admin_users(active);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_user
  ON admin_sessions(admin_user_id);

CREATE TABLE IF NOT EXISTS jackpot_grants (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDT',
  note TEXT,
  admin_user_id TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jackpot_grants_user
  ON jackpot_grants(user_id);

CREATE INDEX IF NOT EXISTS idx_jackpot_grants_created
  ON jackpot_grants(created_at);
