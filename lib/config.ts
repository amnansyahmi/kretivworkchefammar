export type DataSourceMode = "mock" | "real";
export type DataSourceKey = "bclmy" | "shopee" | "tiktok";
export type CourierKey = "easyparcel" | "jnt";

function modeFromEnv(name: string): DataSourceMode {
  return process.env[name] === "real" ? "real" : "mock";
}

// Flip these to "real" once API credentials for that platform are wired up
// in lib/sources/<platform>.ts. Defaults to mock data everywhere.
export const dataSourceConfig: Record<DataSourceKey, DataSourceMode> = {
  bclmy: modeFromEnv("DATA_SOURCE_BCLMY"),
  shopee: modeFromEnv("DATA_SOURCE_SHOPEE"),
  tiktok: modeFromEnv("DATA_SOURCE_TIKTOK"),
};

// Shipping providers, same mock/real pattern as the order sources above.
// EasyParcel is an aggregator (it books and tracks J&T, Pos Laju, Ninja Van,
// DHL and others under one API key), so it's the practical default. The
// direct J&T integration is separate because it needs a merchant contract.
export const courierConfig: Record<CourierKey, DataSourceMode> = {
  easyparcel: modeFromEnv("DATA_SOURCE_EASYPARCEL"),
  jnt: modeFromEnv("DATA_SOURCE_JNT"),
};
