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

    if (!Number.isFinite(amount) || amount < 100000) {
      return json({ success:false, error:"Minimum withdrawal is Rp 100.000 equivalent in all display currencies." },400);
    }
    if (!walletAddress || walletAddress.length < 20) {
      return json({ success:false, error:"Alamat wallet tidak valid." },400);
    }
    if (currency !== "USDT") {
      return json({ success:false, error:"Saat ini penarikan hanya USDT." },400);
    }
    if (network !== "TRC20") {
      return json({ success:false, error:"Saat ini jaringan penarikan USDT adalah TRC20." },400);
    }

    // Use a conditional balance update inside the same D1 transaction as the
    // withdrawal + ledger insert. This prevents double-spend when two requests
    // arrive at nearly the same time.
    const reference = `WD-${crypto.randomUUID()}`;

    const batch = await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO withdrawals(user_id,amount,currency,wallet_address,network,status,provider_reference)
        VALUES(?,?,?,?,?,'PENDING',?)
      `).bind(auth.user.id, amount, currency, walletAddress, network, reference),

      env.DB.prepare(`
        UPDATE users
        SET available_balance = CASE
              WHEN COALESCE(available_balance,0) >= ? THEN COALESCE(available_balance,0) - ?
              ELSE COALESCE(balance,0) - ?
            END,
            balance = CASE
              WHEN COALESCE(available_balance,0) >= ? THEN COALESCE(available_balance,0) - ?
              ELSE COALESCE(balance,0) - ?
            END
        WHERE id = ?
          AND (
            COALESCE(available_balance,0) >= ?
            OR (
              COALESCE(available_balance,0) <= 0
              AND COALESCE(balance,0) >= ?
            )
          )
      `).bind(
        amount, amount, amount,
        amount, amount, amount,
        auth.user.id,
        amount, amount
      ),

      env.DB.prepare(`
        INSERT INTO transactions(user_id,type,amount,currency,status,reference,description)
        VALUES(
          CASE WHEN changes() = 1 THEN ? ELSE NULL END,
          'WITHDRAWAL', ?, ?, 'PENDING', ?, 'Withdrawal request'
        )
      `).bind(auth.user.id, -amount, currency, reference)
    ]);


    const withdrawal = await env.DB.prepare(`
      SELECT id,amount,currency,network,status
      FROM withdrawals
      WHERE provider_reference = ? AND user_id = ?
      ORDER BY id DESC LIMIT 1
    `).bind(reference, auth.user.id).first<any>();

    return json({
      success:true,
      withdrawalId: Number(withdrawal?.id || 0),
      amount,
      currency,
      network,
      status:"PENDING",
      message:"Permintaan penarikan berhasil dibuat dan menunggu proses."
    });
  } catch (error: any) {
    console.error("withdrawal error", error);
    const message = String(error?.message || "");
    if (message.includes("NOT NULL") || message.includes("INSUFFICIENT_BALANCE")) {
      return json({ success:false, error:"Saldo tersedia tidak mencukupi." },400);
    }
    return json({ success:false, error:"Gagal membuat permintaan penarikan." },500);
  }
}
