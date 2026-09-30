import {
  withDb,
  json,
} from '../_lib/db';

import {
  requireAuth,
  type Env,
} from '../_lib/auth';

export const onRequestGet: PagesFunction<Env> =
  async (context) => {
    try {
      const authUser =
        requireAuth(
          context.request,
          context.env
        );

      const user =
        await withDb(
          context.env,
          async (client) => {
            const result =
              await client.query(
                `
                SELECT
                  id,
                  cuid,
                  username,
                  email,
                  balance,
                  role,
                  is_blacklisted AS "isBlacklisted"
                FROM users
                WHERE id = $1
                LIMIT 1
                `,
                [authUser.user.id]
              );

            return result.rows[0] ?? null;
          }
        );

      if (!user) {
        return json(
          {
            error:
              'User tidak ditemukan.',
          },
          404
        );
      }

      return json({
        success: true,
        user: {
          id: Number(user.id),
          cuid: String(user.cuid),
          username: String(user.username),
          email: String(user.email),
          balance: Number(
            user.balance ?? 0
          ),
          role: user.role,
          isBlacklisted:
            Boolean(
              user.isBlacklisted
            ),
        },
      });
    } catch (error) {
      if (error instanceof Response) {
        return error;
      }

      console.error(
        'Auth me error:',
        error
      );

      return json(
        {
          error:
            'Gagal mengambil data akun.',
        },
        500
      );
    }
  };

