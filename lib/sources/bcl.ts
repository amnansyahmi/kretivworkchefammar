import { dataSourceConfig } from "../config";
import { mockOrders } from "./mock-orders";
import type { Order } from "./types";

async function fetchMock(): Promise<Order[]> {
  return mockOrders.filter((order) => order.channel === "BCL.my");
}

async function fetchReal(): Promise<Order[]> {
  throw new Error(
    "BCL.my real-data integration is not implemented yet. Set DATA_SOURCE_BCLMY=mock, or implement fetchReal() in lib/sources/bcl.ts once API credentials are available."
  );
}

export async function getOrders(): Promise<Order[]> {
  return dataSourceConfig.bclmy === "real" ? fetchReal() : fetchMock();
}
