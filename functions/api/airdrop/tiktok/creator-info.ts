import { Env, json } from "../../../_lib/db";
import { requireAuth } from "../../../_lib/auth";
import { getTikTokAccessToken } from "../../../_lib/tiktok";

export async function onRequestGet(context:{request:Request;env:Env}) {
  const auth = await requireAuth(context.request, context.env);
  if (!auth.ok) return auth.response;
  const wallet = String(auth.user.walletAddress || "").trim().toLowerCase();
  if (!wallet) return json({success:false,error:"WALLET_REQUIRED"},400);
  try {
    const accessToken = await getTikTokAccessToken(context.env,wallet);
    const response = await fetch("https://open.tiktokapis.com/v2/post/publish/creator_info/query/", {
      method:"POST",
      headers:{Authorization:"Bearer "+accessToken,"Content-Type":"application/json"},
      body:"{}",
    });
    const data = await response.json().catch(()=>({})) as any;
    if (!response.ok || data?.error?.code && data.error.code !== "ok") {
      return json({success:false,error:"TIKTOK_CREATOR_INFO_FAILED",details:data?.error?.message||""},response.status || 502);
    }
    return json({success:true,creator:data.data||null});
  } catch (error) {
    return json({success:false,error:String(error instanceof Error?error.message:"TIKTOK_CREATOR_INFO_FAILED")},400);
  }
}
