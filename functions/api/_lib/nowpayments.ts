export interface NowPaymentCurrency {
  id: string;
  symbol: string;
  network: string;
  name: string;
  approxRateIdr: number;
  decimals: number;
  minDepositIdr: number;
}

export const NOWPAYMENTS_CURRENCIES: NowPaymentCurrency[] = [
  { id: "usdtbsc", symbol: "USDT", network: "BEP-20 (BNB Smart Chain)", name: "Tether USD (BEP-20)", approxRateIdr: 16000, decimals: 2, minDepositIdr: 10000 },
  { id: "trx", symbol: "TRX", network: "TRON Mainnet", name: "TRON", approxRateIdr: 3500, decimals: 2, minDepositIdr: 10000 },
  { id: "usdttrc20", symbol: "USDT", network: "TRC-20 (TRON)", name: "Tether USD (TRC-20)", approxRateIdr: 16000, decimals: 2, minDepositIdr: 10000 },
  { id: "usdterc20", symbol: "USDT", network: "ERC-20 (Ethereum)", name: "Tether USD (ERC-20)", approxRateIdr: 16000, decimals: 2, minDepositIdr: 25000 },
  { id: "ltc", symbol: "LTC", network: "Litecoin Network", name: "Litecoin", approxRateIdr: 1400000, decimals: 4, minDepositIdr: 10000 },
  { id: "bnbbsc", symbol: "BNB", network: "BNB Smart Chain", name: "BNB", approxRateIdr: 9500000, decimals: 4, minDepositIdr: 10000 },
  { id: "doge", symbol: "DOGE", network: "Dogecoin Network", name: "Dogecoin", approxRateIdr: 3200, decimals: 2, minDepositIdr: 25000 },
  { id: "sol", symbol: "SOL", network: "Solana Network", name: "Solana", approxRateIdr: 2400000, decimals: 4, minDepositIdr: 15000 },
  { id: "ton", symbol: "TON", network: "The Open Network", name: "Toncoin", approxRateIdr: 85000, decimals: 4, minDepositIdr: 10000 },
  { id: "eth", symbol: "ETH", network: "Ethereum Mainnet", name: "Ethereum", approxRateIdr: 55000000, decimals: 6, minDepositIdr: 15000 },
  { id: "btc", symbol: "BTC", network: "Bitcoin Mainnet", name: "Bitcoin", approxRateIdr: 1050000000, decimals: 8, minDepositIdr: 380000 },
];

export function getNowPaymentsKey(env: unknown): string {
  return String((env as Record<string, unknown>)?.NOWPAYMENTS_API_KEY || "").trim();
}

export function getNowPaymentsSecret(env: unknown): string {
  return String((env as Record<string, unknown>)?.NOWPAYMENTS_IPN_SECRET || "").trim();
}

export function getCurrency(code: string): NowPaymentCurrency | undefined {
  return NOWPAYMENTS_CURRENCIES.find((item) => item.id === String(code || "").toLowerCase());
}

export async function nowPaymentsRequest(
  path: string,
  apiKey: string,
  init: RequestInit = {}
): Promise<{ response: Response; data: any }> {
  const headers = new Headers(init.headers || {});
  headers.set("x-api-key", apiKey);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`https://api.nowpayments.io/v1${path}`, {
    ...init,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

function sortObject(value: any): any {
  if (Array.isArray(value)) return value.map(sortObject);
  if (!value || typeof value !== "object") return value;

  return Object.keys(value)
    .sort()
    .reduce((result: Record<string, any>, key) => {
      result[key] = sortObject(value[key]);
      return result;
    }, {});
}

export async function verifyNowPaymentsSignature(
  body: any,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!secret || !signature) return false;

  const canonical = JSON.stringify(sortObject(body));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );

  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(canonical)
  );

  const expected = Array.from(new Uint8Array(signed))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return expected.toLowerCase() === signature.trim().toLowerCase();
}
