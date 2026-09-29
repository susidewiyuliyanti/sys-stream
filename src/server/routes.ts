import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/index.ts';
import { users, deposits, blindBoxClaims, gameSettings, withdrawals } from '../db/schema.ts';
import { eq, and, desc, sql } from 'drizzle-orm';
import {
  authenticateToken,
  requireAdmin,
  AuthenticatedRequest,
  generateToken,
  hashPassword,
  comparePassword,
} from './auth.ts';
import { getWIBTime } from './wibTime.ts';

const router = Router();

// In-memory Targeted Jackpot map with custom nominal authorization by Owner
export interface TargetedJackpotInfo {
  userId: number;
  depositId?: number;
  nominal: number;
  setAt: Date;
}
export const targetedJackpotMap = new Map<number, TargetedJackpotInfo>();

// ==========================================
// SEED DEFAULT ADMIN LAZILY (NON-BLOCKING)
// ==========================================
let isInitialized = false;
let initPromise: Promise<void> | null = null;

export async function ensureAdminAndSettings() {
  if (isInitialized) return;
  if (!process.env.SQL_HOST) {
    return;
  }
  if (!initPromise) {
    initPromise = (async () => {
      try {
        // Check if admin user exists by username 'admin' OR email 'susidewiyuliyanti@gmail.com'
        const existingAdmin = await db
          .select()
          .from(users)
          .where(sql`${users.username} = 'admin' OR ${users.email} = 'susidewiyuliyanti@gmail.com'`)
          .limit(1);

        if (existingAdmin.length === 0) {
          const hashedPassword = await hashPassword('admin123');
          await db
            .insert(users)
            .values({
              cuid: 'admin_' + crypto.randomUUID(),
              username: 'admin',
              email: 'susidewiyuliyanti@gmail.com',
              password: hashedPassword,
              balance: 5000000,
              role: 'ADMIN',
            })
            .onConflictDoNothing();
          console.log('Default Admin seeded: username: admin / pass: admin123');
        } else {
          // Pastikan user admin memiliki role ADMIN
          if (existingAdmin[0].role !== 'ADMIN') {
            await db
              .update(users)
              .set({ role: 'ADMIN' })
              .where(eq(users.id, existingAdmin[0].id));
          }
        }

        // Check game settings
        const settings = await db.select().from(gameSettings).where(eq(gameSettings.id, 1)).limit(1);
        if (settings.length === 0) {
          await db
            .insert(gameSettings)
            .values({
              id: 1,
              jackpotAmount: 500000,
              jackpotChance: 100,
              minBox: 100,
              maxBox: 1000,
            })
            .onConflictDoNothing();
        }
        isInitialized = true;
      } catch (err) {
        console.error('Safe admin & settings initialization error:', err);
      } finally {
        initPromise = null;
      }
    })();
  }
  return initPromise;
}

// Auto-seed lazily in the background with a delay after process startup
setTimeout(() => {
  ensureAdminAndSettings().catch(() => {});
}, 3000);

// ==========================================
// 1. AUTHENTICATION (JWT)
// ==========================================

// Register
router.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required!' });
    }

    if (password.length < 5) {
      return res.status(400).json({ error: 'Password must be at least 5 characters!' });
    }

    // Check existing
    const existingUsername = await db.select().from(users).where(eq(users.username, username.trim())).limit(1);
    if (existingUsername.length > 0) {
      return res.status(400).json({ error: 'Username is already taken by another player!' });
    }

    const existingEmail = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
    if (existingEmail.length > 0) {
      return res.status(400).json({ error: 'Email is already registered! Please log in.' });
    }

    const hashedPassword = await hashPassword(password);
    const isSpecialAdmin =
      email.trim().toLowerCase() === 'susidewiyuliyanti@gmail.com' ||
      username.trim().toLowerCase() === 'admin';

    const [newUser] = await db
      .insert(users)
      .values({
        cuid: 'usr_' + crypto.randomUUID(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        balance: 15000,
        role: isSpecialAdmin ? 'ADMIN' : 'USER',
      })
      .returning();

    const token = generateToken({
      id: newUser.id,
      cuid: newUser.cuid,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });

    res.status(201).json({
      message: 'Registration successful! You received an initial registration bonus of Rp 15,000.',
      token,
      user: {
        id: newUser.id,
        cuid: newUser.cuid,
        username: newUser.username,
        email: newUser.email,
        balance: newUser.balance,
        role: newUser.role,
      },
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message || 'Failed to register account.' });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ error: 'Username/email and password are required!' });
    }

    const cleanLogin = login.trim();
    const foundUsers = await db
      .select()
      .from(users)
      .where(sql`${users.username} = ${cleanLogin} OR ${users.email} = ${cleanLogin.toLowerCase()}`)
      .limit(1);

    if (foundUsers.length === 0) {
      return res.status(401).json({ error: 'Username or email not found!' });
    }

    const user = foundUsers[0];
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect password!' });
    }

    const token = generateToken({
      id: user.id,
      cuid: user.cuid,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        cuid: user.cuid,
        username: user.username,
        email: user.email,
        balance: user.balance,
        role: user.role,
        isBlacklisted: user.isBlacklisted,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Failed to log in to system.' });
  }
});

