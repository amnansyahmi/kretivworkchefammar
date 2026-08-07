import type { ContentShoot } from "./shoots";

// Relative to today for the same reason as mock-content.ts: a hardcoded
// month would make the calendar open on an empty screen.
function dateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export const mockShoots: ContentShoot[] = [
  {
    id: "SH-08",
    title: "Batch raya — 4 video pendek",
    date: dateOffset(3),
    location: "Dapur Chef Ammar",
    status: "Disahkan",
    crew: "Chef Ammar, Amnan, 1 videografer",
    callTime: "9:00 AM",
    driveUrl: null,
    notes: "Rakam 4 resepi sekali gus. Sediakan bahan malam sebelum.",
  },
  {
    id: "SH-09",
    title: "Foto produk set raya",
    date: dateOffset(4),
    location: "Studio KretivWork",
    status: "Disahkan",
    crew: "Amnan, 1 fotografer",
    callTime: "2:00 PM",
    driveUrl: null,
    notes: "Latar kayu + kain. 8 angle setiap SKU.",
  },
  {
    id: "SH-10",
    title: "Live Shopee — masak Beriani",
    date: dateOffset(9),
    location: "Dapur Chef Ammar",
    status: "Dirancang",
    crew: "Chef Ammar, Amnan",
    callTime: "8:00 PM",
    driveUrl: null,
    notes: "Rundown 45 minit. Perlu sahkan slot Shopee Live.",
  },
  {
    id: "SH-11",
    title: "Rakaman testimoni pelanggan",
    date: dateOffset(16),
    location: "Lokasi luar",
    status: "Dirancang",
    crew: "Amnan",
    callTime: "10:00 AM",
    driveUrl: null,
    notes: "3 pelanggan area Bangi. Sahkan dengan mereka dulu.",
  },
  {
    id: "SH-07",
    title: "Batch Julai — video resepi",
    date: dateOffset(-7),
    location: "Dapur Chef Ammar",
    status: "Selesai",
    crew: "Chef Ammar, Amnan, 1 videografer",
    callTime: "9:00 AM",
    driveUrl: null,
    notes: "Siap. Footage mentah dah masuk Drive.",
  },
];
