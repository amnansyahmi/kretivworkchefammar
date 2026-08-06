import type { CourierKey } from "../config";

// Ordered from earliest to latest — the shipment timeline renders in this
// order and marks every stage up to the current one as complete.
export const SHIPMENT_STAGES = ["Menunggu pickup", "Dalam transit", "Sedang dihantar", "Dihantar"] as const;

export type ShipmentStatus = (typeof SHIPMENT_STAGES)[number] | "Gagal dihantar";

export type CourierName = "J&T Express" | "Pos Laju" | "Ninja Van" | "DHL eCommerce";

export type Checkpoint = {
  time: string;
  status: string;
  location: string;
  // Marks a checkpoint that represents a problem (failed attempt, return to
  // sender) so the timeline can style it as a fault rather than progress.
  // Set explicitly by the adapter — never inferred from the status text.
  failed?: boolean;
};

export type Shipment = {
  trackingNo: string;
  orderId: string;
  courier: CourierName;
  // Which integration supplied this record — EasyParcel aggregates several
  // couriers, so the courier name alone doesn't identify the source.
  provider: CourierKey;
  service: string;
  recipient: string;
  initials: string;
  destination: string;
  postcode: string;
  weightKg: number;
  cost: number;
  status: ShipmentStatus;
  bookedAt: string;
  estimatedDelivery: string;
  checkpoints: Checkpoint[];
};
