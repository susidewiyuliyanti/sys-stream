import { Env, json } from "../../../_lib/db";
import { requireAuth, getUserById } from "../../../_lib/auth";
import { getAddress, isAddress } from "ethers";

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    const auth = await requireAuth(request,env);
    if (!auth.ok) return auth.response;
    const body = await request.json().catch(()=>({})) as {walletAddress?:string};
    const raw = String(body.walletAddress || "").trim();
    if (!isAddress(raw)) return json({success:false,error:"Alamat wallet EVM tidak valid."},400);
    const walletAddress = getAddress(raw);
    const current = await env.DB.prepare("SELECT wallet_address FROM users WHERE id=? LIMIT 1").bind(String(auth.user.id)).first<any>();
    const other = await env.DB.prepare("SELECT id FROM users WHERE lower(wallet_address)=lower(?) AND id<>? LIMIT 1").bind(walletAddress,String(auth.user.id)).first<any>();
    if (other) return json({success:false,error:"Wallet tersebut sudah terhubung ke akun lain."},409);
    await env.DB.prepare("UPDATE users SET wallet_address=? WHERE id=?").bind(walletAddress,String(auth.user.id)).run();
    const user = await getUserById(env,String(auth.user.id));
    return json({success:true,user:{...user,walletAddress}});
  } catch (error) {
    console.error("wallet bind error",error);
    return json({success:false,error:"Wallet belum dapat disimpan."},503);
  }
}
