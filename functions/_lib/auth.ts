import { Env, json } from "./db";

export const AUTH_COOKIE_NAME = "sys_stream_session";
export const AUTH_COOKIE_DOMAIN = ".sysstreamer.asia";

export function createAuthCookie(token: string, maxAgeSeconds = 60 * 60 * 24 * 30): string {
  return `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Max-Age=${maxAgeSeconds}; Path=/; Domain=${AUTH_COOKIE_DOMAIN}; HttpOnly; Secure; SameSite=Lax`;
}

export function createClearAuthCookie(): string {
  return `${AUTH_COOKIE_NAME}=; Max-Age=0; Path=/; Domain=${AUTH_COOKIE_DOMAIN}; HttpOnly; Secure; SameSite=Lax`;
}

function getCookieValue(request: Request, name: string): string {
  const raw = request.headers.get("Cookie") || "";
  const part = raw.split(";").map(v => v.trim()).find(v => v.startsWith(name + "="));
  return part ? decodeURIComponent(part.slice(name.length + 1)) : "";
}

export interface AuthUser {
  id: string;
  username?: string;
  email?: string;
  displayName?: string;
  role?: string;
  balance?: number;
  lockedBalance?: number;
  emailVerified?: boolean;
  referralCode?: string;
  avatarUrl?: string;
  referralCount?: number;
  registrationBonusIdr?: number;
  registrationBonusGranted?: boolean;
  walletAddress?: string;
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

async function ensureAuthUserColumns(env: Env) {
  const columns = await env.DB.prepare("PRAGMA table_info(users)").all();
  const names = new Set((columns.results || []).map((r:any) => String(r.name)));
  const additions: Array<[string,string]> = [
    ["avatar_url", "TEXT"],
    ["wallet_address", "TEXT"],
    ["referral_code", "TEXT"],
    ["referral_count", "INTEGER NOT NULL DEFAULT 0"],
    ["email_verified", "INTEGER NOT NULL DEFAULT 0"],
    ["available_balance", "REAL NOT NULL DEFAULT 0"],
    ["total_locked", "REAL NOT NULL DEFAULT 0"],
    ["registration_bonus_idr", "REAL NOT NULL DEFAULT 0"],
    ["registration_bonus_granted", "INTEGER NOT NULL DEFAULT 0"],
  ];
  for (const [name, definition] of additions) {
    if (!names.has(name)) {
      try {
        await env.DB.prepare(`ALTER TABLE users ADD COLUMN ${name} ${definition}`).run();
      } catch (error) {
        console.error("auth schema repair skipped", { name, error: String(error) });
      }
    }
  }
}

export async function requireAuth(request: Request, env: Env) {
  await ensureAuthUserColumns(env);
  const bearerToken = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  const token = bearerToken || getCookieValue(request, AUTH_COOKIE_NAME);
  if (!token) return { ok: false as const, response: json({ success: false, error: "Unauthorized" }, 401) };

  const row = await env.DB.prepare(
    `SELECT u.id, u.username, u.email, u.display_name AS displayName, u.role,
            u.referral_code AS referralCode,
            u.wallet_address AS walletAddress,
            u.avatar_url AS avatarUrl,
            COALESCE(u.referral_count,0) AS referralCount,
            COALESCE(u.registration_bonus_idr,0) AS registrationBonusIdr,
            COALESCE(u.registration_bonus_granted,0) AS registrationBonusGranted,
            COALESCE(u.email_verified,0) AS emailVerified,
            COALESCE(u.available_balance, u.balance, 0) AS balance,
            COALESCE(u.total_locked, u.locked_saldo, 0) AS lockedBalance
     FROM auth_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > ?
     LIMIT 1`
  ).bind(token, Math.floor(Date.now() / 1000)).first<any>();

  if (!row) return { ok: false as const, response: json({ success: false, error: "Invalid or expired session" }, 401) };

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
            referral_code AS referralCode, wallet_address AS walletAddress, avatar_url AS avatarUrl,
            COALESCE(referral_count,0) AS referralCount,
            COALESCE(registration_bonus_idr,0) AS registrationBonusIdr,
            COALESCE(registration_bonus_granted,0) AS registrationBonusGranted,
            COALESCE(email_verified,0) AS emailVerified,
            CASE WHEN COALESCE(available_balance,0) > 0
                 THEN COALESCE(available_balance,0)
                 ELSE COALESCE(balance,0)
            END AS balance,
            CASE WHEN COALESCE(total_locked,0) > 0
                 THEN COALESCE(total_locked,0)
                 ELSE COALESCE(locked_saldo,0)
            END AS lockedBalance
     FROM users WHERE id = ? LIMIT 1`
  ).bind(String(userId)).first<AuthUser>();
}
