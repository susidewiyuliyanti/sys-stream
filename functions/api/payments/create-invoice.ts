import { Env, json } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

function normalizePayCurrency(currency: string) {
  const value = currency.trim().toLowerCase().replace(/[-_\s]/g, "");
  if (value === "usdt" || value === "usdttrc20") return "usdttrc20";
  if (value === "bitcoin") return "btc";
  if (value === "ethereum") return "eth";
  if (value === "solana") return "sol";
  if (value === "tron") return "trx";
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
  const additions: Array<[string, string]> = [
    ["currency", "TEXT NOT NULL DEFAULT 'USDT'"],
    ["status", "TEXT NOT NULL DEFAULT 'PENDING'"],
    ["reference", "TEXT"],
    ["description", "TEXT"],
    ["metadata", "TEXT"],
    ["created_at", "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP"],
    ["updated_at", "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP"],
  ];

  for (const [name, definition] of additions) {
    if (!names.has(name)) {
      try {
        await env.DB.prepare(`ALTER TABLE transactions ADD COLUMN ${name} ${definition}`).run();
      } catch (error) {
        console.error("transactions schema repair skipped", { name, error: String(error) });
      }
    }
  }
}

function safeErrorMessage(data: any, status: number) {
  const message = data?.message || data?.error || data?.code;
  if (typeof message === "string" && message.trim()) return message.trim();
  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors.map((item: any) => typeof item === "string" ? item : item?.message || item?.error || JSON.stringify(item)).join("; ");
  }
  if (status === 401 || status === 403) return "NOWPayments menolak API key. Periksa NOWPAYMENTS_API_KEY di Cloudflare Secrets.";
  if (status === 400) return "Parameter deposit ditolak oleh NOWPayments. Periksa mata uang pembayaran dan konfigurasi akun.";
  if (status === 429) return "NOWPayments sedang membatasi permintaan. Coba lagi beberapa saat.";
  return `NOWPayments gagal membuat payment (HTTP ${status}).`;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json() as { amountUsd?: number; currency?: string };
    const amountUsd = Number(body.amountUsd);
    const requestedCurrency = String(body.currency || "USDT").trim();
    if (!Number.isFinite(amountUsd)) {
      return json({ success: false, error: "Nominal deposit tidak valid." }, 400);
    }
    const payCurrency = normalizePayCurrency(requestedCurrency);
    const supportedCurrencies = new Set(["usdttrc20", "btc", "eth", "sol", "trx"]);
    if (!supportedCurrencies.has(payCurrency)) {
      return json({ success: false, error: "Mata uang crypto yang dipilih belum didukung untuk deposit." }, 400);
    }

    if (amountUsd < 5) {
      return json({ success: false, error: "Minimum deposit adalah 5 USD." }, 400);
    }

    const apiKey = String(env.NOWPAYMENTS_API_KEY || "").trim();
    if (!apiKey) {
      return json({
        success: false,
        error: "NOWPayments belum dikonfigurasi di server. Tambahkan NOWPAYMENTS_API_KEY pada Cloudflare Secrets."
      }, 503);
    }

    await ensureTransactions(env);

    const orderId = `DEP-${String(auth.user.id)}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const ipnUrl = "https://sysstreamer.asia/api/payments/ipn";
    const apiUrl = String((env as any).NOWPAYMENTS_API_URL || "https://api.nowpayments.io/v1/payment").trim();
    if (!/^https:\/\/api\.nowpayments\.io\/v1\/payment(?:\?.*)?$/i.test(apiUrl)) {
      console.error("Invalid NOWPayments API URL", { apiUrl });
      return json({ success: false, error: "Konfigurasi endpoint NOWPayments tidak valid." }, 503);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    let response: Response;
    let data: any = {};
    try {
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          price_amount: Number(amountUsd.toFixed(2)),
          price_currency: "usd",
          pay_currency: payCurrency,
          ipn_callback_url: ipnUrl,
          order_id: orderId,
          order_description: "SYS STREAM account deposit",
        }),
        signal: controller.signal,
      });

      const raw = await response.text();
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { message: raw.slice(0, 500) };
      }
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      console.error("NOWPayments create payment failed", {
        status: response.status,
        data,
      });
      return json({
        success: false,
        error: safeErrorMessage(data, response.status),
        provider_status: response.status,
        provider_code: data?.code || null,
      }, response.status >= 400 && response.status < 500 ? response.status : 502);
    }

    const paymentId = data?.payment_id;
    const payAddress = data?.pay_address;
    if (!paymentId || !payAddress) {
      console.error("NOWPayments returned incomplete payment", { status: response.status, data });
      return json({
        success: false,
        error: "NOWPayments tidak mengembalikan payment_id atau alamat pembayaran. Deposit belum dibuat.",
      }, 502);
    }

    await env.DB.prepare(`
      INSERT INTO transactions(user_id,type,amount,currency,status,reference,description,metadata)
      VALUES(?,?,?,?,?,?,?,?)
    `).bind(
      auth.user.id,
      "DEPOSIT",
      amountUsd,
      String(payCurrency).toUpperCase(),
      "PENDING",
      orderId,
      "Crypto deposit",
      JSON.stringify({
        paymentId: String(paymentId),
        payCurrency,
        payAddress: String(payAddress),
      })
    ).run();

    return json({
      success: true,
      invoice: {
        order_id: orderId,
        payment_id: String(paymentId),
        pay_address: String(payAddress),
        pay_amount: Number(data.pay_amount || 0),
        pay_currency: String(data.pay_currency || payCurrency).toUpperCase(),
        invoice_url: String(data.invoice_url || data.payment_url || ""),
        amount_usd: amountUsd,
        payment_status: String(data.payment_status || "waiting"),
      },
    });
  } catch (error: any) {
    console.error("create invoice error", error);
    if (error?.name === "AbortError") {
      return json({
        success: false,
        error: "NOWPayments tidak merespons dalam 20 detik. Silakan coba lagi.",
      }, 504);
    }
    return json({
      success: false,
      error: "Gagal membuat deposit crypto.",
    }, 500);
  }
}
