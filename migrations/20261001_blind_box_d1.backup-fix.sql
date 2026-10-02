CREATE TABLE IF NOT EXISTS deposits (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 deposit_code TEXT NOT NULL UNIQUE,
 user_id TEXT NOT NULL,
 amount REAL NOT NULL CHECK(amount > 0),
 duration_days INTEGER NOT NULL CHECK(duration_days IN (30,60,90)),
 start_date TEXT NOT NULL,
 end_date TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'ACTIVE',
 total_claimed REAL NOT NULL DEFAULT 0,
 force_jackpot INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);

CREATE TABLE IF NOT EXISTS blind_box_claims (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 deposit_id INTEGER NOT NULL,
 user_id TEXT NOT NULL,
 claim_date TEXT NOT NULL,
 amount REAL NOT NULL,
 is_jackpot INTEGER NOT NULL DEFAULT 0,
 claimed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(deposit_id,claim_date)
);

CREATE INDEX IF NOT EXISTS idx_blind_box_claims_user_id ON blind_box_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_blind_box_claims_deposit_id ON blind_box_claims(deposit_id);

CREATE TABLE IF NOT EXISTS game_settings (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 minBox REAL NOT NULL DEFAULT 100,
 maxBox REAL NOT NULL DEFAULT 1000,
 jackpotAmount REAL NOT NULL DEFAULT 50000000,
 jackpotChance REAL NOT NULL DEFAULT 0
);
