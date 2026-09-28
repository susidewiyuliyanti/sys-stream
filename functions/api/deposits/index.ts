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
          "depositCode",
          amount,
          "durationDays",
          "startDate",
          "endDate",
          status,
          "totalClaimed",
          "forceJackpot",
          "createdAt"
        FROM deposits
        WHERE "userId" = $1
        ORDER BY "createdAt" DESC
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

    if (!Number.isInteger(amount) || amount <= 0) {
      return json(
        {
          success: false,
          message: "Nominal deposit tidak valid.",
        },
        400
      );
    }

    if (!Number.isInteger(durationDays) || durationDays <= 0) {
      return json(
        {
          success: false,
          message: "Durasi deposit tidak valid.",
        },
        400
      );
    }

    const userId = Number(auth.user.id);

    const result = await withDb(context.env, async (client) => {
      await client.query("BEGIN");

      try {
        /*
         * Lock row user supaya dua request bersamaan
         * tidak bisa memanipulasi saldo secara race condition.
         */
        const userResult = await client.query(
          `
          SELECT
            id,
            saldo,
            "walletBalance"
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

        const saldo = Number(user.saldo ?? 0);

        if (saldo < amount) {
          throw new Error("INSUFFICIENT_BALANCE");
        }

        const depositCode = generateDepositCode();

        const startDate = new Date();

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + durationDays);

        /*
         * Kurangi saldo dan simpan deposit
         * dalam satu transaksi.
         */
        await client.query(
          `
          UPDATE users
          SET
            saldo = saldo - $1,
            "walletBalance" = "walletBalance" - $1,
            "updatedAt" = NOW()
          WHERE id = $2
          `,
          [amount, userId]
        );

        const depositResult = await client.query(
          `
          INSERT INTO deposits (
            "depositCode",
            "userId",
            amount,
            "durationDays",
            "startDate",
            "endDate",
            status,
            "totalClaimed",
            "forceJackpot",
            "createdAt"
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            'ACTIVE',
            0,
            false,
            NOW()
          )
          RETURNING
            id,
            "depositCode",
            amount,
            "durationDays",
            "startDate",
            "endDate",
            status,
            "totalClaimed",
            "forceJackpot",
            "createdAt"
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
          remainingSaldo: saldo - amount,
        };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    });

    return json({
      success: true,
      message: "Deposit berhasil dibuat.",
      ...result,
    });
  } catch (error) {
    console.error("Create deposit error:", error);

    if (error instanceof Error) {
      if (error.message === "USER_NOT_FOUND") {
        return json(
          {
            success: false,
            message: "User tidak ditemukan.",
          },
          404
        );
      }

      if (error.message === "INSUFFICIENT_BALANCE") {
        return json(
          {
            success: false,
            message: "Saldo tidak mencukupi.",
          },
          400
        );
      }
    }

    return json(
      {
        success: false,
        message: "Gagal membuat deposit.",
      },
      500
    );
  }
};
