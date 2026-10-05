import { Env, json } from "../../../_lib/db";
import { requireAdmin } from "../../../_lib/admin";
import {
  getSocialProviderConfig,
  SOCIAL_PLATFORMS,
  SocialPlatform,
} from "../../../_lib/social";

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

    return {
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
        "OAuth provider belum dikonfigurasi. Tambahkan konfigurasi provider sebelum mengaktifkan koneksi.",
    });
  }

  const now = Math.floor(Date.now() / 1000);
  const state = crypto.randomUUID();

  await env.DB.prepare(
    `INSERT INTO social_oauth_states
      (state, platform, created_by, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(
      state,
      platform,
      auth.identity.id || auth.identity.email,
      now + 600,
      now,
    )
    .run();

  const authorizationEndpoint = provider.authorizationEndpoint;
  if (!authorizationEndpoint) {
    return json({ success: false, platform, status: "NOT_CONFIGURED", authorizationUrl: null, message: "OAuth authorization endpoint belum dikonfigurasi." }, 503);
  }

  const separator = authorizationEndpoint.includes("?")
    ? "&"
    : "?";

  const authorizationUrl =
    `${authorizationEndpoint}${separator}` +
    `state=${encodeURIComponent(state)}`;

  return json({
    success: true,
    platform,
    status: "PENDING",
    authorizationUrl,
  });
}
