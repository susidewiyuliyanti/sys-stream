import { Env, json, readJson, withDb } from "../../_lib/db";
import { requireAuth, isAdminRole } from "../../_lib/auth";

interface RejectRequest {
  orderId?: string;
  rejecterEmail?: string;
  reason?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env);
    if (!auth.ok) return auth.response;
    if (!isAdminRole(auth.user.role)) return json({ success: false, error: "Admin/Owner authorization required." }, 403);

    const body = await readJson<RejectRequest>(context.request);
    const orderId = String(body.orderId || "").trim();
    const reason = String(body.reason || "Transaction verification invalid or funds not received").trim();
    if (!orderId) return json({ success: false, error: "Order ID wajib diisi." }, 400);

    const result = await withDb(context.env, async (client) => {
      const updated = await client.query(
        `
        UPDATE subscription_orders
        SET status = 'failed',
            rejected_by = $1,
            rejected_at = NOW(),
            rejection_reason = $2,
            notes = 'Deposit NOWPayments ditolak oleh Admin/Owner.'
        WHERE order_id = $3
          AND type = 'deposit'
          AND status = 'pending'
        RETURNING order_id AS "orderId"
        `,
        [body.rejecterEmail || auth.user.email, reason, orderId]
      );

      if (updated.rows.length === 0) throw new Error("ORDER_NOT_PENDING");
      return updated.rows[0];
    });

    return json({ success: true, message: "Deposit ditolak.", ...result });
  } catch (error) {
    console.error("Reject deposit error:", error);
    if (error instanceof Error && error.message === "ORDER_NOT_PENDING") {
      return json({ success: false, error: "Deposit tidak ditemukan atau sudah diproses." }, 409);
    }
    return json({ success: false, error: "Gagal menolak deposit." }, 500);
  }
};
