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

function providerMessage(data: any, status: number) {
  const candidates = [
    data?.message,
    data?.error,
    data?.details,
    data?.detail,
    data?.code,
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return `HTTP ${status}`;
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  const apiKey = String(env.NOWPAYMENTS_API_KEY || "").trim();
  if (!apiKey) {
    return json({ success: false, error: "NOWPAYMENTS_API_KEY belum dikonfigurasi." }, 503);
  }

  const url = new URL(request.url);
  const payCurrency = normalizePayCurrency(url.searchParams.get("currency") || "USDT");
  const amountUsd = Number(url.searchParams.get("amount") || "50");
  const allowed = new Set(["usdttrc20", "btc", "eth", "sol", "trx"]);

  if (!allowed.has(payCurrency)) {
    return json({ success: false, error: "Currency tidak didukung." }, 400);
  }

  const base = "https://api.nowpayments.io/v1";
  const headers = { "x-api-key": apiKey, "Accept": "application/json" };

  try {
    const currenciesResponse = await fetch(base + "/full-currencies", { headers });
    const currenciesData = await currenciesResponse.json().catch(() => ({}));

    const result: any = {
      success: true,
      currency: payCurrency,
      amount_usd: amountUsd,
      api_key_status: currenciesResponse.status === 200 ? "valid" : "rejected",
      currency_available: null,
      minimum_amount_usd: null,
      estimate: null,
      diagnosis: []
    };

    if (!currenciesResponse.ok) {
      result.success = false;
      result.diagnosis.push(providerMessage(currenciesData, currenciesResponse.status));
      return json(result, currenciesResponse.status >= 400 && currenciesResponse.status < 500 ? currenciesResponse.status : 502);
    }

    const currencies = Array.isArray(currenciesData?.currencies)
      ? currenciesData.currencies.map((v: any) => String(v).toLowerCase())
      : [];
    result.currency_available = currencies.includes(payCurrency);

    const minResponse = await fetch(
      `${base}/min-amount?currency_from=usd&currency_to=${encodeURIComponent(payCurrency)}`,
      { headers }
    );
    const minData = await minResponse.json().catch(() => ({}));

    if (minResponse.ok) {
      result.minimum_amount_usd = Number(minData?.min_amount || 0);
    } else {
      result.diagnosis.push(`Minimum pair: ${providerMessage(minData, minResponse.status)}`);
    }

    if (Number.isFinite(amountUsd) && amountUsd > 0) {
      const estimateResponse = await fetch(
        `${base}/estimate?amount=${encodeURIComponent(amountUsd)}&currency_from=usd&currency_to=${encodeURIComponent(payCurrency)}`,
        { headers }
      );
      const estimateData = await estimateResponse.json().catch(() => ({}));
      if (estimateResponse.ok) {
        result.estimate = Number(estimateData?.estimated_amount || 0);
      } else {
        result.diagnosis.push(`Estimate: ${providerMessage(estimateData, estimateResponse.status)}`);
      }
    }

    if (!result.currency_available) {
      result.diagnosis.push(`${payCurrency.toUpperCase()} tidak tersedia untuk API key ini.`);
    }

    if (result.minimum_amount_usd && amountUsd < result.minimum_amount_usd) {
      result.diagnosis.push(`Nominal ${amountUsd.toFixed(2)} USD di bawah minimum ${result.minimum_amount_usd.toFixed(2)} USD.`);
    }

    if (result.diagnosis.length === 0) {
      result.diagnosis.push(
        "API key valid, currency tersedia, dan nominal lolos preflight. Jika POST /payment tetap HTTP 400, periksa Outcome Wallet/Payment Settings pada akun NOWPayments."
      );
    }

    return json(result, 200);
  } catch (error) {
    console.error("NOWPayments diagnostics error", error);
    return json({ success: false, error: "Diagnostics NOWPayments gagal dijalankan." }, 502);
  }
}
