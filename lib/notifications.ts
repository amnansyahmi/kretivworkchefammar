import type { CourierKey, DataSourceKey } from "./config";
import type { CourierSourceStatus } from "./logistics";
import type { Shipment } from "./logistics/types";
import type { SourceStatus } from "./sources";
import { stockLevelOf, type Product } from "./inventory/types";

export type NotificationTone = "danger" | "warning" | "info";

export type AppNotification = {
  id: string;
  tone: NotificationTone;
  /** Untranslated Malay title; the UI runs it through t(). */
  title: string;
  detail: string;
  /** Where clicking the notification should take the user. */
  target: { view: string; tab?: string };
};

export type NotificationInput = {
  shipments: Shipment[];
  products: Product[];
  sourceStatus: Record<DataSourceKey, SourceStatus> | null;
  courierStatus: Record<CourierKey, CourierSourceStatus> | null;
  statementApproved: boolean;
  canApproveStatement: boolean;
};

const SOURCE_LABELS: Record<DataSourceKey, string> = { bclmy: "BCL.my", shopee: "Shopee", tiktok: "TikTok Shop" };
const COURIER_LABELS: Record<CourierKey, string> = { easyparcel: "EasyParcel", jnt: "J&T Express" };

/**
 * Derives the notification list from current app state. Pure and
 * order-stable: most urgent first, so the bell badge reflects real work.
 */
export function deriveNotifications(input: NotificationInput): AppNotification[] {
  const notifications: AppNotification[] = [];

  const failed = input.shipments.filter((s) => s.status === "Gagal dihantar");
  if (failed.length) {
    notifications.push({
      id: "shipments-failed",
      tone: "danger",
      title: "Penghantaran gagal",
      detail: `${failed.length} bungkusan gagal dihantar — ${failed.map((s) => s.orderId).join(", ")}`,
      target: { view: "logistics", tab: "shipments" },
    });
  }

  const outOfStock = input.products.filter((p) => stockLevelOf(p) === "out");
  if (outOfStock.length) {
    notifications.push({
      id: "stock-out",
      tone: "danger",
      title: "Stok habis",
      detail: `${outOfStock.map((p) => p.name).join(", ")} — tiada baki`,
      target: { view: "sales", tab: "products" },
    });
  }

  const lowStock = input.products.filter((p) => stockLevelOf(p) === "low");
  if (lowStock.length) {
    notifications.push({
      id: "stock-low",
      tone: "warning",
      title: "Stok rendah",
      detail: `${lowStock.map((p) => p.name).join(", ")} — bawah paras pesanan semula`,
      target: { view: "sales", tab: "products" },
    });
  }

  // Only surface the approval prompt to the role that can actually act on it.
  if (!input.statementApproved && input.canApproveStatement) {
    notifications.push({
      id: "statement-pending",
      tone: "warning",
      title: "Penyata menunggu kelulusan",
      detail: "Penyata komisen minggu ini belum diluluskan.",
      target: { view: "finance", tab: "statements" },
    });
  }

  const brokenSources = (Object.keys(input.sourceStatus ?? {}) as DataSourceKey[]).filter((key) => input.sourceStatus?.[key] === "error");
  if (brokenSources.length) {
    notifications.push({
      id: "sources-error",
      tone: "danger",
      title: "Ralat sambungan API",
      detail: `${brokenSources.map((key) => SOURCE_LABELS[key]).join(", ")} tidak dapat dihubungi.`,
      target: { view: "settings", tab: "system" },
    });
  }

  const brokenCouriers = (Object.keys(input.courierStatus ?? {}) as CourierKey[]).filter((key) => input.courierStatus?.[key] === "error");
  if (brokenCouriers.length) {
    notifications.push({
      id: "couriers-error",
      tone: "danger",
      title: "Ralat sambungan kurier",
      detail: `${brokenCouriers.map((key) => COURIER_LABELS[key]).join(", ")} tidak dapat dihubungi.`,
      target: { view: "logistics", tab: "couriers" },
    });
  }

  const awaitingPickup = input.shipments.filter((s) => s.status === "Menunggu pickup");
  if (awaitingPickup.length) {
    notifications.push({
      id: "shipments-pickup",
      tone: "info",
      title: "Menunggu pickup kurier",
      detail: `${awaitingPickup.length} bungkusan belum diambil kurier.`,
      target: { view: "logistics", tab: "shipments" },
    });
  }

  return notifications;
}
