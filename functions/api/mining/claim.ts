import { requireAuth } from "../../_lib/auth";
import { Env, json, withDb } from "../../_lib/db";
import { syncMiningForUser } from "../mining";

const IDR_PER_USD = 17937;
const MINING_USD = 10;
const MINING_MIN_IDR = MINING_USD * IDR_PER_USD;

function wibDate(): string {
  return new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
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

  await env.DB.prepare(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_mining_claims_user_date
    ON mining_claims(user_id, claim_date)
  `).run();
}

async function getStatus(env: Env, userId: string) {
  const claimDate = wibDate();
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
      `SELECT COALESCE(total_locked,0) AS "totalLocked",
              COALESCE(mining_started_at,0) AS "miningStartedAt"
       FROM users WHERE id = $1 LIMIT 1`,
      [userId]
    );
    const canonicalLockedIdr = Number(userResult.rows[0]?.totalLocked || 0);
    const lockAmountIdr = Number(deposit?.amount ?? canonicalLockedIdr);
    const miningActive = Number.isFinite(lockAmountIdr) && lockAmountIdr >= MINING_MIN_IDR;
    const dailyReward = miningActive
      ? Math.floor(lockAmountIdr / MINING_MIN_IDR)
      : 0;

    const claimResult = await client.query(`
      SELECT id, reward_sys AS "rewardSys", claim_date AS "claimDate", created_at AS "createdAt"
      FROM mining_claims
      WHERE user_id = $1 AND claim_date = $2
      LIMIT 1
    `, [userId, claimDate]);

    return {
      claimDate,
      miningActive,
      dailyReward,
      claimedToday: claimResult.rows.length > 0,
      claim: claimResult.rows[0] ?? null,
      lock: miningActive ? {
        id: Number(deposit?.id ?? 0),
        amountIdr: lockAmountIdr,
        amountUsd: lockAmountIdr / IDR_PER_USD,
        durationDays: Number(deposit?.durationDays ?? 0),
        startDate: deposit?.startDate ?? userResult.rows[0]?.miningStartedAt ?? 0,
        endDate: deposit?.endDate ?? 0,
        status: String(deposit?.status ?? 'ACTIVE'),
      } : null,
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
    // Reconcile the automatic mining engine before the Mining page reads status.
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
      },
      sysBalance: Number(auth.user.sysBalance ?? 0),
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
    const claimDate = wibDate();
    await syncMiningForUser(env, userId);

    const status = await getStatus(env, userId);
    const lock = status.lock;
    const lockAmountIdr = Number(lock?.amountIdr ?? 0);

    if (!lock || !status.miningActive) {
      return json({
        success: false,
        miningActive: false,
        reward: 0,
        lockAmountIdr,
        minimumMiningIdr: MINING_MIN_IDR,
        message: `Mining membutuhkan Blind Box Lock aktif minimal $10 (Rp ${MINING_MIN_IDR.toLocaleString("id-ID")}).`,
      }, 403);
    }

    const reward = Math.floor(lockAmountIdr / MINING_MIN_IDR);
    if (reward <= 0) {
      return json({ success: false, miningActive: false, reward: 0, message: "Jumlah lock belum memenuhi minimum Mining." }, 403);
    }

    const result = await withDb(env, async (client) => {
      const existing = await client.query(`
        SELECT id, reward_sys AS "rewardSys", claim_date AS "claimDate", created_at AS "createdAt"
        FROM mining_claims
        WHERE user_id = $1 AND claim_date = $2
        LIMIT 1
      `, [userId, claimDate]);

      if (existing.rows.length > 0) {
        return { alreadyClaimed: true, claim: existing.rows[0] };
      }

      await client.query(`
        INSERT INTO mining_claims
          (user_id, deposit_id, claim_date, amount_locked, reward_sys, created_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      `, [userId, Number(lock.id), claimDate, lockAmountIdr, reward]);

      const balanceUpdate = await client.query(`
        UPDATE users
        SET sys_balance = COALESCE(sys_balance, 0) + $1
        WHERE id = $2
      `, [reward, Number(userId)]);

      if (balanceUpdate.rowCount <= 0) {
        await client.query(`
          DELETE FROM mining_claims
          WHERE user_id = $1 AND claim_date = $2
        `, [userId, claimDate]);
        throw new Error("SYS_BALANCE_UPDATE_FAILED");
      }

      await client.query(`
        UPDATE deposits
        SET total_claimed = COALESCE(total_claimed, 0)
        WHERE id = $1 AND user_id = $2 AND status = 'ACTIVE'
      `, [Number(lock.id), Number(userId)]);

      const updated = await client.query(`
        SELECT COALESCE(sys_balance, 0) AS "sysBalance"
        FROM users
        WHERE id = $1
        LIMIT 1
      `, [userId]);

      return {
        alreadyClaimed: false,
        sysBalance: Number(updated.rows[0]?.sysBalance ?? 0),
      };
    });

    if (result.alreadyClaimed) {
      return json({
        success: false,
        miningActive: true,
        claimedToday: true,
        reward: 0,
        dailyReward: reward,
        claim: result.claim,
        message: "Mining reward hari ini sudah diklaim.",
      }, 409);
    }

    return json({
      success: true,
      miningActive: true,
      claimedToday: true,
      lockId: Number(lock.id),
      lockAmountIdr,
      lockAmountUsd: lockAmountIdr / IDR_PER_USD,
      dailyReward: reward,
      reward,
      claimDate,
      sysBalance: Number(result.sysBalance ?? 0),
      message: `${reward} SYS berhasil ditambahkan ke saldo SYS.`,
    });
  } catch (error) {
    console.error("mining claim error", error);
    return json({
      success: false,
      error: error instanceof Error && error.message === "SYS_BALANCE_UPDATE_FAILED"
        ? "Saldo SYS gagal diperbarui."
        : "Internal server error",
    }, 500);
  }
}
