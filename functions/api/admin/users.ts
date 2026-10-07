import { Env, json } from "../../_lib/db";
import { requireAdmin } from "../../_lib/admin";
import { idrToUsdt } from "../../_lib/bonuses";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;

  try {
    const result = await context.env.DB.prepare(`
      SELECT
        CAST(id AS TEXT) AS id,
        COALESCE(username,'') AS username,
        COALESCE(email,'') AS email,
        COALESCE(wallet_address,'') AS walletAddress,
        COALESCE(available_balance,0) AS availableBalance,
        COALESCE(total_locked,0) AS lockedBalance,
        COALESCE(sys_balance,0) AS sysBalance,
        COALESCE(role,'USER') AS role,
        created_at AS createdAt
      FROM users
      ORDER BY created_at DESC, id DESC
      LIMIT 500
    `).all();

    return json({
      success: true,
      users: (result.results || []).map((u:any) => ({
        ...u,
        id: String(u.id ?? ''),
        username: String(u.username ?? ''),
        email: String(u.email ?? ''),
        walletAddress: String(u.walletAddress ?? ''),
        availableBalance: idrToUsdt(Number(u.availableBalance ?? 0)),
        lockedBalance: idrToUsdt(Number(u.lockedBalance ?? 0)),
        sysBalance: Number(u.sysBalance ?? 0),
        role: String(u.role ?? 'USER'),
        createdAt: u.createdAt ?? null
      }))
    });
  } catch (error) {
    return json({
      success: false,
      error: "Failed to load users.",
      detail: String(error)
    }, 500);
  }
};
