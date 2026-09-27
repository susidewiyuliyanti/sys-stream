import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

// 1. Table: users
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  cuid: text('cuid').notNull().unique(), // string identifier
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  balance: integer('balance').default(100000).notNull(), // default saldo untuk pengujian deposit 50.000
  role: text('role').default('USER').notNull(), // 'USER' | 'ADMIN'
  isBlacklisted: boolean('is_blacklisted').default(false).notNull(),
  forceJackpotNext: boolean('force_jackpot_next').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Table: deposits
export const deposits = pgTable('deposits', {
  id: serial('id').primaryKey(),
  depositCode: text('deposit_code').notNull().unique(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: integer('amount').default(50000).notNull(), // 50000
  durationDays: integer('duration_days').notNull(), // 30, 60, 90
  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date').notNull(),
  status: text('status').default('ACTIVE').notNull(), // ACTIVE, CLAIMED, EXPIRED
  totalClaimed: integer('total_claimed').default(0).notNull(),
  forceJackpot: boolean('force_jackpot').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Table: blind_box_claims
export const blindBoxClaims = pgTable(
  'blind_box_claims',
  {
    id: serial('id').primaryKey(),
    depositId: integer('deposit_id').references(() => deposits.id, { onDelete: 'cascade' }).notNull(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    claimDate: text('claim_date').notNull(), // Format: YYYY-MM-DD (WIB)
    amount: integer('amount').notNull(), // 100 - 1000 atau 500000
    isJackpot: boolean('is_jackpot').default(false).notNull(),
    claimedAt: timestamp('claimed_at').defaultNow().notNull(),
  },
  (table) => ({
    depositDateIdx: uniqueIndex('deposit_date_unique_idx').on(table.depositId, table.claimDate),
  })
);

// 4. Table: game_settings
export const gameSettings = pgTable('game_settings', {
  id: serial('id').primaryKey(),
  jackpotAmount: integer('jackpot_amount').default(50000000).notNull(),
  jackpotChance: integer('jackpot_chance').default(100).notNull(), // 1 banding 100 (bisa diatur 50 - 1000)
  minBox: integer('min_box').default(100).notNull(),
  maxBox: integer('max_box').default(1000).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Table: withdrawal_history
export const withdrawals = pgTable('withdrawals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  depositId: integer('deposit_id').references(() => deposits.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  bankName: text('bank_name').default('BCA').notNull(),
  accountNumber: text('account_number').notNull(),
  accountName: text('account_name').notNull(),
  status: text('status').default('COMPLETED').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
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
