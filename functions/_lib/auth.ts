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
  /** Canonical available balance from users.available_balance. */
  availableBalance?: number;
  lockedBalance?: number;
  emailVerified?: boolean;
  referralCode?: string;
  avatarUrl?: string;
  referralCount?: number;
  registrationBonusIdr?: number;
  registrationBonusGranted?: boolean;
  walletAddress?: string;
  sysBalance?: number;
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

  // Production has had multiple auth_sessions schemas over time. Keep session
  // creation compatible with all of them instead of assuming the current
  // three-column schema.
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS auth_sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`).run();

  const info = await env.DB.prepare("PRAGMA table_info(auth_sessions)").all<any>();
  const columns = (info.results || []) as any[];
  const names = new Set(columns.map((row:any) => String(row.name)));

  // Add required columns if an older table is missing them.
  for (const [name, definition] of [
    ["token", "TEXT"],
    ["user_id", "TEXT"],
    ["expires_at", "INTEGER"],
    ["created_at", "INTEGER"],
  ] as Array<[string,string]>) {
    if (!names.has(name)) {
      try {
        await env.DB.prepare(`ALTER TABLE auth_sessions ADD COLUMN ${name} ${definition}`).run();
      } catch (error) {
        if (!/duplicate column name|already exists/i.test(String(error))) {
          console.error("auth session schema repair skipped", { name, error: String(error) });
        }
      }
    }
  }

  const refreshed = await env.DB.prepare("PRAGMA table_info(auth_sessions)").all<any>();
  const sessionColumns = (refreshed.results || []) as any[];
  const idMeta = sessionColumns.find((row:any) => String(row.name) === "id");
  const integerPrimaryId =
    !!idMeta &&
    Number(idMeta.pk) === 1 &&
    !/CHAR|CLOB|TEXT|BLOB/i.test(String(idMeta.type || ""));

  const now = Math.floor(Date.now() / 1000);
  // Support historical D1 naming conventions as well as the current schema.
  // The canonical fields are still created above for requireAuth().
  const values: Record<string, any> = {
    id: crypto.randomUUID(),
    token,
    session_token: token,
    user_id: String(userId),
    userId: String(userId),
    expires_at: expiresAt,
    expiresAt,
    created_at: now,
    createdAt: now,
    revoked: 0,
    is_revoked: 0,
    active: 1,
  };

  const insertColumns:string[] = [];
  const insertValues:any[] = [];
  for (const column of sessionColumns) {
    const name = String(column.name);
    if (name === "id" && integerPrimaryId) continue;
    if (Object.prototype.hasOwnProperty.call(values, name)) {
      insertColumns.push(name);
      insertValues.push(values[name]);
      continue;
    }
    const notNull = Number(column.notnull) === 1;
    const hasDefault = column.dflt_value !== null && column.dflt_value !== undefined;
    if (notNull && !hasDefault) {
      throw new Error("UNSUPPORTED_AUTH_SESSIONS_REQUIRED_COLUMN:" + name);
    }
  }

  if (!insertColumns.includes("token") || !insertColumns.includes("user_id") || !insertColumns.includes("expires_at")) {
    throw new Error("AUTH_SESSIONS_SCHEMA_MISSING_REQUIRED_COLUMNS");
  }

  const placeholders = insertColumns.map(() => "?").join(",");
  await env.DB.prepare(
    `INSERT INTO auth_sessions(${insertColumns.join(",")}) VALUES(${placeholders})`
  ).bind(...insertValues).run();

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
    ["sys_balance", "REAL NOT NULL DEFAULT 0"],
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
            COALESCE(u.sys_balance,0) AS sysBalance,
            COALESCE(u.email_verified,0) AS emailVerified,
            COALESCE(u.available_balance, 0) AS availableBalance,
            COALESCE(u.total_locked, 0) AS lockedBalance
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
      availableBalance: Number(row.availableBalance ?? 0),
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
            COALESCE(sys_balance,0) AS sysBalance,
            COALESCE(email_verified,0) AS emailVerified,
            COALESCE(available_balance,0) AS availableBalance,
            COALESCE(total_locked,0) AS lockedBalance
     FROM users WHERE id = ? LIMIT 1`
  ).bind(String(userId)).first<AuthUser>();
}
