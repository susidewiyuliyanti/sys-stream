CREATE TABLE IF NOT EXISTS airdrop_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'social',
  reward_points INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_airdrop_tasks_active
ON airdrop_tasks(active);

CREATE INDEX IF NOT EXISTS idx_airdrop_tasks_category
ON airdrop_tasks(category);
