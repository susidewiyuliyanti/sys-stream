ALTER TABLE users 
ADD COLUMN wallet_address TEXT;

CREATE INDEX IF NOT EXISTS idx_users_wallet 
ON users(wallet_address);
