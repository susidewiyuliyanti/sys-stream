import { Env, json, readJson } from "../../_lib/db";
import { requireAdmin } from "../../_lib/admin";
import { notifyAdmins } from "../../_lib/admin-notifications";

type BalanceBody = {
  userId?: string;
  balance?: number;
  note?: string;
};

async function ensureAuditTable(env: Env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS admin_balance_adjustments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      admin_user_id TEXT,
      before_balance REAL NOT NULL,
      after_balance REAL NOT NULL,
      delta REAL NOT NULL,
      note TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `).run();
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;
  if (auth.identity.role !== "OWNER") {
    return json({ success:false, error:"Hanya OWNER yang dapat mengubah saldo user." }, 403);
  }

  try {
    const body = await readJson<BalanceBody>(context.request);
    const userId = String(body.userId || "").trim();
    const balance = Number(body.balance);
    const note = String(body.note || "").trim();

    if (!userId) return json({ success:false, error:"User wajib dipilih." }, 400);
    if (!Number.isFinite(balance) || balance < 0 || balance > 1000000000000) {
      return json({ success:false, error:"Saldo harus berupa angka 0 sampai 1.000.000.000.000." }, 400);
    }
    if (note.length < 3) return json({ success:false, error:"Catatan perubahan saldo wajib diisi." }, 400);
    if (note.length > 500) return json({ success:false, error:"Catatan maksimal 500 karakter." }, 400);

    await ensureAuditTable(context.env);

    const user = await context.env.DB.prepare(
      "SELECT id,username,email,COALESCE(available_balance,0) AS balance FROM users WHERE id=? LIMIT 1"
    ).bind(userId).first<any>();

    if (!user) return json({ success:false, error:"User tidak ditemukan." }, 404);

    const before = Number(user.balance || 0);
    const delta = balance - before;
    if (delta === 0) {
      return json({ success:false, error:"Saldo baru sama dengan saldo saat ini. Tidak ada perubahan." }, 400);
    }

    const now = Math.floor(Date.now() / 1000);
    const adjustmentId = crypto.randomUUID();

    await context.env.DB.batch([
      context.env.DB.prepare(
        "UPDATE users SET available_balance=?, balance=? WHERE id=?"
      ).bind(balance, balance, userId),
      context.env.DB.prepare(
        `INSERT INTO admin_balance_adjustments
         (id,user_id,admin_user_id,before_balance,after_balance,delta,note,created_at)
         VALUES(?,?,?,?,?,?,?,?)`
      ).bind(adjustmentId, userId, auth.identity.id, before, balance, delta, note, now)
    ]);

    await notifyAdmins(context.env, {
      type: "balance.adjustment",
      title: "User balance adjusted",
      message: `${auth.identity.displayName || "Owner"} changed ${user.username || user.email || userId} balance from ${before} to ${balance}.`,
      severity: "warning",
      entityType: "balance_adjustment",
      entityId: adjustmentId,
      adminUserId: auth.identity.id
    });

    return json({
      success:true,
      adjustment:{
        id:adjustmentId,
        userId,
        username:String(user.username || ""),
        email:String(user.email || ""),
        beforeBalance:before,
        afterBalance:balance,
        delta,
        note,
        createdAt:now
      }
    }, 201);
  } catch (error) {
    console.error("admin balance adjustment error", error);
    return json({ success:false, error:"Perubahan saldo gagal diproses." }, 500);
  }
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;

  try {
    await ensureAuditTable(context.env);
    const result = await context.env.DB.prepare(`
      SELECT a.id,a.user_id AS userId,
             COALESCE(u.username,'') AS username,
             COALESCE(u.email,'') AS email,
             a.before_balance AS beforeBalance,
             a.after_balance AS afterBalance,
             a.delta,
             a.note,
             a.created_at AS createdAt,
             COALESCE(ad.display_name,'Owner') AS adminName
      FROM admin_balance_adjustments a
      LEFT JOIN users u ON u.id=a.user_id
      LEFT JOIN admin_users ad ON ad.id=a.admin_user_id
      ORDER BY a.created_at DESC
      LIMIT 200
    `).all();

    return json({ success:true, adjustments:result.results || [] });
  } catch (error) {
    console.error("admin balance history error", error);
    return json({ success:false, error:"Riwayat perubahan saldo gagal dimuat." }, 500);
  }
};
