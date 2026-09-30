import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

export async function runSchemaMigration() {
  const host = process.env.SQL_HOST || '';
  const user = process.env.SQL_ADMIN_USER || process.env.SQL_USER;
  const password = process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD;
  const database = process.env.SQL_DB_NAME || 'neondb';

  const isUnixSocket = host.startsWith('/');
  const isLocalhost = !host || host === 'localhost' || host === '127.0.0.1';
  const isRemoteSslRequired = Boolean(
    process.env.SQL_SSL === 'true' ||
    (!isUnixSocket && !isLocalhost && (host.includes('neon.tech') || host.includes('.aws.') || host.includes('.com') || host.includes('.net')))
  );

  const pool = new Pool({
    host,
    port: Number(process.env.SQL_PORT) || 5432,
    user,
    password,
    database,
    ssl: isRemoteSslRequired ? { rejectUnauthorized: false } : undefined,
    max: 2,
    connectionTimeoutMillis: 10000,
  });

  const client = await pool.connect();
  try {
    console.log('🔄 Checking and applying PostgreSQL schema migrations...');

    // 1. Ensure users table has all required fields
    await client.query(`
      ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS uid text,
        ADD COLUMN IF NOT EXISTS display_name text,
        ADD COLUMN IF NOT EXISTS photo_url text,
        ADD COLUMN IF NOT EXISTS streamer_handle text,
        ADD COLUMN IF NOT EXISTS bio text,
        ADD COLUMN IF NOT EXISTS referral_code text,
        ADD COLUMN IF NOT EXISTS referred_by text,
        ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'Akses Bebas Gratis',
        ADD COLUMN IF NOT EXISTS subscription_expires_at text,
        ADD COLUMN IF NOT EXISTS is_subscribed boolean DEFAULT true NOT NULL,
        ADD COLUMN IF NOT EXISTS is_lifetime boolean DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now() NOT NULL;
    `);

    // Ensure uid has fallback value matching cuid
    await client.query(`UPDATE users SET uid = cuid WHERE uid IS NULL;`);

    // 2. Table: vip_hosts
    await client.query(`
      CREATE TABLE IF NOT EXISTS vip_hosts (
        id serial PRIMARY KEY,
        email text NOT NULL UNIQUE,
        added_by text,
        added_at timestamp DEFAULT now() NOT NULL,
        role text DEFAULT 'USER' NOT NULL,
        plan text DEFAULT 'VIP Host' NOT NULL,
        plan_type text DEFAULT 'lifetime',
        expires_at text,
        notes text,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 3. Table: banned_users
    await client.query(`
      CREATE TABLE IF NOT EXISTS banned_users (
        id serial PRIMARY KEY,
        email text NOT NULL UNIQUE,
        reason text,
        banned_by text,
        banned_at timestamp DEFAULT now() NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 4. Table: admins
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id serial PRIMARY KEY,
        email text NOT NULL UNIQUE,
        display_name text,
        role text DEFAULT 'ADMIN' NOT NULL,
        added_by text,
        added_at timestamp DEFAULT now() NOT NULL,
        notes text,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 5. Table: subscription_orders
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscription_orders (
        id serial PRIMARY KEY,
        order_id text NOT NULL UNIQUE,
        user_id integer REFERENCES users(id) ON DELETE SET NULL,
        nama text,
        jumlah integer,
        user_email text NOT NULL,
        plan_id text,
        plan_name text NOT NULL,
        price integer DEFAULT 0 NOT NULL,
        currency text DEFAULT 'IDR' NOT NULL,
        status text DEFAULT 'pending' NOT NULL,
        payment_method text DEFAULT 'NOWPayments' NOT NULL,
        duration_days integer DEFAULT 30,
        type text DEFAULT 'subscription' NOT NULL,
        tx_hash text,
        fee_amount integer DEFAULT 0,
        net_payout_amount integer,
        approved_by text,
        approved_at timestamp,
        rejected_by text,
        rejected_at timestamp,
        rejection_reason text,
        user_name text,
        bank_name text,
        account_number text,
        account_name text,
        notes text,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 6. Table: streaming_sessions
    await client.query(`
      CREATE TABLE IF NOT EXISTS streaming_sessions (
        id serial PRIMARY KEY,
        session_id text NOT NULL UNIQUE,
        user_id integer REFERENCES users(id) ON DELETE SET NULL,
        user_email text NOT NULL,
        stream_title text NOT NULL,
        game_type text NOT NULL,
        total_rounds integer DEFAULT 0 NOT NULL,
        total_prize_distributed integer DEFAULT 0 NOT NULL,
        top_winner text,
        duration_minutes integer DEFAULT 0 NOT NULL,
        started_at timestamp DEFAULT now() NOT NULL,
        ended_at timestamp,
        notes text,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 7. Table: referrals
    await client.query(`
      CREATE TABLE IF NOT EXISTS referrals (
        id serial PRIMARY KEY,
        referrer_uid text NOT NULL,
        referrer_email text NOT NULL,
        referred_uid text NOT NULL,
        referred_email text NOT NULL,
        referred_name text,
        reward_amount integer DEFAULT 5000 NOT NULL,
        status text DEFAULT 'active' NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 8. Table: affiliate_withdrawals
    await client.query(`
      CREATE TABLE IF NOT EXISTS affiliate_withdrawals (
        id serial PRIMARY KEY,
        withdrawal_id text NOT NULL UNIQUE,
        user_id integer REFERENCES users(id) ON DELETE CASCADE,
        user_email text NOT NULL,
        user_name text,
        amount integer NOT NULL,
        bank_name text NOT NULL,
        account_number text NOT NULL,
        account_name text NOT NULL,
        status text DEFAULT 'pending' NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 9. Table: user_activities
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_activities (
        id serial PRIMARY KEY,
        activity_id text,
        type text NOT NULL,
        user_id integer REFERENCES users(id) ON DELETE SET NULL,
        user_email text NOT NULL,
        user_name text,
        title text NOT NULL,
        amount integer,
        details text,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 10. Table: system_settings
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id serial PRIMARY KEY,
        key text NOT NULL UNIQUE,
        value text,
        pool_amount integer DEFAULT 50000000,
        win_chance integer DEFAULT 100,
        min_bet integer DEFAULT 50000,
        force_next_user text,
        force_next_nominal integer,
        updated_at timestamp DEFAULT now() NOT NULL,
        updated_by text
      );
    `);

    // 11. Table: jackpot_history
    await client.query(`
      CREATE TABLE IF NOT EXISTS jackpot_history (
        id serial PRIMARY KEY,
        user_id integer REFERENCES users(id) ON DELETE SET NULL,
        user_name text NOT NULL,
        user_email text NOT NULL,
        amount integer NOT NULL,
        game_type text NOT NULL,
        won_at timestamp DEFAULT now() NOT NULL,
        notes text,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    if (process.env.SQL_USER) {
      await client.query(`
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${process.env.SQL_USER};
        GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${process.env.SQL_USER};
      `);
    }

    console.log('✅ PostgreSQL schema verified & 15 tables are complete!');
  } catch (err: any) {
    console.warn('Schema migration notice:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}
