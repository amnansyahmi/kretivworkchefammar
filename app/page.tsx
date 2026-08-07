"use client";

import {
  Bell,
  Clapperboard,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Download,
  LayoutDashboard,
  LoaderCircle,
  ExternalLink,
  FolderOpen,
  Link2,
  Menu,
  Pencil,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Truck,
  Video,
  WalletCards,
  X,
} from "lucide-react";
import { SiShopee, SiTiktok } from "react-icons/si";
import { QRCodeSVG } from "qrcode.react";
import { createContext, Fragment, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { CourierKey, DataSourceKey } from "../lib/config";
import { mockOrders } from "../lib/sources/mock-orders";
import type { Order } from "../lib/sources/types";
import type { SourceStatus } from "../lib/sources";
import { mockShipments } from "../lib/logistics/mock-shipments";
import { SHIPMENT_STAGES, type Shipment } from "../lib/logistics/types";
import type { CourierSourceStatus } from "../lib/logistics";
import { StatementPdfDocument, InvoicePdfDocument } from "../lib/pdf/documents";
import { downloadPdf } from "../lib/pdf/download";
import { downloadCsv } from "../lib/csv";
import { importOrdersFromCsv, type ImportResult } from "../lib/csv/import-orders";
import { can as roleCan, deniedReason, type Permission, type Role } from "../lib/roles";
import { mockProducts } from "../lib/inventory/mock-products";
import { stockLevelOf, weeksOfCover, type Product } from "../lib/inventory/types";
import { aggregateCustomers, summariseCustomers, type Customer } from "../lib/customers";
import { deriveNotifications, type AppNotification } from "../lib/notifications";
import { quoteFor } from "../lib/logistics/booking";
import type { CourierName } from "../lib/logistics/types";
import { mockContent } from "../lib/content/mock-content";
import { CONTENT_STAGES, CONTENT_FORMATS, CONTENT_CHANNELS, daysUntil, isOverdue, isDueSoon, type ContentPiece, type ContentStatus } from "../lib/content/types";
import { parseDriveUrl } from "../lib/content/drive";
import { mockShoots } from "../lib/content/mock-shoots";
import { SHOOT_LOCATIONS, SHOOT_STATUSES, shootStatusTone, type ContentShoot } from "../lib/content/shoots";
import { buildMonthGrid, shiftMonth, monthLabelBM, groupByDate, toIsoDate, WEEKDAY_LABELS_BM } from "../lib/content/calendar";

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
  "Logistik": "Logistics", "Penghantaran": "Shipments", "Kurier": "Couriers",
  "Rekod penghantaran": "Shipping records", "penghantaran ditemui": "shipments found",
  "Dalam transit": "In transit", "Menunggu pickup": "Awaiting pickup", "Sedang dihantar": "Out for delivery",
  "Dihantar": "Delivered", "Gagal dihantar": "Delivery failed",
  "Bungkusan sedang bergerak": "Parcels on the move", "Belum diambil kurier": "Not yet collected",
  "Selesai dihantar bulan ini": "Delivered this month", "Jumlah kos penghantaran": "Total shipping cost",
  "penghantaran minggu ini": "shipments this week",
  "Semua kurier": "All couriers", "Semua status penghantaran": "All shipment statuses",
  "TRACKING": "TRACKING", "PENERIMA": "RECIPIENT", "KURIER": "COURIER", "DESTINASI": "DESTINATION", "KOS": "COST",
  "Tiada penghantaran": "No shipments", "Ubah carian atau filter kurier.": "Change the search or courier filter.",
  "Prestasi kurier": "Courier performance",
  "Pecahan penghantaran dan kadar berjaya mengikut kurier.": "Shipment volume and success rate by courier.",
  "penghantaran": "shipments", "Purata kos": "Average cost",
  "selesai": "settled", "belum selesai": "none settled",
  "Sambungan kurier": "Courier connections", "Status API penghantaran.": "Shipping API status.",
  "BUTIRAN PENGHANTARAN": "SHIPMENT DETAILS", "Butiran penghantaran": "Shipment details",
  "Penerima": "Recipient", "Poskod": "Postcode", "Berat": "Weight", "Servis": "Service",
  "Anggaran sampai": "Estimated arrival", "Ditempah": "Booked", "Jejak penghantaran": "Tracking history",
  "Kos penghantaran": "Shipping cost", "Salin no. tracking": "Copy tracking no.",
  "Nombor tracking disalin": "Tracking number copied", "Jejak di laman kurier": "Track on courier site",
  "Destinasi": "Destination",
  "Standard Domestik": "Standard Domestic", "Pos Laju Next Day": "Pos Laju Next Day", "DHL Domestik": "DHL Domestic",
  "Pesanan dibuat": "Order created", "Bungkusan diambil kurier": "Parcel collected by courier",
  "Tiba di hab penyusunan": "Arrived at sorting hub", "Dalam perjalanan ke penerima": "Out for delivery",
  "Berjaya dihantar — diterima oleh penerima": "Delivered — received by recipient",
  "Cubaan penghantaran gagal — penerima tiada": "Delivery attempt failed — recipient unavailable",
  "Dipulangkan ke penghantar": "Returned to sender",
  "Sambungan platform": "Platform connections", "Status sumber data pesanan.": "Order data source status.",
  "Perlu sambung semula": "Needs reconnect", "Disambungkan": "Connected", "Semak": "Review",
  "Data ujian (mock)": "Test data (mock)", "Ralat sambungan API": "API connection error", "Memuatkan status…": "Loading status…",
  "TikTok Shop: sambungkan semula token API.": "TikTok Shop: please reconnect the API token.",
  "Import data pesanan": "Import order data",
  "Muat naik CSV daripada Shopee atau TikTok Shop. Pesanan pendua akan disemak secara automatik.": "Upload a CSV from Shopee or TikTok Shop. Duplicate orders are checked automatically.",
  "Pilih fail": "Choose file", "atau tarik dan lepaskan di sini": "or drag and drop here", "Batal": "Cancel",
  "Fail berjaya diimport dan sedang diproses": "File imported successfully and is being processed",
  "baris dieksport ke CSV": "rows exported to CSV", "pesanan berjaya diimport": "orders imported successfully",
  "Membaca fail…": "Reading file…", "Lajur wajib tidak dijumpai": "Required columns not found",
  "Fail perlu ada lajur": "The file needs these columns",
  "pesanan baharu": "new orders", "pendua dilangkau": "duplicates skipped", "baris tidak sah": "invalid rows",
  "Baris": "Rows", "Medan wajib kosong": "Required field empty", "Jumlah tidak sah": "Invalid amount",
  "Belum ada penghantaran untuk pesanan ini.": "No shipment booked for this order yet.",
  "Hanya pasukan KretivWork boleh buat tindakan ini.": "Only the KretivWork team can do this.",
  "Hanya Chef Ammar boleh buat tindakan ini.": "Only Chef Ammar can do this.",

  // Inventory
  "Inventori": "Inventory", "Inventori produk": "Product inventory",
  "Paras stok dan kadar jualan setiap SKU.": "Stock levels and sell-through per SKU.",
  "Nilai stok": "Stock value", "unit dalam stok": "units in stock",
  "SKU perlu perhatian": "SKUs needing attention", "Habis atau bawah paras pesanan semula": "Out of stock or below reorder level",
  "Unit terjual": "Units sold", "Jumlah SKU": "Total SKUs",
  "HARGA": "PRICE", "STOK": "STOCK", "PARAS SEMULA": "REORDER AT", "TERJUAL": "SOLD", "LIPUTAN": "COVER",
  "minggu": "weeks", "Habis": "Out of stock", "Rendah": "Low", "Mencukupi": "Healthy",
  "Laras stok": "Adjust stock", "Simpan": "Save", "Menyimpan…": "Saving…",
  "Masukkan nombor bulat yang sah": "Enter a valid whole number",
  "Paras stok disimpan": "Stock level saved",
  "Paras stok dikemas kini (tidak kekal tanpa pangkalan data)": "Stock level updated (not persisted without a database)",
  "Gagal menyimpan paras stok": "Failed to save stock level",

  // Customers
  "Jumlah pelanggan": "Total customers", "Daripada pesanan yang direkod": "From recorded orders",
  "Pelanggan berulang": "Repeat customers", "kadar pembelian berulang": "repeat purchase rate",
  "Purata nilai sepanjang hayat": "Average lifetime value", "Setiap pelanggan": "Per customer",
  "Pelanggan teratas": "Top customer", "pelanggan ditemui": "customers found",
  "NILAI SEPANJANG HAYAT": "LIFETIME VALUE", "PURATA": "AVERAGE", "SALURAN UTAMA": "TOP CHANNEL",
  "PESANAN TERAKHIR": "LAST ORDER", "Tiada pelanggan": "No customers", "Ubah carian anda.": "Change your search.",

  // Notifications
  "Penghantaran gagal": "Delivery failed", "Stok habis": "Out of stock", "Stok rendah": "Low stock",
  "Penyata menunggu kelulusan": "Statement awaiting approval",
  "Penyata komisen minggu ini belum diluluskan.": "This week's commission statement has not been approved.",
  "Ralat sambungan kurier": "Courier connection error",
  "Menunggu pickup kurier": "Awaiting courier pickup",

  // Content
  "Kandungan": "Content", "Papan": "Board", "Pustaka": "Library",
  "Papan kandungan": "Content board", "kandungan dirancang": "pieces planned",
  "Dalam perancangan": "In the pipeline", "Belum diterbitkan": "Not yet published",
  "Perlu kelulusan Chef": "Awaiting Chef approval", "Menunggu semakan": "Waiting for review",
  "Akan datang": "Coming up", "Dalam 2 hari": "Within 2 days",
  "Lewat jadual": "Behind schedule", "Tarikh sudah berlalu": "Go-live date has passed",
  "Semua saluran kandungan": "All content channels", "Kandungan baharu": "New content",
  "Idea": "Idea", "Sedang dibuat": "In production", "Perlu kelulusan": "Needs approval",
  "Diterbitkan": "Published", "Tiada": "None",
  "Carousel": "Carousel", "Foto produk": "Product photo", "Live": "Live", "Artikel": "Article",
  "hari lewat": "days late", "hari ini": "today", "hari lagi": "days to go",
  "BUTIRAN KANDUNGAN": "CONTENT DETAILS", "KANDUNGAN BAHARU": "NEW CONTENT",
  "Butiran kandungan": "Content details", "Tajuk": "Title",
  "Contoh: Resepi Nasi Mandi 15 minit": "e.g. 15-minute Nasi Mandi recipe",
  "Format": "Format", "Tarikh terbit": "Go-live date",
  "Produk berkaitan": "Related product", "Tiada produk khusus": "No specific product",
  "Terjual minggu ini": "Sold this week", "Padam": "Delete",
  "Kandungan disimpan": "Content saved",
  "Kandungan dikemas kini (tidak kekal tanpa pangkalan data)": "Content updated (not persisted without a database)",
  "Gagal menyimpan kandungan": "Failed to save content", "Kandungan dipadam": "Content deleted",
  "Folder Google Drive": "Google Drive folder",
  "Tampal pautan folder Drive pasukan. Folder perlu dikongsi 'Sesiapa yang ada pautan' untuk paparan terus.": "Paste your team's Drive folder link. The folder must be shared with \"Anyone with the link\" for the inline preview to work.",
  "Pautan folder": "Folder link", "Pautan Google Drive": "Google Drive link",
  "Pautan Google Drive tidak sah": "Not a valid Google Drive link",
  "Simpan folder": "Save folder", "Folder Drive disimpan": "Drive folder saved", "Buka di Drive": "Open in Drive",
  "Pustaka kandungan": "Content library", "Fail terus dari folder Drive pasukan.": "Files straight from your team's Drive folder.",
  "Belum ada folder Drive": "No Drive folder yet",
  "Tampal pautan folder di atas untuk lihat fail di sini.": "Paste a folder link above to see files here.",
  "Kalau paparan kosong atau minta log masuk, folder itu belum dikongsi secara umum.": "If this is blank or asks you to sign in, the folder isn't shared publicly yet.",

  // Content calendar & shoots
  "Kalendar": "Calendar", "Kalendar kandungan": "Content calendar",
  "Hari penggambaran": "Shoot days",
  "Kandungan terbit": "Content going live", "Dijadualkan bulan ini": "Scheduled this month",
  "Belum disahkan": "Not confirmed", "Shoot masih dirancang": "Shoots still tentative",
  "Selesai dirakam": "Filmed", "Bulan sebelumnya": "Previous month", "Bulan seterusnya": "Next month",
  "Penggambaran": "Shoot", "Shoot baharu": "New shoot",
  "Klik dua kali pada mana-mana hari untuk tambah penggambaran.": "Double-click any day to add a shoot.",
  "BUTIRAN PENGGAMBARAN": "SHOOT DETAILS", "PENGGAMBARAN BAHARU": "NEW SHOOT",
  "Butiran penggambaran": "Shoot details", "Tajuk penggambaran": "Shoot title",
  "Contoh: Batch raya — 4 video pendek": "e.g. Raya batch — 4 short videos",
  "Tarikh shoot": "Shoot date", "Masa panggilan": "Call time", "Lokasi": "Location", "Kru": "Crew",
  "Contoh: Chef Ammar, Amnan, 1 videografer": "e.g. Chef Ammar, Amnan, 1 videographer",
  "Folder footage mentah": "Raw footage folder",
  "Studio KretivWork": "KretivWork Studio", "Dapur Chef Ammar": "Chef Ammar's Kitchen",
  "Lokasi luar": "On location", "Rumah pelanggan": "Customer's home",
  "Dirancang": "Tentative", "Disahkan": "Confirmed", "Dibatalkan": "Cancelled",
  "Kandungan dari shoot ini": "Content from this shoot",
  "Belum ada kandungan diikat pada shoot ini.": "No content linked to this shoot yet.",
  "terbit": "live", "Belum dijadualkan": "Not scheduled yet",
  "Penggambaran disimpan": "Shoot saved",
  "Penggambaran dikemas kini (tidak kekal tanpa pangkalan data)": "Shoot updated (not persisted without a database)",
  "Gagal menyimpan penggambaran": "Failed to save shoot", "Penggambaran dipadam": "Shoot deleted",
  "Januari": "January", "Februari": "February", "Mac": "March", "April": "April", "Mei": "May", "Jun": "June",
  "Julai": "July", "Ogos": "August", "September": "September", "Oktober": "October",
  "November": "November", "Disember": "December",

  // Shipment booking
  "TEMPAH PENGHANTARAN": "BOOK SHIPMENT", "Tempah penghantaran": "Book shipment", "Tempah AWB untuk": "Book an AWB for",
  "Anggaran kos": "Estimated cost", "Menempah…": "Booking…", "Tempahan gagal": "Booking failed",
  "Poskod mesti 5 digit": "Postcode must be 5 digits", "Penghantaran ditempah": "Shipment booked",
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
  "Kemas kini bank dan kod QR untuk pembayaran KretivCo.": "Update the bank details and QR code for KretivCo payments.",
  "Nama bank": "Bank name", "Nama pemegang akaun": "Account holder name", "Nombor akaun": "Account number",
  "Kod QR pembayaran": "Payment QR code", "Fail terlalu besar (maksimum 2MB)": "File too large (max 2MB)",
  "Kaedah pembayaran disimpan": "Payment method settings saved",
};

