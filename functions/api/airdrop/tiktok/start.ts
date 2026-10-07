import { Env, json } from "../../../_lib/db";
import { requireAuth } from "../../../_lib/auth";
import { ensureTikTokTables, randomState, tiktokRedirectUri } from "../../../_lib/tiktok";

const SCOPES = "user.info.basic,video.publish";

export async function onRequestGet(context:{request:Request;env:Env}) {
  const auth = await requireAuth(context.request, context.env);
  if (!auth.ok) return auth.response;

  const clientKey = String(context.env.TIKTOK_CLIENT_KEY || "").trim();
  if (!clientKey) return json({success:false,error:"TIKTOK_CLIENT_KEY_NOT_CONFIGURED"},500);

  const wallet = String(auth.user.walletAddress || "").trim().toLowerCase();
  if (!wallet) return json({success:false,error:"WALLET_REQUIRED"},400);

  await ensureTikTokTables(context.env);
  const state = await randomState();
  const expiresAt = Math.floor(Date.now()/1000) + 10 * 60;
  await context.env.DB.prepare(
    "INSERT INTO airdrop_social_oauth_states(state,user_id,wallet_address,provider,expires_at) VALUES(?,?,?,?,?)"
  ).bind(state,String(auth.user.id),wallet,"tiktok",expiresAt).run();

  const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
  url.searchParams.set("client_key",clientKey);
  url.searchParams.set("scope",SCOPES);
  url.searchParams.set("response_type","code");
  url.searchParams.set("redirect_uri",tiktokRedirectUri(context.request));
  url.searchParams.set("state",state);

  return Response.redirect(url.toString(),302);
}
