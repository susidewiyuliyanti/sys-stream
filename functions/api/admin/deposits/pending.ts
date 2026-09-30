import { Env, json, withDb } from "../../_lib/db";
import { requireAuth, isAdminRole } from "../../_lib/auth";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env);
    if (!auth.ok) return auth.response;
    if (!isAdminRole(auth.user.role)) return json({ success: false, error: "Admin/Owner authorization required." }, 403);

    const deposits = await withDb(context.env, async (client) => {
      const result = await client.query(
        `
        SELECT
          id,
          order_id AS "orderId",
          user_id AS "userId",
          user_email AS "userEmail",
          user_name AS "userName",
          nama,
          price,
          currency,
          status,
          payment_method AS "paymentMethod",
          type,
          tx_hash AS "txHash",
          bank_details AS "payment",
          notes,
          created_at AS "createdAt"
        FROM subscription_orders
        WHERE type = 'deposit'
          AND status = 'pending'
        ORDER BY created_at ASC
        `
      );
      return result.rows;
    });

    return json({ success: true, deposits });
  } catch (error) {
    console.error("Pending deposits error:", error);
    return json({ success: false, error: "Gagal mengambil pending deposits." }, 500);
  }
};
