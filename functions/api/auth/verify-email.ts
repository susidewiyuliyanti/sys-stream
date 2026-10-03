import { Env, json } from "../../_lib/db";
import { hashVerificationToken } from "../../_lib/email";

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  try {
    const url = new URL(request.url);
    const token = String(url.searchParams.get("token") || "").trim();

    if (!token || token.length < 40 || token.length > 200) {
      return json({ success: false, error: "Token verifikasi tidak valid." }, 400);
    }

    const tokenHash = await hashVerificationToken(token);
    const now = Math.floor(Date.now() / 1000);

    const record = await env.DB.prepare(
      `SELECT id, user_id, expires_at, used_at
       FROM email_verification_tokens_v2
       WHERE token_hash = ?
       LIMIT 1`
    ).bind(tokenHash).first<any>();

    if (!record || record.used_at || Number(record.expires_at) <= now) {
      return json({ success: false, error: "Link verifikasi tidak valid atau sudah kedaluwarsa." }, 400);
    }

    const consumed = await env.DB.prepare(
      `UPDATE email_verification_tokens_v2
       SET used_at = ?
       WHERE id = ? AND used_at IS NULL AND expires_at > ?`
    ).bind(now, String(record.id), now).run();

    if (Number(consumed.meta?.changes || 0) !== 1) {
      return json({ success: false, error: "Link verifikasi sudah digunakan atau kedaluwarsa." }, 400);
    }

    await env.DB.prepare(
      `UPDATE users
       SET email_verified = 1, email_verified_at = ?
       WHERE id = ?`
    ).bind(now, String(record.user_id)).run();

    return json({ success: true, message: "Email berhasil diverifikasi. Silakan login." });
  } catch (error) {
    console.error("verify email error", error);
    return json({ success: false, error: "Verifikasi email gagal diproses." }, 500);
  }
}
