import { Env, json, readJson, withDb } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";
import { notifyAdmins } from "../../_lib/admin-notifications";

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

    const userId = Number(auth.user.id);

    const data = await withDb(context.env, async (client) => {
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
      const activeDeposit = deposits.find((deposit) => deposit.status === "ACTIVE") ?? null;
      const wibNow = new Date(Date.now() + 7 * 60 * 60 * 1000);
      const today = wibNow.toISOString().slice(0, 10);

      let hasClaimedToday = false;
      let todayClaimData = null;

      if (activeDeposit) {
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
      }

      const claimsResult = await client.query(
        `
        SELECT
          c.id,
          c.deposit_id AS "depositId",
          c.user_id AS "userId",
          c.claim_date AS "claimDate",
          c.amount,
          c.is_jackpot AS "isJackpot",
          c.claimed_at AS "claimedAt"
        FROM blind_box_claims c
        INNER JOIN deposits d ON d.id = c.deposit_id
        WHERE d.user_id = $1
        ORDER BY c.claimed_at DESC
        LIMIT 20
        `,
        [userId]
      );

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

      return {
        deposits,
        activeDeposit,
        hasClaimedToday,
        todayClaimData,
        recentClaims: claimsResult.rows,
        settings: settingsResult.rows[0] ?? null,
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

    if (!Number.isInteger(amount) || amount < 71748) {
      return json(
        {
          success: false,
          error: "Nominal lock minimal setara $4 USD (berbasis kurs server) dan tidak dibatasi kelipatan Rp 10.000.",
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

    const userId = Number(auth.user.id);

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
            COALESCE(balance, 0) AS legacy_balance,
            COALESCE(total_locked, 0) AS total_locked,
            COALESCE(locked_saldo, 0) AS legacy_locked_saldo
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
        // Legacy fields are used only as a compatibility fallback for old accounts.
        const canonicalBalance = Number(user.available_balance || 0);
        const legacyBalance = Number(user.legacy_balance || 0);
        const availableBalance = canonicalBalance > 0 ? canonicalBalance : legacyBalance;
        const currentLocked = Number(user.total_locked || 0) > 0
          ? Number(user.total_locked || 0)
          : Number(user.legacy_locked_saldo || 0);

        if (availableBalance < amount) {
          throw new Error("INSUFFICIENT_BALANCE");
        }

        const activeResult = await client.query(
          `
          SELECT id
          FROM deposits
          WHERE user_id = $1 AND status = 'ACTIVE'
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
            total_locked = $2,
            balance = $1,
            locked_saldo = $2
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

    await notifyAdmins(context.env,{type:"deposit.created",title:"New Blind Box lock",message:`User ${auth.user.walletAddress || auth.user.id} created a ${durationDays}-day lock worth ${amount}.`,severity:"info",entityType:"deposit",entityId:result.deposit?.id});

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
