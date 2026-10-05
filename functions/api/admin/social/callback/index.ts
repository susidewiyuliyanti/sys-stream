import type { PagesFunction } from "@cloudflare/workers-types";
import { getCastanceConfig, getCastancePlatform, SOCIAL_PLATFORMS, SocialPlatform } from "../../../../_lib/social";

type Env = {
  DB: D1Database;
  [key: string]: unknown;
};

function validPlatform(value: string): value is SocialPlatform {
  return (SOCIAL_PLATFORMS as string[]).includes(value);
}

function adminUrl(status: string, platform: string) {
  return `https://admin.sysstreamer.asia/admin?tab=social&social=${encodeURIComponent(platform)}&status=${encodeURIComponent(status)}`;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const platform = String(
    url.searchParams.get("platform") || "",
  ).trim().toLowerCase();
  const connected = url.searchParams.get("connected") || "";
  const error = url.searchParams.get("error") || "";

  if (!validPlatform(platform)) {
    return Response.redirect(adminUrl("error", "unknown"), 302);
  }

  if (error) {
    return Response.redirect(adminUrl("cancelled", platform), 302);
  }

  const config = getCastanceConfig(context.env as Record<string, unknown>);
  if (!config.configured) {
    return Response.redirect(adminUrl("not_configured", platform), 302);
  }

  try {
    const response = await fetch("https://castance.com/v1/accounts", {
      headers: {
        "X-API-Key": config.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Castance accounts request failed: ${response.status}`);
    }

    const payload = await response.json().catch(() => ({} as any));
    const accounts = Array.isArray(payload?.data) ? payload.data : [];

    const now = Math.floor(Date.now() / 1000);

    for (const account of accounts) {
      const accountPlatform = String(account?.platform || "").toLowerCase();
      if (!validPlatform(accountPlatform)) continue;

      const accountId = String(account?.id || account?.accountId || "").trim();
      if (!accountId) continue;

      const accountName = String(
        account?.username ||
        account?.name ||
        account?.displayName ||
        accountPlatform.toUpperCase(),
      ).trim();

      const scopes = Array.isArray(account?.scopes)
        ? account.scopes.join(" ")
        : typeof account?.scopes === "string"
          ? account.scopes
          : null;

      await context.env.DB.prepare(
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
        .bind(
          accountId,
          accountPlatform,
          accountId,
          accountName,
          scopes,
          now,
          now,
        )
        .run();
    }

    return Response.redirect(
      adminUrl(connected || "connected", platform),
      302,
    );
  } catch (errorValue) {
    console.error("CASTANCE_CALLBACK_ERROR", {
      platform,
      message: errorValue instanceof Error ? errorValue.message : String(errorValue),
    });

    return Response.redirect(adminUrl("error", platform), 302);
  }
};
