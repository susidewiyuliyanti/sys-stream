import { Env, json, readJson } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

async function ensureWithdrawals(env: Env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USDT',
    wallet_address TEXT NOT NULL,
    network TEXT NOT NULL DEFAULT 'TRC20',
    status TEXT NOT NULL DEFAULT 'PENDING',
    provider_reference TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TEXT
  )`).run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id, created_at)").run();
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  try {
    await ensureWithdrawals(env);
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USDT',
      status TEXT NOT NULL DEFAULT 'PENDING',
      reference TEXT,
      description TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`).run();

    const body = await readJson<{ amount?: number; walletAddress?: string; currency?: string; network?: string }>(request);
    const amount = Number(body.amount);
    const walletAddress = String(body.walletAddress || "").trim();
    const currency = String(body.currency || "USDT").toUpperCase();
    const network = String(body.network || "TRC20").toUpperCase();

    if (!Number.isFinite(amount) || amount <= 0) return json({ success:false, error:"Nominal penarikan tidak valid." },400);
    if (!walletAddress || walletAddress.length < 20) return json({ success:false, error:"Alamat wallet tidak valid." },400);
    if (currency !== "USDT") return json({ success:false, error:"Saat ini penarikan hanya USDT." },400);

    const result = await env.DB.prepare(`
      SELECT
        CASE WHEN COALESCE(available_balance,0) > 0 THEN COALESCE(available_balance,0) ELSE COALESCE(balance,0) END AS balance
      FROM users WHERE id = ? LIMIT 1
    `).bind(auth.user.id).first<any>();
    const balance = Number(result?.balance || 0);

    if (amount > balance) return json({ success:false, error:"Saldo tersedia tidak mencukupi." },400);

    const withdrawal = await env.DB.prepare(`
      INSERT INTO withdrawals(user_id,amount,currency,wallet_address,network,status)
      VALUES(?,?,?,?,?,'PENDING')
    `).bind(auth.user.id, amount, currency, walletAddress, network).run();

    const withdrawalId = Number(withdrawal.meta.last_row_id || 0);

    await env.DB.prepare(`
      UPDATE users
      SET available_balance = ?,
          balance = ?
      WHERE id = ?
    `).bind(balance - amount, balance - amount, auth.user.id).run();

    await env.DB.prepare(`
      INSERT INTO transactions(user_id,type,amount,currency,status,reference,description)
      VALUES(?,?,?,?,?,?,?)
    `).bind(auth.user.id, "WITHDRAWAL", -amount, currency, "PENDING", `WD-${withdrawalId}`, "Withdrawal request").run();

    return json({
      success:true,
      withdrawalId,
      amount,
      currency,
      network,
      status:"PENDING",
      message:"Permintaan penarikan berhasil dibuat dan menunggu proses."
    });
  } catch (error) {
    console.error("withdrawal error", error);
    return json({ success:false, error:"Gagal membuat permintaan penarikan." },500);
  }
}
