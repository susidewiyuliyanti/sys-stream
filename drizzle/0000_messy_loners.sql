CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"role" text DEFAULT 'ADMIN' NOT NULL,
	"added_by" text,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "affiliate_withdrawals" (
	"id" serial PRIMARY KEY NOT NULL,
	"withdrawal_id" text NOT NULL,
	"user_id" integer,
	"user_email" text NOT NULL,
	"user_name" text,
	"amount" integer NOT NULL,
	"bank_name" text NOT NULL,
	"account_number" text NOT NULL,
	"account_name" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_withdrawals_withdrawal_id_unique" UNIQUE("withdrawal_id")
);
--> statement-breakpoint
CREATE TABLE "banned_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"reason" text,
	"banned_by" text,
	"banned_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "banned_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "blind_box_claims" (
	"id" serial PRIMARY KEY NOT NULL,
	"deposit_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"claim_date" text NOT NULL,
	"amount" integer NOT NULL,
	"is_jackpot" boolean DEFAULT false NOT NULL,
	"claimed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deposits" (
	"id" serial PRIMARY KEY NOT NULL,
	"deposit_code" text NOT NULL,
	"user_id" integer NOT NULL,
	"amount" integer DEFAULT 50000 NOT NULL,
	"duration_days" integer NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"total_claimed" integer DEFAULT 0 NOT NULL,
	"force_jackpot" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "deposits_deposit_code_unique" UNIQUE("deposit_code")
);
--> statement-breakpoint
CREATE TABLE "game_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"jackpot_amount" integer DEFAULT 50000000 NOT NULL,
	"jackpot_chance" integer DEFAULT 100 NOT NULL,
	"min_box" integer DEFAULT 100 NOT NULL,
	"max_box" integer DEFAULT 1000 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jackpot_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"user_name" text NOT NULL,
	"user_email" text NOT NULL,
	"amount" integer NOT NULL,
	"game_type" text NOT NULL,
	"won_at" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrer_uid" text NOT NULL,
	"referrer_email" text NOT NULL,
	"referred_uid" text NOT NULL,
	"referred_email" text NOT NULL,
	"referred_name" text,
	"reward_amount" integer DEFAULT 5000 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streaming_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_id" integer,
	"user_email" text NOT NULL,
	"stream_title" text NOT NULL,
	"game_type" text NOT NULL,
	"total_rounds" integer DEFAULT 0 NOT NULL,
	"total_prize_distributed" integer DEFAULT 0 NOT NULL,
	"top_winner" text,
	"duration_minutes" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "streaming_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "subscription_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"user_id" integer,
	"nama" text,
	"jumlah" integer,
	"user_email" text NOT NULL,
	"plan_id" text,
	"plan_name" text NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_method" text DEFAULT 'NOWPayments' NOT NULL,
	"duration_days" integer DEFAULT 30,
	"type" text DEFAULT 'subscription' NOT NULL,
	"tx_hash" text,
	"fee_amount" integer DEFAULT 0,
	"net_payout_amount" integer,
	"approved_by" text,
	"approved_at" timestamp,
	"rejected_by" text,
	"rejected_at" timestamp,
	"rejection_reason" text,
	"user_name" text,
	"bank_name" text,
	"account_number" text,
	"account_name" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_orders_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"pool_amount" integer DEFAULT 50000000,
	"win_chance" integer DEFAULT 100,
	"min_bet" integer DEFAULT 50000,
	"force_next_user" text,
	"force_next_nominal" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" text,
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "user_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"activity_id" text,
	"type" text NOT NULL,
	"user_id" integer,
	"user_email" text NOT NULL,
	"user_name" text,
	"title" text NOT NULL,
	"amount" integer,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"cuid" text NOT NULL,
	"uid" text,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"display_name" text,
	"photo_url" text,
	"streamer_handle" text,
	"bio" text,
	"referral_code" text,
	"referred_by" text,
	"balance" integer DEFAULT 100000 NOT NULL,
	"role" text DEFAULT 'USER' NOT NULL,
	"is_blacklisted" boolean DEFAULT false NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"subscription_plan" text DEFAULT 'Akses Bebas Gratis',
	"subscription_expires_at" text,
	"is_subscribed" boolean DEFAULT true NOT NULL,
	"is_lifetime" boolean DEFAULT false NOT NULL,
	"force_jackpot_next" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_cuid_unique" UNIQUE("cuid"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vip_hosts" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"added_by" text,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'USER' NOT NULL,
	"plan" text DEFAULT 'VIP Host' NOT NULL,
	"plan_type" text DEFAULT 'lifetime',
	"expires_at" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vip_hosts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"deposit_id" integer,
	"amount" integer NOT NULL,
	"bank_name" text DEFAULT 'USDT (TRC-20)' NOT NULL,
	"account_number" text NOT NULL,
	"account_name" text NOT NULL,
	"status" text DEFAULT 'COMPLETED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "affiliate_withdrawals" ADD CONSTRAINT "affiliate_withdrawals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blind_box_claims" ADD CONSTRAINT "blind_box_claims_deposit_id_deposits_id_fk" FOREIGN KEY ("deposit_id") REFERENCES "public"."deposits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blind_box_claims" ADD CONSTRAINT "blind_box_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jackpot_history" ADD CONSTRAINT "jackpot_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streaming_sessions" ADD CONSTRAINT "streaming_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_orders" ADD CONSTRAINT "subscription_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_deposit_id_deposits_id_fk" FOREIGN KEY ("deposit_id") REFERENCES "public"."deposits"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "deposit_date_unique_idx" ON "blind_box_claims" USING btree ("deposit_id","claim_date");