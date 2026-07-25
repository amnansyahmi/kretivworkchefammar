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
  WalletCards,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type Order = {
  id: string;
  customer: string;
  initials: string;
  channel: "BCL.my" | "Shopee" | "TikTok Shop";
  item: string;
  productCode: string;
  productTone: string;
  payment: string;
  amount: number;
  time: string;
  status: "Selesai" | "Diproses" | "Refund";
};

const orders: Order[] = [
  { id: "#CA-1048", customer: "Farah Nadia", initials: "FN", channel: "BCL.my", item: "Rempah Mandi 140g × 2", productCode: "MA", productTone: "#b87724", payment: "FPX", amount: 51.8, time: "Hari ini, 10:42 AM", status: "Selesai" },
  { id: "#CA-1047", customer: "Syafiq Roslan", initials: "SR", channel: "TikTok Shop", item: "Rempah Kabsah 140g × 1", productCode: "KA", productTone: "#7c5030", payment: "TikTok Pay", amount: 25.9, time: "Hari ini, 9:18 AM", status: "Diproses" },
  { id: "#CA-1046", customer: "Aina Sofea", initials: "AS", channel: "Shopee", item: "Set Mandi + Beriani × 1", productCode: "SET", productTone: "#1d6049", payment: "ShopeePay", amount: 49.8, time: "Semalam, 8:33 PM", status: "Selesai" },
  { id: "#CA-1045", customer: "Mohd Firdaus", initials: "MF", channel: "BCL.my", item: "Rempah Beriani 140g × 3", productCode: "BE", productTone: "#9b5f28", payment: "Kad debit", amount: 77.7, time: "Semalam, 5:07 PM", status: "Selesai" },
  { id: "#CA-1044", customer: "Nurin Izzati", initials: "NI", channel: "Shopee", item: "Rempah Maklubah 140g × 1", productCode: "MK", productTone: "#375846", payment: "ShopeePay", amount: 25.9, time: "17 Jul, 3:24 PM", status: "Refund" },
  { id: "#CA-1043", customer: "Daniel Lim", initials: "DL", channel: "TikTok Shop", item: "Rempah Bukhari 140g × 2", productCode: "BU", productTone: "#ba7824", payment: "TikTok Pay", amount: 51.8, time: "17 Jul, 1:51 PM", status: "Selesai" },
];

const chart = [
  { day: "Isn", date: "13 Jul", bcl: 850, shopee: 620, tiktok: 390 },
  { day: "Sel", date: "14 Jul", bcl: 1020, shopee: 740, tiktok: 520 },
  { day: "Rab", date: "15 Jul", bcl: 780, shopee: 930, tiktok: 460 },
  { day: "Kha", date: "16 Jul", bcl: 1250, shopee: 850, tiktok: 650 },
  { day: "Jum", date: "17 Jul", bcl: 1180, shopee: 1020, tiktok: 720 },
  { day: "Sab", date: "18 Jul", bcl: 1780, shopee: 1260, tiktok: 780 },
  { day: "Ahd", date: "19 Jul", bcl: 1552, shopee: 816, tiktok: 578 },
];

const periodSummaries = {
  "Minggu ini": { label: "13–19 Julai 2026", sales: 18746.2, orders: 423, commission: 2811.93, average: 44.32, scale: 1, salesChange: "+16.4%", orderChange: "+11.2%" },
  "Minggu lepas": { label: "6–12 Julai 2026", sales: 16108.4, orders: 380, commission: 2416.26, average: 42.39, scale: 0.86, salesChange: "+8.1%", orderChange: "+6.8%" },
  "Bulan ini": { label: "1–19 Julai 2026", sales: 68142.8, orders: 1536, commission: 10221.42, average: 44.36, scale: 3.64, salesChange: "+21.7%", orderChange: "+18.5%" },
};