// Sync Unified Session from App UserProfile (Firebase Auth / Host Session)
router.post('/auth/sync-session', async (req, res) => {
  try {
    const { uid, email, displayName, role, walletBalance } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required for unified account synchronization.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const isOwner = cleanEmail === 'susidewiyuliyanti@gmail.com';
    const userRole = isOwner || role === 'admin' ? 'ADMIN' : 'USER';
    const cleanUsername = displayName
      ? displayName.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20) || cleanEmail.split('@')[0]
      : cleanEmail.split('@')[0];

    // Find user in PostgreSQL
    const existingUsers = await db
      .select()
      .from(users)
      .where(sql`${users.email} = ${cleanEmail} OR ${users.cuid} = ${uid || ''}`)
      .limit(1);

    let dbUser;
    const balanceNum = typeof walletBalance === 'number' && !isNaN(walletBalance) ? walletBalance : 15000;

    if (existingUsers.length === 0) {
      const hashedPassword = await hashPassword('sys_' + crypto.randomUUID());
      const [newUser] = await db
        .insert(users)
        .values({
          cuid: uid || ('usr_' + crypto.randomUUID()),
          username: cleanUsername,
          email: cleanEmail,
          password: hashedPassword,
          balance: balanceNum,
          role: userRole,
        })
        .returning();
      dbUser = newUser;
    } else {
      const updateData: any = {
        role: userRole,
      };
      if (typeof walletBalance === 'number' && !isNaN(walletBalance)) {
        updateData.balance = balanceNum;
      }
      if (uid && existingUsers[0].cuid !== uid) {
        updateData.cuid = uid;
      }
      if (cleanUsername && existingUsers[0].username !== cleanUsername) {
        const clash = await db.select().from(users).where(eq(users.username, cleanUsername)).limit(1);
        if (clash.length === 0) {
          updateData.username = cleanUsername;
        }
      }

      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, existingUsers[0].id))
        .returning();
      dbUser = updatedUser;
    }

    const token = generateToken({
      id: dbUser.id,
      cuid: dbUser.cuid,
      username: dbUser.username,
      email: dbUser.email,
      role: dbUser.role,
    });

    res.json({
      message: 'Unified account and wallet successfully synchronized!',
      token,
      user: {
        id: dbUser.id,
        cuid: dbUser.cuid,
        username: dbUser.username,
        email: dbUser.email,
        balance: dbUser.balance,
        role: dbUser.role,
        isBlacklisted: dbUser.isBlacklisted,
        forceJackpotNext: dbUser.forceJackpotNext,
      },
    });
  } catch (err: any) {
    console.error('Sync session error:', err);
    res.status(500).json({ error: err.message || 'Failed to sync user account.' });
  }
});

// Update & Sync Saldo Dompet Terpadu antar modul game
router.post('/user/sync-wallet', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { walletBalance } = req.body;
    if (typeof walletBalance !== 'number' || isNaN(walletBalance)) {
      return res.status(400).json({ error: 'Invalid balance amount.' });
    }

    const [updatedUser] = await db
      .update(users)
      .set({ balance: walletBalance })
      .where(eq(users.id, userId))
      .returning();

    res.json({
      success: true,
      balance: updatedUser.balance,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to sync wallet balance.' });
  }
});

export function getDepositTierDetails(amount: number) {
  if (amount >= 50000000) {
    return {
      tier: 'SULTAN' as const,
      tierName: 'Sultan VIP',
      boxCount: 25,
      boxType: 'Box Sultan VIP',
      badgeColor: 'rose',
    };
  }
  if (amount >= 20000000) {
    return {
      tier: 'DIAMOND' as const,
      tierName: 'Diamond',
      boxCount: 15,
      boxType: 'Box Diamond',
      badgeColor: 'cyan',
    };
  }
  if (amount >= 5000000) {
    return {
      tier: 'GOLD' as const,
      tierName: 'Gold',
      boxCount: 10,
      boxType: 'Gold Box',
      badgeColor: 'amber',
    };
  }
  if (amount >= 2500000) {
    return {
      tier: 'PLATINUM' as const,
      tierName: 'Platinum',
      boxCount: 5,
      boxType: 'Platinum Box',
      badgeColor: 'purple',
    };
  }
  if (amount >= 1000000) {
    return {
      tier: 'SILVER' as const,
      tierName: 'Silver',
      boxCount: 3,
      boxType: 'Silver Box',
      badgeColor: 'slate',
    };
  }
  return {
    tier: 'BRONZE' as const,
    tierName: 'Bronze (Regular)',
    boxCount: 1,
    boxType: 'Regular Box',
    badgeColor: 'orange',
  };
}

