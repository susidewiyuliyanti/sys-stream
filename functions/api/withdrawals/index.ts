import { Env, json, readJson, withDb } from "../_lib/db";
import { requireAuth } from "../_lib/auth";

interface WithdrawalRequest {
  amount?: number;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env);

    if (auth.ok === false) {
      return auth.response;
    }

    const userId = Number(auth.user.id);

    const withdrawals = await withDb(context.env, async (client) => {
      const result = await client.query(
        `
        SELECT
          id,
          amount,
          "bankName",
          "accountNumber",
          "accountName",
          status,
          "createdAt"
        FROM withdrawals
        WHERE "userId" = $1
        ORDER BY "createdAt" DESC
        `,
        [userId]
      );

      return result.rows;
    });

    return json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    console.error("Get withdrawals error:", error);

    return json(
      {
        success: false,
        message: "Gagal mengambil riwayat withdrawal.",
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

    const body =
      await readJson<WithdrawalRequest>(context.request);

    const amount = Number(body.amount);
    const bankName = String(body.bankName || "").trim();
    const accountNumber =
      String(body.accountNumber || "").trim();
    const accountName =
      String(body.accountName || "").trim();

    if (!Number.isInteger(amount) || amount <= 0) {
      return json(
        {
          success: false,
          message: "Nominal withdrawal tidak valid.",
        },
        400
      );
    }

    if (!bankName) {
      return json(
        {
          success: false,
          message: "Nama bank wajib diisi.",
        },
        400
      );
    }

    if (!accountNumber) {
      return json(
        {
          success: false,
          message: "Nomor rekening wajib diisi.",
        },
        400
      );
    }

    if (!accountName) {
      return json(
        {
          success: false,
          message: "Nama pemilik rekening wajib diisi.",
        },
        400
      );
    }

    const userId = Number(auth.user.id);

    const result = await withDb(context.env, async (client) => {
      await client.query("BEGIN");

      try {
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

        /*
         * Untuk keamanan, saldo dikurangi dalam transaksi
         * yang sama dengan pembuatan withdrawal.
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

        const withdrawalResult = await client.query(
          `
          INSERT INTO withdrawals (
            "userId",
            amount,
            "bankName",
            "accountNumber",
            "accountName",
            status,
            "createdAt"
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            'COMPLETED',
            NOW()
          )
          RETURNING
            id,
            amount,
            "bankName",
            "accountNumber",
            "accountName",
            status,
            "createdAt"
          `,
          [
            userId,
            amount,
            bankName,
            accountNumber,
            accountName,
          ]
        );

        await client.query("COMMIT");

        return {
          withdrawal: withdrawalResult.rows[0],
          remainingSaldo: saldo - amount,
        };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    });

    return json({
      success: true,
      message: "Withdrawal berhasil dibuat.",
      ...result,
    });
  } catch (error) {
    console.error("Create withdrawal error:", error);

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
        message: "Gagal membuat withdrawal.",
      },
      500
    );
  }
};
