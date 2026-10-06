import {
  getAuthUrl,
  getEnvString,
  getProviderScopes,
} from "./social/providers";

export type SocialPlatform =
  | "tiktok"
  | "youtube"
  | "instagram"
  | "x"
  | "telegram"
  | "discord";

export type SocialProviderConfig = {
  platform: SocialPlatform;
  enabled: boolean;
  configured: boolean;
  authorizationEndpoint: string | null;
  scopes: string[];
};

export function getSocialProviderConfig(
  env: Record<string, unknown>,
  platform: SocialPlatform,
): SocialProviderConfig {
  const key = platform.toUpperCase();

  const authorizationEndpoint = getAuthUrl(env, platform) || null;

  const clientIdConfigured = Boolean(
    getEnvString(env, `${key}_CLIENT_ID`) &&
      getEnvString(env, `${key}_CLIENT_SECRET`),
  );

  const configured = Boolean(authorizationEndpoint && clientIdConfigured);

  /*
   * Provider otomatis aktif saat CLIENT_ID dan CLIENT_SECRET sudah diisi.
   * Set `${PLATFORM}_OAUTH_ENABLED=false` untuk mematikannya secara manual.
   */
  const enabledRaw = getEnvString(env, `${key}_OAUTH_ENABLED`).toLowerCase();
  const enabled = enabledRaw ? enabledRaw === "true" : configured;

  return {
    platform,
    enabled,
    configured,
    authorizationEndpoint,
    scopes: getProviderScopes(env, platform),
  };
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  "tiktok",
  "youtube",
  "instagram",
  "x",
  "telegram",
  "discord",
];
