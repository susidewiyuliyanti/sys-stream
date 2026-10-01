import { Env, json } from "./db";

const SESSION_TTL_SECONDS = 8 * 60 * 60;

async function ensureAdminSessions(env: Env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    )
  `).run();
}

function getCookie(request: Request, name: string) {
  const header = request.headers.get("Cookie") || "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

export async function createAdminSession(env: Env) {
  await ensureAdminSessions(env);
  const token = crypto.randomUUID() + "." + crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    "INSERT INTO admin_sessions(token,created_at,expires_at) VALUES(?,?,?)"
  ).bind(token, now, now + SESSION_TTL_SECONDS).run();
  return { token, expiresAt: now + SESSION_TTL_SECONDS };
}

export async function requireAdmin(request: Request, env: Env) {
  const bearer = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  const token = bearer || getCookie(request, "sys_admin_session");
  if (!token) return { ok:false as const, response:json({success:false,error:"Unauthorized admin session"},401) };

  await ensureAdminSessions(env);
  const now = Math.floor(Date.now()/1000);
  const row = await env.DB.prepare(
    "SELECT token FROM admin_sessions WHERE token = ? AND expires_at > ? LIMIT 1"
  ).bind(token, now).first();

  if (!row) return { ok:false as const, response:json({success:false,error:"Admin session expired"},401) };
  return { ok:true as const, token };
}

export async function revokeAdminSession(env: Env, token: string) {
  if (!token) return;
  await ensureAdminSessions(env);
  await env.DB.prepare("DELETE FROM admin_sessions WHERE token = ?").bind(token).run();
}

export function adminSessionCookie(token: string, maxAge = SESSION_TTL_SECONDS) {
  return `sys_admin_session=${encodeURIComponent(token)}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

export function clearAdminSessionCookie() {
  return "sys_admin_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict";
}
