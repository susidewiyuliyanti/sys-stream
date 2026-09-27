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

const PUBLIC_COLUMNS = `
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
`;

function mapUser(row: any) {
  return {
    id: Number(row.id),
    uid: row.uid,
    cuid: row.cuid,
    username: row.username,
    email: row.email,
    displayName:
      row.display_name,
    photoURL:
      row.photo_url,
    streamerHandle:
      row.streamer_handle,
    bio: row.bio,
    referralCode:
      row.referral_code,
    referredBy:
      row.referred_by,
    referralCount:
      Number(
        row.referral_count || 0
      ),
    balance:
      Number(row.balance || 0),
    saldo:
      Number(row.saldo || 0),
    walletBalance:
      Number(
        row.wallet_balance || 0
      ),
    lockedSaldo:
      Number(
        row.locked_saldo || 0
      ),
    affiliateEarnings:
      Number(
        row.affiliate_earnings ||
          0
      ),
    affiliateWithdrawn:
      Number(
        row.affiliate_withdrawn ||
          0
      ),
    isSubscribed:
      Boolean(
        row.is_subscribed
      ),
    subscriptionPlan:
      row.subscription_plan,
    subscriptionExpiresAt:
      row.subscription_expires_at,
    isLifetime:
      Boolean(row.is_lifetime),
    subscribedAt:
      row.subscribed_at,
    role: row.role,
    isBlacklisted:
      Boolean(
        row.is_blacklisted
      ),
    isBanned:
      Boolean(row.is_banned),
    bannedReason:
      row.banned_reason,
    forceJackpotNext:
      Boolean(
        row.force_jackpot_next
      ),
    createdAt:
      row.created_at,
    updatedAt:
      row.updated_at,
  };
}


/*
 * GET
 *
 * /api/user/profile
 * /api/user/profile?uid=xxxxx
 */
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
      const url =
        new URL(request.url);

      const requestedUid =
        url.searchParams.get(
          'uid'
        );

      /*
       * User hanya boleh mengambil dirinya
       * sendiri melalui endpoint ini.
       */
      const uid =
        requestedUid ||
        auth.user.uid;

      if (
        uid !== auth.user.uid
      ) {
        return json(
          {
            success: false,
            message:
              'Anda tidak dapat mengakses profile user lain.',
          },
          403
        );
      }

      const result =
        await withDb(
          env,
          async (client) => {
            return client.query(
              `
              SELECT ${PUBLIC_COLUMNS}
              FROM users
              WHERE uid = $1
              LIMIT 1
              `,
              [uid]
            );
          }
        );

      if (
        !result.rows.length
      ) {
        return json(
          {
            success: false,
            message:
              'User tidak ditemukan.',
          },
          404
        );
      }

      return json({
        success: true,
        user: mapUser(
          result.rows[0]
        ),
      });
    } catch (error) {
      console.error(
        'Get profile error:',
        error
      );

      return json(
        {
          success: false,
          message:
            'Gagal mengambil profile.',
        },
        500
      );
    }
  };


/*
 * PATCH
 *
 * /api/user/profile/:uid
 */
export const onRequestPatch:
  PagesFunction<Env> = async ({
    request,
    env,
    params,
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
      const uid =
        String(
          params.uid || ''
        );

      if (!uid) {
        return json(
          {
            success: false,
            message:
              'UID wajib tersedia.',
          },
          400
        );
      }

      if (
        uid !== auth.user.uid
      ) {
        return json(
          {
            success: false,
            message:
              'Anda hanya dapat mengubah profile sendiri.',
          },
          403
        );
      }

      const body =
        await request.json()
          .catch(() => ({}));

      /*
       * FIELD YANG BOLEH DIUBAH USER.
       *
       * Saldo, wallet, role, ban, subscription,
       * dan field sensitif TIDAK dimasukkan.
       */
      const allowed: Record<
        string,
        string
      > = {
        displayName:
          'display_name',

        photoURL:
          'photo_url',

        streamerHandle:
          'streamer_handle',

        bio:
          'bio',
      };

      const updates: string[] = [];
      const values: any[] = [];

      for (
        const [key, column]
        of Object.entries(
          allowed
        )
      ) {
        if (
          Object.prototype.hasOwnProperty.call(
            body,
            key
          )
        ) {
          updates.push(
            `${column} = $${values.length + 1}`
          );

          values.push(
            body[key] === null
              ? null
              : String(body[key])
          );
        }
      }

      if (!updates.length) {
        return json({
          success: true,
          message:
            'Tidak ada perubahan.',
        });
      }

      updates.push(
        `updated_at = NOW()`
      );

      values.push(uid);

      const result =
        await withDb(
          env,
          async (client) => {
            return client.query(
              `
              UPDATE users
              SET ${updates.join(', ')}
              WHERE uid = $${values.length}
              RETURNING ${PUBLIC_COLUMNS}
              `,
              values
            );
          }
        );

      if (
        !result.rows.length
      ) {
        return json(
          {
            success: false,
            message:
              'User tidak ditemukan.',
          },
          404
        );
      }

      return json({
        success: true,
        user: mapUser(
          result.rows[0]
        ),
      });
    } catch (error) {
      console.error(
        'Update profile error:',
        error
      );

      return json(
        {
          success: false,
          message:
            'Gagal memperbarui profile.',
        },
        500
      );
    }
  };
