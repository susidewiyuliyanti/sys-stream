ALTER TABLE blind_box_claims ADD COLUMN paid_at TEXT;
CREATE INDEX IF NOT EXISTS idx_blind_box_claims_paid_at ON blind_box_claims(paid_at);
