import { Env, json, withDb } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env);
    if (!auth.ok) return auth.response;

    const userId = String(auth.user.id);

    const result = await withDb(context.env, async (client) => {
      await client.query("BEGIN");
      try {
        const pendingResult = await client.query(
          `SELECT
             c.id,
             c.amount,
             d.end_date AS "endDate"
           FROM blind_box_claims c
           INNER JOIN deposits d ON d.id = c.deposit_id
           WHERE c.user_id = $1
             AND c.paid_at IS NULL
           ORDER BY c.claimed_at ASC
           FOR UPDATE`,
          [userId]
        );

        if (pendingResult.rows.length === 0) throw new Error("NO_PENDING_REWARDS");

        const latestEndDate = pendingResult.rows.reduce((latest: number, row: any) => {
          const time = new Date(row.endDate).getTime();
          return Number.isFinite(time) ? Math.max(latest, time) : latest;
        }, 0);

        if (!latestEndDate || Date.now() < latestEndDate) {
          throw new Error("REWARD_LOCKED");
        }

        const totalReward = Number(
          pendingResult.rows.reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0).toFixed(2)
        );
        if (totalReward <= 0) throw new Error("NO_PENDING_REWARDS");

        const userResult = await client.query(
          `SELECT COALESCE(available_balance, 0) AS "availableBalance"
           FROM users
           WHERE id = $1
           FOR UPDATE`,
          [userId]
        );
        if (userResult.rows.length === 0) throw new Error("USER_NOT_FOUND");

        const newAvailableBalance = Number(userResult.rows[0].availableBalance || 0) + totalReward;

        await client.query(
          `UPDATE users
           SET available_balance = $1,
               balance = $1
           WHERE id = $2`,
          [newAvailableBalance, userId]
        );

        const claimIds = pendingResult.rows.map((row: any) => Number(row.id));
        const placeholders = claimIds.map((_: number, index: number) => `$${index + 1}`).join(", ");
        await client.query(
          `UPDATE blind_box_claims
           SET paid_at = CURRENT_TIMESTAMP
           WHERE id IN (${placeholders}) AND user_id = $${claimIds.length + 1}`,
          [...claimIds, userId]
        );

        await client.query("COMMIT");

        return {
          totalReward,
          claimCount: claimIds.length,
          balance: newAvailableBalance,
        };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    });

    return json({
      success: true,
      message: "Blind Box rewards successfully claimed.",
      ...result,
    });
  } catch (error) {
    console.error("Claim Blind Box rewards error:", error);
    const message = error instanceof Error ? error.message : "";
    const errors: Record<string, [string, number]> = {
      NO_PENDING_REWARDS: ["Tidak ada reward Blind Box yang menunggu claim.", 400],
      REWARD_LOCKED: ["Reward Blind Box masih terkunci sampai masa lock selesai.", 400],
      USER_NOT_FOUND: ["User tidak ditemukan.", 404],
    };
    if (errors[message]) {
      const [errorText, status] = errors[message];
      return json({ success: false, error: errorText }, status);
    }
    return json({ success: false, error: "Gagal melakukan claim reward Blind Box." }, 500);
  }
};
