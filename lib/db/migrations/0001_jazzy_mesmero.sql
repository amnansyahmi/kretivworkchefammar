CREATE TABLE "payment_settings" (
	"key" text PRIMARY KEY DEFAULT 'current' NOT NULL,
	"bank_name" text DEFAULT 'Demo Bank' NOT NULL,
	"account_name" text DEFAULT 'KretivCo Sdn. Bhd.' NOT NULL,
	"account_number" text DEFAULT '1234 5678 9012' NOT NULL,
	"qr_image_data_url" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
