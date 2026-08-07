import type { Product } from "./types";

// Chef Ammar™ Arabic Spices catalogue. Codes and tones match the product
// thumbnails already used on the orders table.
export const mockProducts: Product[] = [
  { sku: "CA-MANDI-140", name: "Rempah Mandi", code: "MA", tone: "#b87724", weightLabel: "140g", price: 25.9, stock: 148, reorderLevel: 40, soldThisWeek: 96 },
  { sku: "CA-KABSAH-140", name: "Rempah Kabsah", code: "KA", tone: "#7c5030", weightLabel: "140g", price: 25.9, stock: 32, reorderLevel: 40, soldThisWeek: 74 },
  { sku: "CA-BERIANI-140", name: "Rempah Beriani", code: "BE", tone: "#9b5f28", weightLabel: "140g", price: 25.9, stock: 211, reorderLevel: 40, soldThisWeek: 88 },
  { sku: "CA-MAKLUBAH-140", name: "Rempah Maklubah", code: "MK", tone: "#375846", weightLabel: "140g", price: 25.9, stock: 64, reorderLevel: 30, soldThisWeek: 41 },
  { sku: "CA-BUKHARI-140", name: "Rempah Bukhari", code: "BU", tone: "#ba7824", weightLabel: "140g", price: 25.9, stock: 0, reorderLevel: 30, soldThisWeek: 52 },
  { sku: "CA-SET-MB", name: "Set Mandi + Beriani", code: "SET", tone: "#1d6049", weightLabel: "2 × 140g", price: 49.8, stock: 87, reorderLevel: 25, soldThisWeek: 38 },
];
