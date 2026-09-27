import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export interface AuthTokenPayload {
  id: number;
  email: string;
  role?: string | null;
  username?: string | null;
}

const getJwtSecret = (env: {
  JWT_SECRET?: string;
}): string => {
  const secret = env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET belum dikonfigurasi di Cloudflare Environment Variables."
    );
  }

  return secret;
};

export const generateToken = (
  user: {
    id: number;
    email: string;
    role?: string | null;
    username?: string | null;
  },
  env: {
    JWT_SECRET?: string;
  }
): string => {
  const payload: AuthTokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    username: user.username,
  };

  return jwt.sign(payload, getJwtSecret(env), {
    expiresIn: "30d",
  });
};

export const verifyToken = (
  token: string,
  env: {
    JWT_SECRET?: string;
  }
): AuthTokenPayload => {
  const decoded = jwt.verify(
    token,
    getJwtSecret(env)
  ) as AuthTokenPayload;

  return decoded;
};

export const hashPassword = async (
  password: string
): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const getBearerToken = (
  request: Request
): string | null => {
  const authorization = request.headers.get("Authorization");

  if (!authorization) {
    return null;
  }

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.substring(7).trim() || null;
};

export const authenticateRequest = (
  request: Request,
  env: {
    JWT_SECRET?: string;
  }
): AuthTokenPayload => {
  const token = getBearerToken(request);

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  try {
    return verifyToken(token, env);
  } catch {
    throw new Error("UNAUTHORIZED");
  }
};
