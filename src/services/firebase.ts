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
} from 'drizzle-orm/pg-core';

/* =========================================================
   USERS
   Replacement for Firestore: users
   ========================================================= */

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),

    // Firebase UID / existing application UID
    uid: text('uid').unique(),

    cuid: text('cuid').notNull().unique(),

    username: text('username').notNull().unique(),

    email: text('email').notNull().unique(),

    password: text('password').notNull(),

    displayName: text('display_name'),

    photoURL: text('photo_url'),

    streamerHandle: text('streamer_handle'),

    bio: text('bio'),

    referralCode: text('referral_code').unique(),

    referredBy: text('referred_by'),

    referralCount: integer('referral_count').default(0).notNull(),

    /* Wallet */
    balance: integer('balance').default(100000).notNull(),

    saldo: integer('saldo').default(15000).notNull(),

    walletBalance: integer('wallet_balance').default(15000).notNull(),

    lockedSaldo: integer('locked_saldo').default(0).notNull(),

    /* Affiliate */
    affiliateEarnings: integer('affiliate_earnings').default(0).notNull(),

    affiliateWithdrawn: integer('affiliate_withdrawn').default(0).notNull(),

    /* Subscription */
    isSubscribed: boolean('is_subscribed').default(true).notNull(),

    subscriptionPlan: text('subscription_plan')
      .default('Akses Bebas Gratis (Permanen)')
      .notNull(),

    subscriptionExpiresAt: text('subscription_expires_at'),

    isLifetime: boolean('is_lifetime').default(true).notNull(),

    subscribedAt: timestamp('subscribed_at'),

    /* Account */
    role: text('role').default('USER').notNull(),

    isBlacklisted: boolean('is_blacklisted').default(false).notNull(),

    isBanned: boolean('is_banned').default(false).notNull(),

    bannedReason: text('banned_reason'),

    /* Jackpot */
    forceJackpotNext: boolean('force_jackpot_next')
      .default(false)
      .notNull(),

    /* Admin balance modification */
    lastSaldoModifiedBy: text('last_saldo_modified_by'),

    lastSaldoModificationReason: text(
      'last_saldo_modification_reason'
    ),

    createdAt: timestamp('created_at').defaultNow().notNull(),

    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),

    uidIdx: index('users_uid_idx').on(table.uid),

    referralCodeIdx: index('users_referral_code_idx').on(
      table.referralCode
    ),

    referredByIdx: index('users_referred_by_idx').on(
      table.referredBy
    ),

    roleIdx: index('users_role_idx').on(table.role),

    bannedIdx: index('users_banned_idx').on(table.isBanned),
  })
);


/* =========================================================
   DEPOSITS
   Existing PostgreSQL table
   ========================================================= */

export const deposits = pgTable(
  'deposits',
  {
    id: serial('id').primaryKey(),

    depositCode: text('deposit_code').notNull().unique(),

    userId: integer('user_id')
      .references(() => users.id, {
        onDelete: 'cascade',
      })
      .notNull(),

    amount: integer('amount').default(50000).notNull(),

    durationDays: integer('duration_days').notNull(),

    startDate: timestamp('start_date').defaultNow().notNull(),

    endDate: timestamp('end_date').notNull(),

    status: text('status').default('ACTIVE').notNull(),

    totalClaimed: integer('total_claimed').default(0).notNull(),

    forceJackpot: boolean('force_jackpot')
      .default(false)
      .notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('deposits_user_idx').on(table.userId),

    statusIdx: index('deposits_status_idx').on(table.status),
  })
);


/* =========================================================
   BLIND BOX CLAIMS
   Existing PostgreSQL table
   ========================================================= */

export const blindBoxClaims = pgTable(
  'blind_box_claims',
  {
    id: serial('id').primaryKey(),

    depositId: integer('deposit_id')
      .references(() => deposits.id, {
        onDelete: 'cascade',
      })
      .notNull(),

    userId: integer('user_id')
      .references(() => users.id, {
        onDelete: 'cascade',
      })
      .notNull(),

    claimDate: text('claim_date').notNull(),

    amount: integer('amount').notNull(),

    isJackpot: boolean('is_jackpot')
      .default(false)
      .notNull(),

    claimedAt: timestamp('claimed_at')
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    depositDateUnique: uniqueIndex(
      'deposit_date_unique_idx'
    ).on(table.depositId, table.claimDate),

    userIdx: index('claims_user_idx').on(table.userId),
  })
);


/* =========================================================
   GAME SETTINGS
   Existing PostgreSQL table
   ========================================================= */

export const gameSettings = pgTable(
  'game_settings',
  {
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

    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull(),
  }
);


/* =========================================================
   WITHDRAWALS
   Existing PostgreSQL table
   ========================================================= */

