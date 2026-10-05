import { Env, json } from "../../../_lib/db";
import { requireAdmin } from "../../../_lib/admin";
import {
  getCastanceConfig,
  getCastancePlatform,
  SOCIAL_PLATFORMS,
  SocialPlatform,
} from "../../../_lib/social";

function validPlatform(value: string): value is SocialPlatform {
  return (SOCIAL_PLATFORMS as string[]).includes(value);
}

function castanceHeaders(apiKey: string) {
  return {
    "X-API-Key": apiKey,
    "Content-Type": "application/json",
  };
}

async function listCastanceAccounts(env: Env) {
  const config = getCastanceConfig(env as unknown as Record<string, unknown>);
  if (!config.configured) return [];

  const response = await fetch("https://castance.com/v1/accounts", {
    headers: {
      "X-API-Key": config.apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Castance accounts request failed: ${response.status}`);
  }

  const payload = await response.json().catch(() => ({} as any));
  return Array.isArray(payload?.data) ? payload.data : [];
}

async function syncCastanceAccounts(env: Env) {
  const accounts = await listCastanceAccounts(env);
  const now = Math.floor(Date.now() / 1000);

  for (const account of accounts) {
    const platform = String(account?.platform || "").toLowerCase();
    if (!validPlatform(platform)) continue;

    const id = String(account?.id || account?.accountId || "").trim();
    if (!id) continue;

    const name = String(
      account?.username ||
      account?.name ||
      account?.displayName ||
      platform.toUpperCase(),
    ).trim();

    const scopes = Array.isArray(account?.scopes)
      ? account.scopes.join(" ")
      : typeof account?.scopes === "string"
        ? account.scopes
        : null;

    await env.DB.prepare(
      `INSERT INTO social_connections
        (id, platform, account_id, account_name, status, scopes, connected_at, updated_at)
       VALUES (?, ?, ?, ?, 'CONNECTED', ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         platform=excluded.platform,
         account_id=excluded.account_id,
         account_name=excluded.account_name,
         status=excluded.status,
         scopes=excluded.scopes,
         updated_at=excluded.updated_at`,
    )
      .bind(id, platform, id, name, scopes, now, now)
      .run();
  }

  const activeIds = new Set(
    accounts
      .map((account: any) => String(account?.id || account?.accountId || "").trim())
      .filter(Boolean),
  );

  const local = await env.DB.prepare(
    `SELECT id, account_id AS accountId, platform
     FROM social_connections`,
  ).all();

  for (const row of local.results || []) {
    const accountId = String((row as any).accountId || "");
    if (accountId && !activeIds.has(accountId)) {
      await env.DB.prepare(
        `UPDATE social_connections
         SET status='DISCONNECTED', updated_at=?
         WHERE id=?`,
      )
        .bind(now, String((row as any).id))
        .run();
    }
  }

  return accounts;
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

  const config = getCastanceConfig(env as unknown as Record<string, unknown>);

  if (config.configured) {
    try {
      await syncCastanceAccounts(env);
    } catch (error) {
      console.error("CASTANCE_ACCOUNT_SYNC_ERROR", error);
    }
  }

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
    (result.results || []).map((row: any) => [String(row.platform), row]),
  );

  const connections = SOCIAL_PLATFORMS.map((platform) => {
    const row = existing.get(platform) as any;

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
      oauthEnabled: config.configured,
      oauthConfigured: config.configured,
    };
  });

  return json({ success: true, connections });
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
  const platform = String(body?.platform || "").trim().toLowerCase();
  const action = String(body?.action || "").trim().toLowerCase();

  if (!validPlatform(platform)) {
    return json(
      { success: false, error: "Platform social media tidak valid." },
      400,
    );
  }

  const config = getCastanceConfig(env as unknown as Record<string, unknown>);

  if (!config.configured) {
    return json(
      {
        success: false,
        error:
          "Castance belum dikonfigurasi. Tambahkan CASTANCE_API_KEY dan CASTANCE_CHANNEL_PACK_ID sebagai secret Cloudflare Pages.",
      },
      503,
    );
  }

  if (action === "disconnect") {
    const row = await env.DB.prepare(
      `SELECT account_id AS accountId
       FROM social_connections
       WHERE platform=? AND status='CONNECTED'
       ORDER BY updated_at DESC
       LIMIT 1`,
    )
      .bind(platform)
      .first<{ accountId: string | null }>();

    if (!row?.accountId) {
      return json({ success: true, platform, status: "DISCONNECTED" });
    }

    const response = await fetch(
      `https://castance.com/v1/accounts/${encodeURIComponent(row.accountId)}`,
      {
        method: "DELETE",
        headers: castanceHeaders(config.apiKey),
      },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("CASTANCE_DISCONNECT_ERROR", {
        platform,
        status: response.status,
        body: text.slice(0, 500),
      });
      return json(
        {
          success: false,
          error: "Castance gagal memutus koneksi. Silakan coba lagi.",
        },
        502,
      );
    }

    const now = Math.floor(Date.now() / 1000);
    await env.DB.prepare(
      `UPDATE social_connections
       SET status='DISCONNECTED', updated_at=?
       WHERE platform=?`,
    )
      .bind(now, platform)
      .run();

    return json({ success: true, platform, status: "DISCONNECTED" });
  }

  if (action !== "prepare") {
    return json({ success: false, error: "Action tidak valid." }, 400);
  }

  const castancePlatform = getCastancePlatform(platform);
  const callbackUrl =
    `https://admin.sysstreamer.asia/api/admin/social/callback?platform=${encodeURIComponent(platform)}`;

  const connectUrl =
    `https://castance.com/v1/connect/${castancePlatform}?redirect_url=${encodeURIComponent(callbackUrl)}`;

  return json({
    success: true,
    platform,
    status: "PENDING",
    authorizationUrl: connectUrl,
  });
}
