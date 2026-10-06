import type { SocialPlatform } from "../social";
import type { OAuthTokenResponse } from "./providers";

export type SocialProfile = {
  accountId: string | null;
  accountName: string | null;
};

const EMPTY: SocialProfile = { accountId: null, accountName: null };

async function getJson(
  url: string,
  headers: Record<string, string> = {},
): Promise<any | null> {
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json", ...headers },
    });

    if (!response.ok) return null;

    return await response.json();
  } catch {
    return null;
  }
}

/*
 * Mengambil identitas akun yang baru terhubung supaya Admin Panel bisa
 * menampilkan nama channel/akun. Best effort: kegagalan di sini tidak boleh
 * membatalkan koneksi, jadi selalu mengembalikan nilai kosong saat gagal.
 */
export async function fetchSocialProfile(
  platform: SocialPlatform,
  accessToken: string,
): Promise<SocialProfile> {
  if (platform === "youtube") {
    const data = await getJson(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      { authorization: `Bearer ${accessToken}` },
    );
    const item = data?.items?.[0];

    return {
      accountId: item?.id ? String(item.id) : null,
      accountName: item?.snippet?.title ? String(item.snippet.title) : null,
    };
  }

  if (platform === "tiktok") {
    const data = await getJson(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name",
      { authorization: `Bearer ${accessToken}` },
    );
    const user = data?.data?.user;

    return {
      accountId: user?.open_id ? String(user.open_id) : null,
      accountName: user?.display_name ? String(user.display_name) : null,
    };
  }

  if (platform === "instagram") {
    const data = await getJson(
      `https://graph.instagram.com/me?fields=user_id,username&access_token=${encodeURIComponent(
        accessToken,
      )}`,
    );

    return {
      accountId: data?.user_id
        ? String(data.user_id)
        : data?.id
          ? String(data.id)
          : null,
      accountName: data?.username ? `@${String(data.username)}` : null,
    };
  }

  return EMPTY;
}

/*
 * Token Instagram hasil login hanya berlaku sekitar 1 jam. Tukarkan ke
 * long-lived token (sekitar 60 hari). Bila gagal, pakai token awal.
 */
export async function upgradeInstagramToken(
  token: OAuthTokenResponse,
  clientSecret: string,
): Promise<OAuthTokenResponse> {
  if (!token.access_token) return token;

  const url =
    "https://graph.instagram.com/access_token" +
    `?grant_type=ig_exchange_token` +
    `&client_secret=${encodeURIComponent(clientSecret)}` +
    `&access_token=${encodeURIComponent(token.access_token)}`;

  const data = await getJson(url);

  if (!data?.access_token) return token;

  return {
    ...token,
    access_token: String(data.access_token),
    token_type: data.token_type ? String(data.token_type) : token.token_type,
    expires_in:
      typeof data.expires_in === "number" ? data.expires_in : token.expires_in,
  };
}
