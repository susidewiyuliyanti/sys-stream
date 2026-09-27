import {
  withDb,
  json,
  readJson,
} from '../_lib/db';

import {
  requireAuth,
} from '../_lib/auth';

interface Env {
  HYPERDRIVE: Hyperdrive;
  JWT_SECRET: string;
}

interface SyncBody {
  uid?: string;
  email?: string;
  displayName?: string;
  role?: string;
  walletBalance?: number;
}

export const onRequestPost:
  PagesFunction<Env> = async ({
    request,
    env,
  }) => {
    const auth =
      requireAuth(
        request,
        env
      );

    if (!auth.ok) {
      return auth.response;
    }

    try {
      const body =
        await readJson<SyncBody>(
          request
        );

      const uid =
        String(
          body.uid ||
            auth.user.uid ||
            ''
        ).trim();

      const email =
        String(
          body.email ||
            auth.user.email ||
            ''
        )
          .trim()
          .toLowerCase();

      if (!uid || !email) {
        return json(
          {
            success: false,
            message:
              'UID dan email wajib tersedia.',
          },
          400
        );
      }

      const result =
        await withDb(
          env,
          async (client) => {
            /*
             * Cari berdasarkan UID.
             */
            let found =
              await client.query(
                `
                SELECT *
                FROM users
                WHERE uid = $1
                LIMIT 1
                `,
                [uid]
              );

            /*
             * Jika belum ada, cari berdasarkan email.
             */
            if (
              !found.rows.length
            ) {
              found =
                await client.query(
                  `
                  SELECT *
                  FROM users
                  WHERE LOWER(email) = $1
                  LIMIT 1
                  `,
                  [email]
                );
            }

            /*
             * User sudah ada.
             */
            if (
              found.rows.length
            ) {
              const existing =
                found.rows[0];

              const updated =
                await client.query(
                  `
                  UPDATE users
                  SET
                    uid = COALESCE($1, uid),
                    email = LOWER($2),
                    display_name =
                      COALESCE(
                        NULLIF($3, ''),
                        display_name
                      ),
                    updated_at = NOW()
                  WHERE id = $4
                  RETURNING *
                  `,
                  [
                    uid,
                    email,
                    body.displayName ||
                      '',
                    existing.id,
                  ]
                );

              return updated.rows[0];
            }

            /*
             * Ini hanya fallback.
             * Biasanya user sudah dibuat melalui
             * /register.
             */
            const username =
              email
                .split('@')[0]
                .replace(
                  /[^a-zA-Z0-9_]/g,
                  ''
                )
                .slice(0, 20) ||
              'user';

            const cuid =
              `c_${crypto
                .randomUUID()
                .replace(
                  /-/g,
                  ''
                )}`;

            const referralCode =
              `SYS-${crypto
                .randomUUID()
                .replace(
                  /-/g,
                  ''
                )
                .slice(0, 10)
                .toUpperCase()}`;

            const inserted =
              await client.query(
                `
                INSERT INTO users (
                  uid,
                  cuid,
                  username,
                  email,
                  password,
                  display_name,
                  referral_code,
                  balance,
                  saldo,
                  wallet_balance,
                  locked_saldo,
                  affiliate_earnings,
                  affiliate_withdrawn,
                  is_subscribed,
                  subscription_plan,
                  is_lifetime,
                  role,
                  is_blacklisted,
                  is_banned,
                  force_jackpot_next
                )
                VALUES (
                  $1,
                  $2,
                  $3,
                  $4,
                  $5,
                  $6,
                  $7,
                  100000,
                  15000,
                  15000,
                  0,
                  0,
                  0,
                  true,
                  'Akses Bebas Gratis (Permanen)',
                  true,
                  'USER',
                  false,
                  false,
                  false
                )
                RETURNING *
                `,
                [
                  uid,
                  cuid,
                  `${username}_${crypto
                    .randomUUID()
                    .replace(
                      /-/g,
                      ''
                    )
                    .slice(0, 6)}`,
                  email,
                  '',
                  body.displayName ||
                    username,
                  referralCode,
                ]
              );

            return inserted.rows[0];
          }
        );

      return json({
        success: true,
        user: {
          id: Number(result.id),
          uid: result.uid,
          cuid: result.cuid,
          username:
            result.username,
          email:
            result.email,
          displayName:
            result.display_name,
          photoURL:
            result.photo_url,
          streamerHandle:
            result.streamer_handle,
          bio:
            result.bio,
          referralCode:
            result.referral_code,
          referredBy:
            result.referred_by,
          referralCount:
            Number(
              result.referral_count ||
                0
            ),
          balance:
            Number(
              result.balance || 0
            ),
          saldo:
            Number(
              result.saldo || 0
            ),
          walletBalance:
            Number(
              result.wallet_balance ||
                0
            ),
          lockedSaldo:
            Number(
              result.locked_saldo ||
                0
            ),
          affiliateEarnings:
            Number(
              result.affiliate_earnings ||
                0
            ),
          affiliateWithdrawn:
            Number(
              result.affiliate_withdrawn ||
                0
            ),
          isSubscribed:
            Boolean(
              result.is_subscribed
            ),
          subscriptionPlan:
            result.subscription_plan,
          subscriptionExpiresAt:
            result.subscription_expires_at,
          isLifetime:
            Boolean(
              result.is_lifetime
            ),
          subscribedAt:
            result.subscribed_at,
          role:
            result.role,
          isBlacklisted:
            Boolean(
              result.is_blacklisted
            ),
          isBanned:
            Boolean(
              result.is_banned
            ),
          bannedReason:
            result.banned_reason,
          forceJackpotNext:
            Boolean(
              result.force_jackpot_next
            ),
          createdAt:
            result.created_at,
          updatedAt:
            result.updated_at,
        },
      });
    } catch (error) {
      console.error(
        'Sync session error:',
        error
      );

      return json(
        {
          success: false,
          message:
            'Gagal melakukan sinkronisasi session.',
        },
        500
      );
    }
  };
