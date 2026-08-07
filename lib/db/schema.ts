import { pgTable, text, boolean, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

// Persisted approve/pay state for a commission week. Only week 0 (the
// current week) is ever written today — other weeks are historical and
// already settled — but this is keyed by week so that stays true even
// if more weeks become editable later.
export const commissionStatus = pgTable("commission_status", {
  weekIndex: integer("week_index").primaryKey(),
  approved: boolean("approved").notNull().default(false),
  paid: boolean("paid").notNull().default(false),
  payMethod: text("pay_method").notNull().default("bank"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// The single active marketing campaign shown on the Channels insight
// card. Row present = a campaign is scheduled; absent = none.
export const campaigns = pgTable("campaigns", {
  key: text("key").primaryKey().default("current"),
  name: text("name").notNull(),
  channel: text("channel").notNull(),
  contentType: text("content_type").notNull(),
  days: jsonb("days").$type<string[]>().notNull(),
  budget: text("budget").notNull().default(""),
  notes: text("notes").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Stock adjustments made from Jualan > Produk. Only SKUs that have been
// adjusted get a row; anything absent falls back to the seeded catalogue
// level in lib/inventory/mock-products.ts.
export const stockLevels = pgTable("stock_levels", {
  sku: text("sku").primaryKey(),
  stock: integer("stock").notNull(),
  reorderLevel: integer("reorder_level").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Bank details and QR code shown in the "Payment ke KretivCo" card,
// editable by the KretivCo team from Tetapan > Kaedah pembayaran.
// qrImageDataUrl is a base64 data URL of an uploaded QR image; null
// falls back to an auto-generated QR code.
export const paymentSettings = pgTable("payment_settings", {
  key: text("key").primaryKey().default("current"),
  bankName: text("bank_name").notNull().default("Demo Bank"),
  accountName: text("account_name").notNull().default("KretivCo Sdn. Bhd."),
  accountNumber: text("account_number").notNull().default("1234 5678 9012"),
  qrImageDataUrl: text("qr_image_data_url"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
