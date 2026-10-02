import { Env, json } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

async function ensureLocks(env: Env){
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS locks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    duration_days INTEGER NOT NULL,
    multiplier REAL NOT NULL DEFAULT 1,
    start_date INTEGER NOT NULL,
    end_date INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'locked',
    daily_claims INTEGER NOT NULL DEFAULT 0,
    accumulated_yield REAL NOT NULL DEFAULT 0,
    last_claim_at INTEGER
  )`).run();
}
export async function onRequestGet({request,env}:{request:Request,env:Env}){
 const auth=await requireAuth(request,env); if(!auth.ok)return auth.response;
 try{
  await ensureLocks(env);
  const r=await env.DB.prepare(`SELECT id,user_id AS userId,amount,duration_days AS durationDays,multiplier,
    start_date AS startDate,end_date AS endDate,status,daily_claims AS dailyClaims,
    accumulated_yield AS accumulatedYieldCoins
    FROM locks WHERE user_id=? ORDER BY id DESC`).bind(auth.user.id).all();
  return json({success:true,locks:r.results||[]});
 }catch(e){console.error("locks get",e);return json({success:false,error:"Gagal mengambil data lock."},500)}
}
