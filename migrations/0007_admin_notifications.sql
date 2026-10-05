-- Central admin notification center for production operational events.
CREATE TABLE IF NOT EXISTS admin_notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  entity_type TEXT,
  entity_id TEXT,
  admin_user_id TEXT,
  is_read INTEGER NOT NULL DEFAULT 0,
  read_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_created
  ON admin_notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_unread
  ON admin_notifications(is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_admin
  ON admin_notifications(admin_user_id, is_read, created_at DESC);