const channels = [
  { name: "BCL.my", sub: "Direct sales", sales: "RM8,412", orders: 184, share: 45, color: "#d97706", tint: "#d977061f", change: "+18.2%" },
  { name: "Shopee", sub: "Marketplace", sales: "RM6,236", orders: 147, share: 33, color: "#ea580c", tint: "#ea580c1f", change: "+9.4%" },
  { name: "TikTok Shop", sub: "Social commerce", sales: "RM4,098", orders: 92, share: 22, color: "#0d9488", tint: "#0d94881f", change: "+24.8%" },
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
  rate: 15,
  commission: 2811.93,
  bank: "Demo Bank",
  account: "KretivCo Sdn. Bhd. - demo beneficiary only",
  reference: "KWCA-2026-W29",
};

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
  return <span className={`status status-${status.toLowerCase()}`}><span />{status}</span>;
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
  const [statementOpen, setStatementOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [approved, setApproved] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("draft");
  const [financeDocument, setFinanceDocument] = useState<FinanceDocument>(null);
  const [toast, setToast] = useState("");

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesQuery = `${order.id} ${order.customer} ${order.item} ${order.channel} ${order.payment}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === "Semua status" || order.status === status);
  }), [query, status]);

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
  const commissionSeries = salesSeries.map((v) => v * (commissionWeek.rate / 100));
  const averageSeries = dayTotals.map((v, i) => v / dayOrdersEst[i]);
  const goalTarget = period === "Bulan ini" ? 80000 : 20000;
  const goalPct = Math.round((summary.sales / goalTarget) * 100);
  const paymentDonut = buildConicGradient(paymentBreakdown.map((p) => ({ color: p.color, value: p.count })));

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-lockup"><span className="brand-mark">KW</span><i>×</i><span className="chef-mark">CA</span></div>
          <div><strong>Central Sales</strong><span>KretivWork · Chef Ammar</span></div>
        </div>
        <button className="sidebar-close" onClick={() => setMobileNav(false)} aria-label="Tutup menu"><X size={20} /></button>

        <nav className="main-nav" aria-label="Navigasi utama">
          {nav.map(({ id, label, icon: Icon, count }) => (
            <button key={id} className={active === id ? "nav-item active" : "nav-item"} onClick={() => { setActive(id); setMobileNav(false); }}>
              <Icon size={18} strokeWidth={1.9} />
              <span>{label}</span>
              {count ? <b>{count}</b> : null}
            </button>
          ))}
        </nav>

        <div className="sync-status-line">
          {syncing ? <LoaderCircle className="spin" size={14} /> : <span className="pulse-dot" />}
          <span>{syncing ? "Menyelaraskan data…" : "Dikemas kini 4 min lalu"}</span>
          <button onClick={syncNow} aria-label="Selaraskan data"><RefreshCw size={14} /></button>
        </div>

        <div className="profile-mini">
          <div className="avatar">AS</div>
          <div><strong>Amnan Syahmi</strong><span>Administrator</span></div>
        </div>
      </aside>

      {mobileNav && <button className="backdrop" onClick={() => setMobileNav(false)} aria-label="Tutup menu" />}

      <section className="workspace">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileNav(true)} aria-label="Buka menu"><Menu size={21} /></button>
          <div className="topbar-title"><span>KretivWork × Chef Ammar</span><strong>{title}</strong></div>
          <div className="top-actions">
            <button className="role-switch" onClick={() => setRole(role === "KretivWork" ? "Chef Ammar" : "KretivWork")}>
              <span className={role === "Chef Ammar" ? "chef-dot" : "kw-dot"}>{role === "Chef Ammar" ? "CA" : "KW"}</span>
              Pandangan: {role}<ChevronDown size={15} />
            </button>
            <button className="icon-button" onClick={() => notify("Tiada notifikasi baharu")} aria-label="Notifikasi"><Bell size={19} /><i /></button>
          </div>
        </header>

        <div className="content">
          <section className="page-heading">
            <div>
              <h1>{active === "overview" ? "Ringkasan jualan" : title}</h1>
              <p>{summary.label} · BCL.my, Shopee dan TikTok Shop</p>
            </div>
            <div className="heading-actions">
              <button className="period-button"><select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Tempoh laporan"><option>Minggu ini</option><option>Minggu lepas</option><option>Bulan ini</option></select></button>
              <button className="secondary-button" onClick={() => setImportOpen(true)}>Import</button>
              <button className="primary-button" onClick={() => setStatementOpen(true)}>Penyata</button>
            </div>
          </section>

          {active === "overview" && (
            <>
              <section className="metrics-grid">
                <button className="metric metric-featured metric-button" onClick={() => { setActive("sales"); setSalesTab("orders"); setStatus("Semua status"); }}>
                  <div className="metric-top"><span className="metric-kicker">Revenue</span><span className="positive">{summary.salesChange}</span></div>
                  <p>Jumlah jualan</p><h2>{currency(summary.sales)}</h2><small>{period === "Minggu ini" ? "RM2,638 lebih tinggi berbanding minggu lepas" : summary.label}</small>
                  <Sparkline id="sales" data={salesSeries} stroke="#059669" />
                  <span className="metric-link">Lihat pesanan</span>
                </button>
                <button className="metric metric-button" onClick={() => { setActive("sales"); setSalesTab("orders"); setStatus("Selesai"); }}>
                  <div className="metric-top"><span className="metric-kicker">Orders</span><span className="positive">{summary.orderChange}</span></div>
                  <p>Pesanan selesai</p><h2>{summary.orders.toLocaleString("en-MY")}</h2><small>{Math.round(summary.orders * 1.057).toLocaleString("en-MY")} jumlah pesanan</small>
                  <Sparkline id="orders" data={ordersSeries} stroke="#3b82f6" />
                  <span className="metric-link">Tapis pesanan</span>
                </button>
                <button className="metric metric-button" onClick={() => { setActive("finance"); setFinanceTab("studio"); }}>
                  <div className="metric-top"><span className="metric-kicker">Commission</span><span className="positive">+16.4%</span></div>
                  <p>Komisen KretivWork</p><h2>{currency(summary.commission)}</h2><small>Kadar komisen semasa: 15%</small>
                  <Sparkline id="commission" data={commissionSeries} stroke="#d97706" />
                  <span className="metric-link">Buka invoice</span>
                </button>
                <button className="metric metric-button" onClick={() => { setActive("sales"); setSalesTab("channels"); }}>
                  <div className="metric-top"><span className="metric-kicker">Average order</span><span className="negative">−2.1%</span></div>
                  <p>Purata nilai pesanan</p><h2>{currency(summary.average)}</h2><small>{period === "Minggu ini" ? "RM0.96 lebih rendah dari minggu lepas" : summary.label}</small>
                  <Sparkline id="average" data={averageSeries} stroke="#7c3aed" />
                  <span className="metric-link">Banding saluran</span>
                </button>
              </section>

              <section className="analytics-grid">
                <article className="panel chart-panel">
                  <div className="panel-heading">
                    <div><h3>Trend jualan mingguan</h3><p>Nilai jualan harian mengikut saluran</p></div>
                    <div className="chart-heading-tools"><div className="legend"><span><i className="bcl" />BCL.my</span><span><i className="shopee" />Shopee</span><span><i className="tiktok" />TikTok</span></div><div className="chart-toggle"><button className={chartMetric === "sales" ? "active" : ""} onClick={() => setChartMetric("sales")}>Jualan</button><button className={chartMetric === "orders" ? "active" : ""} onClick={() => setChartMetric("orders")}>Order</button></div></div>
                  </div>
                  <div className="chart-area">
                    <div className="y-axis"><span>{formatChartValue(chartCeiling)}</span><span>{formatChartValue(chartCeiling * .75)}</span><span>{formatChartValue(chartCeiling * .5)}</span><span>{formatChartValue(chartCeiling * .25)}</span><span>0</span></div>
                    <div className="bars">
                      {chart.map((item) => <button className={`bar-day ${selectedChartDay === item.day ? "selected" : ""}`} key={item.day} onClick={() => setSelectedChartDay(selectedChartDay === item.day ? null : item.day)}><span className="bar-stack"><span className="bar bcl" data-tooltip={`${item.date} · BCL.my · ${formatChartValue(chartValue(item.bcl))}`} style={{ height: `${chartValue(item.bcl) / chartCeiling * 100}%` }} /><span className="bar shopee" data-tooltip={`${item.date} · Shopee · ${formatChartValue(chartValue(item.shopee))}`} style={{ height: `${chartValue(item.shopee) / chartCeiling * 100}%` }} /><span className="bar tiktok" data-tooltip={`${item.date} · TikTok · ${formatChartValue(chartValue(item.tiktok))}`} style={{ height: `${chartValue(item.tiktok) / chartCeiling * 100}%` }} /></span><span className="day-label">{item.day}</span></button>)}
                    </div>
                  </div>
                  {selectedDay && <div className="chart-selection"><span><small>{selectedDay.date}</small><strong>{formatChartValue(chartValue(selectedDay.bcl + selectedDay.shopee + selectedDay.tiktok))}</strong></span><span><small>Saluran tertinggi</small><strong>{selectedDay.bcl >= selectedDay.shopee && selectedDay.bcl >= selectedDay.tiktok ? "BCL.my" : selectedDay.shopee >= selectedDay.tiktok ? "Shopee" : "TikTok Shop"}</strong></span><button onClick={() => openOrdersFor("Semua")}>Lihat pesanan hari ini</button></div>}
                </article>

                <article className="panel settlement-card">
                  <div className="panel-heading"><div><h3>Penyata semasa</h3><p>{summary.label}</p></div><span className={approved ? "approved-pill" : "review-pill"}>{approved ? "Diluluskan" : "Perlu semakan"}</span></div>
                  <div className="settlement-amount"><span>Komisen perlu dibayar</span><strong>{currency(summary.commission)}</strong></div>
                  <div className="settlement-row"><span>Jualan selesai</span><strong>{currency(summary.sales)}</strong></div>
                  <div className="settlement-row"><span>Kadar komisen</span><strong>15%</strong></div>
                  <div className="settlement-row"><span>Refund & pembatalan</span><strong>− RM319.70</strong></div>
                  <div className="approval-flow"><span className="done">1</span><i /><span className={approved ? "done" : "current"}>2</span><i /><span>3</span></div>
                  <div className="flow-labels"><span>Dijana</span><span>{approved ? "Diluluskan" : "Semakan Chef"}</span><span>Bayaran</span></div>
                  <button className="full-button" onClick={() => setStatementOpen(true)}>{role === "Chef Ammar" && !approved ? "Semak & luluskan penyata" : "Lihat butiran penyata"}</button>
                </article>
              </section>

              <section className="widgets-grid">
                <article className="panel widget-card goal-widget">
                  <div className="panel-heading"><div><h3>Sasaran mingguan</h3><p>Matlamat {currency(goalTarget)}</p></div></div>
                  <div className="gauge-wrap">
                    <GoalGauge pct={goalPct} />
                    <div className="gauge-center"><strong>{goalPct}%</strong><span>dari sasaran</span></div>
                  </div>
                  <div className="goal-foot"><span>{currency(summary.sales)}</span><span>{currency(Math.max(0, goalTarget - summary.sales))} lagi</span></div>
                </article>

                <article className="panel widget-card payment-widget">
                  <div className="panel-heading"><div><h3>Kaedah pembayaran</h3><p>Pecahan pesanan terkini</p></div></div>
                  <div className="mini-donut-section">
                    <div className="sales-donut mini-donut" style={{ background: paymentDonut }}><div><strong>{orders.length}</strong><span>pesanan</span></div></div>
                    <div className="mini-legend">
                      {paymentBreakdown.map((p) => <span className="mini-legend-row" key={p.method}><i style={{ background: p.color }} /><b>{p.method}</b><em>{p.count}</em></span>)}
                    </div>
                  </div>
                </article>

                <article className="panel widget-card products-widget">
                  <div className="panel-heading"><div><h3>Produk terlaris</h3><p>Ikut jumlah jualan minggu ini</p></div></div>
                  <div className="rank-list">
                    {productBreakdown.map((p, i) => (
                      <div className="rank-row" key={p.name}>
                        <span className="rank-index">{i + 1}</span>
                        <span className="product-thumb" style={{ background: p.color }}>{p.code}</span>
                        <span className="rank-info"><strong>{p.name}</strong><small>{p.orders} pesanan</small></span>
                        <b>{currency(p.total)}</b>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="panel widget-card activity-widget">
                  <div className="panel-heading"><div><h3>Aktiviti terkini</h3><p>Kemas kini masa nyata</p></div><span className="live-pill"><i />Live</span></div>
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
                <div className="section-heading"><div><h3>Prestasi saluran</h3><p>Bahagian jualan minggu ini</p></div><button onClick={() => { setActive("sales"); setSalesTab("channels"); }}>Lihat semua</button></div>
                <div className="channel-grid">
                  {channels.map((channel) => <button className="channel-card channel-card-button" key={channel.name} onClick={() => openOrdersFor(channel.name)}>
                    <div className="channel-head"><span className="channel-logo" style={{ background: channel.tint, color: channel.color }}>{channel.name === "TikTok Shop" ? "TT" : channel.name[0]}</span><div><strong>{channel.name}</strong><span>{channel.sub}</span></div><b>{channel.change}</b></div>
                    <h4>{channel.sales}</h4><p>{channel.orders} pesanan · {channel.share}% daripada jualan</p>
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
            {salesTab === "channels" && <ChannelsView />}
            {salesTab === "sources" && <AttributionView onOpenOrders={openOrdersFor} />}
          </>}
          {active === "finance" && <>
            <SectionTabs value={financeTab} onChange={setFinanceTab} tabs={[{ id: "studio", label: "Commission" }, { id: "statements", label: "Penyata" }, { id: "payments", label: "Bayaran" }]} />
            {financeTab === "studio" && <CommissionStudio paymentStatus={paymentStatus} onApprove={() => { setApproved(true); setPaymentStatus("approved"); notify("Invoice komisen diluluskan."); }} onPay={() => { setApproved(true); setPaymentStatus("paid"); notify("Bayaran dummy ke KretivCo direkodkan."); }} onOpenDocument={setFinanceDocument} />}
            {financeTab === "statements" && <StatementsView approved={approved} paid={paymentStatus === "paid"} onOpen={() => setStatementOpen(true)} />}
            {financeTab === "payments" && <PaymentsView paymentStatus={paymentStatus} onPay={() => { setApproved(true); setPaymentStatus("paid"); notify("Bayaran dummy ke KretivCo direkodkan."); }} onOpenReceipt={() => setFinanceDocument("receipt")} />}
          </>}
          {active === "settings" && <>
            <SectionTabs value={settingsTab} onChange={setSettingsTab} tabs={[{ id: "system", label: "Sistem" }, { id: "team", label: "Pasukan" }]} />
            {settingsTab === "system" && <SettingsView notify={notify} />}
            {settingsTab === "team" && <TeamView notify={notify} />}
          </>}
        </div>
      </section>

      <nav className="mobile-bottom-nav" aria-label="Navigasi mudah alih">
        {nav.map(({ id, label, icon: Icon }) => <button key={id} className={active === id ? "active" : ""} onClick={() => setActive(id)}><Icon size={19} /><span>{label}</span></button>)}
      </nav>

      {importOpen && <ImportModal onClose={() => setImportOpen(false)} onDone={() => { setImportOpen(false); notify("Fail berjaya diimport dan sedang diproses"); }} />}
      {statementOpen && <StatementModal role={role} approved={approved} onClose={() => setStatementOpen(false)} onApprove={() => { setApproved(true); setPaymentStatus("approved"); setStatementOpen(false); notify("Penyata telah diluluskan"); }} />}
      {selectedOrder && <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} notify={notify} />}
      {financeDocument === "invoice" && <FinanceDocumentDrawer type="invoice" paymentStatus={paymentStatus} onClose={() => setFinanceDocument(null)} onPay={() => { setApproved(true); setPaymentStatus("paid"); notify("Bayaran dummy ke KretivCo direkodkan."); }} />}
      {financeDocument === "receipt" && <FinanceDocumentDrawer type="receipt" paymentStatus={paymentStatus} onClose={() => setFinanceDocument(null)} onPay={() => { setApproved(true); setPaymentStatus("paid"); notify("Bayaran dummy ke KretivCo direkodkan."); }} />}
      {toast && <div className="toast"><span className="toast-dot" />{toast}</div>}
    </main>
  );
}

function SectionTabs({ value, onChange, tabs }: { value: string; onChange: (value: string) => void; tabs: { id: string; label: string }[] }) {
  return <div className="section-tabs" role="tablist">{tabs.map((tab) => <button key={tab.id} role="tab" aria-selected={value === tab.id} className={value === tab.id ? "active" : ""} onClick={() => onChange(tab.id)}>{tab.label}</button>)}</div>;
}

function OrdersPanel({ orders, query, setQuery, status, setStatus, expanded, notify, onSelectOrder }: { orders: Order[]; query: string; setQuery: (v: string) => void; status: string; setStatus: (v: string) => void; expanded: boolean; notify: (v: string) => void; onSelectOrder: (order: Order) => void }) {
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
    <div className="panel-heading orders-heading"><div><h3>{expanded ? "Pesanan" : "Pesanan terkini"}</h3><p>{expanded ? `${sortedOrders.length} rekod ditemui` : "Aktiviti jualan terbaru"}</p></div><div className="table-actions">
      <label className="search-box"><Search size={16} /><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Cari..." /></label>
      <label className="filter-select"><select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option>Semua status</option><option>Selesai</option><option>Diproses</option><option>Refund</option></select></label>
      <label className="filter-select compact-select"><select value={channel} onChange={(e) => { setChannel(e.target.value); setPage(1); }}><option>Semua saluran</option><option>BCL.my</option><option>Shopee</option><option>TikTok Shop</option></select></label>
      <label className="filter-select compact-select"><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="latest">Terkini</option><option value="highest">Nilai tertinggi</option><option value="lowest">Nilai terendah</option></select></label>
      <button className="export-button" onClick={() => notify("Fail CSV sedang disediakan")}>Export</button>
    </div></div>
    <div className="table-wrap"><table><thead><tr><th>PESANAN</th><th>PELANGGAN</th><th>SALURAN</th><th>PRODUK</th><th>JUMLAH</th><th>STATUS</th><th /></tr></thead><tbody>{visibleOrders.map((order) => <tr key={order.id} tabIndex={0} onClick={() => onSelectOrder(order)} onKeyDown={(e) => { if (e.key === "Enter") onSelectOrder(order); }}><td><strong>{order.id}</strong><small>{order.time}</small></td><td><div className="customer"><span>{order.initials}</span><strong>{order.customer}</strong></div></td><td><span className={`channel-tag ${order.channel.split(".")[0].toLowerCase().replace(" shop", "")}`}>{order.channel}</span></td><td><div className="product-cell"><span className="product-thumb" style={{ background: order.productTone }}>{order.productCode}</span><span><strong>{order.item}</strong><small>Chef Ammar™ Arabic Spices</small></span></div></td><td><strong>{currency(order.amount)}</strong></td><td><StatusBadge status={order.status} /></td><td><button className="row-menu" aria-label={`Buka ${order.id}`} onClick={(e) => { e.stopPropagation(); onSelectOrder(order); }}><ChevronRight size={17} /></button></td></tr>)}</tbody></table>{sortedOrders.length === 0 && <div className="empty-state"><Search size={28} /><strong>Tiada pesanan</strong><span>Ubah carian atau filter.</span><button onClick={() => { setQuery(""); setStatus("Semua status"); setChannel("Semua saluran"); }}>Kosongkan filter</button></div>}</div>
    {sortedOrders.length > 0 && <div className="table-pagination"><span>Menunjukkan {(page - 1) * perPage + 1}–{Math.min(page * perPage, sortedOrders.length)} daripada {sortedOrders.length}</span><div><button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Halaman sebelumnya"><ChevronLeft size={15} /></button><b>{page} / {totalPages}</b><button disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} aria-label="Halaman seterusnya"><ChevronRight size={15} /></button></div></div>}
  </section>;
}

function ChannelsView() {
  return <section className="view-stack"><div className="channel-grid channel-grid-large">{channels.map((channel) => <article className="channel-card channel-detail" key={channel.name}><div className="channel-head"><span className="channel-logo" style={{ background: channel.tint, color: channel.color }}>{channel.name === "TikTok Shop" ? "TT" : channel.name[0]}</span><div><strong>{channel.name}</strong><span>{channel.sub}</span></div><b>{channel.change}</b></div><h4>{channel.sales}</h4><div className="detail-grid"><span>Pesanan<strong>{channel.orders}</strong></span><span>Bahagian jualan<strong>{channel.share}%</strong></span><span>Purata pesanan<strong>{currency(Number(channel.sales.replace(/[^0-9]/g, "")) / channel.orders)}</strong></span></div><div className="connection-ok"><i />Sambungan aktif · 4 minit lalu</div></article>)}</div><article className="panel insight-panel"><div><span className="insight-index">01</span><h3>TikTok Shop berkembang paling pantas</h3><p>Jualan meningkat 24.8% minggu ini. Pertimbangkan kandungan video masakan pada Jumaat dan Sabtu.</p></div><button>Rancang kempen</button></article></section>;
}

function AttributionView({ onOpenOrders }: { onOpenOrders: (channel: string) => void }) {
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
        <p className="eyebrow">SUMBER JUALAN</p>
        <h2>Dari mana jualan datang?</h2>
        <p>Sumber pelanggan dan platform checkout.</p>
      </div>
      <div className="attribution-summary">
        <span><strong>95%</strong><small>Jualan dapat dikenal pasti</small></span>
        <i />
        <span><strong>Threads</strong><small>Sumber jualan tertinggi</small></span>
        <i />
        <span><strong>7.7%</strong><small>Conversion terbaik · WhatsApp</small></span>
      </div>
    </header>

    <div className="attribution-controls">
      <div className="source-tabs" role="tablist" aria-label="Pilih sumber jualan">
        <button className={selected === "all" ? "active" : ""} onClick={() => setSelected("all")}><span className="source-tab-icon all">ALL</span><span><strong>Semua sumber</strong><small>RM18,746 · 100%</small></span></button>
        {attributionSources.map((source) => <button key={source.id} className={selected === source.id ? "active" : ""} onClick={() => setSelected(source.id)}><span className="source-tab-icon" style={{ background: source.tint, color: source.color }}>{source.short}</span><span><strong>{source.name}</strong><small>{currency(source.sales)} · {Math.round(source.sales / totalSales * 100)}%</small></span></button>)}
      </div>
      <div className="metric-toggle"><button className={metric === "sales" ? "active" : ""} onClick={() => setMetric("sales")}>Nilai jualan</button><button className={metric === "orders" ? "active" : ""} onClick={() => setMetric("orders")}>Bilangan order</button></div>
    </div>

    <div className="attribution-layout">
      <article className="panel source-breakdown">
        <div className="panel-heading"><div><h3>Pecahan sumber</h3><p>Pilih sumber untuk melihat aliran</p></div><span className="live-pill"><i />Terkini</span></div>
        <div className="donut-section">
          <div className="donut-wrap">
            <div className={`sales-donut ${selected !== "all" ? "donut-selected" : ""}`} style={{ background: selected !== "all" && activeSource ? `conic-gradient(${activeSource.color} 0 ${activeSource.sales / totalSales * 100}%, #e7eae5 ${activeSource.sales / totalSales * 100}% 100%)` : buildConicGradient(attributionSources.map((source) => ({ color: source.color, value: metric === "sales" ? source.sales : source.orders }))) }}><div><strong>{metric === "sales" ? currency(selectedSales).replace("MYR", "RM") : selectedOrders}</strong><span>{metric === "sales" ? "jumlah jualan" : "jumlah order"}</span></div></div>
          </div>
          <div className="source-legend">
            {attributionSources.map((source) => <button key={source.id} className={selected === source.id ? "active" : ""} onClick={() => setSelected(source.id)}><i style={{ background: source.color }} /><span><strong>{source.name}</strong><small>{source.orders} order</small></span><b>{metric === "sales" ? currency(source.sales) : source.orders}</b><em>{Math.round((metric === "sales" ? source.sales / totalSales : source.orders / totalOrders) * 100)}%</em></button>)}
          </div>
        </div>
      </article>

      <article className="panel flow-panel">
        <div className="panel-heading"><div><h3>Aliran jualan: {selectedLabel}</h3><p>Dari sumber pemasaran kepada platform checkout</p></div><button className="info-button" title="UTM, referral code atau tracking link digunakan untuk mengenal pasti sumber.">i</button></div>
        <div className="flow-story">
          <div className="flow-origin">
            <span style={{ background: activeSource?.tint ?? "#e5efe9", color: activeSource?.color ?? "#1d6049" }}>{activeSource?.short ?? "ALL"}</span>
            <small>SUMBER PELANGGAN</small><strong>{selectedLabel}</strong>
            <p>{activeSource?.type ?? "Semua aktiviti pemasaran"}</p>
          </div>
          <div className="flow-lines" aria-hidden="true"><i /><i /><i /></div>
          <div className="flow-destinations">
            {Object.entries(selectedChannels).map(([name, value]) => {
              const channel = channels.find((item) => item.name === name)!;
              return <button key={name} onClick={() => onOpenOrders(name)}><span className="channel-logo" style={{ background: channel.tint, color: channel.color }}>{name === "TikTok Shop" ? "TT" : name[0]}</span><span><small>CHECKOUT DI</small><strong>{name}</strong><em><i style={{ width: `${value / maxChannel * 100}%`, background: channel.color }} /></em></span><b>{currency(value)}<small>{Math.round(value / selectedSales * 100)}%</small></b></button>;
            })}
          </div>
        </div>
        <div className="flow-metrics">
          <span><small>Klik</small><strong>{selectedClicks.toLocaleString("en-MY")}</strong></span>
          <span><small>Order selesai</small><strong>{selectedOrders}</strong></span>
          <span><small>Conversion</small><strong>{selectedClicks ? (selectedOrders / selectedClicks * 100).toFixed(1) : "—"}%</strong></span>
          <span><small>Nilai purata</small><strong>{currency(selectedSales / selectedOrders)}</strong></span>
        </div>
      </article>
    </div>

    <article className="panel journey-panel">
      <div className="panel-heading"><div><h3>Bagaimana jualan dikenal pasti?</h3><p>Daripada content hingga order selesai</p></div><span className="tracking-health"><i />Tracking aktif</span></div>
      <div className="journey-flow">
        <div><span>01</span><small>DISCOVERY</small><strong>Nampak content</strong><p>Threads, TikTok, KOL atau WhatsApp</p></div><i />
        <div><span>02</span><small>ATTRIBUTION</small><strong>Tekan tracking link</strong><p>UTM dan referral code direkod</p></div><i />
        <div><span>03</span><small>CHECKOUT</small><strong>Pilih platform</strong><p>BCL.my, Shopee atau TikTok Shop</p></div><i />
        <div><span>04</span><small>REVENUE</small><strong>Order disahkan</strong><p>Jualan masuk ke central dashboard</p></div>
      </div>
    </article>

    <div className="attribution-footer-note"><span><strong>5% jualan belum dikenal pasti.</strong> Gunakan UTM link, kod affiliate dan landing page khusus.</span><button>Lihat cadangan tracking</button></div>
  </section>;
}

function CommissionStudio({ paymentStatus, onApprove, onPay, onOpenDocument }: { paymentStatus: PaymentStatus; onApprove: () => void; onPay: () => void; onOpenDocument: (type: FinanceDocument) => void }) {
  const paid = paymentStatus === "paid";
  const approved = paymentStatus === "approved" || paid;
  return <section className="commission-studio">
    <article className="panel commission-hero">
      <div className="commission-copy">
        <p className="eyebrow">WEEKLY COMMISSION</p>
        <h2>{commissionWeek.invoiceNo}</h2>
        <p>{commissionWeek.period} · 423 order selesai · kadar komisen {commissionWeek.rate}%</p>
      </div>
      <div className="commission-total">
        <span>Jumlah perlu dibayar</span>
        <strong>{currency(commissionWeek.commission)}</strong>
        <small>{paid ? `Dibayar pada ${commissionWeek.paidDate}` : `Due ${commissionWeek.dueDate}`}</small>
      </div>
      <div className="commission-actions">
        <button className="secondary-button" onClick={() => onOpenDocument("invoice")}>Preview invoice</button>
        <button className="primary-button" onClick={paid ? () => onOpenDocument("receipt") : approved ? onPay : onApprove}>{paid ? "Lihat resit" : approved ? "Pay KretivCo" : "Approve invoice"}</button>
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
        <div className="panel-heading"><div><h3>Invoice komisen</h3><p>Dummy invoice untuk pembayaran KretivCo</p></div><span className={approved ? "approved-pill" : "review-pill"}>{approved ? "Approved" : "Draft"}</span></div>
        <div className="invoice-lines">
          <span><small>Jualan bersih</small><strong>{currency(commissionWeek.netSales)}</strong></span>
          <span><small>Komisen</small><strong>{commissionWeek.rate}%</strong></span>
          <span><small>Refund dikecualikan</small><strong>-{currency(commissionWeek.excluded)}</strong></span>
          <span><small>Payable</small><strong>{currency(commissionWeek.commission)}</strong></span>
        </div>
        <button className="full-button" onClick={() => onOpenDocument("invoice")}>Buka invoice</button>
      </article>
      <article className="panel invoice-card">
        <div className="panel-heading"><div><h3>Payment ke KretivCo</h3><p>Rekod bayaran dummy untuk test flow</p></div><span className={paid ? "approved-pill" : "review-pill"}>{paid ? "Paid" : "Unpaid"}</span></div>
        <div className="bank-box">
          <small>Beneficiary</small>
          <strong>KretivCo Sdn. Bhd.</strong>
          <span>{commissionWeek.bank} · masked account · {commissionWeek.reference}</span>
        </div>
        <button className="full-button" disabled={paid} onClick={onPay}>{paid ? "Bayaran telah direkod" : "Pay KretivCo (dummy)"}</button>
      </article>
    </div>
  </section>;
}

function StatementsView({ approved, paid, onOpen }: { approved: boolean; paid: boolean; onOpen: () => void }) {
  const weeks = [{ period: "13–19 Jul 2026", sales: "RM18,746.20", commission: "RM2,811.93", status: paid ? "Dibayar" : approved ? "Diluluskan" : "Perlu semakan" }, { period: "6–12 Jul 2026", sales: "RM16,108.40", commission: "RM2,416.26", status: "Dibayar" }, { period: "29 Jun–5 Jul 2026", sales: "RM14,932.00", commission: "RM2,239.80", status: "Dibayar" }];
  return <section className="panel statement-list"><div className="panel-heading"><div><h3>Rekod penyata</h3><p>Komisen mingguan KretivWork</p></div></div>{weeks.map((week, i) => <button className="statement-item" key={week.period} onClick={i === 0 ? onOpen : undefined}><span className="statement-index">W{29 - i}</span><span><strong>{week.period}</strong><small>{week.sales} jualan selesai</small></span><span><small>Komisen</small><strong>{week.commission}</strong></span><span className={week.status === "Dibayar" || week.status === "Diluluskan" ? "approved-pill" : "review-pill"}>{week.status}</span><span className="row-action">Buka</span></button>)}</section>;
}

function PaymentsView({ paymentStatus, onPay, onOpenReceipt }: { paymentStatus: PaymentStatus; onPay: () => void; onOpenReceipt: () => void }) {
  const paid = paymentStatus === "paid";
  return <section className="view-stack"><div className="metrics-grid payments-metrics"><article className="metric metric-featured"><p>Jumlah telah dibayar</p><h2>{paid ? "RM11,732.09" : "RM8,920.16"}</h2><small>{paid ? "4 pembayaran termasuk minggu ini" : "3 pembayaran terdahulu"}</small></article><article className="metric"><p>{paid ? "Bayaran minggu ini" : "Menunggu bayaran"}</p><h2>{currency(commissionWeek.commission)}</h2><small>{commissionWeek.invoiceNo}</small></article><article className="metric"><p>Rujukan</p><h2>{paid ? "Paid" : "22 Jul"}</h2><small>{paid ? commissionWeek.receiptNo : "Tarikh bayaran seterusnya"}</small></article></div><article className="panel payment-flow-card"><div><h3>Aliran pembayaran</h3><p>Bayaran dibuat selepas invoice komisen diluluskan oleh Chef Ammar.</p></div><div className="payment-steps"><span className="complete"><b>1</b>Jualan selesai</span><i /><span className="complete"><b>2</b>Invoice dijana</span><i /><span className="complete"><b>3</b>Kelulusan Chef</span><i /><span className={paid ? "complete" : "active"}><b>4</b>{paid ? "Resit tersedia" : "Bayaran"}</span></div><div className="payment-actions"><button className="secondary-button" onClick={onOpenReceipt} disabled={!paid}>Preview resit</button><button className="primary-button" onClick={onPay} disabled={paid}>{paid ? "Sudah dibayar" : "Pay KretivCo (dummy)"}</button></div></article></section>;
}

function TeamView({ notify }: { notify: (v: string) => void }) {
  return <section className="panel team-panel"><div className="panel-heading"><div><h3>Akses pasukan</h3><p>Peranan dan tahap akses</p></div><button className="primary-button" onClick={() => notify("Jemputan pengguna baharu dibuka")}>Jemput pengguna</button></div>{[{ name: "Amnan Syahmi", email: "amnan@kretivwork.my", role: "Administrator", initials: "AS" }, { name: "Chef Ammar", email: "ammar@chefammar.com", role: "Approver", initials: "CA" }, { name: "Finance KretivWork", email: "finance@kretivwork.my", role: "Finance", initials: "FK" }].map((user) => <div className="team-row" key={user.email}><span className="avatar">{user.initials}</span><span><strong>{user.name}</strong><small>{user.email}</small></span><b>{user.role}</b><span className="status status-selesai"><span />Aktif</span></div>)}</section>;
}

function SettingsView({ notify }: { notify: (v: string) => void }) {
  return <section className="settings-grid"><article className="panel settings-panel"><h3>Tetapan komisen</h3><p>Kadar ini digunakan untuk penyata baharu.</p><label>Kadar komisen KretivWork<div><input defaultValue="15" /><span>%</span></div></label><button className="primary-button" onClick={() => notify("Tetapan komisen disimpan")}>Simpan perubahan</button></article><article className="panel settings-panel"><h3>Sambungan platform</h3><p>Status sumber data pesanan.</p>{channels.map((channel) => { const issue = channel.name === "TikTok Shop"; return <button className={`integration-row ${issue ? "has-warning" : ""}`} key={channel.name} onClick={() => issue && notify("TikTok Shop: sambungkan semula token API.")}><span className="channel-logo" style={{ background: channel.tint, color: channel.color }}>{channel.name === "TikTok Shop" ? "TT" : channel.name[0]}</span><span><strong>{channel.name}</strong><small>{issue ? "Perlu sambung semula" : "Disambungkan"}</small></span><span className="integration-state"><i />{issue ? "Semak" : "Aktif"}</span></button>; })}</article></section>;
}

function ImportModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [file, setFile] = useState("");
  return <div className="modal-layer" role="dialog" aria-modal="true"><div className="modal"><button className="modal-close" onClick={onClose}><X size={20} /></button><p className="eyebrow">IMPORT CSV</p><h2>Import data pesanan</h2><p>Muat naik CSV daripada Shopee atau TikTok Shop. Pesanan pendua akan disemak secara automatik.</p><label className="drop-zone"><span className="file-type">CSV</span><strong>{file || "Pilih fail"}</strong><span>atau tarik dan lepaskan di sini</span><input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0]?.name ?? "")} /></label><div className="modal-actions"><button className="secondary-button" onClick={onClose}>Batal</button><button className="primary-button" disabled={!file} onClick={onDone}>Import</button></div></div></div>;
}

