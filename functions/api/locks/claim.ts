import { Env, json, readJson } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";
async function ensureLocks(env:Env){await env.DB.prepare(`CREATE TABLE IF NOT EXISTS locks (
 id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT NOT NULL,amount REAL NOT NULL,duration_days INTEGER NOT NULL,multiplier REAL NOT NULL DEFAULT 1,
 start_date INTEGER NOT NULL,end_date INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'locked',daily_claims INTEGER NOT NULL DEFAULT 0,accumulated_yield REAL NOT NULL DEFAULT 0,last_claim_at INTEGER)`).run();}
export async function onRequestPost({request,env}:{request:Request,env:Env}){
 const auth=await requireAuth(request,env);if(!auth.ok)return auth.response;
 try{
  await ensureLocks(env);const b=await readJson<{lockId?:string}>(request);const id=Number(b.lockId);
  const l=await env.DB.prepare("SELECT * FROM locks WHERE id=? AND user_id=? LIMIT 1").bind(id,auth.user.id).first<any>();
  if(!l)return json({success:false,error:"Lock tidak ditemukan."},404);
  if(l.status!=="locked")return json({success:false,error:"Lock sudah tidak aktif."},400);
  const now=Date.now();const last=Number(l.last_claim_at||l.start_date);const day=Math.floor((now-Number(l.start_date))/86400000);
  const claimedDays=Number(l.daily_claims||0);
  const eligible=Math.min(Math.max(day+1,0),Number(l.duration_days));
  if(eligible<=claimedDays)return json({success:false,error:"Daily yield hari ini sudah diklaim."},400);
  const totalYield=Number(l.amount)*(Number(l.multiplier)-1);
  const perDay=totalYield/Number(l.duration_days);
  const claimAmount=perDay*(eligible-claimedDays);
  const u=await env.DB.prepare(`SELECT CASE WHEN COALESCE(available_balance,0)>0 THEN COALESCE(available_balance,0) ELSE COALESCE(balance,0) END AS balance FROM users WHERE id=?`).bind(auth.user.id).first<any>();
  const balance=Number(u?.balance||0),newBalance=balance+claimAmount;
  await env.DB.prepare("UPDATE users SET available_balance=?,balance=? WHERE id=?").bind(newBalance,newBalance,auth.user.id).run();
  await env.DB.prepare("UPDATE locks SET daily_claims=?,accumulated_yield=?,last_claim_at=? WHERE id=?").bind(eligible,Number(l.accumulated_yield||0)+claimAmount,now,id).run();
  return json({success:true,claimedAmount:claimAmount,newBalance});
 }catch(e){console.error("lock claim",e);return json({success:false,error:"Gagal claim daily yield."},500)}
}
