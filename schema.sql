-- ========================================================
-- SYS STREAMER - CLOUDFLARE D1 DATABASE SCHEMA
-- ========================================================

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    available_balance REAL DEFAULT 0,
    total_locked REAL DEFAULT 0,
    referral_code TEXT,
    referred_by TEXT,
    created_at INTEGER
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id TEXT PRIMARY KEY,
    invoice_id TEXT,
    user_id TEXT,
    amount REAL,
    status TEXT DEFAULT 'waiting',
    credited INTEGER DEFAULT 0,
    created_at INTEGER
);

CREATE TABLE IF NOT EXISTS locks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount REAL CHECK(amount >= 4),
    duration_days INTEGER CHECK(duration_days IN (30, 60, 90)),
    multiplier REAL,
    start_date INTEGER,
    end_date INTEGER,
    status TEXT DEFAULT 'locked',
    daily_claims INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS leaderboard (
    user_id TEXT PRIMARY KEY,
    points INTEGER DEFAULT 0,
    username TEXT
);

CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    streamer_id TEXT,
    tiktok_live_id TEXT,
    title TEXT,
    participants TEXT
);

CREATE TABLE IF NOT EXISTS referral (
    id TEXT PRIMARY KEY,
    referrer_id TEXT,
    referred_id TEXT,
    bonus REAL,
    created_at INTEGER
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_users_ref ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_locks_user ON locks(user_id);
CREATE INDEX IF NOT EXISTS idx_rooms_tiktok ON rooms(tiktok_live_id);
