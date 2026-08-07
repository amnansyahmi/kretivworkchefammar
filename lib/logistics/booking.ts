import { courierConfig } from "../config";
import type { CourierName, Shipment } from "./types";

export type BookingRequest = {
  orderId: string;
  recipient: string;
  initials: string;
  destination: string;
  postcode: string;
  weightKg: number;
  courier: CourierName;
};

// Indicative domestic rates, used to quote a booking while running on mock
// data. Real rates come from EasyParcel's EPRateCheckingBulk once wired.
const MOCK_RATES: Record<CourierName, { base: number; perKg: number; service: string }> = {
  "J&T Express": { base: 5.3, perKg: 1.0, service: "Standard Domestik" },
  "Pos Laju": { base: 7.0, perKg: 2.2, service: "Pos Laju Next Day" },
  "Ninja Van": { base: 5.9, perKg: 2.0, service: "Standard Domestik" },
  "DHL eCommerce": { base: 6.0, perKg: 1.4, service: "DHL Domestik" },
};

const TRACKING_PREFIX: Record<CourierName, string> = {
  "J&T Express": "6308",
  "Pos Laju": "EP",
  "Ninja Van": "NVMY",
  "DHL eCommerce": "MYJ",
};

export function quoteFor(courier: CourierName, weightKg: number): number {
  const rate = MOCK_RATES[courier];
  // Couriers bill by started kilogram, not fractional weight.
  return Number((rate.base + rate.perKg * Math.max(0, Math.ceil(weightKg) - 1)).toFixed(2));
}

function mockTrackingNo(courier: CourierName): string {
  const digits = Math.floor(100000000 + Math.random() * 899999999);
  const prefix = TRACKING_PREFIX[courier];
  return courier === "Pos Laju" ? `${prefix}${digits}MY` : `${prefix}${digits}`;
}

function formatBookedAt(date: Date): string {
  const months = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogos", "Sep", "Okt", "Nov", "Dis"];
  const hour12 = date.getHours() % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const suffix = date.getHours() < 12 ? "AM" : "PM";
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${hour12}:${minutes} ${suffix}`;
}

function addDays(date: Date, days: number): string {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  const months = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogos", "Sep", "Okt", "Nov", "Dis"];
  return `${next.getDate()} ${months[next.getMonth()]} ${next.getFullYear()}`;
}

function bookMock(request: BookingRequest): Shipment {
  const now = new Date();
  return {
    trackingNo: mockTrackingNo(request.courier),
    orderId: request.orderId,
    courier: request.courier,
    provider: "easyparcel",
    service: MOCK_RATES[request.courier].service,
    recipient: request.recipient,
    initials: request.initials,
    destination: request.destination,
    postcode: request.postcode,
    weightKg: request.weightKg,
    cost: quoteFor(request.courier, request.weightKg),
    status: "Menunggu pickup",
    bookedAt: formatBookedAt(now),
    estimatedDelivery: addDays(now, 3),
    checkpoints: [
      { time: formatBookedAt(now), status: "Pesanan dibuat", location: "KretivCo Fulfilment, Bangi" },
    ],
  };
}

// Real booking goes through EasyParcel's EPSubmitOrderBulk (create the
// consignment) followed by EPPayOrderBulk (pay from account credit, which is
// what actually issues the AWB). Both need EASYPARCEL_API_KEY.
async function bookReal(_request: BookingRequest): Promise<Shipment> {
  if (!process.env.EASYPARCEL_API_KEY) {
    throw new Error(
      "DATA_SOURCE_EASYPARCEL=real but EASYPARCEL_API_KEY is not set. Add the key from your EasyParcel account (Integrations > API key), or set DATA_SOURCE_EASYPARCEL=mock."
    );
  }
  throw new Error(
    "EasyParcel booking is not implemented yet. Implement bookReal() in lib/logistics/booking.ts against EPSubmitOrderBulk + EPPayOrderBulk, then return the issued AWB as a Shipment. Set DATA_SOURCE_EASYPARCEL=mock until then."
  );
}

export async function bookShipment(request: BookingRequest): Promise<Shipment> {
  return courierConfig.easyparcel === "real" ? bookReal(request) : bookMock(request);
}