function OrderDrawer({ order, onClose, notify }: { order: Order; onClose: () => void; notify: (message: string) => void }) {
  return <div className="modal-layer drawer-layer" role="dialog" aria-modal="true" aria-label={`Butiran pesanan ${order.id}`}>
    <aside className="drawer">
      <div className="drawer-header"><div><p className="eyebrow">BUTIRAN PESANAN</p><h2>{order.id}</h2></div><button className="modal-close" onClick={onClose}><X size={20} /></button></div>
      <div className="drawer-status"><StatusBadge status={order.status} /><span>{order.time}</span></div>
      <section className="drawer-section"><h3>Produk</h3><div className="drawer-product"><span className="product-thumb large" style={{ background: order.productTone }}>{order.productCode}</span><span><strong>{order.item}</strong><small>Chef Ammar™ Arabic Spices</small></span><b>{currency(order.amount)}</b></div></section>
      <section className="drawer-section"><h3>Pelanggan</h3><div className="drawer-details"><span><small>Nama</small><strong>{order.customer}</strong></span><span><small>Bayaran</small><strong>{order.payment}</strong></span><span><small>Saluran</small><strong>{order.channel}</strong></span><span><small>Sumber</small><strong>{order.channel === "TikTok Shop" ? "TikTok Content" : order.channel === "Shopee" ? "KOL / Affiliate" : "Threads"}</strong></span></div></section>
      <section className="drawer-section"><h3>Status</h3><div className="order-timeline"><span className="complete"><i /><b>Bayaran diterima</b><small>Transaksi disahkan</small></span><span className={order.status === "Diproses" ? "current" : "complete"}><i>{order.status === "Diproses" ? "2" : ""}</i><b>Pesanan diproses</b><small>Diserahkan kepada pasukan fulfilment</small></span><span className={order.status === "Selesai" ? "complete" : ""}><i>{order.status === "Selesai" ? "" : "3"}</i><b>Selesai</b><small>Pesanan diterima pelanggan</small></span></div></section>
      <div className="drawer-total"><span>Jumlah dibayar</span><strong>{currency(order.amount)}</strong></div>
      <div className="drawer-actions"><button className="secondary-button" onClick={() => notify(`Invois ${order.id} sedang disediakan`)}>Invois</button><button className="primary-button" onClick={() => notify("Status pesanan telah dikemas kini")}>Kemas kini status</button></div>
    </aside>
  </div>;
}

