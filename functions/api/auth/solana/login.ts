import { Env, json, readJson } from "../../../_lib/db";
import { createSession } from "../../../_lib/auth";

function base58Decode(input: string): Uint8Array {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const bytes = [0];
  for (const ch of input) {
    const value = alphabet.indexOf(ch);
    if (value < 0) throw new Error("INVALID_BASE58");
    let carry = value;
    for (let i=0;i<bytes.length;i++) {
      carry += bytes[i] * 58;
      bytes[i] = carry & 255;
      carry >>= 8;
    }
    while (carry) { bytes.push(carry & 255); carry >>= 8; }
  }
  let zeros = 0;
  while (zeros < input.length && input[zeros] === "1") zeros++;
  const out = new Uint8Array(zeros + bytes.length);
  for (let i=0;i<bytes.length;i++) out[out.length - 1 - i] = bytes[i];
  return out;
}

function utf8(value: string) { return new TextEncoder().encode(value); }

async function verifySolanaSignature(address: string, message: string, signature: string) {
  const publicKey = base58Decode(address);
  const sig = base58Decode(signature);
  if (publicKey.length !== 32 || sig.length !== 64) throw new Error("INVALID_SOLANA_KEY_OR_SIGNATURE");
  const key = await crypto.subtle.importKey("raw", publicKey, {name:"Ed25519"}, false, ["verify"]);
  return crypto.subtle.verify({name:"Ed25519"}, key, sig, utf8(message));
}

async function ensureSchema(env: Env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS web3_wallets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    chain TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    verified_at INTEGER NOT NULL,
    UNIQUE(chain,wallet_address)
  )`).run();
}

export async function onRequestPost({request,env}:{request:Request,env:Env}) {
  const requestId=crypto.randomUUID();
  try {
    await ensureSchema(env);
    const body=await readJson<{challengeId?:string;walletAddress?:string;message?:string;signature?:string}>(request);
    const address=String(body.walletAddress||"").trim();
    const challengeId=String(body.challengeId||"").trim();
    const message=String(body.message||"");
    const signature=String(body.signature||"");
    if(!address||!challengeId||!message||!signature) return json({success:false,error:"Data autentikasi Solana tidak lengkap."},400);
    const challenge=await env.DB.prepare("SELECT id,wallet_address,message,expires_at,used_at FROM web3_solana_auth_challenges WHERE id=? LIMIT 1").bind(challengeId).first<any>();
    const now=Math.floor(Date.now()/1000);
    if(!challenge||challenge.used_at!==null||Number(challenge.expires_at)<now||String(challenge.wallet_address)!==address||String(challenge.message)!==message) return json({success:false,error:"Challenge Solana tidak valid atau sudah kedaluwarsa."},401);
    if(!(await verifySolanaSignature(address,message,signature))) return json({success:false,error:"Signature Solana tidak valid."},401);
    const marked=await env.DB.prepare("UPDATE web3_solana_auth_challenges SET used_at=? WHERE id=? AND used_at IS NULL").bind(now,challengeId).run();
    if(Number((marked as any).meta?.changes||0)!==1) return json({success:false,error:"Challenge Solana sudah digunakan."},401);

    let wallet=await env.DB.prepare("SELECT id,user_id FROM web3_wallets WHERE chain='SOLANA' AND wallet_address=? LIMIT 1").bind(address).first<any>();
    let user:any;
    if(wallet) {
      user=await env.DB.prepare("SELECT id,username,email,display_name AS displayName,role,referral_code AS referralCode,avatar_url AS avatarUrl,COALESCE(referral_count,0) AS referralCount,COALESCE(registration_bonus_idr,0) AS registrationBonusIdr,COALESCE(registration_bonus_granted,0) AS registrationBonusGranted,COALESCE(available_balance,0) AS availableBalance,COALESCE(total_locked,0) AS lockedBalance,wallet_address AS walletAddress FROM users WHERE id=? LIMIT 1").bind(String(wallet.user_id)).first<any>();
    } else {
      user=await env.DB.prepare("SELECT id,username,email,display_name AS displayName,role,referral_code AS referralCode,avatar_url AS avatarUrl,COALESCE(referral_count,0) AS referralCount,COALESCE(registration_bonus_idr,0) AS registrationBonusIdr,COALESCE(registration_bonus_granted,0) AS registrationBonusGranted,COALESCE(available_balance,0) AS availableBalance,COALESCE(total_locked,0) AS lockedBalance,wallet_address AS walletAddress FROM users WHERE lower(wallet_address)=lower(?) LIMIT 1").bind(address).first<any>();
      if(user) {
        await env.DB.prepare("INSERT INTO web3_wallets(id,user_id,chain,wallet_address,created_at,verified_at) VALUES(?,?,?,?,?,?)").bind(crypto.randomUUID(),String(user.id),"SOLANA",address,now,now).run();
      }
    }
    if(!user) {
      const userId=crypto.randomUUID();
      const suffix=address.slice(0,8);
      const username=`sol_${suffix}`;
      const referralCode=`SYS-SOL-${address.slice(0,8).toUpperCase()}`;
      await env.DB.prepare("INSERT INTO users(id,username,email,password_hash,display_name,role,available_balance,total_locked,referral_code,referral_count,created_at,email_verified,email_verified_at,wallet_address,registration_bonus_idr,registration_bonus_granted) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(userId,username,null,null,username,"USER",0,0,referralCode,0,now,1,now,"",0,0).run();
      await env.DB.prepare("INSERT INTO web3_wallets(id,user_id,chain,wallet_address,created_at,verified_at) VALUES(?,?,?,?,?,?)").bind(crypto.randomUUID(),userId,"SOLANA",address,now,now).run();
      user=await env.DB.prepare("SELECT id,username,email,display_name AS displayName,role,referral_code AS referralCode,avatar_url AS avatarUrl,COALESCE(referral_count,0) AS referralCount,COALESCE(registration_bonus_idr,0) AS registrationBonusIdr,COALESCE(registration_bonus_granted,0) AS registrationBonusGranted,COALESCE(available_balance,0) AS availableBalance,COALESCE(total_locked,0) AS lockedBalance,wallet_address AS walletAddress FROM users WHERE id=? LIMIT 1").bind(userId).first<any>();
    }
    if(!user) throw new Error("SOLANA_USER_NOT_FOUND");
    const token=await createSession(env,String(user.id));
    return json({success:true,token,user:{...user,id:String(user.id),walletAddress:String(user.walletAddress||""),solanaWalletAddress:address,availableBalance:Number(user.availableBalance||0),lockedBalance:Number(user.lockedBalance||0)}});
  } catch(error) {
    console.error("solana login error",{requestId,error});
    return json({success:false,code:"SOLANA_AUTH_ERROR",requestId,error:"Autentikasi Solana gagal diproses."},503);
  }
}
