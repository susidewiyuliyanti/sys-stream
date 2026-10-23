import { Env, json, withDb } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

/**
 * Claim the current user's active Blind Box lock without first loading the full
 * /api/deposits response. The mobile wallet browser should not have to execute
 * optional deposit-history/mining queries before it can claim.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env);
    if (auth.ok === false) return auth.response;

    const userId = String(auth.user.id);
    const result = await withDb(context.env, async (client) => {
      await client.query("BEGIN");
      try {
        const activeResult = await client.query(
          `SELECT id, user_id, amount, duration_days,
                  start_date AS "startDate", end_date AS "endDate",
                  status, total_claimed AS "totalClaimed"
           FROM deposits
           WHERE user_id = $1
             AND UPPER(TRIM(COALESCE(status, ''))) IN ('ACTIVE', 'LOCKED')
           ORDER BY created_at DESC
           LIMIT 1`,
          [userId]
        );
        if (!activeResult.rows.length) throw new Error("ACTIVE_DEPOSIT_NOT_FOUND");
        const deposit = activeResult.rows[0];
        const depositId = Number(deposit.id);

        const now = new Date();
        const startDate = new Date(deposit.startDate);
        const endDate = new Date(deposit.endDate);
        if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime())) {
          throw new Error("DEPOSIT_DATES_INVALID");
        }
        if (now < startDate) throw new Error("DEPOSIT_NOT_STARTED");
        if (now > endDate) throw new Error("DEPOSIT_EXPIRED");

        const wibNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
        const claimDate = wibNow.toISOString().slice(0, 10);
        const existingClaim = await client.query(
          `SELECT id FROM blind_box_claims
           WHERE deposit_id = $1 AND claim_date = $2
           LIMIT 1`,
          [depositId, claimDate]
        );
        if (existingClaim.rows.length) throw new Error("ALREADY_CLAIMED");

        // Preserve the current reward rule: 20% per 30-day month, recorded
        // in claim history and not added to available balance until lock ends.
        const reward = Number((Number(deposit.amount) * (0.20 / 30)).toFixed(2));
        const isJackpot = false;
        await client.query(
          `INSERT INTO blind_box_claims
             (deposit_id, user_id, claim_date, amount, is_jackpot, claimed_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [depositId, userId, claimDate, reward, isJackpot]
        );
        await client.query(
          `UPDATE deposits SET total_claimed = COALESCE(total_claimed, 0) + $1 WHERE id = $2 AND user_id = $3`,
          [reward, depositId, userId]
        );
        const claimRow = await client.query(
          `SELECT id FROM blind_box_claims WHERE deposit_id = $1 AND claim_date = $2 LIMIT 1`,
          [depositId, claimDate]
        );
        const updated = await client.query(
          `SELECT total_claimed AS "totalClaimed" FROM deposits WHERE id = $1 AND user_id = $2 LIMIT 1`,
          [depositId, userId]
        );
        await client.query("COMMIT");
        return {
          reward,
          isJackpot,
          claimDate,
          claimId: Number(claimRow.rows[0]?.id ?? 0),
          totalClaimed: Number(updated.rows[0]?.totalClaimed ?? reward),
          balance: null,
        };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    });

    return json({
      success: true,
      message: "Reward Blind Box tercatat di history dan dapat di-claim setelah masa lock selesai.",
      ...result,
    });
  } catch (error) {
    console.error("Claim active deposit error:", error);
    const message = error instanceof Error ? error.message : "";
    const errors: Record<string, [string, number]> = {
      ACTIVE_DEPOSIT_NOT_FOUND: ["Tidak ada lock Blind Box yang aktif.", 404],
      DEPOSIT_DATES_INVALID: ["Tanggal lock tidak valid. Hubungi support untuk pemeriksaan.", 500],
      DEPOSIT_NOT_STARTED: ["Deposit belum dimulai.", 400],
      DEPOSIT_EXPIRED: ["Deposit sudah berakhir.", 400],
      ALREADY_CLAIMED: ["Deposit sudah di-claim hari ini.", 400],
    };
    if (errors[message]) {
      const [text, status] = errors[message];
      return json({ success: false, message: text }, status);
    }
    return json({ success: false, message: "Server gagal memproses claim Blind Box." }, 500);
  }
};