// Get Current User Profile & Active Deposit Status
router.get('/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { dateStr, countdownFormatted, msRemaining } = getWIBTime();

    // Check active or recent deposits
    const userDeposits = await db
      .select()
      .from(deposits)
      .where(eq(deposits.userId, userId))
      .orderBy(desc(deposits.createdAt));

    // Current ACTIVE deposit (or recently expired deposit ready for withdraw)
    let activeDeposit = userDeposits.find((d) => d.status === 'ACTIVE') || null;

    // Check if active deposit has reached end date
    const now = new Date();
    if (activeDeposit && new Date(activeDeposit.endDate) <= now) {
      // Auto mark as EXPIRED so user can withdraw!
      await db.update(deposits).set({ status: 'EXPIRED' }).where(eq(deposits.id, activeDeposit.id));
      activeDeposit.status = 'EXPIRED';
    }

    // Has user claimed today for active deposit?
    let hasClaimedToday = false;
    let todayClaimData = null;

    if (activeDeposit && activeDeposit.status === 'ACTIVE') {
      const todayClaims = await db
        .select()
        .from(blindBoxClaims)
        .where(and(eq(blindBoxClaims.depositId, activeDeposit.id), eq(blindBoxClaims.claimDate, dateStr)))
        .limit(1);

      if (todayClaims.length > 0) {
        hasClaimedToday = true;
        todayClaimData = todayClaims[0];
      }
    }

    // Deposit tier details
    const depositTier = activeDeposit ? getDepositTierDetails(activeDeposit.amount) : null;

    // Fetch last 7 days claim history for this user
    const recentClaims = await db
      .select()
      .from(blindBoxClaims)
      .where(eq(blindBoxClaims.userId, userId))
      .orderBy(desc(blindBoxClaims.claimedAt))
      .limit(7);

    // Fetch game settings for public view
    const [settings] = await db.select().from(gameSettings).where(eq(gameSettings.id, 1)).limit(1);

    res.json({
      user: {
        id: user.id,
        cuid: user.cuid,
        username: user.username,
        email: user.email,
        balance: user.balance,
        role: user.role,
        isBlacklisted: user.isBlacklisted,
        forceJackpotNext: user.forceJackpotNext,
      },
      activeDeposit,
      depositTier,
      allDeposits: userDeposits,
      hasClaimedToday,
      todayClaimData,
      recentClaims,
      wibTime: {
        dateStr,
        countdownFormatted,
        msRemaining,
      },
      settings: settings || {
        jackpotAmount: 500000,
        jackpotChance: 100,
        minBox: 100,
        maxBox: 1000,
      },
    });
  } catch (err: any) {
    console.error('Me error:', err);
    res.status(500).json({ error: err.message || 'Failed to load user data.' });
  }
});

// Top up instant balance (Owner page only)
router.post('/auth/topup-demo', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isOwner =
      req.user!.role === 'ADMIN' ||
      req.user!.email?.toLowerCase() === 'susidewiyuliyanti@gmail.com';

    if (!isOwner) {
      return res.status(403).json({
        error: 'Access denied. Instant balance addition is only available on Owner page.',
      });
    }

    const targetUserId = req.body.targetUserId ? Number(req.body.targetUserId) : req.user!.id;
    const addAmount = Number(req.body.amount) || 50000;

    const [updatedUser] = await db
      .update(users)
      .set({ balance: sql`${users.balance} + ${addAmount}` })
      .where(eq(users.id, targetUserId))
      .returning();

    if (!updatedUser) {
      return res.status(404).json({ error: 'Target user not found.' });
    }

    res.json({
      message: `Balance successfully increased by Rp ${addAmount.toLocaleString('id-ID')}!`,
      newBalance: updatedUser.balance,
      targetUserId,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add balance.' });
  }
});

// ==========================================
// 2. CORE GAMEPLAY LOGIC
// ==========================================

/**
 * A. DEPOSIT
 * POST /api/deposit
 * Body: { amount: 50000, duration: 30 | 60 | 90 }
 * Validasi:
 * 1. amount harus 50000
 * 2. duration harus 30, 60, atau 90
 * 3. 1 User hanya bisa punya 1 Deposit ACTIVE
 * 4. Kurangi balance user
 * 5. Buat record Deposit: endDate = startDate + durationDays
 */
