import { requireAuth } from "../../_lib/auth";

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

async function ensureMining(env: Env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS mining_claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      lock_id INTEGER NOT NULL,
      claim_date TEXT NOT NULL,
      amount_locked REAL NOT NULL,
      reward_sys REAL NOT NULL,
      created_at INTEGER NOT NULL
    )
  `).run();

  await env.DB.prepare(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_mining_claims_user_date
    ON mining_claims(user_id, claim_date)
  `).run();
}

async function getActiveLock(env: Env, userId: string, now: number) {
  return env.DB.prepare(`
    SELECT
      id,
      amount,
      duration_days,
      multiplier,
      start_date,
      end_date,
      status,
      daily_claims,
      accumulated_yield,
      last_claim_at
    FROM locks
    WHERE user_id = ?
      AND LOWER(COALESCE(status, '')) = 'locked'
      AND start_date <= ?
      AND end_date > ?
    ORDER BY amount DESC, id DESC
    LIMIT 1
  `).bind(userId, now, now).first<any>();
}

export async function onRequestGet(context: any) {
  const { request, env } = context;

  try {
    const auth = await requireAuth(request, env);
    if (!auth.ok) return auth.response;

    await ensureMining(env);

    const userId = String(auth.user.id);
    const now = Math.floor(Date.now() / 1000);
    const claimDate = new Date(now * 1000).toISOString().slice(0, 10);

    const lock = await getActiveLock(env, userId, now);

    const lockAmount = Number(lock?.amount ?? 0);
    const miningActive =
      !!lock &&
      Number.isFinite(lockAmount) &&
      lockAmount >= 10;

    const dailyReward = miningActive
      ? Math.floor(lockAmount / 10)
      : 0;

    const claim = await env.DB.prepare(`
      SELECT id, reward_sys, claim_date, created_at
      FROM mining_claims
      WHERE user_id = ?
        AND claim_date = ?
      LIMIT 1
    `).bind(userId, claimDate).first<any>();

    return json({
      success: true,
      miningActive,
      claimedToday: !!claim,
      claimDate,
      dailyReward,
      lock: lock
        ? {
            id: Number(lock.id),
            amount: lockAmount,
            durationDays: Number(lock.duration_days ?? 0),
            startDate: Number(lock.start_date ?? 0),
            endDate: Number(lock.end_date ?? 0),
            status: String(lock.status ?? ""),
          }
        : null,
      claim: claim || null,
      sysBalance: Number(auth.user.sysBalance ?? 0),
    });
  } catch (error) {
    console.error("mining status error", error);

    return json({
      success: false,
      error: "Internal server error",
    }, 500);
  }
}

export async function onRequestPost(context: any) {
  const { request, env } = context;

  try {
    const auth = await requireAuth(request, env);
    if (!auth.ok) return auth.response;

    await ensureMining(env);

    const userId = String(auth.user.id);
    const now = Math.floor(Date.now() / 1000);
    const claimDate = new Date(now * 1000).toISOString().slice(0, 10);

    const lock = await getActiveLock(env, userId, now);

    if (!lock) {
      return json({
        success: false,
        miningActive: false,
        reward: 0,
        message: "Tidak ada Blind Box lock yang masih aktif.",
      }, 403);
    }

    const lockAmount = Number(lock.amount ?? 0);

    if (!Number.isFinite(lockAmount) || lockAmount < 10) {
      return json({
        success: false,
        miningActive: false,
        reward: 0,
        lockAmount,
        message: "Mining membutuhkan active Blind Box lock minimal $10.",
      }, 403);
    }

    const reward = Math.floor(lockAmount / 10);

    if (reward <= 0) {
      return json({
        success: false,
        miningActive: false,
        reward: 0,
        lockAmount,
        message: "Jumlah lock belum memenuhi minimum Mining.",
      }, 403);
    }

    /*
     * Reserve today's claim first.
     * UNIQUE(user_id, claim_date) prevents duplicate claims.
     */
    try {
      const inserted = await env.DB.prepare(`
        INSERT INTO mining_claims
          (user_id, lock_id, claim_date, amount_locked, reward_sys, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        userId,
        Number(lock.id),
        claimDate,
        lockAmount,
        reward,
        now
      ).run();

      if (!inserted?.meta?.changes) {
        return json({
          success: false,
          miningActive: true,
          reward: 0,
          message: "Claim Mining tidak dapat dibuat.",
        }, 409);
      }
    } catch (error) {
      if (/unique|constraint/i.test(String(error))) {
        const existing = await env.DB.prepare(`
          SELECT id, reward_sys, claim_date, created_at
          FROM mining_claims
          WHERE user_id = ?
            AND claim_date = ?
          LIMIT 1
        `).bind(userId, claimDate).first<any>();

        return json({
          success: false,
          miningActive: true,
          claimedToday: true,
          reward: 0,
          lockAmount,
          dailyReward: reward,
          claim: existing || null,
          message: "Mining reward hari ini sudah diklaim.",
        }, 409);
      }

      throw error;
    }

    /*
     * Credit the real production SYS balance.
     */
    const balanceUpdate = await env.DB.prepare(`
      UPDATE users
      SET sys_balance = COALESCE(sys_balance, 0) + ?
      WHERE id = ?
    `).bind(reward, userId).run();

    if (!balanceUpdate?.meta?.changes) {
      /*
       * If the user row cannot be credited, remove the reserved claim
       * so it can safely be retried.
       */
      await env.DB.prepare(`
        DELETE FROM mining_claims
        WHERE user_id = ?
          AND claim_date = ?
      `).bind(userId, claimDate).run();

      return json({
        success: false,
        miningActive: true,
        reward: 0,
        message: "Saldo SYS gagal diperbarui.",
      }, 500);
    }

    await env.DB.prepare(`
      UPDATE locks
      SET
        daily_claims = COALESCE(daily_claims, 0) + 1,
        accumulated_yield = COALESCE(accumulated_yield, 0) + ?,
        last_claim_at = ?
      WHERE id = ?
        AND user_id = ?
        AND LOWER(COALESCE(status, '')) = 'locked'
        AND start_date <= ?
        AND end_date > ?
    `).bind(
      reward,
      now,
      Number(lock.id),
      userId,
      now,
      now
    ).run();

    const updatedUser = await env.DB.prepare(`
      SELECT COALESCE(sys_balance, 0) AS sysBalance
      FROM users
      WHERE id = ?
      LIMIT 1
    `).bind(userId).first<any>();

    return json({
      success: true,
      miningActive: true,
      claimedToday: true,
      lockId: Number(lock.id),
      lockAmount,
      dailyReward: reward,
      reward,
      claimDate,
      sysBalance: Number(updatedUser?.sysBalance ?? 0),
      message: `${reward} SYS berhasil ditambahkan ke saldo SYS.`,
    });
  } catch (error) {
    console.error("mining claim error", error);

    return json({
      success: false,
      error: "Internal server error",
    }, 500);
  }
}
