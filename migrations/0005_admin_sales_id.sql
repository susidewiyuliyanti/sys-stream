-- Admin Sales ID authentication.
-- Sales ID is the unique login identity; email is a shared contact/inbox field.

PRAGMA foreign_keys=OFF;

ALTER TABLE admin_users RENAME TO admin_users_legacy;

CREATE TABLE admin_users (
  id TEXT PRIMARY KEY,
  sales_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ADMIN',
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_admin_users_active ON admin_users(active);
CREATE INDEX idx_admin_users_email ON admin_users(email);

INSERT INTO admin_users(id,sales_id,email,display_name,password_hash,role,active,created_at,updated_at)
SELECT id,
       'legacy_' || lower(substr(replace(id,'-',''),1,12)),
       email,display_name,password_hash,role,active,created_at,updated_at
FROM admin_users_legacy;

DROP TABLE admin_users_legacy;

PRAGMA foreign_keys=ON;
