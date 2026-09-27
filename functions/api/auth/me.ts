import {
  eq,
} from "drizzle-orm";

import {
  users,
} from "../../../src/db/schema";

import {
  createDb,
  CloudflareEnv,
} from "../_shared/db";

import {
  authenticateRequest,
} from "../_shared/auth";

export const onRequestGet: PagesFunction<CloudflareEnv> = async (
  context
) => {
  let pool: ReturnType<typeof createDb>["pool"] | null = null;

  try {
    const tokenUser =
      authenticateRequest(
        context.request,
        context.env
      );

    const { db, pool: createdPool } =
      createDb(context.env);

    pool = createdPool;

    const result = await db
      .select()
      .from(users)
      .where(
        eq(users.id, tokenUser.id)
      )
      .limit(1);

    const user = result[0];

    if (!user) {
      return Response.json(
        {
          success: false,
          error: "User tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    if (user.isBanned) {
      return Response.json(
        {
          success: false,
          error:
            user.bannedReason ||
            "Akun telah diblokir.",
        },
        { status: 403 }
      );
    }

    return Response.json({
      success: true,
      user: {
        id: user.id,
        cuid: user.cuid,
        uid: user.uid,

        username:
          user.username,

        email:
          user.email,

        displayName:
          user.displayName,

        photoURL:
          user.photoURL,

        streamerHandle:
          user.streamerHandle,

        bio:
          user.bio,

        referralCode:
          user.referralCode,

        referredBy:
          user.referredBy,

        referralCount:
          user.referralCount,

        balance:
          user.balance,

        saldo:
          user.saldo,

        walletBalance:
          user.walletBalance,

        lockedSaldo:
          user.lockedSaldo,

        affiliateEarnings:
          user.affiliateEarnings,

        affiliateWithdrawn:
          user.affiliateWithdrawn,

        isSubscribed:
          user.isSubscribed,

        subscriptionPlan:
          user.subscriptionPlan,

        subscriptionExpiresAt:
          user.subscriptionExpiresAt,

        isLifetime:
          user.isLifetime,

        subscribedAt:
          user.subscribedAt,

        role:
          user.role,

        isBlacklisted:
          user.isBlacklisted,

        isBanned:
          user.isBanned,

        bannedReason:
          user.bannedReason,

        forceJackpotNext:
          user.forceJackpotNext,

        targetJackpotNominal:
          user.targetJackpotNominal,

        createdAt:
          user.createdAt,

        updatedAt:
          user.updatedAt,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message === "UNAUTHORIZED"
    ) {
      return Response.json(
        {
          success: false,
          error:
            "Sesi tidak valid atau sudah kedaluwarsa.",
        },
        { status: 401 }
      );
    }

    console.error(
      "Cloudflare auth/me error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Gagal mengambil data pengguna.",
      },
      { status: 500 }
    );
  } finally {
    if (pool) {
      try {
        await pool.end();
      } catch {
        // Ignore pool close errors.
      }
    }
  }
};
