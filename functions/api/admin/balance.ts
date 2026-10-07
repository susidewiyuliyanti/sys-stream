import { Env, json, readJson } from "../../_lib/db";
import { requireAdmin } from "../../_lib/admin";
import { notifyAdmins } from "../../_lib/admin-notifications";
import { idrToUsdt, usdtToIdr } from "../../_lib/bonuses";

type BalanceBody = {
  userId?: string;
  availableBalance?: number;
  note?: string;
};

async function ensureTransactions(env: Env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USDT',
      status TEXT NOT NULL DEFAULT 'COMPLETED',
      reference TEXT,
      description TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id, created_at)").run();
}

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
    const availableBalance = Number(body.availableBalance);
    const targetBalanceIdr = usdtToIdr(availableBalance);
    const note = String(body.note || "").trim();

    if (!userId) return json({ success:false, error:"User wajib dipilih." }, 400);
    if (!Number.isFinite(availableBalance) || availableBalance < 0 || availableBalance > 1000000000000) {
      return json({ success:false, error:"Saldo USDT harus berupa angka 0 sampai 1.000.000.000.000." }, 400);
    }
    if (note.length < 3) return json({ success:false, error:"Catatan perubahan saldo wajib diisi." }, 400);
    if (note.length > 500) return json({ success:false, error:"Catatan maksimal 500 karakter." }, 400);

    await ensureAuditTable(context.env);
    await ensureTransactions(context.env);

    const user = await context.env.DB.prepare(
      "SELECT id,username,email,COALESCE(available_balance,0) AS availableBalance FROM users WHERE id=? LIMIT 1"
    ).bind(userId).first<any>();

    if (!user) return json({ success:false, error:"User tidak ditemukan." }, 404);

    const beforeIdr = Number(user.availableBalance || 0);
    const before = idrToUsdt(beforeIdr);
    const delta = availableBalance - before;
    if (delta === 0) {
      return json({ success:false, error:"Saldo baru sama dengan saldo saat ini. Tidak ada perubahan." }, 400);
    }

    const now = Math.floor(Date.now() / 1000);
    const adjustmentId = crypto.randomUUID();

    await context.env.DB.batch([
      context.env.DB.prepare(
        "UPDATE users SET available_balance=? WHERE id=?"
      ).bind(targetBalanceIdr, userId),
      context.env.DB.prepare(
        `INSERT INTO admin_balance_adjustments
         (id,user_id,admin_user_id,before_balance,after_balance,delta,note,created_at)
         VALUES(?,?,?,?,?,?,?,?)`
      ).bind(adjustmentId, userId, auth.identity.id, before, availableBalance, delta, note, now),
      context.env.DB.prepare(
        `INSERT INTO transactions
         (user_id,type,amount,currency,status,reference,description,metadata)
         VALUES(?,?,?,?,?,?,?,?)`
      ).bind(
        userId,
        "ADMIN_ADJUSTMENT",
        delta,
        "USDT",
        "COMPLETED",
        adjustmentId,
        "Owner/Admin balance adjustment",
        JSON.stringify({
          beforeBalance: before,
          afterBalance: availableBalance,
          note,
          adminUserId: auth.identity.id,
          adminName: auth.identity.displayName || "Owner"
        })
      )
    ]);

    await notifyAdmins(context.env, {
      type: "balance.adjustment",
      title: "User balance adjusted",
      message: `${auth.identity.displayName || "Owner"} changed ${user.username || user.email || userId} available balance from ${before} to ${availableBalance} USDT.`,
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
        afterBalance:availableBalance,
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
