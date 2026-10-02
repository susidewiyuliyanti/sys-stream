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

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
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
    return json({success:false,error:"Registrasi gagal di server."},500);
  }
}
