import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Env } from "./db";

export interface AuthUser {
  id?: number;
  uid: string;
  email: string;

  displayName?: string | null;
  photoURL?: string | null;
  streamerHandle?: string | null;
  bio?: string | null;

  username?: string;
  cuid?: string;

  referralCode?: string | null;
  referredBy?: string | null;
  referralCount?: number;

  balance?: number;
  saldo?: number;
  walletBalance?: number;
  lockedSaldo?: number;

  affiliateEarnings?: number;
  affiliateWithdrawn?: number;

  isSubscribed?: boolean;
  subscriptionPlan?: string | null;
  subscriptionExpiresAt?: string | null;
  isLifetime?: boolean;
  subscribedAt?: string | null;

  role?: string;

  isBlacklisted?: boolean;
  isBanned?: boolean;
  bannedReason?: string | null;

  forceJackpotNext?: boolean;
  targetJackpotNominal?: number | null;

  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface TokenPayload {
  sub: string;
  uid?: string;
  email: string;
  role?: string;

  iss?: string;
  aud?: string;

  iat?: number;
  exp?: number;
}

/**
 * ============================================================
 * PASSWORD
 * ============================================================
 */

export async function hashPassword(
  password: string
): Promise<string> {
  if (!password || password.length < 6) {
    throw new Error(
      "Password minimal 6 karakter."
    );
  }

  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  if (!password || !passwordHash) {
    return false;
  }

  try {
    return await bcrypt.compare(
      password,
      passwordHash
    );
  } catch (error) {
    console.error(
      "Password verification error:",
      error
    );

    return false;
  }
}

/**
 * ============================================================
 * JWT
 * ============================================================
 */

export function createToken(
  user: AuthUser,
  env: Env
): string {
  const secret = env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET belum dikonfigurasi di Cloudflare."
    );
  }

  if (!user.id) {
    throw new Error(
      "User ID tidak tersedia untuk membuat token."
    );
  }

  const payload: TokenPayload = {
    sub: String(user.id),
    uid: user.uid,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(
    payload,
    secret,
    {
      expiresIn: "7d",
      issuer: "sys-stream",
      audience: "sys-stream-app",
    }
  );
}

/**
 * ============================================================
 * READ TOKEN
 * ============================================================
 */

export function getBearerToken(
  request: Request
): string | null {
  const authorization =
    request.headers.get(
      "Authorization"
    );

  if (!authorization) {
    return null;
  }

  const [scheme, token] =
    authorization.split(" ");

  if (
    scheme?.toLowerCase() !==
      "bearer" ||
    !token
  ) {
    return null;
  }

  return token.trim();
}

/**
 * ============================================================
 * VERIFY TOKEN
 * ============================================================
 */

export function verifyToken(
  token: string,
  env: Env
): TokenPayload | null {
  const secret = env.JWT_SECRET;

  if (!secret) {
    console.error(
      "JWT_SECRET belum dikonfigurasi."
    );

    return null;
  }

  try {
    const decoded =
      jwt.verify(
        token,
        secret,
        {
          issuer: "sys-stream",
          audience: "sys-stream-app",
        }
      );

    if (
      typeof decoded !==
      "object"
    ) {
      return null;
    }

    if (
      !decoded.sub ||
      !decoded.email
    ) {
      return null;
    }

    return decoded as TokenPayload;
  } catch (error) {
    console.error(
      "JWT verification failed:",
      error
    );

    return null;
  }
}

/**
 * ============================================================
 * AUTH RESULT
 * ============================================================
 */

export type AuthSuccess = {
  ok: true;
  user: TokenPayload;
};

export type AuthFailure = {
  ok: false;
  response: Response;
};

export type AuthResult =
  | AuthSuccess
  | AuthFailure;

/**
 * ============================================================
 * REQUIRE AUTH
 * ============================================================
 */

export function requireAuth(
  request: Request,
  env: Env
): AuthResult {
  const token =
    getBearerToken(request);

  if (!token) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({
          success: false,
          message:
            "Authentication required.",
          code: "AUTH_REQUIRED",
        }),
        {
          status: 401,
          headers: {
            "Content-Type":
              "application/json; charset=utf-8",
            "Cache-Control":
              "no-store",
          },
        }
      ),
    };
  }

  const user =
    verifyToken(
      token,
      env
    );

  if (!user) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({
          success: false,
          message:
            "Token autentikasi tidak valid atau sudah kedaluwarsa.",
          code: "INVALID_TOKEN",
        }),
        {
          status: 401,
          headers: {
            "Content-Type":
              "application/json; charset=utf-8",
            "Cache-Control":
              "no-store",
          },
        }
      ),
    };
  }

  return {
    ok: true,
    user,
  };
}

/**
 * ============================================================
 * ROLE HELPERS
 * ============================================================
 */

export function isAdminRole(
  role?: string | null
): boolean {
  const normalized =
    String(role || "")
      .trim()
      .toUpperCase();

  return (
    normalized === "ADMIN" ||
    normalized === "OWNER" ||
    normalized === "SUPER_ADMIN"
  );
}

export function isOwnerRole(
  role?: string | null
): boolean {
  const normalized =
    String(role || "")
      .trim()
      .toUpperCase();

  return (
    normalized === "OWNER" ||
    normalized === "SUPER_ADMIN"
  );
}