router.post('/deposit', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { amount, duration } = req.body;

    const depositAmount = Number(amount);
    const durationDays = Number(duration);

    if (isNaN(depositAmount) || depositAmount < 50000) {
      return res.status(400).json({
        error: 'Deposit amount must be at least Rp 50,000 without any upper limit!',
      });
    }

    if (depositAmount % 10000 !== 0) {
      return res.status(400).json({
        error: 'Deposit amount must be in multiples of Rp 10,000 (e.g., 50,000, 100,000, 1,000,000, 10,000,000, etc.)!',
      });
    }

    if (![30, 60, 90].includes(durationDays)) {
      return res.status(400).json({ error: 'Lock duration must be 30, 60, or 90 days!' });
    }

    // Check user & blacklist
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.isBlacklisted) {
      return res.status(403).json({ error: 'Your account is currently blocked by Admin from game activities.' });
    }

    if (user.balance < depositAmount) {
      return res.status(400).json({
        error: `Insufficient balance (Current balance: Rp ${user.balance.toLocaleString('id-ID')}). Please top up your balance first.`,
      });
    }

    // Rule 1: 1 User can only have 1 ACTIVE Deposit
    const existingActive = await db
      .select()
      .from(deposits)
      .where(and(eq(deposits.userId, userId), eq(deposits.status, 'ACTIVE')))
      .limit(1);

    if (existingActive.length > 0) {
      return res.status(400).json({
        error: 'You already have an ACTIVE deposit! Complete the lock duration before creating a new deposit.',
      });
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const depositCode = 'BBD-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 900 + 100);

    // Deduct balance
    const [updatedUser] = await db
      .update(users)
      .set({ balance: user.balance - depositAmount })
      .where(eq(users.id, userId))
      .returning();

    // Create deposit
    const [newDeposit] = await db
      .insert(deposits)
      .values({
        depositCode,
        userId,
        amount: depositAmount,
        durationDays,
        startDate,
        endDate,
        status: 'ACTIVE',
        totalClaimed: 0,
      })
      .returning();

    res.status(201).json({
      message: `Deposit of Rp ${depositAmount.toLocaleString('id-ID')} with ${durationDays}-day duration successfully activated!`,
      deposit: newDeposit,
      remainingBalance: updatedUser.balance,
    });
  } catch (err: any) {
    console.error('Deposit error:', err);
    res.status(500).json({ error: err.message || 'Failed to process deposit.' });
  }
});

/**
 * EARLY UNLOCK DEPOSIT BALANCE
 * POST /api/deposit/unlock
 */
router.post('/deposit/unlock', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { depositId } = req.body || {};

    let queryCondition = and(eq(deposits.userId, userId), eq(deposits.status, 'ACTIVE'));
    if (depositId) {
      const depNum = Number(depositId);
      if (!isNaN(depNum)) {
        queryCondition = and(eq(deposits.userId, userId), eq(deposits.id, depNum));
      }
    }

    const [deposit] = await db
      .select()
      .from(deposits)
      .where(queryCondition)
      .limit(1);

    if (!deposit) {
      return res.status(404).json({
        error: 'No active locked deposit found for this account.',
      });
    }

    if (deposit.status !== 'ACTIVE') {
      return res.status(400).json({
        error: `Deposit is not in active locked status. Current status: ${deposit.status}.`,
      });
    }

    const refundedAmount = deposit.amount;
    const forfeitedReward = deposit.totalClaimed;

    // Delete blind box claims for this deposit (rewards forfeited)
    await db.delete(blindBoxClaims).where(eq(blindBoxClaims.depositId, deposit.id));

    // Update deposit status to UNLOCKED and totalClaimed to 0
    await db
      .update(deposits)
      .set({
        status: 'UNLOCKED',
        totalClaimed: 0,
      })
      .where(eq(deposits.id, deposit.id));

    // Return deposit principal to user balance
    const [updatedUser] = await db
      .update(users)
      .set({ balance: sql`${users.balance} + ${refundedAmount}` })
      .where(eq(users.id, userId))
      .returning();

    res.json({
      success: true,
      message: `Deposit balance unlocked! Principal amount of Rp ${refundedAmount.toLocaleString('id-ID')} has been returned to your wallet. Accumulated rewards of Rp ${forfeitedReward.toLocaleString('id-ID')} have been forfeited according to terms.`,
      refundedAmount,
      forfeitedReward,
      newBalance: updatedUser.balance,
      depositId: deposit.id,
    });
  } catch (err: any) {
    console.error('Deposit unlock error:', err);
    res.status(500).json({ error: err.message || 'Failed to unlock deposit balance.' });
  }
});

/**
 * B. CRON JOB - DAILY RESET at 00:00 WIB
 * GET /api/cron/reset & POST /api/cron/reset
 */
