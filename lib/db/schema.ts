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
