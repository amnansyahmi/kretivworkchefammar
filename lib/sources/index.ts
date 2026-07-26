import { dataSourceConfig, type DataSourceKey } from "../config";
import { getOrders as getBclOrders } from "./bcl";
import { getOrders as getShopeeOrders } from "./shopee";
import { getOrders as getTiktokOrders } from "./tiktok";
import type { Order } from "./types";

export type SourceStatus = "mock" | "real" | "error";

const PLATFORMS: { key: DataSourceKey; fetch: () => Promise<Order[]> }[] = [
  { key: "bclmy", fetch: getBclOrders },
  { key: "shopee", fetch: getShopeeOrders },
  { key: "tiktok", fetch: getTiktokOrders },
];

export async function getAllOrders(): Promise<{ orders: Order[]; sources: Record<DataSourceKey, SourceStatus> }> {
  const results = await Promise.allSettled(PLATFORMS.map((platform) => platform.fetch()));
  const orders: Order[] = [];
  const sources = {} as Record<DataSourceKey, SourceStatus>;

  results.forEach((result, i) => {
    const { key } = PLATFORMS[i];
    if (result.status === "fulfilled") {
      orders.push(...result.value);
      sources[key] = dataSourceConfig[key];
    } else {
      console.error(`[data-source:${key}]`, result.reason);
      sources[key] = "error";
    }
  });

  return { orders, sources };
}
