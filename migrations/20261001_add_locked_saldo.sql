-- Canonical balance architecture for Blind Box:
-- users.available_balance = available balance + Game Balance
-- users.locked_saldo = principal currently locked in Blind Box
--
-- D1/SQLite does not support ADD COLUMN IF NOT EXISTS.
-- This migration is applied once by Wrangler's migration tracker.

ALTER TABLE users
  ADD COLUMN locked_saldo INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_locked_saldo
  ON users (locked_saldo);
