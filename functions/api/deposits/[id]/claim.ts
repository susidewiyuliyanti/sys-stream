import { Env, json, withDb } from "../../../_lib/db";
import { requireAuth } from "../../../_lib/auth";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env);

    if (auth.ok === false) {
      return auth.response;
    }

    const userId = String(auth.user.id);
    const depositId = Number(context.params.id);

    if (!Number.isInteger(depositId) || depositId <= 0) {
      return json(
        {
          success: false,
          message: "ID deposit tidak valid.",
        },
        400
      );
    }

    const result = await withDb(context.env, async (client) => {
      await client.query("BEGIN");

      try {
        const depositResult = await client.query(
          `
          SELECT
            id,
            user_id,
            amount,
            duration_days,
            start_date AS "startDate",
            end_date AS "endDate",
            status,
            total_claimed,
            force_jackpot
          FROM deposits
          WHERE id = $1
            AND user_id = $2
          FOR UPDATE
          `,
          [depositId, userId]
        );

        if (depositResult.rows.length === 0) throw new Error("DEPOSIT_NOT_FOUND");
        const deposit = depositResult.rows[0];

        if (deposit.status !== "ACTIVE") throw new Error("DEPOSIT_NOT_ACTIVE");

        const now = new Date();
        const startDate = new Date(deposit.startDate);
        const endDate = new Date(deposit.endDate);

        if (now < startDate) throw new Error("DEPOSIT_NOT_STARTED");
        if (now > endDate) throw new Error("DEPOSIT_EXPIRED");

        const wibNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
        const claimDate = wibNow.toISOString().slice(0, 10);

        const existingClaim = await client.query(
          `
          SELECT id
          FROM blind_box_claims
          WHERE deposit_id = $1
            AND claim_date = $2
          LIMIT 1
          `,
          [depositId, claimDate]
        );

        if (existingClaim.rows.length > 0) throw new Error("ALREADY_CLAIMED");

        // Blind Box reward is deterministic and based on the locked principal:
        // 20% per 30-day month, paid once per WIB day.
        // Daily rate = 20% / 30 = 0.666666...% of the locked amount.
        // This applies to every valid lock amount, starting from the $4 minimum.
        const MONTHLY_RATE = 0.20;
        const DAYS_PER_MONTH = 30;
        const dailyRate = MONTHLY_RATE / DAYS_PER_MONTH;
        const reward = Number((Number(deposit.amount) * dailyRate).toFixed(2));
        const isJackpot = false;

        await client.query(
          `
          INSERT INTO blind_box_claims (
            deposit_id,
            user_id,
            claim_date,
            amount,
            is_jackpot,
            claimed_at
          )
          VALUES ($1, $2, $3, $4, $5, NOW())
          `,
          [depositId, userId, claimDate, reward, isJackpot]
        );

        await client.query(
          `
          UPDATE deposits
          SET total_claimed = total_claimed + $1
          WHERE id = $2
          `,
          [reward, depositId]
        );

        const updatedDeposit = await client.query(
          `
          SELECT total_claimed AS "totalClaimed"
          FROM deposits
          WHERE id = $1
          LIMIT 1
          `,
          [depositId]
        );

        await client.query("COMMIT");

        return {
          reward,
          isJackpot,
          claimDate,
          claimId: Number(
            (
              await client.query(
                `SELECT id FROM blind_box_claims WHERE deposit_id = $1 AND claim_date = $2 LIMIT 1`,
                [depositId, claimDate]
              )
            ).rows[0]?.id ?? 0
          ),
          totalClaimed: Number(updatedDeposit.rows[0]?.totalClaimed ?? reward),
          balance: null,
        };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    });

    return json({
      success: true,
      message: result.isJackpot ? "Reward dicatat di history Blind Box dan akan masuk saldo setelah lock selesai." : "Reward dicatat di history Blind Box dan akan masuk saldo setelah lock selesai.",
      ...result,
    });
  } catch (error) {
    console.error("Claim deposit error:", error);

    const message = error instanceof Error ? error.message : "";
    const errors: Record<string, [string, number]> = {
      DEPOSIT_NOT_FOUND: ["Deposit tidak ditemukan.", 404],
      DEPOSIT_NOT_ACTIVE: ["Deposit tidak aktif.", 400],
      DEPOSIT_NOT_STARTED: ["Deposit belum dimulai.", 400],
      DEPOSIT_EXPIRED: ["Deposit sudah berakhir.", 400],
      ALREADY_CLAIMED: ["Deposit sudah di-claim hari ini.", 400],
    };

    if (errors[message]) {
      const [text, status] = errors[message];
      return json({ success: false, message: text }, status);
    }

    return json({ success: false, message: "Gagal melakukan claim." }, 500);
  }
};
