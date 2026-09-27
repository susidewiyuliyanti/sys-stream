import {
  eq,
  or,
} from "drizzle-orm";

import {
  users,
} from "../../../src/db/schema";

import {
  createDb,
  CloudflareEnv,
} from "../_shared/db";

import {
  comparePassword,
  generateToken,
} from "../_shared/auth";

export const onRequestPost: PagesFunction<CloudflareEnv> = async (
  context
) => {
  let pool: ReturnType<typeof createDb>["pool"] | null = null;

  try {
    const body = await context.request.json<{
      login?: string;
      email?: string;
      username?: string;
      password?: string;
    }>();

    const login =
      body.login?.trim() ||
      body.email?.trim() ||
      body.username?.trim();

    const password = body.password;

    if (!login || !password) {
      return Response.json(
        {
          success: false,
          error: "Username/email dan password wajib diisi.",
        },
        { status: 400 }
      );
    }

    const { db, pool: createdPool } = createDb(context.env);
    pool = createdPool;

    const normalizedLogin = login.toLowerCase();

    const result = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, normalizedLogin),
          eq(users.username, login)
        )
      )
      .limit(1);

    const user = result[0];

    if (!user) {
      return Response.json(
        {
          success: false,
          error: "Email/username atau password salah.",
        },
        { status: 401 }
      );
    }

    if (user.isBanned) {
      return Response.json(
        {
          success: false,
          error:
            user.bannedReason ||
            "Akun Anda telah diblokir.",
        },
        { status: 403 }
      );
    }

    if (user.isBlacklisted) {
      return Response.json(
        {
          success: false,
          error: "Akun Anda masuk daftar blacklist.",
        },
        { status: 403 }
      );
    }

    if (!user.password) {
      return Response.json(
        {
          success: false,
          error:
            "Akun ini belum memiliki password login.",
        },
        { status: 400 }
      );
    }

    const passwordValid = await comparePassword(
      password,
      user.password
    );

    if (!passwordValid) {
      return Response.json(
        {
          success: false,
          error: "Email/username atau password salah.",
        },
        { status: 401 }
      );
    }

    const token = generateToken(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
      },
      context.env
    );

    return Response.json({
      success: true,
      message: "Login berhasil.",
      token,
      user: {
        id: user.id,
        cuid: user.cuid,
        uid: user.uid,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,

        streamerHandle: user.streamerHandle,
        bio: user.bio,

        referralCode: user.referralCode,
        referredBy: user.referredBy,
        referralCount: user.referralCount,

        balance: user.balance,
        saldo: user.saldo,
        walletBalance: user.walletBalance,
        lockedSaldo: user.lockedSaldo,

        affiliateEarnings: user.affiliateEarnings,
        affiliateWithdrawn: user.affiliateWithdrawn,

        isSubscribed: user.isSubscribed,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionExpiresAt:
          user.subscriptionExpiresAt,
        isLifetime: user.isLifetime,
        subscribedAt: user.subscribedAt,

        role: user.role,

        isBlacklisted: user.isBlacklisted,
        isBanned: user.isBanned,
        bannedReason: user.bannedReason,

        forceJackpotNext: user.forceJackpotNext,
        targetJackpotNominal:
          user.targetJackpotNominal,

        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Cloudflare login error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Login gagal.",
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
