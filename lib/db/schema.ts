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

// Content plan items from the Kandungan board. Unlike stock_levels these
// rows are the source of truth, not an override — once a database is
// configured the seeded plan is ignored entirely.
export const contentPieces = pgTable("content_pieces", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  format: text("format").notNull(),
  channel: text("channel").notNull(),
  status: text("status").notNull(),
  scheduledFor: text("scheduled_for").notNull(),
  owner: text("owner").notNull().default(""),
  productSku: text("product_sku"),
  driveUrl: text("drive_url"),
  notes: text("notes").notNull().default(""),
  // Which shoot produces this piece. Deliberately not a foreign key: a piece
  // can be planned before its shoot is booked, and deleting a shoot should
  // orphan its pieces rather than delete them.
  shootId: text("shoot_id"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Production sessions. Separate from content_pieces because one shoot day
// normally produces several pieces that go live on different dates.
export const contentShoots = pgTable("content_shoots", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  location: text("location").notNull(),
  status: text("status").notNull(),
  crew: text("crew").notNull().default(""),
  callTime: text("call_time").notNull().default(""),
  driveUrl: text("drive_url"),
  notes: text("notes").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// The shared Google Drive folder the content team works out of.
export const contentSettings = pgTable("content_settings", {
  key: text("key").primaryKey().default("current"),
  driveFolderUrl: text("drive_folder_url"),
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
