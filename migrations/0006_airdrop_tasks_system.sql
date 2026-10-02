CREATE TABLE IF NOT EXISTS airdrop_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    reward_points INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS airdrop_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_address TEXT NOT NULL,
    email TEXT NOT NULL,
    task_id INTEGER NOT NULL,
    evidence_link TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    reward_points INTEGER DEFAULT 0,
    reviewed_by TEXT,
    reviewed_at TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS airdrop_points_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_address TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
