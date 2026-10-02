import { Env, json } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

async function ensureTransactions(env: Env) {
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
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id, created_at)").run();
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;
  try {
    await ensureTransactions(env);
    const rows = await env.DB.prepare(`
      SELECT id, type, amount, currency, status, reference, description,
             created_at AS createdAt, updated_at AS updatedAt
      FROM transactions
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 100
    `).bind(auth.user.id).all();
    return json({ success: true, transactions: rows.results || [] });
  } catch (error) {
    console.error("transactions error", error);
    return json({ success: false, error: "Gagal mengambil history transaksi." }, 500);
  }
}
