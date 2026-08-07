// Content pipeline, ordered from idea to published. The board renders one
// column per stage in this order.
export const CONTENT_STAGES = ["Idea", "Sedang dibuat", "Perlu kelulusan", "Dijadualkan", "Diterbitkan"] as const;
export type ContentStatus = (typeof CONTENT_STAGES)[number];

export const CONTENT_FORMATS = ["Video pendek", "Carousel", "Foto produk", "Live", "Artikel"] as const;
export type ContentFormat = (typeof CONTENT_FORMATS)[number];

export const CONTENT_CHANNELS = ["TikTok", "Instagram", "Threads", "Shopee Live", "BCL.my"] as const;
export type ContentChannel = (typeof CONTENT_CHANNELS)[number];

export type ContentPiece = {
  id: string;
  title: string;
  format: ContentFormat;
  channel: ContentChannel;
  status: ContentStatus;
  /** ISO date (YYYY-MM-DD) the piece is meant to go live. */
  scheduledFor: string;
  owner: string;
  /** SKU this content is meant to sell — the link back to the sales side. */
  productSku: string | null;
  /** Google Drive link to the asset or working folder. */
  driveUrl: string | null;
  notes: string;
  updatedAt: string;
};

/** Days until (positive) or since (negative) the scheduled date. */
export function daysUntil(scheduledFor: string, today = new Date()): number | null {
  const target = new Date(`${scheduledFor}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}

/**
 * A piece is late when its go-live date has passed and it still isn't
 * published. Published work is never late, however old.
 */
export function isOverdue(piece: ContentPiece, today = new Date()): boolean {
  if (piece.status === "Diterbitkan") return false;
  const days = daysUntil(piece.scheduledFor, today);
  return days !== null && days < 0;
}

/** Due today or in the next `within` days, and not yet published. */
export function isDueSoon(piece: ContentPiece, within = 2, today = new Date()): boolean {
  if (piece.status === "Diterbitkan") return false;
  const days = daysUntil(piece.scheduledFor, today);
  return days !== null && days >= 0 && days <= within;
}
