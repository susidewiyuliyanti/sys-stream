import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Env } from './db';

export interface AuthUser {
  id: number;
  uid: string;
  cuid: string;
  username: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  streamerHandle: string | null;
  bio: string | null;
  referralCode: string | null;
  referredBy: string | null;
  referralCount: number;
  balance: number;
  saldo: number;
  walletBalance: number;
  lockedSaldo: number;
  affiliateEarnings: number;
  affiliateWithdrawn: number;
  isSubscribed: boolean;
  subscriptionPlan: string;
  subscriptionExpiresAt: string | null;
  isLifetime: boolean;
  subscribedAt: string | null;
  role: string;
  isBlacklisted: boolean;
  isBanned: boolean;
  bannedReason: string | null;
  forceJackpotNext: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TokenPayload {
  sub: string;
  uid: string;
  email: string;
  role: string;
}

export async function hashPassword(
  password: string
): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(
  user: AuthUser,
  env: Env
): string {
  if (!env.JWT_SECRET) {
    throw new Error(
      'JWT_SECRET is not configured.'
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
    env.JWT_SECRET,
    {
      expiresIn: '7d',
      issuer: 'sys-stream',
      audience: 'sys-stream-app',
    }
  );
}

export function getBearerToken(
  request: Request
): string | null {
  const header =
    request.headers.get('Authorization');

  if (!header) {
    return null;
  }

  if (
    !header
      .toLowerCase()
      .startsWith('bearer ')
  ) {
    return null;
  }

  return header.substring(7).trim() || null;
}

export function verifyToken(
  request: Request,
  env: Env
): TokenPayload | null {
  const token =
    getBearerToken(request);

  if (!token || !env.JWT_SECRET) {
    return null;
  }

  try {
    return jwt.verify(
      token,
      env.JWT_SECRET,
      {
        issuer: 'sys-stream',
        audience: 'sys-stream-app',
      }
    ) as TokenPayload;
  } catch {
    return null;
  }
}

export function requireAuth(
  request: Request,
  env: Env
):
  | { ok: true; user: TokenPayload }
  | { ok: false; response: Response } {
  const user =
    verifyToken(request, env);

  if (!user) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({
          success: false,
          message:
            'Authentication required.',
          code: 'UNAUTHORIZED',
        }),
        {
          status: 401,
          headers: {
            'Content-Type':
              'application/json',
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

export function isAdminRole(
  role?: string | null
): boolean {
  if (!role) return false;

  return [
    'ADMIN',
    'OWNER',
    'SUPER_ADMIN',
    'admin',
    'owner',
    'super_admin',
  ].includes(role);
}

export function isOwnerRole(
  role?: string | null
): boolean {
  return [
    'OWNER',
    'owner',
    'SUPER_ADMIN',
    'super_admin',
  ].includes(role || '');
}
