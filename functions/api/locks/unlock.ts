import { Env, json, readJson } from "../../_lib/db";
import { requireAuth } from "../../../_lib/auth";
async function ensureLocks(env:Env){await env.DB.prepare(`CREATE TABLE IF NOT EXISTS locks (
 id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT NOT NULL,amount REAL NOT NULL,duration_days INTEGER NOT NULL,multiplier REAL NOT NULL DEFAULT 1,start_date INTEGER NOT NULL,end_date INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'locked',daily_claims INTEGER NOT NULL DEFAULT 0,accumulated_yield REAL NOT NULL DEFAULT 0,last_claim_at INTEGER)`).run();}
export async function onRequestPost({request,env}:{request:Request,env:Env}){
 const auth=await requireAuth(request,env);if(!auth.ok)return auth.response;
 try{
  await ensureLocks(env);const b=await readJson<{lockId?:string}>(request);const id=Number(b.lockId);
  const l=await env.DB.prepare("SELECT * FROM locks WHERE id=? AND user_id=? LIMIT 1").bind(id,auth.user.id).first<any>();
  if(!l)return json({success:false,error:"Lock tidak ditemukan."},404);
  if(l.status!=="locked")return json({success:false,error:"Lock sudah tidak aktif."},400);
  const amount=Number(l.amount);const u=await env.DB.prepare(`SELECT CASE WHEN COALESCE(available_balance,0)>0 THEN COALESCE(available_balance,0) ELSE COALESCE(balance,0) END AS balance,
    CASE WHEN COALESCE(total_locked,0)>0 THEN COALESCE(total_locked,0) ELSE COALESCE(locked_saldo,0) END AS locked FROM users WHERE id=?`).bind(auth.user.id).first<any>();
  const balance=Number(u?.balance||0),locked=Number(u?.locked||0);
  const newLocked=Math.max(0,locked-amount),newBalance=balance+amount;
  await env.DB.prepare("UPDATE users SET available_balance=?,balance=?,total_locked=?,locked_saldo=? WHERE id=?").bind(newBalance,newBalance,newLocked,newLocked,auth.user.id).run();
  await env.DB.prepare("UPDATE locks SET status='unlocked' WHERE id=?").bind(id).run();
  return json({success:true,payout:amount,balance:newBalance,lockedBalance:newLocked});
 }catch(e){console.error("lock unlock",e);return json({success:false,error:"Gagal unlock saldo."},500)}
}
