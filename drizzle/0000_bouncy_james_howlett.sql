CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"role" text DEFAULT 'admin' NOT NULL,
	"added_by" text NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "affiliate_withdrawals" (
	"id" serial PRIMARY KEY NOT NULL,
	"withdrawal_id" text NOT NULL,
	"user_id" text NOT NULL,
	"user_email" text NOT NULL,
	"user_name" text NOT NULL,
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
	"banned_by" text NOT NULL,
	"banned_at" timestamp DEFAULT now() NOT NULL,
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
	"target_jackpot_nominal" integer,
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
	"user_id" text NOT NULL,
	"user_name" text NOT NULL,
	"user_email" text NOT NULL,
	"amount" integer NOT NULL,
	"game_type" text NOT NULL,
	"won_at" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrer_uid" text NOT NULL,
	"referrer_email" text NOT NULL,
	"referred_uid" text NOT NULL,
	"referred_email" text NOT NULL,
	"referred_name" text NOT NULL,
	"reward_amount" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streaming_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_id" text NOT NULL,
	"user_email" text NOT NULL,
	"stream_title" text NOT NULL,
	"game_type" text NOT NULL,
	"total_rounds" integer DEFAULT 0 NOT NULL,
	"total_prize_distributed" integer DEFAULT 0 NOT NULL,
	"top_winner" text,
	"duration_minutes" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp NOT NULL,
	"ended_at" timestamp,
	"notes" text,
	CONSTRAINT "streaming_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "subscription_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"user_id" text NOT NULL,
	"user_email" text NOT NULL,
	"nama" text,
	"jumlah" integer,
	"plan_id" text,
	"plan_name" text NOT NULL,
	"price" integer NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_method" text NOT NULL,
	"duration_days" integer,
	"type" text,
	"tx_hash" text,
	"fee_amount" integer,
	"net_payout_amount" integer,
	"approved_by" text,
	"approved_at" timestamp,
	"rejected_by" text,
	"rejected_at" timestamp,
	"rejection_reason" text,
	"user_name" text,
	"bank_details" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_orders_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"setting_key" text NOT NULL,
	"setting_value" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" text,
	CONSTRAINT "system_settings_setting_key_unique" UNIQUE("setting_key")
);
--> statement-breakpoint
CREATE TABLE "user_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"activity_id" text,
	"type" text NOT NULL,
	"user_id" text NOT NULL,
	"user_email" text NOT NULL,
	"user_name" text NOT NULL,
	"title" text NOT NULL,
	"amount" integer,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_activities_activity_id_unique" UNIQUE("activity_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"cuid" text NOT NULL,
	"uid" text,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"display_name" text DEFAULT '' NOT NULL,
	"photo_url" text DEFAULT '' NOT NULL,
	"streamer_handle" text,
	"bio" text,
	"referral_code" text,
	"referred_by" text,
	"referral_count" integer DEFAULT 0 NOT NULL,
	"balance" integer DEFAULT 100000 NOT NULL,
	"saldo" integer DEFAULT 0 NOT NULL,
	"wallet_balance" integer DEFAULT 0 NOT NULL,
	"locked_saldo" integer DEFAULT 0 NOT NULL,
	"affiliate_earnings" integer DEFAULT 0 NOT NULL,
	"affiliate_withdrawn" integer DEFAULT 0 NOT NULL,
	"is_subscribed" boolean DEFAULT false NOT NULL,
	"subscription_plan" text DEFAULT 'free' NOT NULL,
	"subscription_expires_at" timestamp,
	"is_lifetime" boolean DEFAULT false NOT NULL,
	"subscribed_at" timestamp,
	"role" text DEFAULT 'member' NOT NULL,
	"is_blacklisted" boolean DEFAULT false NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"banned_reason" text,
	"force_jackpot_next" boolean DEFAULT false NOT NULL,
	"target_jackpot_nominal" integer,
	"last_saldo_modified_by" text,
	"last_saldo_modification_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_cuid_unique" UNIQUE("cuid"),
	CONSTRAINT "users_uid_unique" UNIQUE("uid"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "vip_hosts" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"added_by" text NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'host' NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"plan_type" text,
	"expires_at" timestamp,
	"notes" text,
	CONSTRAINT "vip_hosts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"deposit_id" integer,
	"amount" integer NOT NULL,
	"bank_name" text DEFAULT 'BCA' NOT NULL,
	"account_number" text NOT NULL,
	"account_name" text NOT NULL,
	"status" text DEFAULT 'COMPLETED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blind_box_claims" ADD CONSTRAINT "blind_box_claims_deposit_id_deposits_id_fk" FOREIGN KEY ("deposit_id") REFERENCES "public"."deposits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blind_box_claims" ADD CONSTRAINT "blind_box_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_deposit_id_deposits_id_fk" FOREIGN KEY ("deposit_id") REFERENCES "public"."deposits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admins_email_idx" ON "admins" USING btree ("email");--> statement-breakpoint
CREATE INDEX "affiliate_withdrawals_user_idx" ON "affiliate_withdrawals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "affiliate_withdrawals_status_idx" ON "affiliate_withdrawals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "banned_users_email_idx" ON "banned_users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "deposit_date_unique_idx" ON "blind_box_claims" USING btree ("deposit_id","claim_date");--> statement-breakpoint
CREATE INDEX "deposits_user_idx" ON "deposits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "deposits_status_idx" ON "deposits" USING btree ("status");--> statement-breakpoint
CREATE INDEX "jackpot_history_user_idx" ON "jackpot_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "jackpot_history_won_at_idx" ON "jackpot_history" USING btree ("won_at");--> statement-breakpoint
CREATE INDEX "referrals_referrer_idx" ON "referrals" USING btree ("referrer_uid");--> statement-breakpoint
CREATE INDEX "referrals_referred_idx" ON "referrals" USING btree ("referred_uid");--> statement-breakpoint
CREATE INDEX "streaming_sessions_user_idx" ON "streaming_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "streaming_sessions_started_at_idx" ON "streaming_sessions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "subscription_orders_user_idx" ON "subscription_orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscription_orders_status_idx" ON "subscription_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscription_orders_type_idx" ON "subscription_orders" USING btree ("type");--> statement-breakpoint
CREATE INDEX "system_settings_key_idx" ON "system_settings" USING btree ("setting_key");--> statement-breakpoint
CREATE INDEX "user_activities_user_idx" ON "user_activities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_activities_type_idx" ON "user_activities" USING btree ("type");--> statement-breakpoint
CREATE INDEX "user_activities_created_at_idx" ON "user_activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_uid_idx" ON "users" USING btree ("uid");--> statement-breakpoint
CREATE INDEX "users_referral_code_idx" ON "users" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "vip_hosts_email_idx" ON "vip_hosts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "withdrawals_user_idx" ON "withdrawals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "withdrawals_status_idx" ON "withdrawals" USING btree ("status");