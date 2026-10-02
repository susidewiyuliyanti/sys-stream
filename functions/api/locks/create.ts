import { Env, json, readJson } from "../../../_lib/db";
import { requireAuth } from "../../../_lib/auth";
async function ensureLocks(env:Env){await env.DB.prepare(`CREATE TABLE IF NOT EXISTS locks (
 id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT NOT NULL,amount REAL NOT NULL,duration_days INTEGER NOT NULL,
 multiplier REAL NOT NULL DEFAULT 1,start_date INTEGER NOT NULL,end_date INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'locked',
 daily_claims INTEGER NOT NULL DEFAULT 0,accumulated_yield REAL NOT NULL DEFAULT 0,last_claim_at INTEGER)`).run();}
export async function onRequestPost({request,env}:{request:Request,env:Env}){
 const auth=await requireAuth(request,env);if(!auth.ok)return auth.response;
 try{
  await ensureLocks(env);
  const b=await readJson<{amount?:number;durationDays?:number}>(request);
  const amount=Number(b.amount), days=Number(b.durationDays);
  if(!Number.isFinite(amount)||amount<4)return json({success:false,error:"Minimum lock adalah 4 USDT."},400);
  if(![30,60,90].includes(days))return json({success:false,error:"Durasi lock harus 30, 60, atau 90 hari."},400);
  const active=await env.DB.prepare("SELECT id FROM locks WHERE user_id=? AND status='locked' LIMIT 1").bind(auth.user.id).first<any>();
  if(active)return json({success:false,error:"Masih ada lock aktif. Selesaikan lock sebelumnya terlebih dahulu."},400);
  const u=await env.DB.prepare(`SELECT CASE WHEN COALESCE(available_balance,0)>0 THEN COALESCE(available_balance,0) ELSE COALESCE(balance,0) END AS balance,
    CASE WHEN COALESCE(total_locked,0)>0 THEN COALESCE(total_locked,0) ELSE COALESCE(locked_saldo,0) END AS locked
    FROM users WHERE id=? LIMIT 1`).bind(auth.user.id).first<any>();
  const balance=Number(u?.balance||0), locked=Number(u?.locked||0);
  if(balance<amount)return json({success:false,error:`Saldo tersedia hanya ${balance.toFixed(4)} USDT.`},400);
  const multiplier=days===30?1.10:days===60?1.15:1.20;
  const start=Date.now(), end=start+days*86400000;
  const remaining=balance-amount, newLocked=locked+amount;
  const ins=await env.DB.prepare(`INSERT INTO locks(user_id,amount,duration_days,multiplier,start_date,end_date,status)
    VALUES(?,?,?,?,?,?,'locked')`).bind(auth.user.id,amount,days,multiplier,start,end).run();
  await env.DB.prepare("UPDATE users SET available_balance=?,balance=?,total_locked=?,locked_saldo=? WHERE id=?")
    .bind(remaining,remaining,newLocked,newLocked,auth.user.id).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT NOT NULL,type TEXT NOT NULL,amount REAL NOT NULL,currency TEXT NOT NULL DEFAULT 'USDT',
    status TEXT NOT NULL DEFAULT 'PENDING',reference TEXT,description TEXT,metadata TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare(`INSERT INTO transactions(user_id,type,amount,currency,status,reference,description)
    VALUES(?,?,?,?,?,?,?)`).bind(auth.user.id,"LOCK",-amount,"USDT","COMPLETED",`LOCK-${ins.meta.last_row_id}`,"USDT balance locked").run();
  return json({success:true,lockId:String(ins.meta.last_row_id),amount,durationDays:days,multiplier,startDate:start,endDate:end,status:"locked",remainingBalance:remaining,lockedBalance:newLocked});
 }catch(e){console.error("lock create",e);return json({success:false,error:"Gagal melakukan lock saldo."},500)}
}
