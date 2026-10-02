import { Env, json } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

function normalizePayCurrency(currency: string) {
  const value = currency.toLowerCase();
  if (value === "usdt") return "usdttrc20";
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
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json() as { amountUsd?: number; currency?: string };
    const amountUsd = Number(body.amountUsd);
    const payCurrency = normalizePayCurrency(String(body.currency || "USDT"));

    if (!Number.isFinite(amountUsd) || amountUsd < 5) {
      return json({ success:false, error:"Minimum deposit adalah 5 USD." },400);
    }

    const apiKey = env.NOWPAYMENTS_API_KEY;
    if (!apiKey) {
      return json({
        success:false,
        error:"NOWPayments belum dikonfigurasi di server. Tambahkan NOWPAYMENTS_API_KEY pada Cloudflare Secrets."
      },503);
    }

    await ensureTransactions(env);

    const orderId = `DEP-${String(auth.user.id)}-${Date.now()}-${crypto.randomUUID().slice(0,8)}`;
    const ipnUrl = `https://sysstreamer.asia/api/payments/ipn`;

    const response = await fetch("https://api.nowpayments.io/v1/payment", {
      method:"POST",
      headers:{
        "x-api-key":apiKey,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        price_amount: amountUsd,
        price_currency: "usd",
        pay_currency: payCurrency,
        ipn_callback_url: ipnUrl,
        order_id: orderId,
        order_description: "SYS STREAM account deposit"
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.payment_id || !data?.pay_address) {
      console.error("NOWPayments create payment failed", response.status, data);
      return json({
        success:false,
        error:String(data?.message || data?.error || "NOWPayments gagal membuat payment.")
      },502);
    }

    await env.DB.prepare(`
      INSERT INTO transactions(user_id,type,amount,currency,status,reference,description,metadata)
      VALUES(?,?,?,?,?,?,?,?)
    `).bind(
      auth.user.id,
      "DEPOSIT",
      amountUsd,
      "USDT",
      "PENDING",
      orderId,
      "Crypto deposit",
      JSON.stringify({ paymentId:String(data.payment_id), payCurrency, payAddress:String(data.pay_address) })
    ).run();

    return json({
      success:true,
      invoice:{
        order_id:orderId,
        payment_id:String(data.payment_id),
        pay_address:String(data.pay_address),
        pay_amount:Number(data.pay_amount || amountUsd),
        pay_currency:String(data.pay_currency || payCurrency).toUpperCase(),
        amount_usd:amountUsd,
        payment_status:String(data.payment_status || "waiting")
      }
    });
  } catch (error) {
    console.error("create invoice error", error);
    return json({ success:false, error:"Gagal membuat deposit crypto." },500);
  }
}
