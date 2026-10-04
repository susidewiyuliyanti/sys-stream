PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT,
    available_balance REAL DEFAULT 0,
    total_locked REAL DEFAULT 0,
    referral_code TEXT,
    referred_by TEXT,
    created_at INTEGER
, locked_saldo INTEGER NOT NULL DEFAULT 0, email TEXT, password_hash TEXT, display_name TEXT, role TEXT NOT NULL DEFAULT 'USER', terms_version TEXT, terms_accepted_at INTEGER, email_verified INTEGER NOT NULL DEFAULT 1, email_verified_at INTEGER, referral_count INTEGER NOT NULL DEFAULT 0, wallet_address TEXT, avatar_url TEXT, registration_bonus_idr REAL NOT NULL DEFAULT 0, registration_bonus_granted INTEGER NOT NULL DEFAULT 0, has_referral_bonus INTEGER NOT NULL DEFAULT 0, cuid TEXT DEFAULT '', uid TEXT, password TEXT, photo_url TEXT DEFAULT '', streamer_handle TEXT, bio TEXT, balance REAL NOT NULL DEFAULT 0, saldo REAL NOT NULL DEFAULT 0, wallet_balance REAL NOT NULL DEFAULT 0, affiliate_earnings REAL NOT NULL DEFAULT 0, affiliate_withdrawn REAL NOT NULL DEFAULT 0, is_subscribed INTEGER NOT NULL DEFAULT 0, subscription_plan TEXT NOT NULL DEFAULT 'free', subscription_expires_at INTEGER, is_lifetime INTEGER NOT NULL DEFAULT 0, subscribed_at INTEGER, is_blacklisted INTEGER NOT NULL DEFAULT 0, is_banned INTEGER NOT NULL DEFAULT 0, banned_reason TEXT, force_jackpot_next INTEGER NOT NULL DEFAULT 0, target_jackpot_nominal REAL, last_saldo_modified_by TEXT, last_saldo_modification_reason TEXT, updated_at INTEGER, sys_balance REAL NOT NULL DEFAULT 0);
CREATE TABLE payments (
    payment_id TEXT PRIMARY KEY,
    invoice_id TEXT,
    user_id TEXT,
    amount REAL,
    status TEXT DEFAULT 'waiting',
    credited INTEGER DEFAULT 0,
    created_at INTEGER
, nowpayments_status TEXT, pay_currency TEXT, pay_amount REAL, pay_address TEXT, order_id TEXT, approved_at INTEGER, approved_by TEXT, rejected_at INTEGER, rejected_by TEXT, rejection_reason TEXT);
CREATE TABLE locks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount REAL CHECK(amount >= 4),
    duration_days INTEGER CHECK(duration_days IN (30, 60, 90)),
    multiplier REAL,
    start_date INTEGER,
    end_date INTEGER,
    status TEXT DEFAULT 'locked',
    daily_claims INTEGER DEFAULT 0
