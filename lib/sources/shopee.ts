import { dataSourceConfig } from "../config";
import { mockOrders } from "./mock-orders";
import type { Order } from "./types";

async function fetchMock(): Promise<Order[]> {
  return mockOrders.filter((order) => order.channel === "Shopee");
}

async function fetchReal(): Promise<Order[]> {
  // Shopee Open Platform: authorize the app to the shop, then call
  // order.get_order_list / order.get_order_detail with HMAC-signed
  // requests using the partner_id + partner_key + shop access token.
  throw new Error(
    "Shopee real-data integration is not implemented yet. Set DATA_SOURCE_SHOPEE=mock, or implement fetchReal() in lib/sources/shopee.ts once API credentials are available."
  );
}

export async function getOrders(): Promise<Order[]> {
  return dataSourceConfig.shopee === "real" ? fetchReal() : fetchMock();
}
