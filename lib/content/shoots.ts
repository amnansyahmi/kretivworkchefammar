export const SHOOT_LOCATIONS = ["Studio KretivWork", "Dapur Chef Ammar", "Lokasi luar", "Rumah pelanggan"] as const;
export type ShootLocation = (typeof SHOOT_LOCATIONS)[number];

export const SHOOT_STATUSES = ["Dirancang", "Disahkan", "Selesai", "Dibatalkan"] as const;
export type ShootStatus = (typeof SHOOT_STATUSES)[number];

/**
 * A production session. Deliberately separate from ContentPiece: one shoot
 * day usually produces several pieces that go live on different dates, so a
 * shoot needs its own date, location and crew rather than being a field on
 * each piece.
 */
export type ContentShoot = {
  id: string;
  title: string;
  /** ISO date (YYYY-MM-DD) of the shoot itself, not the go-live date. */
  date: string;
  location: ShootLocation;
  status: ShootStatus;
  /** Who needs to be there. Free text — the team is small. */
  crew: string;
  /** Rough call time, e.g. "9:00 AM". Free text on purpose. */
  callTime: string;
  /** Drive folder for the raw footage from this session. */
  driveUrl: string | null;
  notes: string;
};

export function shootStatusTone(status: ShootStatus): "ok" | "pending" | "done" | "cancelled" {
  if (status === "Disahkan") return "ok";
  if (status === "Selesai") return "done";
  if (status === "Dibatalkan") return "cancelled";
  return "pending";
}
