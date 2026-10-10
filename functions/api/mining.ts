import { Env, json } from "../_lib/db";
import { requireAuth } from "../_lib/auth";

const USD_TO_IDR = 17937;
const MIN_MINING_LOCK_IDR = 10 * USD_TO_IDR;
const SECONDS_PER_DAY = 86400;
const CLAIM_MIN_SYS = 50;

function toEpochSeconds(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 2_000_000_000 ? Math.floor(value / 1000) : Math.floor(value);
  }
  const ms = Date.parse(String(value || ""));
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : 0;
}

export async function syncMiningForUser(env: Env, userId: string) {
  const id = String(userId);
  const now = Math.floor(Date.now() / 1000);

  const active = await env.DB.prepare(
    `SELECT id, amount, start_date AS startDate, end_date AS endDate
     FROM deposits
     WHERE user_id = ? AND status = 'ACTIVE'
     ORDER BY start_date DESC
     LIMIT 1`
  ).bind(id).first<any>();

  const amountIdr = Number(active?.amount || 0);
  const startAt = toEpochSeconds(active?.startDate);
  const endAt = toEpochSeconds(active?.endDate);

  let user = await env.DB.prepare(
    `SELECT
       COALESCE(sys_balance,0) AS sysBalance,
       COALESCE(mining_enabled,0) AS miningEnabled,
       COALESCE(mining_started_at,0) AS miningStartedAt,
       COALESCE(mining_last_credited_at,0) AS miningLastCreditedAt,
       COALESCE(mining_locked_amount,0) AS miningLockedAmount,
       COALESCE(mining_accrued_sys,0) AS miningAccruedSys,
       COALESCE(total_locked,0) AS totalLocked
     FROM users WHERE id = ? LIMIT 1`
  ).bind(id).first<any>();

  if (!user) throw new Error("USER_NOT_FOUND");

  const canonicalLockedIdr = Number(user.totalLocked || 0);
  const fallbackQualifying = canonicalLockedIdr >= MIN_MINING_LOCK_IDR;
  const qualifying = Boolean(
    (active && amountIdr >= MIN_MINING_LOCK_IDR && startAt > 0) ||
    (!active && fallbackQualifying)
  );
  const effectiveAmountIdr = active ? amountIdr : canonicalLockedIdr;
  const effectiveStartAt = active
    ? startAt
    : (Number(user.miningStartedAt || 0) > 0 ? Number(user.miningStartedAt) : now);
  const effectiveEndAt = active ? endAt : 0;

  if (active && Math.abs(Number(user.totalLocked || 0) - amountIdr) > 0.000001) {
    await env.DB.prepare(
      `UPDATE users
       SET total_locked = ?, locked_saldo = ?, mining_locked_amount = CASE WHEN ? >= ? THEN ? ELSE 0 END
       WHERE id = ?`
    ).bind(amountIdr, amountIdr, amountIdr, MIN_MINING_LOCK_IDR, amountIdr, id).run();
    user.totalLocked = amountIdr;
  }

  if (!qualifying) {
    if (Number(user.miningEnabled) !== 0 || Number(user.miningLockedAmount) !== 0) {
      await env.DB.prepare(
        `UPDATE users
         SET mining_enabled = 0, mining_locked_amount = 0
         WHERE id = ?`
      ).bind(id).run();
    }
    return {
      enabled: false,
      lockedAmountIdr: 0,
      lockedAmountUsd: 0,
      lockedBalanceIdr: Number(user.totalLocked || 0),
      rateSysPerDay: 0,
      rateSysPerSecond: 0,
      miningStartedAt: 0,
      lastCreditedAt: Number(user.miningLastCreditedAt || 0),
      accruedSys: Number(user.miningAccruedSys || 0),
      pendingSys: 0,
      claimableSys: Number(user.miningAccruedSys || 0),
      claimThresholdSys: CLAIM_MIN_SYS,
      claimEtaSeconds: null,
      endAt: 0,
    };
  }

  const amountUsd = effectiveAmountIdr / USD_TO_IDR;
  const rateSysPerDay = amountUsd / 10;
  const rateSysPerSecond = rateSysPerDay / SECONDS_PER_DAY;

  let lastCreditedAt = Number(user.miningLastCreditedAt || 0);
  const sameMining =
    Number(user.miningStartedAt || 0) === effectiveStartAt &&
    Math.abs(Number(user.miningLockedAmount || 0) - effectiveAmountIdr) < 0.000001;

  if (!sameMining || lastCreditedAt < effectiveStartAt) {
    lastCreditedAt = effectiveStartAt;
    await env.DB.prepare(
      `UPDATE users
       SET mining_enabled = 1,
           mining_started_at = ?,
           mining_last_credited_at = ?,
           mining_locked_amount = ?
       WHERE id = ?`
    ).bind(effectiveStartAt, effectiveStartAt, effectiveAmountIdr, id).run();

    user = {
      ...user,
      miningEnabled: 1,
      miningStartedAt: effectiveStartAt,
      miningLastCreditedAt: effectiveStartAt,
      miningLockedAmount: effectiveAmountIdr,
    };
  }

  const creditUntil = Math.min(now, effectiveEndAt || now);
  const elapsed = Math.max(0, creditUntil - lastCreditedAt);
  const deltaSys = elapsed * rateSysPerSecond;

  // Mining accrues into mining_accrued_sys. It is deliberately NOT added
  // to spendable SYS until the user presses Claim and reaches 50 SYS.
  if (deltaSys > 0.0000000001) {
    const update = await env.DB.prepare(
      `UPDATE users
       SET mining_accrued_sys = COALESCE(mining_accrued_sys,0) + ?,
           mining_last_credited_at = ?,
           mining_enabled = ?
       WHERE id = ? AND mining_last_credited_at = ?`
    ).bind(
      deltaSys,
      creditUntil,
      (!effectiveEndAt || creditUntil < effectiveEndAt) ? 1 : 0,
      id,
      lastCreditedAt
    ).run();

    if (Number((update as any).meta?.changes || 0) > 0) {
      user.miningAccruedSys = Number(user.miningAccruedSys || 0) + deltaSys;
      user.miningLastCreditedAt = creditUntil;
      user.miningEnabled = (!effectiveEndAt || creditUntil < effectiveEndAt) ? 1 : 0;
      lastCreditedAt = creditUntil;
    } else {
      const refreshed = await env.DB.prepare(
        `SELECT
           COALESCE(sys_balance,0) AS sysBalance,
           COALESCE(mining_enabled,0) AS miningEnabled,
           COALESCE(mining_started_at,0) AS miningStartedAt,
           COALESCE(mining_last_credited_at,0) AS miningLastCreditedAt,
           COALESCE(mining_locked_amount,0) AS miningLockedAmount,
           COALESCE(mining_accrued_sys,0) AS miningAccruedSys
         FROM users WHERE id = ? LIMIT 1`
      ).bind(id).first<any>();
      if (refreshed) user = refreshed;
      lastCreditedAt = Number(user.miningLastCreditedAt || lastCreditedAt);
    }
  }

  const accruedSys = Number(user.miningAccruedSys || 0);
  const pendingElapsed = Math.max(0, Math.min(now, effectiveEndAt || now) - lastCreditedAt);
  const pendingSys = pendingElapsed * rateSysPerSecond;
  const claimableSys = accruedSys + pendingSys;
  const claimEtaSeconds = rateSysPerSecond > 0 && claimableSys < CLAIM_MIN_SYS
    ? Math.ceil((CLAIM_MIN_SYS - claimableSys) / rateSysPerSecond)
    : 0;

  return {
    enabled: Boolean(Number(user.miningEnabled || 0)) || pendingSys > 0,
    lockedAmountIdr: effectiveAmountIdr,
    lockedAmountUsd: amountUsd,
    lockedBalanceIdr: Number(user.totalLocked || effectiveAmountIdr || 0),
    rateSysPerDay,
    rateSysPerSecond,
    miningStartedAt: effectiveStartAt,
    lastCreditedAt,
    accruedSys,
    pendingSys,
    claimableSys,
    claimThresholdSys: CLAIM_MIN_SYS,
    claimEtaSeconds,
    endAt: effectiveEndAt || 0,
    sysBalance: Number(user.sysBalance || 0),
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAuth(context.request, context.env);
  if (!auth.ok) return auth.response;

  try {
    const mining = await syncMiningForUser(context.env, String(auth.user.id));
    return json({ success: true, mining });
  } catch (error) {
    console.error("Mining sync error:", error);
    return json({ success: false, error: "Gagal mengambil status mining SYS." }, 500);
  }
};
