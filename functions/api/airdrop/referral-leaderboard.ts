import { Env, json } from "../../_lib/db";

export async function onRequestGet({ env }: { env: Env }) {
  try {
    const rows = await env.DB.prepare(
      `SELECT u.id, u.username, u.display_name AS displayName,
              COUNT(r.id) AS referrals
       FROM users u
       LEFT JOIN referrals r
         ON r.referrer_user_id = u.id
        AND r.status = 'ACTIVE'
       GROUP BY u.id, u.username, u.display_name
       HAVING COUNT(r.id) > 0
       ORDER BY referrals DESC, u.created_at ASC
       LIMIT 50`
    ).all();

    return json({
      success: true,
      updatedAt: Math.floor(Date.now() / 1000),
      leaderboard: (rows.results || []).map((row: any, index: number) => ({
        rank: index + 1,
        username: String(row.username || row.displayName || "User"),
        referrals: Number(row.referrals || 0),
      })),
    });
  } catch (error) {
    console.error("airdrop referral leaderboard error", error);
    return json({ success: false, error: "Referral leaderboard unavailable." }, 500);
  }
}
