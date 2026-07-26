"use client";

import {
  Bell,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LoaderCircle,
  Menu,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  Store,
  WalletCards,
  X,
} from "lucide-react";
import { SiShopee, SiTiktok } from "react-icons/si";
import { QRCodeSVG } from "qrcode.react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { DataSourceKey } from "../lib/config";
import { mockOrders } from "../lib/sources/mock-orders";
import type { Order } from "../lib/sources/types";
import type { SourceStatus } from "../lib/sources";
import { StatementPdfDocument, InvoicePdfDocument } from "../lib/pdf/documents";
import { downloadPdf } from "../lib/pdf/download";

type Lang = "bm" | "en";

const EN: Record<string, string> = {
  "Tutup menu": "Close menu", "Navigasi utama": "Main navigation",
  "Ringkasan": "Overview", "Jualan": "Sales", "Kewangan": "Finance", "Tetapan": "Settings",
  "Menyelaraskan data…": "Syncing data…", "Dikemas kini 4 min lalu": "Updated 4 min ago", "Selaraskan data": "Sync data",
  "Buka menu": "Open menu", "Pandangan": "View", "Tiada notifikasi baharu": "No new notifications", "Notifikasi": "Notifications",
  "Ringkasan jualan": "Sales overview", "Tempoh laporan": "Report period",
  "Minggu ini": "This week", "Minggu lepas": "Last week", "Bulan ini": "This month",
  "Import": "Import", "Penyata": "Statement",
  "Jumlah jualan": "Total sales", "RM2,638 lebih tinggi berbanding minggu lepas": "RM2,638 higher than last week",
  "Lihat pesanan": "View orders", "Pesanan selesai": "Completed orders", "jumlah pesanan": "total orders", "Tapis pesanan": "Filter orders",
  "Komisen KretivWork": "KretivWork commission", "Kadar komisen semasa": "Current commission rate", "Buka invoice": "Open invoice",
  "Purata nilai pesanan": "Average order value", "RM0.96 lebih rendah dari minggu lepas": "RM0.96 lower than last week", "Banding saluran": "Compare channels",
  "Trend jualan mingguan": "Weekly sales trend", "Nilai jualan harian mengikut saluran": "Daily sales value by channel",
  "Order": "Orders", "Saluran tertinggi": "Top channel", "Lihat pesanan hari ini": "View today's orders",
  "Penyata semasa": "Current statement", "Diluluskan": "Approved", "Perlu semakan": "Needs review",
  "Komisen perlu dibayar": "Commission due", "Jualan selesai": "Sales completed", "Kadar komisen": "Commission rate",
  "Refund & pembatalan": "Refunds & cancellations", "Dijana": "Generated", "Semakan Chef": "Chef review", "Bayaran": "Payment",
  "Semak & luluskan penyata": "Review & approve statement", "Lihat butiran penyata": "View statement details",
  "Sasaran mingguan": "Weekly goal", "Matlamat": "Goal", "dari sasaran": "of goal", "lagi": "to go",
  "Kaedah pembayaran": "Payment methods", "Pecahan pesanan terkini": "Recent order breakdown", "pesanan": "orders",
  "Produk terlaris": "Top products", "Ikut jumlah jualan minggu ini": "By sales this week",
  "Aktiviti terkini": "Recent activity", "Kemas kini masa nyata": "Real-time updates",
  "Prestasi saluran": "Channel performance", "Bahagian jualan minggu ini": "Sales share this week", "Lihat semua": "View all",
  "daripada jualan": "of sales",
  "Pesanan": "Orders", "Saluran": "Channels", "Sumber": "Sources", "Commission": "Commission", "Pembayaran": "Payments",
  "Sistem": "System", "Pasukan": "Team",
  "Pesanan terkini": "Recent orders", "rekod ditemui": "records found", "Aktiviti jualan terbaru": "Recent sales activity",
  "Cari...": "Search...", "Tapis status": "Filter status", "Tapis saluran": "Filter channel", "Susun ikut": "Sort by",
  "Semua status": "All status", "Selesai": "Completed", "Diproses": "Processing", "Refund": "Refund",
  "Semua saluran": "All channels", "Terkini": "Latest", "Nilai tertinggi": "Highest value", "Nilai terendah": "Lowest value",
  "Export": "Export", "PESANAN": "ORDER", "PELANGGAN": "CUSTOMER", "SALURAN": "CHANNEL", "PRODUK": "PRODUCT", "JUMLAH": "AMOUNT", "STATUS": "STATUS",
  "Tiada pesanan": "No orders", "Ubah carian atau filter.": "Adjust your search or filters.", "Kosongkan filter": "Clear filters",
  "Menunjukkan": "Showing", "daripada": "of", "Halaman sebelumnya": "Previous page", "Halaman seterusnya": "Next page", "Buka": "Open",
  "Bahagian jualan": "Sales share", "Purata pesanan": "Average order", "Sambungan aktif · 4 minit lalu": "Connection active · 4 min ago",
  "TikTok Shop berkembang paling pantas": "TikTok Shop is growing fastest",
  "Jualan meningkat 24.8% minggu ini. Pertimbangkan kandungan video masakan pada Jumaat dan Sabtu.": "Sales grew 24.8% this week. Consider cooking video content on Friday and Saturday.",
  "Rancang kempen": "Plan campaign",
  "SUMBER JUALAN": "SALES SOURCES", "Dari mana jualan datang?": "Where do sales come from?", "Sumber pelanggan dan platform checkout.": "Customer sources and checkout platforms.",
  "Jualan dapat dikenal pasti": "of sales can be attributed", "Sumber jualan tertinggi": "Top sales source", "Conversion terbaik · WhatsApp": "Best conversion · WhatsApp",
  "Pilih sumber jualan": "Select sales source", "Semua sumber": "All sources", "Nilai jualan": "Sales value", "Bilangan order": "Order count",
  "Pecahan sumber": "Source breakdown", "Pilih sumber untuk melihat aliran": "Select a source to see the flow",
  "jumlah jualan": "total sales", "jumlah order": "total order", "order": "orders",
  "Aliran jualan": "Sales flow", "Dari sumber pemasaran kepada platform checkout": "From marketing source to checkout platform",
  "UTM, referral code atau tracking link digunakan untuk mengenal pasti sumber.": "UTM, referral codes or tracking links are used to attribute the source.",
  "SUMBER PELANGGAN": "CUSTOMER SOURCE", "Semua aktiviti pemasaran": "All marketing activity", "CHECKOUT DI": "CHECKOUT ON",
  "Klik": "Clicks", "Order selesai": "Completed orders", "Nilai purata": "Average value",
  "Bagaimana jualan dikenal pasti?": "How are sales attributed?", "Daripada content hingga order selesai": "From content to completed order", "Tracking aktif": "Tracking active",
  "Nampak content": "Sees content", "Threads, TikTok, KOL atau WhatsApp": "Threads, TikTok, KOL or WhatsApp",
  "Tekan tracking link": "Clicks tracking link", "UTM dan referral code direkod": "UTM and referral code recorded",
  "Pilih platform": "Chooses platform", "Order disahkan": "Order confirmed", "Jualan masuk ke central dashboard": "Sale enters the central dashboard",
  "5% jualan belum dikenal pasti.": "5% of sales not yet attributed.", "Gunakan UTM link, kod affiliate dan landing page khusus.": "Use UTM links, affiliate codes and dedicated landing pages.",
  "Lihat cadangan tracking": "View tracking suggestions",
  "order selesai": "orders completed", "item": "items",
  "Jumlah perlu dibayar": "Amount due", "Dibayar pada": "Paid on",
  "Lihat resit": "View receipt", "Invoice komisen": "Commission invoice", "Dummy invoice untuk pembayaran KretivCo": "Dummy invoice for KretivCo payment",
  "Jualan bersih": "Net sales", "Komisen": "Commission", "Refund dikecualikan": "Refund excluded",
  "Payment ke KretivCo": "Payment to KretivCo", "Rekod bayaran dummy untuk test flow": "Dummy payment record for testing the flow",
  "Bayaran telah direkod": "Payment recorded",
  "Bank Transfer": "Bank Transfer", "QR Pay": "QR Pay", "Imbas untuk bayar KretivCo": "Scan to pay KretivCo",
  "Rekod penyata": "Statement records", "Komisen mingguan KretivWork": "KretivWork weekly commission", "jualan selesai": "completed sales",
  "Dibayar": "Paid",
  "Jumlah telah dibayar": "Total paid", "4 pembayaran termasuk minggu ini": "4 payments including this week", "3 pembayaran terdahulu": "3 previous payments",
  "Bayaran minggu ini": "This week's payment", "Menunggu bayaran": "Awaiting payment", "Rujukan": "Reference", "Tarikh bayaran seterusnya": "Next payment date",
  "Aliran pembayaran": "Payment flow", "Bayaran dibuat selepas invoice komisen diluluskan oleh Chef Ammar.": "Payment is made after the commission invoice is approved by Chef Ammar.",
  "Invoice dijana": "Invoice generated", "Kelulusan Chef": "Chef approval", "Resit tersedia": "Receipt available",
  "Preview resit": "Preview receipt", "Sudah dibayar": "Already paid",
  "Akses pasukan": "Team access", "Peranan dan tahap akses": "Roles and access levels", "Jemputan pengguna baharu dibuka": "New user invitation opened",
  "Jemput pengguna": "Invite user", "Aktif": "Active",
  "Tetapan komisen": "Commission settings", "Kadar ini digunakan untuk penyata baharu.": "This rate is used for new statements.",
  "Kadar komisen KretivWork": "KretivWork commission rate", "Simpan perubahan": "Save changes", "Tetapan komisen disimpan": "Commission settings saved",
  "Sambungan platform": "Platform connections", "Status sumber data pesanan.": "Order data source status.",
  "Perlu sambung semula": "Needs reconnect", "Disambungkan": "Connected", "Semak": "Review",
  "Data ujian (mock)": "Test data (mock)", "Ralat sambungan API": "API connection error", "Memuatkan status…": "Loading status…",
  "TikTok Shop: sambungkan semula token API.": "TikTok Shop: please reconnect the API token.",
  "Import data pesanan": "Import order data",
  "Muat naik CSV daripada Shopee atau TikTok Shop. Pesanan pendua akan disemak secara automatik.": "Upload a CSV from Shopee or TikTok Shop. Duplicate orders are checked automatically.",
  "Pilih fail": "Choose file", "atau tarik dan lepaskan di sini": "or drag and drop here", "Batal": "Cancel",
  "Fail berjaya diimport dan sedang diproses": "File imported successfully and is being processed",
  "BUTIRAN PESANAN": "ORDER DETAILS", "Butiran pesanan": "Order details", "Produk": "Product", "Pelanggan": "Customer",
  "Nama": "Name", "Punca": "Source",
  "Status": "Status", "Bayaran diterima": "Payment received", "Transaksi disahkan": "Transaction confirmed",
  "Pesanan diproses": "Order processing", "Diserahkan kepada pasukan fulfilment": "Handed to fulfilment team",
  "Pesanan diterima pelanggan": "Order received by customer", "Jumlah dibayar": "Amount paid",
  "Invois": "Invoice", "sedang disediakan": "is being prepared", "Kemas kini status": "Update status", "Status pesanan telah dikemas kini": "Order status updated",
  "PENYATA": "STATEMENT", "Jumlah komisen KretivWork": "Total KretivWork commission",
  "Pesanan pending, refund dan pembatalan telah dikecualikan daripada pengiraan.": "Pending orders, refunds and cancellations are excluded from the calculation.",
  "Muat turun": "Download", "Menjana PDF…": "Generating PDF…", "Luluskan penyata": "Approve statement", "Siap": "Done", "Tutup": "Close",
  "Tukar kepada pandangan Chef Ammar untuk menguji fungsi kelulusan.": "Switch to Chef Ammar's view to test the approval function.",
  "Ikhtisar": "Summary", "Terperinci": "Detailed", "Description": "Description", "Amount": "Amount",
  "Weekly commission on completed sales": "Weekly commission on completed sales", "Commission rate": "Commission rate",
  "Invoice komisen diluluskan.": "Commission invoice approved.", "Bayaran dummy ke KretivCo direkodkan.": "Dummy payment to KretivCo recorded.",
  "Penyata telah diluluskan": "Statement has been approved", "Fail CSV sedang disediakan": "CSV file is being prepared",
  "Isn": "Mon", "Sel": "Tue", "Rab": "Wed", "Kha": "Thu", "Jum": "Fri", "Sab": "Sat", "Ahd": "Sun",
  "Dijadualkan": "Scheduled", "Lihat kempen": "View campaign",
  "Kempen telah dijadualkan": "Campaign has been scheduled", "Kempen dibatalkan": "Campaign cancelled",
  "Kempen video TikTok Shop": "TikTok Shop video campaign",
  "Susulan daripada insight: TikTok Shop berkembang 24.8% minggu ini.": "Following up on the insight: TikTok Shop grew 24.8% this week.",
  "RANCANG KEMPEN": "PLAN CAMPAIGN", "Kemas kini kempen": "Update campaign", "Kempen baharu": "New campaign",
  "Nama kempen": "Campaign name", "Saluran sasaran": "Target channel", "Jenis kandungan": "Content type",
  "Video pendek": "Short video", "Siaran langsung": "Livestream", "Post foto": "Photo post", "KOL & Affiliate": "KOL & Affiliate",
  "Hari disyorkan": "Recommended days", "Bajet (RM, pilihan)": "Budget (RM, optional)", "Nota": "Notes",
  "Batalkan kempen": "Cancel campaign", "Jadualkan kempen": "Schedule campaign",
};

