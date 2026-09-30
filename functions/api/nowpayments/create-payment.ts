import { Env, json, readJson, withDb } from "../_lib/db";
import { requireAuth } from "../_lib/auth";
import {
  getCurrency,
  getNowPaymentsKey,
  nowPaymentsRequest,
} from "../_lib/nowpayments";

interface CreatePaymentRequest {
  price_amount?: number;
  pay_currency?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
}

function makeOrderId(): string {
  return `NOW-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env);
    if (!auth.ok) return auth.response;

    const body = await readJson<CreatePaymentRequest>(context.request);
    const nominalIdr = Math.round(Number(body.price_amount));
    const payCurrency = String(body.pay_currency || "usdtbsc").toLowerCase();
    const currency = getCurrency(payCurrency);
    const apiKey = getNowPaymentsKey(context.env);

    if (!Number.isInteger(nominalIdr) || nominalIdr <= 0) {
      return json({ success: false, error: "Nominal deposit tidak valid." }, 400);
    }

    if (!currency) {
      return json({ success: false, error: "Mata uang crypto tidak didukung oleh checkout." }, 400);
    }

    if (!apiKey) {
      return json({
        success: false,
        code: "NOWPAYMENTS_NOT_CONFIGURED",
        error: "NOWPayments API Key belum dikonfigurasi di Cloudflare Environment Variables.",
      }, 503);
    }

    const userId = String(auth.user.id);
    const userEmail = String(auth.user.email || body.userEmail || "");
    const userName = String(auth.user.username || body.userName || "Host Streamer");
    const orderId = makeOrderId();
    const origin = new URL(context.request.url).origin;
    const ipnCallbackUrl = `${origin}/api/nowpayments/ipn`;

    const { response, data } = await nowPaymentsRequest("/payment", apiKey, {
      method: "POST",
      body: JSON.stringify({
        price_amount: nominalIdr,
        price_currency: "idr",
        pay_currency: payCurrency,
        ipn_callback_url: ipnCallbackUrl,
        order_id: orderId,
        order_description: `SYS Stream wallet deposit ${nominalIdr.toLocaleString("id-ID")} IDR`,
        is_fee_paid_by_user: false,
      }),
    });

    if (!response.ok || !data?.payment_id) {
      console.error("NOWPayments create payment rejected:", response.status, data);
      const message = String(
        data?.message ||
        data?.error ||
        "NOWPayments gagal membuat payment."
      );

      return json({
        success: false,
        code: data?.code || "NOWPAYMENTS_CREATE_FAILED",
        error: message,
        details: data?.min_amount ? { min_amount: data.min_amount } : undefined,
      }, response.status >= 400 && response.status < 500 ? response.status : 502);
    }

    const paymentMetadata = {
      provider: "NOWPayments",
      paymentId: String(data.payment_id),
      paymentStatus: String(data.payment_status || "waiting"),
      payAmount: Number(data.pay_amount || 0),
      payCurrency: String(data.pay_currency || payCurrency),
      payAddress: String(data.pay_address || ""),
      network: String(data.network || currency.network),
      priceAmountIdr: nominalIdr,
      priceCurrency: "IDR",
      createdAt: new Date().toISOString(),
    };

    await withDb(context.env, async (client) => {
      await client.query(
        `
        INSERT INTO subscription_orders (
          order_id, user_id, nama, jumlah, user_email, plan_id, plan_name,
          price, currency, status, payment_method, duration_days, type,
          tx_hash, user_name, bank_details, notes, created_at
        )
        VALUES (
          $1, $2, $3, $4, $5, 'nowpayments-deposit', 'NOWPayments Deposit',
          $4, 'IDR', 'pending', 'NOWPayments', 0, 'deposit',
          NULL, $3, $6::jsonb,
          'Payment blockchain harus selesai terlebih dahulu. Saldo baru bertambah setelah Admin/Owner melakukan approval.',
          NOW()
        )
        ON CONFLICT (order_id) DO NOTHING
        `,
        [
          orderId,
          userId,
          userName,
          nominalIdr,
          userEmail,
          JSON.stringify(paymentMetadata),
        ]
      );
    });

    return json({
      success: true,
      isSandbox: false,
      payment: {
        payment_id: String(data.payment_id),
        order_id: orderId,
        price_amount: nominalIdr,
        price_currency: "idr",
        pay_amount: Number(data.pay_amount || 0),
        pay_currency: String(data.pay_currency || payCurrency).toUpperCase(),
        pay_address: String(data.pay_address || ""),
        payment_status: String(data.payment_status || "waiting"),
        network: String(data.network || currency.network),
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("NOWPayments create-payment error:", error);
    return json({
      success: false,
      error: "Gagal membuat checkout NOWPayments.",
    }, 500);
  }
};
