import { Env } from "../../../_lib/db";
import { encryptToken, ensureTikTokTables, tiktokRedirectUri } from "../../../_lib/tiktok";

function redirect(request: Request, status: string, message = ""): Response {
  const url = new URL("https://airdrop.sysstreamer.asia/");
  url.searchParams.set("social", "tiktok");
  url.searchParams.set("status", status);
  if (message) url.searchParams.set("reason", message.slice(0, 120));
  return Response.redirect(url.toString(), 302);
}

export async function onRequestGet(context:{request:Request;env:Env}) {
  const request = context.request;
  const env = context.env;
  const url = new URL(request.url);
  const state = String(url.searchParams.get("state") || "").trim();
  const code = String(url.searchParams.get("code") || "").trim();
  const error = String(url.searchParams.get("error") || "").trim();

  if (error) return redirect(request, "denied", error);
  if (!state || !code) return redirect(request, "error", "missing_oauth_code");

  await ensureTikTokTables(env);
  const stateRow = await env.DB.prepare(
    "SELECT state,user_id,wallet_address,expires_at FROM airdrop_social_oauth_states WHERE state=? AND provider='tiktok' LIMIT 1"
  ).bind(state).first<any>();

  if (!stateRow || Number(stateRow.expires_at) < Math.floor(Date.now()/1000)) {
    if (state) await env.DB.prepare("DELETE FROM airdrop_social_oauth_states WHERE state=?").bind(state).run();
    return redirect(request, "error", "invalid_oauth_state");
  }

  await env.DB.prepare("DELETE FROM airdrop_social_oauth_states WHERE state=?").bind(state).run();

  const clientKey = String(env.TIKTOK_CLIENT_KEY || "").trim();
  const clientSecret = String(env.TIKTOK_CLIENT_SECRET || "").trim();
  if (!clientKey || !clientSecret) return redirect(request, "error", "tiktok_not_configured");

  const tokenBody = new URLSearchParams();
  tokenBody.set("client_key", clientKey);
  tokenBody.set("client_secret", clientSecret);
  tokenBody.set("code", code);
  tokenBody.set("grant_type", "authorization_code");
  tokenBody.set("redirect_uri", tiktokRedirectUri(request));

  const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded","Cache-Control":"no-cache"},
    body:tokenBody.toString(),
  });
  const tokenData = await tokenRes.json().catch(()=>({})) as any;
  if (!tokenRes.ok || !tokenData?.access_token || !tokenData?.open_id) {
    console.error("TikTok token exchange failed", tokenData);
    return redirect(request, "error", "token_exchange_failed");
  }

  const accessToken = String(tokenData.access_token);
  const profileRes = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name",
    {headers:{Authorization:"Bearer "+accessToken}}
  );
  const profileData = await profileRes.json().catch(()=>({})) as any;
  const profile = profileData?.data?.user;
  if (!profileRes.ok || !profile?.open_id) {
    console.error("TikTok profile lookup failed", profileData);
    return redirect(request, "error", "profile_lookup_failed");
  }

  const encryptedAccessToken = await encryptToken(env, accessToken);
  const encryptedRefreshToken = tokenData.refresh_token
    ? await encryptToken(env, String(tokenData.refresh_token))
    : null;
  const expiresAt = Math.floor(Date.now()/1000) + Number(tokenData.expires_in || 0);

  await env.DB.prepare(`INSERT INTO airdrop_social_connections
    (wallet_address,platform,platform_user_id,username,display_name,avatar_url,access_token,refresh_token,expires_at,scope,updated_at)
    VALUES(?,?,?,?,?,?,?,?,?,?,unixepoch())
    ON CONFLICT(wallet_address,platform) DO UPDATE SET
      platform_user_id=excluded.platform_user_id,
      username=excluded.username,
      display_name=excluded.display_name,
      avatar_url=excluded.avatar_url,
      access_token=excluded.access_token,
      refresh_token=excluded.refresh_token,
      expires_at=excluded.expires_at,
      scope=excluded.scope,
      updated_at=unixepoch()`
  ).bind(
    String(stateRow.wallet_address).toLowerCase(),
    "tiktok",
    String(profile.open_id),
    null,
    String(profile.display_name || ""),
    String(profile.avatar_url || ""),
    encryptedAccessToken,
    encryptedRefreshToken,
    expiresAt,
    String(tokenData.scope || "")
  ).run();

  await env.DB.prepare(`INSERT INTO airdrop_social_accounts
    (wallet_address,platform,account,updated_at)
    VALUES(?,?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(wallet_address,platform) DO UPDATE SET account=excluded.account,updated_at=CURRENT_TIMESTAMP`
  ).bind(
    String(stateRow.wallet_address).toLowerCase(),
    "tiktok",
    String(profile.display_name || profile.open_id)
  ).run();

  return redirect(request, "connected");
}
