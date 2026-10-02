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
      return json({ success:false, error:"Bonus registrasi sudah diklaim atau tidak tersedia." }, 409);
    }

    // available_balance is stored in USDT. The registration bonus is recorded
    // separately in IDR and converted using the fixed registration reference
    // used by the registration program.
    const bonusUsdt = 0.8363;
    const result = await env.DB.prepare(
      `UPDATE users
       SET available_balance = COALESCE(available_balance,0) + ?,
           balance = COALESCE(available_balance,0) + ?,
           registration_bonus_granted = 0
       WHERE id = ? AND registration_bonus_granted = 1`
    ).bind(bonusUsdt, bonusUsdt, user.id).run();

    if (!result.meta.changes) {
      return json({ success:false, error:"Bonus registrasi sudah diklaim." }, 409);
    }

    const updated = await env.DB.prepare(
      `SELECT id, username, email, display_name, role, referral_code, avatar_url,
              email_verified, available_balance, total_locked, referral_count,
              registration_bonus_idr, registration_bonus_granted
       FROM users WHERE id = ? LIMIT 1`
    ).bind(user.id).first<any>();

    return json({
      success:true,
      claimed:true,
      registrationBonusIdr:bonusIdr,
      registrationBonusUsdt:bonusUsdt,
      user:updated
    });
  } catch (error) {
    console.error("claim registration bonus error", error);
    return json({ success:false, error:"Gagal mengklaim bonus registrasi." }, { status:500 });
  }
}
