import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  index,
  numeric,
  unique,
} from 'drizzle-orm/pg-core';

/* =========================================================
   USERS
   ========================================================= */

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),

    // ID internal aplikasi
    cuid: text('cuid').notNull().unique(),

    // Firebase UID lama / identifier eksternal
    // dibuat nullable agar migrasi data lama lebih aman
    uid: text('uid').unique(),

    username: text('username').notNull().unique(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),

    displayName: text('display_name').default('').notNull(),
    photoURL: text('photo_url').default('').notNull(),

    streamerHandle: text('streamer_handle'),
    bio: text('bio'),

    referralCode: text('referral_code').unique(),
    referredBy: text('referred_by'),
    referralCount: integer('referral_count').default(0).notNull(),

    // Saldo
    balance: integer('balance').default(100000).notNull(),
    saldo: integer('saldo').default(0).notNull(),
    walletBalance: integer('wallet_balance').default(0).notNull(),
    lockedSaldo: integer('locked_saldo').default(0).notNull(),

    affiliateEarnings: integer('affiliate_earnings').default(0).notNull(),
    affiliateWithdrawn: integer('affiliate_withdrawn').default(0).notNull(),

    // Membership / subscription
    isSubscribed: boolean('is_subscribed').default(false).notNull(),
    subscriptionPlan: text('subscription_plan').default('free').notNull(),
    subscriptionExpiresAt: timestamp('subscription_expires_at'),
    isLifetime: boolean('is_lifetime').default(false).notNull(),
    subscribedAt: timestamp('subscribed_at'),

    // Role
    role: text('role').default('member').notNull(),

    // Status akun
    isBlacklisted: boolean('is_blacklisted').default(false).notNull(),
    isBanned: boolean('is_banned').default(false).notNull(),
    bannedReason: text('banned_reason'),

    // Jackpot
    forceJackpotNext: boolean('force_jackpot_next').default(false).notNull(),
    targetJackpotNominal: integer('target_jackpot_nominal'),

    // Audit saldo
    lastSaldoModifiedBy: text('last_saldo_modified_by'),
    lastSaldoModificationReason: text('last_saldo_modification_reason'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    uidIdx: index('users_uid_idx').on(table.uid),
    referralCodeIdx: index('users_referral_code_idx').on(table.referralCode),
  })
);


/* =========================================================
   DEPOSITS
   ========================================================= */

/**
 * One-time registration bonus.
 * Base value: IDR 15,000.
 */
export const registrationBonuses = pgTable(
  'registration_bonuses',
  {
    id: serial('id').primaryKey(),

    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    baseAmountIdr: integer('base_amount_idr')
      .notNull()
      .default(15000),

    currency: text('currency')
      .notNull()
      .default('IDR'),

    amount: integer('amount')
      .notNull()
      .default(15000),

    exchangeRate: numeric('exchange_rate', {
      precision: 20,
      scale: 8,
    })
      .notNull()
      .default('1'),

    createdAt: timestamp('created_at')
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdUnique: unique('registration_bonuses_user_id_unique')
      .on(table.userId),
  }),
);
export const deposits = pgTable(
  'deposits',
  {
    id: serial('id').primaryKey(),

    depositCode: text('deposit_code').notNull().unique(),

    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    amount: integer('amount').default(50000).notNull(),

    durationDays: integer('duration_days').notNull(),

    startDate: timestamp('start_date').defaultNow().notNull(),
    endDate: timestamp('end_date').notNull(),

    status: text('status').default('ACTIVE').notNull(),

    totalClaimed: integer('total_claimed').default(0).notNull(),

    forceJackpot: boolean('force_jackpot').default(false).notNull(),
    targetJackpotNominal: integer('target_jackpot_nominal'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('deposits_user_idx').on(table.userId),
    statusIdx: index('deposits_status_idx').on(table.status),
  })
);


/* =========================================================
   BLIND BOX CLAIMS
   ========================================================= */

export const blindBoxClaims = pgTable(
  'blind_box_claims',
  {
    id: serial('id').primaryKey(),

    depositId: integer('deposit_id')
      .references(() => deposits.id, { onDelete: 'cascade' })
      .notNull(),

    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    claimDate: text('claim_date').notNull(),

    amount: integer('amount').notNull(),

    isJackpot: boolean('is_jackpot').default(false).notNull(),

    claimedAt: timestamp('claimed_at').defaultNow().notNull(),
  },
  (table) => ({
    depositDateIdx: uniqueIndex('deposit_date_unique_idx').on(
      table.depositId,
      table.claimDate
    ),
  })
);


/* =========================================================
   GAME SETTINGS
   ========================================================= */

