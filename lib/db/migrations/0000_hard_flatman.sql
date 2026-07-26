CREATE TABLE "campaigns" (
	"key" text PRIMARY KEY DEFAULT 'current' NOT NULL,
	"name" text NOT NULL,
	"channel" text NOT NULL,
	"content_type" text NOT NULL,
	"days" jsonb NOT NULL,
	"budget" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commission_status" (
	"week_index" integer PRIMARY KEY NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"paid" boolean DEFAULT false NOT NULL,
	"pay_method" text DEFAULT 'bank' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
