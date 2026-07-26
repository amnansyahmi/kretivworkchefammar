import { dataSourceConfig } from "../config";
import { mockOrders } from "./mock-orders";
import type { Order } from "./types";

async function fetchMock(): Promise<Order[]> {
  return mockOrders.filter((order) => order.channel === "TikTok Shop");
}

async function fetchReal(): Promise<Order[]> {
  // TikTok Shop Partner Center: register a self-built app for this shop,
  // authorize it, then call the Order API (search orders / order detail)
  // with the app key + app secret signed request.
  throw new Error(
    "TikTok Shop real-data integration is not implemented yet. Set DATA_SOURCE_TIKTOK=mock, or implement fetchReal() in lib/sources/tiktok.ts once API credentials are available."
  );
}

export async function getOrders(): Promise<Order[]> {
  return dataSourceConfig.tiktok === "real" ? fetchReal() : fetchMock();
}
