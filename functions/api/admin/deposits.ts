import { Env, json } from "../../_lib/db";
import { requireAdmin } from "../../_lib/admin";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;
  try {
    const result = await context.env.DB.prepare(`
      SELECT d.id, d.deposit_code AS depositCode, d.user_id AS userId,
             u.username, d.amount, d.duration_days AS durationDays,
             d.status, d.created_at AS createdAt
      FROM deposits d
      LEFT JOIN users u ON u.id = d.user_id
      ORDER BY d.created_at DESC
      LIMIT 500
    `).all();
    return json({success:true,deposits:result.results || []});
  } catch {
    return json({success:false,error:"Failed to load deposits."},500);
  }
};
