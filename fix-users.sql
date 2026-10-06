CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT,
    password_hash TEXT,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'USER',
    wallet_address TEXT,
    available_balance REAL NOT NULL DEFAULT 0,
    locked_saldo REAL NOT NULL DEFAULT 0,
    referral_count INTEGER NOT NULL DEFAULT 0,
    email_verified INTEGER NOT NULL DEFAULT 1,
    email_verified_at INTEGER,
    terms_version TEXT,
    terms_accepted_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
ON users(email)
WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_wallet
ON users(wallet_address);

CREATE INDEX IF NOT EXISTS idx_users_locked_saldo
ON users(locked_saldo);
