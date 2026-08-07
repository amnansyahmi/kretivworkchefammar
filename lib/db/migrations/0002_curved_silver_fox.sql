CREATE TABLE "stock_levels" (
	"sku" text PRIMARY KEY NOT NULL,
	"stock" integer NOT NULL,
	"reorder_level" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
