-- Remove legacy user balance columns.
-- Canonical financial fields:
--   users.available_balance = spendable/available balance
--   users.total_locked      = Blind Box locked balance
--
-- Data was synchronized before this migration: legacy balance mirrors
-- were copied from the canonical fields, then the legacy columns are removed.

ALTER TABLE users DROP COLUMN balance;
ALTER TABLE users DROP COLUMN locked_saldo;