router.all('/cron/reset', async (req, res) => {
  try {
    const now = new Date();
    const { dateStr } = getWIBTime(now);

    // Update active deposits that have passed endDate to EXPIRED
    const expiredList = await db
      .select()
      .from(deposits)
      .where(and(eq(deposits.status, 'ACTIVE'), sql`${deposits.endDate} <= ${now}`));

    let updatedCount = 0;
    for (const dep of expiredList) {
      await db.update(deposits).set({ status: 'EXPIRED' }).where(eq(deposits.id, dep.id));
      updatedCount++;
    }

    res.json({
      status: 'success',
      message: `Daily 00:00 WIB reset cron executed successfully for date ${dateStr}.`,
      dateWIB: dateStr,
      expiredDepositsUpdated: updatedCount,
      serverTime: now.toISOString(),
    });
  } catch (err: any) {
    console.error('Cron reset error:', err);
    res.status(500).json({ error: err.message || 'Failed to execute cron reset.' });
  }
});

/**
 * C. KLAIM BLIND BOX
 * POST /api/claim/:depositId
 * Logic:
 * 1. Cek apakah deposit ada, milik user, dan status ACTIVE
 * 2. Cek apakah hari ini sudah claim (1x per 24 jam tanggal WIB). Jika sudah return error
 * 3. Cek apakah sekarang < 24 jam dari jam 00:00 hari ini (hari hangus jika kemarin tidak diklaim)
 * 4. Random amount: Math.random() * (maxBox - minBox) + minBox (Rp100 - Rp1000)
 * 5. Cek Jackpot: jika random(1, jackpotChance) == 1 atau Admin set Force Jackpot -> amount = 500000 dan isJackpot = true
 * 6. Tambah amount ke totalClaimed di Deposit
 * 7. Simpan ke BlindBoxClaim
 */
