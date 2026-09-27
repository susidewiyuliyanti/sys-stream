import {
  withDb,
  json,
  readJson,
} from '../_lib/db';

import {
  hashPassword,
  createToken,
  type AuthUser,
} from '../_lib/auth';

interface Env {
  HYPERDRIVE: Hyperdrive;
  JWT_SECRET: string;
}

interface RegisterBody {
  email?: string;
  password?: string;
  displayName?: string;
  username?: string;
  referredBy?: string;
}

function createUid(): string {
  return crypto.randomUUID();
}

function createCuid(): string {
  return `c_${crypto
    .randomUUID()
    .replace(/-/g, '')}`;
}

function createReferralCode(
  username: string
): string {
  const clean =
    username
      .replace(
        /[^a-zA-Z0-9]/g,
        ''
      )
      .toUpperCase()
      .slice(0, 8);

  const suffix =
    crypto
      .randomUUID()
      .replace(/-/g, '')
      .slice(0, 5)
      .toUpperCase();

  return `SYS-${clean}-${suffix}`;
}

function createUsername(
  email: string,
  supplied?: string
): string {
  if (supplied?.trim()) {
    return supplied
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9_]/g,
        ''
      )
      .slice(0, 30);
  }

  const prefix =
    email
      .split('@')[0]
      ?.toLowerCase()
      .replace(
        /[^a-z0-9_]/g,
        ''
      )
      .slice(0, 20) ||
    'user';

  return `${prefix}_${crypto
    .randomUUID()
    .replace(/-/g, '')
    .slice(0, 6)}`;
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
      Number(
        row.affiliate_earnings || 0
      ),
    affiliateWithdrawn:
      Number(
        row.affiliate_withdrawn || 0
      ),
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
      Boolean(
        row.force_jackpot_next
      ),
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
        await readJson<RegisterBody>(
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

      const displayName =
        String(
          body.displayName ||
            ''
        ).trim();

      if (!email) {
        return json(
          {
            success: false,
            message:
              'Email wajib diisi.',
          },
          400
        );
      }

      if (
        !email.includes('@')
      ) {
        return json(
          {
            success: false,
            message:
              'Format email tidak valid.',
          },
          400
        );
      }

      if (
        password.length < 6
      ) {
        return json(
          {
            success: false,
            message:
              'Password minimal 6 karakter.',
          },
          400
        );
      }

      const passwordHash =
        await hashPassword(
          password
        );

      const uid =
        createUid();

      const cuid =
        createCuid();

      const username =
        createUsername(
          email,
          body.username
        );

      const referralCode =
        createReferralCode(
          username
        );

      const referredBy =
        body.referredBy
          ?.trim() || null;

      const user =
        await withDb(
          env,
          async (client) => {
            /*
             * Cegah email duplikat.
             */
            const existingEmail =
              await client.query(
                `
                SELECT id
                FROM users
                WHERE LOWER(email) = $1
                LIMIT 1
                `,
                [email]
              );

            if (
              existingEmail.rows.length
            ) {
              throw new Error(
                'EMAIL_ALREADY_REGISTERED'
              );
            }

            /*
             * Cegah collision username.
             */
            let finalUsername =
              username;

            for (let i = 0; i < 5; i++) {
              const existingUsername =
                await client.query(
                  `
                  SELECT id
                  FROM users
                  WHERE username = $1
                  LIMIT 1
                  `,
                  [finalUsername]
                );

              if (
                !existingUsername
                  .rows.length
              ) {
                break;
              }

              finalUsername =
                `${username}_${crypto
                  .randomUUID()
                  .replace(
                    /-/g,
                    ''
                  )
                  .slice(0, 5)}`;
            }

            const result =
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
                  referred_by,
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
                  $8,
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
                RETURNING
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
                `,
                [
                  uid,
                  cuid,
                  finalUsername,
                  email,
                  passwordHash,
                  displayName ||
                    finalUsername,
                  referralCode,
                  referredBy,
                ]
              );

            return result.rows[0];
          }
        );

      const mappedUser =
        mapUser(user);

      const token =
        createToken(
          mappedUser,
          env
        );

      return json(
        {
          success: true,
          token,
          user: mappedUser,
          verificationSent: false,
        },
        201
      );
    } catch (error: any) {
      if (
        error?.message ===
        'EMAIL_ALREADY_REGISTERED'
      ) {
        return json(
          {
            success: false,
            message:
              'Email tersebut sudah terdaftar.',
            code:
              'EMAIL_ALREADY_REGISTERED',
          },
          409
        );
      }

      console.error(
        'Register API error:',
        error
      );

      return json(
        {
          success: false,
          message:
            'Gagal membuat akun.',
        },
        500
      );
    }
  };
