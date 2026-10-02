-- Canonical balance architecture for Blind Box:
-- users.available_balance = available balance + Game Balance
--
-- D1/SQLite does not support ADD COLUMN IF NOT EXISTS.
-- This migration is applied once by Wrangler's migration tracker.

ALTER TABLE users

