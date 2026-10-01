ALTER TABLE payments ADD COLUMN nowpayments_status TEXT;
ALTER TABLE payments ADD COLUMN pay_currency TEXT;
ALTER TABLE payments ADD COLUMN pay_amount REAL;
ALTER TABLE payments ADD COLUMN pay_address TEXT;
ALTER TABLE payments ADD COLUMN order_id TEXT;
ALTER TABLE payments ADD COLUMN approved_at INTEGER;
ALTER TABLE payments ADD COLUMN approved_by TEXT;
ALTER TABLE payments ADD COLUMN rejected_at INTEGER;
ALTER TABLE payments ADD COLUMN rejected_by TEXT;
ALTER TABLE payments ADD COLUMN rejection_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_payments_user_id
ON payments(user_id);

CREATE INDEX IF NOT EXISTS idx_payments_status
ON payments(status);

CREATE INDEX IF NOT EXISTS idx_payments_order_id
ON payments(order_id);

CREATE TABLE IF NOT EXISTS withdrawals (
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

CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id
ON withdrawals(user_id);

CREATE INDEX IF NOT EXISTS idx_withdrawals_status
ON withdrawals(status);
