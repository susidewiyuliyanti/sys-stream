import { Env, json, withDb } from "../../../_lib/db";
import { requireAuth } from "../../../_lib/auth";
import { syncMiningForUser } from "../../mining";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env);
    if (!auth.ok) return auth.response;

    const userId = String(auth.user.id);
    const depositId = Number(context.params.id);
    if (!Number.isInteger(depositId) || depositId <= 0) {
      return json({ success: false, error: "ID lock tidak valid." }, 400);
    }

    // Credit SYS earned up to the exact early-unlock moment before stopping mining.
    await syncMiningForUser(context.env, userId);

    const result = await withDb(context.env, async (client) => {
      await client.query("BEGIN");
      try {
        const depositResult = await client.query(
          `SELECT id, user_id, amount, end_date AS "endDate", status
           FROM deposits
           WHERE id = $1 AND user_id = $2
           FOR UPDATE`,
          [depositId, userId]
        );
        if (depositResult.rows.length === 0) throw new Error("DEPOSIT_NOT_FOUND");

        const deposit = depositResult.rows[0];
        if (deposit.status !== "ACTIVE") throw new Error("DEPOSIT_NOT_ACTIVE");

        const principal = Number(deposit.amount);
        const endDate = new Date(deposit.endDate);
        const early = Date.now() < endDate.getTime();

        const userResult = await client.query(
          `SELECT
             COALESCE(available_balance,0) AS "availableBalance",
             COALESCE(total_locked,0) AS "lockedBalance"
           FROM users
           WHERE id = $1
           FOR UPDATE`,
          [userId]
        );
        if (userResult.rows.length === 0) throw new Error("USER_NOT_FOUND");

        const user = userResult.rows[0];
        const currentAvailable = Number(user.availableBalance || 0);
        const currentLocked = Number(user.lockedBalance || 0);
        if (currentLocked < principal) throw new Error("LOCKED_BALANCE_INCONSISTENT");

        // Blind Box rewards are history-only while the lock is active.
        // On early unlock they are forfeited without touching the user's available balance.
        // The principal is returned; SYS mined before this moment remains credited.
        const rewardForfeit = early ? 0 : 0;
        const newAvailable = currentAvailable + principal;
        const newLocked = currentLocked - principal;

        await client.query(
          `UPDATE users
           SET available_balance = $1,
               total_locked = $2,
               balance = $1,
               locked_saldo = $2,
               mining_enabled = 0,
               mining_locked_amount = 0
           WHERE id = $3`,
          [newAvailable, newLocked, userId]
        );

        await client.query(
          `UPDATE deposits
           SET status = 'COMPLETED'
           WHERE id = $1 AND user_id = $2 AND status = 'ACTIVE'`,
          [depositId, userId]
        );

        await client.query("COMMIT");

        return {
          principalReturned: principal,
          rewardForfeited: early ? 0 : 0,
          miningStopped: true,
          early,
          status: "COMPLETED",
          balance: newAvailable,
          lockedBalance: newLocked,
        };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    });

    return json({
      success: true,
      message: result.early
        ? "Lock dibuka lebih awal. Saldo principal dikembalikan, reward Blind Box di history hangus, dan SYS Mining dihentikan."
        : "Lock selesai. Principal dikembalikan dan SYS Mining dihentikan.",
      depositId,
      ...result,
    });
  } catch (error) {
    console.error("Early unlock error:", error);
    const message = error instanceof Error ? error.message : "";
    const errors: Record<string, [string, number]> = {
      DEPOSIT_NOT_FOUND: ["Lock tidak ditemukan.", 404],
      DEPOSIT_NOT_ACTIVE: ["Lock sudah tidak aktif.", 400],
      USER_NOT_FOUND: ["User tidak ditemukan.", 404],
      LOCKED_BALANCE_INCONSISTENT: ["Saldo locked tidak konsisten dengan principal lock.", 409],
    };
    if (errors[message]) {
      const [errorText, status] = errors[message];
      return json({ success: false, error: errorText }, status);
    }
    return json({ success: false, error: "Gagal membuka lock." }, 500);
  }
};
