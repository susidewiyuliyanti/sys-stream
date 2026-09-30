import { Env, json, withDb } from "../_lib/db";
import { requireAuth } from "../_lib/auth";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env);

    if (auth.ok === false) {
      return auth.response;
    }

    const userId = Number(auth.user.id);

    const result = await withDb(context.env, async (client) => {
      const userResult = await client.query(
        `
        SELECT
          id,
          username,
          email,
          balance,
          saldo,
          "walletBalance",
          "lockedSaldo",
          "affiliateEarnings",
          "affiliateWithdrawn",
          "isSubscribed",
          "subscriptionPlan",
          "subscriptionExpiresAt",
          "isLifetime"
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error("USER_NOT_FOUND");
      }

      const depositsResult = await client.query(
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

      return {
        user: userResult.rows[0],
        deposits: depositsResult.rows,
      };
    });

    return json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Wallet error:", error);

    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return json(
        {
          success: false,
          message: "User tidak ditemukan.",
        },
        404
      );
    }

    return json(
      {
        success: false,
        message: "Gagal mengambil data wallet.",
      },
      500
    );
  }
};
