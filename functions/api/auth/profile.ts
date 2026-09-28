import { withDb, json } from '../_lib/db';
import { requireAuth } from '../_lib/auth';

interface Env {
  HYPERDRIVE: Hyperdrive;
  JWT_SECRET: string;
}

interface ProfileUpdate {
  uid?: string;
  username?: string;
  displayName?: string;
  walletBalance?: number;
  saldo?: number;
}

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const authUser = await requireAuth(context.request, context.env);

    if (!authUser) {
      return json(
        {
          success: false,
          error: 'Unauthorized',
        },
        401
      );
    }

    const body = (await context.request.json()) as ProfileUpdate;

    /*
     * UID dari frontend tidak boleh digunakan untuk menentukan
     * user database yang akan diubah.
     *
     * User yang boleh diubah adalah user dari JWT.
     */
    const userId = Number(authUser.id);

    if (!Number.isFinite(userId)) {
      return json(
        {
          success: false,
          error: 'User ID tidak valid.',
        },
        400
      );
    }

    /*
     * Saat ini App.tsx membutuhkan sinkronisasi walletBalance/saldo.
     * Jangan izinkan frontend mengubah role, blacklist, email,
     * password, atau field sensitif lainnya melalui endpoint ini.
     */
    const updates: string[] = [];
    const values: unknown[] = [];

    if (
      typeof body.walletBalance === 'number' &&
      Number.isFinite(body.walletBalance)
    ) {
      updates.push(`balance = $${values.length + 1}`);
      values.push(body.walletBalance);
    } else if (
      typeof body.saldo === 'number' &&
      Number.isFinite(body.saldo)
    ) {
      updates.push(`balance = $${values.length + 1}`);
      values.push(body.saldo);
    }

    if (typeof body.username === 'string' && body.username.trim()) {
      updates.push(`username = $${values.length + 1}`);
      values.push(body.username.trim());
    }

    if (updates.length === 0) {
      return json({
        success: true,
        user: authUser,
      });
    }

    values.push(userId);

    return await withDb(context.env, async (client) => {
      const result = await client.query(
        `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = $${values.length}
        RETURNING
          id,
          cuid,
          username,
          email,
          role,
          balance,
          is_blacklisted AS "isBlacklisted"
        `,
        values
      );

      if (result.rows.length === 0) {
        return json(
          {
            success: false,
            error: 'User tidak ditemukan.',
          },
          404
        );
      }

      return json({
        success: true,
        user: result.rows[0],
      });
    });
  } catch (error) {
    console.error('Profile update error:', error);

    return json(
      {
        success: false,
        error: 'Gagal memperbarui profil.',
      },
      500
    );
  }
};