const LangContext = createContext<{ lang: Lang; t: (s: string) => string }>({ lang: "bm", t: (s) => s });
function useLang() {
  return useContext(LangContext);
}

const orders: Order[] = mockOrders;

const chart = [
  { day: "Isn", date: "13 Jul", bcl: 850, shopee: 620, tiktok: 390 },
  { day: "Sel", date: "14 Jul", bcl: 1020, shopee: 740, tiktok: 520 },
  { day: "Rab", date: "15 Jul", bcl: 780, shopee: 930, tiktok: 460 },
  { day: "Kha", date: "16 Jul", bcl: 1250, shopee: 850, tiktok: 650 },
  { day: "Jum", date: "17 Jul", bcl: 1180, shopee: 1020, tiktok: 720 },
  { day: "Sab", date: "18 Jul", bcl: 1780, shopee: 1260, tiktok: 780 },
  { day: "Ahd", date: "19 Jul", bcl: 1552, shopee: 816, tiktok: 578 },
];

const COMMISSION_PER_ITEM = 2;
const AVG_ITEMS_PER_ORDER = orders.reduce((sum, o) => sum + Number(o.item.match(/× (\d+)/)?.[1] ?? 1), 0) / orders.length;
const itemsSoldFor = (orderCount: number) => Math.round(orderCount * AVG_ITEMS_PER_ORDER);
const commissionFor = (orderCount: number) => itemsSoldFor(orderCount) * COMMISSION_PER_ITEM;

const periodSummaries = {
  "Minggu ini": { label: "13–19 Julai 2026", sales: 18746.2, orders: 423, commission: commissionFor(423), average: 44.32, scale: 1, salesChange: "+16.4%", orderChange: "+11.2%" },
  "Minggu lepas": { label: "6–12 Julai 2026", sales: 16108.4, orders: 380, commission: commissionFor(380), average: 42.39, scale: 0.86, salesChange: "+8.1%", orderChange: "+6.8%" },
  "Bulan ini": { label: "1–19 Julai 2026", sales: 68142.8, orders: 1536, commission: commissionFor(1536), average: 44.36, scale: 3.64, salesChange: "+21.7%", orderChange: "+18.5%" },
};

const channels = [
  { name: "BCL.my", sub: "Direct sales", sales: "RM8,412", orders: 184, share: 45, color: "#d97706", change: "+18.2%" },
  { name: "Shopee", sub: "Marketplace", sales: "RM6,236", orders: 147, share: 33, color: "#ea580c", change: "+9.4%" },
  { name: "TikTok Shop", sub: "Social commerce", sales: "RM4,098", orders: 92, share: 22, color: "#0d9488", change: "+24.8%" },
];

type PaymentStatus = "draft" | "approved" | "paid";
type FinanceDocument = "invoice" | "receipt" | null;

const commissionWeek = {
  invoiceNo: "INV-KW-2026-029",
  receiptNo: "RCT-KW-2026-029",
  period: "13-19 Julai 2026",
  issuedDate: "20 Julai 2026",
  dueDate: "22 Julai 2026",
  paidDate: "21 Julai 2026",
  grossSales: 18746.2,
  excluded: 319.7,
  netSales: 18746.2,
  perItem: COMMISSION_PER_ITEM,
  itemsSold: itemsSoldFor(periodSummaries["Minggu ini"].orders),
  commission: periodSummaries["Minggu ini"].commission,
  bank: "Demo Bank",
  account: "KretivCo Sdn. Bhd. - demo beneficiary only",
  reference: "KWCA-2026-W29",
};

const weekSeeds: { period: string; invoiceNo: string; sales: number; scale: number; orders: number; closed: boolean }[] = [
  { period: "13–19 Jul 2026", invoiceNo: "INV-KW-2026-029", sales: periodSummaries["Minggu ini"].sales, scale: 1, orders: periodSummaries["Minggu ini"].orders, closed: false },
  { period: "6–12 Jul 2026", invoiceNo: "INV-KW-2026-028", sales: periodSummaries["Minggu lepas"].sales, scale: 0.86, orders: periodSummaries["Minggu lepas"].orders, closed: true },
  { period: "29 Jun–5 Jul 2026", invoiceNo: "INV-KW-2026-027", sales: 14932, scale: 0.8, orders: 337, closed: true },
];

const weeklyStatements = weekSeeds.map((seed, week) => {
  const weekOrders: Order[] = orders.map((o, i) => ({
    ...o,
    id: `#CA-${1048 - week * 6 - i}`,
    amount: Math.round(o.amount * seed.scale * 100) / 100,
    status: seed.closed ? "Selesai" : o.status,
  }));
  const items = itemsSoldFor(seed.orders);
  return {
    period: seed.period,
    invoiceNo: seed.invoiceNo,
    sales: seed.sales,
    orders: seed.orders,
    items,
    commission: commissionFor(seed.orders),
    closed: seed.closed,
    weekOrders,
  };
});

const attributionSources = [
  { id: "threads", name: "Threads", short: "TH", type: "Organic content", sales: 5436, orders: 122, clicks: 2814, color: "#7c3aed", tint: "#7c3aed1f", channels: { "BCL.my": 3000, Shopee: 1800, "TikTok Shop": 636 } },
  { id: "tiktok-content", name: "TikTok Content", short: "TK", type: "Video content", sales: 4874, orders: 109, clicks: 3320, color: "#db2777", tint: "#db27771f", channels: { "BCL.my": 1200, Shopee: 1374, "TikTok Shop": 2300 } },
  { id: "affiliate", name: "KOL / Affiliate", short: "AF", type: "Referral link", sales: 3562, orders: 78, clicks: 1440, color: "#d97706", tint: "#d977061f", channels: { "BCL.my": 1600, Shopee: 1300, "TikTok Shop": 662 } },
  { id: "whatsapp", name: "WhatsApp", short: "WA", type: "Direct message", sales: 2249, orders: 51, clicks: 692, color: "#3b82f6", tint: "#3b82f61f", channels: { "BCL.my": 1500, Shopee: 550, "TikTok Shop": 199 } },
  { id: "organic", name: "Organic / Direct", short: "OD", type: "Search & direct", sales: 1687, orders: 39, clicks: 512, color: "#0891b2", tint: "#0891b21f", channels: { "BCL.my": 800, Shopee: 700, "TikTok Shop": 187 } },
  { id: "unknown", name: "Tidak dikenal pasti", short: "?", type: "No tracking data", sales: 938, orders: 24, clicks: 0, color: "#64748b", tint: "#64748b1f", channels: { "BCL.my": 312, Shopee: 512, "TikTok Shop": 114 } },
];

const nav = [
  { id: "overview", label: "Ringkasan", icon: LayoutDashboard },
  { id: "sales", label: "Jualan", icon: ShoppingBag, count: 12 },
  { id: "finance", label: "Kewangan", icon: WalletCards, count: 1 },
  { id: "settings", label: "Tetapan", icon: Settings },
];

function currency(value: number) {
  return new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(value);
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const { t } = useLang();
  return <span className={`status status-${status.toLowerCase()}`}><span />{t(status)}</span>;
}

function ChannelLogo({ name, color }: { name: string; color: string }) {
  const icon =
    name === "Shopee" ? <SiShopee size={20} /> :
    name === "TikTok Shop" ? <SiTiktok size={19} /> :
    <Store size={21} strokeWidth={2} />;
  return <span className="channel-logo" style={{ color }}>{icon}</span>;
}

