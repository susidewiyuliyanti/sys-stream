import { Env, json, withDb } from "../../../_lib/db";
import { requireAuth } from "../../../_lib/auth";
import { syncMiningForUser } from "../../mining";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env);

    if (auth.ok === false) return auth.response;

    const userId = String(auth.user.id);
    await syncMiningForUser(context.env, userId);
    const depositId = Number(context.params.id);

    if (!Number.isInteger(depositId) || depositId <= 0) {
      return json({ success: false, error: "ID deposit tidak valid." }, 400);
    }

    const result = await withDb(context.env, async (client) => {
      await client.query("BEGIN");

      try {
        const depositResult = await client.query(
          `
          SELECT
            id,
            user_id,
            amount,
            duration_days,
            start_date AS "startDate",
            end_date AS "endDate",
            status
          FROM deposits
          WHERE id = $1
            AND user_id = $2
          FOR UPDATE
          `,
          [depositId, userId]
        );

        if (depositResult.rows.length === 0) throw new Error("DEPOSIT_NOT_FOUND");

        const deposit = depositResult.rows[0];

        if (deposit.status === "COMPLETED") {
          await client.query("COMMIT");
          return {
            alreadySettled: true,
            amountReturned: Number(deposit.amount),
            status: "COMPLETED",
          };
        }

        if (deposit.status !== "ACTIVE") throw new Error("DEPOSIT_NOT_SETTLEABLE");

        const endDate = new Date(deposit.endDate);
        const now = new Date();

        if (Number.isNaN(endDate.getTime())) throw new Error("INVALID_END_DATE");
        if (now < endDate) throw new Error("DEPOSIT_NOT_EXPIRED");

        const principal = Number(deposit.amount);
        if (!Number.isFinite(principal) || principal <= 0) throw new Error("INVALID_AMOUNT");

        const userResult = await client.query(
          `
          SELECT
            id,
            COALESCE(available_balance, 0) AS available_balance,
            COALESCE(balance, 0) AS legacy_balance,
            COALESCE(total_locked, 0) AS total_locked,
            COALESCE(locked_saldo, 0) AS legacy_locked_saldo
          FROM users
          WHERE id = $1
          FOR UPDATE
          `,
          [userId]
        );

        if (userResult.rows.length === 0) throw new Error("USER_NOT_FOUND");

        const user = userResult.rows[0];
        const currentBalance = Number(user.available_balance || 0) > 0
          ? Number(user.available_balance || 0)
          : Number(user.legacy_balance || 0);
        const currentLocked = Number(user.total_locked || 0) > 0
          ? Number(user.total_locked || 0)
          : Number(user.legacy_locked_saldo || 0);

        if (currentLocked < principal) throw new Error("LOCKED_BALANCE_INCONSISTENT");

        const rewards = Math.max(0, Number(deposit.totalClaimed || 0));
        const newBalance = currentBalance + principal + rewards;
        const newLockedBalance = currentLocked - principal;

        await client.query(
          `
          UPDATE users
          SET
            available_balance = $1,
            total_locked = $2,
            balance = $1,
            locked_saldo = $2
          WHERE id = $3
          `,
          [newBalance, newLockedBalance, userId]
        );

        await client.query(
          `UPDATE users
           SET mining_enabled = 0,
               mining_locked_amount = 0
           WHERE id = $1`,
          [userId]
        );

        await client.query(
          `
          UPDATE deposits
          SET status = 'COMPLETED'
          WHERE id = $1
            AND user_id = $2
            AND status = 'ACTIVE'
          `,
          [depositId, userId]
        );

        await client.query("COMMIT");

        return {
          alreadySettled: false,
          amountReturned: principal,
          rewardsReturned: rewards,
          status: "COMPLETED",
          balance: newBalance,
          lockedBalance: newLockedBalance,
          settledAt: now.toISOString(),
        };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    });

    return json({
      success: true,
      message: result.alreadySettled
        ? "Lock sudah pernah diselesaikan."
        : "Lock selesai. Principal dan seluruh reward Blind Box dari history berhasil masuk ke saldo.",
      depositId,
      ...result,
    });
  } catch (error) {
    console.error("Settle deposit error:", error);

    const message = error instanceof Error ? error.message : "";
    const errors: Record<string, [string, number]> = {
      DEPOSIT_NOT_FOUND: ["Deposit tidak ditemukan.", 404],
      DEPOSIT_NOT_SETTLEABLE: ["Deposit tidak dapat diselesaikan dari status saat ini.", 400],
      DEPOSIT_NOT_EXPIRED: ["Masa lock belum berakhir.", 400],
      INVALID_END_DATE: ["Tanggal akhir lock tidak valid.", 500],
      INVALID_AMOUNT: ["Nominal principal tidak valid.", 500],
      USER_NOT_FOUND: ["User tidak ditemukan.", 404],
      LOCKED_BALANCE_INCONSISTENT: ["Saldo locked tidak konsisten dengan principal deposit.", 409],
    };

    if (errors[message]) {
      const [errorText, status] = errors[message];
      return json({ success: false, error: errorText }, status);
    }

    return json({ success: false, error: "Gagal menyelesaikan lock." }, 500);
  }
};
