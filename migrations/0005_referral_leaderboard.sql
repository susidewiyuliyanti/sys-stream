-- Production referral attribution and realtime leaderboard source.
ALTER TABLE users ADD COLUMN referral_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS referrals (
  id TEXT PRIMARY KEY,
  referrer_user_id TEXT NOT NULL,
  referred_user_id TEXT NOT NULL UNIQUE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_created ON referrals(created_at);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
