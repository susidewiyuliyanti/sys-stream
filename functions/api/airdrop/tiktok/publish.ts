import { Env, json } from "../../../_lib/db";
import { requireAuth } from "../../../_lib/auth";
import { getTikTokAccessToken } from "../../../_lib/tiktok";

function validHttpsUrl(value:string) {
  try { const url=new URL(value); return url.protocol==="https:"; } catch { return false; }
}

export async function onRequestPost(context:{request:Request;env:Env}) {
  const auth = await requireAuth(context.request, context.env);
  if (!auth.ok) return auth.response;
  const wallet = String(auth.user.walletAddress || "").trim().toLowerCase();
  if (!wallet) return json({success:false,error:"WALLET_REQUIRED"},400);

  const body = await context.request.json().catch(()=>({})) as any;
  const videoUrl = String(body.video_url || "").trim();
  const title = String(body.title || "").trim();
  if (!validHttpsUrl(videoUrl)) return json({success:false,error:"VIDEO_URL_MUST_BE_HTTPS"},400);
  if (title.length > 2200) return json({success:false,error:"TITLE_TOO_LONG"},400);

  try {
    const accessToken = await getTikTokAccessToken(context.env,wallet);
    const creatorResponse = await fetch("https://open.tiktokapis.com/v2/post/publish/creator_info/query/", {
      method:"POST",
      headers:{Authorization:"Bearer "+accessToken,"Content-Type":"application/json"},
      body:"{}",
    });
    const creatorData = await creatorResponse.json().catch(()=>({})) as any;
    if (!creatorResponse.ok || creatorData?.error?.code && creatorData.error.code !== "ok") {
      return json({success:false,error:"TIKTOK_CREATOR_INFO_FAILED",details:creatorData?.error?.message||""},creatorResponse.status || 502);
    }

    const options = Array.isArray(creatorData?.data?.privacy_level_options) ? creatorData.data.privacy_level_options : [];
    const requestedPrivacy = String(body.privacy_level || options[0] || "SELF_ONLY");
    if (!options.includes(requestedPrivacy)) {
      return json({success:false,error:"INVALID_PRIVACY_LEVEL",privacy_level_options:options},400);
    }

    const payload = {
      post_info: {
        title,
        privacy_level: requestedPrivacy,
        disable_duet: Boolean(body.disable_duet),
        disable_comment: Boolean(body.disable_comment),
        disable_stitch: Boolean(body.disable_stitch),
        ...(Number.isFinite(Number(body.video_cover_timestamp_ms)) ? {video_cover_timestamp_ms:Number(body.video_cover_timestamp_ms)} : {}),
        brand_content_toggle: Boolean(body.brand_content_toggle),
        brand_organic_toggle: Boolean(body.brand_organic_toggle),
        is_aigc: Boolean(body.is_aigc),
      },
      source_info: {
        source:"PULL_FROM_URL",
        video_url:videoUrl,
      },
    };

    const response = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
      method:"POST",
      headers:{Authorization:"Bearer "+accessToken,"Content-Type":"application/json; charset=UTF-8"},
      body:JSON.stringify(payload),
    });
    const data = await response.json().catch(()=>({})) as any;
    if (!response.ok || data?.error?.code && data.error.code !== "ok") {
      return json({success:false,error:"TIKTOK_PUBLISH_INIT_FAILED",details:data?.error?.message||"",tiktok:data?.error||null},response.status || 502);
    }

    return json({success:true,publish_id:data?.data?.publish_id||null,privacy_level:requestedPrivacy});
  } catch (error) {
    return json({success:false,error:String(error instanceof Error?error.message:"TIKTOK_PUBLISH_FAILED")},400);
  }
}
