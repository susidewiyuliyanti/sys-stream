import { Env } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

const ALLOWED = new Set(["tiktok","instagram","youtube","twitter","facebook","telegram","discord"]);
const OFFICIAL_PLATFORMS = ["tiktok","instagram","youtube","telegram","facebook","discord","twitter"];

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

async function ensureTables(db: D1Database) {
  await db.prepare("CREATE TABLE IF NOT EXISTS airdrop_follow_gate (wallet_address TEXT PRIMARY KEY, confirmed INTEGER NOT NULL DEFAULT 0, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS airdrop_follow_status (wallet_address TEXT NOT NULL, platform TEXT NOT NULL, confirmed INTEGER NOT NULL DEFAULT 0, verification_method TEXT, verified_at TEXT, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(wallet_address, platform))").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS airdrop_social_accounts (wallet_address TEXT NOT NULL, platform TEXT NOT NULL, account TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(wallet_address, platform))").run();
}

async function getVerifiedStatus(db: D1Database, wallet: string) {
  const rows = await db.prepare(
    "SELECT platform,confirmed FROM airdrop_follow_status WHERE wallet_address=? AND confirmed=1 AND verification_method IS NOT NULL"
  ).bind(wallet).all();

  const status:Record<string,boolean> = {};
  for (const row of (rows.results || []) as any[]) {
    status[String(row.platform)] = Number(row.confirmed || 0) === 1;
  }

  const allFollowed = OFFICIAL_PLATFORMS.every(platform => status[platform] === true);
  return {status, allFollowed};
}

async function verifyTikTokFollow(env: Env, wallet: string) {
  const researchToken = String((env as any).TIKTOK_RESEARCH_ACCESS_TOKEN || "").trim();
  const officialUsername = String((env as any).TIKTOK_OFFICIAL_USERNAME || "").trim().replace(/^@/,"").toLowerCase();
  if (!researchToken || !officialUsername) {
    return {verified:false, available:false, message:"TikTok follow verification is not configured yet."};
  }

  const connection = await env.DB.prepare(
    "SELECT username,display_name FROM airdrop_social_connections WHERE wallet_address=? AND platform='tiktok' LIMIT 1"
  ).bind(wallet).first<any>();

  const username = String(connection?.username || "").trim().replace(/^@/,"").toLowerCase();
  if (!username) {
    return {verified:false, available:true, message:"Connect your TikTok account first so the server can verify the follow."};
  }

  let cursor: number | null = null;
  for (let page=0; page<50; page++) {
    const body:any = {username, max_count:100};
    if (cursor) body.cursor = cursor;

    const res = await fetch("https://open.tiktokapis.com/v2/research/user/following/", {
      method:"POST",
      headers:{
        "Authorization":"Bearer "+researchToken,
        "Content-Type":"application/json"
      },
      body:JSON.stringify(body)
    });
    const data:any = await res.json().catch(()=>({}));
    if (!res.ok || data?.error?.code && data.error.code !== "ok") {
      return {verified:false, available:true, message:"TikTok follow verification could not be completed."};
    }

    const following = Array.isArray(data?.data?.user_following) ? data.data.user_following : [];
    const found = following.some((item:any) =>
      String(item?.username || "").replace(/^@/,"").toLowerCase() === officialUsername
    );
    if (found) return {verified:true, available:true, message:"TikTok follow verified."};

    if (!data?.data?.has_more) break;
    cursor = Number(data.data.cursor || 0) || null;
    if (!cursor) break;
  }

  return {verified:false, available:true, message:"TikTok follow was not verified."};
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
  await ensureTables(db);
  const wallet=String(auth.user.walletAddress||"").trim().toLowerCase();

  const result=await db.prepare("SELECT platform,account,updated_at FROM airdrop_social_accounts WHERE wallet_address=? ORDER BY platform").bind(wallet).all();
  const verified=await getVerifiedStatus(db,wallet);

  await db.prepare(
    "INSERT INTO airdrop_follow_gate(wallet_address,confirmed,updated_at) VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(wallet_address) DO UPDATE SET confirmed=excluded.confirmed,updated_at=CURRENT_TIMESTAMP"
  ).bind(wallet,verified.allFollowed?1:0).run();

  return response(context.request,{
    success:true,
    accounts:result.results||[],
    followConfirmed:verified.allFollowed,
    followStatus:verified.status
  });
}

