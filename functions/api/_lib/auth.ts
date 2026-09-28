import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export type UserRole = 'OWNER' | 'ADMIN' | 'USER';

export interface AuthUser {
  id: number;
  cuid: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface TokenPayload {
  sub: string;
  id: number;
  cuid: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface Env {
  HYPERDRIVE: Hyperdrive;
  JWT_SECRET: string;
}

function getJwtSecret(env: Env): string {
  const secret = env.JWT_SECRET?.trim();

  if (!secret) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
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

  return bcrypt.compare(password, passwordHash);
}

export function createToken(
  user: AuthUser,
  env: Env
): string {
  const payload: TokenPayload = {
    sub: String(user.id),
    id: user.id,
    cuid: user.cuid,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, getJwtSecret(env), {
    expiresIn: '7d',
  });
}

export function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get('Authorization');

  if (!authorization) {
    return null;
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i);

  return match ? match[1].trim() : null;
}

export function verifyToken(
  token: string,
  env: Env
): TokenPayload | null {
  try {
    return jwt.verify(
      token,
      getJwtSecret(env)
    ) as TokenPayload;
  } catch {
    return null;
  }
}

export function getAuthUser(
  request: Request,
  env: Env
): TokenPayload | null {
  const token = getBearerToken(request);

  if (!token) {
    return null;
  }

  return verifyToken(token, env);
}

export function requireAuth(
  request: Request,
  env: Env
): TokenPayload {
  const payload = getAuthUser(request, env);

  if (!payload) {
    throw new Response(
      JSON.stringify({
        error: 'Unauthorized',
        message: 'Please log in first.',
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  return payload;
}

export function isOwnerRole(role?: string): boolean {
  return role === 'OWNER';
}

export function isAdminRole(role?: string): boolean {
  return role === 'OWNER' || role === 'ADMIN';
}
