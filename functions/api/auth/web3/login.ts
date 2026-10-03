import { Env, json, readJson } from "../../../_lib/db";
import { createSession } from "../../../_lib/auth";
import { getAddress, isAddress, verifyMessage } from "ethers";

async function ensureSchema(env: Env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS web3_auth_challenges (
    id TEXT PRIMARY KEY, nonce TEXT NOT NULL UNIQUE, wallet_address TEXT NOT NULL,
    message TEXT NOT NULL, expires_at INTEGER NOT NULL, used_at INTEGER, created_at INTEGER NOT NULL
  )`).run();
  const info = await env.DB.prepare("PRAGMA table_info(users)").all();
  const names = new Set((info.results || []).map((r:any)=>String(r.name)));
  for (const [name, def] of [["wallet_address","TEXT"],["email_verified","INTEGER NOT NULL DEFAULT 0"],["referral_code","TEXT"],["referral_count","INTEGER NOT NULL DEFAULT 0"],["available_balance","REAL NOT NULL DEFAULT 0"],["total_locked","REAL NOT NULL DEFAULT 0"],["registration_bonus_idr","REAL NOT NULL DEFAULT 0"],["registration_bonus_granted","INTEGER NOT NULL DEFAULT 0"],["display_name","TEXT"],["role","TEXT NOT NULL DEFAULT 'USER'"],["created_at","INTEGER"]]) {
    if (!names.has(name)) {
      try { await env.DB.prepare(`ALTER TABLE users ADD COLUMN ${name} ${def}`).run(); } catch {}
    }
  }
}

function errorText(error: unknown) { return error instanceof Error ? error.message : String(error); }

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const requestId = crypto.randomUUID();
  try {
    await ensureSchema(env);
    const body = await readJson<{challengeId?:string; walletAddress?:string; message?:string; signature?:string}>(request);
    const rawAddress = String(body.walletAddress || "").trim();
    const challengeId = String(body.challengeId || "").trim();
    const message = String(body.message || "");
    const signature = String(body.signature || "");
    if (!challengeId || !isAddress(rawAddress) || !message || !signature) {
      return json({success:false,error:"Data autentikasi wallet tidak lengkap."},400);
    }
    const walletAddress = getAddress(rawAddress);
    const now = Math.floor(Date.now()/1000);
    const challenge = await env.DB.prepare(
      "SELECT id,wallet_address,message,expires_at,used_at FROM web3_auth_challenges WHERE id=? LIMIT 1"
    ).bind(challengeId).first<any>();
    if (!challenge || Number(challenge.used_at || 0) !== 0 && challenge.used_at !== null) {
      return json({success:false,error:"Challenge wallet tidak valid atau sudah digunakan."},401);
    }
    if (Number(challenge.expires_at) < now) return json({success:false,error:"Challenge wallet sudah kedaluwarsa. Silakan ulangi."},401);
    const challengeWallet = getAddress(String(challenge.wallet_address));
    if (challengeWallet.toLowerCase() !== walletAddress.toLowerCase() || String(challenge.message) !== message) {
      return json({success:false,error:"Challenge wallet tidak cocok."},401);
    }

    let recovered: string;
    try { recovered = getAddress(verifyMessage(message, signature)); }
    catch { return json({success:false,error:"Signature wallet tidak valid."},401); }
    if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
      return json({success:false,error:"Signature wallet tidak cocok dengan alamat wallet."},401);
    }

    const marked = await env.DB.prepare(
      "UPDATE web3_auth_challenges SET used_at=? WHERE id=? AND used_at IS NULL"
    ).bind(now,challengeId).run();
    if (Number((marked as any).meta?.changes || 0) !== 1) {
      return json({success:false,error:"Challenge sudah digunakan."},401);
    }

    let user = await env.DB.prepare(
      `SELECT id,username,email,display_name AS displayName,role,referral_code AS referralCode,
              avatar_url AS avatarUrl,COALESCE(referral_count,0) AS referralCount,
              COALESCE(registration_bonus_idr,0) AS registrationBonusIdr,
              COALESCE(registration_bonus_granted,0) AS registrationBonusGranted,
              COALESCE(email_verified,0) AS emailVerified,wallet_address AS walletAddress,
              COALESCE(available_balance,0) AS balance,COALESCE(total_locked,0) AS lockedBalance
       FROM users WHERE lower(wallet_address)=lower(?) LIMIT 1`
    ).bind(walletAddress).first<any>();

    if (!user) {
      const nowMs = now;
      const suffix = walletAddress.slice(2,8).toLowerCase();
      const username = `web3_${suffix}`;
      const referralCode = `SYS-${walletAddress.slice(2,10).toUpperCase()}`;
      const userId = crypto.randomUUID();
      const columns = await env.DB.prepare("PRAGMA table_info(users)").all<any>();
      const rows = (columns.results || []) as any[];
      const idMeta = rows.find((r:any)=>String(r.name)==="id");
      const integerId = !!idMeta && Number(idMeta.pk)===1 && !/CHAR|CLOB|TEXT|BLOB/.test(String(idMeta.type||"").toUpperCase());
      const values: Record<string,any> = {
        id:userId, username, email:null, password_hash:null, display_name:username, role:"USER",
        available_balance:0,total_locked:0,referral_code:referralCode,referral_count:0,
        created_at:nowMs,email_verified:1,email_verified_at:nowMs,wallet_address:walletAddress,
        registration_bonus_idr:0,registration_bonus_granted:0,avatar_url:null,balance:0,saldo:0,
        wallet_balance:0,locked_saldo:0,has_referral_bonus:0, referred_by:null,
        password:null,cuid:crypto.randomUUID(),uid:crypto.randomUUID(),photo_url:""
      };
      const insertCols:string[]=[]; const insertVals:any[]=[];
      for (const col of rows) {
        const name=String(col.name);
        if (name==="id" && integerId) continue;
        if (!Object.prototype.hasOwnProperty.call(values,name)) {
          if (Number(col.notnull)===1 && col.dflt_value===null) throw new Error("REQUIRED_USERS_COLUMN:"+name);
          continue;
        }
        insertCols.push(name); insertVals.push(values[name]);
      }
      const placeholders=insertCols.map(()=>"?").join(",");
      await env.DB.prepare(`INSERT INTO users(${insertCols.join(",")}) VALUES(${placeholders})`).bind(...insertVals).run();
      user = await env.DB.prepare(
        `SELECT id,username,email,display_name AS displayName,role,referral_code AS referralCode,
                avatar_url AS avatarUrl,COALESCE(referral_count,0) AS referralCount,
                COALESCE(registration_bonus_idr,0) AS registrationBonusIdr,
                COALESCE(registration_bonus_granted,0) AS registrationBonusGranted,
                1 AS emailVerified,wallet_address AS walletAddress,
                COALESCE(available_balance,0) AS balance,COALESCE(total_locked,0) AS lockedBalance
         FROM users WHERE lower(wallet_address)=lower(?) LIMIT 1`
      ).bind(walletAddress).first<any>();
    }

    if (!user) throw new Error("WEB3_USER_NOT_FOUND_AFTER_CREATE");
    const token = await createSession(env,String(user.id));
    return json({success:true,token,user:{
      ...user,id:String(user.id),emailVerified:true,walletAddress:String(user.walletAddress || walletAddress),
      balance:Number(user.balance||0),lockedBalance:Number(user.lockedBalance||0)
    }});
  } catch (error) {
    console.error("web3 login error",{requestId,error:errorText(error)});
    return json({success:false,code:"WEB3_AUTH_ERROR",requestId,error:"Autentikasi wallet gagal diproses."},503);
  }
}
