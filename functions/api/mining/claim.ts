import { requireAuth } from "../../_lib/auth";
import { Env, json, withDb } from "../../_lib/db";
import { syncMiningForUser } from "../mining";

const IDR_PER_USD = 17937;
const MINING_USD = 10;
const MINING_MIN_IDR = MINING_USD * IDR_PER_USD;
const CLAIM_MIN_SYS = 50;

function toEpochSeconds(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 2_000_000_000 ? Math.floor(value / 1000) : Math.floor(value);
  }
  const ms = Date.parse(String(value || ""));
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : 0;
}

async function ensureMining(env: Env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS mining_claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      deposit_id INTEGER NOT NULL,
      claim_date TEXT NOT NULL,
      amount_locked REAL NOT NULL,
      reward_sys REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

async function getStatus(env: Env, userId: string) {
  return withDb(env, async (client) => {
    const active = await client.query(`
      SELECT
        id,
        amount,
        duration_days AS "durationDays",
        start_date AS "startDate",
        end_date AS "endDate",
        status
      FROM deposits
      WHERE user_id = $1
        AND status = 'ACTIVE'
      ORDER BY amount DESC, id DESC
      LIMIT 1
    `, [userId]);

    const deposit = active.rows[0] ?? null;
    const userResult = await client.query(
      `SELECT
        COALESCE(total_locked,0) AS "totalLocked",
        COALESCE(mining_started_at,0) AS "miningStartedAt",
        COALESCE(mining_last_credited_at,0) AS "miningLastCreditedAt",
        COALESCE(mining_accrued_sys,0) AS "miningAccruedSys",
        COALESCE(sys_balance,0) AS "sysBalance"
       FROM users WHERE id = $1 LIMIT 1`,
      [userId]
    );

    const canonicalLockedIdr = Number(userResult.rows[0]?.totalLocked || 0);
    const lockAmountIdr = Number(deposit?.amount ?? canonicalLockedIdr);
    const miningActive = Number.isFinite(lockAmountIdr) && lockAmountIdr >= MINING_MIN_IDR;
    const rateSysPerDay = miningActive ? (lockAmountIdr / IDR_PER_USD) / 10 : 0;
    const rateSysPerSecond = rateSysPerDay / 86400;
    const miningStartedAt = Number(userResult.rows[0]?.miningStartedAt || 0) ||
      toEpochSeconds(deposit?.startDate);
    const accruedSys = Number(userResult.rows[0]?.miningAccruedSys || 0);
    const lastCreditedAt = Number(userResult.rows[0]?.miningLastCreditedAt || 0);
    const now = Math.floor(Date.now() / 1000);
    const endAt = toEpochSeconds(deposit?.endDate);
    const pendingElapsed = miningActive
      ? Math.max(0, Math.min(now, endAt || now) - lastCreditedAt)
      : 0;
    const claimableSys = accruedSys + pendingElapsed * rateSysPerSecond;
    const claimEtaSeconds = rateSysPerSecond > 0 && claimableSys < CLAIM_MIN_SYS
      ? Math.ceil((CLAIM_MIN_SYS - claimableSys) / rateSysPerSecond)
      : 0;

    return {
      miningActive,
      dailyReward: rateSysPerDay,
      accruedSys,
      claimableSys,
      claimThresholdSys: CLAIM_MIN_SYS,
      rateSysPerSecond,
      claimEtaSeconds,
      claimedToday: false,
      claim: null,
      lock: miningActive ? {
        id: Number(deposit?.id ?? 0),
        amountIdr: lockAmountIdr,
        amountUsd: lockAmountIdr / IDR_PER_USD,
        durationDays: Number(deposit?.durationDays ?? 0),
        startDate: deposit?.startDate ?? userResult.rows[0]?.miningStartedAt ?? 0,
        endDate: deposit?.endDate ?? 0,
        status: String(deposit?.status ?? "ACTIVE"),
      } : null,
      sysBalance: Number(userResult.rows[0]?.sysBalance ?? 0),
      miningStartedAt,
      lastCreditedAt,
    };
  });
}

export async function onRequestGet(context: any) {
  const { request, env } = context;
  try {
    const auth = await requireAuth(request, env);
    if (!auth.ok) return auth.response;
    await ensureMining(env);

    const userId = String(auth.user.id);
    await syncMiningForUser(env, userId);
    const status = await getStatus(env, userId);

    return json({
      success: true,
      ...status,
      rules: {
        idrPerUsd: IDR_PER_USD,
        minimumUsd: MINING_USD,
        minimumIdr: MINING_MIN_IDR,
        sysPerTenUsd: 1,
        claimMinimumSys: CLAIM_MIN_SYS,
        cycleSecondsAtTenUsd: 86400,
      },
    });
  } catch (error) {
    console.error("mining status error", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}

export async function onRequestPost(context: any) {
  const { request, env } = context;
  try {
    const auth = await requireAuth(request, env);
    if (!auth.ok) return auth.response;
    await ensureMining(env);

    const userId = String(auth.user.id);
    await syncMiningForUser(env, userId);
    const status = await getStatus(env, userId);
    const lockAmountIdr = Number(status.lock?.amountIdr ?? 0);
    const claimableSys = Number(status.claimableSys ?? 0);

    if (!status.lock || !status.miningActive) {
      return json({
        success: false,
        miningActive: false,
        reward: 0,
        lockAmountIdr,
        minimumMiningIdr: MINING_MIN_IDR,
        claimMinimumSys: CLAIM_MIN_SYS,
        message: "Mining membutuhkan Blind Box Lock aktif minimal $10.",
      }, 403);
    }

    if (claimableSys < CLAIM_MIN_SYS) {
      return json({
        success: false,
        miningActive: true,
        reward: 0,
        claimableSys,
        claimMinimumSys: CLAIM_MIN_SYS,
        claimEtaSeconds: status.claimEtaSeconds,
        dailyReward: status.dailyReward,
        message: `Claim tersedia setelah mencapai ${CLAIM_MIN_SYS} SYS.`,
      }, 403);
    }

    const result = await withDb(env, async (client) => {
      const updated = await client.query(`
        UPDATE users
        SET
          sys_balance = COALESCE(sys_balance,0) + COALESCE(mining_accrued_sys,0),
          mining_accrued_sys = 0
        WHERE id = $1
          AND COALESCE(mining_accrued_sys,0) >= $2
        RETURNING
          sys_balance AS "sysBalance"
      `, [userId, CLAIM_MIN_SYS]);

      if (updated.rowCount <= 0) {
        return { claimed: false };
      }

      const reward = Number(
        claimableSys
      );

      await client.query(`
        INSERT INTO mining_claims
          (user_id, deposit_id, claim_date, amount_locked, reward_sys, created_at)
        VALUES ($1, $2, CURRENT_DATE, $3, $4, CURRENT_TIMESTAMP)
      `, [userId, Number(status.lock?.id ?? 0), lockAmountIdr, reward]);

      return {
        claimed: true,
        reward,
        sysBalance: Number(updated.rows[0]?.sysBalance ?? 0),
      };
    });

    if (!result.claimed) {
      const refreshed = await syncMiningForUser(env, userId);
      return json({
        success: false,
        miningActive: true,
        reward: 0,
        claimableSys: Number(refreshed.claimableSys ?? 0),
        claimMinimumSys: CLAIM_MIN_SYS,
        claimEtaSeconds: refreshed.claimEtaSeconds,
        message: `Claim tersedia setelah mencapai ${CLAIM_MIN_SYS} SYS.`,
      }, 409);
    }

    return json({
      success: true,
      miningActive: true,
      claimedToday: false,
      lockId: Number(status.lock?.id ?? 0),
      lockAmountIdr,
      lockAmountUsd: lockAmountIdr / IDR_PER_USD,
      dailyReward: status.dailyReward,
      reward: result.reward,
      claimMinimumSys: CLAIM_MIN_SYS,
      claimableSys: 0,
      sysBalance: result.sysBalance,
      message: `${result.reward} SYS berhasil ditambahkan ke saldo SYS.`,
    });
  } catch (error) {
    console.error("mining claim error", error);
    return json({
      success: false,
      error: "Internal server error",
    }, 500);
  }
}
