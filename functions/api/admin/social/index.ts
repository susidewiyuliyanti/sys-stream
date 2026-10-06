import { Env, json } from "../../../_lib/db";
import { requireAdmin } from "../../../_lib/admin";
import {
  getSocialProviderConfig,
  SOCIAL_PLATFORMS,
  SocialPlatform,
} from "../../../_lib/social";
import {
  getEnvString,
  getProviderConfig,
  getProviderScopes,
} from "../../../_lib/social/providers";

function validPlatform(value: string): value is SocialPlatform {
  return (SOCIAL_PLATFORMS as string[]).includes(value);
}

export async function onRequestGet({
  request,
  env,
}: {
  request: Request;
  env: Env;
}) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return auth.response;

  const result = await env.DB.prepare(
    `SELECT id,
            platform,
            account_id AS accountId,
            account_name AS accountName,
            status,
            scopes,
            connected_at AS connectedAt,
            updated_at AS updatedAt
     FROM social_connections
     ORDER BY platform ASC`,
  ).all();

  const existing = new Map(
    (result.results || []).map((row: any) => [
      String(row.platform),
      row,
    ]),
  );

  const connections = SOCIAL_PLATFORMS.map((platform) => {
    const row = existing.get(platform) as any;
    const provider = getSocialProviderConfig(
      env as unknown as Record<string, unknown>,
      platform,
    );

    const cfg = getProviderConfig(platform);
    const envRecord = env as unknown as Record<string, unknown>;
    const missingEnv = [cfg.clientIdEnv, cfg.clientSecretEnv].filter(
      (name) => !getEnvString(envRecord, name),
    );

    return {
      missingEnv,
      ...(row || {
        id: null,
        platform,
        accountId: null,
        accountName: null,
        status: "DISCONNECTED",
        scopes: null,
        connectedAt: null,
        updatedAt: null,
      }),
      oauthEnabled: provider.enabled,
      oauthConfigured: provider.configured,
    };
  });

  return json({
    success: true,
    redirectUri: `${new URL(request.url).origin}/api/admin/social/callback`,
    connections,
  });
}

export async function onRequestPost({
  request,
  env,
}: {
  request: Request;
  env: Env;
}) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return auth.response;

  if (auth.identity.role !== "OWNER") {
    return json(
      {
        success: false,
        error: "Hanya OWNER yang dapat mengubah koneksi social media.",
      },
      403,
    );
  }

  const body = await request.json().catch(() => ({} as any));

  const platform = String(body?.platform || "")
    .trim()
    .toLowerCase();

  const action = String(body?.action || "")
    .trim()
    .toLowerCase();

  if (!validPlatform(platform)) {
    return json(
      {
        success: false,
        error: "Platform social media tidak valid.",
      },
      400,
    );
  }

  if (action === "disconnect") {
    await env.DB.prepare(
      `DELETE FROM social_connections WHERE platform = ?`,
    )
      .bind(platform)
      .run();

    await env.DB.prepare(
      `DELETE FROM social_oauth_tokens WHERE platform = ?`,
    )
      .bind(platform)
      .run();

    return json({
      success: true,
      platform,
      status: "DISCONNECTED",
    });
  }

  if (action !== "prepare") {
    return json(
      {
        success: false,
        error: "Action tidak valid.",
      },
      400,
    );
  }

  const provider = getSocialProviderConfig(
    env as unknown as Record<string, unknown>,
    platform,
  );

  if (!provider.enabled || !provider.configured) {
    return json({
      success: true,
      platform,
      status: "NOT_CONFIGURED",
      authorizationUrl: null,
      message:
        "OAuth provider belum dikonfigurasi. Tambahkan client ID/secret, endpoint OAuth, scope, dan aktifkan provider di Cloudflare.",
    });
  }

  const config = getProviderConfig(platform);
  const clientId = getEnvString(
    env as unknown as Record<string, unknown>,
    config.clientIdEnv,
  );

  if (!clientId || !provider.authorizationEndpoint) {
    return json(
      {
        success: false,
        platform,
        status: "NOT_CONFIGURED",
        authorizationUrl: null,
        message: "Credential OAuth provider belum lengkap.",
      },
      503,
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const state = crypto.randomUUID();

  /*
   * OAuth callback harus kembali ke hostname admin yang memulai proses.
   * TikTok mensyaratkan redirect URI statis; platform lain juga biasanya
   * mengharuskan nilai yang sama persis dengan URI yang didaftarkan.
   */
  const requestUrl = new URL(request.url);
  const redirectUri = `${requestUrl.origin}/api/admin/social/callback`;

  await env.DB.prepare(
    `INSERT INTO social_oauth_states
      (state, platform, created_by, redirect_uri, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      state,
      platform,
      auth.identity.id || auth.identity.email,
      redirectUri,
      now + 600,
      now,
    )
    .run();

  const scopes = getProviderScopes(
    env as unknown as Record<string, unknown>,
    platform,
  );

  const authUrl = new URL(provider.authorizationEndpoint);

  /*
   * TikTok Login Kit uses client_key and comma-separated scopes.
   * The standard OAuth providers use client_id and space-delimited scopes.
   */
  if (platform === "tiktok") {
    authUrl.searchParams.set("client_key", clientId);
    if (scopes.length) authUrl.searchParams.set("scope", scopes.join(","));
  } else {
    authUrl.searchParams.set("client_id", clientId);
    if (scopes.length) authUrl.searchParams.set("scope", scopes.join(" "));
  }

  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);

  /* Google hanya memberi refresh token bila diminta secara eksplisit. */
  if (platform === "youtube") {
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");
  }

  return json({
    success: true,
    platform,
    status: "PENDING",
    authorizationUrl: authUrl.toString(),
    redirectUri,
  });
}
