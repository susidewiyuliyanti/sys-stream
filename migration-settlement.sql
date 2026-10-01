CREATE TABLE IF NOT EXISTS lock_settlements (
    settlement_id TEXT PRIMARY KEY,
    lock_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE(lock_id)
);

CREATE INDEX IF NOT EXISTS idx_lock_settlements_user_id
ON lock_settlements(user_id);
