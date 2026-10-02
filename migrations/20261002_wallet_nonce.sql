CREATE TABLE IF NOT EXISTS wallet_nonces(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 wallet TEXT NOT NULL,
 nonce TEXT NOT NULL,
 created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_wallet_nonce_wallet
ON wallet_nonces(wallet);
