import { Env, json } from "./db";

async function ensureAdminSessions(env: Env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    )
  `).run();
}

export async function createAdminSession(env: Env) {
  await ensureAdminSessions(env);
  const token = crypto.randomUUID() + "." + crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    "INSERT INTO admin_sessions(token,created_at,expires_at) VALUES(?,?,?)"
  ).bind(token, now, now + 60 * 60 * 8).run();
  return token;
}

export async function requireAdmin(request: Request, env: Env) {
  const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok:false as const, response:json({success:false,error:"Unauthorized admin session"},401) };

  await ensureAdminSessions(env);
  const row = await env.DB.prepare(
    "SELECT token FROM admin_sessions WHERE token = ? AND expires_at > ? LIMIT 1"
  ).bind(token, Math.floor(Date.now()/1000)).first();

  if (!row) return { ok:false as const, response:json({success:false,error:"Admin session expired"},401) };
  return { ok:true as const, token };
}
