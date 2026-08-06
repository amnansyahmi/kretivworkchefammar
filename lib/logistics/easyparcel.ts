import { courierConfig } from "../config";
import { mockShipments } from "./mock-shipments";
import type { Shipment } from "./types";

async function fetchMock(): Promise<Shipment[]> {
  return mockShipments.filter((shipment) => shipment.provider === "easyparcel");
}

// EasyParcel is a Malaysian shipping aggregator: one API key books and tracks
// J&T Express, Pos Laju, Ninja Van, DHL eCommerce and others. Unlike J&T's own
// API it is self-serve — you get a key from your EasyParcel account under
// Integrations, no merchant contract needed. That makes it the recommended way
// to reach J&T from this dashboard.
//
// API surface (POST, form-encoded, key passed as the `api` field):
//   https://connect.easyparcel.my/?ac=EPOrderStatusBulk   — order + AWB status
//   https://connect.easyparcel.my/?ac=EPTrackingBulk      — tracking checkpoints
//   https://connect.easyparcel.my/?ac=EPSubmitOrderBulk   — book a shipment
//   https://connect.easyparcel.my/?ac=EPRateCheckingBulk  — quote rates
// Sandbox uses the same paths on http://demo.connect.easyparcel.my.
async function fetchReal(): Promise<Shipment[]> {
  if (!process.env.EASYPARCEL_API_KEY) {
    throw new Error(
      "DATA_SOURCE_EASYPARCEL=real but EASYPARCEL_API_KEY is not set. Add the key from your EasyParcel account (Integrations > API key), or set DATA_SOURCE_EASYPARCEL=mock."
    );
  }
  throw new Error(
    "EasyParcel real-data integration is not implemented yet. Implement fetchReal() in lib/logistics/easyparcel.ts against EPOrderStatusBulk + EPTrackingBulk, then map each AWB to a Shipment. Set DATA_SOURCE_EASYPARCEL=mock until then."
  );
}

export async function getShipments(): Promise<Shipment[]> {
  return courierConfig.easyparcel === "real" ? fetchReal() : fetchMock();
}
