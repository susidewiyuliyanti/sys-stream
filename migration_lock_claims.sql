CREATE TABLE IF NOT EXISTS lock_claims (
    claim_id TEXT PRIMARY KEY,
    lock_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    claim_day TEXT NOT NULL,
    amount REAL NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE(lock_id, claim_day)
);

CREATE INDEX IF NOT EXISTS idx_lock_claims_lock_id
ON lock_claims(lock_id);

CREATE INDEX IF NOT EXISTS idx_lock_claims_user_id
ON lock_claims(user_id);
