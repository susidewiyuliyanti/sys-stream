import { Env, json, readJson } from "../../_lib/db";
import { hashPassword } from "../../_lib/auth";
import {
  createVerificationToken,
  hashVerificationToken,
  sendVerificationEmail,
  verificationExpiry,
} from "../../_lib/email";

const TERMS_VERSION = "2026-10-01";

function validEmail(value:string){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
async function ensureRegistrationSchema(env: Env) {
  const info = await env.DB.prepare("PRAGMA table_info(users)").all<any>();
  const columns = new Set((info.results || []).map((row:any) => String(row.name)));
  const additions: Array<[string,string]> = [
    ["email", "ALTER TABLE users ADD COLUMN email TEXT"],
    ["password_hash", "ALTER TABLE users ADD COLUMN password_hash TEXT"],
    ["display_name", "ALTER TABLE users ADD COLUMN display_name TEXT"],
    ["role", "ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'USER'"],
    ["terms_version", "ALTER TABLE users ADD COLUMN terms_version TEXT"],
    ["terms_accepted_at", "ALTER TABLE users ADD COLUMN terms_accepted_at INTEGER"],
    ["email_verified", "ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 1"],
    ["email_verified_at", "ALTER TABLE users ADD COLUMN email_verified_at INTEGER"],
    ["referral_count", "ALTER TABLE users ADD COLUMN referral_count INTEGER NOT NULL DEFAULT 0"]
  ];
  for (const [name, sql] of additions) {
    if (!columns.has(name)) {
      try { await env.DB.prepare(sql).run(); } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (!/duplicate column|already exists/i.test(message)) throw e;
      }
    }
  }
  await env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS terms_acceptances (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,terms_version TEXT NOT NULL,accepted_at INTEGER NOT NULL,created_at INTEGER NOT NULL)").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS email_verification_tokens (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,token_hash TEXT NOT NULL UNIQUE,expires_at INTEGER NOT NULL,used_at INTEGER,created_at INTEGER NOT NULL)").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS referrals (id TEXT PRIMARY KEY,referrer_user_id TEXT NOT NULL,referred_user_id TEXT NOT NULL UNIQUE,referral_code TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'ACTIVE',created_at INTEGER NOT NULL)").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS auth_sessions (token TEXT PRIMARY KEY,user_id TEXT NOT NULL,expires_at INTEGER NOT NULL,created_at INTEGER NOT NULL DEFAULT (unixepoch()))").run();
}


export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    await ensureRegistrationSchema(env);
    const body = await readJson<{
      username?:string;
      email?:string;
      password?:string;
      displayName?:string;
      termsAccepted?:boolean;
      termsVersion?:string;
      referralCode?:string;
    }>(request);

    const username=String(body.username||"").trim();
    const email=String(body.email||"").trim().toLowerCase();
    const password=String(body.password||"");
    const displayName=String(body.displayName||username).trim() || username;
    const incomingReferralCode=String(body.referralCode||"").trim();

    if(!/^[a-zA-Z0-9_]{3,32}$/.test(username)) return json({success:false,error:"Username 3-32 karakter: huruf, angka, underscore."},400);
    if(!validEmail(email)) return json({success:false,error:"Email tidak valid."},400);
    if(password.length<6) return json({success:false,error:"Password minimal 6 karakter."},400);
    if(body.termsAccepted !== true || String(body.termsVersion || "") !== TERMS_VERSION) {
      return json({success:false,error:"Anda harus menyetujui Terms & Conditions versi terbaru sebelum membuat akun."},400);
    }

    const exists=await env.DB.prepare("SELECT id FROM users WHERE lower(username)=lower(?) OR lower(email)=lower(?) LIMIT 1").bind(username,email).first();
    if(exists) return json({success:false,error:"Username atau email sudah terdaftar."},409);

    const id=crypto.randomUUID();
    const passwordHash=await hashPassword(password);
    const userReferralCode="SYS-"+username.toUpperCase().slice(0,12)+"-"+crypto.randomUUID().slice(0,6).toUpperCase();
    const acceptedAt=Math.floor(Date.now()/1000);
    const acceptanceId=crypto.randomUUID();
    const verificationToken=createVerificationToken();
    const verificationHash=await hashVerificationToken(verificationToken);
    const verificationId=crypto.randomUUID();
    const verificationExpires=verificationExpiry();
    let referrer:any = null;
    if (incomingReferralCode) {
      referrer = await env.DB.prepare(
        "SELECT id, referral_code FROM users WHERE upper(referral_code)=upper(?) LIMIT 1"
      ).bind(incomingReferralCode).first();
      if (referrer && String(referrer.id) === id) referrer = null;
    }

    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO users(id,username,email,password_hash,display_name,role,available_balance,total_locked,referral_code,created_at,terms_version,terms_accepted_at,email_verified,email_verified_at)
         VALUES(?,?,?,?,?,'USER',0,0,?,?,?,?,0,NULL)`
      ).bind(id,username,email,passwordHash,displayName,userReferralCode,acceptedAt,TERMS_VERSION,acceptedAt),
      env.DB.prepare(
        `INSERT INTO terms_acceptances(id,user_id,terms_version,accepted_at,created_at)
         VALUES(?,?,?,?,?)`
      ).bind(acceptanceId,id,TERMS_VERSION,acceptedAt,acceptedAt),
      env.DB.prepare(
        `INSERT INTO email_verification_tokens(id,user_id,token_hash,expires_at,used_at,created_at)
         VALUES(?,?,?,?,NULL,?)`
      ).bind(verificationId,id,verificationHash,verificationExpires,acceptedAt),
      ...(referrer ? [
        env.DB.prepare(
          `INSERT INTO referrals(id,referrer_user_id,referred_user_id,referral_code,status,created_at)
           VALUES(?,?,?,?, 'ACTIVE', ?)`
        ).bind(crypto.randomUUID(), String(referrer.id), id, String(referrer.referral_code), acceptedAt),
        env.DB.prepare(
          "UPDATE users SET referral_count = referral_count + 1 WHERE id = ?"
        ).bind(String(referrer.id)),
      ] : []),
    ]);

    const origin = new URL(request.url).origin;
    const sent = await sendVerificationEmail(env, email, verificationToken, origin);

    if (!sent.ok) {
      console.error("registration verification email failed", sent.error);
      return json({
        success:false,
        code:"EMAIL_SERVICE_UNAVAILABLE",
        requiresEmailVerification:true,
        email,
        error:"Akun sudah dibuat tetapi email verifikasi belum dapat dikirim. Setelah layanan email aktif, gunakan Kirim Ulang Verifikasi."
      },503);
    }

    return json({
      success:true,
      requiresEmailVerification:true,
      email,
      message:"Akun dibuat. Silakan verifikasi email sebelum login."
    });
  }catch(error){
    console.error("register error",error);
    return json({success:false,code:"REGISTRATION_SERVER_ERROR",error:"Registrasi gagal diproses di server. Silakan coba lagi."},500);
  }
}
