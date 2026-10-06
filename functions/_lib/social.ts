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

  const authorizationEndpoint =
    typeof env[`${key}_OAUTH_AUTH_URL`] === "string"
      ? String(env[`${key}_OAUTH_AUTH_URL`])
      : null;

  const clientIdConfigured =
    typeof env[`${key}_CLIENT_ID`] === "string" &&
    Boolean(String(env[`${key}_CLIENT_ID`]).trim());

  const enabled =
    typeof env[`${key}_OAUTH_ENABLED`] === "string"
      ? String(env[`${key}_OAUTH_ENABLED`]).toLowerCase() === "true"
      : false;

  return {
    platform,
    enabled,
    configured: Boolean(authorizationEndpoint && clientIdConfigured),
    authorizationEndpoint,
    scopes: [],
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
