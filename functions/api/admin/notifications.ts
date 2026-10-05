import { Env, json } from "../../_lib/db";
import { requireAdmin } from "../../_lib/admin";

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

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return auth.response;
  await ensureTable(env);

  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 50), 1), 100);
  const unreadOnly = url.searchParams.get("unread") === "1";

  const rows = await env.DB.prepare(`
    SELECT id,type,title,message,severity,entity_type AS entityType,entity_id AS entityId,
           admin_user_id AS adminUserId,is_read AS isRead,read_at AS readAt,created_at AS createdAt
    FROM admin_notifications
    WHERE (admin_user_id IS NULL OR admin_user_id = ?)
      AND (? = 0 OR is_read = 0)
    ORDER BY created_at DESC
    LIMIT ?
  `).bind(auth.identity.id, unreadOnly ? 1 : 0, limit).all();

  const unread = await env.DB.prepare(`
    SELECT COUNT(*) AS count
    FROM admin_notifications
    WHERE (admin_user_id IS NULL OR admin_user_id = ?)
      AND is_read = 0
  `).bind(auth.identity.id).first<any>();

  const unreadEmails = await env.DB.prepare(`
    SELECT COUNT(*) AS count
    FROM email_inbox_messages
    WHERE direction = 'inbound' AND status = 'unread'
  `).first<any>().catch(() => ({count:0}));

  const emailCount = Number(unreadEmails?.count || 0);
  const notifications = [...(rows.results || [])];
  if (emailCount > 0) {
    notifications.unshift({
      id: "email-unread-summary",
      type: "email.inbound",
      title: "Customer Email Inbox",
      message: emailCount + " unread customer email" + (emailCount === 1 ? "" : "s") + " waiting for review.",
      severity: "warning",
      entityType: "email_inbox",
      entityId: null,
      adminUserId: null,
      isRead: 0,
      readAt: null,
      createdAt: Math.floor(Date.now() / 1000)
    });
  }

  return json({
    success: true,
    notifications: notifications.slice(0, limit),
    unreadCount: Number(unread?.count || 0) + emailCount,
    unreadEmailCount: emailCount
  });
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return auth.response;
  await ensureTable(env);

  const body = await request.json().catch(() => ({} as any));
  const action = String(body?.action || "").trim().toLowerCase();
  const now = Math.floor(Date.now() / 1000);

  if (action === "read") {
    const id = String(body?.id || "").trim();
    if (!id) return json({success:false,error:"Notification ID wajib diisi."},400);
    if (id === "email-unread-summary") {
      await env.DB.prepare("UPDATE email_inbox_messages SET status='read',updated_at=? WHERE direction='inbound' AND status='unread'").bind(now).run().catch(()=>{});
      return json({success:true});
    }
    await env.DB.prepare(`
      UPDATE admin_notifications
      SET is_read=1, read_at=?
      WHERE id=? AND (admin_user_id IS NULL OR admin_user_id=?)
    `).bind(now,id,auth.identity.id).run();
    return json({success:true});
  }

  if (action === "read_all") {
    await env.DB.prepare(`
      UPDATE admin_notifications
      SET is_read=1, read_at=?
      WHERE is_read=0 AND (admin_user_id IS NULL OR admin_user_id=?)
    `).bind(now,auth.identity.id).run();
    await env.DB.prepare("UPDATE email_inbox_messages SET status='read',updated_at=? WHERE direction='inbound' AND status='unread'").bind(now).run().catch(()=>{});
    return json({success:true});
  }

  return json({success:false,error:"Action not valid."},400);
};
