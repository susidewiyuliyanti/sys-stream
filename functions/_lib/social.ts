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

const CASTANCE_PLATFORM: Record<SocialPlatform,string> = {
  tiktok: "tiktok",
  youtube: "youtube",
  instagram: "instagram",
  x: "twitter",
  telegram: "telegram",
  discord: "discord",
};

function envString(env: Record<string, unknown>, key: string): string {
  const value = env[key];
  return typeof value === "string" ? value.trim() : "";
}

export function getSocialProviderConfig(
  env: Record<string, unknown>,
  platform: SocialPlatform,
): SocialProviderConfig {
  const apiKey = envString(env, "CASTANCE_API_KEY");
  const channelPackId = envString(env, "CASTANCE_CHANNEL_PACK_ID");
  const enabled = Boolean(apiKey && channelPackId);
  const castancePlatform = CASTANCE_PLATFORM[platform];

  return {
    platform,
    enabled,
    configured: enabled,
    authorizationEndpoint: enabled
      ? `https://castance.com/v1/connect/${castancePlatform}`
      : null,
    scopes: [],
  };
}

export function getCastancePlatform(platform: SocialPlatform): string {
  return CASTANCE_PLATFORM[platform];
}

export function getCastanceConfig(env: Record<string, unknown>) {
  const apiKey = envString(env, "CASTANCE_API_KEY");
  const channelPackId = envString(env, "CASTANCE_CHANNEL_PACK_ID");
  return {
    apiKey,
    channelPackId,
    configured: Boolean(apiKey && channelPackId),
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