, last_claim_at INTEGER);
CREATE TABLE leaderboard (
    user_id TEXT PRIMARY KEY,
    points INTEGER DEFAULT 0,
    username TEXT
);
CREATE TABLE rooms (
    id TEXT PRIMARY KEY,
    streamer_id TEXT,
    tiktok_live_id TEXT,
    title TEXT,
    participants TEXT
);
CREATE TABLE referral (
    id TEXT PRIMARY KEY,
    referrer_id TEXT,
    referred_id TEXT,
    bonus REAL,
    created_at INTEGER
);
CREATE TABLE withdrawals (
    withdrawal_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL CHECK(amount > 0),
    pay_currency TEXT,
    payout_address TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    reserved_amount REAL NOT NULL,
    payout_id TEXT,
    created_at INTEGER NOT NULL,
    approved_at INTEGER,
    approved_by TEXT,
    rejected_at INTEGER,
    rejected_by TEXT,
    rejection_reason TEXT,
    completed_at INTEGER
);
CREATE TABLE lock_claims (
    claim_id TEXT PRIMARY KEY,
    lock_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    claim_day TEXT NOT NULL,
    amount REAL NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE(lock_id, claim_day)
);
CREATE TABLE lock_settlements (
    settlement_id TEXT PRIMARY KEY,
    lock_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE(lock_id)
);
CREATE TABLE IF NOT EXISTS "d1_migrations"(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE auth_sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE TABLE deposits (
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
CREATE TABLE blind_box_claims (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 deposit_id INTEGER NOT NULL,
 user_id TEXT NOT NULL,
 claim_date TEXT NOT NULL,
 amount REAL NOT NULL,
 is_jackpot INTEGER NOT NULL DEFAULT 0,
 claimed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(deposit_id,claim_date)
);
CREATE TABLE game_settings (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 minBox REAL NOT NULL DEFAULT 100,
 maxBox REAL NOT NULL DEFAULT 1000,
 jackpotAmount REAL NOT NULL DEFAULT 50000000,
 jackpotChance REAL NOT NULL DEFAULT 0
);
CREATE TABLE terms_acceptances (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  terms_version TEXT NOT NULL,
  accepted_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE email_verification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE TABLE admin_sessions (
  token TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  admin_user_id TEXT
);
CREATE TABLE admin_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ADMIN',
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE jackpot_grants (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDT',
  note TEXT,
  admin_user_id TEXT,
  created_at INTEGER NOT NULL
);
CREATE TABLE referrals (
  id TEXT PRIMARY KEY,
  referrer_user_id TEXT NOT NULL,
  referred_user_id TEXT NOT NULL UNIQUE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at INTEGER NOT NULL
);
CREATE TABLE airdrop_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    wallet TEXT UNIQUE NOT NULL,
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE airdrop_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    reward INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1
);
CREATE TABLE task_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    wallet TEXT NOT NULL,
    task_id INTEGER NOT NULL,
    proof_link TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
, reviewed_by TEXT, reviewed_at DATETIME, reward_given INTEGER DEFAULT 0);
CREATE TABLE daily_checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet TEXT NOT NULL,
    checkin_date TEXT NOT NULL,
    reward INTEGER DEFAULT 10
);
CREATE TABLE referral_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet TEXT NOT NULL,
    referred_wallet TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE airdrop_submissions (
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
CREATE TABLE airdrop_points_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_address TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE wallet_nonces (
        wallet TEXT PRIMARY KEY,
        nonce TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
CREATE TABLE user_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_id TEXT NOT NULL,
    event_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'JOINED',
    joined_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
CREATE TABLE email_verification_tokens_v2 (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL, used_at INTEGER, created_at INTEGER NOT NULL
  );
CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    post_type TEXT NOT NULL DEFAULT 'text',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
CREATE TABLE auth_handoffs (
      code TEXT PRIMARY KEY,
      session_token TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USDT',
    status TEXT NOT NULL DEFAULT 'PENDING',
    reference TEXT,
    description TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  , payment_id TEXT);
CREATE TABLE registration_bonus_claims (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      bonus_idr REAL NOT NULL,
      bonus_usdt REAL NOT NULL,
      claimed_at INTEGER NOT NULL
    );
CREATE TABLE live_rooms (
    id TEXT PRIMARY KEY,
    owner_user_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'LIVE',
    likes INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
CREATE TABLE live_room_members (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    joined_at INTEGER NOT NULL,
    last_seen_at INTEGER NOT NULL,
    UNIQUE(room_id, user_id)
  );
CREATE TABLE live_room_messages (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
CREATE TABLE web3_auth_challenges (
    id TEXT PRIMARY KEY,
    nonce TEXT NOT NULL UNIQUE,
    wallet_address TEXT NOT NULL,
    message TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    used_at INTEGER,
    created_at INTEGER NOT NULL
  );
CREATE TABLE mining_claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      lock_id INTEGER NOT NULL,
      claim_date TEXT NOT NULL,
      amount_locked REAL NOT NULL,
      reward_sys REAL NOT NULL,
      created_at INTEGER NOT NULL
    );
CREATE TABLE live_streams (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL UNIQUE,
    provider TEXT NOT NULL DEFAULT 'cloudflare_stream',
    input_uid TEXT NOT NULL,
    ingest_url TEXT NOT NULL DEFAULT '',
    stream_key TEXT NOT NULL DEFAULT '',
    playback_url TEXT NOT NULL DEFAULT '',
    playback_hls TEXT NOT NULL DEFAULT '',
    playback_webrtc TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'created',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
CREATE TABLE social_connections (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  account_id TEXT,
  account_name TEXT,
  status TEXT NOT NULL DEFAULT 'DISCONNECTED',
  scopes TEXT,
  connected_at INTEGER,
  updated_at INTEGER NOT NULL
);
DELETE FROM sqlite_sequence;
CREATE INDEX idx_users_ref ON users(referral_code);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_locks_user ON locks(user_id);
CREATE INDEX idx_rooms_tiktok ON rooms(tiktok_live_id);
CREATE INDEX idx_payments_user_id
ON payments(user_id);
CREATE INDEX idx_payments_status
ON payments(status);
CREATE INDEX idx_payments_order_id
ON payments(order_id);
CREATE INDEX idx_withdrawals_user_id
ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status
ON withdrawals(status);
CREATE INDEX idx_lock_claims_lock_id
ON lock_claims(lock_id);
CREATE INDEX idx_lock_claims_user_id
ON lock_claims(user_id);
CREATE INDEX idx_lock_settlements_user_id
ON lock_settlements(user_id);
CREATE INDEX idx_users_locked_saldo
  ON users (locked_saldo);
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_auth_sessions_user ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_expires ON auth_sessions(expires_at);
CREATE INDEX idx_deposits_user_id ON deposits(user_id);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_blind_box_claims_user_id ON blind_box_claims(user_id);
CREATE INDEX idx_blind_box_claims_deposit_id ON blind_box_claims(deposit_id);
CREATE INDEX idx_terms_acceptances_user
  ON terms_acceptances(user_id);
CREATE INDEX idx_terms_acceptances_version
  ON terms_acceptances(terms_version);
CREATE INDEX idx_email_verification_user
  ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_expiry
  ON email_verification_tokens(expires_at);
CREATE INDEX idx_admin_sessions_admin_user
  ON admin_sessions(admin_user_id);
CREATE INDEX idx_admin_users_active
  ON admin_users(active);
CREATE INDEX idx_jackpot_grants_user
  ON jackpot_grants(user_id);
CREATE INDEX idx_jackpot_grants_created
  ON jackpot_grants(created_at);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX idx_referrals_created ON referrals(created_at);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_users_email_lookup ON users(email);
CREATE INDEX idx_user_events_user ON user_events(user_id);
CREATE INDEX idx_email_verification_v2_user ON email_verification_tokens_v2(user_id);
CREATE UNIQUE INDEX idx_users_wallet_unique ON users(wallet_address);
CREATE INDEX idx_posts_created ON posts(created_at DESC, id DESC);
CREATE INDEX idx_posts_user ON posts(user_id, created_at DESC);
CREATE INDEX idx_transactions_user ON transactions(user_id, created_at);
CREATE INDEX idx_live_members_room_seen ON live_room_members(room_id,last_seen_at);
CREATE INDEX idx_live_messages_room_created ON live_room_messages(room_id,created_at);
CREATE INDEX idx_web3_challenges_wallet ON web3_auth_challenges(wallet_address);
CREATE UNIQUE INDEX idx_mining_claims_user_date
    ON mining_claims(user_id, claim_date)
  ;
CREATE INDEX idx_live_streams_room ON live_streams(room_id);
CREATE UNIQUE INDEX idx_social_connections_platform_account
ON social_connections(platform, account_id);
CREATE INDEX idx_social_connections_platform
ON social_connections(platform);
