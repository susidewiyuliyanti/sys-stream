import { Env, json, readJson, withDb } from "../_lib/db";
import { getNowPaymentsSecret, verifyNowPaymentsSignature } from "../_lib/nowpayments";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await readJson<any>(context.request);
    const signature = context.request.headers.get("x-nowpayments-sig") || "";
    const secret = getNowPaymentsSecret(context.env);

    if (!secret) {
      console.error("NOWPayments IPN secret is not configured.");
      return json({ success: false, error: "IPN secret is not configured." }, 503);
    }

    const valid = await verifyNowPaymentsSignature(body, signature, secret);
    if (!valid) {
      return json({ success: false, error: "Invalid NOWPayments IPN signature." }, 403);
    }

    const paymentId = String(body.payment_id || "").trim();
    const paymentStatus = String(body.payment_status || "").trim();
    if (!paymentId || !paymentStatus) {
      return json({ success: false, error: "Invalid IPN payload." }, 400);
    }

    await withDb(context.env, async (client) => {
      const found = await client.query(
        `SELECT order_id, bank_details
         FROM subscription_orders
         WHERE type = 'deposit'
           AND bank_details->>'paymentId' = $1
         LIMIT 1`,
        [paymentId]
      );

      if (found.rows.length === 0) return;

      const metadata = {
        ...(found.rows[0].bank_details || {}),
        paymentStatus,
        updatedAt: new Date().toISOString(),
        actuallyPaid: body.actually_paid !== undefined ? Number(body.actually_paid) : undefined,
        payAmount: body.pay_amount !== undefined ? Number(body.pay_amount) : undefined,
        payCurrency: body.pay_currency || undefined,
        payAddress: body.pay_address || undefined,
        outcomeAmount: body.outcome_amount !== undefined ? Number(body.outcome_amount) : undefined,
      };

      await client.query(
        `UPDATE subscription_orders
         SET bank_details = $1::jsonb,
             tx_hash = COALESCE($2, tx_hash),
             notes = CASE
               WHEN $3 IN ('finished', 'confirmed')
               THEN 'Pembayaran NOWPayments selesai. Menunggu approval Admin/Owner sebelum saldo dikreditkan.'
               ELSE notes
             END
         WHERE order_id = $4`,
        [
          JSON.stringify(metadata),
          body.payin_hash || body.tx_hash || null,
          paymentStatus,
          found.rows[0].order_id,
        ]
      );
    });

    return json({ success: true });
  } catch (error) {
    console.error("NOWPayments IPN error:", error);
    return json({ success: false, error: "IPN processing failed." }, 500);
  }
};
