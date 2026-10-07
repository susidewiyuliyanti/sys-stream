import { Env, json, readJson } from "../../../_lib/db";
import { createSession } from "../../../_lib/auth";

function base58Decode(input: string): Uint8Array {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const bytes = [0];
  for (const ch of input) {
    const value = alphabet.indexOf(ch);
    if (value < 0) throw new Error("INVALID_BASE58");
    let carry = value;
    for (let i=0;i<bytes.length;i++) { carry += bytes[i] * 58; bytes[i] = carry & 255; carry >>= 8; }
    while (carry) { bytes.push(carry & 255); carry >>= 8; }
  }
  let zeros = 0; while (zeros < input.length && input[zeros] === "1") zeros++;
  const out = new Uint8Array(zeros + bytes.length);
  for (let i=0;i<bytes.length;i++) out[out.length - 1 - i] = bytes[i];
  return out;
}

function utf8(value:string){ return new TextEncoder().encode(value); }

async function verifySolanaSignature(address:string,message:string,signature:string){
  const publicKey=base58Decode(address), sig=base58Decode(signature);
  if(publicKey.length!==32 || sig.length!==64) throw new Error("INVALID_SOLANA_KEY_OR_SIGNATURE");
  const key=await crypto.subtle.importKey("raw",publicKey,{name:"Ed25519"},false,["verify"]);
  return crypto.subtle.verify({name:"Ed25519"},key,sig,utf8(message));
}

