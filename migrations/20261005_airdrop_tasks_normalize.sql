-- Normalize legacy airdrop_tasks schema created by 0002_airdrop.sql.
-- Preserve existing rows and migrate reward -> reward_points.

ALTER TABLE airdrop_tasks ADD COLUMN reward_points INTEGER NOT NULL DEFAULT 0;
ALTER TABLE airdrop_tasks ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;

UPDATE airdrop_tasks
SET reward_points = COALESCE(reward, 0)
WHERE reward_points = 0;

CREATE INDEX IF NOT EXISTS idx_airdrop_tasks_active
ON airdrop_tasks(active);

CREATE INDEX IF NOT EXISTS idx_airdrop_tasks_category
ON airdrop_tasks(category);
