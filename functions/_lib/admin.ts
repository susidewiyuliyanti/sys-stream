import { Env, json } from "./db";

const SESSION_TTL_SECONDS = 8 * 60 * 60;

function getCookie(request: Request, name: string) {
  const header = request.headers.get("Cookie") || "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${name.replace(/[.*+?^\\${}()|[\\]\\\\]/g, "\\\\$&")}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

export type AdminIdentity = {
  id: string | null;
  email: string;
  displayName: string;
  role: "OWNER" | "ADMIN";
  source: "account" | "api_key";
};

export async function createAdminSession(env: Env, identity: AdminIdentity) {
  const token = crypto.randomUUID() + "." + crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    "INSERT INTO admin_sessions(token,admin_user_id,created_at,expires_at) VALUES(?,?,?,?)"
  ).bind(token, identity.id, now, now + SESSION_TTL_SECONDS).run();
  return { token, expiresAt: now + SESSION_TTL_SECONDS };
}

export async function requireAdmin(request: Request, env: Env) {
  const bearer = (request.headers.get("Authorization") || "").replace(/^Bearer\\s+/i, "").trim();
  const token = bearer || getCookie(request, "sys_admin_session");
  if (!token) return { ok:false as const, response:json({success:false,error:"Unauthorized admin session"},401) };

  const now = Math.floor(Date.now()/1000);
  const row = await env.DB.prepare(
    `SELECT s.token, s.admin_user_id AS adminUserId,
            a.email, a.display_name AS displayName, a.role
     FROM admin_sessions s
     LEFT JOIN admin_users a ON a.id = s.admin_user_id
     WHERE s.token = ? AND s.expires_at > ? AND (a.id IS NULL OR a.active = 1)
     LIMIT 1`
  ).bind(token, now).first<any>();

  if (!row) return { ok:false as const, response:json({success:false,error:"Admin session expired"},401) };

  const identity: AdminIdentity = row.adminUserId
    ? {
        id: String(row.adminUserId),
        email: String(row.email || ""),
        displayName: String(row.displayName || ""),
        role: String(row.role || "ADMIN").toUpperCase() === "OWNER" ? "OWNER" : "ADMIN",
        source: "account",
      }
    : {
        id: null,
        email: "owner-api-key",
        displayName: "Owner",
        role: "OWNER",
        source: "api_key",
      };

  return { ok:true as const, token, identity };
}

export async function revokeAdminSession(env: Env, token: string) {
  if (!token) return;
  await env.DB.prepare("DELETE FROM admin_sessions WHERE token = ?").bind(token).run();
}

export function adminSessionCookie(token: string, maxAge = SESSION_TTL_SECONDS) {
  return `sys_admin_session=${encodeURIComponent(token)}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

export function clearAdminSessionCookie() {
  return "sys_admin_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict";
}
