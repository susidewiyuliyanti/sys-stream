import type { D1Database } from "@cloudflare/workers-types";
import { encryptSocialToken } from "./crypto";

export type StoreSocialTokenInput = {
  platform: string;
  accessToken: string;
  refreshToken?: string | null;
  tokenType?: string | null;
  scope?: string | null;
  expiresAt?: number | null;
  connectedBy?: string | null;
};

export async function storeSocialToken(
  db: D1Database,
  encryptionKey: string,
  input: StoreSocialTokenInput,
): Promise<void> {
  if (!input.platform) {
    throw new Error("Platform kosong.");
  }

  if (!input.accessToken) {
    throw new Error("Access token kosong.");
  }

  const accessTokenEnc = await encryptSocialToken(
    encryptionKey,
    input.accessToken,
  );

  const refreshTokenEnc = input.refreshToken
    ? await encryptSocialToken(encryptionKey, input.refreshToken)
    : null;

  const now = Date.now();

  await db
    .prepare(
      `INSERT INTO social_oauth_tokens
       (
         platform,
         access_token_enc,
         refresh_token_enc,
         token_type,
         scope,
         expires_at,
         connected_by,
         created_at,
         updated_at
       )
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?8)
       ON CONFLICT(platform)
       DO UPDATE SET
         access_token_enc = excluded.access_token_enc,
         refresh_token_enc = excluded.refresh_token_enc,
         token_type = excluded.token_type,
         scope = excluded.scope,
         expires_at = excluded.expires_at,
         connected_by = excluded.connected_by,
         updated_at = excluded.updated_at`,
    )
    .bind(
      input.platform,
      accessTokenEnc,
      refreshTokenEnc,
      input.tokenType ?? null,
      input.scope ?? null,
      input.expiresAt ?? null,
      input.connectedBy ?? null,
      now,
    )
    .run();
}
