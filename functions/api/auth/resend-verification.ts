import { Env, json, readJson } from "../../_lib/db";
import {
  createVerificationToken,
  hashVerificationToken,
  sendVerificationEmail,
  verificationExpiry,
} from "../../_lib/email";

const PRODUCTION_ORIGIN = "https://sysstreamer.asia";

async function ensureVerificationSchema(env: Env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS email_verification_tokens_v2 (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL, used_at INTEGER, created_at INTEGER NOT NULL
  )`).run();

  const info = await env.DB.prepare("PRAGMA table_info(email_verification_tokens_v2)").all();
  const existing = new Set((info.results || []).map((r:any) => String(r.name)));
  const additions: Array<[string,string]> = [
    ["id","TEXT"],["user_id","TEXT"],["token_hash","TEXT"],["expires_at","INTEGER"],
    ["used_at","INTEGER"],["created_at","INTEGER"]
  ];
  for (const [name,definition] of additions) {
    if (!existing.has(name)) {
      try {
        await env.DB.prepare(`ALTER TABLE email_verification_tokens_v2 ADD COLUMN ${name} ${definition}`).run();
      } catch (error) {
        console.error("resend schema repair skipped",{name,error:String(error)});
      }
    }
  }
}

const GENERIC_RESPONSE = {
  success: true,
  message: "Jika akun dengan email tersebut membutuhkan verifikasi, instruksi verifikasi akan dikirim.",
};

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    await ensureVerificationSchema(env);

    const body = await readJson<{ email?: string }>(request);
    const email = String(body.email || "").trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(GENERIC_RESPONSE);

    const user = await env.DB.prepare(
      `SELECT id, email, email_verified FROM users
       WHERE lower(email) = lower(?) LIMIT 1`
    ).bind(email).first<any>();

    if (!user || Number(user.email_verified || 0) === 1) return json(GENERIC_RESPONSE);

    const now = Math.floor(Date.now() / 1000);
    const recent = await env.DB.prepare(
      `SELECT created_at FROM email_verification_tokens_v2
       WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`
    ).bind(String(user.id)).first<any>();

    if (recent && now - Number(recent.created_at) < 60) return json(GENERIC_RESPONSE);

    await env.DB.prepare("DELETE FROM email_verification_tokens_v2 WHERE user_id = ?")
      .bind(String(user.id)).run();

    const token = createVerificationToken();
    const tokenHash = await hashVerificationToken(token);
    await env.DB.prepare(
      `INSERT INTO email_verification_tokens_v2(id,user_id,token_hash,expires_at,used_at,created_at)
       VALUES(?,?,?,?,NULL,?)`
    ).bind(crypto.randomUUID(), String(user.id), tokenHash, verificationExpiry(), now).run();

    const sent = await sendVerificationEmail(env, email, token, PRODUCTION_ORIGIN);

    if (!sent.ok) {
      console.error("resend verification email failed", { email, error: sent.error });
    }

    return json(GENERIC_RESPONSE);
  } catch (error) {
    console.error("resend verification error", error);
    return json(GENERIC_RESPONSE);
  }
}
