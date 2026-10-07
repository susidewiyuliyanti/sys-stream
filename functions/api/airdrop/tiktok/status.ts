import { Env, json } from "../../../_lib/db";
import { requireAuth } from "../../../_lib/auth";
import { getTikTokAccessToken } from "../../../_lib/tiktok";

export async function onRequestPost(context:{request:Request;env:Env}) {
  const auth=await requireAuth(context.request,context.env);
  if(!auth.ok) return auth.response;
  const wallet=String(auth.user.walletAddress||"").trim().toLowerCase();
  if(!wallet) return json({success:false,error:"WALLET_REQUIRED"},400);
  const body=await context.request.json().catch(()=>({})) as any;
  const publishId=String(body.publish_id||"").trim();
  if(!publishId||publishId.length>64) return json({success:false,error:"PUBLISH_ID_REQUIRED"},400);
  try {
    const accessToken=await getTikTokAccessToken(context.env,wallet);
    const response=await fetch("https://open.tiktokapis.com/v2/post/publish/status/fetch/",{
      method:"POST",
      headers:{Authorization:"Bearer "+accessToken,"Content-Type":"application/json; charset=UTF-8"},
      body:JSON.stringify({publish_id:publishId}),
    });
    const data=await response.json().catch(()=>({})) as any;
    return json({success:response.ok&&(!data?.error?.code||data.error.code==="ok"),data:data?.data||null,error:data?.error||null},response.status);
  } catch(error) {
    return json({success:false,error:String(error instanceof Error?error.message:"TIKTOK_STATUS_FAILED")},400);
  }
}
