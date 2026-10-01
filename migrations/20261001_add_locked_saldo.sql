-- Canonical balance architecture for Blind Box:
-- users.balance = available balance + Game Balance
-- users.locked_saldo = principal currently locked in Blind Box
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS locked_saldo INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_locked_saldo
  ON users (locked_saldo);
