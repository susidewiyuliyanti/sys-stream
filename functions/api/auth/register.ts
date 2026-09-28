import crypto from 'crypto';

import { withDb, json, readJson } from '../_lib/db';
import {
  createToken,
  hashPassword,
  type Env,
  type AuthUser,
} from '../_lib/auth';

interface RegisterBody {
  username?: string;
  email?: string;
  password?: string;
  displayName?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await readJson<RegisterBody>(context.request);

    const username = String(
      body.username ?? body.displayName ?? ''
    ).trim();

    const email = String(body.email ?? '')
      .trim()
      .toLowerCase();

    const password = String(body.password ?? '');

    if (!username) {
      return json(
        {
          error: 'Username wajib diisi.',
        },
        400
      );
    }

    if (!email) {
      return json(
        {
          error: 'Email wajib diisi.',
        },
        400
      );
    }

    if (!password || password.length < 6) {
      return json(
        {
          error: 'Password minimal 6 karakter.',
        },
        400
      );
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return json(
        {
          error: 'Format email tidak valid.',
        },
        400
      );
    }

    const passwordHash =
      await hashPassword(password);

    const cuid =
      `usr_${crypto.randomUUID()}`;

    const result = await withDb(
      context.env,
      async (client) => {
        const existing = await client.query(
          `
          SELECT id
          FROM users
          WHERE LOWER(email) = $1
             OR LOWER(username) = $2
          LIMIT 1
          `,
          [email, username.toLowerCase()]
        );

        if (existing.rows.length > 0) {
          return {
            duplicate: true,
            user: null,
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
            balance,
            role
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
          )
          RETURNING
            id,
            cuid,
            username,
            email,
            balance,
            role
          `,
          [
            cuid,
            username,
            email,
            passwordHash,

            // Pertahankan perilaku bonus awal
            // dari sistem game sebelumnya.
            100000,

            'USER',
          ]
        );

        return {
          duplicate: false,
          user: inserted.rows[0],
        };
      }
    );

    if (result.duplicate) {
      return json(
        {
          error:
            'Email atau username sudah terdaftar. Silakan login.',
        },
        409
      );
    }

    const dbUser = result.user;

    if (!dbUser) {
      return json(
        {
          error:
            'Gagal membuat akun.',
        },
        500
      );
    }

    const user: AuthUser = {
      id: Number(dbUser.id),
      cuid: String(dbUser.cuid),
      username: String(dbUser.username),
      email: String(dbUser.email),
      role: dbUser.role,
    };

    const token =
      createToken(
        user,
        context.env
      );

    return json(
      {
        success: true,
        message:
          'Pendaftaran berhasil.',
        token,
        user: {
          id: user.id,
          cuid: user.cuid,
          username: user.username,
          email: user.email,
          role: user.role,
          balance: Number(
            dbUser.balance ?? 100000
          ),
        },
      },
      201
    );
  } catch (error) {
    console.error(
      'Register error:',
      error
    );

    return json(
      {
        error:
          'Terjadi kesalahan saat membuat akun.',
      },
      500
    );
  }
};