router.post('/claim/:depositId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const depositId = Number(req.params.depositId);

    if (isNaN(depositId)) {
      return res.status(400).json({ error: 'Invalid Deposit ID.' });
    }

    // Check user & blacklist
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.isBlacklisted) {
      return res.status(403).json({ error: 'Your account is currently blacklisted by Admin and cannot open Blind Boxes.' });
    }

    // Fetch deposit
    const [deposit] = await db
      .select()
      .from(deposits)
      .where(and(eq(deposits.id, depositId), eq(deposits.userId, userId)))
      .limit(1);

    if (!deposit) {
      return res.status(404).json({ error: 'Deposit record not found or does not belong to you.' });
    }

    const now = new Date();
    // Check if deposit has passed end date
    if (new Date(deposit.endDate) <= now || deposit.status === 'EXPIRED') {
      await db.update(deposits).set({ status: 'EXPIRED' }).where(eq(deposits.id, deposit.id));
      return res.status(400).json({
        error: 'The lock period for this deposit has ended (EXPIRED). You can now withdraw the principal + earnings!',
      });
    }

    if (deposit.status !== 'ACTIVE') {
      return res.status(400).json({ error: `Deposit is not active (Status: ${deposit.status}).` });
    }

    const { dateStr } = getWIBTime(now);

    // 1. Check if claimed today
    const existingClaim = await db
      .select()
      .from(blindBoxClaims)
      .where(and(eq(blindBoxClaims.depositId, depositId), eq(blindBoxClaims.claimDate, dateStr)))
      .limit(1);

    if (existingClaim.length > 0) {
      return res.status(400).json({
        error: 'You have already claimed your Blind Box today! Next claim opportunity resets at 00:00 WIB.',
        alreadyClaimed: true,
        claim: existingClaim[0],
      });
    }

    // 2. Fetch game settings
    const [settings] = await db.select().from(gameSettings).where(eq(gameSettings.id, 1)).limit(1);
    const jackpotAmount = settings?.jackpotAmount ?? 50000000;
    const jackpotChance = Math.max(1, settings?.jackpotChance ?? 100);
    const minBox = settings?.minBox ?? 100;
    const maxBox = settings?.maxBox ?? 1000;

    const tierInfo = getDepositTierDetails(deposit.amount);
    const boxCount = tierInfo.boxCount;

    // Dynamic reward percentage generated following the locked deposit nominal amount
    let minRate = 0.005; // 0.5%
    let maxRate = 0.010; // 1.0%

    if (deposit.amount >= 50000000) {
      minRate = 0.025; // 2.5%
      maxRate = 0.035; // 3.5%
    } else if (deposit.amount >= 20000000) {
      minRate = 0.020; // 2.0%
      maxRate = 0.030; // 3.0%
    } else if (deposit.amount >= 5000000) {
      minRate = 0.015; // 1.5%
      maxRate = 0.025; // 2.5%
    } else if (deposit.amount >= 2500000) {
      minRate = 0.012; // 1.2%
      maxRate = 0.020; // 2.0%
    } else if (deposit.amount >= 1000000) {
      minRate = 0.008; // 0.8%
      maxRate = 0.015; // 1.5%
    }

    const randomDailyRate = Math.random() * (maxRate - minRate) + minRate;
    const totalExpectedDailyPrize = Math.round(deposit.amount * randomDailyRate);
    const averageBoxPrize = Math.max(minBox, Math.round(totalExpectedDailyPrize / boxCount));

    let hasAnyJackpot = false;
    let totalPrizeAmount = 0;
    const openedBoxes: Array<{
      boxNumber: number;
      prize: number;
      isJackpot: boolean;
      boxType: string;
      boxTier: 'BRONZE' | 'SILVER' | 'PLATINUM' | 'GOLD' | 'DIAMOND' | 'SULTAN';
    }> = [];

    // Check Force Jackpot (Owner override on user or deposit with custom nominal authorization)
    const targeted = targetedJackpotMap.get(userId);
    const shouldForce = Boolean(user.forceJackpotNext || deposit.forceJackpot || targeted);
    const forcedPrizeNominal = targeted?.nominal || (user.forceJackpotNext || deposit.forceJackpot ? jackpotAmount : null);

    if (user.forceJackpotNext) {
      await db.update(users).set({ forceJackpotNext: false }).where(eq(users.id, userId));
    }
    if (deposit.forceJackpot) {
      await db.update(deposits).set({ forceJackpot: false }).where(eq(deposits.id, deposit.id));
    }
    if (targeted) {
      targetedJackpotMap.delete(userId);
    }

    // Roll prizes for each box based on tier boxCount
    for (let i = 1; i <= boxCount; i++) {
      let boxJackpot = false;
      let boxPrize = 0;

      if (shouldForce && i === 1) {
        boxJackpot = true;
        boxPrize = forcedPrizeNominal || jackpotAmount;
      } else {
        // Natural chance: 1 in jackpotChance
        const roll = Math.floor(Math.random() * jackpotChance) + 1;
        if (roll === 1) {
          boxJackpot = true;
          const minJackpot = 100;
          const maxJackpot = Math.max(minJackpot, jackpotAmount);
          const rollTier = Math.random();

          if (rollTier > 0.85) {
            const tierMin = Math.min(10000000, maxJackpot);
            boxPrize = Math.floor(Math.random() * (maxJackpot - tierMin + 1)) + tierMin;
          } else if (rollTier > 0.45) {
            const tierMax = Math.min(10000000, maxJackpot);
            const tierMin = Math.min(1000000, tierMax);
            boxPrize = Math.floor(Math.random() * (tierMax - tierMin + 1)) + tierMin;
          } else {
            const tierMax = Math.min(1000000, maxJackpot);
            boxPrize = Math.floor(Math.random() * (tierMax - minJackpot + 1)) + minJackpot;
          }
        } else {
          // Dynamic box prize proportional to locked nominal
          const variation = 0.75 + Math.random() * 0.5;
          boxPrize = Math.max(minBox, Math.round(averageBoxPrize * variation));
        }
      }

      if (boxJackpot) {
        hasAnyJackpot = true;
      }
      totalPrizeAmount += boxPrize;

      openedBoxes.push({
        boxNumber: i,
        prize: boxPrize,
        isJackpot: boxJackpot,
        boxType: tierInfo.boxType,
        boxTier: tierInfo.tier,
      });
    }

    // 5. Add amount to totalClaimed in Deposit
    const newTotalClaimed = deposit.totalClaimed + totalPrizeAmount;
    await db
      .update(deposits)
      .set({ totalClaimed: newTotalClaimed })
      .where(eq(deposits.id, depositId));

    // 6. Save to BlindBoxClaim
    const [claimRecord] = await db
      .insert(blindBoxClaims)
      .values({
        depositId,
        userId,
        claimDate: dateStr,
        amount: totalPrizeAmount,
        isJackpot: hasAnyJackpot,
        claimedAt: now,
      })
      .returning();

    res.json({
      message: hasAnyJackpot
        ? `🔥 GRAND SULTAN JACKPOT! Congratulations, you won a total of Rp ${totalPrizeAmount.toLocaleString('id-ID')} from ${boxCount} ${tierInfo.boxType}!`
        : `Congratulations! You opened ${boxCount} ${tierInfo.boxType} with total rewards of Rp ${totalPrizeAmount.toLocaleString('id-ID')}.`,
      claim: claimRecord,
      prizeAmount: totalPrizeAmount,
      isJackpot: hasAnyJackpot,
      totalClaimed: newTotalClaimed,
      tier: tierInfo.tier,
      tierName: tierInfo.tierName,
      boxType: tierInfo.boxType,
      boxCount: tierInfo.boxCount,
      boxes: openedBoxes,
    });
  } catch (err: any) {
    console.error('Claim error:', err);
    res.status(500).json({ error: err.message || 'Failed to claim Blind Box.' });
  }
});

/**
 * D. WITHDRAW
 * POST /api/withdraw
 */
