-- Production inbound customer email inbox backed by Cloudflare D1.
CREATE TABLE IF NOT EXISTS email_inbox_messages (
  id TEXT PRIMARY KEY,
  resend_email_id TEXT UNIQUE,
  message_id TEXT,
  thread_id TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'inbound',
  mailbox TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  text_body TEXT,
  html_body TEXT,
  headers_json TEXT,
  attachments_json TEXT,
  status TEXT NOT NULL DEFAULT 'unread',
  in_reply_to TEXT,
  references_header TEXT,
  resend_message_id TEXT,
  admin_user_id TEXT,
  received_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_email_inbox_mailbox ON email_inbox_messages(mailbox);
CREATE INDEX IF NOT EXISTS idx_email_inbox_thread ON email_inbox_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_email_inbox_status ON email_inbox_messages(status);
CREATE INDEX IF NOT EXISTS idx_email_inbox_received ON email_inbox_messages(received_at);
CREATE INDEX IF NOT EXISTS idx_email_inbox_message_id ON email_inbox_messages(message_id);
