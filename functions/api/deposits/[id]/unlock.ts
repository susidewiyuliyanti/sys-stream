import { Env, json } from "../../../_lib/db";
import { requireAuth } from "../../../_lib/auth";
import { syncMiningForUser } from "../../mining";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env);
    if (!auth.ok) return auth.response;

    const userId = String(auth.user.id);
    const depositId = String(context.params.id || "").trim();

    if (!depositId) {
      return json({ success: false, error: "ID lock tidak valid." }, 400);
    }

    // Credit SYS earned up to the exact unlock moment before mining is stopped.
    await syncMiningForUser(context.env, userId);

    const deposit = await context.env.DB.prepare(
      `SELECT
         id,
         user_id AS userId,
         amount,
         end_date AS endDate,
         status
       FROM deposits
       WHERE id = ? AND user_id = ?
       LIMIT 1`
    ).bind(depositId, userId).first<any>();

    if (!deposit) {
      return json({ success: false, error: "Lock tidak ditemukan untuk akun ini." }, 404);
    }

    if (String(deposit.status).toUpperCase() !== "ACTIVE") {
      return json({ success: false, error: "Lock sudah tidak aktif." }, 400);
    }

    const principal = Number(deposit.amount);
    if (!Number.isFinite(principal) || principal <= 0) {
      return json({ success: false, error: "Nominal principal lock tidak valid." }, 409);
    }

    const user = await context.env.DB.prepare(
      `SELECT
         COALESCE(available_balance,0) AS availableBalance,
         COALESCE(total_locked,0) AS lockedBalance
       FROM users
       WHERE id = ?
       LIMIT 1`
    ).bind(userId).first<any>();

    if (!user) {
      return json({ success: false, error: "User tidak ditemukan." }, 404);
    }

    const currentAvailable = Number(user.availableBalance || 0);
    const currentLocked = Number(user.lockedBalance || 0);

    if (currentLocked + 0.000001 < principal) {
      return json({
        success: false,
        error: "Saldo locked tidak konsisten dengan principal lock.",
      }, 409);
    }

    const endDateMs = Date.parse(String(deposit.endDate || ""));
    const early = !Number.isFinite(endDateMs) || Date.now() < endDateMs;

    // Only the principal is released here.
    // Blind Box rewards are already recorded in blind_box_claims and remain
    // pending until the original lock end date; they are never paid here.
    const newAvailable = currentAvailable + principal;
    const newLocked = Math.max(0, currentLocked - principal);

    const updateUser = await context.env.DB.prepare(
      `UPDATE users
       SET available_balance = ?,
           total_locked = ?,
           balance = ?,
           locked_saldo = ?,
           mining_enabled = 0,
           mining_locked_amount = 0
       WHERE id = ?`
    ).bind(newAvailable, newLocked, newAvailable, newLocked, userId).run();

    if (Number((updateUser as any).meta?.changes || 0) !== 1) {
      return json({ success: false, error: "Gagal memperbarui saldo user saat membuka lock." }, 500);
    }

    const updateDeposit = await context.env.DB.prepare(
      `UPDATE deposits
       SET status = 'COMPLETED'
       WHERE id = ? AND user_id = ? AND status = 'ACTIVE'`
    ).bind(depositId, userId).run();

    if (Number((updateDeposit as any).meta?.changes || 0) !== 1) {
      // Reconcile the user balance if the deposit could not be completed.
      await context.env.DB.prepare(
        `UPDATE users
         SET available_balance = ?,
             total_locked = ?,
             balance = ?,
             locked_saldo = ?,
             mining_enabled = 0,
             mining_locked_amount = 0
         WHERE id = ?`
      ).bind(currentAvailable, currentLocked, currentAvailable, currentLocked, userId).run();

      return json({ success: false, error: "Lock berubah status sebelum proses selesai. Silakan refresh dan coba lagi." }, 409);
    }

    return json({
      success: true,
      message: early
        ? "Lock dibuka lebih awal. Principal dikembalikan, reward Blind Box tetap pending sampai tanggal akhir lock, dan SYS Mining dihentikan."
        : "Lock selesai. Principal dikembalikan dan SYS Mining dihentikan.",
      depositId,
      principalReturned: principal,
      rewardForfeited: 0,
      miningStopped: true,
      early,
      status: "COMPLETED",
      balance: newAvailable,
      lockedBalance: newLocked,
    });
  } catch (error) {
    console.error("Unlock deposit error:", error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : "Gagal membuka lock.",
    }, 500);
  }
};