router.post('/withdraw', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { depositId, bankName, accountNumber, accountName, cryptoNetwork, walletAddress, memo } = req.body;

    const depId = Number(depositId);
    if (isNaN(depId)) {
      return res.status(400).json({ error: 'Invalid Deposit ID.' });
    }

    const targetNetwork = cryptoNetwork || bankName || 'USDT (TRC-20)';
    const targetAddress = (walletAddress || accountNumber || '').trim();
    const targetMemo = (memo || accountName || 'Crypto Wallet').trim();

    if (!targetAddress) {
      return res.status(400).json({ error: 'Crypto wallet address (Wallet Address) is required!' });
    }

    // Fetch deposit
    const [deposit] = await db
      .select()
      .from(deposits)
      .where(and(eq(deposits.id, depId), eq(deposits.userId, userId)))
      .limit(1);

    if (!deposit) {
      return res.status(404).json({ error: 'Deposit not found.' });
    }

    const now = new Date();
    // If end date passed, treat as EXPIRED
    if (new Date(deposit.endDate) <= now && deposit.status === 'ACTIVE') {
      await db.update(deposits).set({ status: 'EXPIRED' }).where(eq(deposits.id, deposit.id));
      deposit.status = 'EXPIRED';
    }

    if (deposit.status === 'CLAIMED') {
      return res.status(400).json({ error: 'This deposit has already been withdrawn (CLAIMED)!' });
    }

    if (deposit.status !== 'EXPIRED') {
      const remainingDays = Math.ceil((new Date(deposit.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return res.status(400).json({
        error: `Deposit has not reached maturity! Approximately ${remainingDays} days remaining in lock period. Current status: ${deposit.status}.`,
      });
    }

    // Total = amount deposit + totalClaimed
    const totalPayout = deposit.amount + deposit.totalClaimed;

    // Update deposit status to CLAIMED
    await db.update(deposits).set({ status: 'CLAIMED' }).where(eq(deposits.id, deposit.id));

    // Update user balance
    const [updatedUser] = await db
      .update(users)
      .set({ balance: sql`${users.balance} + ${totalPayout}` })
      .where(eq(users.id, userId))
      .returning();

    // Insert withdrawal record
    const [withdrawalRecord] = await db
      .insert(withdrawals)
      .values({
        userId,
        depositId: deposit.id,
        amount: totalPayout,
        bankName: targetNetwork,
        accountNumber: targetAddress,
        accountName: targetMemo,
        status: 'COMPLETED',
      })
      .returning();

    const usdtEst = (totalPayout / 16000).toFixed(2);
    res.json({
      message: `Crypto Withdrawal Successful! Total funds of Rp ${totalPayout.toLocaleString('id-ID')} (≈ ${usdtEst} USDT) have been processed for transfer to ${targetNetwork} wallet (${targetAddress.slice(0, 8)}...${targetAddress.slice(-6)}).`,
      payout: totalPayout,
      usdtEstimate: usdtEst,
      depositAmount: deposit.amount,
      totalClaimed: deposit.totalClaimed,
      newBalance: updatedUser.balance,
      withdrawal: withdrawalRecord,
    });
  } catch (err: any) {
    console.error('Withdraw error:', err);
    res.status(500).json({ error: err.message || 'Failed to process withdrawal.' });
  }
});

// ==========================================
// 3. ADMIN & OWNER PANEL CONTROLS
// ==========================================

// Get Admin Statistics
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const allUsers = await db.select().from(users);
    const allDeps = await db.select().from(deposits);
    const allClaims = await db.select().from(blindBoxClaims);
    const allWds = await db.select().from(withdrawals);

    const totalDepositAmount = allDeps.reduce((sum, d) => sum + d.amount, 0);
    const totalPrizeDistributed = allClaims.reduce((sum, c) => sum + c.amount, 0);
    const totalJackpots = allClaims.filter((c) => c.isJackpot).length;
    const activeDepositsCount = allDeps.filter((d) => d.status === 'ACTIVE').length;

    res.json({
      totalUsers: allUsers.length,
      totalDepositsCount: allDeps.length,
      activeDepositsCount,
      totalDepositAmount,
      totalPrizeDistributed,
      totalJackpots,
      totalWithdrawalsCount: allWds.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load admin statistics.' });
  }
});

// Get All Deposits for Admin (with 3-group lock duration & custom jackpot nominal info)
router.get('/admin/deposits', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const depositsList = await db
      .select({
        id: deposits.id,
        depositCode: deposits.depositCode,
        userId: deposits.userId,
        username: users.username,
        email: users.email,
        amount: deposits.amount,
        durationDays: deposits.durationDays,
        startDate: deposits.startDate,
        endDate: deposits.endDate,
        status: deposits.status,
        totalClaimed: deposits.totalClaimed,
        forceJackpot: deposits.forceJackpot,
        userForceJackpot: users.forceJackpotNext,
        isBlacklisted: users.isBlacklisted,
        createdAt: deposits.createdAt,
      })
      .from(deposits)
      .innerJoin(users, eq(deposits.userId, users.id))
      .orderBy(desc(deposits.createdAt));

    const enrichedDeposits = depositsList.map((dep) => {
      const target = targetedJackpotMap.get(dep.userId);
      const isForced = Boolean(dep.forceJackpot || dep.userForceJackpot || target);
      return {
        ...dep,
        forceJackpot: isForced,
        targetJackpotNominal: target ? target.nominal : (isForced ? 50000000 : null),
      };
    });

    res.json(enrichedDeposits);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load deposit list.' });
  }
});

