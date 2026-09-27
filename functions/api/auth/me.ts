import {
  withDb,
  json,
} from '../_lib/db';

import {
  requireAuth,
} from '../_lib/auth';

interface Env {
  HYPERDRIVE: Hyperdrive;
  JWT_SECRET: string;
}

export const onRequestGet:
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
      const result =
        await withDb(
          env,
          async (client) => {
            return client.query(
              `
              SELECT
                id,
                uid,
                cuid,
                username,
                email,
                display_name,
                photo_url,
                streamer_handle,
                bio,
                referral_code,
                referred_by,
                referral_count,
                balance,
                saldo,
                wallet_balance,
                locked_saldo,
                affiliate_earnings,
                affiliate_withdrawn,
                is_subscribed,
                subscription_plan,
                subscription_expires_at,
                is_lifetime,
                subscribed_at,
                role,
                is_blacklisted,
                is_banned,
                banned_reason,
                force_jackpot_next,
                created_at,
                updated_at
              FROM users
              WHERE id = $1
              LIMIT 1
              `,
              [Number(auth.user.sub)]
            );
          }
        );

      const user =
        result.rows[0];

      if (!user) {
        return json(
          {
            success: false,
            message:
              'User tidak ditemukan.',
          },
          404
        );
      }

      if (
        user.is_banned ||
        user.is_blacklisted
      ) {
        return json(
          {
            success: false,
            message:
              user.banned_reason ||
              'Akun diblokir.',
          },
          403
        );
      }

      return json({
        success: true,
        user: {
          id: Number(user.id),
          uid: user.uid,
          cuid: user.cuid,
          username: user.username,
          email: user.email,
          displayName:
            user.display_name,
          photoURL:
            user.photo_url,
          streamerHandle:
            user.streamer_handle,
          bio: user.bio,
          referralCode:
            user.referral_code,
          referredBy:
            user.referred_by,
          referralCount:
            Number(
              user.referral_count || 0
            ),
          balance:
            Number(
              user.balance || 0
            ),
          saldo:
            Number(
              user.saldo || 0
            ),
          walletBalance:
            Number(
              user.wallet_balance ||
                0
            ),
          lockedSaldo:
            Number(
              user.locked_saldo ||
                0
            ),
          affiliateEarnings:
            Number(
              user.affiliate_earnings ||
                0
            ),
          affiliateWithdrawn:
            Number(
              user.affiliate_withdrawn ||
                0
            ),
          isSubscribed:
            Boolean(
              user.is_subscribed
            ),
          subscriptionPlan:
            user.subscription_plan,
          subscriptionExpiresAt:
            user.subscription_expires_at,
          isLifetime:
            Boolean(
              user.is_lifetime
            ),
          subscribedAt:
            user.subscribed_at,
          role: user.role,
          isBlacklisted:
            Boolean(
              user.is_blacklisted
            ),
          isBanned:
            Boolean(
              user.is_banned
            ),
          bannedReason:
            user.banned_reason,
          forceJackpotNext:
            Boolean(
              user.force_jackpot_next
            ),
          createdAt:
            user.created_at,
          updatedAt:
            user.updated_at,
        },
      });
    } catch (error) {
      console.error(
        'Auth me error:',
        error
      );

      return json(
        {
          success: false,
          message:
            'Gagal mengambil session user.',
        },
        500
      );
    }
  };
