import { Env, json, readJson, withDb } from "../../_lib/db";
import { requireAuth, isAdminRole } from "../../_lib/auth";

interface ApproveRequest {
  orderId?: string;
  approverEmail?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env);
    if (!auth.ok) return auth.response;
    if (!isAdminRole(auth.user.role)) return json({ success: false, error: "Admin/Owner authorization required." }, 403);

    const body = await readJson<ApproveRequest>(context.request);
    const orderId = String(body.orderId || "").trim();
    if (!orderId) return json({ success: false, error: "Order ID wajib diisi." }, 400);

    const result = await withDb(context.env, async (client) => {
      await client.query("BEGIN");
      try {
        const orderResult = await client.query(
          `
          SELECT id, order_id AS "orderId", user_id AS "userId", price, status, bank_details
          FROM subscription_orders
          WHERE order_id = $1 AND type = 'deposit'
          FOR UPDATE
          `,
          [orderId]
        );

        if (orderResult.rows.length === 0) throw new Error("ORDER_NOT_FOUND");
        const order = orderResult.rows[0];
        if (order.status !== "pending") throw new Error("ORDER_NOT_PENDING");

        const metadata = order.bank_details || {};
        const paymentStatus = String(metadata.paymentStatus || "").toLowerCase();
        if (!["finished", "confirmed"].includes(paymentStatus)) {
          throw new Error("PAYMENT_NOT_CONFIRMED");
        }

        const userResult = await client.query(
          `
          SELECT id,
                 COALESCE(balance, 0) AS balance,
                 COALESCE(saldo, 0) AS saldo,
                 COALESCE(wallet_balance, 0) AS wallet_balance
          FROM users
          WHERE id = $1
          FOR UPDATE
          `,
          [order.userId]
        );
        if (userResult.rows.length === 0) throw new Error("USER_NOT_FOUND");

        const user = userResult.rows[0];
        const currentBalance = Math.max(
          Number(user.balance || 0),
          Number(user.saldo || 0),
          Number(user.wallet_balance || 0)
        );
        const newBalance = currentBalance + Number(order.price || 0);

        await client.query(
          `
          UPDATE users
          SET balance = $1, saldo = $1, wallet_balance = $1, updated_at = NOW()
          WHERE id = $2
          `,
          [newBalance, order.userId]
        );

        await client.query(
          `
          UPDATE subscription_orders
          SET status = 'success',
              approved_by = $1,
              approved_at = NOW(),
              notes = 'Deposit NOWPayments diverifikasi dan saldo telah dikreditkan oleh Admin/Owner.'
          WHERE id = $2
          `,
          [body.approverEmail || auth.user.email, order.id]
        );

        await client.query("COMMIT");
        return {
          orderId: order.orderId,
          newTargetBalance: newBalance,
          newBalance,
          amount: Number(order.price || 0),
        };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    });

    return json({ success: true, ...result });
  } catch (error) {
    console.error("Approve deposit error:", error);
    if (error instanceof Error) {
      if (error.message === "ORDER_NOT_FOUND") return json({ success: false, error: "Deposit tidak ditemukan." }, 404);
      if (error.message === "ORDER_NOT_PENDING") return json({ success: false, error: "Deposit sudah diproses sebelumnya." }, 409);
      if (error.message === "PAYMENT_NOT_CONFIRMED") return json({ success: false, error: "Pembayaran NOWPayments belum berstatus finished/confirmed." }, 400);
      if (error.message === "USER_NOT_FOUND") return json({ success: false, error: "User tidak ditemukan." }, 404);
    }
    return json({ success: false, error: "Gagal menyetujui deposit." }, 500);
  }
};
