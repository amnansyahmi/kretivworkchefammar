CREATE TABLE "content_pieces" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"format" text NOT NULL,
	"channel" text NOT NULL,
	"status" text NOT NULL,
	"scheduled_for" text NOT NULL,
	"owner" text DEFAULT '' NOT NULL,
	"product_sku" text,
	"drive_url" text,
	"notes" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_settings" (
	"key" text PRIMARY KEY DEFAULT 'current' NOT NULL,
	"drive_folder_url" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
