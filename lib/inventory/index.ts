import { getDb } from "../db/client";
import { stockLevels } from "../db/schema";
import { mockProducts } from "./mock-products";
import type { Product } from "./types";

/**
 * Catalogue with any persisted stock adjustments applied on top.
 * Without DATABASE_URL the seeded levels are returned unchanged, exactly
 * like the other data sources in this app.
 */
export async function getProducts(): Promise<Product[]> {
  const db = getDb();
  if (!db) return mockProducts;

  const overrides = await db.select().from(stockLevels);
  const bySku = new Map(overrides.map((row) => [row.sku, row]));
  return mockProducts.map((product) => {
    const override = bySku.get(product.sku);
    return override ? { ...product, stock: override.stock, reorderLevel: override.reorderLevel } : product;
  });
}

export async function saveStockLevel(sku: string, stock: number, reorderLevel: number): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  await db
    .insert(stockLevels)
    .values({ sku, stock, reorderLevel })
    .onConflictDoUpdate({
      target: stockLevels.sku,
      set: { stock, reorderLevel, updatedAt: new Date() },
    });
  return true;
}
