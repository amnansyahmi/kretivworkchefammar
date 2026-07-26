export type DataSourceMode = "mock" | "real";
export type DataSourceKey = "bclmy" | "shopee" | "tiktok";

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
