import {
  withDb,
  json,
  readJson,
} from '../_lib/db';

interface Env {
  HYPERDRIVE: Hyperdrive;
  JWT_SECRET: string;
}

interface Body {
  email?: string;
}

export const onRequestPost:
  PagesFunction<Env> = async ({
    request,
    env,
  }) => {
    try {
      const body =
        await readJson<Body>(
          request
        );

      const email =
        String(
          body.email || ''
        )
          .trim()
          .toLowerCase();

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

      const result =
        await withDb(
          env,
          async (client) => {
            return client.query(
              `
              SELECT id, email
              FROM users
              WHERE LOWER(email) = $1
              LIMIT 1
              `,
              [email]
            );
          }
        );

      /*
       * Jangan membocorkan apakah email
       * terdaftar atau tidak.
       */
      if (!result.rows.length) {
        return json({
          success: true,
          message:
            'Jika email terdaftar, instruksi pemulihan akan diproses.',
        });
      }

      /*
       * Email delivery belum dipasang.
       *
       * Endpoint sengaja dibuat terlebih dahulu
       * agar frontend tidak lagi bergantung
       * pada Firebase.
       */
      return json({
        success: true,
        message:
          'Permintaan pemulihan diterima.',
        emailDelivery:
          'pending_configuration',
      });
    } catch (error) {
      console.error(
        'Forgot password error:',
        error
      );

      return json(
        {
          success: false,
          message:
            'Gagal memproses permintaan.',
        },
        500
      );
    }
  };
