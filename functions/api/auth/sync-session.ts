import { Env, json, readJson } from "../../_lib/db";
import { createSession } from "../../_lib/auth";

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    const body=await readJson<{uid?:string;email?:string;displayName?:string;role?:string}>(request);
    const uid=String(body.uid||"").trim();
    const email=String(body.email||"").trim().toLowerCase();
    if(!uid && !email) return json({success:false,error:"Identity required."},400);

    let user=uid ? await env.DB.prepare("SELECT id,username,email,display_name AS displayName,role,COALESCE(available_balance,0) balance,COALESCE(total_locked,0) lockedBalance FROM users WHERE id=? LIMIT 1").bind(uid).first<any>() : null;
    if(!user && email) user=await env.DB.prepare("SELECT id,username,email,display_name AS displayName,role,COALESCE(available_balance,0) balance,COALESCE(total_locked,0) lockedBalance FROM users WHERE lower(email)=lower(?) LIMIT 1").bind(email).first<any>();
    if(!user){
      const id=uid||crypto.randomUUID();
      const username=(email?email.split("@")[0]:"user")+"_"+crypto.randomUUID().slice(0,5);
      await env.DB.prepare("INSERT INTO users(id,username,email,display_name,role,available_balance,total_locked,created_at) VALUES(?,?,?,?,'USER',0,0,?)").bind(id,username,email||null,body.displayName||username,Math.floor(Date.now()/1000)).run();
      user=await env.DB.prepare("SELECT id,username,email,display_name AS displayName,role,COALESCE(available_balance,0) balance,COALESCE(total_locked,0) lockedBalance FROM users WHERE id=? LIMIT 1").bind(id).first<any>();
    }
    const token=await createSession(env,String(user.id));
    return json({success:true,token,user:{...user,id:String(user.id),balance:Number(user.balance||0),lockedBalance:Number(user.lockedBalance||0)}});
  }catch(error){ console.error("sync-session error",error); return json({success:false,error:"Session sync gagal."},500); }
}
