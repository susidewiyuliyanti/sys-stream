-- Admin-managed verified sender identities for Resend.
CREATE TABLE IF NOT EXISTS email_senders (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'general',
  active INTEGER NOT NULL DEFAULT 1,
  created_by TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_senders_active ON email_senders(active);
CREATE INDEX IF NOT EXISTS idx_email_senders_purpose ON email_senders(purpose);
