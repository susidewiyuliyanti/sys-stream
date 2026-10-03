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
    ["payment_id", "TEXT"],
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

function providerMessage(data: any, status: number) {
  const candidates = [
    data?.message,
    data?.error?.message,
    data?.error?.description,
    data?.description,
    data?.details,
    data?.detail,
    typeof data?.error === "string" ? data.error : null,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }

  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors.map((item: any) =>
      typeof item === "string"
        ? item
        : item?.message || item?.error || item?.description || JSON.stringify(item)
    ).join("; ");
  }

  if (status === 401 || status === 403) {
    return "API key NOWPayments ditolak atau belum memiliki akses payment.";
  }

  if (status === 400) {
    return "Parameter payment ditolak NOWPayments.";
  }

  return `NOWPayments gagal (HTTP ${status}).`;
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  try {
    const url = new URL(request.url);
    const requestedCurrency = String(url.searchParams.get("currency") || "USDT");
    const amountUsd = Number(url.searchParams.get("amount") || "0");
    const payCurrency = normalizePayCurrency(requestedCurrency);
    const supportedCurrencies = new Set(["usdttrc20", "btc", "eth", "sol", "trx"]);

    if (!supportedCurrencies.has(payCurrency)) {
      return json({ success: false, error: "Mata uang crypto yang dipilih belum didukung." }, 400);
    }

    const apiKey = String(env.NOWPAYMENTS_API_KEY || "").trim();
    if (!apiKey) {
      return json({ success: false, error: "NOWPayments belum dikonfigurasi di server." }, 503);
    }

    const base = "https://api.nowpayments.io/v1";
    const headers = { "x-api-key": apiKey, "Accept": "application/json" };

    const currenciesResponse = await fetch(base + "/currencies", { headers });
    const currenciesData = await currenciesResponse.json().catch(() => ({}));

    if (!currenciesResponse.ok) {
      return json({
        success: false,
        error: providerMessage(currenciesData, currenciesResponse.status),
        provider_status: currenciesResponse.status,
      }, 502);
    }

    const available = Array.isArray(currenciesData?.currencies)
      ? currenciesData.currencies.map((v: any) => String(v).toLowerCase())
      : [];

    if (available.length && !available.includes(payCurrency.toLowerCase())) {
      return json({
        success: false,
        error: `${payCurrency.toUpperCase()} tidak tersedia dari endpoint currencies NOWPayments untuk API key ini.`,
        provider_status: 400,
        pay_currency: payCurrency,
      }, 400);
    }

    const minResponse = await fetch(
      `${base}/min-amount?currency_from=usd&currency_to=${encodeURIComponent(payCurrency)}`,
      { headers }
    );
    const minData = await minResponse.json().catch(() => ({}));

    if (!minResponse.ok) {
      return json({
        success: false,
        error: `NOWPayments tidak dapat memvalidasi minimum ${payCurrency.toUpperCase()}: ${providerMessage(minData, minResponse.status)}`,
        provider_status: minResponse.status,
      }, 502);
    }

    const minAmountUsd = Number(minData?.min_amount || 0);
    if (Number.isFinite(minAmountUsd) && minAmountUsd > 0 && amountUsd > 0 && amountUsd < minAmountUsd) {
      return json({
        success: false,
        error: `Minimum NOWPayments saat ini untuk ${payCurrency.toUpperCase()} sekitar ${minAmountUsd} USD. Nominal yang dipilih ${amountUsd.toFixed(2)} USD.`,
        provider_status: 400,
        pay_currency: payCurrency,
        min_amount_usd: minAmountUsd,
        amount_usd: amountUsd,
      }, 400);
    }

    let estimate: number | null = null;
    if (Number.isFinite(amountUsd) && amountUsd > 0) {
      const estimateResponse = await fetch(
        `${base}/estimate?amount=${encodeURIComponent(amountUsd)}&currency_from=usd&currency_to=${encodeURIComponent(payCurrency)}`,
        { headers }
      );
      const estimateData = await estimateResponse.json().catch(() => ({}));
      if (estimateResponse.ok && Number.isFinite(Number(estimateData?.estimated_amount))) {
        estimate = Number(estimateData.estimated_amount);
      }
    }

    return json({
      success: true,
      currency: payCurrency,
      available: true,
      min_amount_usd: minAmountUsd,
      estimate,
      rate_checked_at: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("NOWPayments preflight error", error);
    return json({ success: false, error: "Tidak dapat memeriksa aturan pembayaran NOWPayments saat ini." }, 502);
  }
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
    const apiUrl = "https://api.nowpayments.io/v1/payment";

    // Validate the selected pair immediately before creation. NOWPayments documents
    // that minimums are dynamic and depend on the selected payment pair/network.
    const headers = { "x-api-key": apiKey, "Accept": "application/json" };

    const minResponse = await fetch(
      `https://api.nowpayments.io/v1/min-amount?currency_from=usd&currency_to=${encodeURIComponent(payCurrency)}`,
      { headers }
    );
    const minData = await minResponse.json().catch(() => ({}));

    if (!minResponse.ok) {
      const detail = providerMessage(minData, minResponse.status);
      return json({
        success: false,
        error: `NOWPayments tidak dapat memvalidasi ${payCurrency.toUpperCase()}: ${detail}`,
        provider_status: minResponse.status,
      }, 502);
    }

    const minAmountUsd = Number(minData?.min_amount || 0);
    if (Number.isFinite(minAmountUsd) && minAmountUsd > 0 && amountUsd < minAmountUsd) {
      return json({
        success: false,
        error: `Minimum NOWPayments untuk ${payCurrency.toUpperCase()} saat ini adalah sekitar ${minAmountUsd} USD. Nominal Anda ${amountUsd.toFixed(2)} USD.`,
        provider_status: 400,
        pay_currency: payCurrency,
        min_amount_usd: minAmountUsd,
        amount_usd: amountUsd,
      }, 400);
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
        payCurrency,
        amountUsd,
      });

      const detail = providerMessage(data, response.status);
      const diagnostics = [
        `pair=${payCurrency.toUpperCase()}`,
        `amount=${amountUsd.toFixed(2)} USD`,
        minAmountUsd > 0 ? `minimum=${minAmountUsd} USD` : null,
      ].filter(Boolean).join(", ");

      return json({
        success: false,
        error: `NOWPayments menolak payment (${diagnostics}). Detail provider: ${detail}`,
        provider_status: response.status,
        provider_code: data?.code || null,
        provider_error: typeof data?.error === "string" ? data.error : null,
        provider_message: typeof data?.message === "string" ? data.message : null,
        pay_currency: payCurrency,
        amount_usd: amountUsd,
        min_amount_usd: minAmountUsd || null,
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
      INSERT INTO transactions(user_id,type,amount,currency,status,reference,description,metadata,payment_id)
      VALUES(?,?,?,?,?,?,?,?,?)
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
      }),
      String(paymentId)
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
        error: "NOWPayments tidak merespons dalam batas waktu. Silakan coba lagi.",
      }, 504);
    }

    return json({
      success: false,
      error: error instanceof Error ? error.message : "Gagal membuat deposit crypto.",
    }, 500);
  }
}
