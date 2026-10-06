import { Env, json } from "../../_lib/db";

const encoder = new TextEncoder();

async function hmacSha512(secret: string, message: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), {name:"HMAC",hash:"SHA-512"}, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2,"0")).join("");
}

function stableSort(value: any): any {
  if (Array.isArray(value)) return value.map(stableSort);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((o,k) => { o[k]=stableSort(value[k]); return o; }, {} as any);
  }
  return value;
}

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

  const columns = await env.DB.prepare("PRAGMA table_info(transactions)").all();
  const names = new Set((columns.results || []).map((r: any) => String(r.name)));
  if (!names.has("payment_id")) {
    try {
      await env.DB.prepare("ALTER TABLE transactions ADD COLUMN payment_id TEXT").run();
    } catch (error) {
      console.error("transactions payment_id schema repair skipped", String(error));
    }
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    const secret = env.NOWPAYMENTS_IPN_SECRET;
    if (!secret) return json({success:false,error:"IPN secret belum dikonfigurasi."},503);

    const raw = await request.text();
    const signature = request.headers.get("x-nowpayments-sig") || "";
    const expected = await hmacSha512(secret, JSON.stringify(stableSort(JSON.parse(raw))));
    if (!signature || signature.toLowerCase() !== expected.toLowerCase()) {
      return json({success:false,error:"Invalid IPN signature."},401);
    }

    const data = JSON.parse(raw);
    const orderId = String(data.order_id || "");
    const status = String(data.payment_status || "").toLowerCase();
    if (!orderId) return json({success:false,error:"Missing order_id."},400);

    await ensureTransactions(env);
    const tx = await env.DB.prepare(`
      SELECT id,user_id,amount,status,metadata
      FROM transactions WHERE reference = ? AND type = 'DEPOSIT' LIMIT 1
    `).bind(orderId).first<any>();

    if (!tx) return json({success:false,error:"Transaction not found."},404);

    const successful = status === "finished";
    const failed = ["failed","expired","refunded"].includes(status);

    if (successful && String(tx.status).toUpperCase() !== "COMPLETED") {
      const usdAmount = Number(data.price_amount || tx.amount || 0);
      const usdToIdr = 17937;
      const creditedIdr = usdAmount > 0 && Number.isFinite(usdToIdr)
        ? Math.round(usdAmount * usdToIdr)
        : 0;

      if (creditedIdr > 0) {
        const user = await env.DB.prepare(`
          SELECT COALESCE(available_balance,0) AS available_balance
          FROM users WHERE id = ? LIMIT 1
        `).bind(tx.user_id).first<any>();

        const balance = Number(user?.available_balance || 0);
        const nextBalance = balance + creditedIdr;

        const updated = await env.DB.prepare(`
          UPDATE transactions
          SET amount=?, status='COMPLETED', updated_at=CURRENT_TIMESTAMP
          WHERE id=? AND status <> 'COMPLETED'
        `).bind(usdAmount, tx.id).run();

        if (Number((updated as any)?.meta?.changes || 0) > 0) {
          await env.DB.prepare("UPDATE users SET available_balance=? WHERE id=?")
            .bind(nextBalance, nextBalance, tx.user_id).run();
        }
      }
    } else if (failed) {
      await env.DB.prepare("UPDATE transactions SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?")
        .bind(status.toUpperCase(), tx.id).run();
    } else {
      await env.DB.prepare("UPDATE transactions SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?")
        .bind(status.toUpperCase() || "PENDING", tx.id).run();
    }

    return json({success:true});
  } catch (error) {
    console.error("NOWPayments IPN error", error);
    return json({success:false,error:"IPN processing failed."},500);
  }
}