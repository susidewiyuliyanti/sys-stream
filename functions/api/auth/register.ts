import { Env, json, readJson } from "../../_lib/db";
import { createSession, hashPassword } from "../../_lib/auth";

function validEmail(value:string){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    const body = await readJson<{ username?:string; email?:string; password?:string; displayName?:string }>(request);
    const username=String(body.username||"").trim();
    const email=String(body.email||"").trim().toLowerCase();
    const password=String(body.password||"");
    const displayName=String(body.displayName||username).trim() || username;
    if(!/^[a-zA-Z0-9_]{3,32}$/.test(username)) return json({success:false,error:"Username 3-32 karakter: huruf, angka, underscore."},400);
    if(!validEmail(email)) return json({success:false,error:"Email tidak valid."},400);
    if(password.length<6) return json({success:false,error:"Password minimal 6 karakter."},400);

    const exists=await env.DB.prepare("SELECT id FROM users WHERE lower(username)=lower(?) OR lower(email)=lower(?) LIMIT 1").bind(username,email).first();
    if(exists) return json({success:false,error:"Username atau email sudah terdaftar."},409);

    const id=crypto.randomUUID();
    const passwordHash=await hashPassword(password);
    const referralCode="SYS-"+username.toUpperCase().slice(0,12)+"-"+crypto.randomUUID().slice(0,6).toUpperCase();
    await env.DB.prepare(
      `INSERT INTO users(id,username,email,password_hash,display_name,role,available_balance,total_locked,referral_code,created_at)
       VALUES(?,?,?,?,?,'USER',0,0,?,?)`
    ).bind(id,username,email,passwordHash,displayName,referralCode,Math.floor(Date.now()/1000)).run();

    const token=await createSession(env,id);
    return json({success:true,token,user:{id,username,email,displayName,role:"USER",balance:0,lockedBalance:0}});
  }catch(error){
    console.error("register error",error);
    return json({success:false,error:"Registrasi gagal di server."},500);
  }
}
