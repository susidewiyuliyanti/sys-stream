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

  const tokenUrlValue = env[config.tokenUrlEnv];

  const tokenUrl =
    typeof tokenUrlValue === "string"
      ? tokenUrlValue.trim()
      : "";

  if (!tokenUrl) {
    throw new Error(
      `Token endpoint belum dikonfigurasi: ${config.tokenUrlEnv}`,
    );
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: input.redirectUri,
    client_id: input.clientId,
    client_secret: input.clientSecret,
  });

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

  if (!data.access_token) {
    throw new Error(
      "OAuth provider tidak mengembalikan access_token.",
    );
  }

  return data;
}
