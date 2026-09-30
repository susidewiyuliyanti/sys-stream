import { Env, json, readJson, withDb } from "../_lib/db";
import { requireAuth } from "../_lib/auth";

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

    if (!auth.ok) {
      return auth.response;
    }

    const userId = Number(auth.user.id);

    const deposits = await withDb(context.env, async (client) => {
      const result = await client.query(
        `
        SELECT
          id,
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

      return result.rows;
    });

    return json({
      success: true,
      deposits,
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

    if (!auth.ok) {
      return auth.response;
    }

    const body = await readJson<DepositRequest>(context.request);
    const amount = Number(body.amount);
    const durationDays = Number(body.durationDays);

    if (!Number.isInteger(amount) || amount < 50000 || amount % 10000 !== 0) {
      return json(
        {
          success: false,
          error: "Nominal lock minimal Rp 50.000 dan harus kelipatan Rp 10.000.",
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
            COALESCE(balance, 0) AS balance,
            COALESCE(saldo, 0) AS saldo,
            COALESCE(wallet_balance, 0) AS wallet_balance,
            COALESCE(locked_saldo, 0) AS locked_saldo
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

        // Gunakan saldo terbesar yang konsisten sebagai available balance,
        // tetapi jangan pernah menambah saldo hanya karena salah satu field stale.
        const availableBalance = Math.max(
          Number(user.balance || 0),
          Number(user.saldo || 0),
          Number(user.wallet_balance || 0)
        );

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
        const newLockedBalance = Number(user.locked_saldo || 0) + amount;

        // Satu transaksi: available balance turun, locked balance naik.
        // Semua alias saldo disamakan agar UI utama dan Blind Box membaca angka yang sama.
        await client.query(
          `
          UPDATE users
          SET
            balance = $1,
            saldo = $1,
            wallet_balance = $1,
            locked_saldo = $2,
            updated_at = NOW()
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
