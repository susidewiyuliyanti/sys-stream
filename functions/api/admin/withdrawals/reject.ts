import { Env, json, readJson, withDb } from "../../_lib/db";
import { requireAuth, isAdminRole } from "../../_lib/auth";

interface RejectRequest {
  orderId?: string;
  rejectorEmail?: string;
  reason?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env);
    if (!auth.ok) return auth.response;
    if (!isAdminRole(auth.user.role)) {
      return json({ success: false, error: "Admin/Owner authorization required." }, 403);
    }

    const body = await readJson<RejectRequest>(context.request);
    const orderId = String(body.orderId || "").trim();
    const reason = String(body.reason || "Rejected by Admin/Owner").trim();
    if (!orderId) return json({ success: false, error: "Order ID wajib diisi." }, 400);

    const result = await withDb(context.env, async (client) => {
      await client.query("BEGIN");
      try {
        const orderResult = await client.query(
          `
          SELECT id, order_id AS "orderId", user_id AS "userId", price, status
          FROM subscription_orders
          WHERE order_id = $1 AND type = 'withdrawal'
          FOR UPDATE
          `,
          [orderId]
        );
        if (orderResult.rows.length === 0) throw new Error("ORDER_NOT_FOUND");

        const order = orderResult.rows[0];
        if (order.status !== "pending") throw new Error("ORDER_NOT_PENDING");

        const refundAmount = Number(order.price || 0);
        const userResult = await client.query(
          `
          SELECT id,
                 COALESCE(balance, 0) AS balance,
                 COALESCE(saldo, 0) AS saldo,
                 COALESCE("walletBalance", 0) AS "walletBalance"
          FROM users WHERE id = $1 FOR UPDATE
          `,
          [order.userId]
        );
        if (userResult.rows.length === 0) throw new Error("USER_NOT_FOUND");

        const user = userResult.rows[0];
        const currentBalance = Math.max(
          Number(user.balance || 0),
          Number(user.saldo || 0),
          Number(user.walletBalance || 0)
        );
        const restoredBalance = currentBalance + refundAmount;

        await client.query(
          `
          UPDATE users
          SET balance = $1, saldo = $1, "walletBalance" = $1, updated_at = NOW()
          WHERE id = $2
          `,
          [restoredBalance, order.userId]
        );

        await client.query(
          `
          UPDATE subscription_orders
          SET status = 'failed',
              rejected_by = $1,
              rejected_at = NOW(),
              rejection_reason = $2,
              notes = COALESCE(notes, '') || ' Dana reservation dikembalikan ke saldo user.'
          WHERE id = $3
          `,
          [body.rejectorEmail || auth.user.email, reason, order.id]
        );

        await client.query("COMMIT");
        return { orderId: order.orderId, refundAmount, restoredBalance };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    });

    return json({
      success: true,
      message: "Withdrawal ditolak dan saldo yang di-reserve telah dikembalikan.",
      ...result
    });
  } catch (error) {
    console.error("Reject withdrawal error:", error);
    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
      return json({ success: false, error: "Pengajuan withdrawal tidak ditemukan." }, 404);
    }
    if (error instanceof Error && error.message === "ORDER_NOT_PENDING") {
      return json({ success: false, error: "Pengajuan withdrawal sudah diproses sebelumnya." }, 409);
    }
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return json({ success: false, error: "User tidak ditemukan saat refund." }, 404);
    }
    return json({ success: false, error: "Gagal menolak withdrawal." }, 500);
  }
};
