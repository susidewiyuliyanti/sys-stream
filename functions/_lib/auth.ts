import { Env, json } from "./db";

export interface AuthUser {
  id: string;
  username?: string;
  email?: string;
  displayName?: string;
  role?: string;
  balance?: number;
  lockedBalance?: number;
  emailVerified?: boolean;
}

const textEncoder = new TextEncoder();

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const baseKey = await crypto.subtle.importKey("raw", textEncoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" },
    baseKey,
    256
  );
  return `pbkdf2$120000$${bytesToHex(salt)}$${bytesToHex(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [scheme, iterationsText, saltHex, hashHex] = stored.split("$");
    if (scheme !== "pbkdf2") return false;
    const iterations = Number(iterationsText);
    const baseKey = await crypto.subtle.importKey("raw", textEncoder.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: hexToBytes(saltHex), iterations, hash: "SHA-256" },
      baseKey,
      256
    );
    const actual = new Uint8Array(bits);
    const expected = hexToBytes(hashHex);
    if (actual.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
    return diff === 0;
  } catch {
    return false;
  }
}

export async function createSession(env: Env, userId: string): Promise<string> {
  const token = crypto.randomUUID() + "." + crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  await env.DB.prepare(
    "INSERT INTO auth_sessions(token,user_id,expires_at) VALUES(?,?,?)"
  ).bind(token, String(userId), expiresAt).run();
  return token;
}

export async function requireAuth(request: Request, env: Env) {
  const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok: false as const, response: json({ success: false, error: "Unauthorized" }, 401) };

  const row = await env.DB.prepare(
    `SELECT u.id, u.username, u.email, u.display_name AS displayName, u.role,
            COALESCE(u.email_verified,0) AS emailVerified,
            COALESCE(u.available_balance,0) AS balance,
            COALESCE(u.total_locked,0) AS lockedBalance
     FROM auth_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > ?
     LIMIT 1`
  ).bind(token, Math.floor(Date.now() / 1000)).first<any>();

  if (!row) return { ok: false as const, response: json({ success: false, error: "Invalid or expired session" }, 401) };

  if (Number(row.emailVerified || 0) !== 1) {
    return { ok: false as const, response: json({ success: false, error: "Email belum diverifikasi." }, 403) };
  }

  return {
    ok: true as const,
    user: {
      ...row,
      id: String(row.id),
      emailVerified: true,
      balance: Number(row.balance ?? 0),
      lockedBalance: Number(row.lockedBalance ?? 0),
    },
    token,
  };
}

export async function getUserById(env: Env, userId: string) {
  return env.DB.prepare(
    `SELECT id, username, email, display_name AS displayName, role,
            COALESCE(email_verified,0) AS emailVerified,
            COALESCE(available_balance,0) AS balance,
            COALESCE(total_locked,0) AS lockedBalance
     FROM users WHERE id = ? LIMIT 1`
  ).bind(String(userId)).first<AuthUser>();
}
