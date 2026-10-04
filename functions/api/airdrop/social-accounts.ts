import { Env } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

const ALLOWED = new Set(["tiktok","instagram","youtube","twitter","facebook","telegram","discord"]);

function response(request: Request, body: unknown, status = 200) {
  const origin = request.headers.get("Origin") || "";
  const headers = new Headers({"Content-Type":"application/json","Cache-Control":"no-store"});
  if (origin === "https://airdrop.sysstreamer.asia") {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Vary", "Origin");
  }
  return new Response(JSON.stringify(body), {status, headers});
}

export async function onRequestOptions({request}:{request:Request}) {
  const origin=request.headers.get("Origin")||"";
  if(origin!=="https://airdrop.sysstreamer.asia") return new Response(null,{status:403});
  return new Response(null,{status:204,headers:{
    "Access-Control-Allow-Origin":origin,
    "Access-Control-Allow-Credentials":"true",
    "Access-Control-Allow-Methods":"GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":"Content-Type, Authorization",
    "Vary":"Origin"
  }});
}

export async function onRequestGet(context:{request:Request;env:Env}) {
  const auth=await requireAuth(context.request,context.env);
  if(!auth.ok) return response(context.request,{success:false,message:"Login diperlukan."},401);
  const db=context.env.DB;
  await db.prepare("CREATE TABLE IF NOT EXISTS airdrop_social_accounts (wallet_address TEXT NOT NULL, platform TEXT NOT NULL, account TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(wallet_address, platform))").run();
  const wallet=String(auth.user.walletAddress||"").trim().toLowerCase();
  const result=await db.prepare("SELECT platform,account,updated_at FROM airdrop_social_accounts WHERE wallet_address=? ORDER BY platform").bind(wallet).all();
  return response(context.request,{success:true,accounts:result.results||[]});
}

export async function onRequestPost(context:{request:Request;env:Env}) {
  const auth=await requireAuth(context.request,context.env);
  if(!auth.ok) return response(context.request,{success:false,message:"Login diperlukan."},401);
  const body=await context.request.json().catch(()=>({}));
  const platform=String(body.platform||"").trim().toLowerCase();
  const account=String(body.account||"").trim();
  if(!ALLOWED.has(platform)) return response(context.request,{success:false,message:"Platform media sosial tidak didukung."},400);
  if(!account || account.length>160) return response(context.request,{success:false,message:"Username atau link akun wajib diisi."},400);
  const db=context.env.DB;
  await db.prepare("CREATE TABLE IF NOT EXISTS airdrop_social_accounts (wallet_address TEXT NOT NULL, platform TEXT NOT NULL, account TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(wallet_address, platform))").run();
  const wallet=String(auth.user.walletAddress||"").trim().toLowerCase();
  await db.prepare("INSERT INTO airdrop_social_accounts (wallet_address,platform,account,updated_at) VALUES (?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(wallet_address,platform) DO UPDATE SET account=excluded.account,updated_at=CURRENT_TIMESTAMP").bind(wallet,platform,account).run();
  return response(context.request,{success:true,platform,account});
}