export const gameSettings = pgTable('game_settings', {
  id: serial('id').primaryKey(),

  jackpotAmount: integer('jackpot_amount')
    .default(50000000)
    .notNull(),

  jackpotChance: integer('jackpot_chance')
    .default(100)
    .notNull(),

  minBox: integer('min_box')
    .default(100)
    .notNull(),

  maxBox: integer('max_box')
    .default(1000)
    .notNull(),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


/* =========================================================
   WITHDRAWALS
   ========================================================= */

export const withdrawals = pgTable(
  'withdrawals',
  {
    id: serial('id').primaryKey(),

    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    depositId: integer('deposit_id')
      .references(() => deposits.id, { onDelete: 'cascade' }),

    amount: integer('amount').notNull(),

    bankName: text('bank_name').default('BCA').notNull(),
    accountNumber: text('account_number').notNull(),
    accountName: text('account_name').notNull(),

    status: text('status').default('COMPLETED').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('withdrawals_user_idx').on(table.userId),
    statusIdx: index('withdrawals_status_idx').on(table.status),
  })
);


/* =========================================================
   VIP HOSTS
   ========================================================= */

export const vipHosts = pgTable(
  'vip_hosts',
  {
    id: serial('id').primaryKey(),

    email: text('email').notNull().unique(),

    addedBy: text('added_by').notNull(),
    addedAt: timestamp('added_at').defaultNow().notNull(),

    role: text('role').default('host').notNull(),

    plan: text('plan').default('free').notNull(),

    planType: text('plan_type'),

    expiresAt: timestamp('expires_at'),

    notes: text('notes'),
  },
  (table) => ({
    emailIdx: index('vip_hosts_email_idx').on(table.email),
  })
);


/* =========================================================
   BANNED USERS
   ========================================================= */

export const bannedUsers = pgTable(
  'banned_users',
  {
    id: serial('id').primaryKey(),

    email: text('email').notNull().unique(),

    reason: text('reason'),

    bannedBy: text('banned_by').notNull(),

    bannedAt: timestamp('banned_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index('banned_users_email_idx').on(table.email),
  })
);


/* =========================================================
   ADMIN ACCOUNTS
   ========================================================= */

export const admins = pgTable(
  'admins',
  {
    id: serial('id').primaryKey(),

    email: text('email').notNull().unique(),

    displayName: text('display_name'),

    role: text('role').default('admin').notNull(),

    addedBy: text('added_by').notNull(),

    addedAt: timestamp('added_at').defaultNow().notNull(),

    notes: text('notes'),
  },
  (table) => ({
    emailIdx: index('admins_email_idx').on(table.email),
  })
);


/* =========================================================
   SUBSCRIPTION / TRANSACTION ORDERS
   ========================================================= */

export const subscriptionOrders = pgTable(
  'subscription_orders',
  {
    id: serial('id').primaryKey(),

    orderId: text('order_id').notNull().unique(),

    userId: text('user_id').notNull(),
    userEmail: text('user_email').notNull(),

    nama: text('nama'),

    jumlah: integer('jumlah'),

    planId: text('plan_id'),
    planName: text('plan_name').notNull(),

    price: integer('price').notNull(),

    currency: text('currency').default('IDR').notNull(),

    status: text('status').default('pending').notNull(),

    paymentMethod: text('payment_method').notNull(),

    durationDays: integer('duration_days'),

    type: text('type'),

    txHash: text('tx_hash'),

    feeAmount: integer('fee_amount'),
    netPayoutAmount: integer('net_payout_amount'),

    approvedBy: text('approved_by'),
    approvedAt: timestamp('approved_at'),

    rejectedBy: text('rejected_by'),
    rejectedAt: timestamp('rejected_at'),

    rejectionReason: text('rejection_reason'),

    userName: text('user_name'),

    bankDetails: jsonb('bank_details'),

    notes: text('notes'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('subscription_orders_user_idx').on(table.userId),
    statusIdx: index('subscription_orders_status_idx').on(table.status),
    typeIdx: index('subscription_orders_type_idx').on(table.type),
  })
);


/* =========================================================
   STREAMING SESSIONS
   ========================================================= */

export const streamingSessions = pgTable(
  'streaming_sessions',
  {
    id: serial('id').primaryKey(),

    sessionId: text('session_id').notNull().unique(),

    userId: text('user_id').notNull(),
    userEmail: text('user_email').notNull(),

    streamTitle: text('stream_title').notNull(),

    gameType: text('game_type').notNull(),

    totalRounds: integer('total_rounds').default(0).notNull(),

    totalPrizeDistributed: integer('total_prize_distributed')
      .default(0)
      .notNull(),

    topWinner: text('top_winner'),

    durationMinutes: integer('duration_minutes').default(0).notNull(),

    startedAt: timestamp('started_at').notNull(),

    endedAt: timestamp('ended_at'),

    notes: text('notes'),
  },
  (table) => ({
    userIdx: index('streaming_sessions_user_idx').on(table.userId),
    startedAtIdx: index('streaming_sessions_started_at_idx').on(
      table.startedAt
    ),
  })
);


/* =========================================================
   REFERRALS
   ========================================================= */

export const referrals = pgTable(
  'referrals',
  {
    id: serial('id').primaryKey(),

    referrerUid: text('referrer_uid').notNull(),
    referrerEmail: text('referrer_email').notNull(),

    referredUid: text('referred_uid').notNull(),
    referredEmail: text('referred_email').notNull(),
    referredName: text('referred_name').notNull(),

    rewardAmount: integer('reward_amount').default(0).notNull(),

    status: text('status').default('pending').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    referrerIdx: index('referrals_referrer_idx').on(table.referrerUid),
    referredIdx: index('referrals_referred_idx').on(table.referredUid),
  })
);


