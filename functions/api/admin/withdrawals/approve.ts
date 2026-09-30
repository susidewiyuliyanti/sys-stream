import { Env, json, readJson, withDb } from "../../_lib/db";
import { requireAuth, isAdminRole } from "../../_lib/auth";

interface ApproveRequest {
  orderId?: string;
  approverEmail?: string;
  payoutTxHash?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env);
    if (!auth.ok) return auth.response;
    if (!isAdminRole(auth.user.role)) {
      return json({ success: false, error: "Admin/Owner authorization required." }, 403);
    }

    const body = await readJson<ApproveRequest>(context.request);
    const orderId = String(body.orderId || "").trim();
    const payoutTxHash = String(body.payoutTxHash || "").trim();
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

        await client.query(
          `
          UPDATE subscription_orders
          SET status = 'success',
              approved_by = $1,
              approved_at = NOW(),
              tx_hash = NULLIF($2, ''),
              notes = COALESCE(notes, '') || ' Payout disetujui Admin/Owner.'
          WHERE id = $3
          `,
          [body.approverEmail || auth.user.email, payoutTxHash, order.id]
        );

        await client.query("COMMIT");
        return { orderId: order.orderId, amount: Number(order.price || 0) };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    });

    return json({ success: true, message: "Withdrawal disetujui. Dana dapat diproses ke wallet tujuan.", ...result });
  } catch (error) {
    console.error("Approve withdrawal error:", error);
    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
      return json({ success: false, error: "Pengajuan withdrawal tidak ditemukan." }, 404);
    }
    if (error instanceof Error && error.message === "ORDER_NOT_PENDING") {
      return json({ success: false, error: "Pengajuan withdrawal sudah diproses sebelumnya." }, 409);
    }
    return json({ success: false, error: "Gagal menyetujui withdrawal." }, 500);
  }
};
