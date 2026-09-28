import {
  withDb,
  json,
  readJson,
} from '../_lib/db';

import type { Env } from '../_lib/auth';

interface ForgotPasswordBody {
  email?: string;
}

export const onRequestPost: PagesFunction<Env> =
  async (context) => {
    try {
      const body =
        await readJson<ForgotPasswordBody>(
          context.request
        );

      const email =
        String(body.email ?? '')
          .trim()
          .toLowerCase();

      if (!email) {
        return json(
          {
            error:
              'Email wajib diisi.',
          },
          400
        );
      }

      const user =
        await withDb(
          context.env,
          async (client) => {
            const result =
              await client.query(
                `
                SELECT id, email
                FROM users
                WHERE LOWER(email) = $1
                LIMIT 1
                `,
                [email]
              );

            return result.rows[0] ?? null;
          }
        );

      /*
       * Jangan mengungkapkan apakah email
       * terdaftar atau tidak.
       *
       * Email reset sebenarnya akan
       * diaktifkan pada tahap berikutnya
       * setelah SMTP/email provider
       * dikonfigurasi.
       */

      if (!user) {
        return json({
          success: true,
          message:
            'Jika email tersebut terdaftar, instruksi pemulihan akan dikirim.'
        });
      }

      return json({
        success: true,
        message:
          'Jika email tersebut terdaftar, instruksi pemulihan akan dikirim.'
      });
    } catch (error) {
      console.error(
        'Forgot password error:',
        error
      );

      return json(
        {
          error:
            'Gagal memproses permintaan reset password.',
        },
        500
      );
    }
  };
