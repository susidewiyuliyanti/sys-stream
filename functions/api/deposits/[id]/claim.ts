import { Env, json, withDb } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env);

    if (!auth.ok) {
      return auth.response;
    }

    const userId = Number(auth.user.id);
    const depositId = Number(context.params.id);

    if (!Number.isInteger(depositId) || depositId <= 0) {
      return json(
        {
          success: false,
          message: "ID deposit tidak valid.",
        },
        400
      );
    }

    const result = await withDb(context.env, async (client) => {
      await client.query("BEGIN");

      try {
        const depositResult = await client.query(
          `
          SELECT
            id,
            "userId",
            amount,
            "durationDays",
            "startDate",
            "endDate",
            status,
            "totalClaimed",
            "forceJackpot"
          FROM deposits
          WHERE id = $1
            AND "userId" = $2
          FOR UPDATE
          `,
          [depositId, userId]
        );

        if (depositResult.rows.length === 0) {
          throw new Error("DEPOSIT_NOT_FOUND");
        }

        const deposit = depositResult.rows[0];

        if (deposit.status !== "ACTIVE") {
          throw new Error("DEPOSIT_NOT_ACTIVE");
        }

        const now = new Date();

        const startDate = new Date(deposit.startDate);
        const endDate = new Date(deposit.endDate);

        if (now < startDate) {
          throw new Error("DEPOSIT_NOT_STARTED");
        }

        if (now > endDate) {
          throw new Error("DEPOSIT_EXPIRED");
        }

        /*
         * Satu user hanya boleh claim satu kali
         * untuk tanggal kalender yang sama.
         */
        const claimDate = now.toISOString().slice(0, 10);

        const existingClaim = await client.query(
          `
          SELECT id
          FROM blind_box_claims
          WHERE "depositId" = $1
            AND "claimDate" = $2
          LIMIT 1
          `,
          [depositId, claimDate]
        );

        if (existingClaim.rows.length > 0) {
          throw new Error("ALREADY_CLAIMED");
        }

        /*
         * Untuk sementara nominal reward menggunakan
         * nilai yang berasal dari game settings.
         *
         * Jangan mengandalkan nominal dari frontend.
         */
        const settingsResult = await client.query(
          `
          SELECT
            "minBox",
            "maxBox",
            "jackpotAmount",
            "jackpotChance"
          FROM game_settings
          ORDER BY id DESC
          LIMIT 1
          `
        );

        let minBox = 100;
        let maxBox = 1000;
        let jackpotAmount = 50000000;
        let jackpotChance = 0;

        if (settingsResult.rows.length > 0) {
          const settings = settingsResult.rows[0];

          minBox = Number(settings.minBox ?? minBox);
          maxBox = Number(settings.maxBox ?? maxBox);
          jackpotAmount = Number(
            settings.jackpotAmount ?? jackpotAmount
          );
          jackpotChance = Number(
            settings.jackpotChance ?? jackpotChance
          );
        }

        let isJackpot = false;
        let reward = 0;

        /*
         * Jackpot calculation.
         *
         * Catatan:
         * aturan bisnis jackpot dari Firebase lama
         * perlu dicocokkan sebelum production.
         */
        const random = Math.random() * 100;

        if (random < jackpotChance) {
          isJackpot = true;
          reward = jackpotAmount;
        } else {
          reward =
            Math.floor(
              Math.random() * (maxBox - minBox + 1)
            ) + minBox;
        }

        await client.query(
          `
          INSERT INTO blind_box_claims (
            "depositId",
            "userId",
            "claimDate",
            amount,
            "isJackpot",
            "claimedAt"
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            NOW()
          )
          `,
          [
            depositId,
            userId,
            claimDate,
            reward,
            isJackpot,
          ]
        );

        await client.query(
          `
          UPDATE deposits
          SET
            "totalClaimed" = "totalClaimed" + $1
          WHERE id = $2
          `,
          [reward, depositId]
        );

        await client.query(
          `
          UPDATE users
          SET
            saldo = saldo + $1,
            "walletBalance" = "walletBalance" + $1,
            "updatedAt" = NOW()
          WHERE id = $2
          `,
          [reward, userId]
        );

        await client.query("COMMIT");

        return {
          reward,
          isJackpot,
          claimDate,
        };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    });

    return json({
      success: true,
      message: result.isJackpot
        ? "Selamat! Jackpot berhasil didapat."
        : "Claim berhasil.",
      ...result,
    });
  } catch (error) {
    console.error("Claim deposit error:", error);

    const message =
      error instanceof Error ? error.message : "";

    const errors: Record<string, [string, number]> = {
      DEPOSIT_NOT_FOUND: [
        "Deposit tidak ditemukan.",
        404,
      ],
      DEPOSIT_NOT_ACTIVE: [
        "Deposit tidak aktif.",
        400,
      ],
      DEPOSIT_NOT_STARTED: [
        "Deposit belum dimulai.",
        400,
      ],
      DEPOSIT_EXPIRED: [
        "Deposit sudah berakhir.",
        400,
      ],
      ALREADY_CLAIMED: [
        "Deposit sudah di-claim hari ini.",
        400,
      ],
    };

    if (errors[message]) {
      const [text, status] = errors[message];

      return json(
        {
          success: false,
          message: text,
        },
        status
      );
    }

    return json(
      {
        success: false,
        message: "Gagal melakukan claim.",
      },
      500
    );
  }
};