/* =========================================================
   AFFILIATE WITHDRAWALS
   ========================================================= */

export const affiliateWithdrawals = pgTable(
  'affiliate_withdrawals',
  {
    id: serial('id').primaryKey(),

    withdrawalId: text('withdrawal_id').notNull().unique(),

    userId: text('user_id').notNull(),
    userEmail: text('user_email').notNull(),
    userName: text('user_name').notNull(),

    amount: integer('amount').notNull(),

    bankName: text('bank_name').notNull(),
    accountNumber: text('account_number').notNull(),
    accountName: text('account_name').notNull(),

    status: text('status').default('pending').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('affiliate_withdrawals_user_idx').on(table.userId),
    statusIdx: index('affiliate_withdrawals_status_idx').on(table.status),
  })
);


/* =========================================================
   USER ACTIVITIES
   ========================================================= */

export const userActivities = pgTable(
  'user_activities',
  {
    id: serial('id').primaryKey(),

    activityId: text('activity_id').unique(),

    type: text('type').notNull(),

    userId: text('user_id').notNull(),

    userEmail: text('user_email').notNull(),

    userName: text('user_name').notNull(),

    title: text('title').notNull(),

    amount: integer('amount'),

    details: text('details'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('user_activities_user_idx').on(table.userId),
    typeIdx: index('user_activities_type_idx').on(table.type),
    createdAtIdx: index('user_activities_created_at_idx').on(
      table.createdAt
    ),
  })
);


/* =========================================================
   SYSTEM SETTINGS
   ========================================================= */

export const systemSettings = pgTable(
  'system_settings',
  {
    id: serial('id').primaryKey(),

    settingKey: text('setting_key').notNull().unique(),

    settingValue: jsonb('setting_value'),

    updatedAt: timestamp('updated_at').defaultNow().notNull(),

    updatedBy: text('updated_by'),
  },
  (table) => ({
    keyIdx: index('system_settings_key_idx').on(table.settingKey),
  })
);


/* =========================================================
   JACKPOT HISTORY
   ========================================================= */

export const jackpotHistory = pgTable(
  'jackpot_history',
  {
    id: serial('id').primaryKey(),

    userId: text('user_id').notNull(),

    userName: text('user_name').notNull(),

    userEmail: text('user_email').notNull(),

    amount: integer('amount').notNull(),

    gameType: text('game_type').notNull(),

    wonAt: timestamp('won_at').defaultNow().notNull(),

    notes: text('notes'),
  },
  (table) => ({
    userIdx: index('jackpot_history_user_idx').on(table.userId),
    wonAtIdx: index('jackpot_history_won_at_idx').on(table.wonAt),
  })
);


/* =========================================================
   RELATIONS
   ========================================================= */

export const usersRelations = relations(users, ({ many }) => ({
  deposits: many(deposits),
  claims: many(blindBoxClaims),
  withdrawals: many(withdrawals),
}));


export const depositsRelations = relations(deposits, ({ one, many }) => ({
  user: one(users, {
    fields: [deposits.userId],
    references: [users.id],
  }),

  claims: many(blindBoxClaims),
}));


export const claimsRelations = relations(blindBoxClaims, ({ one }) => ({
  deposit: one(deposits, {
    fields: [blindBoxClaims.depositId],
    references: [deposits.id],
  }),

  user: one(users, {
    fields: [blindBoxClaims.userId],
    references: [users.id],
  }),
}));


export const withdrawalsRelations = relations(
  withdrawals,
  ({ one }) => ({
    user: one(users, {
      fields: [withdrawals.userId],
      references: [users.id],
    }),

    deposit: one(deposits, {
      fields: [withdrawals.depositId],
      references: [deposits.id],
    }),
  })
);