const LangContext = createContext<{ lang: Lang; t: (s: string) => string }>({ lang: "bm", t: (s) => s });
function useLang() {
  return useContext(LangContext);
}

// Role gating for the UI only — see lib/roles.ts. Provided via context so the
// deeply nested finance/settings views don't each need a `role` prop.
const RoleContext = createContext<{ role: Role; can: (p: Permission) => boolean; deniedReason: string }>({
  role: "KretivWork",
  can: () => true,
  deniedReason: "",
});
function useRole() {
  return useContext(RoleContext);
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
type PaymentSettings = { bankName: string; accountName: string; accountNumber: string; qrImageDataUrl: string | null };
const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = { bankName: "Demo Bank", accountName: "KretivCo Sdn. Bhd.", accountNumber: "1234 5678 9012", qrImageDataUrl: null };

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
  { id: "content", label: "Kandungan", icon: Clapperboard },
  { id: "logistics", label: "Logistik", icon: Truck, count: 2 },
  { id: "finance", label: "Kewangan", icon: WalletCards, count: 1 },
  { id: "settings", label: "Tetapan", icon: Settings },
];

const COURIER_LABELS: Record<CourierKey, string> = { easyparcel: "EasyParcel", jnt: "J&T Express (direct)" };

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
  const [logisticsTab, setLogisticsTab] = useState("shipments");
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
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [financeDocument, setFinanceDocument] = useState<FinanceDocument>(null);
  const [toast, setToast] = useState("");
  const [lang, setLang] = useState<Lang>("bm");
  const t = (s: string) => (lang === "en" ? EN[s] ?? s : s);
  const [liveOrders, setLiveOrders] = useState<Order[] | null>(null);
  const [sourceStatus, setSourceStatus] = useState<Record<DataSourceKey, SourceStatus> | null>(null);
  const [importedOrders, setImportedOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [contentPieces, setContentPieces] = useState<ContentPiece[]>(mockContent);
  const [contentTab, setContentTab] = useState("board");
  const [driveFolderUrl, setDriveFolderUrl] = useState<string | null>(null);
  const [openContent, setOpenContent] = useState<{ piece: ContentPiece; isNew: boolean } | null>(null);
  const [shoots, setShoots] = useState<ContentShoot[]>(mockShoots);
  const [openShoot, setOpenShoot] = useState<{ shoot: ContentShoot; isNew: boolean } | null>(null);
  const [savingSku, setSavingSku] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [bookingOrder, setBookingOrder] = useState<Order | null>(null);
  const [bookedShipments, setBookedShipments] = useState<Shipment[]>([]);
  const [liveShipments, setLiveShipments] = useState<Shipment[] | null>(null);
  const [courierStatus, setCourierStatus] = useState<Record<CourierKey, CourierSourceStatus> | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/content").then((res) => res.json()),
      fetch("/api/content-settings").then((res) => res.json()),
      fetch("/api/content/shoots").then((res) => res.json()),
    ])
      .then(([content, settings, shootData]: [{ pieces: ContentPiece[] }, { driveFolderUrl: string | null }, { shoots: ContentShoot[] }]) => {
        if (cancelled) return;
        setContentPieces(content.pieces);
        setDriveFolderUrl(settings.driveFolderUrl);
        setShoots(shootData.shoots);
      })
      .catch((err) => console.error("Failed to load content", err));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/products")
      .then((res) => res.json())
      .then((data: { products: Product[] }) => { if (!cancelled) setProducts(data.products); })
      .catch((err) => console.error("Failed to load products", err));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/shipments")
      .then((res) => res.json())
      .then((data: { shipments: Shipment[]; couriers: Record<CourierKey, CourierSourceStatus> }) => {
        if (cancelled) return;
        setLiveShipments(data.shipments);
        setCourierStatus(data.couriers);
      })
      .catch((err) => console.error("Failed to load shipments", err));
    return () => { cancelled = true; };
  }, []);

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

  // CSV-imported orders live in front of the fetched list until a real
  // write-back to the source platform exists.
  const orderList = useMemo(() => [...importedOrders, ...(liveOrders ?? orders)], [importedOrders, liveOrders, orders]);
  const shipmentList = useMemo(() => [...bookedShipments, ...(liveShipments ?? mockShipments)], [bookedShipments, liveShipments]);

  const saveStock = (sku: string, stock: number, reorderLevel: number) => {
    setSavingSku(sku);
    setProducts((current) => current.map((p) => (p.sku === sku ? { ...p, stock, reorderLevel } : p)));
    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sku, stock, reorderLevel }),
    })
      .then((res) => res.json())
      .then((data: { persisted: boolean }) => notify(t(data.persisted ? "Paras stok disimpan" : "Paras stok dikemas kini (tidak kekal tanpa pangkalan data)")))
      .catch((err) => { console.error("Failed to save stock level", err); notify(t("Gagal menyimpan paras stok")); })
      .finally(() => setSavingSku(null));
  };

  const saveContent = (piece: ContentPiece) => {
    setContentPieces((current) => {
      const exists = current.some((p) => p.id === piece.id);
      const next = exists ? current.map((p) => (p.id === piece.id ? piece : p)) : [...current, piece];
      return [...next].sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
    });
    setOpenContent(null);
    fetch("/api/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(piece) })
      .then((res) => res.json())
      .then((data: { persisted?: boolean; error?: string }) => {
        if (data.error) notify(data.error);
        else notify(t(data.persisted ? "Kandungan disimpan" : "Kandungan dikemas kini (tidak kekal tanpa pangkalan data)"));
      })
      .catch((err) => { console.error("Failed to save content", err); notify(t("Gagal menyimpan kandungan")); });
  };

  const deleteContent = (id: string) => {
    setContentPieces((current) => current.filter((p) => p.id !== id));
    setOpenContent(null);
    fetch(`/api/content?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      .catch((err) => console.error("Failed to delete content", err));
    notify(t("Kandungan dipadam"));
  };

  const saveShoot = (shoot: ContentShoot) => {
    setShoots((current) => {
      const exists = current.some((s) => s.id === shoot.id);
      const next = exists ? current.map((s) => (s.id === shoot.id ? shoot : s)) : [...current, shoot];
      return [...next].sort((a, b) => a.date.localeCompare(b.date));
    });
    setOpenShoot(null);
    fetch("/api/content/shoots", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(shoot) })
      .then((res) => res.json())
      .then((data: { persisted?: boolean; error?: string }) => {
        if (data.error) notify(data.error);
        else notify(t(data.persisted ? "Penggambaran disimpan" : "Penggambaran dikemas kini (tidak kekal tanpa pangkalan data)"));
      })
      .catch((err) => { console.error("Failed to save shoot", err); notify(t("Gagal menyimpan penggambaran")); });
  };

  const deleteShoot = (id: string) => {
    setShoots((current) => current.filter((s) => s.id !== id));
    // Mirror the server: detach rather than delete the pieces.
    setContentPieces((current) => current.map((p) => (p.shootId === id ? { ...p, shootId: null } : p)));
    setOpenShoot(null);
    fetch(`/api/content/shoots?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      .catch((err) => console.error("Failed to delete shoot", err));
    notify(t("Penggambaran dipadam"));
  };

  const nextShootId = () => {
    const highest = shoots.reduce((max, s) => {
      const n = Number(s.id.match(/(\d+)$/)?.[1] ?? 0);
      return n > max ? n : max;
    }, 0);
    return `SH-${String(highest + 1).padStart(2, "0")}`;
  };

  const saveDriveFolder = (url: string | null) => {
    setDriveFolderUrl(url);
    fetch("/api/content-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ driveFolderUrl: url }) })
      .catch((err) => console.error("Failed to save Drive folder", err));
  };

  // Next sequential CT-### id, so a new card doesn't collide with an existing one.
  const nextContentId = () => {
    const highest = contentPieces.reduce((max, p) => {
      const n = Number(p.id.match(/(\d+)$/)?.[1] ?? 0);
      return n > max ? n : max;
    }, 0);
    return `CT-${String(highest + 1).padStart(3, "0")}`;
  };

  const notifications = useMemo(() => deriveNotifications({
    shipments: shipmentList,
    products,
    sourceStatus,
    courierStatus,
    statementApproved: approved,
    canApproveStatement: roleCan(role, "approveStatement"),
  }), [shipmentList, products, sourceStatus, courierStatus, approved, role]);

  const bookShipmentFor = async (order: Order, courier: CourierName, weightKg: number, destination: string, postcode: string) => {
    const res = await fetch("/api/shipments/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, recipient: order.customer, initials: order.initials, destination, postcode, weightKg, courier }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Booking failed");
    setBookedShipments((current) => [data.shipment as Shipment, ...current]);
    setBookingOrder(null);
    notify(`${t("Penghantaran ditempah")} · ${(data.shipment as Shipment).trackingNo}`);
  };
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

  useEffect(() => {
    let cancelled = false;
    fetch("/api/payment-settings")
      .then((res) => res.json())
      .then((data: PaymentSettings) => { if (!cancelled) setPaymentSettings(data); })
      .catch((err) => console.error("Failed to load payment settings", err));
    return () => { cancelled = true; };
  }, []);

  const savePaymentSettings = (next: PaymentSettings) => {
    setPaymentSettings(next);
    fetch("/api/payment-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    }).catch((err) => console.error("Failed to save payment settings", err));
  };

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
    <RoleContext.Provider value={{ role, can: (p) => roleCan(role, p), deniedReason: t(deniedReason(role)) }}>
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
            <div className="notification-wrap">
              <button className="icon-button" onClick={() => setNotifOpen((v) => !v)} aria-label={t("Notifikasi")} aria-expanded={notifOpen}>
                <Bell size={19} />
                {notifications.length > 0 && <i className="notification-badge">{notifications.length}</i>}
              </button>
              {notifOpen && <NotificationPanel
                notifications={notifications}
                onClose={() => setNotifOpen(false)}
                onSelect={(n) => {
                  setNotifOpen(false);
                  setActive(n.target.view);
                  if (n.target.tab) {
                    if (n.target.view === "sales") setSalesTab(n.target.tab);
                    if (n.target.view === "logistics") setLogisticsTab(n.target.tab);
                    if (n.target.view === "finance") setFinanceTab(n.target.tab);
                    if (n.target.view === "settings") setSettingsTab(n.target.tab);
                  }
                }}
              />}
            </div>
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
              <GatedButton permission="importOrders" className="secondary-button" onClick={() => setImportOpen(true)}>{t("Import")}</GatedButton>
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
            <SectionTabs value={salesTab} onChange={setSalesTab} tabs={[{ id: "orders", label: "Pesanan" }, { id: "products", label: "Inventori" }, { id: "customers", label: "Pelanggan" }, { id: "channels", label: "Saluran" }, { id: "sources", label: "Sumber" }]} />
            {salesTab === "orders" && <OrdersPanel orders={filteredOrders} query={query} setQuery={setQuery} status={status} setStatus={setStatus} expanded notify={notify} onSelectOrder={setSelectedOrder} />}
            {salesTab === "products" && <ProductsView products={products} saving={savingSku} onSaveStock={saveStock} notify={notify} />}
            {salesTab === "customers" && <CustomersView orders={orderList} onOpenOrder={setSelectedOrder} />}
            {salesTab === "channels" && <ChannelsView notify={notify} />}
            {salesTab === "sources" && <AttributionView onOpenOrders={openOrdersFor} />}
          </>}
          {active === "content" && <>
            <SectionTabs value={contentTab} onChange={setContentTab} tabs={[{ id: "board", label: "Papan" }, { id: "calendar", label: "Kalendar" }, { id: "library", label: "Pustaka" }]} />
            {contentTab === "board" && <ContentBoard
              pieces={contentPieces}
              products={products}
              onSelect={(piece) => setOpenContent({ piece, isNew: false })}
              onCreate={() => setOpenContent({
                isNew: true,
                piece: {
                  id: nextContentId(),
                  title: "",
                  format: "Video pendek",
                  channel: "TikTok",
                  status: "Idea",
                  scheduledFor: new Date().toISOString().slice(0, 10),
                  owner: role,
                  productSku: null,
                  driveUrl: null,
                  notes: "",
                  shootId: null,
                  updatedAt: new Date().toISOString().slice(0, 10),
                },
              })}
            />}
            {contentTab === "calendar" && <ContentCalendar
              pieces={contentPieces}
              shoots={shoots}
              onSelectPiece={(piece) => setOpenContent({ piece, isNew: false })}
              onSelectShoot={(shoot) => setOpenShoot({ shoot, isNew: false })}
              onCreateShoot={(date) => setOpenShoot({
                isNew: true,
                shoot: { id: nextShootId(), title: "", date, location: "Dapur Chef Ammar", status: "Dirancang", crew: "", callTime: "", driveUrl: null, notes: "" },
              })}
            />}
            {contentTab === "library" && <ContentLibrary driveFolderUrl={driveFolderUrl} onSaveFolder={saveDriveFolder} notify={notify} />}
          </>}
          {active === "logistics" && <>
            <SectionTabs value={logisticsTab} onChange={setLogisticsTab} tabs={[{ id: "shipments", label: "Penghantaran" }, { id: "couriers", label: "Kurier" }]} />
            {logisticsTab === "shipments" && <ShipmentsPanel shipments={shipmentList} notify={notify} onSelectShipment={setSelectedShipment} />}
            {logisticsTab === "couriers" && <CouriersView shipments={shipmentList} courierStatus={courierStatus} notify={notify} />}
          </>}
          {active === "finance" && <>
            <SectionTabs value={financeTab} onChange={setFinanceTab} tabs={[{ id: "studio", label: "Commission" }, { id: "statements", label: "Penyata" }, { id: "payments", label: "Pembayaran" }]} />
            {financeTab === "studio" && <CommissionStudio paymentStatus={paymentStatus} payMethod={payMethod} setPayMethod={setPayMethod} paymentSettings={paymentSettings} onApprove={() => { setApproved(true); setPaymentStatus("approved"); notify(t("Invoice komisen diluluskan.")); }} onPay={() => { setApproved(true); setPaymentStatus("paid"); notify(t("Bayaran dummy ke KretivCo direkodkan.")); }} onOpenDocument={setFinanceDocument} />}
            {financeTab === "statements" && <StatementsView approved={approved} paid={paymentStatus === "paid"} onOpenWeek={(i) => setOpenStatementWeek(i)} />}
            {financeTab === "payments" && <PaymentsView paymentStatus={paymentStatus} payMethod={payMethod} setPayMethod={setPayMethod} paymentSettings={paymentSettings} onPay={() => { setApproved(true); setPaymentStatus("paid"); notify(t("Bayaran dummy ke KretivCo direkodkan.")); }} onOpenReceipt={() => setFinanceDocument("receipt")} />}
          </>}
          {active === "settings" && <>
            <SectionTabs value={settingsTab} onChange={setSettingsTab} tabs={[{ id: "system", label: "Sistem" }, { id: "team", label: "Pasukan" }]} />
            {settingsTab === "system" && <SettingsView notify={notify} sourceStatus={sourceStatus} paymentSettings={paymentSettings} onSavePaymentSettings={savePaymentSettings} />}
            {settingsTab === "team" && <TeamView notify={notify} />}
          </>}
        </div>
      </section>

      <nav className="mobile-bottom-nav" aria-label={t("Navigasi utama")}>
        {nav.map(({ id, label, icon: Icon }) => <button key={id} className={active === id ? "active" : ""} onClick={() => setActive(id)}><Icon size={19} /><span>{t(label)}</span></button>)}
      </nav>

      {importOpen && <ImportModal existingIds={orderList.map((o) => o.id)} onClose={() => setImportOpen(false)} onImport={(imported) => {
        setImportedOrders((current) => [...imported, ...current]);
        setImportOpen(false);
        notify(`${imported.length} ${t("pesanan berjaya diimport")}`);
      }} />}
      {openStatementWeek !== null && <StatementDrawer weekIndex={openStatementWeek} approved={approved} paid={paymentStatus === "paid"} onClose={() => setOpenStatementWeek(null)} onApprove={() => { setApproved(true); setPaymentStatus("approved"); setOpenStatementWeek(null); notify(t("Penyata telah diluluskan")); }} />}
      {selectedOrder && <OrderDrawer
        order={selectedOrder}
        shipment={shipmentList.find((s) => s.orderId === selectedOrder.id) ?? null}
        onClose={() => setSelectedOrder(null)}
        onOpenShipment={(shipment) => { setSelectedOrder(null); setActive("logistics"); setLogisticsTab("shipments"); setSelectedShipment(shipment); }}
        onBookShipment={() => { setBookingOrder(selectedOrder); setSelectedOrder(null); }}
        notify={notify}
      />}
      {openContent && <ContentDrawer
        piece={openContent.piece}
        products={products}
        shoots={shoots}
        isNew={openContent.isNew}
        onClose={() => setOpenContent(null)}
        onSave={saveContent}
        onDelete={deleteContent}
      />}
      {openShoot && <ShootDrawer
        shoot={openShoot.shoot}
        pieces={contentPieces}
        isNew={openShoot.isNew}
        onClose={() => setOpenShoot(null)}
        onSave={saveShoot}
        onDelete={deleteShoot}
        onSelectPiece={(piece) => { setOpenShoot(null); setOpenContent({ piece, isNew: false }); }}
      />}
      {bookingOrder && <BookShipmentModal
        order={bookingOrder}
        onClose={() => setBookingOrder(null)}
        onBook={(courier, weightKg, destination, postcode) => bookShipmentFor(bookingOrder, courier, weightKg, destination, postcode)}
      />}
      {selectedShipment && <ShipmentDrawer
        shipment={selectedShipment}
        order={orderList.find((o) => o.id === selectedShipment.orderId) ?? null}
        onClose={() => setSelectedShipment(null)}
        onOpenOrder={(order) => { setSelectedShipment(null); setActive("sales"); setSalesTab("orders"); setSelectedOrder(order); }}
        notify={notify}
      />}
      {financeDocument === "invoice" && <FinanceDocumentDrawer type="invoice" paymentStatus={paymentStatus} onClose={() => setFinanceDocument(null)} onPay={() => { setApproved(true); setPaymentStatus("paid"); notify(t("Bayaran dummy ke KretivCo direkodkan.")); }} />}
      {financeDocument === "receipt" && <FinanceDocumentDrawer type="receipt" paymentStatus={paymentStatus} onClose={() => setFinanceDocument(null)} onPay={() => { setApproved(true); setPaymentStatus("paid"); notify(t("Bayaran dummy ke KretivCo direkodkan.")); }} />}
      {toast && <div className="toast"><span className="toast-dot" />{toast}</div>}
    </main>
    </RoleContext.Provider>
    </LangContext.Provider>
  );
}

/**
 * Wraps an action button so a role without the permission sees it disabled
 * with an explanatory tooltip rather than the button silently vanishing.
 */
function GatedButton({ permission, className, onClick, disabled, children }: { permission: Permission; className: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  const { can, deniedReason } = useRole();
  const allowed = can(permission);
  return <button
    className={className}
    onClick={allowed ? onClick : undefined}
    disabled={disabled || !allowed}
    title={allowed ? undefined : deniedReason}
  >{children}</button>;
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
      <button className="export-button" onClick={() => {
        downloadCsv(
          `pesanan-${new Date().toISOString().slice(0, 10)}.csv`,
          ["Order ID", "Masa", "Pelanggan", "Saluran", "Produk", "Bayaran", "Jumlah (RM)", "Status"],
          sortedOrders.map((o) => [o.id, o.time, o.customer, o.channel, o.item, o.payment, o.amount.toFixed(2), o.status]),
        );
        notify(`${sortedOrders.length} ${t("baris dieksport ke CSV")}`);
      }} disabled={sortedOrders.length === 0}><Download size={14} /><span>{t("Export")}</span></button>
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

function PaymentMethodBox({ payMethod, setPayMethod, reference, amount, settings }: { payMethod: "bank" | "qr"; setPayMethod: (v: "bank" | "qr") => void; reference: string; amount: number; settings: PaymentSettings }) {
  const { t } = useLang();
  const qrValue = `${settings.accountName} | ${currency(amount)} | REF:${reference}`;
  return <>
    <div className="payment-method-toggle" role="tablist">
      <button role="tab" aria-selected={payMethod === "bank"} className={payMethod === "bank" ? "active" : ""} onClick={() => setPayMethod("bank")}>{t("Bank Transfer")}</button>
      <button role="tab" aria-selected={payMethod === "qr"} className={payMethod === "qr" ? "active" : ""} onClick={() => setPayMethod("qr")}>{t("QR Pay")}</button>
    </div>
    {payMethod === "bank" ? (
      <div className="bank-box">
        <small>Beneficiary</small>
        <strong>{settings.accountName}</strong>
        <span>{settings.bankName} · {settings.accountNumber} · {reference}</span>
      </div>
    ) : (
      <div className="qr-box">
        <div className="qr-code-wrap">
          {settings.qrImageDataUrl ? <img src={settings.qrImageDataUrl} alt="Payment QR code" width={124} height={124} /> : <QRCodeSVG value={qrValue} size={124} bgColor="transparent" fgColor="#2b2118" level="M" />}
        </div>
        <strong>{currency(amount)}</strong>
        <span>{t("Imbas untuk bayar KretivCo")}</span>
      </div>
    )}
  </>;
}

function CommissionStudio({ paymentStatus, payMethod, setPayMethod, paymentSettings, onApprove, onPay, onOpenDocument }: { paymentStatus: PaymentStatus; payMethod: "bank" | "qr"; setPayMethod: (v: "bank" | "qr") => void; paymentSettings: PaymentSettings; onApprove: () => void; onPay: () => void; onOpenDocument: (type: FinanceDocument) => void }) {
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
        {paid
          ? <button className="primary-button" onClick={() => onOpenDocument("receipt")}>{t("Lihat resit")}</button>
          : approved
            ? <GatedButton permission="recordPayment" className="primary-button" onClick={onPay}>Pay KretivCo</GatedButton>
            : <GatedButton permission="approveStatement" className="primary-button" onClick={onApprove}>Approve invoice</GatedButton>}
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
        <PaymentMethodBox payMethod={payMethod} setPayMethod={setPayMethod} reference={commissionWeek.reference} amount={commissionWeek.commission} settings={paymentSettings} />
        <GatedButton permission="recordPayment" className="full-button" disabled={paid} onClick={onPay}>{paid ? t("Bayaran telah direkod") : "Pay KretivCo (dummy)"}</GatedButton>
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

function PaymentsView({ paymentStatus, payMethod, setPayMethod, paymentSettings, onPay, onOpenReceipt }: { paymentStatus: PaymentStatus; payMethod: "bank" | "qr"; setPayMethod: (v: "bank" | "qr") => void; paymentSettings: PaymentSettings; onPay: () => void; onOpenReceipt: () => void }) {
  const { t } = useLang();
  const paid = paymentStatus === "paid";
  return <section className="view-stack"><div className="metrics-grid payments-metrics"><article className="metric metric-featured"><p>{t("Jumlah telah dibayar")}</p><h2>{paid ? "RM11,732.09" : "RM8,920.16"}</h2><small>{paid ? t("4 pembayaran termasuk minggu ini") : t("3 pembayaran terdahulu")}</small></article><article className="metric"><p>{paid ? t("Bayaran minggu ini") : t("Menunggu bayaran")}</p><h2>{currency(commissionWeek.commission)}</h2><small>{commissionWeek.invoiceNo}</small></article><article className="metric"><p>{t("Rujukan")}</p><h2>{paid ? "Paid" : "22 Jul"}</h2><small>{paid ? commissionWeek.receiptNo : t("Tarikh bayaran seterusnya")}</small></article></div><article className="panel payment-flow-card"><div><h3>{t("Aliran pembayaran")}</h3><p>{t("Bayaran dibuat selepas invoice komisen diluluskan oleh Chef Ammar.")}</p></div><div className="payment-steps"><span className="complete"><b>1</b>{t("Jualan selesai")}</span><i /><span className="complete"><b>2</b>{t("Invoice dijana")}</span><i /><span className="complete"><b>3</b>{t("Kelulusan Chef")}</span><i /><span className={paid ? "complete" : "active"}><b>4</b>{paid ? t("Resit tersedia") : t("Bayaran")}</span></div><PaymentMethodBox payMethod={payMethod} setPayMethod={setPayMethod} reference={commissionWeek.reference} amount={commissionWeek.commission} settings={paymentSettings} /><div className="payment-actions"><button className="secondary-button" onClick={onOpenReceipt} disabled={!paid}>{t("Preview resit")}</button><GatedButton permission="recordPayment" className="primary-button" onClick={onPay} disabled={paid}>{paid ? t("Sudah dibayar") : "Pay KretivCo (dummy)"}</GatedButton></div></article></section>;
}

function TeamView({ notify }: { notify: (v: string) => void }) {
  const { t } = useLang();
  return <section className="panel team-panel"><div className="panel-heading"><div><h3>{t("Akses pasukan")}</h3><p>{t("Peranan dan tahap akses")}</p></div><button className="primary-button" onClick={() => notify(t("Jemputan pengguna baharu dibuka"))}>{t("Jemput pengguna")}</button></div>{[{ name: "Amnan Syahmi", email: "amnan@kretivwork.my", role: "Administrator", initials: "AS" }, { name: "Chef Ammar", email: "ammar@chefammar.com", role: "Approver", initials: "CA" }, { name: "Finance KretivWork", email: "finance@kretivwork.my", role: "Finance", initials: "FK" }].map((user) => <div className="team-row" key={user.email}><span className="avatar">{user.initials}</span><span><strong>{user.name}</strong><small>{user.email}</small></span><b>{user.role}</b><span className="status status-selesai"><span />{t("Aktif")}</span></div>)}</section>;
}

const CHANNEL_TO_SOURCE_KEY: Record<string, DataSourceKey> = { "BCL.my": "bclmy", Shopee: "shopee", "TikTok Shop": "tiktok" };

const SHIPMENT_STATUS_CLASS: Record<Shipment["status"], string> = {
  "Menunggu pickup": "ship-pending",
  "Dalam transit": "ship-transit",
  "Sedang dihantar": "ship-out",
  "Dihantar": "ship-delivered",
  "Gagal dihantar": "ship-failed",
};

const COURIER_TONES: Record<Shipment["courier"], { short: string; color: string }> = {
  "J&T Express": { short: "JT", color: "#dc2626" },
  "Pos Laju": { short: "PL", color: "#d97706" },
  "Ninja Van": { short: "NV", color: "#7c3aed" },
  "DHL eCommerce": { short: "DHL", color: "#ca8a04" },
};

// Courier tracking pages. Where the query param isn't stable we fall back to
// the courier's tracker landing page — the drawer's copy button covers the
// rest, so the user is never stranded.
const COURIER_TRACK_URLS: Record<Shipment["courier"], (no: string) => string> = {
  "J&T Express": () => "https://www.jtexpress.my/tracking",
  "Pos Laju": (no) => `https://track.pos.com.my/postal-services/quick-access/track-trace?trackingNo=${no}`,
  "Ninja Van": (no) => `https://www.ninjavan.co/en-my/tracking?id=${no}`,
  "DHL eCommerce": (no) => `https://ecommerceportal.dhl.com/track/?ref=${no}`,
};

function ShipmentStatusBadge({ status }: { status: Shipment["status"] }) {
  const { t } = useLang();
  return <span className={`status status-${SHIPMENT_STATUS_CLASS[status]}`}><span />{t(status)}</span>;
}

function ShipmentsPanel({ shipments, notify, onSelectShipment }: { shipments: Shipment[]; notify: (v: string) => void; onSelectShipment: (shipment: Shipment) => void }) {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Semua status penghantaran");
  const [courier, setCourier] = useState("Semua kurier");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filtered = useMemo(() => shipments.filter((shipment) => {
    const haystack = `${shipment.trackingNo} ${shipment.orderId} ${shipment.recipient} ${shipment.courier} ${shipment.destination} ${shipment.postcode}`.toLowerCase();
    return haystack.includes(query.toLowerCase())
      && (status === "Semua status penghantaran" || shipment.status === status)
      && (courier === "Semua kurier" || shipment.courier === courier);
  }), [shipments, query, status, courier]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  const inTransit = shipments.filter((s) => s.status === "Dalam transit" || s.status === "Sedang dihantar").length;
  const pending = shipments.filter((s) => s.status === "Menunggu pickup").length;
  const delivered = shipments.filter((s) => s.status === "Dihantar").length;
  const totalCost = shipments.reduce((sum, s) => sum + s.cost, 0);

  return <section className="view-stack">
    <div className="metrics-grid">
      <article className="metric metric-featured"><p>{t("Dalam transit")}</p><h2>{inTransit}</h2><small>{t("Bungkusan sedang bergerak")}</small></article>
      <article className="metric"><p>{t("Menunggu pickup")}</p><h2>{pending}</h2><small>{t("Belum diambil kurier")}</small></article>
      <article className="metric"><p>{t("Dihantar")}</p><h2>{delivered}</h2><small>{t("Selesai dihantar bulan ini")}</small></article>
      <article className="metric"><p>{t("Jumlah kos penghantaran")}</p><h2>{currency(totalCost)}</h2><small>{shipments.length} {t("penghantaran minggu ini")}</small></article>
    </div>

    <section className="panel orders-panel orders-expanded">
      <div className="panel-heading orders-heading"><div><h3>{t("Rekod penghantaran")}</h3><p>{filtered.length} {t("penghantaran ditemui")}</p></div><div className="table-actions">
        <label className="search-box"><Search size={16} /><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder={t("Cari...")} /></label>
        <Dropdown className="filter-select" value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={["Semua status penghantaran", ...SHIPMENT_STAGES, "Gagal dihantar"].map((v) => ({ value: v, label: t(v) }))} ariaLabel={t("Tapis status")} />
        <Dropdown className="filter-select compact-select" value={courier} onChange={(v) => { setCourier(v); setPage(1); }} options={["Semua kurier", ...Object.keys(COURIER_TONES)].map((v) => ({ value: v, label: t(v) }))} ariaLabel={t("Kurier")} />
        <button className="export-button" onClick={() => {
          downloadCsv(
            `penghantaran-${new Date().toISOString().slice(0, 10)}.csv`,
            ["Tracking", "Order ID", "Kurier", "Servis", "Penerima", "Destinasi", "Poskod", "Berat (kg)", "Kos (RM)", "Status", "Ditempah", "Anggaran sampai"],
            filtered.map((s) => [s.trackingNo, s.orderId, s.courier, s.service, s.recipient, s.destination, s.postcode, s.weightKg, s.cost.toFixed(2), s.status, s.bookedAt, s.estimatedDelivery]),
          );
          notify(`${filtered.length} ${t("baris dieksport ke CSV")}`);
        }} disabled={filtered.length === 0}><Download size={14} /><span>{t("Export")}</span></button>
      </div></div>
      <div className="table-wrap"><table><thead><tr><th>{t("TRACKING")}</th><th>{t("PESANAN")}</th><th>{t("PENERIMA")}</th><th>{t("KURIER")}</th><th>{t("DESTINASI")}</th><th>{t("KOS")}</th><th>{t("STATUS")}</th><th /></tr></thead><tbody>{visible.map((shipment) => <tr key={shipment.trackingNo} tabIndex={0} onClick={() => onSelectShipment(shipment)} onKeyDown={(e) => { if (e.key === "Enter") onSelectShipment(shipment); }}>
        <td><strong className="tracking-no">{shipment.trackingNo}</strong><small>{shipment.bookedAt}</small></td>
        <td><strong>{shipment.orderId}</strong></td>
        <td><div className="customer"><span>{shipment.initials}</span><strong>{shipment.recipient}</strong></div></td>
        <td><div className="courier-cell"><span className="courier-thumb" style={{ background: COURIER_TONES[shipment.courier].color }}>{COURIER_TONES[shipment.courier].short}</span><span><strong>{shipment.courier}</strong><small>{t(shipment.service)}</small></span></div></td>
        <td><strong>{shipment.destination}</strong><small>{shipment.postcode}</small></td>
        <td><strong>{currency(shipment.cost)}</strong><small>{shipment.weightKg} kg</small></td>
        <td><ShipmentStatusBadge status={shipment.status} /></td>
        <td><button className="row-menu" aria-label={`${t("Buka")} ${shipment.trackingNo}`} onClick={(e) => { e.stopPropagation(); onSelectShipment(shipment); }}><ChevronRight size={17} /></button></td>
      </tr>)}</tbody></table>{filtered.length === 0 && <div className="empty-state"><Truck size={28} /><strong>{t("Tiada penghantaran")}</strong><span>{t("Ubah carian atau filter kurier.")}</span><button onClick={() => { setQuery(""); setStatus("Semua status penghantaran"); setCourier("Semua kurier"); }}>{t("Kosongkan filter")}</button></div>}</div>
      {filtered.length > 0 && <div className="table-pagination"><span>{t("Menunjukkan")} {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} {t("daripada")} {filtered.length}</span><div><button disabled={page === 1} onClick={() => setPage((v) => Math.max(1, v - 1))} aria-label={t("Halaman sebelumnya")}><ChevronLeft size={15} /></button><b>{page} / {totalPages}</b><button disabled={page === totalPages} onClick={() => setPage((v) => Math.min(totalPages, v + 1))} aria-label={t("Halaman seterusnya")}><ChevronRight size={15} /></button></div></div>}
    </section>
  </section>;
}

function CouriersView({ shipments, courierStatus, notify }: { shipments: Shipment[]; courierStatus: Record<CourierKey, CourierSourceStatus> | null; notify: (v: string) => void }) {
  const { t } = useLang();

  const byCourier = useMemo(() => {
    const names = Object.keys(COURIER_TONES) as Shipment["courier"][];
    return names.map((name) => {
      const rows = shipments.filter((s) => s.courier === name);
      const settled = rows.filter((s) => s.status === "Dihantar" || s.status === "Gagal dihantar");
      const delivered = rows.filter((s) => s.status === "Dihantar").length;
      return {
        name,
        count: rows.length,
        cost: rows.reduce((sum, s) => sum + s.cost, 0),
        avgCost: rows.length ? rows.reduce((sum, s) => sum + s.cost, 0) / rows.length : 0,
        delivered,
        settled: settled.length,
        // Null while nothing has settled — a rate over zero completed
        // shipments would be meaningless.
        successRate: settled.length ? Math.round((delivered / settled.length) * 100) : null,
      };
    }).filter((row) => row.count > 0).sort((a, b) => b.count - a.count);
  }, [shipments]);

  const maxCount = Math.max(1, ...byCourier.map((row) => row.count));

  return <section className="settings-grid">
    <article className="panel settings-panel">
      <h3>{t("Prestasi kurier")}</h3><p>{t("Pecahan penghantaran dan kadar berjaya mengikut kurier.")}</p>
      {byCourier.map((row) => <div className="courier-row" key={row.name}>
        <span className="courier-thumb" style={{ background: COURIER_TONES[row.name].color }}>{COURIER_TONES[row.name].short}</span>
        <span className="courier-row-main">
          <strong>{row.name}</strong>
          <small>{row.count} {t("penghantaran")} · {t("Purata kos")} {currency(row.avgCost)}</small>
          <i className="courier-bar"><b style={{ width: `${(row.count / maxCount) * 100}%`, background: COURIER_TONES[row.name].color }} /></i>
        </span>
        <span className="courier-row-rate"><strong>{row.successRate === null ? "—" : `${row.successRate}%`}</strong><small>{row.settled ? `${row.delivered}/${row.settled} ${t("selesai")}` : t("belum selesai")}</small></span>
      </div>)}
    </article>

    <article className="panel settings-panel">
      <h3>{t("Sambungan kurier")}</h3><p>{t("Status API penghantaran.")}</p>
      {(Object.keys(COURIER_LABELS) as CourierKey[]).map((key) => {
        const state = courierStatus?.[key] ?? null;
        const issue = state === "error";
        const label = state === null ? t("Memuatkan status…") : state === "real" ? t("Disambungkan") : state === "mock" ? t("Data ujian (mock)") : t("Ralat sambungan API");
        const badge = state === null ? "…" : state === "real" ? t("Aktif") : state === "mock" ? "Mock" : t("Semak");
        return <button className={`integration-row ${issue ? "has-warning" : state === "mock" ? "is-mock" : ""}`} key={key} onClick={() => issue && notify(t("Ralat sambungan API"))}>
          <span className="courier-thumb" style={{ background: key === "jnt" ? COURIER_TONES["J&T Express"].color : "#0d9488" }}>{key === "jnt" ? "JT" : "EP"}</span>
          <span><strong>{COURIER_LABELS[key]}</strong><small>{label}</small></span>
          <span className="integration-state"><i />{badge}</span>
        </button>;
      })}
    </article>
  </section>;
}

function ShipmentDrawer({ shipment, order, onClose, onOpenOrder, notify }: { shipment: Shipment; order: Order | null; onClose: () => void; onOpenOrder: (order: Order) => void; notify: (v: string) => void }) {
  const { t } = useLang();
  const settled = shipment.status === "Dihantar" || shipment.status === "Gagal dihantar";
  const lastIndex = shipment.checkpoints.length - 1;

  return <div className="modal-layer drawer-layer" role="dialog" aria-modal="true" aria-label={`${t("Butiran penghantaran")} ${shipment.trackingNo}`}>
    <aside className="drawer">
      <div className="drawer-header"><div><p className="eyebrow">{t("BUTIRAN PENGHANTARAN")}</p><h2 className="tracking-no">{shipment.trackingNo}</h2></div><button className="modal-close" onClick={onClose}><X size={20} /></button></div>
      <div className="drawer-status"><ShipmentStatusBadge status={shipment.status} /><span>{t("Ditempah")} {shipment.bookedAt}</span></div>

      <section className="drawer-section"><h3>{t("Kurier")}</h3><div className="drawer-product"><span className="courier-thumb large" style={{ background: COURIER_TONES[shipment.courier].color }}>{COURIER_TONES[shipment.courier].short}</span><span><strong>{shipment.courier}</strong><small>{t(shipment.service)}</small></span><b>{currency(shipment.cost)}</b></div></section>

      {order && <section className="drawer-section"><h3>{t("Pesanan")}</h3>
        <button className="linked-card" onClick={() => onOpenOrder(order)}>
          <span className="product-thumb" style={{ background: order.productTone }}>{order.productCode}</span>
          <span className="linked-card-main"><strong>{order.id}</strong><small>{order.item} · {currency(order.amount)}</small></span>
          <span className="linked-card-end"><StatusBadge status={order.status} /><ChevronRight size={16} /></span>
        </button>
      </section>}

      <section className="drawer-section"><h3>{t("Penerima")}</h3><div className="drawer-details">
        <span><small>{t("Nama")}</small><strong>{shipment.recipient}</strong></span>
        <span><small>{t("Pesanan")}</small><strong>{shipment.orderId}</strong></span>
        <span><small>{t("Destinasi")}</small><strong>{shipment.destination}</strong></span>
        <span><small>{t("Poskod")}</small><strong>{shipment.postcode}</strong></span>
        <span><small>{t("Berat")}</small><strong>{shipment.weightKg} kg</strong></span>
        <span><small>{t("Anggaran sampai")}</small><strong>{shipment.estimatedDelivery}</strong></span>
      </div></section>

      <section className="drawer-section"><h3>{t("Jejak penghantaran")}</h3><div className="order-timeline">{shipment.checkpoints.map((checkpoint, i) => {
        // Still-moving shipments leave their newest checkpoint as "current"
        // (amber); anything the courier flagged as a fault renders red.
        const state = checkpoint.failed ? "failed" : i === lastIndex && !settled ? "current" : "complete";
        return <span className={state} key={`${checkpoint.time}-${i}`}><i /><b>{t(checkpoint.status)}</b><small>{checkpoint.location} · {checkpoint.time}</small></span>;
      })}</div></section>

      <div className="drawer-total"><span>{t("Kos penghantaran")}</span><strong>{currency(shipment.cost)}</strong></div>
      <div className="drawer-actions">
        <button className="secondary-button" onClick={() => { navigator.clipboard?.writeText(shipment.trackingNo); notify(t("Nombor tracking disalin")); }}>{t("Salin no. tracking")}</button>
        <a className="primary-button" href={COURIER_TRACK_URLS[shipment.courier](shipment.trackingNo)} target="_blank" rel="noreferrer">{t("Jejak di laman kurier")}</a>
      </div>
    </aside>
  </div>;
}

function NotificationPanel({ notifications, onSelect, onClose }: { notifications: AppNotification[]; onSelect: (n: AppNotification) => void; onClose: () => void }) {
  const { t } = useLang();
  return <>
    <button className="dropdown-backdrop" aria-hidden onClick={onClose} tabIndex={-1} />
    <div className="notification-panel" role="dialog" aria-label={t("Notifikasi")}>
      <div className="notification-head"><strong>{t("Notifikasi")}</strong><span>{notifications.length}</span></div>
      {notifications.length === 0
        ? <p className="notification-empty">{t("Tiada notifikasi baharu")}</p>
        : <ul>{notifications.map((n) => <li key={n.id}>
            <button onClick={() => onSelect(n)}>
              <i className={`notification-dot tone-${n.tone}`} />
              <span><strong>{t(n.title)}</strong><small>{t(n.detail)}</small></span>
              <ChevronRight size={15} />
            </button>
          </li>)}</ul>}
    </div>
  </>;
}

function BookShipmentModal({ order, onClose, onBook }: { order: Order; onClose: () => void; onBook: (courier: CourierName, weightKg: number, destination: string, postcode: string) => Promise<void> }) {
  const { t } = useLang();
  const [courier, setCourier] = useState<CourierName>("J&T Express");
  const [weight, setWeight] = useState("0.6");
  const [destination, setDestination] = useState("");
  const [postcode, setPostcode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const weightKg = Number(weight);
  const validWeight = Number.isFinite(weightKg) && weightKg > 0;
  const validPostcode = /^\d{5}$/.test(postcode.trim());
  const ready = validWeight && validPostcode && destination.trim().length > 0 && !busy;

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await onBook(courier, weightKg, destination.trim(), postcode.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return <div className="modal-layer" role="dialog" aria-modal="true"><div className="modal">
    <button className="modal-close" onClick={onClose}><X size={20} /></button>
    <p className="eyebrow">{t("TEMPAH PENGHANTARAN")}</p>
    <h2>{order.id}</h2>
    <p>{t("Tempah AWB untuk")} {order.customer} · {order.item}</p>

    <label className="settings-field"><small>{t("Kurier")}</small>
      <div className="courier-picker">{(Object.keys(COURIER_TONES) as CourierName[]).map((name) => <button
        key={name}
        className={courier === name ? "active" : ""}
        onClick={() => setCourier(name)}
        aria-pressed={courier === name}
      >
        <span className="courier-thumb" style={{ background: COURIER_TONES[name].color }}>{COURIER_TONES[name].short}</span>
        <span><strong>{name}</strong><small>{currency(quoteFor(name, validWeight ? weightKg : 0.6))}</small></span>
      </button>)}</div>
    </label>

    <div className="booking-fields">
      <label className="settings-field"><small>{t("Berat")} (kg)</small><input className="settings-input" value={weight} onChange={(e) => setWeight(e.target.value)} inputMode="decimal" /></label>
      <label className="settings-field"><small>{t("Poskod")}</small><input className="settings-input" value={postcode} onChange={(e) => setPostcode(e.target.value)} inputMode="numeric" maxLength={5} placeholder="40150" /></label>
    </div>
    <label className="settings-field"><small>{t("Destinasi")}</small><input className="settings-input" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Shah Alam, Selangor" /></label>

    {postcode.length > 0 && !validPostcode && <p className="import-note">{t("Poskod mesti 5 digit")}</p>}
    {error && <div className="import-summary has-error"><strong>{t("Tempahan gagal")}</strong><span>{error}</span></div>}

    <div className="booking-quote"><span>{t("Anggaran kos")}</span><strong>{validWeight ? currency(quoteFor(courier, weightKg)) : "—"}</strong></div>

    <div className="modal-actions">
      <button className="secondary-button" onClick={onClose}>{t("Batal")}</button>
      <button className="primary-button" disabled={!ready} onClick={submit}>{busy ? t("Menempah…") : t("Tempah penghantaran")}</button>
    </div>
  </div></div>;
}

const CONTENT_STATUS_CLASS: Record<ContentStatus, string> = {
  "Idea": "ship-pending",
  "Sedang dibuat": "ship-transit",
  "Perlu kelulusan": "ship-out",
  "Dijadualkan": "ship-transit",
  "Diterbitkan": "ship-delivered",
};

const CONTENT_CHANNEL_TONES: Record<string, string> = {
  TikTok: "#0d9488", Instagram: "#db2777", Threads: "#1c1917", "Shopee Live": "#ea580c", "BCL.my": "#d97706",
};

function ContentBoard({ pieces, products, onSelect, onCreate }: { pieces: ContentPiece[]; products: Product[]; onSelect: (p: ContentPiece) => void; onCreate: () => void }) {
  const { t } = useLang();
  const [channel, setChannel] = useState("Semua saluran kandungan");

  const filtered = useMemo(
    () => pieces.filter((p) => channel === "Semua saluran kandungan" || p.channel === channel),
    [pieces, channel],
  );

  const published = filtered.filter((p) => p.status === "Diterbitkan").length;
  const overdue = filtered.filter((p) => isOverdue(p)).length;
  const dueSoon = filtered.filter((p) => isDueSoon(p)).length;
  const awaiting = filtered.filter((p) => p.status === "Perlu kelulusan").length;

  return <section className="view-stack">
    <div className="metrics-grid">
      <article className="metric metric-featured"><p>{t("Dalam perancangan")}</p><h2>{filtered.length - published}</h2><small>{t("Belum diterbitkan")}</small></article>
      <article className="metric"><p>{t("Perlu kelulusan Chef")}</p><h2>{awaiting}</h2><small>{t("Menunggu semakan")}</small></article>
      <article className="metric"><p>{t("Akan datang")}</p><h2>{dueSoon}</h2><small>{t("Dalam 2 hari")}</small></article>
      <article className="metric"><p>{t("Lewat jadual")}</p><h2>{overdue}</h2><small>{t("Tarikh sudah berlalu")}</small></article>
    </div>

    <section className="panel">
      <div className="panel-heading orders-heading"><div><h3>{t("Papan kandungan")}</h3><p>{filtered.length} {t("kandungan dirancang")}</p></div><div className="table-actions">
        <Dropdown className="filter-select" value={channel} onChange={setChannel} options={["Semua saluran kandungan", ...CONTENT_CHANNELS].map((v) => ({ value: v, label: t(v) }))} ariaLabel={t("Tapis saluran")} />
        <GatedButton permission="editContent" className="primary-button" onClick={onCreate}>{t("Kandungan baharu")}</GatedButton>
      </div></div>

      <div className="content-board">{CONTENT_STAGES.map((stage) => {
        const column = filtered.filter((p) => p.status === stage);
        return <div className="content-column" key={stage}>
          <div className="content-column-head"><strong>{t(stage)}</strong><span>{column.length}</span></div>
          <div className="content-column-body">{column.map((piece) => {
            const days = daysUntil(piece.scheduledFor);
            const late = isOverdue(piece);
            const product = products.find((p) => p.sku === piece.productSku);
            const drive = piece.driveUrl ? parseDriveUrl(piece.driveUrl) : null;
            return <button className={`content-card ${late ? "is-late" : ""}`} key={piece.id} onClick={() => onSelect(piece)}>
              <span className="content-card-top">
                <i className="content-channel-dot" style={{ background: CONTENT_CHANNEL_TONES[piece.channel] ?? "#64748b" }} />
                <small>{piece.channel} · {t(piece.format)}</small>
                {drive && <Link2 size={12} className="content-card-link" />}
              </span>
              <strong>{piece.title}</strong>
              <span className="content-card-meta">
                <small className={late ? "is-late-text" : ""}>{piece.scheduledFor}{days !== null && piece.status !== "Diterbitkan" ? ` · ${late ? `${Math.abs(days)} ${t("hari lewat")}` : days === 0 ? t("hari ini") : `${days} ${t("hari lagi")}`}` : ""}</small>
                {product && <span className="product-thumb tiny" style={{ background: product.tone }}>{product.code}</span>}
              </span>
            </button>;
          })}
          {column.length === 0 && <p className="content-column-empty">{t("Tiada")}</p>}
          </div>
        </div>;
      })}</div>
    </section>
  </section>;
}

function ContentCalendar({ pieces, shoots, onSelectPiece, onSelectShoot, onCreateShoot }: { pieces: ContentPiece[]; shoots: ContentShoot[]; onSelectPiece: (p: ContentPiece) => void; onSelectShoot: (s: ContentShoot) => void; onCreateShoot: (date: string) => void }) {
  const { t } = useLang();
  const { can } = useRole();
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const grid = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor]);
  const shootsByDate = useMemo(() => groupByDate(shoots, (s) => s.date), [shoots]);
  const piecesByDate = useMemo(() => groupByDate(pieces, (p) => p.scheduledFor), [pieces]);

  const monthShoots = shoots.filter((s) => s.date.startsWith(`${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}`));
  const monthPieces = pieces.filter((p) => p.scheduledFor.startsWith(`${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}`));

  return <section className="view-stack">
    <div className="metrics-grid">
      <article className="metric metric-featured"><p>{t("Hari penggambaran")}</p><h2>{monthShoots.length}</h2><small>{t("Bulan ini")}</small></article>
      <article className="metric"><p>{t("Kandungan terbit")}</p><h2>{monthPieces.length}</h2><small>{t("Dijadualkan bulan ini")}</small></article>
      <article className="metric"><p>{t("Belum disahkan")}</p><h2>{monthShoots.filter((s) => s.status === "Dirancang").length}</h2><small>{t("Shoot masih dirancang")}</small></article>
      <article className="metric"><p>{t("Selesai dirakam")}</p><h2>{monthShoots.filter((s) => s.status === "Selesai").length}</h2><small>{t("Bulan ini")}</small></article>
    </div>

    <section className="panel">
      <div className="panel-heading orders-heading">
        <div className="calendar-nav">
          <button className="cal-arrow" onClick={() => setCursor((c) => shiftMonth(c.year, c.month, -1))} aria-label={t("Bulan sebelumnya")}><ChevronLeft size={16} /></button>
          <strong>{t(monthLabelBM(cursor.year, cursor.month).split(" ")[0])} {cursor.year}</strong>
          <button className="cal-arrow" onClick={() => setCursor((c) => shiftMonth(c.year, c.month, 1))} aria-label={t("Bulan seterusnya")}><ChevronRight size={16} /></button>
          <button className="cal-today" onClick={() => setCursor({ year: today.getFullYear(), month: today.getMonth() })}>{t("Hari ini")}</button>
        </div>
        <div className="table-actions">
          <span className="cal-legend"><i className="legend-shoot" />{t("Penggambaran")}</span>
          <span className="cal-legend"><i className="legend-live" />{t("Tarikh terbit")}</span>
          <GatedButton permission="editContent" className="primary-button" onClick={() => onCreateShoot(toIsoDate(today))}>{t("Shoot baharu")}</GatedButton>
        </div>
      </div>

      <div className="calendar-scroll"><div className="calendar-grid" role="grid" aria-label={t("Kalendar kandungan")}>
        {WEEKDAY_LABELS_BM.map((day) => <div className="cal-weekday" key={day}>{t(day)}</div>)}
        {grid.map((day) => {
          const dayShoots = shootsByDate.get(day.date) ?? [];
          const dayPieces = piecesByDate.get(day.date) ?? [];
          return <div
            className={`cal-cell ${day.inMonth ? "" : "is-outside"} ${day.isToday ? "is-today" : ""} ${day.isWeekend ? "is-weekend" : ""}`}
            key={day.date}
            role="gridcell"
            onDoubleClick={() => can("editContent") && day.inMonth && onCreateShoot(day.date)}
          >
            <span className="cal-daynum">{day.dayOfMonth}</span>
            <div className="cal-events">
              {dayShoots.map((shoot) => <button className={`cal-event is-shoot tone-${shootStatusTone(shoot.status)}`} key={shoot.id} onClick={() => onSelectShoot(shoot)} title={`${shoot.title} · ${shoot.location}`}>
                <Video size={10} /><span>{shoot.title}</span>
              </button>)}
              {dayPieces.map((piece) => <button className="cal-event is-live" key={piece.id} onClick={() => onSelectPiece(piece)} title={`${piece.title} · ${piece.channel}`}>
                <i style={{ background: CONTENT_CHANNEL_TONES[piece.channel] ?? "#64748b" }} /><span>{piece.title}</span>
              </button>)}
            </div>
          </div>;
        })}
      </div></div>
      <p className="cal-hint">{t("Klik dua kali pada mana-mana hari untuk tambah penggambaran.")}</p>
    </section>
  </section>;
}

function ShootDrawer({ shoot, pieces, isNew, onClose, onSave, onDelete, onSelectPiece }: { shoot: ContentShoot; pieces: ContentPiece[]; isNew: boolean; onClose: () => void; onSave: (s: ContentShoot) => void; onDelete: (id: string) => void; onSelectPiece: (p: ContentPiece) => void }) {
  const { t } = useLang();
  const { can, deniedReason } = useRole();
  const [draft, setDraft] = useState<ContentShoot>(shoot);
  const editable = can("editContent");
  const set = <K extends keyof ContentShoot>(key: K, value: ContentShoot[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const linked = pieces.filter((p) => p.shootId === draft.id);
  const drive = draft.driveUrl ? parseDriveUrl(draft.driveUrl) : null;
  const driveInvalid = (draft.driveUrl ?? "").trim().length > 0 && (drive === null || drive.kind === "unknown");
  const valid = draft.title.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(draft.date) && !driveInvalid;

  return <div className="modal-layer drawer-layer" role="dialog" aria-modal="true" aria-label={t("Butiran penggambaran")}>
    <aside className="drawer">
      <div className="drawer-header"><div><p className="eyebrow">{isNew ? t("PENGGAMBARAN BAHARU") : t("BUTIRAN PENGGAMBARAN")}</p><h2>{draft.id}</h2></div><button className="modal-close" onClick={onClose}><X size={20} /></button></div>

      <label className="settings-field"><small>{t("Tajuk penggambaran")}</small>
        <input className="settings-input" value={draft.title} onChange={(e) => set("title", e.target.value)} disabled={!editable} placeholder={t("Contoh: Batch raya — 4 video pendek")} />
      </label>

      <div className="booking-fields">
        <label className="settings-field"><small>{t("Tarikh shoot")}</small>
          <input className="settings-input" type="date" value={draft.date} onChange={(e) => set("date", e.target.value)} disabled={!editable} />
        </label>
        <label className="settings-field"><small>{t("Masa panggilan")}</small>
          <input className="settings-input" value={draft.callTime} onChange={(e) => set("callTime", e.target.value)} disabled={!editable} placeholder="9:00 AM" />
        </label>
      </div>

      <div className="booking-fields">
        <label className="settings-field"><small>{t("Lokasi")}</small>
          <select className="settings-input" value={draft.location} onChange={(e) => set("location", e.target.value as ContentShoot["location"])} disabled={!editable}>{SHOOT_LOCATIONS.map((l) => <option key={l} value={l}>{t(l)}</option>)}</select>
        </label>
        <label className="settings-field"><small>{t("Status")}</small>
          <select className="settings-input" value={draft.status} onChange={(e) => set("status", e.target.value as ContentShoot["status"])} disabled={!editable}>{SHOOT_STATUSES.map((s) => <option key={s} value={s}>{t(s)}</option>)}</select>
        </label>
      </div>

      <label className="settings-field"><small>{t("Kru")}</small>
        <input className="settings-input" value={draft.crew} onChange={(e) => set("crew", e.target.value)} disabled={!editable} placeholder={t("Contoh: Chef Ammar, Amnan, 1 videografer")} />
      </label>

      <label className="settings-field"><small>{t("Folder footage mentah")}</small>
        <input className="settings-input" value={draft.driveUrl ?? ""} onChange={(e) => set("driveUrl", e.target.value || null)} disabled={!editable} placeholder="https://drive.google.com/drive/folders/..." />
      </label>
      {driveInvalid && <p className="import-note">{t("Pautan Google Drive tidak sah")}</p>}
      {drive?.embedUrl && <div className="drive-preview"><iframe src={drive.embedUrl} title={draft.title} loading="lazy" /></div>}

      <label className="settings-field"><small>{t("Nota")}</small>
        <textarea className="settings-input content-notes" value={draft.notes} onChange={(e) => set("notes", e.target.value)} disabled={!editable} rows={3} />
      </label>

      <section className="drawer-section"><h3>{t("Kandungan dari shoot ini")} ({linked.length})</h3>
        {linked.length === 0
          ? <p className="drawer-empty"><span>{t("Belum ada kandungan diikat pada shoot ini.")}</span></p>
          : <div className="customer-orders">{linked.map((piece) => <button className="customer-order" key={piece.id} onClick={() => onSelectPiece(piece)}>
              <i className="content-channel-dot" style={{ background: CONTENT_CHANNEL_TONES[piece.channel] ?? "#64748b" }} />
              <span className="customer-order-main"><strong>{piece.title}</strong><small>{piece.channel} · {t("terbit")} {piece.scheduledFor}</small></span>
              <span className={`status status-${CONTENT_STATUS_CLASS[piece.status]}`}><span />{t(piece.status)}</span>
            </button>)}</div>}
      </section>

      <div className="drawer-actions">
        {!isNew && <button className="secondary-button" disabled={!editable} title={editable ? undefined : deniedReason} onClick={() => onDelete(draft.id)}>{t("Padam")}</button>}
        <button className="primary-button" disabled={!valid || !editable} title={editable ? undefined : deniedReason} onClick={() => onSave(draft)}>{t("Simpan")}</button>
      </div>
    </aside>
  </div>;
}

function ContentLibrary({ driveFolderUrl, onSaveFolder, notify }: { driveFolderUrl: string | null; onSaveFolder: (url: string | null) => void; notify: (v: string) => void }) {
  const { t } = useLang();
  const { can, deniedReason } = useRole();
  const [draft, setDraft] = useState(driveFolderUrl ?? "");

  useEffect(() => { setDraft(driveFolderUrl ?? ""); }, [driveFolderUrl]);

  const ref = driveFolderUrl ? parseDriveUrl(driveFolderUrl) : null;
  const draftRef = draft.trim() ? parseDriveUrl(draft) : null;
  const draftInvalid = draft.trim().length > 0 && (draftRef === null || draftRef.kind === "unknown");

  return <section className="view-stack">
    <article className="panel settings-panel">
      <h3>{t("Folder Google Drive")}</h3>
      <p>{t("Tampal pautan folder Drive pasukan. Folder perlu dikongsi 'Sesiapa yang ada pautan' untuk paparan terus.")}</p>
      <label className="settings-field"><small>{t("Pautan folder")}</small>
        <input className="settings-input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="https://drive.google.com/drive/folders/..." />
      </label>
      {draftInvalid && <p className="import-note">{t("Pautan Google Drive tidak sah")}</p>}
      <div className="drive-actions">
        <button className="primary-button" disabled={!can("editSettings") || draftInvalid} title={can("editSettings") ? undefined : deniedReason} onClick={() => { onSaveFolder(draft.trim() || null); notify(t("Folder Drive disimpan")); }}>{t("Simpan folder")}</button>
        {ref && <a className="secondary-button" href={ref.url} target="_blank" rel="noreferrer">{t("Buka di Drive")}<ExternalLink size={13} /></a>}
      </div>
    </article>

    <article className="panel drive-panel">
      <div className="panel-heading"><div><h3>{t("Pustaka kandungan")}</h3><p>{t("Fail terus dari folder Drive pasukan.")}</p></div></div>
      {ref?.embedUrl
        ? <iframe className="drive-frame" src={ref.embedUrl} title={t("Pustaka kandungan")} loading="lazy" />
        : <div className="empty-state"><FolderOpen size={28} /><strong>{t("Belum ada folder Drive")}</strong><span>{t("Tampal pautan folder di atas untuk lihat fail di sini.")}</span></div>}
      {ref?.embedUrl && <p className="drive-hint">{t("Kalau paparan kosong atau minta log masuk, folder itu belum dikongsi secara umum.")}</p>}
    </article>
  </section>;
}

function ContentDrawer({ piece, products, shoots, isNew, onClose, onSave, onDelete }: { piece: ContentPiece; products: Product[]; shoots: ContentShoot[]; isNew: boolean; onClose: () => void; onSave: (p: ContentPiece) => void; onDelete: (id: string) => void }) {
  const { t } = useLang();
  const { can, deniedReason } = useRole();
  const [draft, setDraft] = useState<ContentPiece>(piece);
  const editable = can("editContent");
  const set = <K extends keyof ContentPiece>(key: K, value: ContentPiece[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const drive = draft.driveUrl ? parseDriveUrl(draft.driveUrl) : null;
  const driveInvalid = (draft.driveUrl ?? "").trim().length > 0 && (drive === null || drive.kind === "unknown");
  const product = products.find((p) => p.sku === draft.productSku);
  const valid = draft.title.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(draft.scheduledFor) && !driveInvalid;

  return <div className="modal-layer drawer-layer" role="dialog" aria-modal="true" aria-label={t("Butiran kandungan")}>
    <aside className="drawer">
      <div className="drawer-header"><div><p className="eyebrow">{isNew ? t("KANDUNGAN BAHARU") : t("BUTIRAN KANDUNGAN")}</p><h2>{draft.id}</h2></div><button className="modal-close" onClick={onClose}><X size={20} /></button></div>

      <label className="settings-field"><small>{t("Tajuk")}</small>
        <input className="settings-input" value={draft.title} onChange={(e) => set("title", e.target.value)} disabled={!editable} placeholder={t("Contoh: Resepi Nasi Mandi 15 minit")} />
      </label>

      <div className="booking-fields">
        <label className="settings-field"><small>{t("Saluran")}</small>
          <select className="settings-input" value={draft.channel} onChange={(e) => set("channel", e.target.value as ContentPiece["channel"])} disabled={!editable}>{CONTENT_CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </label>
        <label className="settings-field"><small>{t("Format")}</small>
          <select className="settings-input" value={draft.format} onChange={(e) => set("format", e.target.value as ContentPiece["format"])} disabled={!editable}>{CONTENT_FORMATS.map((f) => <option key={f} value={f}>{t(f)}</option>)}</select>
        </label>
      </div>

      <div className="booking-fields">
        <label className="settings-field"><small>{t("Tarikh terbit")}</small>
          <input className="settings-input" type="date" value={draft.scheduledFor} onChange={(e) => set("scheduledFor", e.target.value)} disabled={!editable} />
        </label>
        <label className="settings-field"><small>{t("Status")}</small>
          <select className="settings-input" value={draft.status} onChange={(e) => set("status", e.target.value as ContentStatus)} disabled={!editable && !can("approveContent")}>{CONTENT_STAGES.map((s) => <option key={s} value={s}>{t(s)}</option>)}</select>
        </label>
      </div>

      <label className="settings-field"><small>{t("Produk berkaitan")}</small>
        <select className="settings-input" value={draft.productSku ?? ""} onChange={(e) => set("productSku", e.target.value || null)} disabled={!editable}>
          <option value="">{t("Tiada produk khusus")}</option>
          {products.map((p) => <option key={p.sku} value={p.sku}>{p.name} · {p.weightLabel}</option>)}
        </select>
      </label>
      {product && <div className="content-product-hint">
        <span className="product-thumb" style={{ background: product.tone }}>{product.code}</span>
        <span><strong>{product.name}</strong><small>{t("Stok")}: {product.stock} · {t("Terjual minggu ini")}: {product.soldThisWeek}</small></span>
      </div>}

      <label className="settings-field"><small>{t("Penggambaran")}</small>
        <select className="settings-input" value={draft.shootId ?? ""} onChange={(e) => set("shootId", e.target.value || null)} disabled={!editable}>
          <option value="">{t("Belum dijadualkan")}</option>
          {shoots.map((s) => <option key={s.id} value={s.id}>{s.date} · {s.title}</option>)}
        </select>
      </label>

      <label className="settings-field"><small>{t("Pautan Google Drive")}</small>
        <input className="settings-input" value={draft.driveUrl ?? ""} onChange={(e) => set("driveUrl", e.target.value || null)} disabled={!editable} placeholder="https://drive.google.com/file/d/..." />
      </label>
      {driveInvalid && <p className="import-note">{t("Pautan Google Drive tidak sah")}</p>}
      {drive?.embedUrl && <div className="drive-preview">
        <iframe src={drive.embedUrl} title={draft.title} loading="lazy" />
        <a className="secondary-button" href={drive.url} target="_blank" rel="noreferrer">{t("Buka di Drive")}<ExternalLink size={13} /></a>
      </div>}

      <label className="settings-field"><small>{t("Nota")}</small>
        <textarea className="settings-input content-notes" value={draft.notes} onChange={(e) => set("notes", e.target.value)} disabled={!editable} rows={3} />
      </label>

      <div className="drawer-actions">
        {!isNew && <button className="secondary-button" disabled={!editable} title={editable ? undefined : deniedReason} onClick={() => onDelete(draft.id)}>{t("Padam")}</button>}
        <button className="primary-button" disabled={!valid || (!editable && !can("approveContent"))} title={editable || can("approveContent") ? undefined : deniedReason} onClick={() => onSave(draft)}>{t("Simpan")}</button>
      </div>
    </aside>
  </div>;
}

const STOCK_LEVEL_CLASS = { out: "ship-failed", low: "ship-out", ok: "ship-delivered" } as const;
const STOCK_LEVEL_LABEL = { out: "Habis", low: "Rendah", ok: "Mencukupi" } as const;

function ProductsView({ products, saving, onSaveStock, notify }: { products: Product[]; saving: string | null; onSaveStock: (sku: string, stock: number, reorderLevel: number) => void; notify: (v: string) => void }) {
  const { t } = useLang();
  const { can, deniedReason } = useRole();
  const [editing, setEditing] = useState<string | null>(null);
  const [stock, setStock] = useState("");
  const [reorder, setReorder] = useState("");

  const startEdit = (product: Product) => {
    setEditing(product.sku);
    setStock(String(product.stock));
    setReorder(String(product.reorderLevel));
  };

  const commit = (sku: string) => {
    const nextStock = Number(stock);
    const nextReorder = Number(reorder);
    if (!Number.isInteger(nextStock) || nextStock < 0 || !Number.isInteger(nextReorder) || nextReorder < 0) {
      notify(t("Masukkan nombor bulat yang sah"));
      return;
    }
    onSaveStock(sku, nextStock, nextReorder);
    setEditing(null);
  };

  const lowCount = products.filter((p) => stockLevelOf(p) !== "ok").length;
  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const stockValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);
  const soldThisWeek = products.reduce((sum, p) => sum + p.soldThisWeek, 0);

  return <section className="view-stack">
    <div className="metrics-grid">
      <article className="metric metric-featured"><p>{t("Nilai stok")}</p><h2>{currency(stockValue)}</h2><small>{totalUnits} {t("unit dalam stok")}</small></article>
      <article className="metric"><p>{t("SKU perlu perhatian")}</p><h2>{lowCount}</h2><small>{t("Habis atau bawah paras pesanan semula")}</small></article>
      <article className="metric"><p>{t("Unit terjual")}</p><h2>{soldThisWeek}</h2><small>{t("Minggu ini")}</small></article>
      <article className="metric"><p>{t("Jumlah SKU")}</p><h2>{products.length}</h2><small>Chef Ammar™ Arabic Spices</small></article>
    </div>

    <section className="panel orders-panel orders-expanded">
      <div className="panel-heading orders-heading"><div><h3>{t("Inventori produk")}</h3><p>{t("Paras stok dan kadar jualan setiap SKU.")}</p></div><div className="table-actions">
        <button className="export-button" onClick={() => {
          downloadCsv(
            `inventori-${new Date().toISOString().slice(0, 10)}.csv`,
            ["SKU", "Produk", "Berat", "Harga (RM)", "Stok", "Paras pesanan semula", "Terjual minggu ini", "Status"],
            products.map((p) => [p.sku, p.name, p.weightLabel, p.price.toFixed(2), p.stock, p.reorderLevel, p.soldThisWeek, STOCK_LEVEL_LABEL[stockLevelOf(p)]]),
          );
          notify(`${products.length} ${t("baris dieksport ke CSV")}`);
        }}><Download size={14} /><span>{t("Export")}</span></button>
      </div></div>
      <div className="table-wrap"><table><thead><tr><th>{t("PRODUK")}</th><th>SKU</th><th>{t("HARGA")}</th><th>{t("STOK")}</th><th>{t("PARAS SEMULA")}</th><th>{t("TERJUAL")}</th><th>{t("LIPUTAN")}</th><th>{t("STATUS")}</th><th /></tr></thead><tbody>{products.map((product) => {
        const level = stockLevelOf(product);
        const cover = weeksOfCover(product);
        const isEditing = editing === product.sku;
        return <tr key={product.sku}>
          <td><div className="product-cell"><span className="product-thumb" style={{ background: product.tone }}>{product.code}</span><span><strong>{product.name}</strong><small>{product.weightLabel}</small></span></div></td>
          <td><small className="tracking-no">{product.sku}</small></td>
          <td><strong>{currency(product.price)}</strong></td>
          <td>{isEditing
            ? <input className="stock-input" value={stock} onChange={(e) => setStock(e.target.value)} aria-label={t("STOK")} />
            : <strong className="stock-count">{product.stock}</strong>}</td>
          <td>{isEditing
            ? <input className="stock-input" value={reorder} onChange={(e) => setReorder(e.target.value)} aria-label={t("PARAS SEMULA")} />
            : <span className="muted-cell">{product.reorderLevel}</span>}</td>
          <td><span className="muted-cell">{product.soldThisWeek}</span></td>
          <td><span className="muted-cell">{cover === null ? "—" : `${cover} ${t("minggu")}`}</span></td>
          <td><span className={`status status-${STOCK_LEVEL_CLASS[level]}`}><span />{t(STOCK_LEVEL_LABEL[level])}</span></td>
          <td>{isEditing
            ? <div className="stock-actions"><button className="secondary-button compact" onClick={() => setEditing(null)}>{t("Batal")}</button><button className="primary-button compact" disabled={saving === product.sku} onClick={() => commit(product.sku)}>{saving === product.sku ? t("Menyimpan…") : t("Simpan")}</button></div>
            : <button className="row-menu" title={can("adjustStock") ? t("Laras stok") : deniedReason} disabled={!can("adjustStock")} aria-label={`${t("Laras stok")} ${product.name}`} onClick={() => startEdit(product)}><Pencil size={15} /></button>}</td>
        </tr>;
      })}</tbody></table></div>
    </section>
  </section>;
}

function CustomersView({ orders, onOpenOrder }: { orders: Order[]; onOpenOrder: (order: Order) => void }) {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const customers = useMemo(() => aggregateCustomers(orders), [orders]);
  const summary = useMemo(() => summariseCustomers(customers), [customers]);
  const filtered = useMemo(() => customers.filter((c) => `${c.name} ${c.topChannel}`.toLowerCase().includes(query.toLowerCase())), [customers, query]);

  return <section className="view-stack">
    <div className="metrics-grid">
      <article className="metric metric-featured"><p>{t("Jumlah pelanggan")}</p><h2>{summary.total}</h2><small>{t("Daripada pesanan yang direkod")}</small></article>
      <article className="metric"><p>{t("Pelanggan berulang")}</p><h2>{summary.repeat}</h2><small>{summary.repeatRate}% {t("kadar pembelian berulang")}</small></article>
      <article className="metric"><p>{t("Purata nilai sepanjang hayat")}</p><h2>{currency(summary.averageLifetimeValue)}</h2><small>{t("Setiap pelanggan")}</small></article>
      <article className="metric"><p>{t("Pelanggan teratas")}</p><h2 className="metric-name">{customers[0]?.name ?? "—"}</h2><small>{customers[0] ? currency(customers[0].lifetimeValue) : ""}</small></article>
    </div>

    <section className="panel orders-panel orders-expanded">
      <div className="panel-heading orders-heading"><div><h3>{t("Pelanggan")}</h3><p>{filtered.length} {t("pelanggan ditemui")}</p></div><div className="table-actions">
        <label className="search-box"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Cari...")} /></label>
      </div></div>
      <div className="table-wrap"><table><thead><tr><th>{t("PELANGGAN")}</th><th>{t("PESANAN")}</th><th>{t("NILAI SEPANJANG HAYAT")}</th><th>{t("PURATA")}</th><th>{t("SALURAN UTAMA")}</th><th>{t("PESANAN TERAKHIR")}</th><th /></tr></thead><tbody>{filtered.map((customer) => <Fragment key={customer.name}>
        <tr tabIndex={0} onClick={() => setExpanded(expanded === customer.name ? null : customer.name)} onKeyDown={(e) => { if (e.key === "Enter") setExpanded(expanded === customer.name ? null : customer.name); }}>
          <td><div className="customer"><span>{customer.initials}</span><strong>{customer.name}</strong></div></td>
          <td><strong>{customer.orderCount}</strong>{customer.refunds > 0 && <small>{customer.refunds} refund</small>}</td>
          <td><strong>{currency(customer.lifetimeValue)}</strong></td>
          <td><span className="muted-cell">{currency(customer.averageOrder)}</span></td>
          <td><span className={`channel-tag ${customer.topChannel.split(".")[0].toLowerCase().replace(" shop", "")}`}>{customer.topChannel}</span></td>
          <td><strong>{customer.lastOrderId}</strong><small>{customer.lastOrderTime}</small></td>
          <td><button className="row-menu" aria-label={`${t("Buka")} ${customer.name}`} aria-expanded={expanded === customer.name} onClick={(e) => { e.stopPropagation(); setExpanded(expanded === customer.name ? null : customer.name); }}><ChevronDown size={16} style={{ transform: expanded === customer.name ? "rotate(180deg)" : undefined, transition: "transform 150ms" }} /></button></td>
        </tr>
        {expanded === customer.name && <tr className="customer-orders-row"><td colSpan={7}><div className="customer-orders">{customer.orders.map((order) => <button className="customer-order" key={order.id} onClick={() => onOpenOrder(order)}>
          <span className="product-thumb" style={{ background: order.productTone }}>{order.productCode}</span>
          <span className="customer-order-main"><strong>{order.id}</strong><small>{order.item} · {order.time}</small></span>
          <StatusBadge status={order.status} />
          <b>{currency(order.amount)}</b>
        </button>)}</div></td></tr>}
      </Fragment>)}</tbody></table>{filtered.length === 0 && <div className="empty-state"><Search size={28} /><strong>{t("Tiada pelanggan")}</strong><span>{t("Ubah carian anda.")}</span></div>}</div>
    </section>
  </section>;
}

function SettingsView({ notify, sourceStatus, paymentSettings, onSavePaymentSettings }: { notify: (v: string) => void; sourceStatus: Record<DataSourceKey, SourceStatus> | null; paymentSettings: PaymentSettings; onSavePaymentSettings: (next: PaymentSettings) => void }) {
  const { t } = useLang();
  const [bankName, setBankName] = useState(paymentSettings.bankName);
  const [accountName, setAccountName] = useState(paymentSettings.accountName);
  const [accountNumber, setAccountNumber] = useState(paymentSettings.accountNumber);
  const [qrImageDataUrl, setQrImageDataUrl] = useState<string | null>(paymentSettings.qrImageDataUrl);

  useEffect(() => {
    setBankName(paymentSettings.bankName);
    setAccountName(paymentSettings.accountName);
    setAccountNumber(paymentSettings.accountNumber);
    setQrImageDataUrl(paymentSettings.qrImageDataUrl);
  }, [paymentSettings]);

  const onQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      notify(t("Fail terlalu besar (maksimum 2MB)"));
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setQrImageDataUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  return <section className="settings-grid"><article className="panel settings-panel"><h3>{t("Tetapan komisen")}</h3><p>{t("Kadar ini digunakan untuk penyata baharu.")}</p><label>{t("Kadar komisen KretivWork")}<div style={{ width: 170 }}><span style={{ paddingLeft: 12 }}>RM</span><input defaultValue={COMMISSION_PER_ITEM} style={{ width: 40, padding: "0 4px" }} /><span style={{ paddingRight: 12 }}>/ item</span></div></label><GatedButton permission="editSettings" className="primary-button" onClick={() => notify(t("Tetapan komisen disimpan"))}>{t("Simpan perubahan")}</GatedButton></article><article className="panel settings-panel"><h3>{t("Sambungan platform")}</h3><p>{t("Status sumber data pesanan.")}</p>{channels.map((channel) => {
    const status = sourceStatus?.[CHANNEL_TO_SOURCE_KEY[channel.name]] ?? null;
    const issue = status === "error";
    const label = status === null ? t("Memuatkan status…") : status === "real" ? t("Disambungkan") : status === "mock" ? t("Data ujian (mock)") : t("Ralat sambungan API");
    const state = status === null ? "…" : status === "real" ? t("Aktif") : status === "mock" ? "Mock" : t("Semak");
    return <button className={`integration-row ${issue ? "has-warning" : status === "mock" ? "is-mock" : ""}`} key={channel.name} onClick={() => issue && notify(t("Ralat sambungan API"))}><ChannelLogo name={channel.name} color={channel.color} /><span><strong>{channel.name}</strong><small>{label}</small></span><span className="integration-state"><i />{state}</span></button>;
  })}</article><article className="panel settings-panel"><h3>{t("Kaedah pembayaran")}</h3><p>{t("Kemas kini bank dan kod QR untuk pembayaran KretivCo.")}</p><label className="settings-field"><small>{t("Nama bank")}</small><input className="settings-input" value={bankName} onChange={(e) => setBankName(e.target.value)} /></label><label className="settings-field"><small>{t("Nama pemegang akaun")}</small><input className="settings-input" value={accountName} onChange={(e) => setAccountName(e.target.value)} /></label><label className="settings-field"><small>{t("Nombor akaun")}</small><input className="settings-input" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} /></label><label className="settings-field"><small>{t("Kod QR pembayaran")}</small><div className="qr-upload-row">{qrImageDataUrl ? <img className="qr-upload-preview" src={qrImageDataUrl} alt="" /> : null}<input type="file" accept="image/*" onChange={onQrFileChange} /></div></label><GatedButton permission="editSettings" className="primary-button" onClick={() => { onSavePaymentSettings({ bankName, accountName, accountNumber, qrImageDataUrl }); notify(t("Kaedah pembayaran disimpan")); }}>{t("Simpan perubahan")}</GatedButton></article></section>;
}

function ImportModal({ existingIds, onClose, onImport }: { existingIds: string[]; onClose: () => void; onImport: (orders: Order[]) => void }) {
  const { t } = useLang();
  const [file, setFile] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [reading, setReading] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected.name);
    setResult(null);
    setReading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setResult(importOrdersFromCsv(typeof reader.result === "string" ? reader.result : "", existingIds));
      setReading(false);
    };
    reader.onerror = () => { setReading(false); setResult(null); };
    reader.readAsText(selected);
  };

  const ready = result !== null && result.orders.length > 0;

  return <div className="modal-layer" role="dialog" aria-modal="true"><div className="modal">
    <button className="modal-close" onClick={onClose}><X size={20} /></button>
    <p className="eyebrow">IMPORT CSV</p>
    <h2>{t("Import data pesanan")}</h2>
    <p>{t("Muat naik CSV daripada Shopee atau TikTok Shop. Pesanan pendua akan disemak secara automatik.")}</p>
    <label className="drop-zone"><span className="file-type">CSV</span><strong>{file || t("Pilih fail")}</strong><span>{t("atau tarik dan lepaskan di sini")}</span><input type="file" accept=".csv,text/csv" onChange={onFileChange} /></label>

    {reading && <p className="import-note">{t("Membaca fail…")}</p>}

    {result && result.missingColumns.length > 0 && <div className="import-summary has-error">
      <strong>{t("Lajur wajib tidak dijumpai")}</strong>
      <span>{t("Fail perlu ada lajur")}: {result.missingColumns.join(", ")}</span>
    </div>}

    {result && result.missingColumns.length === 0 && <div className={`import-summary ${result.orders.length ? "" : "has-error"}`}>
      <span className="import-stat"><b>{result.orders.length}</b>{t("pesanan baharu")}</span>
      <span className="import-stat"><b>{result.duplicates.length}</b>{t("pendua dilangkau")}</span>
      <span className="import-stat"><b>{result.skipped.length}</b>{t("baris tidak sah")}</span>
      {result.skipped.length > 0 && <small>{result.skipped.slice(0, 3).map((s) => `${t("Baris")} ${s.line}: ${t(s.reason)}`).join(" · ")}{result.skipped.length > 3 ? " …" : ""}</small>}
    </div>}

    <div className="modal-actions">
      <button className="secondary-button" onClick={onClose}>{t("Batal")}</button>
      <button className="primary-button" disabled={!ready} onClick={() => result && onImport(result.orders)}>{t("Import")}{ready ? ` (${result.orders.length})` : ""}</button>
    </div>
  </div></div>;
}

function OrderDrawer({ order, shipment, onClose, onOpenShipment, onBookShipment, notify }: { order: Order; shipment: Shipment | null; onClose: () => void; onOpenShipment: (shipment: Shipment) => void; onBookShipment: () => void; notify: (message: string) => void }) {
  const { t } = useLang();
  return <div className="modal-layer drawer-layer" role="dialog" aria-modal="true" aria-label={`${t("Butiran pesanan")} ${order.id}`}>
    <aside className="drawer">
      <div className="drawer-header"><div><p className="eyebrow">{t("BUTIRAN PESANAN")}</p><h2>{order.id}</h2></div><button className="modal-close" onClick={onClose}><X size={20} /></button></div>
      <div className="drawer-status"><StatusBadge status={order.status} /><span>{order.time}</span></div>
      <section className="drawer-section"><h3>{t("Produk")}</h3><div className="drawer-product"><span className="product-thumb large" style={{ background: order.productTone }}>{order.productCode}</span><span><strong>{order.item}</strong><small>Chef Ammar™ Arabic Spices</small></span><b>{currency(order.amount)}</b></div></section>
      <section className="drawer-section"><h3>{t("Pelanggan")}</h3><div className="drawer-details"><span><small>{t("Nama")}</small><strong>{order.customer}</strong></span><span><small>{t("Bayaran")}</small><strong>{order.payment}</strong></span><span><small>{t("Saluran")}</small><strong>{order.channel}</strong></span><span><small>{t("Punca")}</small><strong>{order.channel === "TikTok Shop" ? "TikTok Content" : order.channel === "Shopee" ? "KOL / Affiliate" : "Threads"}</strong></span></div></section>
      <section className="drawer-section"><h3>{t("Status")}</h3><div className="order-timeline"><span className="complete"><i /><b>{t("Bayaran diterima")}</b><small>{t("Transaksi disahkan")}</small></span><span className={order.status === "Diproses" ? "current" : "complete"}><i>{order.status === "Diproses" ? "2" : ""}</i><b>{t("Pesanan diproses")}</b><small>{t("Diserahkan kepada pasukan fulfilment")}</small></span><span className={order.status === "Selesai" ? "complete" : ""}><i>{order.status === "Selesai" ? "" : "3"}</i><b>{t("Selesai")}</b><small>{t("Pesanan diterima pelanggan")}</small></span></div></section>
      <section className="drawer-section"><h3>{t("Penghantaran")}</h3>{shipment ? (
        <button className="linked-card" onClick={() => onOpenShipment(shipment)}>
          <span className="courier-thumb" style={{ background: COURIER_TONES[shipment.courier].color }}>{COURIER_TONES[shipment.courier].short}</span>
          <span className="linked-card-main">
            <strong className="tracking-no">{shipment.trackingNo}</strong>
            <small>{shipment.courier} · {shipment.destination}</small>
          </span>
          <span className="linked-card-end"><ShipmentStatusBadge status={shipment.status} /><ChevronRight size={16} /></span>
        </button>
      ) : (
        <div className="drawer-empty">
          <p>{t("Belum ada penghantaran untuk pesanan ini.")}</p>
          <GatedButton permission="bookShipment" className="secondary-button" onClick={onBookShipment}>{t("Tempah penghantaran")}</GatedButton>
        </div>
      )}</section>

      <div className="drawer-total"><span>{t("Jumlah dibayar")}</span><strong>{currency(order.amount)}</strong></div>
      <div className="drawer-actions"><button className="secondary-button" onClick={() => notify(`${t("Invois")} ${order.id} ${t("sedang disediakan")}`)}>{t("Invois")}</button><button className="primary-button" onClick={() => notify(t("Status pesanan telah dikemas kini"))}>{t("Kemas kini status")}</button></div>
    </aside>
  </div>;
}

function StatementDrawer({ weekIndex, approved, paid, onClose, onApprove }: { weekIndex: number; approved: boolean; paid: boolean; onClose: () => void; onApprove: () => void }) {
  const { t } = useLang();
  const { can } = useRole();
  const [mode, setMode] = useState<"summary" | "detailed">("summary");
  const [downloading, setDownloading] = useState(false);
  const week = weeklyStatements[weekIndex];
  const isCurrent = weekIndex === 0;
  const status = isCurrent ? (paid ? "Dibayar" : approved ? "Diluluskan" : "Perlu semakan") : "Dibayar";
  const canApprove = isCurrent && can("approveStatement") && !approved;
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
      {isCurrent && !can("approveStatement") && !approved && <small className="approval-hint">{t("Tukar kepada pandangan Chef Ammar untuk menguji fungsi kelulusan.")}</small>}
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