export async function onRequestPost(context:{request:Request;env:Env}) {
  const auth=await requireAuth(context.request,context.env);
  if(!auth.ok) return response(context.request,{success:false,message:"Login diperlukan."},401);

  const body=await context.request.json().catch(()=>({}));
  const db=context.env.DB;
  const wallet=String(auth.user.walletAddress||"").trim().toLowerCase();
  if(!wallet) return response(context.request,{success:false,message:"Wallet tidak ditemukan."},400);
  await ensureTables(db);

  if (body.action === "confirm_platform" || body.action === "confirm_follow") {
    return response(context.request,{
      success:false,
      message:"Manual follow confirmation is disabled. Follow status can only be granted by server-side verification."
    },403);
  }

  if (body.action === "verify_platform") {
    const platform=String(body.platform||"").trim().toLowerCase();
    if(!OFFICIAL_PLATFORMS.includes(platform)) {
      return response(context.request,{success:false,message:"Platform media sosial tidak didukung."},400);
    }

    let verification:{verified:boolean;available:boolean;message:string};
    if (platform === "tiktok") {
      verification = await verifyTikTokFollow(context.env,wallet);
    } else {
      verification = {
        verified:false,
        available:false,
        message:"Follow verification for this platform is not connected to an official verification API yet."
      };
    }

    if (!verification.verified) {
      const current=await getVerifiedStatus(db,wallet);
      await db.prepare(
        "INSERT INTO airdrop_follow_gate(wallet_address,confirmed,updated_at) VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(wallet_address) DO UPDATE SET confirmed=excluded.confirmed,updated_at=CURRENT_TIMESTAMP"
      ).bind(wallet,current.allFollowed?1:0).run();
      return response(context.request,{
        success:false,
        verified:false,
        verificationAvailable:verification.available,
        message:verification.message,
        followConfirmed:current.allFollowed,
        followStatus:current.status
      },verification.available?409:501);
    }

    await db.prepare(
      "INSERT INTO airdrop_follow_status(wallet_address,platform,confirmed,verification_method,verified_at,updated_at) VALUES(?,?,1,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT(wallet_address,platform) DO UPDATE SET confirmed=1,verification_method=excluded.verification_method,verified_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP"
    ).bind(wallet,platform,platform+"_official_api").run();

    const current=await getVerifiedStatus(db,wallet);
    await db.prepare(
      "INSERT INTO airdrop_follow_gate(wallet_address,confirmed,updated_at) VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(wallet_address) DO UPDATE SET confirmed=excluded.confirmed,updated_at=CURRENT_TIMESTAMP"
    ).bind(wallet,current.allFollowed?1:0).run();

    return response(context.request,{
      success:true,
      verified:true,
      followConfirmed:current.allFollowed,
      followStatus:current.status,
      message:verification.message
    });
  }

  const platform=String(body.platform||"").trim().toLowerCase();
  const account=String(body.account||"").trim();
  if(!ALLOWED.has(platform)) return response(context.request,{success:false,message:"Platform media sosial tidak didukung."},400);
  if(!account || account.length>160) return response(context.request,{success:false,message:"Username atau link akun wajib diisi."},400);

  await db.prepare(
    "INSERT INTO airdrop_social_accounts (wallet_address,platform,account,updated_at) VALUES (?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(wallet_address,platform) DO UPDATE SET account=excluded.account,updated_at=CURRENT_TIMESTAMP"
  ).bind(wallet,platform,account).run();

  return response(context.request,{success:true,platform,account});
}