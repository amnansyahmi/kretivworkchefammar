CREATE TABLE "content_shoots" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date" text NOT NULL,
	"location" text NOT NULL,
	"status" text NOT NULL,
	"crew" text DEFAULT '' NOT NULL,
	"call_time" text DEFAULT '' NOT NULL,
	"drive_url" text,
	"notes" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_pieces" ADD COLUMN "shoot_id" text;