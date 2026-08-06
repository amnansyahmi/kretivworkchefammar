import { courierConfig, type CourierKey } from "../config";
import { getShipments as getEasyparcelShipments } from "./easyparcel";
import { getShipments as getJntShipments } from "./jnt";
import type { Shipment } from "./types";

export type CourierSourceStatus = "mock" | "real" | "error";

const PROVIDERS: { key: CourierKey; fetch: () => Promise<Shipment[]> }[] = [
  { key: "easyparcel", fetch: getEasyparcelShipments },
  { key: "jnt", fetch: getJntShipments },
];

export async function getAllShipments(): Promise<{ shipments: Shipment[]; couriers: Record<CourierKey, CourierSourceStatus> }> {
  const results = await Promise.allSettled(PROVIDERS.map((provider) => provider.fetch()));
  const shipments: Shipment[] = [];
  const couriers = {} as Record<CourierKey, CourierSourceStatus>;

  results.forEach((result, i) => {
    const { key } = PROVIDERS[i];
    if (result.status === "fulfilled") {
      shipments.push(...result.value);
      couriers[key] = courierConfig[key];
    } else {
      console.error(`[courier:${key}]`, result.reason);
      couriers[key] = "error";
    }
  });

  return { shipments, couriers };
}
