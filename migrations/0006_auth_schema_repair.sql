-- Production auth schema repair for databases created from the legacy schema.
-- Safe to run once after the existing auth/terms/email/referral migrations.
ALTER TABLE users ADD COLUMN email TEXT;
ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE users ADD COLUMN display_name TEXT;
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'USER';
ALTER TABLE users ADD COLUMN terms_version TEXT;
ALTER TABLE users ADD COLUMN terms_accepted_at INTEGER;
ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN email_verified_at INTEGER;
ALTER TABLE users ADD COLUMN referral_count INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE TABLE IF NOT EXISTS terms_acceptances (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,terms_version TEXT NOT NULL,accepted_at INTEGER NOT NULL,created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_terms_acceptances_user ON terms_acceptances(user_id);
CREATE TABLE IF NOT EXISTS email_verification_tokens (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,token_hash TEXT NOT NULL UNIQUE,expires_at INTEGER NOT NULL,used_at INTEGER,created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_email_verification_user ON email_verification_tokens(user_id);
CREATE TABLE IF NOT EXISTS referrals (id TEXT PRIMARY KEY,referrer_user_id TEXT NOT NULL,referred_user_id TEXT NOT NULL UNIQUE,referral_code TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'ACTIVE',created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE TABLE IF NOT EXISTS auth_sessions (token TEXT PRIMARY KEY,user_id TEXT NOT NULL,expires_at INTEGER NOT NULL,created_at INTEGER NOT NULL DEFAULT (unixepoch()));
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);
