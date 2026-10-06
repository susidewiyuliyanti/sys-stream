import { getTokenUrl } from "./providers";
import type { OAuthProviderConfig, OAuthTokenResponse } from "./providers";

export type TokenExchangeInput = {
  code: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
};

export async function exchangeOAuthCode(
  env: Record<string, unknown>,
  config: OAuthProviderConfig,
  input: TokenExchangeInput,
): Promise<OAuthTokenResponse> {
  if (!input.code.trim()) {
    throw new Error("OAuth authorization code kosong.");
  }

  if (!input.redirectUri.trim()) {
    throw new Error("OAuth redirect URI kosong.");
  }

  const tokenUrl = getTokenUrl(env, config.platform);

  if (!tokenUrl) {
    throw new Error(
      `Token endpoint belum dikonfigurasi: ${config.tokenUrlEnv}`,
    );
  }

  const params: Record<string, string> = {
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: input.redirectUri,
    client_secret: input.clientSecret,
  };

  if (config.platform === "tiktok") {
    params.client_key = input.clientId;
  } else {
    params.client_id = input.clientId;
  }

  const body = new URLSearchParams(params);

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body,
  });

  const text = await response.text();

  let data: OAuthTokenResponse;

  try {
    data = JSON.parse(text) as OAuthTokenResponse;
  } catch {
    throw new Error(
      `OAuth token endpoint mengembalikan respons tidak valid (${response.status}).`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `OAuth token exchange gagal (${response.status}).`,
    );
  }

  /* Instagram dapat membungkus hasilnya dalam { data: [ {...} ] }. */
  const wrapped = (data as { data?: OAuthTokenResponse[] }).data;
  if (!data.access_token && Array.isArray(wrapped) && wrapped[0]) {
    data = wrapped[0];
  }

  if (!data.access_token) {
    throw new Error(
      "OAuth provider tidak mengembalikan access_token.",
    );
  }

  return data;
}
