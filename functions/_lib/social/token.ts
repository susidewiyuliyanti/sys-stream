import type {
  OAuthProviderConfig,
  OAuthTokenResponse,
} from "./providers";

export type TokenExchangeInput = {
  code: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
};

export async function exchangeOAuthCode(
  config: OAuthProviderConfig,
  input: TokenExchangeInput,
): Promise<OAuthTokenResponse> {
  if (!input.code.trim()) {
    throw new Error("OAuth authorization code kosong.");
  }

  if (!input.redirectUri.trim()) {
    throw new Error("OAuth redirect URI kosong.");
  }

  const tokenUrl = process.env[config.tokenUrlEnv];

  /*
   * Cloudflare Workers/Pages tidak menggunakan process.env.
   * Fungsi provider-specific exchange akan menerima token URL
   * secara eksplisit pada tahap berikutnya.
   */

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

  let data: OAuthTokenResponse = {};

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

  return data;
}
