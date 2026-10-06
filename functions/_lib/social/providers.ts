import type { SocialPlatform } from "../social";

export type OAuthProviderConfig = {
  platform: SocialPlatform;
  clientIdEnv: string;
  clientSecretEnv: string;
  tokenUrlEnv: string;
  authUrlEnv: string;
  scopesEnv: string;
};

export type OAuthTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
};

export const PROVIDER_CONFIGS: Record<SocialPlatform, OAuthProviderConfig> = {
  tiktok: {
    platform: "tiktok",
    clientIdEnv: "TIKTOK_CLIENT_ID",
    clientSecretEnv: "TIKTOK_CLIENT_SECRET",
    tokenUrlEnv: "TIKTOK_OAUTH_TOKEN_URL",
    authUrlEnv: "TIKTOK_OAUTH_AUTH_URL",
    scopesEnv: "TIKTOK_OAUTH_SCOPES",
  },

  youtube: {
    platform: "youtube",
    clientIdEnv: "YOUTUBE_CLIENT_ID",
    clientSecretEnv: "YOUTUBE_CLIENT_SECRET",
    tokenUrlEnv: "YOUTUBE_OAUTH_TOKEN_URL",
    authUrlEnv: "YOUTUBE_OAUTH_AUTH_URL",
    scopesEnv: "YOUTUBE_OAUTH_SCOPES",
  },

  instagram: {
    platform: "instagram",
    clientIdEnv: "INSTAGRAM_CLIENT_ID",
    clientSecretEnv: "INSTAGRAM_CLIENT_SECRET",
    tokenUrlEnv: "INSTAGRAM_OAUTH_TOKEN_URL",
    authUrlEnv: "INSTAGRAM_OAUTH_AUTH_URL",
    scopesEnv: "INSTAGRAM_OAUTH_SCOPES",
  },

  x: {
    platform: "x",
    clientIdEnv: "X_CLIENT_ID",
    clientSecretEnv: "X_CLIENT_SECRET",
    tokenUrlEnv: "X_OAUTH_TOKEN_URL",
    authUrlEnv: "X_OAUTH_AUTH_URL",
    scopesEnv: "X_OAUTH_SCOPES",
  },

  telegram: {
    platform: "telegram",
    clientIdEnv: "TELEGRAM_CLIENT_ID",
    clientSecretEnv: "TELEGRAM_CLIENT_SECRET",
    tokenUrlEnv: "TELEGRAM_OAUTH_TOKEN_URL",
    authUrlEnv: "TELEGRAM_OAUTH_AUTH_URL",
    scopesEnv: "TELEGRAM_OAUTH_SCOPES",
  },

  discord: {
    platform: "discord",
    clientIdEnv: "DISCORD_CLIENT_ID",
    clientSecretEnv: "DISCORD_CLIENT_SECRET",
    tokenUrlEnv: "DISCORD_OAUTH_TOKEN_URL",
    authUrlEnv: "DISCORD_OAUTH_AUTH_URL",
    scopesEnv: "DISCORD_OAUTH_SCOPES",
  },
};

/*
 * Default endpoint resmi untuk platform yang didukung "satu klik".
 * Owner cukup mengisi CLIENT_ID dan CLIENT_SECRET di Cloudflare.
 * Variabel *_OAUTH_AUTH_URL / *_OAUTH_TOKEN_URL / *_OAUTH_SCOPES
 * tetap bisa dipakai untuk menimpa nilai default ini.
 */
export type ProviderDefaults = {
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
};

export const PROVIDER_DEFAULTS: Partial<
  Record<SocialPlatform, ProviderDefaults>
> = {
  tiktok: {
    authUrl: "https://www.tiktok.com/v2/auth/authorize/",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    scopes: ["user.info.basic"],
  },
  youtube: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["https://www.googleapis.com/auth/youtube.readonly"],
  },
  instagram: {
    authUrl: "https://www.instagram.com/oauth/authorize",
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    scopes: ["instagram_business_basic"],
  },
};

export function getProviderConfig(
  platform: SocialPlatform,
): OAuthProviderConfig {
  return PROVIDER_CONFIGS[platform];
}

export function getAuthUrl(
  env: Record<string, unknown>,
  platform: SocialPlatform,
): string {
  const config = getProviderConfig(platform);

  return (
    getEnvString(env, config.authUrlEnv) ||
    PROVIDER_DEFAULTS[platform]?.authUrl ||
    ""
  );
}

export function getTokenUrl(
  env: Record<string, unknown>,
  platform: SocialPlatform,
): string {
  const config = getProviderConfig(platform);

  return (
    getEnvString(env, config.tokenUrlEnv) ||
    PROVIDER_DEFAULTS[platform]?.tokenUrl ||
    ""
  );
}

export function getEnvString(
  env: Record<string, unknown>,
  key: string,
): string {
  const value = env[key];

  return typeof value === "string" ? value.trim() : "";
}

export function getProviderScopes(
  env: Record<string, unknown>,
  platform: SocialPlatform,
): string[] {
  const config = getProviderConfig(platform);
  const raw = getEnvString(env, config.scopesEnv);

  if (!raw) {
    return PROVIDER_DEFAULTS[platform]?.scopes ?? [];
  }

  return raw
    .split(/[,\s]+/)
    .map((scope) => scope.trim())
    .filter(Boolean);
}

export function isProviderConfigured(
  env: Record<string, unknown>,
  platform: SocialPlatform,
): boolean {
  const config = getProviderConfig(platform);

  return Boolean(
    getEnvString(env, config.clientIdEnv) &&
      getEnvString(env, config.clientSecretEnv) &&
      getTokenUrl(env, platform) &&
      getAuthUrl(env, platform),
  );
}