export const withdrawals = pgTable(
  'withdrawals',
  {
    id: serial('id').primaryKey(),

    userId: integer('user_id')
      .references(() => users.id, {
        onDelete: 'cascade',
      })
      .notNull(),

    depositId: integer('deposit_id')
      .references(() => deposits.id, {
        onDelete: 'cascade',
      }),

    amount: integer('amount').notNull(),

    bankName: text('bank_name')
      .default('BCA')
      .notNull(),

    accountNumber: text('account_number').notNull(),

    accountName: text('account_name').notNull(),

    status: text('status')
      .default('COMPLETED')
      .notNull(),

    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdx: index('withdrawals_user_idx').on(table.userId),

    statusIdx: index('withdrawals_status_idx').on(table.status),
  })
);


/* =========================================================
   VIP HOSTS
   Firestore: vip_hosts
   ========================================================= */

export const vipHosts = pgTable(
  'vip_hosts',
  {
    id: serial('id').primaryKey(),

    email: text('email').notNull().unique(),

    addedBy: text('added_by'),

    addedAt: timestamp('added_at').defaultNow().notNull(),

    role: text('role').default('admin').notNull(),

    plan: text('plan'),

    planType: text('plan_type')
      .default('lifetime')
      .notNull(),

    expiresAt: text('expires_at'),

    notes: text('notes'),
  },
  (table) => ({
    emailIdx: index('vip_hosts_email_idx').on(table.email),
  })
);


/* =========================================================
   BANNED USERS
   Firestore: banned_users
   ========================================================= */

export const bannedUsers = pgTable(
  'banned_users',
  {
    id: serial('id').primaryKey(),

    email: text('email').notNull().unique(),

    reason: text('reason'),

    bannedBy: text('banned_by'),

    bannedAt: timestamp('banned_at')
      .defaultNow()
      .notNull(),
  }
);


/* =========================================================
   ADMINS
   Firestore: admins
   ========================================================= */

export const admins = pgTable(
  'admins',
  {
    id: serial('id').primaryKey(),

    email: text('email').notNull().unique(),

    displayName: text('display_name'),

    role: text('role')
      .default('admin')
      .notNull(),

    addedBy: text('added_by'),

    addedAt: timestamp('added_at')
      .defaultNow()
      .notNull(),

    notes: text('notes'),
  }
);


/* =========================================================
   SUBSCRIPTION ORDERS
   Firestore: subscription_orders

   This is also used by:
   - deposits
   - withdrawals
   - transfers
   - bonuses
   - jackpot
   - NOWPayments
   ========================================================= */

export const subscriptionOrders = pgTable(
  'subscription_orders',
  {
    id: serial('id').primaryKey(),

    orderId: text('order_id').notNull().unique(),

    userId: text('user_id'),

    userEmail: text('user_email'),

    userName: text('user_name'),

    nama: text('nama'),

    planId: text('plan_id'),

    planName: text('plan_name'),

    price: integer('price').default(0).notNull(),

    jumlah: integer('jumlah').default(0).notNull(),

    currency: text('currency').default('IDR'),

    status: text('status')
      .default('pending')
      .notNull(),

    paymentMethod: text('payment_method'),

    type: text('type'),

    durationDays: integer('duration_days'),

    txHash: text('tx_hash'),

    approvedBy: text('approved_by'),

    approvedAt: timestamp('approved_at'),

    rejectedBy: text('rejected_by'),

    rejectedAt: timestamp('rejected_at'),

    rejectionReason: text('rejection_reason'),

    feeAmount: integer('fee_amount').default(0),

    netPayoutAmount: integer('net_payout_amount').default(0),

    /* Bank / crypto payout data */
    bankDetails: jsonb('bank_details'),

    /* NOWPayments */
    nowpaymentsPaymentId: text(
      'nowpayments_payment_id'
    ),

    payAddress: text('pay_address'),

    payAmount: text('pay_amount'),

    payCurrency: text('pay_currency'),

    network: text('network'),

    /* Additional information */
    notes: text('notes'),

    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),

    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdx: index('orders_user_idx').on(table.userId),

    statusIdx: index('orders_status_idx').on(table.status),

    typeIdx: index('orders_type_idx').on(table.type),

    paymentIdx: index('orders_payment_idx').on(
      table.nowpaymentsPaymentId
    ),

    createdIdx: index('orders_created_idx').on(
      table.createdAt
    ),
  })
);


/* =========================================================
   STREAMING SESSIONS
   Firestore: streaming_sessions
   ========================================================= */

export const streamingSessions = pgTable(
  'streaming_sessions',
  {
    id: serial('id').primaryKey(),

    sessionId: text('session_id').notNull().unique(),

    userId: text('user_id').notNull(),

    userEmail: text('user_email'),

    userName: text('user_name'),

    startedAt: timestamp('started_at'),

    endedAt: timestamp('ended_at'),

    duration: integer('duration'),

    status: text('status'),

    viewerCount: integer('viewer_count'),

    peakViewers: integer('peak_viewers'),

    earnings: integer('earnings'),

    title: text('title'),

    notes: text('notes'),

    metadata: jsonb('metadata'),

    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdx: index('stream_sessions_user_idx').on(
      table.userId
    ),

    startedIdx: index('stream_sessions_started_idx').on(
      table.startedAt
    ),
  })
);


