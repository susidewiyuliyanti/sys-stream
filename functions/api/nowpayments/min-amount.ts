import { Env, json } from "../_lib/db";
import { getCurrency } from "../_lib/nowpayments";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const currencyCode = String(context.request.url ? new URL(context.request.url).searchParams.get("currency") || "usdtbsc" : "usdtbsc").toLowerCase();
  const currency = getCurrency(currencyCode);

  if (!currency) {
    return json({ success: false, error: "Currency tidak didukung." }, 400);
  }

  return json({
    success: true,
    currency: currency.id,
    minCrypto: currency.minDepositIdr / currency.approxRateIdr,
    minIdr: currency.minDepositIdr,
  });
};
