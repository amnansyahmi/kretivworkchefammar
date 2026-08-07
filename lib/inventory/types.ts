export type Product = {
  sku: string;
  name: string;
  /** Short code + tone, matching the thumbnails used on the orders table. */
  code: string;
  tone: string;
  weightLabel: string;
  price: number;
  /** Units currently on hand. */
  stock: number;
  /** At or below this, the product is flagged low and raises a notification. */
  reorderLevel: number;
  soldThisWeek: number;
};

export type StockLevel = "out" | "low" | "ok";

export function stockLevelOf(product: Product): StockLevel {
  if (product.stock <= 0) return "out";
  if (product.stock <= product.reorderLevel) return "low";
  return "ok";
}

/**
 * Whole weeks of cover left at the current sell-through rate.
 * Null when nothing sold this week — a rate of zero gives no signal.
 */
export function weeksOfCover(product: Product): number | null {
  if (product.soldThisWeek <= 0) return null;
  return Math.floor(product.stock / product.soldThisWeek);
}
