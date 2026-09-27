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
  generateToken,
  hashPassword,
} from "../_shared/auth";

export const onRequestPost: PagesFunction<CloudflareEnv> = async (
  context
) => {
  let pool: ReturnType<typeof createDb>["pool"] | null = null;

  try {
    const body = await context.request.json<{
      username?: string;
      email?: string;
      password?: string;
      displayName?: string;
    }>();

    const username = body.username?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const displayName =
      body.displayName?.trim() || username;

    if (!username || !email || !password) {
      return Response.json(
        {
          success: false,
          error:
            "Username, email, dan password wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (password.length < 5) {
      return Response.json(
        {
          success: false,
          error:
            "Password minimal 5 karakter.",
        },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return Response.json(
        {
          success: false,
          error:
            "Username minimal 3 karakter.",
        },
        { status: 400 }
      );
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return Response.json(
        {
          success: false,
          error: "Format email tidak valid.",
        },
        { status: 400 }
      );
    }

    const { db, pool: createdPool } = createDb(context.env);
    pool = createdPool;

    const existingUsers = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, email),
          eq(users.username, username)
        )
      )
      .limit(1);

    if (existingUsers.length > 0) {
      const existing = existingUsers[0];

      if (
        existing.email?.toLowerCase() ===
        email
      ) {
        return Response.json(
          {
            success: false,
            error: "Email sudah terdaftar.",
          },
          { status: 409 }
        );
      }

      if (
        existing.username?.toLowerCase() ===
        username.toLowerCase()
      ) {
        return Response.json(
          {
            success: false,
            error: "Username sudah digunakan.",
          },
          { status: 409 }
        );
      }
    }

    const hashedPassword =
      await hashPassword(password);

    /**
     * Admin tidak boleh dibuat sembarangan melalui
     * endpoint register.
     *
     * Hanya OWNER_EMAIL yang disimpan sebagai
     * environment variable yang dapat diberikan
     * role admin.
     */
    const ownerEmail =
      context.env.OWNER_EMAIL
        ?.trim()
        .toLowerCase();

    const isOwner =
      !!ownerEmail &&
      email === ownerEmail;

    const role =
      isOwner ? "ADMIN" : "USER";

    const now = new Date();

    const [createdUser] = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        displayName:
          displayName || username,

        balance: 100000,
        saldo: 100000,
        walletBalance: 100000,
        lockedSaldo: 0,

        affiliateEarnings: 0,
        affiliateWithdrawn: 0,

        referralCount: 0,

        isSubscribed: false,
        isLifetime: false,

        role,

        isBlacklisted: false,
        isBanned: false,

        forceJackpotNext: false,

        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (!createdUser) {
      throw new Error(
        "User gagal dibuat."
      );
    }

    const token = generateToken(
      {
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
        username:
          createdUser.username,
      },
      context.env
    );

    return Response.json(
      {
        success: true,
        message:
          "Registrasi berhasil.",
        token,
        verificationSent: false,

        user: {
          id: createdUser.id,
          cuid: createdUser.cuid,
          uid: createdUser.uid,

          username:
            createdUser.username,

          email:
            createdUser.email,

          displayName:
            createdUser.displayName,

          photoURL:
            createdUser.photoURL,

          balance:
            createdUser.balance,

          saldo:
            createdUser.saldo,

          walletBalance:
            createdUser.walletBalance,

          lockedSaldo:
            createdUser.lockedSaldo,

          affiliateEarnings:
            createdUser.affiliateEarnings,

          affiliateWithdrawn:
            createdUser.affiliateWithdrawn,

          referralCode:
            createdUser.referralCode,

          referredBy:
            createdUser.referredBy,

          referralCount:
            createdUser.referralCount,

          isSubscribed:
            createdUser.isSubscribed,

          subscriptionPlan:
            createdUser.subscriptionPlan,

          subscriptionExpiresAt:
            createdUser.subscriptionExpiresAt,

          isLifetime:
            createdUser.isLifetime,

          subscribedAt:
            createdUser.subscribedAt,

          role:
            createdUser.role,

          isBlacklisted:
            createdUser.isBlacklisted,

          isBanned:
            createdUser.isBanned,

          bannedReason:
            createdUser.bannedReason,

          forceJackpotNext:
            createdUser.forceJackpotNext,

          targetJackpotNominal:
            createdUser.targetJackpotNominal,

          createdAt:
            createdUser.createdAt,

          updatedAt:
            createdUser.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Cloudflare register error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Registrasi gagal.",
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
