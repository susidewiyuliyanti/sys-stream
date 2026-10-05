import { Env } from "./db";

export type AdminNotificationInput = {
  type: string;
  title: string;
  message: string;
  severity?: "info" | "success" | "warning" | "danger";
  entityType?: string | null;
  entityId?: string | number | null;
  adminUserId?: string | null;
};

async function ensureTable(env: Env) {
  await env.DB.prepare(`
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
    )
  `).run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON admin_notifications(created_at DESC)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_admin_notifications_unread ON admin_notifications(is_read, created_at DESC)").run();
}

export async function notifyAdmins(env: Env, input: AdminNotificationInput) {
  try {
    await ensureTable(env);
    const now = Math.floor(Date.now() / 1000);
    await env.DB.prepare(`
      INSERT INTO admin_notifications
        (id,type,title,message,severity,entity_type,entity_id,admin_user_id,is_read,created_at)
      VALUES (?,?,?,?,?,?,?,?,0,?)
    `).bind(
      crypto.randomUUID(),
      String(input.type).slice(0,80),
      String(input.title).slice(0,200),
      String(input.message).slice(0,1000),
      input.severity || "info",
      input.entityType ? String(input.entityType).slice(0,80) : null,
      input.entityId == null ? null : String(input.entityId).slice(0,160),
      input.adminUserId ? String(input.adminUserId).slice(0,160) : null,
      now
    ).run();
  } catch (error) {
    // Notification failures must never break the underlying production action.
    console.error("admin notification error", error);
  }
}
