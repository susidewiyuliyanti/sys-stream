import type { PagesFunction } from "@cloudflare/workers-types";
import { requireAdmin } from "../../../../_lib/admin";
import { getDB } from "../../../../_lib/db";
import {
  getProviderConfig,
  getEnvString,
  isProviderConfigured,
} from "../../../../_lib/social/providers";
import { exchangeOAuthCode } from "../../../../_lib/social/token";
import { storeSocialToken } from "../../../../_lib/social/vault";

type Env = {
  DB: D1Database;
  SOCIAL_TOKEN_ENCRYPTION_KEY?: string;

  [key: string]: unknown;
};

type OAuthState = {
  state: string;
  platform: string;
  created_by: string | null;
  redirect_uri: string | null;
  expires_at: number;
  created_at: number;
};

const ALLOWED_PLATFORMS = new Set([
  "tiktok",
  "youtube",
  "instagram",
  "x",
  "telegram",
  "discord",
]);

function html(message: string, status = 200) {
  const safe = message
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  return new Response(
    `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SYS STREAM Social Connection</title>
<style>
body{
  font-family:Arial,sans-serif;
  background:#0f172a;
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:100vh;
  margin:0
}
.box{
  width:min(560px,calc(100% - 40px));
  padding:32px;
  border:1px solid #334155;
  border-radius:18px;
  background:#111827;
  box-sizing:border-box
}
h1{margin-top:0}
</style>
</head>
<body>
<div class="box">
<h1>SYS STREAM</h1>
<p>${safe}</p>
</div>
</body>
</html>`,
    {
      status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    },
  );
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);

  const state = url.searchParams.get("state")?.trim() || "";
  const code = url.searchParams.get("code")?.trim() || "";
  const platform = url.searchParams.get("platform")?.trim().toLowerCase() || "";
  const providerError = url.searchParams.get("error")?.trim() || "";

  if (providerError) {
    return html(
      "OAuth dibatalkan atau ditolak oleh provider.",
      400,
    );
  }

  if (!state || !code || !platform) {
    return html(
      "Parameter OAuth tidak lengkap.",
      400,
    );
  }

  if (!ALLOWED_PLATFORMS.has(platform)) {
    return html(
      "Platform OAuth tidak didukung.",
      400,
    );
  }

  const admin = await requireAdmin(
    context.request,
    context.env as any,
  );

  if (!admin.ok) {
    return html("Akses admin diperlukan.", 401);
  }

  const db = getDB(context.env as any);

  const row = await db
    .prepare(
      `SELECT
         state,
         platform,
         created_by,
         redirect_uri,
         expires_at,
         created_at
       FROM social_oauth_states
       WHERE state = ?1`,
    )
    .bind(state)
    .first<OAuthState>();

  if (!row) {
    return html(
      "OAuth state tidak ditemukan atau sudah digunakan.",
      400,
    );
  }

  if (row.platform !== platform) {
    return html(
      "OAuth platform tidak cocok.",
      400,
    );
  }

  const currentAdminId = String(admin.identity.id || "");
  const currentAdminEmail = String(admin.identity.email || "").toLowerCase();
  const stateOwner = String(row.created_by || "");
  if (
    stateOwner &&
    stateOwner !== currentAdminId &&
    stateOwner.toLowerCase() !== currentAdminEmail
  ) {
    return html(
      "OAuth state bukan milik sesi admin ini.",
      403,
    );
  }

  if (Date.now() > Number(row.expires_at)) {
    await db
      .prepare(
        `DELETE FROM social_oauth_states WHERE state = ?1`,
      )
      .bind(state)
      .run();

    return html(
      "OAuth state sudah kedaluwarsa. Silakan ulangi koneksi.",
      400,
    );
  }

  /*
   * OAuth state adalah one-time credential.
   * Hapus sebelum token exchange agar callback tidak dapat
   * dipakai ulang bila request diulang.
   */
  await db
    .prepare(
      `DELETE FROM social_oauth_states WHERE state = ?1`,
    )
    .bind(state)
    .run();

  if (!isProviderConfigured(context.env, platform as any)) {
    return html(
      "Provider OAuth belum dikonfigurasi di Cloudflare.",
      503,
    );
  }

  const encryptionKey = getEnvString(
    context.env,
    "SOCIAL_TOKEN_ENCRYPTION_KEY",
  );

  if (!encryptionKey) {
    return html(
      "SOCIAL_TOKEN_ENCRYPTION_KEY belum dikonfigurasi.",
      503,
    );
  }

  const provider = getProviderConfig(platform as any);

  const clientId = getEnvString(
    context.env,
    provider.clientIdEnv,
  );

  const clientSecret = getEnvString(
    context.env,
    provider.clientSecretEnv,
  );

  if (!clientId || !clientSecret) {
    return html(
      "Credential OAuth provider belum lengkap.",
      503,
    );
  }

  const redirectUri =
    row.redirect_uri ||
    `${url.origin}/api/admin/social/callback?platform=${encodeURIComponent(platform)}`;

  try {
    const token = await exchangeOAuthCode(
      context.env,
      provider,
      {
        code,
        redirectUri,
        clientId,
        clientSecret,
      },
    );

    const expiresAt =
      typeof token.expires_in === "number"
        ? Date.now() + token.expires_in * 1000
        : null;

    await storeSocialToken(
      db,
      encryptionKey,
      {
        platform,
        accessToken: token.access_token!,
        refreshToken: token.refresh_token ?? null,
        tokenType: token.token_type ?? null,
        scope: token.scope ?? null,
        expiresAt,
        connectedBy:
          row.created_by ||
          admin.identity.email ||
          admin.identity.id ||
          null,
      },
    );

    const now = Math.floor(Date.now() / 1000);
    await db
      .prepare(
        `INSERT INTO social_connections
          (id, platform, account_id, account_name, status, scopes, connected_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, 'CONNECTED', ?5, ?6, ?6)
         ON CONFLICT(id)
         DO UPDATE SET
           platform = excluded.platform,
           account_id = excluded.account_id,
           account_name = excluded.account_name,
           status = excluded.status,
           scopes = excluded.scopes,
           connected_at = excluded.connected_at,
           updated_at = excluded.updated_at`,
      )
      .bind(
        platform,
        platform,
        null,
        platform.toUpperCase(),
        token.scope ?? null,
        now,
      )
      .run();

    return html(
      `Akun ${platform.toUpperCase()} berhasil terhubung ke SYS STREAM.<br><br>
       Token tersimpan secara terenkripsi.<br><br>
       <a href="/admin?tab=social" style="color:#fbbf24">Kembali ke Admin Panel</a>`,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "OAuth token exchange gagal.";

    /*
     * Jangan pernah mengembalikan response body provider secara mentah.
     * Error yang ditampilkan hanya informasi umum.
     */
    console.error("SOCIAL_OAUTH_CALLBACK_ERROR", {
      platform,
      message,
    });

    return html(
      `Gagal menghubungkan ${platform.toUpperCase()}. Silakan ulangi dari Admin Panel.`,
      502,
    );
  }
};
