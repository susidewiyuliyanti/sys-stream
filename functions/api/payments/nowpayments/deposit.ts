import { Env, json, readJson, withDb } from "../../../_lib/db";
import { requireAuth } from "../../../_lib/auth";
import { getNowPaymentsKey, nowPaymentsRequest } from "../../../_lib/nowpayments";

interface FinalizeRequest {
  userId?: string;
  userEmail?: string;
  userName?: string;
  nominalIdr?: number;
  paymentId?: string;
  payAddress?: string;
  payAmount?: number;
  payCurrency?: string;
  txHash?: string;
  network?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env);
    if (!auth.ok) return auth.response;

    const body = await readJson<FinalizeRequest>(context.request);
    const paymentId = String(body.paymentId || "").trim();
    if (!paymentId) return json({ success: false, error: "Payment ID wajib diisi." }, 400);

    const userId = String(auth.user.id);
    const apiKey = getNowPaymentsKey(context.env);
    if (!apiKey) {
      return json({ success: false, error: "NOWPayments API Key belum dikonfigurasi." }, 503);
    }

    const { response, data } = await nowPaymentsRequest(
      `/payment/${encodeURIComponent(paymentId)}`,
      apiKey
    );

    if (!response.ok || !data?.payment_status) {
      return json({ success: false, error: "Payment NOWPayments tidak dapat diverifikasi." }, 502);
    }

    const paymentStatus = String(data.payment_status).toLowerCase();
    if (!["finished", "confirmed"].includes(paymentStatus)) {
      return json({
        success: false,
        status: paymentStatus,
        error: "Pembayaran belum berstatus finished/confirmed.",
      }, 409);
    }

    const nominalIdr = Math.round(Number(body.nominalIdr || data.price_amount || 0));
    if (!nominalIdr || nominalIdr <= 0) {
      return json({ success: false, error: "Nominal payment tidak valid." }, 400);
    }

    const paymentMetadata = {
      provider: "NOWPayments",
      paymentId,
      paymentStatus,
      payAmount: Number(data.pay_amount ?? body.payAmount ?? 0),
      actuallyPaid: Number(data.actually_paid ?? body.payAmount ?? 0),
      payCurrency: String(data.pay_currency || body.payCurrency || ""),
      payAddress: String(data.pay_address || body.payAddress || ""),
      network: String(data.network || body.network || ""),
      priceAmountIdr: nominalIdr,
      priceCurrency: String(data.price_currency || "IDR").toUpperCase(),
      updatedAt: new Date().toISOString(),
    };

    const result = await withDb(context.env, async (client) => {
      const existing = await client.query(
        `
        SELECT order_id AS "orderId", price, status
        FROM subscription_orders
        WHERE type = 'deposit'
          AND user_id = $1
          AND bank_details->>'paymentId' = $2
        LIMIT 1
        `,
        [userId, paymentId]
      );

      if (existing.rows.length > 0) {
        const order = existing.rows[0];

        await client.query(
          `
          UPDATE subscription_orders
          SET bank_details = $1::jsonb,
              tx_hash = COALESCE($2, tx_hash),
              notes = 'Pembayaran NOWPayments selesai. Menunggu approval Admin/Owner sebelum saldo dikreditkan.'
          WHERE order_id = $3
          `,
          [
            JSON.stringify(paymentMetadata),
            data.payin_hash || data.hash || data.tx_hash || body.txHash || null,
            order.orderId,
          ]
        );

        const balanceResult = await client.query(
          `SELECT COALESCE(balance, 0) AS balance FROM users WHERE id = $1 LIMIT 1`,
          [userId]
        );

        return {
          orderId: order.orderId,
          newBalance: Number(balanceResult.rows[0]?.balance || 0),
          alreadyPending: order.status === "pending",
        };
      }

      const orderId = String(data.order_id || `NOW-${paymentId}`);

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
          $6, $3, $7::jsonb,
          'Pembayaran NOWPayments selesai. Menunggu approval Admin/Owner sebelum saldo dikreditkan.',
          NOW()
        )
        ON CONFLICT (order_id) DO NOTHING
        `,
        [
          orderId,
          userId,
          String(auth.user.username || body.userName || "Host Streamer"),
          nominalIdr,
          String(auth.user.email || body.userEmail || ""),
          data.payin_hash || data.hash || data.tx_hash || body.txHash || null,
          JSON.stringify(paymentMetadata),
        ]
      );

      const balanceResult = await client.query(
        `SELECT COALESCE(balance, 0) AS balance FROM users WHERE id = $1 LIMIT 1`,
        [userId]
      );

      return {
        orderId,
        newBalance: Number(balanceResult.rows[0]?.balance || 0),
        alreadyPending: false,
      };
    });

    return json({
      success: true,
      status: "pending",
      message: "Pembayaran blockchain terkonfirmasi dan sedang menunggu approval Admin/Owner.",
      ...result,
    });
  } catch (error) {
    console.error("Finalize NOWPayments deposit error:", error);
    return json({ success: false, error: "Gagal mencatat deposit NOWPayments." }, 500);
  }
};