function StatementModal({ role, approved, onClose, onApprove }: { role: string; approved: boolean; onClose: () => void; onApprove: () => void }) {
  return <div className="modal-layer drawer-layer" role="dialog" aria-modal="true"><div className="modal statement-modal drawer"><button className="modal-close" onClick={onClose}><X size={20} /></button><p className="eyebrow">PENYATA #KW-2026-029</p><h2>13–19 Julai 2026</h2><div className="modal-summary"><span>423<small>Pesanan selesai</small></span><span>RM18,746.20<small>Jualan bersih</small></span><span>15%<small>Kadar komisen</small></span></div><div className="modal-total"><span>Jumlah komisen KretivWork</span><strong>RM2,811.93</strong></div><p className="modal-note">Pesanan pending, refund dan pembatalan telah dikecualikan daripada pengiraan.</p><div className="modal-actions"><button className="secondary-button" onClick={() => window.print()}>Muat turun</button>{role === "Chef Ammar" && !approved ? <button className="primary-button" onClick={onApprove}>Luluskan penyata</button> : <button className="primary-button" onClick={onClose}>{approved ? "Selesai" : "Tutup"}</button>}</div>{role !== "Chef Ammar" && !approved && <small className="approval-hint">Tukar kepada pandangan Chef Ammar untuk menguji fungsi kelulusan.</small>}</div></div>;
}

