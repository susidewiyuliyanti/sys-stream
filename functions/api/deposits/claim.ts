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
        // Match the legacy-lock reconciliation performed by GET /api/deposits.
        // Claim must not reject a valid locked principal merely because its
        // deposit row was left COMPLETED by an older schema/workflow.
        const minBlindBoxLockIdr = Math.round(4 * 17937);
        const lockedResult = await client.query(
          `SELECT COALESCE(total_locked, 0) AS "totalLocked"
           FROM users WHERE id = $1 LIMIT 1`,
          [userId]
        );
        const totalLocked = Number(lockedResult.rows[0]?.totalLocked ?? 0);
        const countResult = await client.query(
          `SELECT COUNT(*) AS count FROM deposits WHERE user_id = $1`,
          [userId]
        );
        const depositCount = Number(countResult.rows[0]?.count ?? 0);

        if (depositCount === 0 && totalLocked >= minBlindBoxLockIdr) {
          const recoveryStart = new Date();
          const recoveryEnd = new Date(recoveryStart);
          recoveryEnd.setDate(recoveryEnd.getDate() + 30);
          await client.query(
            `INSERT INTO deposits (
               deposit_code, user_id, amount, duration_days, start_date, end_date,
               status, total_claimed, force_jackpot, created_at
             ) VALUES ($1, $2, $3, 30, $4, $5, 'ACTIVE', 0, false, NOW())`,
            [
              `DEP-${crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`,
              userId,
              totalLocked,
              recoveryStart,
              recoveryEnd,
            ]
          );
        }

        let activeResult = await client.query(
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

        if (!activeResult.rows.length && totalLocked >= minBlindBoxLockIdr) {
          await client.query(
            `UPDATE deposits
             SET status = 'ACTIVE'
             WHERE id = (
               SELECT id FROM deposits
               WHERE user_id = $1
                 AND UPPER(TRIM(COALESCE(status, ''))) = 'COMPLETED'
                 AND amount >= $2
                 AND amount <= $3
                 AND datetime(end_date) > datetime('now')
               ORDER BY created_at DESC
               LIMIT 1
             )`,
            [userId, minBlindBoxLockIdr, totalLocked]
          );
          activeResult = await client.query(
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
        }

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
