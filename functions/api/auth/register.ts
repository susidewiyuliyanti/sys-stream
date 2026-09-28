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

    // =========================
    // VALIDATION
    // =========================

    if (!username) {
      return json(
        {
          success: false,
          error: 'Username wajib diisi.',
        },
        400
      );
    }

    if (username.length < 3) {
      return json(
        {
          success: false,
          error: 'Username minimal 3 karakter.',
        },
        400
      );
    }

    if (username.length > 30) {
      return json(
        {
          success: false,
          error: 'Username maksimal 30 karakter.',
        },
        400
      );
    }

    if (!email) {
      return json(
        {
          success: false,
          error: 'Email wajib diisi.',
        },
        400
      );
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return json(
        {
          success: false,
          error: 'Format email tidak valid.',
        },
        400
      );
    }

    if (!password || password.length < 6) {
      return json(
        {
          success: false,
          error: 'Password minimal 6 karakter.',
        },
        400
      );
    }

    // =========================
    // PASSWORD HASH
    // =========================

    const passwordHash = await hashPassword(password);

    // CUID kompatibel dengan kolom text/varchar
    const cuid = `usr_${crypto.randomUUID()}`;

    // =========================
    // DATABASE
    // =========================

    const result = await withDb(
      context.env,
      async (client) => {

        // Cek email / username
        const existing = await client.query(
          `
          SELECT
            id,
            email,
            username
          FROM users
          WHERE LOWER(email) = $1
             OR LOWER(username) = $2
          LIMIT 1
          `,
          [
            email,
            username.toLowerCase(),
          ]
        );

        if (existing.rows.length > 0) {
          const existingUser = existing.rows[0];

          if (
            String(existingUser.email).toLowerCase() === email
          ) {
            return {
              duplicate: 'email' as const,
              user: null,
            };
          }

          return {
            duplicate: 'username' as const,
            user: null,
          };
        }

        // =========================
        // CREATE USER
        // =========================

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

            // Saldo awal game
            100000,

            // User biasa yang baru mendaftar
            'USER',
          ]
        );

        return {
          duplicate: false as const,
          user: inserted.rows[0],
        };
      }
    );

    // =========================
    // DUPLICATE
    // =========================

    if (result.duplicate === 'email') {
      return json(
        {
          success: false,
          error:
            'Email sudah terdaftar. Silakan gunakan email lain atau login.',
        },
        409
      );
    }

    if (result.duplicate === 'username') {
      return json(
        {
          success: false,
          error:
            'Username sudah digunakan. Silakan pilih username lain.',
        },
        409
      );
    }

    // =========================
    // SAFETY CHECK
    // =========================

    const dbUser = result.user;

    if (!dbUser) {
      return json(
        {
          success: false,
          error: 'Gagal membuat akun.',
        },
        500
      );
    }

    // =========================
    // AUTH USER
    // =========================

    const user: AuthUser = {
      id: Number(dbUser.id),
      cuid: String(dbUser.cuid),
      username: String(dbUser.username),
      email: String(dbUser.email),
      role: String(dbUser.role) as AuthUser['role'],
    };

    // =========================
    // JWT
    // =========================

    const token = createToken(
      user,
      context.env
    );

    // =========================
    // RESPONSE
    // =========================

    return json(
      {
        success: true,
        message: 'Pendaftaran berhasil.',
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

    // Jangan sembunyikan detail error
    // ketika development/debugging.
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      'Register database/message:',
      message
    );

    return json(
      {
        success: false,
        error:
          'Terjadi kesalahan saat membuat akun.',
        detail: message,
      },
      500
    );
  }
};
