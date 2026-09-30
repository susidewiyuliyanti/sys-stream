import { hashPassword, createToken, type UserRole } from '../_lib/auth';
import { json, readJson, withDb, type Env } from '../_lib/db';

const BASE_BONUS_IDR = 15000;

const FALLBACK_RATES: Record<string, number> = {
  IDR: 1,
  USD: 0.000058,
  SGD: 0.000074,
  MYR: 0.000241,
  JPY: 0.0091,
  EUR: 0.000049,
  GBP: 0.000043,
  AUD: 0.000087,
  CAD: 0.000079,
  CNY: 0.00042,
  KRW: 0.077,
  THB: 0.00187,
  PHP: 0.0034,
  VND: 1.47,
  HKD: 0.00045,
  TWD: 0.00182,
};

const COUNTRY_CURRENCY: Record<string, string> = {
  ID: 'IDR',
  US: 'USD',
  SG: 'SGD',
  MY: 'MYR',
  JP: 'JPY',
  GB: 'GBP',
  AU: 'AUD',
  CA: 'CAD',
  CN: 'CNY',
  KR: 'KRW',
  TH: 'THB',
  PH: 'PHP',
  VN: 'VND',
  HK: 'HKD',
  TW: 'TWD',

  AT: 'EUR',
  BE: 'EUR',
  CY: 'EUR',
  DE: 'EUR',
  EE: 'EUR',
  ES: 'EUR',
  FI: 'EUR',
  FR: 'EUR',
  GR: 'EUR',
  IE: 'EUR',
  IT: 'EUR',
  LT: 'EUR',
  LU: 'EUR',
  LV: 'EUR',
  MT: 'EUR',
  NL: 'EUR',
  PT: 'EUR',
  SI: 'EUR',
  SK: 'EUR',
};

function normalizeCountryCode(value: unknown): string {
  if (typeof value !== 'string') return 'ID';

  const code = value.trim().toUpperCase();

  if (/^[A-Z]{2}$/.test(code)) {
    return code;
  }

  return 'ID';
}

function getCurrency(countryCode: string, requestedCurrency?: unknown): string {
  if (
    typeof requestedCurrency === 'string' &&
    /^[A-Z]{3}$/.test(requestedCurrency.trim().toUpperCase())
  ) {
    return requestedCurrency.trim().toUpperCase();
  }

  return COUNTRY_CURRENCY[countryCode] || 'IDR';
}

async function getRegistrationRate(currency: string): Promise<number> {
  if (currency === 'IDR') {
    return 1;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    try {
      const response = await fetch(
        'https://open.er-api.com/v6/latest/IDR',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        },
      );

      if (response.ok) {
        const data = (await response.json()) as {
          result?: string;
          rates?: Record<string, number>;
        };

        const liveRate = data.rates?.[currency];

        if (
          data.result === 'success' &&
          typeof liveRate === 'number' &&
          Number.isFinite(liveRate) &&
          liveRate > 0
        ) {
          return liveRate;
        }
      }
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    // Gunakan fallback jika layanan kurs tidak tersedia.
  }

  return FALLBACK_RATES[currency] ?? 1;
}

function calculateBonus(baseIdr: number, rate: number): number {
  const converted = baseIdr * rate;

  if (!Number.isFinite(converted) || converted <= 0) {
    return baseIdr;
  }

  return Math.max(1, Math.round(converted));
}

export const onRequestPost = async ({
  request,
  env,
}: {
  request: Request;
  env: Env;
}) => {
  const body = await readJson<{
    username?: string;
    email?: string;
    password?: string;
    displayName?: string;
    countryCode?: string;
    currency?: string;
  }>(request);

  const username = String(body.username || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const displayName = String(body.displayName || username).trim();

  const countryCode = normalizeCountryCode(body.countryCode);
  const currency = getCurrency(countryCode, body.currency);

  if (username.length < 3 || username.length > 30) {
    return json(
      { error: 'Username harus terdiri dari 3-30 karakter.' },
      400,
    );
  }

  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    return json(
      { error: 'Username hanya boleh menggunakan huruf, angka, titik, garis bawah, dan tanda hubung.' },
      400,
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(
      { error: 'Format email tidak valid.' },
      400,
    );
  }

  if (password.length < 6) {
    return json(
      { error: 'Password minimal 6 karakter.' },
      400,
    );
  }

  const passwordHash = await hashPassword(password);
  const cuid = `usr_${crypto.randomUUID()}`;

  const exchangeRate = await getRegistrationRate(currency);
  const registrationBonus = calculateBonus(
    BASE_BONUS_IDR,
    exchangeRate,
  );

  try {
    const result = await withDb(env, async (client) => {
      await client.query('BEGIN');

      try {
        const duplicate = await client.query(
          `
          SELECT id
          FROM users
          WHERE LOWER(email) = LOWER($1)
             OR LOWER(username) = LOWER($2)
          LIMIT 1
          `,
          [email, username],
        );

        if (duplicate.rows.length > 0) {
          await client.query('ROLLBACK');

          return {
            duplicate: true,
          };
        }

        const inserted = await client.query(
          `
          INSERT INTO users
          (
            cuid,
            username,
            email,
            password,
            display_name,
            balance,
            role
          )
          VALUES
          ($1, $2, $3, $4, $5, $6, $7)
          RETURNING
            id,
            cuid,
            username,
            email,
            display_name,
            balance,
            role
          `,
          [
            cuid,
            username,
            email,
            passwordHash,
            displayName,
            registrationBonus,
            'USER',
          ],
        );

        const user = inserted.rows[0];

        await client.query(
          `
          INSERT INTO registration_bonuses
          (
            user_id,
            base_amount_idr,
            currency,
            amount,
            exchange_rate
          )
          VALUES
          ($1, $2, $3, $4, $5)
          `,
          [
            user.id,
            BASE_BONUS_IDR,
            currency,
            registrationBonus,
            exchangeRate,
          ],
        );

        await client.query('COMMIT');

        return {
          duplicate: false,
          user,
        };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    });

    if (result.duplicate) {
      return json(
        { error: 'Email atau username sudah digunakan.' },
        409,
      );
    }

    const user = result.user;

    const role = String(user.role || 'USER') as UserRole;

    const token = await createToken(
      {
        id: Number(user.id),
        cuid: String(user.cuid),
        username: String(user.username),
        email: String(user.email),
        role,
      },
      env,
    );

    return json(
      {
        success: true,
        token,
        user: {
          id: Number(user.id),
          cuid: String(user.cuid),
          uid: String(user.cuid),
          username: String(user.username),
          email: String(user.email),
          displayName: String(user.display_name || ''),
          role,
          balance: Number(user.balance),
          countryCode,
          currency,
          registrationBonus,
          registrationBonusBaseIdr: BASE_BONUS_IDR,
        },
      },
      201,
    );
  } catch (error) {
    console.error('Register error:', error);

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error('Register database/message:', message);

    return json(
      {
        error: 'Terjadi kesalahan saat membuat akun.',
        detail: message,
      },
      500,
    );
  }
};
