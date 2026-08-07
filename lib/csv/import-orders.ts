import { parseCsv } from "./index";
import type { Order } from "../sources/types";

// Column aliases we accept, lowercased. Shopee, TikTok Shop and BCL.my each
// name their export columns differently, so match on any of these rather than
// forcing the user to rename headers first.
const COLUMN_ALIASES: Record<keyof ImportedFields, string[]> = {
  id: ["order id", "order_sn", "order no", "id", "pesanan", "no pesanan", "nombor pesanan"],
  customer: ["customer", "customer name", "buyer", "buyer name", "pelanggan", "nama", "nama pelanggan"],
  channel: ["channel", "saluran", "platform", "source"],
  item: ["item", "product", "product name", "produk", "barang", "item name"],
  payment: ["payment", "payment method", "bayaran", "kaedah bayaran"],
  amount: ["amount", "total", "total amount", "jumlah", "harga", "grand total"],
  time: ["time", "date", "order time", "order date", "masa", "tarikh"],
  status: ["status", "order status", "status pesanan"],
};

type ImportedFields = {
  id: string; customer: string; channel: string; item: string;
  payment: string; amount: string; time: string; status: string;
};

export type ImportResult = {
  orders: Order[];
  duplicates: string[];
  skipped: { line: number; reason: string }[];
  missingColumns: string[];
};

const CHANNELS: Order["channel"][] = ["BCL.my", "Shopee", "TikTok Shop"];
const PRODUCT_TONES = ["#b87724", "#7c5030", "#1d6049", "#9b5f28", "#375846", "#ba7824"];

function normalise(header: string) {
  return header.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "??";
  return ((parts[0][0] ?? "") + (parts[1]?.[0] ?? parts[0][1] ?? "")).toUpperCase();
}

// Mirrors the short codes used by the seeded orders (MA, KA, SET, BE …) so
// imported rows sit alongside existing ones without looking out of place.
function productCodeOf(item: string) {
  const trimmed = item.trim();
  if (/^set\b/i.test(trimmed)) return "SET";
  const afterRempah = trimmed.match(/rempah\s+(\p{L}+)/iu);
  const word = afterRempah?.[1] ?? trimmed.split(/\s+/)[0] ?? "";
  return (word.slice(0, 2) || "??").toUpperCase();
}

function toneFor(code: string) {
  const sum = [...code].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PRODUCT_TONES[sum % PRODUCT_TONES.length];
}

function matchChannel(raw: string): Order["channel"] | null {
  const value = raw.trim().toLowerCase();
  if (!value) return null;
  const exact = CHANNELS.find((c) => c.toLowerCase() === value);
  if (exact) return exact;
  if (value.includes("tiktok")) return "TikTok Shop";
  if (value.includes("shopee")) return "Shopee";
  if (value.includes("bcl")) return "BCL.my";
  return null;
}

function matchStatus(raw: string): Order["status"] {
  const value = raw.trim().toLowerCase();
  if (value.includes("refund") || value.includes("batal") || value.includes("cancel")) return "Refund";
  if (value.includes("proses") || value.includes("process") || value.includes("pending") || value.includes("ship")) return "Diproses";
  return "Selesai";
}

// Accepts "51.80", "RM51.80", "1,234.50" and "RM 1,234.50".
function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/rm/gi, "").replace(/,/g, "").trim();
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function importOrdersFromCsv(text: string, existingIds: string[]): ImportResult {
  const rows = parseCsv(text);
  const result: ImportResult = { orders: [], duplicates: [], skipped: [], missingColumns: [] };
  if (!rows.length) {
    result.missingColumns = ["id", "customer", "item", "amount"];
    return result;
  }

  const headers = rows[0].map(normalise);
  const columnIndex = {} as Record<keyof ImportedFields, number>;
  (Object.keys(COLUMN_ALIASES) as (keyof ImportedFields)[]).forEach((field) => {
    columnIndex[field] = headers.findIndex((header) => COLUMN_ALIASES[field].includes(header));
  });

  // Only these four are structurally required; the rest fall back to defaults.
  const required: (keyof ImportedFields)[] = ["id", "customer", "item", "amount"];
  result.missingColumns = required.filter((field) => columnIndex[field] === -1);
  if (result.missingColumns.length) return result;

  const seen = new Set(existingIds.map((id) => id.replace(/^#/, "").toLowerCase()));

  rows.slice(1).forEach((row, i) => {
    const line = i + 2; // 1-indexed, and row 1 is the header
    const cell = (field: keyof ImportedFields) => (columnIndex[field] === -1 ? "" : (row[columnIndex[field]] ?? "").trim());

    const rawId = cell("id");
    const customer = cell("customer");
    const item = cell("item");
    if (!rawId || !customer || !item) {
      result.skipped.push({ line, reason: "Medan wajib kosong" });
      return;
    }

    const amount = parseAmount(cell("amount"));
    if (amount === null) {
      result.skipped.push({ line, reason: "Jumlah tidak sah" });
      return;
    }

    const key = rawId.replace(/^#/, "").toLowerCase();
    if (seen.has(key)) {
      result.duplicates.push(rawId.startsWith("#") ? rawId : `#${rawId}`);
      return;
    }
    seen.add(key);

    const code = productCodeOf(item);
    result.orders.push({
      id: rawId.startsWith("#") ? rawId : `#${rawId}`,
      customer,
      initials: initialsOf(customer),
      channel: matchChannel(cell("channel")) ?? "BCL.my",
      item,
      productCode: code,
      productTone: toneFor(code),
      payment: cell("payment") || "—",
      amount,
      time: cell("time") || "Diimport",
      status: matchStatus(cell("status")),
    });
  });

  return result;
}
