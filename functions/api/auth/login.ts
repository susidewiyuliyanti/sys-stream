import {
  withDb,
  json,
  readJson,
} from '../_lib/db';

import {
  verifyPassword,
  createToken,
  type AuthUser,
} from '../_lib/auth';

interface Env {
  HYPERDRIVE: Hyperdrive;
  JWT_SECRET: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

function mapUser(row: any): AuthUser {
  return {
    id: Number(row.id),
    uid: row.uid,
    cuid: row.cuid,
    username: row.username,
    email: row.email,
    displayName: row.display_name,
    photoURL: row.photo_url,
    streamerHandle: row.streamer_handle,
    bio: row.bio,
    referralCode: row.referral_code,
    referredBy: row.referred_by,
    referralCount:
      Number(row.referral_count || 0),

    balance:
      Number(row.balance || 0),

    saldo:
      Number(row.saldo || 0),

    walletBalance:
      Number(row.wallet_balance || 0),

    lockedSaldo:
      Number(row.locked_saldo || 0),

    affiliateEarnings:
      Number(row.affiliate_earnings || 0),

    affiliateWithdrawn:
      Number(row.affiliate_withdrawn || 0),

    isSubscribed:
      Boolean(row.is_subscribed),

    subscriptionPlan:
      row.subscription_plan,

    subscriptionExpiresAt:
      row.subscription_expires_at,

    isLifetime:
      Boolean(row.is_lifetime),

    subscribedAt:
      row.subscribed_at,

    role:
      row.role,

    isBlacklisted:
      Boolean(row.is_blacklisted),

    isBanned:
      Boolean(row.is_banned),

    bannedReason:
      row.banned_reason,

    forceJackpotNext:
      Boolean(row.force_jackpot_next),

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

export const onRequestPost:
  PagesFunction<Env> = async ({
    request,
    env,
  }) => {
    try {
      const body =
        await readJson<LoginBody>(
          request
        );

      const email =
        String(
          body.email || ''
        )
          .trim()
          .toLowerCase();

      const password =
        String(
          body.password || ''
        );

      if (!email || !password) {
        return json(
          {
            success: false,
            message:
              'Email dan password wajib diisi.',
          },
          400
        );
      }

      const user =
        await withDb(
          env,
          async (client) => {
            const result =
              await client.query(
                `
                SELECT
                  id,
                  uid,
                  cuid,
                  username,
                  email,
                  password,
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
                WHERE LOWER(email) = $1
                LIMIT 1
                `,
                [email]
              );

            return result.rows[0];
          }
        );

      if (!user) {
        return json(
          {
            success: false,
            message:
              'Email atau password salah.',
            code: 'INVALID_CREDENTIALS',
          },
          401
        );
      }

      if (
        Boolean(user.is_banned) ||
        Boolean(user.is_blacklisted)
      ) {
        return json(
          {
            success: false,
            message:
              user.banned_reason ||
              'Akun Anda tidak dapat digunakan.',
            code: 'ACCOUNT_BLOCKED',
          },
          403
        );
      }

      const passwordValid =
        await verifyPassword(
          password,
          user.password
        );

      if (!passwordValid) {
        return json(
          {
            success: false,
            message:
              'Email atau password salah.',
            code: 'INVALID_CREDENTIALS',
          },
          401
        );
      }

      const mappedUser =
        mapUser(user);

      const token =
        createToken(
          mappedUser,
          env
        );

      return json({
        success: true,
        token,
        user: mappedUser,
      });
    } catch (error) {
      console.error(
        'Login API error:',
        error
      );

      return json(
        {
          success: false,
          message:
            'Terjadi kesalahan pada server.',
        },
        500
      );
    }
  };