/* =========================================================
   REFERRALS
   Firestore: referrals
   ========================================================= */

export const referrals = pgTable(
  'referrals',
  {
    id: serial('id').primaryKey(),

    referrerUid: text('referrer_uid').notNull(),

    referrerEmail: text('referrer_email'),

    referredUid: text('referred_uid').notNull(),

    referredEmail: text('referred_email'),

    referredName: text('referred_name'),

    rewardAmount: integer('reward_amount')
      .default(5000)
      .notNull(),

    status: text('status')
      .default('active')
      .notNull(),

    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    referrerIdx: index('referrals_referrer_idx').on(
      table.referrerUid
    ),

    referredIdx: index('referrals_referred_idx').on(
      table.referredUid
    ),
  })
);


/* =========================================================
   AFFILIATE WITHDRAWALS
   Firestore: affiliate_withdrawals
   ========================================================= */

export const affiliateWithdrawals = pgTable(
  'affiliate_withdrawals',
  {
    id: serial('id').primaryKey(),

    withdrawalId: text('withdrawal_id')
      .notNull()
      .unique(),

    userId: text('user_id').notNull(),

    userEmail: text('user_email'),

    userName: text('user_name'),

    amount: integer('amount').notNull(),

    feeAmount: integer('fee_amount').default(0),

    netPayoutAmount: integer('net_payout_amount').default(0),

    bankName: text('bank_name'),

    accountNumber: text('account_number'),

    accountName: text('account_name'),

    status: text('status')
      .default('pending')
      .notNull(),

    approvedBy: text('approved_by'),

    approvedAt: timestamp('approved_at'),

    payoutTxHash: text('payout_tx_hash'),

    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdx: index('affiliate_withdrawals_user_idx').on(
      table.userId
    ),

    statusIdx: index('affiliate_withdrawals_status_idx').on(
      table.status
    ),
  })
);


/* =========================================================
   USER ACTIVITIES
   Firestore: user_activities
   ========================================================= */

export const userActivities = pgTable(
  'user_activities',
  {
    id: serial('id').primaryKey(),

    type: text('type').notNull(),

    userId: text('user_id'),

    userEmail: text('user_email'),

    userName: text('user_name'),

    title: text('title'),

    amount: integer('amount'),

    details: text('details'),

    metadata: jsonb('metadata'),

    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdx: index('activities_user_idx').on(
      table.userId
    ),

    typeIdx: index('activities_type_idx').on(
      table.type
    ),

    createdIdx: index('activities_created_idx').on(
      table.createdAt
    ),
  })
);


/* =========================================================
   SYSTEM SETTINGS
   Firestore: system_settings
   ========================================================= */

export const systemSettings = pgTable(
  'system_settings',
  {
    id: serial('id').primaryKey(),

    settingKey: text('setting_key')
      .notNull()
      .unique(),

    poolAmount: integer('pool_amount')
      .default(50000000),

    winChance: integer('win_chance')
      .default(100),

    minBet: integer('min_bet')
      .default(10000),

    forceNextUser: text('force_next_user'),

    forceNextNominal: integer(
      'force_next_nominal'
    ).default(0),

    lastWinner: jsonb('last_winner'),

    value: jsonb('value'),

    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull(),

    updatedBy: text('updated_by'),
  }
);


/* =========================================================
   JACKPOT HISTORY
   Firestore: jackpot_history
   ========================================================= */

export const jackpotHistory = pgTable(
  'jackpot_history',
  {
    id: serial('id').primaryKey(),

    userId: text('user_id').notNull(),

    userName: text('user_name'),

    userEmail: text('user_email'),

    amount: integer('amount').notNull(),

    gameType: text('game_type'),

    wonAt: timestamp('won_at')
      .defaultNow()
      .notNull(),

    notes: text('notes'),
  },
  (table) => ({
    userIdx: index('jackpot_history_user_idx').on(
      table.userId
    ),

    wonIdx: index('jackpot_history_won_idx').on(
      table.wonAt
    ),
  })
);


/* =========================================================
   RELATIONS
   ========================================================= */

export const usersRelations = relations(
  users,
  ({ many }) => ({
    deposits: many(deposits),

    claims: many(blindBoxClaims),

    withdrawals: many(withdrawals),
  })
);


export const depositsRelations = relations(
  deposits,
  ({ one, many }) => ({
    user: one(users, {
      fields: [deposits.userId],
      references: [users.id],
    }),

    claims: many(blindBoxClaims),
  })
);


export const claimsRelations = relations(
  blindBoxClaims,
  ({ one }) => ({
    deposit: one(deposits, {
      fields: [blindBoxClaims.depositId],
      references: [deposits.id],
    }),

    user: one(users, {
      fields: [blindBoxClaims.userId],
      references: [users.id],
    }),
  })
);


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
