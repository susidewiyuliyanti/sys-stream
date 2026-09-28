import { withDb, json, readJson } from '../_lib/db';
import {
  createToken,
  verifyPassword,
  type Env,
  type AuthUser,
} from '../_lib/auth';

interface LoginBody {
  login?: string;
  email?: string;
  password?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await readJson<LoginBody>(context.request);

    const login = String(
      body.login ?? body.email ?? ''
    )
      .trim()
      .toLowerCase();

    const password = String(body.password ?? '');

    if (!login || !password) {
      return json(
        {
          error: 'Email/username dan password wajib diisi.',
        },
        400
      );
    }

    const result = await withDb(context.env, async (client) => {
      const query = await client.query(
        `
        SELECT
          id,
          cuid,
          username,
          email,
          password,
          role,
          balance,
          is_blacklisted AS "isBlacklisted"
        FROM users
        WHERE LOWER(email) = $1
           OR LOWER(username) = $1
        LIMIT 1
        `,
        [login]
      );

      return query.rows[0] ?? null;
    });

    if (!result) {
      return json(
        {
          error: 'Email atau username tidak ditemukan.',
        },
        401
      );
    }

    const passwordValid = await verifyPassword(
      password,
      result.password
    );

    if (!passwordValid) {
      return json(
        {
          error: 'Password salah.',
        },
        401
      );
    }

    if (result.isBlacklisted === true) {
      return json(
        {
          error: 'Akun Anda sedang diblokir.',
        },
        403
      );
    }

    const user: AuthUser = {
      id: Number(result.id),
      cuid: String(result.cuid),
      username: String(result.username),
      email: String(result.email),
      role: result.role,
    };

    const token = createToken(
      user,
      context.env
    );

    return json({
      success: true,
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        cuid: user.cuid,
        username: user.username,
        email: user.email,
        role: user.role,
        balance: Number(result.balance ?? 0),
        isBlacklisted: Boolean(result.isBlacklisted),
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    return json(
      {
        error: 'Terjadi kesalahan saat login.',
      },
      500
    );
  }
};

