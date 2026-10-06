import { Env, json, readJson } from "../../_lib/db";
import { createSession, verifyPassword, createAuthCookie } from "../../_lib/auth";

async function ensureWalletColumn(env: Env) {
  const columns = await env.DB.prepare("PRAGMA table_info(users)").all();
  const names = new Set((columns.results || []).map((r:any) => String(r.name)));
  if (!names.has("wallet_address")) {
    try { await env.DB.prepare("ALTER TABLE users ADD COLUMN wallet_address TEXT").run(); } catch {}
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    await ensureWalletColumn(env);
    const body = await readJson<{ identifier?: string; username?: string; email?: string; password?: string }>(request);
    const identifier = String(body.identifier ?? body.username ?? body.email ?? "").trim();
    const password = String(body.password ?? "");
    if (!identifier || password.length < 6) return json({success:false, error:"Username atau wallet dan password minimal 6 karakter wajib diisi."},400);

    const user = await env.DB.prepare(
      `SELECT id, username, email, password_hash, display_name AS displayName, role,
              COALESCE(email_verified,0) AS emailVerified,
              COALESCE(available_balance,0) AS availableBalance,
              COALESCE(total_locked,0) AS lockedBalance,
              wallet_address AS walletAddress,
              referral_code AS referralCode
       FROM users
       WHERE lower(username)=lower(?) OR lower(wallet_address)=lower(?) OR lower(email)=lower(?)
       LIMIT 1`
    ).bind(identifier, identifier, identifier).first<any>();

    if (!user || !user.password_hash || !(await verifyPassword(password, user.password_hash))) {
      return json({success:false, error:"Username atau wallet atau password salah."},401);
    }


    const token = await createSession(env, String(user.id));
    return new Response(JSON.stringify({
      success:true, token,
      user:{
        id:String(user.id), username:user.username, email:user.email,
        displayName:user.displayName, role:user.role || "USER",
        availableBalance:Number(user.availableBalance||0), lockedBalance:Number(user.lockedBalance||0),
        walletAddress:user.walletAddress || null, referralCode:user.referralCode || null,
        emailVerified:true
      }
    }), {
      headers: { "Content-Type": "application/json", "Set-Cookie": createAuthCookie(token) },
    });
  } catch (error) {
    console.error("login error", error);
    return json({ success:false,error:"Login gagal di server." },500);
  }
}
