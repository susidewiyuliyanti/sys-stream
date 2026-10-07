import { Env, json, readJson } from "../../../_lib/db";

async function ensureTable(env: Env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS web3_solana_auth_challenges (
    id TEXT PRIMARY KEY,
    nonce TEXT NOT NULL UNIQUE,
    wallet_address TEXT NOT NULL,
    message TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    used_at INTEGER,
    created_at INTEGER NOT NULL
  )`).run();
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    await ensureTable(env);
    const body = await readJson<{ walletAddress?: string }>(request);
    const walletAddress = String(body.walletAddress || "").trim();
    if (!walletAddress || walletAddress.length < 32 || walletAddress.length > 50) {
      return json({ success:false, error:"Alamat wallet Solana tidak valid." },400);
    }
    const now = Math.floor(Date.now()/1000);
    await env.DB.prepare("DELETE FROM web3_solana_auth_challenges WHERE expires_at < ? OR used_at IS NOT NULL").bind(now).run();
    const id = crypto.randomUUID();
    const nonce = crypto.randomUUID().replace(/-/g,"") + crypto.randomUUID().replace(/-/g,"");
    const expiresAt = now + 5 * 60;
    const message = [
      "SYS STREAM Solana Wallet Authentication",
      "",
      "Domain: sysstreamer.asia",
      `Wallet: ${walletAddress}`,
      `Nonce: ${nonce}`,
      `Issued At: ${new Date(now*1000).toISOString()}`,
      `Expiration Time: ${new Date(expiresAt*1000).toISOString()}`,
      "",
      "Sign this message to authenticate. No blockchain transaction will be sent."
    ].join("\n");
    await env.DB.prepare(`INSERT INTO web3_solana_auth_challenges
      (id,nonce,wallet_address,message,expires_at,used_at,created_at)
      VALUES(?,?,?,?,?,NULL,?)`).bind(id,nonce,walletAddress,message,expiresAt,now).run();
    return json({success:true,challengeId:id,walletAddress,message,expiresAt});
  } catch (error) {
    console.error("solana challenge error",error);
    return json({success:false,error:"Tidak dapat membuat challenge Solana wallet."},503);
  }
}
