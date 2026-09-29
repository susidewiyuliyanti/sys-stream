CREATE TABLE "registration_bonuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"base_amount_idr" integer DEFAULT 15000 NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"amount" integer DEFAULT 15000 NOT NULL,
	"exchange_rate" numeric(20, 8) DEFAULT '1' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "registration_bonuses_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "registration_bonuses" ADD CONSTRAINT "registration_bonuses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;