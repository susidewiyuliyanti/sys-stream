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
  generateToken,
} from "../_shared/auth";

export const onRequestPost: PagesFunction<CloudflareEnv> = async (
  context
) => {
  let pool: ReturnType<typeof createDb>["pool"] | null = null;

  try {
    const body = await context.request.json<{
      uid?: string;
      email?: string;
      displayName?: string;
      role?: string;
      walletBalance?: number;
      saldo?: number;
      photoURL?: string | null;
    }>();

    const uid =
      body.uid?.trim() || null;

    const email =
      body.email?.trim().toLowerCase();

    const displayName =
      body.displayName?.trim() ||
      null;

    const photoURL =
      body.photoURL || null;

    if (!email && !uid) {
      return Response.json(
        {
          success: false,
          error:
            "UID atau email wajib diberikan.",
        },
        { status: 400 }
      );
    }

    const { db, pool: createdPool } =
      createDb(context.env);

    pool = createdPool;

    let user;

    /**
     * First try UID.
     */
    if (uid) {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.uid, uid))
        .limit(1);

      user = result[0];
    }

    /**
     * If UID does not find a user,
     * try email.
     */
    if (!user && email) {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      user = result[0];
    }

    /**
     * Create a new account when no matching
     * PostgreSQL user exists.
     */
    if (!user) {
      const now = new Date();

      const [createdUser] = await db
        .insert(users)
        .values({
          uid,
          email:
            email || `${uid}@local.sys-stream`,

          displayName:
            displayName ||
            "Host Streamer",

          photoURL,

          username:
            createUsername(
              displayName,
              email,
              uid
            ),

          balance:
            typeof body.walletBalance ===
            "number"
              ? body.walletBalance
              : 0,

          saldo:
            typeof body.saldo ===
            "number"
              ? body.saldo
              : typeof body.walletBalance ===
                "number"
                ? body.walletBalance
                : 0,

          walletBalance:
            typeof body.walletBalance ===
            "number"
              ? body.walletBalance
              : 0,

          lockedSaldo: 0,

          affiliateEarnings: 0,
          affiliateWithdrawn: 0,

          referralCount: 0,

          isSubscribed: false,
          isLifetime: false,

          role:
            body.role ||
            "USER",

          isBlacklisted: false,
          isBanned: false,

          forceJackpotNext: false,

          createdAt: now,
          updatedAt: now,
        })
        .returning();

      user = createdUser;
    } else {
      /**
       * Update only identity/profile fields.
       *
       * IMPORTANT:
       * We intentionally do NOT trust walletBalance
       * from the client during normal session sync.
       *
       * Monetary balances must remain server/database
       * controlled.
       */
      const [updatedUser] =
        await db
          .update(users)
          .set({
            ...(uid
              ? { uid }
              : {}),

            ...(email
              ? { email }
              : {}),

            ...(displayName
              ? { displayName }
              : {}),

            ...(photoURL
              ? { photoURL }
              : {}),

            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id))
          .returning();

      user =
        updatedUser || user;
    }

    if (!user) {
      throw new Error(
        "User gagal dibuat atau diperbarui."
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
      message:
        "Session berhasil disinkronkan.",
      token,

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
    console.error(
      "Cloudflare sync-session error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal sinkronisasi session.",
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

/**
 * Generate a username for users coming from
 * the old Firebase session system.
 */
function createUsername(
  displayName?: string | null,
  email?: string | null,
  uid?: string | null
): string {
  let source =
    displayName?.trim() ||
    email
      ?.split("@")[0]
      ?.trim() ||
    uid?.substring(0, 12) ||
    "user";

  source = source
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!source) {
    source = "user";
  }

  return source.substring(0, 30);
}
