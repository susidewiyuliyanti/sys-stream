import { Env, json } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

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
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  await ensureHandoffTable(env);
  const code = crypto.randomUUID() + crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + 120;
  await env.DB.prepare(
    "INSERT INTO auth_handoffs(code,session_token,expires_at) VALUES(?,?,?)"
  ).bind(code, auth.token, expiresAt).run();

  return json({ success: true, code, expiresAt });
}
