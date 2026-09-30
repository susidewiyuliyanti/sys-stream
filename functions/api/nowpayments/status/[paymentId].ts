import { Env, json, withDb } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";
import { getNowPaymentsKey, nowPaymentsRequest } from "../../_lib/nowpayments";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env);
    if (!auth.ok) return auth.response;

    const paymentId = String(context.params.paymentId || "").trim();
    if (!paymentId) return json({ success: false, error: "Payment ID wajib diisi." }, 400);

    const userId = String(auth.user.id);

    const result = await withDb(context.env, async (client) => {
      const found = await client.query(
        `
        SELECT order_id, user_id, price, bank_details, status
        FROM subscription_orders
        WHERE type = 'deposit'
          AND bank_details->>'paymentId' = $1
          AND user_id = $2
        LIMIT 1
        `,
        [paymentId, userId]
      );
      return found.rows[0] || null;
    });

    if (!result) {
      return json({ success: false, error: "Payment tidak ditemukan." }, 404);
    }

    const metadata = { ...(result.bank_details || {}) };
    const apiKey = getNowPaymentsKey(context.env);

    if (apiKey && !["finished", "confirmed", "failed", "refunded", "expired"].includes(String(metadata.paymentStatus))) {
      try {
        const { response, data } = await nowPaymentsRequest(`/payment/${encodeURIComponent(paymentId)}`, apiKey);
        if (response.ok && data?.payment_status) {
          metadata.paymentStatus = String(data.payment_status);
          if (data.actually_paid !== undefined) metadata.actuallyPaid = Number(data.actually_paid);
          if (data.pay_amount !== undefined) metadata.payAmount = Number(data.pay_amount);
          if (data.pay_address) metadata.payAddress = String(data.pay_address);
          if (data.pay_currency) metadata.payCurrency = String(data.pay_currency);
          metadata.updatedAt = new Date().toISOString();

          await withDb(context.env, async (client) => {
            await client.query(
              `UPDATE subscription_orders
               SET bank_details = $1::jsonb,
                   tx_hash = COALESCE($2, tx_hash)
               WHERE order_id = $3`,
              [
                JSON.stringify(metadata),
                data.payin_extra_id || data.hash || data.tx_hash || null,
                result.order_id,
              ]
            );
          });
        }
      } catch (error) {
        console.warn("NOWPayments live status check failed:", error);
      }
    }

    const paymentStatus = String(metadata.paymentStatus || "waiting");
    return json({
      payment_id: paymentId,
      order_id: result.order_id,
      payment_status: paymentStatus,
      is_completed: paymentStatus === "finished" || paymentStatus === "confirmed",
      pay_amount: Number(metadata.actuallyPaid ?? metadata.payAmount ?? 0),
      pay_currency: String(metadata.payCurrency || ""),
      price_amount: Number(result.price || 0),
      pay_address: String(metadata.payAddress || ""),
      network: String(metadata.network || ""),
      updated_at: String(metadata.updatedAt || ""),
      approval_status: String(result.status || "pending"),
      is_sandbox: false,
    });
  } catch (error) {
    console.error("NOWPayments status error:", error);
    return json({ success: false, error: "Gagal mengecek status pembayaran." }, 500);
  }
};
