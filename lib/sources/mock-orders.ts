import type { Order } from "./types";

export const mockOrders: Order[] = [
  { id: "#CA-1048", customer: "Farah Nadia", initials: "FN", channel: "BCL.my", item: "Rempah Mandi 140g × 2", productCode: "MA", productTone: "#b87724", payment: "FPX", amount: 51.8, time: "Hari ini, 10:42 AM", status: "Selesai" },
  { id: "#CA-1047", customer: "Syafiq Roslan", initials: "SR", channel: "TikTok Shop", item: "Rempah Kabsah 140g × 1", productCode: "KA", productTone: "#7c5030", payment: "TikTok Pay", amount: 25.9, time: "Hari ini, 9:18 AM", status: "Diproses" },
  { id: "#CA-1046", customer: "Aina Sofea", initials: "AS", channel: "Shopee", item: "Set Mandi + Beriani × 1", productCode: "SET", productTone: "#1d6049", payment: "ShopeePay", amount: 49.8, time: "Semalam, 8:33 PM", status: "Selesai" },
  { id: "#CA-1045", customer: "Mohd Firdaus", initials: "MF", channel: "BCL.my", item: "Rempah Beriani 140g × 3", productCode: "BE", productTone: "#9b5f28", payment: "Kad debit", amount: 77.7, time: "Semalam, 5:07 PM", status: "Selesai" },
  { id: "#CA-1044", customer: "Nurin Izzati", initials: "NI", channel: "Shopee", item: "Rempah Maklubah 140g × 1", productCode: "MK", productTone: "#375846", payment: "ShopeePay", amount: 25.9, time: "17 Jul, 3:24 PM", status: "Refund" },
  { id: "#CA-1043", customer: "Daniel Lim", initials: "DL", channel: "TikTok Shop", item: "Rempah Bukhari 140g × 2", productCode: "BU", productTone: "#ba7824", payment: "TikTok Pay", amount: 51.8, time: "17 Jul, 1:51 PM", status: "Selesai" },
  // Repeat purchases — Farah and Aina appear above too, so the customers view
  // has a real repeat rate to show rather than everyone being a one-off.
  { id: "#CA-1042", customer: "Farah Nadia", initials: "FN", channel: "BCL.my", item: "Set Mandi + Beriani × 1", productCode: "SET", productTone: "#1d6049", payment: "FPX", amount: 49.8, time: "16 Jul, 10:32 AM", status: "Selesai" },
  { id: "#CA-1041", customer: "Aina Sofea", initials: "AS", channel: "Shopee", item: "Rempah Kabsah 140g × 2", productCode: "KA", productTone: "#7c5030", payment: "ShopeePay", amount: 51.8, time: "15 Jul, 2:19 PM", status: "Selesai" },
  { id: "#CA-1040", customer: "Farah Nadia", initials: "FN", channel: "TikTok Shop", item: "Rempah Maklubah 140g × 1", productCode: "MK", productTone: "#375846", payment: "TikTok Pay", amount: 25.9, time: "14 Jul, 6:44 PM", status: "Selesai" },
  // Paid but not yet booked with a courier — the starting point for the
  // "Tempah penghantaran" flow.
  { id: "#CA-1051", customer: "Hafiz Kamarudin", initials: "HK", channel: "BCL.my", item: "Rempah Mandi 140g × 1", productCode: "MA", productTone: "#b87724", payment: "FPX", amount: 25.9, time: "Hari ini, 8:05 AM", status: "Diproses" },
];