function FinanceDocumentDrawer({ type, paymentStatus, onClose, onPay }: { type: "invoice" | "receipt"; paymentStatus: PaymentStatus; onClose: () => void; onPay: () => void }) {
  const paid = paymentStatus === "paid";
  const isReceipt = type === "receipt";
  return <div className="modal-layer drawer-layer" role="dialog" aria-modal="true" aria-label={isReceipt ? "Resit bayaran" : "Invoice komisen"}>
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
          <div><span>Commission rate</span><span>{commissionWeek.rate}%</span></div>
          <div><span>Refund / cancellation excluded</span><span>-{currency(commissionWeek.excluded)}</span></div>
        </div>
        <div className="doc-total"><span>{isReceipt ? "Total paid" : "Amount due"}</span><strong>{currency(commissionWeek.commission)}</strong></div>
        {isReceipt ? <p className="doc-note">Dummy receipt generated after payment record was created in this dashboard.</p> : <p className="doc-note">Dummy invoice for UI testing. Real version can later pull order totals from Shopee, TikTok Shop and BCL.my APIs.</p>}
      </section>
      <div className="drawer-actions"><button className="secondary-button" onClick={() => window.print()}>Print</button>{!paid && <button className="primary-button" onClick={onPay}>Pay KretivCo</button>}{paid && <button className="primary-button" onClick={onClose}>Done</button>}</div>
    </aside>
  </div>;
}
