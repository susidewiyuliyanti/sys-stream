import { Env, json } from "../../_lib/db";
import { createAuthCookie, createSession, getUserById } from "../../_lib/auth";

async function ensureHandoffTable(env: Env) {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS auth_handoffs (
      code TEXT PRIMARY KEY,
      session_token TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    )`
  ).run();
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  await ensureHandoffTable(env);
  const body = await request.json().catch(() => ({})) as { code?: string };
  const code = String(body.code || "").trim();
  if (!code) return json({ success: false, error: "Handoff code required" }, 400);

  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare(
    "SELECT code, session_token AS sessionToken, expires_at AS expiresAt FROM auth_handoffs WHERE code = ? AND expires_at > ? LIMIT 1"
  ).bind(code, now).first<any>();

  // Always consume the code, even when the stored session is no longer valid.
  await env.DB.prepare("DELETE FROM auth_handoffs WHERE code = ?").bind(code).run();
  if (!row) return json({ success: false, error: "Handoff expired or invalid" }, 401);

  const session = await env.DB.prepare(
    "SELECT user_id AS userId FROM auth_sessions WHERE token = ? AND expires_at > ? LIMIT 1"
  ).bind(String(row.sessionToken), now).first<any>();
  if (!session?.userId) return json({ success: false, error: "Source session expired" }, 401);

  const user = await getUserById(env, String(session.userId));
  if (!user || Number(user.emailVerified || 0) !== 1) {
    return json({ success: false, error: "User session invalid" }, 401);
  }

  // Issue a fresh session for the Airdrop origin while preserving the same user.
  const token = await createSession(env, String(session.userId));
  return new Response(JSON.stringify({ success: true, user }), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": createAuthCookie(token),
    },
  });
}
