import { Env, json } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  try {
    const user = auth.user;
    const bonusIdr = Number(user.registrationBonusIdr || 0);
    const granted = Number(user.registrationBonusGranted || 0);

    if (granted !== 1 || bonusIdr <= 0) {
      return json({ success: false, error: "Bonus registrasi sudah diklaim atau tidak tersedia." }, 409);
    }

    // Server-side one-user-one-claim ledger. The UNIQUE user_id constraint,
    // together with the atomic D1 batch below, prevents double claims even
    // when two requests arrive at nearly the same time.
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS registration_bonus_claims (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      bonus_idr REAL NOT NULL,
      bonus_usdt REAL NOT NULL,
      claimed_at INTEGER NOT NULL
    )`).run();

    const bonusUsdt = 0.8363;
    const now = Math.floor(Date.now() / 1000);
    const claimId = crypto.randomUUID();

    try {
      const results = await env.DB.batch([
        env.DB.prepare(
          "INSERT INTO registration_bonus_claims(id,user_id,bonus_idr,bonus_usdt,claimed_at) VALUES(?,?,?,?,?)"
        ).bind(claimId, String(user.id), bonusIdr, bonusUsdt, now),
        env.DB.prepare(
          `UPDATE users
           SET available_balance = COALESCE(available_balance,0) + ?,
               balance = COALESCE(available_balance,0) + ?,
               registration_bonus_granted = 0
           WHERE id = ? AND registration_bonus_granted = 1`
        ).bind(bonusUsdt, bonusUsdt, String(user.id)),
      ]);

      const updateResult = results[1];
      if (!updateResult?.meta?.changes) {
        return json({ success: false, error: "Bonus registrasi sudah diklaim." }, 409);
      }
    } catch (error) {
      // UNIQUE(user_id) means a second request for the same account cannot
      // create another claim. D1 batch rolls back both statements on failure.
      if (/UNIQUE constraint failed.*registration_bonus_claims\.user_id/i.test(String(error))) {
        return json({ success: false, error: "Bonus registrasi sudah diklaim." }, 409);
      }
      throw error;
    }

    const updated = await env.DB.prepare(
      `SELECT id, username, email, display_name, role, referral_code, wallet_address,
              avatar_url, email_verified, available_balance, total_locked, referral_count,
              registration_bonus_idr, registration_bonus_granted
       FROM users WHERE id = ? LIMIT 1`
    ).bind(String(user.id)).first<any>();

    return json({
      success: true,
      claimed: true,
      registrationBonusIdr: bonusIdr,
      registrationBonusUsdt: bonusUsdt,
      user: updated,
    });
  } catch (error) {
    console.error("claim registration bonus error", error);
    return json({ success: false, error: "Gagal mengklaim bonus registrasi." }, 500);
  }
}
