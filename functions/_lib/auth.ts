import { Env,json } from "./db";
export interface AuthUser { id:string; username?:string; email?:string; displayName?:string; role?:string; balance?:number; lockedBalance?:number; walletBalance?:number; saldo?:number }
function decode(token:string):any{try{const p=token.split(".")[1];const n=p.replace(/-/g,"+").replace(/_/g,"/");return JSON.parse(atob(n+"=".repeat((4-n.length%4)%4)))}catch{return null}}
export async function requireAuth(request:Request,env:Env){
 const m=(request.headers.get("Authorization")||"").match(/^Bearer\s+(.+)$/i);
 if(!m)return {ok:false as const,response:json({success:false,error:"Unauthorized"},401)};
 const payload=decode(m[1]); const userId=payload?.sub||payload?.uid;
 if(!userId)return {ok:false as const,response:json({success:false,error:"Invalid token"},401)};
 const user=await env.DB.prepare("SELECT id, username, available_balance AS balance, total_locked AS lockedBalance FROM users WHERE id = ? LIMIT 1").bind(String(userId)).first<AuthUser>();
 if(!user)return {ok:false as const,response:json({success:false,error:"User not found"},401)};
 return {ok:true as const,user:{...user,id:String(user.id),balance:Number(user.balance??0),lockedBalance:Number(user.lockedBalance??0)}};
}
