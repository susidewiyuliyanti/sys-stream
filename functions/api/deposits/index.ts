import { Env, json, readJson, withDb } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

const MIN_MINING_LOCK_IDR = 10 * 17937;
import { notifyAdmins } from "../../_lib/admin-notifications";
import { syncMiningForUser } from "../mining";

const MIN_BLINDBOX_LOCK_USD = 4;
const USD_TO_IDR = 17937;
const MIN_BLINDBOX_LOCK_IDR = Math.round(MIN_BLINDBOX_LOCK_USD * USD_TO_IDR);

interface DepositRequest {
  amount?: number;
  durationDays?: number;
}

function generateDepositCode(): string {
  const random = crypto.randomUUID()
    .replace(/-/g, "")
    .slice(0, 12)
    .toUpperCase();

  return `DEP-${random}`;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env);

    if (auth.ok === false) {
      return auth.response;
    }

    const userId = String(auth.user.id);

    // Mining reconciliation is auxiliary to deposit reads. If its schema or
    // accounting path temporarily fails, do not block Daily Box claims on mobile
    // (or desktop) from loading the user's authoritative deposit rows.
    try {
      await syncMiningForUser(context.env, userId);
    } catch (miningError) {
      console.error("Deposit read: mining reconciliation failed; continuing:", miningError);
    }

    const data = await withDb(context.env, async (client) => {
      // Recover legacy locks whose principal is still in users.total_locked but whose deposits row is missing.
      const existingCount = await client.query(`SELECT COUNT(*) AS count FROM deposits WHERE user_id = $1`, [userId]);
      const existingDepositCount = Number(existingCount.rows[0]?.count ?? 0);

      const lockedResult = await client.query(`SELECT COALESCE(total_locked, 0) AS "totalLocked" FROM users WHERE id = $1 LIMIT 1`, [userId]);
      const totalLocked = Number(lockedResult.rows[0]?.totalLocked ?? 0);

      if (existingDepositCount === 0) {
        // Legacy recovery: only create a row when no deposit history exists at all.
        // This preserves the existing principal instead of asking the user to lock again.
        if (totalLocked >= MIN_BLINDBOX_LOCK_IDR) {
          const recoveryStart = new Date();
          const recoveryEnd = new Date(recoveryStart);
          recoveryEnd.setDate(recoveryEnd.getDate() + 30);
          await client.query(`
            INSERT INTO deposits (
              deposit_code, user_id, amount, duration_days, start_date, end_date,
              status, total_claimed, force_jackpot, created_at
            ) VALUES ($1, $2, $3, 30, $4, $5, 'ACTIVE', 0, false, NOW())
          `, [generateDepositCode(), userId, totalLocked, recoveryStart.toISOString(), recoveryEnd.toISOString()]);
        }
      } else {
        // Repair the specific legacy inconsistency found in production: a deposit is
        // marked COMPLETED even though its recorded lock period has not ended and
        // the user's canonical total_locked still covers that deposit principal.
        // Never modify balances or create a second deposit in this branch.
        const activeCount = await client.query(
          `SELECT COUNT(*) AS count FROM deposits
           WHERE user_id = $1 AND UPPER(TRIM(COALESCE(status, ''))) IN ('ACTIVE', 'LOCKED')`,
          [userId]
        );
        if (Number(activeCount.rows[0]?.count ?? 0) === 0 && totalLocked >= MIN_BLINDBOX_LOCK_IDR) {
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
            [userId, MIN_BLINDBOX_LOCK_IDR, totalLocked]
          );
        }
      }

      const depositsResult = await client.query(
        `
        SELECT
          id,
          deposit_code AS "depositCode",
          amount,
          duration_days AS "durationDays",
          start_date AS "startDate",
          end_date AS "endDate",
          status,
          total_claimed AS "totalClaimed",
          force_jackpot AS "forceJackpot",
          created_at AS "createdAt"
        FROM deposits
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [userId]
      );

      const deposits = depositsResult.rows;
      const activeDeposit = deposits.find((deposit) => ["ACTIVE", "LOCKED"].includes(String(deposit.status ?? "").trim().toUpperCase())) ?? null;
      const wibNow = new Date(Date.now() + 7 * 60 * 60 * 1000);
      const today = wibNow.toISOString().slice(0, 10);

      let hasClaimedToday = false;
      let todayClaimData = null;

      if (activeDeposit) {
        try {
          const todayClaim = await client.query(
            `
            SELECT
              id,
              deposit_id AS "depositId",
              user_id AS "userId",
              claim_date AS "claimDate",
              amount,
              is_jackpot AS "isJackpot",
              claimed_at AS "claimedAt"
            FROM blind_box_claims
            WHERE deposit_id = $1
              AND claim_date = $2
            LIMIT 1
            `,
            [activeDeposit.id, today]
          );

          hasClaimedToday = todayClaim.rows.length > 0;
          todayClaimData = todayClaim.rows[0] ?? null;
        } catch (claimStatusError) {
          // Claim-status metadata must not block the authoritative deposit list.
          // The claim POST endpoint still enforces one claim per WIB day.
          console.error("Deposit read: today's claim metadata unavailable:", claimStatusError);
        }
      }

      // Some production D1 databases were created before paid_at was added to
      // blind_box_claims. Detect the column instead of failing the entire deposit
      // endpoint (which also feeds the mobile Blind Box screen).
      const claimColumnsResult = await client.query(`PRAGMA table_info(blind_box_claims)`);
      const claimColumnNames = new Set(claimColumnsResult.rows.map((column) => String(column.name)));
      const hasPaidAt = claimColumnNames.has("paid_at");
      const paidAtSelect = hasPaidAt ? 'c.paid_at AS "paidAt"' : 'NULL AS "paidAt"';
      const pendingRewardExpression = hasPaidAt
        ? 'COALESCE(SUM(CASE WHEN c.paid_at IS NULL THEN c.amount ELSE 0 END), 0)'
        : 'COALESCE(SUM(c.amount), 0)';
      const rewardAvailableExpression = hasPaidAt
        ? 'MAX(CASE WHEN c.paid_at IS NULL THEN d.end_date ELSE NULL END)'
        : 'MAX(d.end_date)';

      let recentClaims: any[] = [];
      let pendingReward = 0;
      let rewardClaimAvailableAt: unknown = null;

      try {
        const claimsResult = await client.query(
          `
          SELECT
            c.id,
            c.deposit_id AS "depositId",
            c.user_id AS "userId",
            c.claim_date AS "claimDate",
            c.amount,
            c.is_jackpot AS "isJackpot",
            c.claimed_at AS "claimedAt",
            ${paidAtSelect}
          FROM blind_box_claims c
          INNER JOIN deposits d ON d.id = c.deposit_id
          WHERE d.user_id = $1
          ORDER BY c.claimed_at DESC
          LIMIT 20
          `,
          [userId]
        );
        recentClaims = claimsResult.rows;
      } catch (claimsError) {
        // Historical claim rows are supplementary UI data, not a prerequisite
        // for loading the user's current lock.
        console.error("Deposit read: recent claim history unavailable:", claimsError);
      }

      try {
        const pendingRewardResult = await client.query(
          `
          SELECT
            ${pendingRewardExpression} AS "pendingReward",
            ${rewardAvailableExpression} AS "rewardClaimAvailableAt"
          FROM blind_box_claims c
          INNER JOIN deposits d ON d.id = c.deposit_id
          WHERE c.user_id = $1
          `,
          [userId]
        );
        pendingReward = Number(pendingRewardResult.rows[0]?.pendingReward ?? 0);
        rewardClaimAvailableAt = pendingRewardResult.rows[0]?.rewardClaimAvailableAt ?? null;
      } catch (pendingRewardError) {
        console.error("Deposit read: pending reward summary unavailable:", pendingRewardError);
      }
      // Game settings are optional for the deposit/claim flow. A missing or
      // older game_settings schema must not turn a valid deposit read into HTTP 500.
      let settings: Record<string, unknown> | null = null;
      try {
        const settingsResult = await client.query(
          `
          SELECT
            id,
            "minBox",
            "maxBox",
            "jackpotAmount",
            "jackpotChance"
          FROM game_settings
          ORDER BY id DESC
          LIMIT 1
          `
        );
        settings = settingsResult.rows[0] ?? null;
      } catch (settingsError) {
        console.error("Deposit read: optional game_settings query failed:", settingsError);
      }

      return {
        deposits,
        activeDeposit,
        hasClaimedToday,
        todayClaimData,
        recentClaims,
        pendingReward,
        rewardClaimAvailableAt,
        settings,
      };
    });

    const now = new Date();
    const wibNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const nextResetWib = new Date(
      Date.UTC(
        wibNow.getUTCFullYear(),
        wibNow.getUTCMonth(),
        wibNow.getUTCDate() + 1,
        0,
        0,
        0
      )
    );
    const countdownMs = Math.max(0, nextResetWib.getTime() - wibNow.getTime());
    const hours = Math.floor(countdownMs / 3600000);
    const minutes = Math.floor((countdownMs % 3600000) / 60000);
    const seconds = Math.floor((countdownMs % 60000) / 1000);

    return json({
      success: true,
      ...data,
      wibTime: {
        dateStr: wibNow.toISOString().slice(0, 10),
        countdownFormatted: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      },
    });

  } catch (error) {
    console.error("Get deposits error:", error);

    return json(
      {
        success: false,
        message: "Gagal mengambil data deposit.",
      },
      500
    );
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env);

    if (auth.ok === false) {
      return auth.response;
    }

    const body = await readJson<DepositRequest>(context.request);
    const amount = Number(body.amount);
    const durationDays = Number(body.durationDays);

    if (!Number.isInteger(amount) || amount < MIN_BLINDBOX_LOCK_IDR) {
      return json(
        {
          success: false,
          error: "Nominal lock minimal setara $4 USD. Anda dapat menentukan nominal lock sendiri selama tidak melebihi Available Balance.",
        },
        400
      );
    }

    if (![30, 60, 90].includes(durationDays)) {
      return json(
        {
          success: false,
          error: "Durasi lock harus 30, 60, atau 90 hari.",
        },
        400
      );
    }

    const userId = String(auth.user.id);

    const result = await withDb(context.env, async (client) => {
      await client.query("BEGIN");

      try {
        // Saldo yang tersedia adalah saldo user yang dapat dipakai untuk lock.
        // Kunci row agar dua request lock bersamaan tidak dapat menghabiskan saldo yang sama.
        const userResult = await client.query(
          `
          SELECT
            id,
            COALESCE(available_balance, 0) AS available_balance,
            COALESCE(total_locked, 0) AS total_locked
          FROM users
          WHERE id = $1
          FOR UPDATE
          `,
          [userId]
        );

        if (userResult.rows.length === 0) {
          throw new Error("USER_NOT_FOUND");
        }

        const user = userResult.rows[0];
        // Canonical production balance is available_balance/total_locked.
        const availableBalance = Number(user.available_balance || 0);
        const currentLocked = Number(user.total_locked || 0);

        if (availableBalance < amount) {
          throw new Error("INSUFFICIENT_BALANCE");
        }

        const activeResult = await client.query(
          `
          SELECT id
          FROM deposits
          WHERE user_id = $1
            AND UPPER(TRIM(COALESCE(status, ''))) IN ('ACTIVE', 'LOCKED')
          LIMIT 1
          `,
          [userId]
        );

        if (activeResult.rows.length > 0) {
          throw new Error("ACTIVE_DEPOSIT_EXISTS");
        }

        const depositCode = generateDepositCode();
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + durationDays);

        const remainingBalance = availableBalance - amount;
        const newLockedBalance = currentLocked + amount;

        await client.query(
          `
          UPDATE users
          SET
            available_balance = $1,
            total_locked = $2
          WHERE id = $3
          `,
          [remainingBalance, newLockedBalance, userId]
        );

        const depositResult = await client.query(
          `
          INSERT INTO deposits (
            deposit_code,
            user_id,
            amount,
            duration_days,
            start_date,
            end_date,
            status,
            total_claimed,
            force_jackpot,
            created_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, 'ACTIVE', 0, false, NOW()
          )
          RETURNING
            id,
            deposit_code AS "depositCode",
            amount,
            duration_days AS "durationDays",
            start_date AS "startDate",
            end_date AS "endDate",
            status,
            total_claimed AS "totalClaimed",
            force_jackpot AS "forceJackpot",
            created_at AS "createdAt"
          `,
          [
            depositCode,
            userId,
            amount,
            durationDays,
            startDate,
            endDate,
          ]
        );

        if (amount >= MIN_MINING_LOCK_IDR) {
          const miningStart = Math.floor(startDate.getTime() / 1000);
          await client.query(
            `UPDATE users
             SET mining_enabled = 1,
                 mining_started_at = $1,
                 mining_last_credited_at = $1,
                 mining_locked_amount = $2
             WHERE id = $3`,
            [miningStart, amount, userId]
          );
        } else {
          await client.query(
            `UPDATE users
             SET mining_enabled = 0,
                 mining_locked_amount = 0
             WHERE id = $1`,
            [userId]
          );
        }

        await client.query("COMMIT");

        return {
          deposit: depositResult.rows[0],
          remainingBalance,
          remainingSaldo: remainingBalance,
          lockedBalance: newLockedBalance,
        };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    });

    // Notification is auxiliary. A successful financial lock must never be reported
    // as failed just because the admin notification channel is unavailable.
    try {
      await notifyAdmins(
        context.env,
        {
          type: "deposit.created",
          title: "New Blind Box lock",
          message: `User ${auth.user.walletAddress || auth.user.id} created a ${durationDays}-day lock worth ${amount}.`,
          severity: "info",
          entityType: "deposit",
          entityId: result.deposit?.id,
        }
      );
    } catch (notificationError) {
      console.error("Deposit created but admin notification failed:", notificationError);
    }

    return json({
      success: true,
      message: "Lock saldo berhasil dibuat.",
      ...result,
    });
  } catch (error) {
    console.error("Create deposit/lock error:", error);

    if (error instanceof Error) {
      if (error.message === "USER_NOT_FOUND") {
        return json({ success: false, error: "User tidak ditemukan." }, 404);
      }

      if (error.message === "INSUFFICIENT_BALANCE") {
        return json(
          { success: false, error: "Saldo user tersedia tidak mencukupi untuk nominal lock." },
          400
        );
      }

      if (error.message === "ACTIVE_DEPOSIT_EXISTS") {
        return json(
          { success: false, error: "Masih ada lock Blind Box yang aktif. Selesaikan atau buka lock tersebut terlebih dahulu." },
          400
        );
      }
    }

    return json(
      { success: false, error: "Gagal melakukan lock saldo." },
      500
    );
  }
};