function Dropdown({ value, options, onChange, ariaLabel, className }: { value: string; options: (string | { value: string; label: string })[]; onChange: (value: string) => void; ariaLabel?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const items = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const current = items.find((item) => item.value === value) ?? items[0];

  useEffect(() => {
    if (!open) return;
    setActiveIndex(Math.max(0, items.findIndex((item) => item.value === value)));
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) { e.preventDefault(); setOpen(true); return; }
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => Math.min(items.length - 1, i + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => Math.max(0, i - 1)); }
    if (e.key === "Enter") { e.preventDefault(); onChange(items[activeIndex].value); setOpen(false); }
  };

  return (
    <div className={`dropdown ${className ?? ""}`} ref={rootRef} onKeyDown={onKeyDown}>
      <button type="button" className="dropdown-trigger" aria-haspopup="listbox" aria-expanded={open} aria-label={ariaLabel} onClick={() => setOpen((v) => !v)}>
        <span>{current?.label}</span>
        <ChevronDown size={14} className="dropdown-chevron" />
      </button>
      {open && (
        <ul className="dropdown-menu" role="listbox">
          {items.map((item, i) => (
            <li
              key={item.value}
              role="option"
              aria-selected={item.value === value}
              className={`${item.value === value ? "active" : ""} ${i === activeIndex ? "highlighted" : ""}`}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => { onChange(item.value); setOpen(false); }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function buildConicGradient(segments: { color: string; value: number }[]) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0) || 1;
  let acc = 0;
  const stops = segments.map((seg) => {
    const start = (acc / total) * 100;
    acc += seg.value;
    return `${seg.color} ${start}% ${(acc / total) * 100}%`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

function Sparkline({ id, data, stroke }: { id: string; data: number[]; stroke: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = 100 / (data.length - 1);
  const points = data.map((value, i) => [i * step, 30 - ((value - min) / range) * 26] as const);
  const line = points.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `0,32 ${line} 100,32`;
  const [lastX, lastY] = points[points.length - 1];
  return (
    <svg className="sparkline" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.5" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#spark-${id})`} />
      <polyline points={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="2.6" fill={stroke} />
    </svg>
  );
}

function GoalGauge({ pct }: { pct: number }) {
  const circumference = 2 * Math.PI * 46;
  const offset = circumference - (Math.min(100, pct) / 100) * circumference;
  return (
    <svg className="gauge-svg" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="46" className="gauge-track" />
      <circle cx="60" cy="60" r="46" className="gauge-value" strokeDasharray={circumference} strokeDashoffset={offset} />
    </svg>
  );
}

const paymentBreakdown = (() => {
  const palette = ["#059669", "#ea580c", "#3b82f6", "#d97706", "#7c3aed"];
  const map = new Map<string, { count: number; total: number }>();
  for (const order of orders) {
    const entry = map.get(order.payment) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += order.amount;
    map.set(order.payment, entry);
  }
  return Array.from(map.entries())
    .map(([method, value], i) => ({ method, ...value, color: palette[i % palette.length] }))
    .sort((a, b) => b.total - a.total);
})();

const productBreakdown = (() => {
  const map = new Map<string, { name: string; code: string; color: string; orders: number; total: number }>();
  for (const order of orders) {
    const name = order.item.split(" × ")[0];
    const entry = map.get(name) ?? { name, code: order.productCode, color: order.productTone, orders: 0, total: 0 };
    entry.orders += 1;
    entry.total += order.amount;
    map.set(name, entry);
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
})();

const activityFeed = [
  { id: 1, text: "Pesanan #CA-1048 disahkan", meta: "BCL.my · RM51.80", time: "2 min lalu", tone: "green" as const },
  { id: 2, text: "TikTok Shop token luput", meta: "Sambungan API perlu disegar semula", time: "12 min lalu", tone: "amber" as const },
  { id: 3, text: "Pesanan #CA-1047 sedang diproses", meta: "TikTok Shop · RM25.90", time: "38 min lalu", tone: "blue" as const },
  { id: 4, text: "Refund #CA-1044 diluluskan", meta: "Shopee · RM25.90", time: "1 jam lalu", tone: "amber" as const },
  { id: 5, text: "Penyata minggu lepas dibayar", meta: "RM2,416.26 ke KretivCo", time: "3 jam lalu", tone: "green" as const },
];

export default function Home() {
  const [active, setActive] = useState("overview");
  const [salesTab, setSalesTab] = useState("orders");
  const [financeTab, setFinanceTab] = useState("studio");
  const [settingsTab, setSettingsTab] = useState("system");
  const [mobileNav, setMobileNav] = useState(false);
  const [period, setPeriod] = useState("Minggu ini");
  const [chartMetric, setChartMetric] = useState<"sales" | "orders">("sales");
  const [selectedChartDay, setSelectedChartDay] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Semua status");
  const [role, setRole] = useState<"KretivWork" | "Chef Ammar">("KretivWork");
  const [importOpen, setImportOpen] = useState(false);
  const [openStatementWeek, setOpenStatementWeek] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [approved, setApproved] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("draft");
  const [payMethod, setPayMethod] = useState<"bank" | "qr">("bank");
  const [statusHydrated, setStatusHydrated] = useState(false);
  const [financeDocument, setFinanceDocument] = useState<FinanceDocument>(null);
  const [toast, setToast] = useState("");
  const [lang, setLang] = useState<Lang>("bm");
  const t = (s: string) => (lang === "en" ? EN[s] ?? s : s);
  const [liveOrders, setLiveOrders] = useState<Order[] | null>(null);
  const [sourceStatus, setSourceStatus] = useState<Record<DataSourceKey, SourceStatus> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data: { orders: Order[]; sources: Record<DataSourceKey, SourceStatus> }) => {
        if (cancelled) return;
        setLiveOrders(data.orders);
        setSourceStatus(data.sources);
      })
      .catch((err) => console.error("Failed to load orders", err));
    return () => { cancelled = true; };
  }, []);

  const orderList = liveOrders ?? orders;
  const filteredOrders = useMemo(() => orderList.filter((order) => {
    const matchesQuery = `${order.id} ${order.customer} ${order.item} ${order.channel} ${order.payment}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === "Semua status" || order.status === status);
  }), [orderList, query, status]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/commission-status")
      .then((res) => res.json())
      .then((data: { approved: boolean; paid: boolean; payMethod: "bank" | "qr" }) => {
        if (cancelled) return;
        setApproved(data.approved);
        setPaymentStatus(data.paid ? "paid" : data.approved ? "approved" : "draft");
        setPayMethod(data.payMethod);
      })
      .catch((err) => console.error("Failed to load commission status", err))
      .finally(() => { if (!cancelled) setStatusHydrated(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!statusHydrated) return;
    fetch("/api/commission-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved, paid: paymentStatus === "paid", payMethod }),
    }).catch((err) => console.error("Failed to save commission status", err));
  }, [statusHydrated, approved, paymentStatus, payMethod]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const syncNow = () => {
    if (syncing) return;
    setSyncing(true);
    window.setTimeout(() => {
      setSyncing(false);
      notify("BCL.my dan Shopee telah dikemas kini. TikTok Shop perlu disambung semula.");
    }, 1200);
  };

  const title = nav.find((item) => item.id === active)?.label ?? "Ringkasan";
  const summary = periodSummaries[period as keyof typeof periodSummaries];
  const selectedDay = chart.find((item) => item.day === selectedChartDay);
  const chartValue = (value: number) => chartMetric === "sales" ? value * summary.scale : Math.round(value * summary.scale / summary.average);
  const chartCeiling = chartMetric === "sales" ? 2000 * summary.scale : 2000 * summary.scale / summary.average;
  const formatChartValue = (value: number) => chartMetric === "sales" ? currency(value) : Math.round(value).toLocaleString("en-MY");
  const openOrdersFor = (channel: string) => {
    setActive("sales");
    setSalesTab("orders");
    setQuery(channel === "Semua" ? "" : channel);
  };

  const dayTotals = chart.map((d) => d.bcl + d.shopee + d.tiktok);
  const dayOrdersEst = dayTotals.map((v) => Math.max(1, Math.round(v / 44)));
  const salesSeries = dayTotals.map((v) => v * summary.scale);
  const ordersSeries = dayOrdersEst.map((v) => Math.round(v * summary.scale));
  const commissionSeries = ordersSeries.map((v) => v * AVG_ITEMS_PER_ORDER * COMMISSION_PER_ITEM);
  const averageSeries = dayTotals.map((v, i) => v / dayOrdersEst[i]);
  const goalTarget = period === "Bulan ini" ? 80000 : 20000;
  const goalPct = Math.round((summary.sales / goalTarget) * 100);
  const paymentDonut = buildConicGradient(paymentBreakdown.map((p) => ({ color: p.color, value: p.count })));

  return (
    <LangContext.Provider value={{ lang, t }}>
    <main className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-lockup"><span className="brand-mark">KW</span><i>×</i><span className="chef-mark">CA</span></div>
          <div><strong>Central Sales</strong><span>KretivWork · Chef Ammar</span></div>
        </div>
        <button className="sidebar-close" onClick={() => setMobileNav(false)} aria-label={t("Tutup menu")}><X size={20} /></button>

        <nav className="main-nav" aria-label={t("Navigasi utama")}>
          {nav.map(({ id, label, icon: Icon, count }) => (
            <button key={id} className={active === id ? "nav-item active" : "nav-item"} onClick={() => { setActive(id); setMobileNav(false); }}>
              <Icon size={18} strokeWidth={1.9} />
              <span>{t(label)}</span>
              {count ? <b>{count}</b> : null}
            </button>
          ))}
        </nav>

        <div className="sync-status-line">
          {syncing ? <LoaderCircle className="spin" size={14} /> : <span className="pulse-dot" />}
          <span>{syncing ? t("Menyelaraskan data…") : t("Dikemas kini 4 min lalu")}</span>
          <button onClick={syncNow} aria-label={t("Selaraskan data")}><RefreshCw size={14} /></button>
        </div>

        <div className="profile-mini">
          <div className="avatar">AS</div>
          <div><strong>Amnan Syahmi</strong><span>Administrator</span></div>
        </div>
      </aside>

      {mobileNav && <button className="backdrop" onClick={() => setMobileNav(false)} aria-label={t("Tutup menu")} />}

      <section className="workspace">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileNav(true)} aria-label={t("Buka menu")}><Menu size={21} /></button>
          <div className="topbar-title"><span>KretivWork × Chef Ammar</span><strong>{t(title)}</strong></div>
          <div className="top-actions">
            <div className="lang-switch" role="group" aria-label="Language">
              <button className={lang === "bm" ? "active" : ""} onClick={() => setLang("bm")}>BM</button>
              <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
            </div>
            <button className="role-switch" onClick={() => setRole(role === "KretivWork" ? "Chef Ammar" : "KretivWork")}>
              <span className={role === "Chef Ammar" ? "chef-dot" : "kw-dot"}>{role === "Chef Ammar" ? "CA" : "KW"}</span>
              {t("Pandangan")}: {role}<ChevronDown size={15} />
            </button>
            <button className="icon-button" onClick={() => notify(t("Tiada notifikasi baharu"))} aria-label={t("Notifikasi")}><Bell size={19} /><i /></button>
          </div>
        </header>

        <div className="content">
          <section className="page-heading">
            <div>
              <h1>{active === "overview" ? t("Ringkasan jualan") : t(title)}</h1>
              <p>{summary.label} · BCL.my, Shopee dan TikTok Shop</p>
            </div>
            <div className="heading-actions">
              <Dropdown className="period-dropdown" value={period} onChange={setPeriod} options={["Minggu ini", "Minggu lepas", "Bulan ini"].map((v) => ({ value: v, label: t(v) }))} ariaLabel={t("Tempoh laporan")} />
              <button className="secondary-button" onClick={() => setImportOpen(true)}>{t("Import")}</button>
              <button className="primary-button" onClick={() => setOpenStatementWeek(0)}>{t("Penyata")}</button>
            </div>
          </section>

          {active === "overview" && (
            <>
              <section className="metrics-grid">
                <button className="metric metric-featured metric-button" onClick={() => { setActive("sales"); setSalesTab("orders"); setStatus("Semua status"); }}>
                  <div className="metric-top"><span className="metric-kicker">Revenue</span><span className="positive">{summary.salesChange}</span></div>
                  <p>{t("Jumlah jualan")}</p><h2>{currency(summary.sales)}</h2><small>{period === "Minggu ini" ? t("RM2,638 lebih tinggi berbanding minggu lepas") : summary.label}</small>
                  <Sparkline id="sales" data={salesSeries} stroke="#059669" />
                  <span className="metric-link">{t("Lihat pesanan")}</span>
                </button>
                <button className="metric metric-button" onClick={() => { setActive("sales"); setSalesTab("orders"); setStatus("Selesai"); }}>
                  <div className="metric-top"><span className="metric-kicker">Orders</span><span className="positive">{summary.orderChange}</span></div>
                  <p>{t("Pesanan selesai")}</p><h2>{summary.orders.toLocaleString("en-MY")}</h2><small>{Math.round(summary.orders * 1.057).toLocaleString("en-MY")} {t("jumlah pesanan")}</small>
                  <Sparkline id="orders" data={ordersSeries} stroke="#3b82f6" />
                  <span className="metric-link">{t("Tapis pesanan")}</span>
                </button>
                <button className="metric metric-button" onClick={() => { setActive("finance"); setFinanceTab("studio"); }}>
                  <div className="metric-top"><span className="metric-kicker">Commission</span><span className="positive">+16.4%</span></div>
                  <p>{t("Komisen KretivWork")}</p><h2>{currency(summary.commission)}</h2><small>{t("Kadar komisen semasa")}: RM{COMMISSION_PER_ITEM}/item</small>
                  <Sparkline id="commission" data={commissionSeries} stroke="#d97706" />
                  <span className="metric-link">{t("Buka invoice")}</span>
                </button>
                <button className="metric metric-button" onClick={() => { setActive("sales"); setSalesTab("channels"); }}>
                  <div className="metric-top"><span className="metric-kicker">Average order</span><span className="negative">−2.1%</span></div>
                  <p>{t("Purata nilai pesanan")}</p><h2>{currency(summary.average)}</h2><small>{period === "Minggu ini" ? t("RM0.96 lebih rendah dari minggu lepas") : summary.label}</small>
                  <Sparkline id="average" data={averageSeries} stroke="#7c3aed" />
                  <span className="metric-link">{t("Banding saluran")}</span>
                </button>
              </section>

              <section className="analytics-grid">
                <article className="panel chart-panel">
                  <div className="panel-heading">
                    <div><h3>{t("Trend jualan mingguan")}</h3><p>{t("Nilai jualan harian mengikut saluran")}</p></div>
                    <div className="chart-heading-tools"><div className="legend"><span><i className="bcl" />BCL.my</span><span><i className="shopee" />Shopee</span><span><i className="tiktok" />TikTok</span></div><div className="chart-toggle"><button className={chartMetric === "sales" ? "active" : ""} onClick={() => setChartMetric("sales")}>{t("Jualan")}</button><button className={chartMetric === "orders" ? "active" : ""} onClick={() => setChartMetric("orders")}>{t("Order")}</button></div></div>
                  </div>
                  <div className="chart-area">
                    <div className="y-axis"><span>{formatChartValue(chartCeiling)}</span><span>{formatChartValue(chartCeiling * .75)}</span><span>{formatChartValue(chartCeiling * .5)}</span><span>{formatChartValue(chartCeiling * .25)}</span><span>0</span></div>
                    <div className="bars">
                      {chart.map((item) => <button className={`bar-day ${selectedChartDay === item.day ? "selected" : ""}`} key={item.day} onClick={() => setSelectedChartDay(selectedChartDay === item.day ? null : item.day)}><span className="bar-stack"><span className="bar bcl" data-tooltip={`${item.date} · BCL.my · ${formatChartValue(chartValue(item.bcl))}`} style={{ height: `${chartValue(item.bcl) / chartCeiling * 100}%` }} /><span className="bar shopee" data-tooltip={`${item.date} · Shopee · ${formatChartValue(chartValue(item.shopee))}`} style={{ height: `${chartValue(item.shopee) / chartCeiling * 100}%` }} /><span className="bar tiktok" data-tooltip={`${item.date} · TikTok · ${formatChartValue(chartValue(item.tiktok))}`} style={{ height: `${chartValue(item.tiktok) / chartCeiling * 100}%` }} /></span><span className="day-label">{t(item.day)}</span></button>)}
                    </div>
                  </div>
                  {selectedDay && <div className="chart-selection"><span><small>{selectedDay.date}</small><strong>{formatChartValue(chartValue(selectedDay.bcl + selectedDay.shopee + selectedDay.tiktok))}</strong></span><span><small>{t("Saluran tertinggi")}</small><strong>{selectedDay.bcl >= selectedDay.shopee && selectedDay.bcl >= selectedDay.tiktok ? "BCL.my" : selectedDay.shopee >= selectedDay.tiktok ? "Shopee" : "TikTok Shop"}</strong></span><button onClick={() => openOrdersFor("Semua")}>{t("Lihat pesanan hari ini")}</button></div>}
                </article>

                <article className="panel settlement-card">
                  <div className="panel-heading"><div><h3>{t("Penyata semasa")}</h3><p>{summary.label}</p></div><span className={approved ? "approved-pill" : "review-pill"}>{approved ? t("Diluluskan") : t("Perlu semakan")}</span></div>
                  <div className="settlement-amount"><span>{t("Komisen perlu dibayar")}</span><strong>{currency(summary.commission)}</strong></div>
                  <div className="settlement-row"><span>{t("Jualan selesai")}</span><strong>{currency(summary.sales)}</strong></div>
                  <div className="settlement-row"><span>{t("Kadar komisen")}</span><strong>RM{COMMISSION_PER_ITEM}/item</strong></div>
                  <div className="settlement-row"><span>{t("Refund & pembatalan")}</span><strong>− RM319.70</strong></div>
                  <div className="approval-flow"><span className="done">1</span><i /><span className={approved ? "done" : "current"}>2</span><i /><span>3</span></div>
                  <div className="flow-labels"><span>{t("Dijana")}</span><span>{approved ? t("Diluluskan") : t("Semakan Chef")}</span><span>{t("Bayaran")}</span></div>
                  <button className="full-button" onClick={() => setOpenStatementWeek(0)}>{role === "Chef Ammar" && !approved ? t("Semak & luluskan penyata") : t("Lihat butiran penyata")}</button>
                </article>
              </section>

              <section className="widgets-grid">
                <article className="panel widget-card goal-widget">
                  <div className="panel-heading"><div><h3>{t("Sasaran mingguan")}</h3><p>{t("Matlamat")} {currency(goalTarget)}</p></div></div>
                  <div className="gauge-wrap">
                    <GoalGauge pct={goalPct} />
                    <div className="gauge-center"><strong>{goalPct}%</strong><span>{t("dari sasaran")}</span></div>
                  </div>
                  <div className="goal-foot"><span>{currency(summary.sales)}</span><span>{currency(Math.max(0, goalTarget - summary.sales))} {t("lagi")}</span></div>
                </article>

                <article className="panel widget-card payment-widget">
                  <div className="panel-heading"><div><h3>{t("Kaedah pembayaran")}</h3><p>{t("Pecahan pesanan terkini")}</p></div></div>
                  <div className="mini-donut-section">
                    <div className="sales-donut mini-donut" style={{ background: paymentDonut }}><div><strong>{orders.length}</strong><span>{t("pesanan")}</span></div></div>
                    <div className="mini-legend">
                      {paymentBreakdown.map((p) => <span className="mini-legend-row" key={p.method}><i style={{ background: p.color }} /><b>{p.method}</b><em>{p.count}</em></span>)}
                    </div>
                  </div>
                </article>

                <article className="panel widget-card products-widget">
                  <div className="panel-heading"><div><h3>{t("Produk terlaris")}</h3><p>{t("Ikut jumlah jualan minggu ini")}</p></div></div>
                  <div className="rank-list">
                    {productBreakdown.map((p, i) => (
                      <div className="rank-row" key={p.name}>
                        <span className="rank-index">{i + 1}</span>
                        <span className="product-thumb" style={{ background: p.color }}>{p.code}</span>
                        <span className="rank-info"><strong>{p.name}</strong><small>{p.orders} {t("pesanan")}</small></span>
                        <b>{currency(p.total)}</b>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="panel widget-card activity-widget">
                  <div className="panel-heading"><div><h3>{t("Aktiviti terkini")}</h3><p>{t("Kemas kini masa nyata")}</p></div><span className="live-pill"><i />Live</span></div>
                  <ul className="activity-list">
                    {activityFeed.map((a) => (
                      <li className={`activity-item tone-${a.tone}`} key={a.id}>
                        <span className="activity-dot" />
                        <span className="activity-body"><strong>{a.text}</strong><small>{a.meta}</small></span>
                        <time>{a.time}</time>
                      </li>
                    ))}
                  </ul>
                </article>
              </section>

              <section className="channel-section">
                <div className="section-heading"><div><h3>{t("Prestasi saluran")}</h3><p>{t("Bahagian jualan minggu ini")}</p></div><button onClick={() => { setActive("sales"); setSalesTab("channels"); }}>{t("Lihat semua")}</button></div>
                <div className="channel-grid">
                  {channels.map((channel) => <button className="channel-card channel-card-button" key={channel.name} onClick={() => openOrdersFor(channel.name)}>
                    <div className="channel-head"><ChannelLogo name={channel.name} color={channel.color} /><div><strong>{channel.name}</strong><span>{channel.sub}</span></div><b>{channel.change}</b></div>
                    <h4>{channel.sales}</h4><p>{channel.orders} {t("pesanan")} · {channel.share}% {t("daripada jualan")}</p>
                    <div className="progress"><i style={{ width: `${channel.share}%`, background: channel.color }} /></div>
                  </button>)}
                </div>
              </section>
            </>
          )}

          {active === "overview" && (
            <OrdersPanel orders={filteredOrders} query={query} setQuery={setQuery} status={status} setStatus={setStatus} expanded={false} notify={notify} onSelectOrder={setSelectedOrder} />
          )}

          {active === "sales" && <>
            <SectionTabs value={salesTab} onChange={setSalesTab} tabs={[{ id: "orders", label: "Pesanan" }, { id: "channels", label: "Saluran" }, { id: "sources", label: "Sumber" }]} />
            {salesTab === "orders" && <OrdersPanel orders={filteredOrders} query={query} setQuery={setQuery} status={status} setStatus={setStatus} expanded notify={notify} onSelectOrder={setSelectedOrder} />}
            {salesTab === "channels" && <ChannelsView notify={notify} />}
            {salesTab === "sources" && <AttributionView onOpenOrders={openOrdersFor} />}
          </>}
          {active === "finance" && <>
            <SectionTabs value={financeTab} onChange={setFinanceTab} tabs={[{ id: "studio", label: "Commission" }, { id: "statements", label: "Penyata" }, { id: "payments", label: "Pembayaran" }]} />
            {financeTab === "studio" && <CommissionStudio paymentStatus={paymentStatus} payMethod={payMethod} setPayMethod={setPayMethod} onApprove={() => { setApproved(true); setPaymentStatus("approved"); notify(t("Invoice komisen diluluskan.")); }} onPay={() => { setApproved(true); setPaymentStatus("paid"); notify(t("Bayaran dummy ke KretivCo direkodkan.")); }} onOpenDocument={setFinanceDocument} />}
            {financeTab === "statements" && <StatementsView approved={approved} paid={paymentStatus === "paid"} onOpenWeek={(i) => setOpenStatementWeek(i)} />}
            {financeTab === "payments" && <PaymentsView paymentStatus={paymentStatus} payMethod={payMethod} setPayMethod={setPayMethod} onPay={() => { setApproved(true); setPaymentStatus("paid"); notify(t("Bayaran dummy ke KretivCo direkodkan.")); }} onOpenReceipt={() => setFinanceDocument("receipt")} />}
          </>}
          {active === "settings" && <>
            <SectionTabs value={settingsTab} onChange={setSettingsTab} tabs={[{ id: "system", label: "Sistem" }, { id: "team", label: "Pasukan" }]} />
            {settingsTab === "system" && <SettingsView notify={notify} sourceStatus={sourceStatus} />}
            {settingsTab === "team" && <TeamView notify={notify} />}
          </>}
        </div>
      </section>

      <nav className="mobile-bottom-nav" aria-label={t("Navigasi utama")}>
        {nav.map(({ id, label, icon: Icon }) => <button key={id} className={active === id ? "active" : ""} onClick={() => setActive(id)}><Icon size={19} /><span>{t(label)}</span></button>)}
      </nav>

      {importOpen && <ImportModal onClose={() => setImportOpen(false)} onDone={() => { setImportOpen(false); notify(t("Fail berjaya diimport dan sedang diproses")); }} />}
      {openStatementWeek !== null && <StatementDrawer weekIndex={openStatementWeek} role={role} approved={approved} paid={paymentStatus === "paid"} onClose={() => setOpenStatementWeek(null)} onApprove={() => { setApproved(true); setPaymentStatus("approved"); setOpenStatementWeek(null); notify(t("Penyata telah diluluskan")); }} />}
      {selectedOrder && <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} notify={notify} />}
      {financeDocument === "invoice" && <FinanceDocumentDrawer type="invoice" paymentStatus={paymentStatus} onClose={() => setFinanceDocument(null)} onPay={() => { setApproved(true); setPaymentStatus("paid"); notify(t("Bayaran dummy ke KretivCo direkodkan.")); }} />}
      {financeDocument === "receipt" && <FinanceDocumentDrawer type="receipt" paymentStatus={paymentStatus} onClose={() => setFinanceDocument(null)} onPay={() => { setApproved(true); setPaymentStatus("paid"); notify(t("Bayaran dummy ke KretivCo direkodkan.")); }} />}
      {toast && <div className="toast"><span className="toast-dot" />{toast}</div>}
    </main>
    </LangContext.Provider>
  );
}

function SectionTabs({ value, onChange, tabs }: { value: string; onChange: (value: string) => void; tabs: { id: string; label: string }[] }) {
  const { t } = useLang();
  return <div className="section-tabs" role="tablist">{tabs.map((tab) => <button key={tab.id} role="tab" aria-selected={value === tab.id} className={value === tab.id ? "active" : ""} onClick={() => onChange(tab.id)}>{t(tab.label)}</button>)}</div>;
}

function OrdersPanel({ orders, query, setQuery, status, setStatus, expanded, notify, onSelectOrder }: { orders: Order[]; query: string; setQuery: (v: string) => void; status: string; setStatus: (v: string) => void; expanded: boolean; notify: (v: string) => void; onSelectOrder: (order: Order) => void }) {
  const { t } = useLang();
  const [channel, setChannel] = useState("Semua saluran");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const perPage = expanded ? 4 : 5;
  const sortedOrders = useMemo(() => {
    const result = orders.filter((order) => channel === "Semua saluran" || order.channel === channel);
    if (sort === "highest") result.sort((a, b) => b.amount - a.amount);
    if (sort === "lowest") result.sort((a, b) => a.amount - b.amount);
    return result;
  }, [orders, channel, sort]);
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / perPage));
  const visibleOrders = sortedOrders.slice((page - 1) * perPage, page * perPage);

  return <section className={`panel orders-panel ${expanded ? "orders-expanded" : ""}`}>
    <div className="panel-heading orders-heading"><div><h3>{expanded ? t("Pesanan") : t("Pesanan terkini")}</h3><p>{expanded ? `${sortedOrders.length} ${t("rekod ditemui")}` : t("Aktiviti jualan terbaru")}</p></div><div className="table-actions">
      <label className="search-box"><Search size={16} /><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder={t("Cari...")} /></label>
      <Dropdown className="filter-select" value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={["Semua status", "Selesai", "Diproses", "Refund"].map((v) => ({ value: v, label: t(v) }))} ariaLabel={t("Tapis status")} />
      <Dropdown className="filter-select compact-select" value={channel} onChange={(v) => { setChannel(v); setPage(1); }} options={["Semua saluran", "BCL.my", "Shopee", "TikTok Shop"].map((v) => ({ value: v, label: t(v) }))} ariaLabel={t("Tapis saluran")} />
      <Dropdown className="filter-select compact-select" value={sort} onChange={setSort} options={[{ value: "latest", label: t("Terkini") }, { value: "highest", label: t("Nilai tertinggi") }, { value: "lowest", label: t("Nilai terendah") }]} ariaLabel={t("Susun ikut")} />
      <button className="export-button" onClick={() => notify(t("Fail CSV sedang disediakan"))}>{t("Export")}</button>
    </div></div>
    <div className="table-wrap"><table><thead><tr><th>{t("PESANAN")}</th><th>{t("PELANGGAN")}</th><th>{t("SALURAN")}</th><th>{t("PRODUK")}</th><th>{t("JUMLAH")}</th><th>{t("STATUS")}</th><th /></tr></thead><tbody>{visibleOrders.map((order) => <tr key={order.id} tabIndex={0} onClick={() => onSelectOrder(order)} onKeyDown={(e) => { if (e.key === "Enter") onSelectOrder(order); }}><td><strong>{order.id}</strong><small>{order.time}</small></td><td><div className="customer"><span>{order.initials}</span><strong>{order.customer}</strong></div></td><td><span className={`channel-tag ${order.channel.split(".")[0].toLowerCase().replace(" shop", "")}`}>{order.channel}</span></td><td><div className="product-cell"><span className="product-thumb" style={{ background: order.productTone }}>{order.productCode}</span><span><strong>{order.item}</strong><small>Chef Ammar™ Arabic Spices</small></span></div></td><td><strong>{currency(order.amount)}</strong></td><td><StatusBadge status={order.status} /></td><td><button className="row-menu" aria-label={`${t("Buka")} ${order.id}`} onClick={(e) => { e.stopPropagation(); onSelectOrder(order); }}><ChevronRight size={17} /></button></td></tr>)}</tbody></table>{sortedOrders.length === 0 && <div className="empty-state"><Search size={28} /><strong>{t("Tiada pesanan")}</strong><span>{t("Ubah carian atau filter.")}</span><button onClick={() => { setQuery(""); setStatus("Semua status"); setChannel("Semua saluran"); }}>{t("Kosongkan filter")}</button></div>}</div>
    {sortedOrders.length > 0 && <div className="table-pagination"><span>{t("Menunjukkan")} {(page - 1) * perPage + 1}–{Math.min(page * perPage, sortedOrders.length)} {t("daripada")} {sortedOrders.length}</span><div><button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label={t("Halaman sebelumnya")}><ChevronLeft size={15} /></button><b>{page} / {totalPages}</b><button disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} aria-label={t("Halaman seterusnya")}><ChevronRight size={15} /></button></div></div>}
  </section>;
}

type CampaignDetails = { name: string; channel: string; contentType: string; days: string[]; budget: string; notes: string };

function ChannelsView({ notify }: { notify: (v: string) => void }) {
  const { t } = useLang();
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/campaign")
      .then((res) => res.json())
      .then((data: { campaign: CampaignDetails | null }) => { if (!cancelled) setCampaign(data.campaign); })
      .catch((err) => console.error("Failed to load campaign", err));
    return () => { cancelled = true; };
  }, []);

  return <section className="view-stack">
    <div className="channel-grid channel-grid-large">{channels.map((channel) => <article className="channel-card channel-detail" key={channel.name}><div className="channel-head"><ChannelLogo name={channel.name} color={channel.color} /><div><strong>{channel.name}</strong><span>{channel.sub}</span></div><b>{channel.change}</b></div><h4>{channel.sales}</h4><div className="detail-grid"><span>{t("Pesanan")}<strong>{channel.orders}</strong></span><span>{t("Bahagian jualan")}<strong>{channel.share}%</strong></span><span>{t("Purata pesanan")}<strong>{currency(Number(channel.sales.replace(/[^0-9]/g, "")) / channel.orders)}</strong></span></div><div className="connection-ok"><i />{t("Sambungan aktif · 4 minit lalu")}</div></article>)}</div>
    <article className="panel insight-panel">
      <div>
        <span className="insight-index">01</span>
        <h3>{t("TikTok Shop berkembang paling pantas")}</h3>
        <p>{t("Jualan meningkat 24.8% minggu ini. Pertimbangkan kandungan video masakan pada Jumaat dan Sabtu.")}</p>
        {campaign && <div className="campaign-status"><span className="approved-pill">{t("Dijadualkan")}</span><span>{campaign.name} · {campaign.days.map((d) => t(d)).join(", ")}</span></div>}
      </div>
      <button onClick={() => setCampaignOpen(true)}>{campaign ? t("Lihat kempen") : t("Rancang kempen")}</button>
    </article>
    {campaignOpen && <CampaignModal
      initial={campaign}
      onClose={() => setCampaignOpen(false)}
      onSave={(details) => {
        setCampaign(details);
        setCampaignOpen(false);
        notify(t("Kempen telah dijadualkan"));
        fetch("/api/campaign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(details) })
          .catch((err) => console.error("Failed to save campaign", err));
      }}
      onCancel={() => {
        setCampaign(null);
        setCampaignOpen(false);
        notify(t("Kempen dibatalkan"));
        fetch("/api/campaign", { method: "DELETE" }).catch((err) => console.error("Failed to cancel campaign", err));
      }}
    />}
  </section>;
}

function CampaignModal({ initial, onClose, onSave, onCancel }: { initial: CampaignDetails | null; onClose: () => void; onSave: (details: CampaignDetails) => void; onCancel: () => void }) {
  const { t } = useLang();
  const [name, setName] = useState(initial?.name ?? t("Kempen video TikTok Shop"));
  const [channel, setChannel] = useState(initial?.channel ?? "TikTok Shop");
  const [contentType, setContentType] = useState(initial?.contentType ?? "Video pendek");
  const [days, setDays] = useState<string[]>(initial?.days ?? ["Jum", "Sab"]);
  const [budget, setBudget] = useState(initial?.budget ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? t("Susulan daripada insight: TikTok Shop berkembang 24.8% minggu ini."));

  const toggleDay = (day: string) => setDays((current) => current.includes(day) ? current.filter((d) => d !== day) : [...current, day]);

  return <div className="modal-layer" role="dialog" aria-modal="true">
    <div className="modal campaign-modal">
      <button className="modal-close" onClick={onClose}><X size={20} /></button>
      <p className="eyebrow">{t("RANCANG KEMPEN")}</p>
      <h2>{initial ? t("Kemas kini kempen") : t("Kempen baharu")}</h2>
      <label className="field-label">{t("Nama kempen")}<input value={name} onChange={(e) => setName(e.target.value)} /></label>
      <div className="campaign-grid">
        <label className="field-label">{t("Saluran sasaran")}<Dropdown value={channel} onChange={setChannel} options={channels.map((c) => c.name)} ariaLabel={t("Saluran sasaran")} /></label>
        <label className="field-label">{t("Jenis kandungan")}<Dropdown value={contentType} onChange={setContentType} options={["Video pendek", "Siaran langsung", "Post foto", "KOL & Affiliate"].map((v) => ({ value: v, label: t(v) }))} ariaLabel={t("Jenis kandungan")} /></label>
      </div>
      <span className="field-label">{t("Hari disyorkan")}</span>
      <div className="day-picker">
        {chart.map((c) => <button type="button" key={c.day} className={days.includes(c.day) ? "active" : ""} onClick={() => toggleDay(c.day)}>{t(c.day)}</button>)}
      </div>
      <label className="field-label">{t("Bajet (RM, pilihan)")}<input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="500" inputMode="numeric" /></label>
      <label className="field-label">{t("Nota")}<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} /></label>
      <div className="modal-actions">
        {initial && <button className="secondary-button" onClick={onCancel}>{t("Batalkan kempen")}</button>}
        <button className="primary-button" disabled={!name.trim() || days.length === 0} onClick={() => onSave({ name, channel, contentType, days, budget, notes })}>{initial ? t("Kemas kini kempen") : t("Jadualkan kempen")}</button>
      </div>
    </div>
  </div>;
}

function AttributionView({ onOpenOrders }: { onOpenOrders: (channel: string) => void }) {
  const { t } = useLang();
  const [selected, setSelected] = useState("all");
  const [metric, setMetric] = useState<"sales" | "orders">("sales");
  const activeSource = attributionSources.find((source) => source.id === selected);
  const totalSales = attributionSources.reduce((sum, source) => sum + source.sales, 0);
  const totalOrders = attributionSources.reduce((sum, source) => sum + source.orders, 0);
  const selectedSales = activeSource?.sales ?? totalSales;
  const selectedOrders = activeSource?.orders ?? totalOrders;
  const selectedClicks = activeSource?.clicks ?? attributionSources.reduce((sum, source) => sum + source.clicks, 0);
  const selectedChannels = activeSource?.channels ?? attributionSources.reduce((acc, source) => ({
    "BCL.my": acc["BCL.my"] + source.channels["BCL.my"],
    Shopee: acc.Shopee + source.channels.Shopee,
    "TikTok Shop": acc["TikTok Shop"] + source.channels["TikTok Shop"],
  }), { "BCL.my": 0, Shopee: 0, "TikTok Shop": 0 });
  const maxChannel = Math.max(...Object.values(selectedChannels));
  const selectedLabel = activeSource?.name ?? "Semua sumber";

  return <section className="attribution-view">
    <header className="attribution-header">
      <div>
        <p className="eyebrow">{t("SUMBER JUALAN")}</p>
        <h2>{t("Dari mana jualan datang?")}</h2>
        <p>{t("Sumber pelanggan dan platform checkout.")}</p>
      </div>
      <div className="attribution-summary">
        <span><strong>95%</strong><small>{t("Jualan dapat dikenal pasti")}</small></span>
        <i />
        <span><strong>Threads</strong><small>{t("Sumber jualan tertinggi")}</small></span>
        <i />
        <span><strong>7.7%</strong><small>{t("Conversion terbaik · WhatsApp")}</small></span>
      </div>
    </header>

    <div className="attribution-controls">
      <div className="source-tabs" role="tablist" aria-label={t("Pilih sumber jualan")}>
        <button className={selected === "all" ? "active" : ""} onClick={() => setSelected("all")}><span className="source-tab-icon all">ALL</span><span><strong>{t("Semua sumber")}</strong><small>RM18,746 · 100%</small></span></button>
        {attributionSources.map((source) => <button key={source.id} className={selected === source.id ? "active" : ""} onClick={() => setSelected(source.id)}><span className="source-tab-icon" style={{ background: source.tint, color: source.color }}>{source.short}</span><span><strong>{source.name}</strong><small>{currency(source.sales)} · {Math.round(source.sales / totalSales * 100)}%</small></span></button>)}
      </div>
      <div className="metric-toggle"><button className={metric === "sales" ? "active" : ""} onClick={() => setMetric("sales")}>{t("Nilai jualan")}</button><button className={metric === "orders" ? "active" : ""} onClick={() => setMetric("orders")}>{t("Bilangan order")}</button></div>
    </div>

    <div className="attribution-layout">
      <article className="panel source-breakdown">
        <div className="panel-heading"><div><h3>{t("Pecahan sumber")}</h3><p>{t("Pilih sumber untuk melihat aliran")}</p></div><span className="live-pill"><i />Live</span></div>
        <div className="donut-section">
          <div className="donut-wrap">
            <div className={`sales-donut ${selected !== "all" ? "donut-selected" : ""}`} style={{ background: selected !== "all" && activeSource ? `conic-gradient(${activeSource.color} 0 ${activeSource.sales / totalSales * 100}%, #e7eae5 ${activeSource.sales / totalSales * 100}% 100%)` : buildConicGradient(attributionSources.map((source) => ({ color: source.color, value: metric === "sales" ? source.sales : source.orders }))) }}><div><strong>{metric === "sales" ? currency(selectedSales).replace("MYR", "RM") : selectedOrders}</strong><span>{metric === "sales" ? t("jumlah jualan") : t("jumlah order")}</span></div></div>
          </div>
          <div className="source-legend">
            {attributionSources.map((source) => <button key={source.id} className={selected === source.id ? "active" : ""} onClick={() => setSelected(source.id)}><i style={{ background: source.color }} /><span><strong>{source.name}</strong><small>{source.orders} {t("order")}</small></span><b>{metric === "sales" ? currency(source.sales) : source.orders}</b><em>{Math.round((metric === "sales" ? source.sales / totalSales : source.orders / totalOrders) * 100)}%</em></button>)}
          </div>
        </div>
      </article>

      <article className="panel flow-panel">
        <div className="panel-heading"><div><h3>{t("Aliran jualan")}: {selectedLabel}</h3><p>{t("Dari sumber pemasaran kepada platform checkout")}</p></div><button className="info-button" title={t("UTM, referral code atau tracking link digunakan untuk mengenal pasti sumber.")}>i</button></div>
        <div className="flow-story">
          <div className="flow-origin">
            <span style={{ background: activeSource?.tint ?? "#e5efe9", color: activeSource?.color ?? "#1d6049" }}>{activeSource?.short ?? "ALL"}</span>
            <small>{t("SUMBER PELANGGAN")}</small><strong>{selectedLabel}</strong>
            <p>{activeSource?.type ?? t("Semua aktiviti pemasaran")}</p>
          </div>
          <div className="flow-lines" aria-hidden="true"><i /><i /><i /></div>
          <div className="flow-destinations">
            {Object.entries(selectedChannels).map(([name, value]) => {
              const channel = channels.find((item) => item.name === name)!;
              return <button key={name} onClick={() => onOpenOrders(name)}><ChannelLogo name={name} color={channel.color} /><span><small>{t("CHECKOUT DI")}</small><strong>{name}</strong><em><i style={{ width: `${value / maxChannel * 100}%`, background: channel.color }} /></em></span><b>{currency(value)}<small>{Math.round(value / selectedSales * 100)}%</small></b></button>;
            })}
          </div>
        </div>
        <div className="flow-metrics">
          <span><small>{t("Klik")}</small><strong>{selectedClicks.toLocaleString("en-MY")}</strong></span>
          <span><small>{t("Order selesai")}</small><strong>{selectedOrders}</strong></span>
          <span><small>Conversion</small><strong>{selectedClicks ? (selectedOrders / selectedClicks * 100).toFixed(1) : "—"}%</strong></span>
          <span><small>{t("Nilai purata")}</small><strong>{currency(selectedSales / selectedOrders)}</strong></span>
        </div>
      </article>
    </div>

    <article className="panel journey-panel">
      <div className="panel-heading"><div><h3>{t("Bagaimana jualan dikenal pasti?")}</h3><p>{t("Daripada content hingga order selesai")}</p></div><span className="tracking-health"><i />{t("Tracking aktif")}</span></div>
      <div className="journey-flow">
        <div><span>01</span><small>DISCOVERY</small><strong>{t("Nampak content")}</strong><p>{t("Threads, TikTok, KOL atau WhatsApp")}</p></div><i />
        <div><span>02</span><small>ATTRIBUTION</small><strong>{t("Tekan tracking link")}</strong><p>{t("UTM dan referral code direkod")}</p></div><i />
        <div><span>03</span><small>CHECKOUT</small><strong>{t("Pilih platform")}</strong><p>BCL.my, Shopee atau TikTok Shop</p></div><i />
        <div><span>04</span><small>REVENUE</small><strong>{t("Order disahkan")}</strong><p>{t("Jualan masuk ke central dashboard")}</p></div>
      </div>
    </article>

    <div className="attribution-footer-note"><span><strong>{t("5% jualan belum dikenal pasti.")}</strong> {t("Gunakan UTM link, kod affiliate dan landing page khusus.")}</span><button>{t("Lihat cadangan tracking")}</button></div>
  </section>;
}

function PaymentMethodBox({ payMethod, setPayMethod, reference, amount }: { payMethod: "bank" | "qr"; setPayMethod: (v: "bank" | "qr") => void; reference: string; amount: number }) {
  const { t } = useLang();
  const qrValue = `KretivCo Sdn. Bhd. | ${currency(amount)} | REF:${reference}`;
  return <>
    <div className="payment-method-toggle" role="tablist">
      <button role="tab" aria-selected={payMethod === "bank"} className={payMethod === "bank" ? "active" : ""} onClick={() => setPayMethod("bank")}>{t("Bank Transfer")}</button>
      <button role="tab" aria-selected={payMethod === "qr"} className={payMethod === "qr" ? "active" : ""} onClick={() => setPayMethod("qr")}>{t("QR Pay")}</button>
    </div>
    {payMethod === "bank" ? (
      <div className="bank-box">
        <small>Beneficiary</small>
        <strong>KretivCo Sdn. Bhd.</strong>
        <span>{commissionWeek.bank} · masked account · {reference}</span>
      </div>
    ) : (
      <div className="qr-box">
        <div className="qr-code-wrap"><QRCodeSVG value={qrValue} size={124} bgColor="transparent" fgColor="#2b2118" level="M" /></div>
        <strong>{currency(amount)}</strong>
        <span>{t("Imbas untuk bayar KretivCo")}</span>
      </div>
    )}
  </>;
}

function CommissionStudio({ paymentStatus, payMethod, setPayMethod, onApprove, onPay, onOpenDocument }: { paymentStatus: PaymentStatus; payMethod: "bank" | "qr"; setPayMethod: (v: "bank" | "qr") => void; onApprove: () => void; onPay: () => void; onOpenDocument: (type: FinanceDocument) => void }) {
  const { t } = useLang();
  const paid = paymentStatus === "paid";
  const approved = paymentStatus === "approved" || paid;
  return <section className="commission-studio">
    <article className="panel commission-hero">
      <div className="commission-copy">
        <p className="eyebrow">WEEKLY COMMISSION</p>
        <h2>{commissionWeek.invoiceNo}</h2>
        <p>{commissionWeek.period} · {periodSummaries["Minggu ini"].orders} {t("order selesai")} · RM{commissionWeek.perItem}/item · {commissionWeek.itemsSold} {t("item")}</p>
      </div>
      <div className="commission-total">
        <span>{t("Jumlah perlu dibayar")}</span>
        <strong>{currency(commissionWeek.commission)}</strong>
        <small>{paid ? `${t("Dibayar pada")} ${commissionWeek.paidDate}` : `Due ${commissionWeek.dueDate}`}</small>
      </div>
      <div className="commission-actions">
        <button className="secondary-button" onClick={() => onOpenDocument("invoice")}>Preview invoice</button>
        <button className="primary-button" onClick={paid ? () => onOpenDocument("receipt") : approved ? onPay : onApprove}>{paid ? t("Lihat resit") : approved ? "Pay KretivCo" : "Approve invoice"}</button>
      </div>
    </article>

    <article className="panel finance-flow-modern">
      <div className="finance-step complete"><b>01</b><strong>Sales closed</strong><span>{currency(commissionWeek.grossSales)}</span></div>
      <i />
      <div className="finance-step complete"><b>02</b><strong>Invoice generated</strong><span>{commissionWeek.invoiceNo}</span></div>
      <i />
      <div className={`finance-step ${approved ? "complete" : "active"}`}><b>03</b><strong>Approval</strong><span>{approved ? "Approved" : "Pending Chef Ammar"}</span></div>
      <i />
      <div className={`finance-step ${paid ? "complete" : approved ? "active" : ""}`}><b>04</b><strong>Payment</strong><span>{paid ? commissionWeek.receiptNo : "KretivCo"}</span></div>
    </article>

    <div className="finance-split">
      <article className="panel invoice-card">
        <div className="panel-heading"><div><h3>{t("Invoice komisen")}</h3><p>{t("Dummy invoice untuk pembayaran KretivCo")}</p></div><span className={approved ? "approved-pill" : "review-pill"}>{approved ? "Approved" : "Draft"}</span></div>
        <div className="invoice-lines">
          <span><small>{t("Jualan bersih")}</small><strong>{currency(commissionWeek.netSales)}</strong></span>
          <span><small>{t("Komisen")}</small><strong>RM{commissionWeek.perItem} × {commissionWeek.itemsSold} {t("item")}</strong></span>
          <span><small>{t("Refund dikecualikan")}</small><strong>-{currency(commissionWeek.excluded)}</strong></span>
          <span><small>Payable</small><strong>{currency(commissionWeek.commission)}</strong></span>
        </div>
        <button className="full-button" onClick={() => onOpenDocument("invoice")}>{t("Buka invoice")}</button>
      </article>
      <article className="panel invoice-card">
        <div className="panel-heading"><div><h3>{t("Payment ke KretivCo")}</h3><p>{t("Rekod bayaran dummy untuk test flow")}</p></div><span className={paid ? "approved-pill" : "review-pill"}>{paid ? "Paid" : "Unpaid"}</span></div>
        <PaymentMethodBox payMethod={payMethod} setPayMethod={setPayMethod} reference={commissionWeek.reference} amount={commissionWeek.commission} />
        <button className="full-button" disabled={paid} onClick={onPay}>{paid ? t("Bayaran telah direkod") : "Pay KretivCo (dummy)"}</button>
      </article>
    </div>
  </section>;
}

function StatementsView({ approved, paid, onOpenWeek }: { approved: boolean; paid: boolean; onOpenWeek: (weekIndex: number) => void }) {
  const { t } = useLang();
  const weeks = weeklyStatements.map((week, i) => ({
    ...week,
    status: i === 0 ? (paid ? "Dibayar" : approved ? "Diluluskan" : "Perlu semakan") : "Dibayar",
  }));
  return <section className="panel statement-list"><div className="panel-heading"><div><h3>{t("Rekod penyata")}</h3><p>{t("Komisen mingguan KretivWork")}</p></div></div>{weeks.map((week, i) => <button className="statement-item" key={week.period} onClick={() => onOpenWeek(i)}><span className="statement-index">W{29 - i}</span><span><strong>{week.period}</strong><small>{currency(week.sales)} {t("jualan selesai")}</small></span><span><small>{t("Komisen")}</small><strong>{currency(week.commission)}</strong></span><span className={week.status === "Dibayar" || week.status === "Diluluskan" ? "approved-pill" : "review-pill"}>{t(week.status)}</span><span className="row-action">{t("Buka")}</span></button>)}</section>;
}

function PaymentsView({ paymentStatus, payMethod, setPayMethod, onPay, onOpenReceipt }: { paymentStatus: PaymentStatus; payMethod: "bank" | "qr"; setPayMethod: (v: "bank" | "qr") => void; onPay: () => void; onOpenReceipt: () => void }) {
  const { t } = useLang();
  const paid = paymentStatus === "paid";
  return <section className="view-stack"><div className="metrics-grid payments-metrics"><article className="metric metric-featured"><p>{t("Jumlah telah dibayar")}</p><h2>{paid ? "RM11,732.09" : "RM8,920.16"}</h2><small>{paid ? t("4 pembayaran termasuk minggu ini") : t("3 pembayaran terdahulu")}</small></article><article className="metric"><p>{paid ? t("Bayaran minggu ini") : t("Menunggu bayaran")}</p><h2>{currency(commissionWeek.commission)}</h2><small>{commissionWeek.invoiceNo}</small></article><article className="metric"><p>{t("Rujukan")}</p><h2>{paid ? "Paid" : "22 Jul"}</h2><small>{paid ? commissionWeek.receiptNo : t("Tarikh bayaran seterusnya")}</small></article></div><article className="panel payment-flow-card"><div><h3>{t("Aliran pembayaran")}</h3><p>{t("Bayaran dibuat selepas invoice komisen diluluskan oleh Chef Ammar.")}</p></div><div className="payment-steps"><span className="complete"><b>1</b>{t("Jualan selesai")}</span><i /><span className="complete"><b>2</b>{t("Invoice dijana")}</span><i /><span className="complete"><b>3</b>{t("Kelulusan Chef")}</span><i /><span className={paid ? "complete" : "active"}><b>4</b>{paid ? t("Resit tersedia") : t("Bayaran")}</span></div><PaymentMethodBox payMethod={payMethod} setPayMethod={setPayMethod} reference={commissionWeek.reference} amount={commissionWeek.commission} /><div className="payment-actions"><button className="secondary-button" onClick={onOpenReceipt} disabled={!paid}>{t("Preview resit")}</button><button className="primary-button" onClick={onPay} disabled={paid}>{paid ? t("Sudah dibayar") : "Pay KretivCo (dummy)"}</button></div></article></section>;
}

function TeamView({ notify }: { notify: (v: string) => void }) {
  const { t } = useLang();
  return <section className="panel team-panel"><div className="panel-heading"><div><h3>{t("Akses pasukan")}</h3><p>{t("Peranan dan tahap akses")}</p></div><button className="primary-button" onClick={() => notify(t("Jemputan pengguna baharu dibuka"))}>{t("Jemput pengguna")}</button></div>{[{ name: "Amnan Syahmi", email: "amnan@kretivwork.my", role: "Administrator", initials: "AS" }, { name: "Chef Ammar", email: "ammar@chefammar.com", role: "Approver", initials: "CA" }, { name: "Finance KretivWork", email: "finance@kretivwork.my", role: "Finance", initials: "FK" }].map((user) => <div className="team-row" key={user.email}><span className="avatar">{user.initials}</span><span><strong>{user.name}</strong><small>{user.email}</small></span><b>{user.role}</b><span className="status status-selesai"><span />{t("Aktif")}</span></div>)}</section>;
}

const CHANNEL_TO_SOURCE_KEY: Record<string, DataSourceKey> = { "BCL.my": "bclmy", Shopee: "shopee", "TikTok Shop": "tiktok" };

function SettingsView({ notify, sourceStatus }: { notify: (v: string) => void; sourceStatus: Record<DataSourceKey, SourceStatus> | null }) {
  const { t } = useLang();
  return <section className="settings-grid"><article className="panel settings-panel"><h3>{t("Tetapan komisen")}</h3><p>{t("Kadar ini digunakan untuk penyata baharu.")}</p><label>{t("Kadar komisen KretivWork")}<div style={{ width: 170 }}><span style={{ paddingLeft: 12 }}>RM</span><input defaultValue={COMMISSION_PER_ITEM} style={{ width: 40, padding: "0 4px" }} /><span style={{ paddingRight: 12 }}>/ item</span></div></label><button className="primary-button" onClick={() => notify(t("Tetapan komisen disimpan"))}>{t("Simpan perubahan")}</button></article><article className="panel settings-panel"><h3>{t("Sambungan platform")}</h3><p>{t("Status sumber data pesanan.")}</p>{channels.map((channel) => {
    const status = sourceStatus?.[CHANNEL_TO_SOURCE_KEY[channel.name]] ?? null;
    const issue = status === "error";
    const label = status === null ? t("Memuatkan status…") : status === "real" ? t("Disambungkan") : status === "mock" ? t("Data ujian (mock)") : t("Ralat sambungan API");
    const state = status === null ? "…" : status === "real" ? t("Aktif") : status === "mock" ? "Mock" : t("Semak");
    return <button className={`integration-row ${issue ? "has-warning" : status === "mock" ? "is-mock" : ""}`} key={channel.name} onClick={() => issue && notify(t("Ralat sambungan API"))}><ChannelLogo name={channel.name} color={channel.color} /><span><strong>{channel.name}</strong><small>{label}</small></span><span className="integration-state"><i />{state}</span></button>;
  })}</article></section>;
}

function ImportModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { t } = useLang();
  const [file, setFile] = useState("");
  return <div className="modal-layer" role="dialog" aria-modal="true"><div className="modal"><button className="modal-close" onClick={onClose}><X size={20} /></button><p className="eyebrow">IMPORT CSV</p><h2>{t("Import data pesanan")}</h2><p>{t("Muat naik CSV daripada Shopee atau TikTok Shop. Pesanan pendua akan disemak secara automatik.")}</p><label className="drop-zone"><span className="file-type">CSV</span><strong>{file || t("Pilih fail")}</strong><span>{t("atau tarik dan lepaskan di sini")}</span><input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0]?.name ?? "")} /></label><div className="modal-actions"><button className="secondary-button" onClick={onClose}>{t("Batal")}</button><button className="primary-button" disabled={!file} onClick={onDone}>{t("Import")}</button></div></div></div>;
}

function OrderDrawer({ order, onClose, notify }: { order: Order; onClose: () => void; notify: (message: string) => void }) {
  const { t } = useLang();
  return <div className="modal-layer drawer-layer" role="dialog" aria-modal="true" aria-label={`${t("Butiran pesanan")} ${order.id}`}>
    <aside className="drawer">
      <div className="drawer-header"><div><p className="eyebrow">{t("BUTIRAN PESANAN")}</p><h2>{order.id}</h2></div><button className="modal-close" onClick={onClose}><X size={20} /></button></div>
      <div className="drawer-status"><StatusBadge status={order.status} /><span>{order.time}</span></div>
      <section className="drawer-section"><h3>{t("Produk")}</h3><div className="drawer-product"><span className="product-thumb large" style={{ background: order.productTone }}>{order.productCode}</span><span><strong>{order.item}</strong><small>Chef Ammar™ Arabic Spices</small></span><b>{currency(order.amount)}</b></div></section>
      <section className="drawer-section"><h3>{t("Pelanggan")}</h3><div className="drawer-details"><span><small>{t("Nama")}</small><strong>{order.customer}</strong></span><span><small>{t("Bayaran")}</small><strong>{order.payment}</strong></span><span><small>{t("Saluran")}</small><strong>{order.channel}</strong></span><span><small>{t("Punca")}</small><strong>{order.channel === "TikTok Shop" ? "TikTok Content" : order.channel === "Shopee" ? "KOL / Affiliate" : "Threads"}</strong></span></div></section>
      <section className="drawer-section"><h3>{t("Status")}</h3><div className="order-timeline"><span className="complete"><i /><b>{t("Bayaran diterima")}</b><small>{t("Transaksi disahkan")}</small></span><span className={order.status === "Diproses" ? "current" : "complete"}><i>{order.status === "Diproses" ? "2" : ""}</i><b>{t("Pesanan diproses")}</b><small>{t("Diserahkan kepada pasukan fulfilment")}</small></span><span className={order.status === "Selesai" ? "complete" : ""}><i>{order.status === "Selesai" ? "" : "3"}</i><b>{t("Selesai")}</b><small>{t("Pesanan diterima pelanggan")}</small></span></div></section>
      <div className="drawer-total"><span>{t("Jumlah dibayar")}</span><strong>{currency(order.amount)}</strong></div>
      <div className="drawer-actions"><button className="secondary-button" onClick={() => notify(`${t("Invois")} ${order.id} ${t("sedang disediakan")}`)}>{t("Invois")}</button><button className="primary-button" onClick={() => notify(t("Status pesanan telah dikemas kini"))}>{t("Kemas kini status")}</button></div>
    </aside>
  </div>;
}

function StatementDrawer({ weekIndex, role, approved, paid, onClose, onApprove }: { weekIndex: number; role: string; approved: boolean; paid: boolean; onClose: () => void; onApprove: () => void }) {
  const { t } = useLang();
  const [mode, setMode] = useState<"summary" | "detailed">("summary");
  const [downloading, setDownloading] = useState(false);
  const week = weeklyStatements[weekIndex];
  const isCurrent = weekIndex === 0;
  const status = isCurrent ? (paid ? "Dibayar" : approved ? "Diluluskan" : "Perlu semakan") : "Dibayar";
  const canApprove = isCurrent && role === "Chef Ammar" && !approved;
  const statusLabel = status === "Dibayar" ? "Paid" : status === "Diluluskan" ? "Approved" : "Pending review";

  const downloadStatementPdf = async () => {
    setDownloading(true);
    try {
      await downloadPdf(
        <StatementPdfDocument
          invoiceNo={week.invoiceNo}
          period={week.period}
          statusLabel={statusLabel}
          ordersCount={week.orders}
          netSalesLabel={currency(week.sales)}
          commissionRateLabel={`RM${COMMISSION_PER_ITEM} / item`}
          totalLabel={currency(week.commission)}
          mode={mode}
          orders={week.weekOrders.map((o) => ({
            id: o.id,
            customer: o.customer,
            channel: o.channel,
            item: o.item,
            statusLabel: o.status === "Selesai" ? "Completed" : o.status === "Diproses" ? "Processing" : "Refund",
            amountLabel: currency(o.amount),
          }))}
        />,
        `${week.invoiceNo}-${mode}.pdf`
      );
    } finally {
      setDownloading(false);
    }
  };
  return <div className="modal-layer drawer-layer" role="dialog" aria-modal="true"><div className="modal statement-modal drawer">
    <div className="screen-only">
      <button className="modal-close" onClick={onClose}><X size={20} /></button>
      <p className="eyebrow">{t("PENYATA")} #{week.invoiceNo}</p>
      <h2>{week.period}</h2>
      <div className="statement-status-row"><span className={status === "Dibayar" || status === "Diluluskan" ? "approved-pill" : "review-pill"}>{t(status)}</span></div>
      <div className="modal-summary"><span>{week.orders}<small>{t("Pesanan selesai")}</small></span><span>{currency(week.sales)}<small>{t("Jualan bersih")}</small></span><span>RM{COMMISSION_PER_ITEM}/item<small>{t("Kadar komisen")}</small></span></div>
      <div className="modal-total"><span>{t("Jumlah komisen KretivWork")}</span><strong>{currency(week.commission)}</strong></div>
      <div className="statement-print-toggle" role="tablist">
        <button role="tab" aria-selected={mode === "summary"} className={mode === "summary" ? "active" : ""} onClick={() => setMode("summary")}>{t("Ikhtisar")}</button>
        <button role="tab" aria-selected={mode === "detailed"} className={mode === "detailed" ? "active" : ""} onClick={() => setMode("detailed")}>{t("Terperinci")}</button>
      </div>
      {mode === "summary" ? (
        <p className="modal-note">{t("Pesanan pending, refund dan pembatalan telah dikecualikan daripada pengiraan.")}</p>
      ) : (
        <div className="statement-order-table">{week.weekOrders.map((o) => <div className="statement-order-row" key={o.id}><span className="product-thumb" style={{ background: o.productTone }}>{o.productCode}</span><span className="statement-order-info"><strong>{o.id}</strong><small>{o.customer} · {o.channel}</small></span><b>{currency(o.amount)}</b><StatusBadge status={o.status} /></div>)}</div>
      )}
      <div className="modal-actions">
        <button className="secondary-button" onClick={downloadStatementPdf} disabled={downloading}>{downloading ? t("Menjana PDF…") : t("Muat turun")}</button>
        {canApprove ? <button className="primary-button" onClick={onApprove}>{t("Luluskan penyata")}</button> : <button className="primary-button" onClick={onClose}>{isCurrent && approved ? t("Siap") : t("Tutup")}</button>}
      </div>
      {isCurrent && role !== "Chef Ammar" && !approved && <small className="approval-hint">{t("Tukar kepada pandangan Chef Ammar untuk menguji fungsi kelulusan.")}</small>}
    </div>

    <div className="print-sheet">
      <header className="print-sheet-head">
        <div className="print-sheet-brand">
          <strong>KretivCo Sdn. Bhd.</strong>
          <span>Commission Statement · KretivWork × Chef Ammar</span>
        </div>
        <div className="print-sheet-doc-no">
          <span>Statement No.</span>
          <strong>{week.invoiceNo}</strong>
          <span>{week.period}</span>
        </div>
      </header>

      <div className="print-sheet-meta">
        <div><span>Bill to</span><strong>Chef Ammar Group</strong></div>
        <div><span>Pay to</span><strong>KretivCo Sdn. Bhd.</strong></div>
        <div><span>Status</span><strong>{status === "Dibayar" ? "Paid" : status === "Diluluskan" ? "Approved" : "Pending review"}</strong></div>
      </div>

      {mode === "detailed" && (
        <table className="print-sheet-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Channel</th><th>Product</th><th>Status</th><th>Amount</th></tr></thead>
          <tbody>
            {week.weekOrders.map((o) => <tr key={o.id}><td>{o.id}</td><td>{o.customer}</td><td>{o.channel}</td><td>{o.item}</td><td>{o.status === "Selesai" ? "Completed" : o.status === "Diproses" ? "Processing" : "Refund"}</td><td>{currency(o.amount)}</td></tr>)}
          </tbody>
        </table>
      )}

      <table className="print-sheet-table print-sheet-summary-table">
        <tbody>
          <tr><td>Orders completed</td><td>{week.orders}</td></tr>
          <tr><td>Net sales</td><td>{currency(week.sales)}</td></tr>
          <tr><td>Commission rate</td><td>RM{COMMISSION_PER_ITEM} / item</td></tr>
        </tbody>
      </table>

      <div className="print-sheet-total"><span>Total KretivWork commission</span><strong>{currency(week.commission)}</strong></div>

      <p className="print-sheet-note">Pending orders, refunds and cancellations are excluded from this calculation.</p>
      <footer className="print-sheet-footer">KretivWork × Chef Ammar Central Sales — this is a system-generated statement.</footer>
    </div>
  </div></div>;
}

function FinanceDocumentDrawer({ type, paymentStatus, onClose, onPay }: { type: "invoice" | "receipt"; paymentStatus: PaymentStatus; onClose: () => void; onPay: () => void }) {
  const { t } = useLang();
  const paid = paymentStatus === "paid";
  const isReceipt = type === "receipt";
  const [downloading, setDownloading] = useState(false);

  const downloadInvoicePdf = async () => {
    setDownloading(true);
    try {
      await downloadPdf(
        <InvoicePdfDocument
          isReceipt={isReceipt}
          docNo={isReceipt ? commissionWeek.receiptNo : commissionWeek.invoiceNo}
          statusLabel={isReceipt ? "PAID" : paid ? "PAID" : "DUE"}
          period={commissionWeek.period}
          issuedDate={commissionWeek.issuedDate}
          dueOrPaidLabel={isReceipt ? "Paid" : "Due"}
          dueOrPaidDate={isReceipt ? commissionWeek.paidDate : commissionWeek.dueDate}
          reference={commissionWeek.reference}
          payToSub={commissionWeek.account}
          lines={[
            { description: "Weekly commission on completed sales", amount: currency(commissionWeek.netSales) },
            { description: "Commission rate", amount: `RM${commissionWeek.perItem} × ${commissionWeek.itemsSold} item` },
            { description: "Refund / cancellation excluded", amount: `-${currency(commissionWeek.excluded)}` },
          ]}
          totalLabel={isReceipt ? "Total paid" : "Amount due"}
          totalAmount={currency(commissionWeek.commission)}
          note={isReceipt ? "Dummy receipt generated after payment record was created in this dashboard." : "Dummy invoice for UI testing. Real version can later pull order totals from Shopee, TikTok Shop and BCL.my APIs."}
        />,
        `${isReceipt ? commissionWeek.receiptNo : commissionWeek.invoiceNo}.pdf`
      );
    } finally {
      setDownloading(false);
    }
  };

  return <div className="modal-layer drawer-layer" role="dialog" aria-modal="true" aria-label={isReceipt ? "Resit bayaran" : t("Invoice komisen")}>
    <aside className="drawer finance-document-drawer">
      <div className="drawer-header"><div><p className="eyebrow">{isReceipt ? "PAYMENT RECEIPT" : "COMMISSION INVOICE"}</p><h2>{isReceipt ? commissionWeek.receiptNo : commissionWeek.invoiceNo}</h2></div><button className="modal-close" onClick={onClose}><X size={20} /></button></div>
      <section className="doc-paper">
        <div className="doc-topline">
          <span><strong>KretivCo Sdn. Bhd.</strong><small>Commission payable to KretivWork</small></span>
          <b className={isReceipt || paid ? "doc-status-paid" : "doc-status-due"}>{isReceipt ? "PAID" : paid ? "PAID" : "DUE"}</b>
        </div>
        <div className="doc-parties">
          <span><small>Bill to</small><strong>Chef Ammar Group</strong><em>Sales revenue owner</em></span>
          <span><small>Pay to</small><strong>KretivCo Sdn. Bhd.</strong><em>{commissionWeek.account}</em></span>
        </div>
        <div className="doc-meta">
          <span><small>Period</small><strong>{commissionWeek.period}</strong></span>
          <span><small>Issued</small><strong>{commissionWeek.issuedDate}</strong></span>
          <span><small>{isReceipt ? "Paid" : "Due"}</small><strong>{isReceipt ? commissionWeek.paidDate : commissionWeek.dueDate}</strong></span>
          <span><small>Reference</small><strong>{commissionWeek.reference}</strong></span>
        </div>
        <div className="doc-lines">
          <div><strong>Description</strong><strong>Amount</strong></div>
          <div><span>Weekly commission on completed sales</span><span>{currency(commissionWeek.netSales)}</span></div>
          <div><span>Commission rate</span><span>RM{commissionWeek.perItem} × {commissionWeek.itemsSold} item</span></div>
          <div><span>Refund / cancellation excluded</span><span>-{currency(commissionWeek.excluded)}</span></div>
        </div>
        <div className="doc-total"><span>{isReceipt ? "Total paid" : "Amount due"}</span><strong>{currency(commissionWeek.commission)}</strong></div>
        {isReceipt ? <p className="doc-note">Dummy receipt generated after payment record was created in this dashboard.</p> : <p className="doc-note">Dummy invoice for UI testing. Real version can later pull order totals from Shopee, TikTok Shop and BCL.my APIs.</p>}
      </section>
      <div className="drawer-actions"><button className="secondary-button" onClick={downloadInvoicePdf} disabled={downloading}>{downloading ? t("Menjana PDF…") : "Download PDF"}</button>{!paid && <button className="primary-button" onClick={onPay}>Pay KretivCo</button>}{paid && <button className="primary-button" onClick={onClose}>Done</button>}</div>
    </aside>
  </div>;
}