async function ensureSchema(env:Env){
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS web3_wallets (
    id TEXT PRIMARY KEY,user_id TEXT NOT NULL,chain TEXT NOT NULL,wallet_address TEXT NOT NULL,
    created_at INTEGER NOT NULL,verified_at INTEGER NOT NULL,UNIQUE(chain,wallet_address)
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS web3_solana_auth_challenges (
    id TEXT PRIMARY KEY,nonce TEXT NOT NULL UNIQUE,wallet_address TEXT NOT NULL,message TEXT NOT NULL,
    expires_at INTEGER NOT NULL,used_at INTEGER,created_at INTEGER NOT NULL
  )`).run();
}

async function insertExistingSchema(env:Env,table:string,values:Record<string,any>){
  const info=await env.DB.prepare(`PRAGMA table_info(${table})`).all<any>();
  const columns=(info.results||[]) as any[];
  const idMeta=columns.find((r:any)=>String(r.name)==="id");
  const idType=String(idMeta?.type||"").toUpperCase();
  const integerId=!!idMeta && Number(idMeta.pk)===1 && !/CHAR|CLOB|TEXT|BLOB/.test(idType);
  const names:string[]=[], vals:any[]=[];
  for(const column of columns){
    const name=String(column.name);
    if(name==="id"&&integerId) continue;
    if(!Object.prototype.hasOwnProperty.call(values,name)){
      if(Number(column.notnull)===1 && (column.dflt_value===null||column.dflt_value===undefined))
        throw new Error("UNSUPPORTED_REQUIRED_USERS_COLUMN:"+name);
      continue;
    }
    names.push(name); vals.push(values[name]);
  }
  if(!names.length) throw new Error("EMPTY_USERS_INSERT");
  await env.DB.prepare(`INSERT INTO ${table}(${names.join(",")}) VALUES(${names.map(()=>"?").join(",")})`).bind(...vals).run();
}

async function getUser(env:Env,id:string){
  return env.DB.prepare(`SELECT id,username,email,display_name AS displayName,role,
    referral_code AS referralCode,avatar_url AS avatarUrl,COALESCE(referral_count,0) AS referralCount,
    COALESCE(registration_bonus_idr,0) AS registrationBonusIdr,COALESCE(registration_bonus_granted,0) AS registrationBonusGranted,
    COALESCE(available_balance,0) AS availableBalance,COALESCE(total_locked,0) AS lockedBalance,
    wallet_address AS walletAddress FROM users WHERE id=? LIMIT 1`).bind(id).first<any>();
}

export async function onRequestPost({request,env}:{request:Request,env:Env}){
  const requestId=crypto.randomUUID();
  try{
    await ensureSchema(env);
    const body=await readJson<{challengeId?:string;walletAddress?:string;message?:string;signature?:string}>(request);
    const address=String(body.walletAddress||"").trim(), challengeId=String(body.challengeId||"").trim();
    const message=String(body.message||""), signature=String(body.signature||"");
    if(!address||!challengeId||!message||!signature) return json({success:false,error:"Data autentikasi Solana tidak lengkap."},400);
    const challenge=await env.DB.prepare("SELECT id,wallet_address,message,expires_at,used_at FROM web3_solana_auth_challenges WHERE id=? LIMIT 1").bind(challengeId).first<any>();
    const now=Math.floor(Date.now()/1000);
    if(!challenge||challenge.used_at!==null||Number(challenge.expires_at)<now||String(challenge.wallet_address)!==address||String(challenge.message)!==message)
      return json({success:false,error:"Challenge Solana tidak valid atau sudah kedaluwarsa."},401);
    if(!(await verifySolanaSignature(address,message,signature))) return json({success:false,error:"Signature Solana tidak valid."},401);
    const marked=await env.DB.prepare("UPDATE web3_solana_auth_challenges SET used_at=? WHERE id=? AND used_at IS NULL").bind(now,challengeId).run();
    if(Number((marked as any).meta?.changes||0)!==1) return json({success:false,error:"Challenge Solana sudah digunakan."},401);

    let wallet=await env.DB.prepare("SELECT id,user_id FROM web3_wallets WHERE chain='SOLANA' AND wallet_address=? LIMIT 1").bind(address).first<any>();
    let user:any=wallet ? await getUser(env,String(wallet.user_id)) : null;

    if(!wallet && !user){
      // Do not assume the production users schema. Build the row from the
      // actual D1 columns so legacy required fields cannot turn into a generic 503.
      const userId=crypto.randomUUID(), username=`sol_${address.slice(0,8)}`;
      const referralCode=`SYS-SOL-${address.slice(0,8).toUpperCase()}`;
      const nowMs=now;
      await insertExistingSchema(env,"users",{
        id:userId,username,email:null,password_hash:"wallet-auth-only",display_name:username,role:"USER",
        available_balance:0,total_locked:0,referral_code:referralCode,referral_count:0,created_at:nowMs,
        terms_version:"2026-10-01",terms_accepted_at:nowMs,email_verified:1,email_verified_at:nowMs,
        wallet_address:"",referred_by:null,locked_saldo:0,has_referral_bonus:0,avatar_url:null,
        registration_bonus_idr:0,registration_bonus_granted:0,cuid:crypto.randomUUID(),uid:crypto.randomUUID(),
        password:"",photo_url:"",balance:0,saldo:0,wallet_balance:0,affiliate_earnings:0,affiliate_withdrawn:0,
        is_subscribed:0,subscription_plan:"free",is_lifetime:0,is_blacklisted:0,is_banned:0,
        force_jackpot_next:0,updated_at:nowMs
      });
      user=await getUser(env,userId);
      wallet={id:crypto.randomUUID(),user_id:userId};
      await env.DB.prepare("INSERT INTO web3_wallets(id,user_id,chain,wallet_address,created_at,verified_at) VALUES(?,?,?,?,?,?)")
        .bind(wallet.id,userId,"SOLANA",address,now,now).run();
    } else if(!wallet && user){
      await env.DB.prepare("INSERT INTO web3_wallets(id,user_id,chain,wallet_address,created_at,verified_at) VALUES(?,?,?,?,?,?)")
        .bind(crypto.randomUUID(),String(user.id),"SOLANA",address,now,now).run();
    }
    if(!user) throw new Error("SOLANA_USER_NOT_FOUND");
    const token=await createSession(env,String(user.id));
    return json({success:true,token,user:{...user,id:String(user.id),walletAddress:String(user.walletAddress||""),solanaWalletAddress:address,availableBalance:Number(user.availableBalance||0),lockedBalance:Number(user.lockedBalance||0)}});
  }catch(error){
    console.error("solana login error",{requestId,error:String(error)});
    return json({success:false,code:"SOLANA_AUTH_ERROR",requestId,error:"Autentikasi Solana gagal diproses."},503);
  }
}
