import { Env, json } from "../../_lib/db";
import { requireAdmin } from "../../_lib/admin";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;
  try {
    const result = await context.env.DB.prepare(`
      SELECT id, username, email, COALESCE(available_balance,0) AS balance,
             COALESCE(total_locked,0) AS lockedBalance, COALESCE(role,'user') AS role,
             created_at AS createdAt
      FROM users
      ORDER BY created_at DESC
      LIMIT 500
    `).all();
    return json({success:true,users:result.results || []});
  } catch {
    return json({success:false,error:"Failed to load users."},500);
  }
};
