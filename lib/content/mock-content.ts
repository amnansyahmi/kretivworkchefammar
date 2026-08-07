import type { ContentPiece } from "./types";

// A content plan is forward-looking, so the seeded dates are relative to
// today rather than pinned like the rest of the demo data. Hardcoded July
// dates would make every card render as overdue the moment the month turned.
function dateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

// Seeded content plan. Product SKUs match lib/inventory/mock-products.ts so
// the "content → product → stock" link has something real to point at.
export const mockContent: ContentPiece[] = [
  {
    id: "CT-021",
    title: "Resepi Nasi Mandi 15 minit",
    format: "Video pendek",
    channel: "TikTok",
    status: "Diterbitkan",
    scheduledFor: dateOffset(-6),
    owner: "Amnan Syahmi",
    productSku: "CA-MANDI-140",
    driveUrl: null,
    notes: "Hook: 'Nasi Mandi tanpa oven'. Guna rempah Mandi 140g.",
    updatedAt: dateOffset(0),
  },
  {
    id: "CT-022",
    title: "Carousel: beza Kabsah vs Mandi",
    format: "Carousel",
    channel: "Instagram",
    status: "Dijadualkan",
    scheduledFor: dateOffset(2),
    owner: "Amnan Syahmi",
    productSku: "CA-KABSAH-140",
    driveUrl: null,
    notes: "5 slide. Slide terakhir CTA ke BCL.my.",
    updatedAt: dateOffset(0),
  },
  {
    id: "CT-023",
    title: "Live masak Beriani bersama Chef Ammar",
    format: "Live",
    channel: "Shopee Live",
    status: "Perlu kelulusan",
    scheduledFor: dateOffset(-1),
    owner: "Pasukan KretivWork",
    productSku: "CA-BERIANI-140",
    driveUrl: null,
    notes: "Rundown 45 minit. Perlu kelulusan Chef untuk skrip.",
    updatedAt: dateOffset(0),
  },
  {
    id: "CT-024",
    title: "Foto produk set raya",
    format: "Foto produk",
    channel: "BCL.my",
    status: "Sedang dibuat",
    scheduledFor: dateOffset(5),
    owner: "Pasukan KretivWork",
    productSku: "CA-SET-MB",
    driveUrl: null,
    notes: "Studio shot, latar kayu. 8 angle.",
    updatedAt: dateOffset(0),
  },
  {
    id: "CT-025",
    title: "Testimoni pelanggan Bukhari",
    format: "Video pendek",
    channel: "Threads",
    status: "Idea",
    scheduledFor: dateOffset(11),
    owner: "Amnan Syahmi",
    productSku: "CA-BUKHARI-140",
    driveUrl: null,
    notes: "Kumpul 3 testimoni dari WhatsApp.",
    updatedAt: dateOffset(0),
  },
  {
    id: "CT-026",
    title: "Tips simpan rempah supaya tahan lama",
    format: "Video pendek",
    channel: "TikTok",
    status: "Idea",
    scheduledFor: dateOffset(18),
    owner: "Pasukan KretivWork",
    productSku: null,
    driveUrl: null,
    notes: "Konten edukasi, bukan hard sell.",
    updatedAt: dateOffset(0),
  },
];