// Get All Users for Admin (to select specific users for jackpot authorization)
router.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        cuid: users.cuid,
        username: users.username,
        email: users.email,
        balance: users.balance,
        role: users.role,
        isBlacklisted: users.isBlacklisted,
        forceJackpotNext: users.forceJackpotNext,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    const enriched = allUsers.map((u) => {
      const target = targetedJackpotMap.get(u.id);
      return {
        ...u,
        targetJackpotNominal: target ? target.nominal : (u.forceJackpotNext ? 50000000 : null),
      };
    });

    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load user data.' });
  }
});

// Get Currently Targeted Jackpot List
router.get('/admin/target-jackpots', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const targets = Array.from(targetedJackpotMap.values());
    res.json(targets);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load jackpot targets.' });
  }
});

// Get & Update Game Settings
router.get('/admin/settings', async (req, res) => {
  try {
    const [settings] = await db.select().from(gameSettings).where(eq(gameSettings.id, 1)).limit(1);
    res.json(
      settings || {
        jackpotAmount: 50000000,
        jackpotChance: 100,
        minBox: 100,
        maxBox: 1000,
      }
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load game settings.' });
  }
});

router.put('/admin/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { jackpotAmount, jackpotChance, minBox, maxBox } = req.body;

    const [updated] = await db
      .update(gameSettings)
      .set({
        jackpotAmount: Number(jackpotAmount) || 50000000,
        jackpotChance: Number(jackpotChance) || 100,
        minBox: Number(minBox) || 100,
        maxBox: Number(maxBox) || 1000,
        updatedAt: new Date(),
      })
      .where(eq(gameSettings.id, 1))
      .returning();

    res.json({
      message: 'Game settings updated successfully by Owner!',
      settings: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update game settings.' });
  }
});

// Force Jackpot: Owner can configure jackpot authorization
router.post('/admin/force-jackpot', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, depositId, enable, nominal } = req.body;

    if (!userId && !depositId) {
      return res.status(400).json({ error: 'userId or depositId must be provided!' });
    }

    const state = enable !== false; // default true
    const uid = userId ? Number(userId) : undefined;
    const depId = depositId ? Number(depositId) : undefined;
    const customNominal = Number(nominal) > 0 ? Number(nominal) : 50000000;

    if (state) {
      if (uid) {
        await db.update(users).set({ forceJackpotNext: true }).where(eq(users.id, uid));
        targetedJackpotMap.set(uid, {
          userId: uid,
          depositId: depId,
          nominal: customNominal,
          setAt: new Date(),
        });
      }

      if (depId) {
        await db.update(deposits).set({ forceJackpot: true }).where(eq(deposits.id, depId));
        if (!uid) {
          const [d] = await db.select().from(deposits).where(eq(deposits.id, depId)).limit(1);
          if (d) {
            targetedJackpotMap.set(d.userId, {
              userId: d.userId,
              depositId: depId,
              nominal: customNominal,
              setAt: new Date(),
            });
          }
        }
      }

      res.json({
        message: `🔥 Authorization Successful! User #${uid || 'Deposit #' + depId} is authorized to receive a Jackpot of Rp ${customNominal.toLocaleString('id-ID')} on their next claim!`,
        nominal: customNominal,
        forceJackpot: true,
        userId: uid,
        depositId: depId,
      });
    } else {
      if (uid) {
        await db.update(users).set({ forceJackpotNext: false }).where(eq(users.id, uid));
        targetedJackpotMap.delete(uid);
      }
      if (depId) {
        await db.update(deposits).set({ forceJackpot: false }).where(eq(deposits.id, depId));
        for (const [k, v] of targetedJackpotMap.entries()) {
          if (v.depositId === depId) {
            targetedJackpotMap.delete(k);
          }
        }
      }

      res.json({
        message: `Jackpot authorization for User #${uid || 'Deposit #' + depId} disabled.`,
        forceJackpot: false,
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to configure jackpot authorization.' });
  }
});

// Blacklist: Admin can block user from claiming
router.post('/admin/blacklist', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, isBlacklisted } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required!' });
    }

    const [updated] = await db
      .update(users)
      .set({ isBlacklisted: Boolean(isBlacklisted) })
      .where(eq(users.id, Number(userId)))
      .returning();

    res.json({
      message: isBlacklisted
        ? `User @${updated.username} was added to BLACKLIST (Game access blocked).`
        : `Blacklist status revoked for user @${updated.username}.`,
      user: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update user blacklist status.' });
  }
});

export default router;

