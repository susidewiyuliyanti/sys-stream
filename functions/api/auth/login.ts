import { Env, json, readJson } from "../../_lib/db";
import { createSession, verifyPassword } from "../../_lib/auth";

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    const body = await readJson<{ identifier?: string; username?: string; email?: string; password?: string }>(request);
    const identifier = String(body.identifier ?? body.username ?? body.email ?? "").trim();
    const password = String(body.password ?? "");
    if (!identifier || password.length < 6) return json({success:false, error:"Username/email dan password minimal 6 karakter wajib diisi."},400);

    const user = await env.DB.prepare(
      `SELECT id, username, email, password_hash, display_name AS displayName, role,
              COALESCE(email_verified,0) AS emailVerified,
              COALESCE(available_balance,0) AS balance,
              COALESCE(total_locked,0) AS lockedBalance
       FROM users
       WHERE lower(username)=lower(?) OR lower(email)=lower(?)
       LIMIT 1`
    ).bind(identifier, identifier).first<any>();

    if (!user || !user.password_hash || !(await verifyPassword(password, user.password_hash))) {
      return json({success:false, error:"Username/email atau password salah."},401);
    }

    if (Number(user.emailVerified || 0) !== 1) {
      return json({
        success:false,
        code:"EMAIL_NOT_VERIFIED",
        error:"Email Anda belum diverifikasi. Silakan cek inbox atau kirim ulang email verifikasi.",
        email:user.email
      },403);
    }

    const token = await createSession(env, String(user.id));
    return json({
      success:true, token,
      user:{
        id:String(user.id), username:user.username, email:user.email,
        displayName:user.displayName, role:user.role || "USER",
        balance:Number(user.balance||0), lockedBalance:Number(user.lockedBalance||0),
        emailVerified:true
      }
    });
  } catch (error) {
    console.error("login error", error);
    return json({ success:false,error:"Login gagal di server." },500);
  }
}
