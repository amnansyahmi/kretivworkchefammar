// Month-grid maths for the content calendar.
//
// Everything here works on plain YYYY-MM-DD strings and local dates. Using
// Date arithmetic across month boundaries is where calendars usually break,
// so this is kept pure and covered by tests rather than computed inline in
// the component.

export type CalendarDay = {
  /** YYYY-MM-DD */
  date: string;
  dayOfMonth: number;
  /** False for the leading/trailing days that pad the grid. */
  inMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
};

export const MONTH_NAMES_BM = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember",
];

/** Monday-first, matching the weekly chart elsewhere in the app. */
export const WEEKDAY_LABELS_BM = ["Isn", "Sel", "Rab", "Kha", "Jum", "Sab", "Ahd"];

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Monday = 0 … Sunday = 6, so the grid can start on Monday. */
function mondayFirstIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/**
 * Builds a 6-row × 7-column grid (always 42 cells, so the calendar doesn't
 * change height month to month) padded with the surrounding months' days.
 */
export function buildMonthGrid(year: number, month: number, today = new Date()): CalendarDay[] {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - mondayFirstIndex(first));
  const todayIso = toIsoDate(today);

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const weekday = date.getDay();
    return {
      date: toIsoDate(date),
      dayOfMonth: date.getDate(),
      inMonth: date.getMonth() === month && date.getFullYear() === year,
      isToday: toIsoDate(date) === todayIso,
      isWeekend: weekday === 0 || weekday === 6,
    };
  });
}

/** Steps a year/month pair by `delta` months, rolling the year over. */
export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const total = year * 12 + month + delta;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}

export function monthLabelBM(year: number, month: number): string {
  return `${MONTH_NAMES_BM[month]} ${year}`;
}

/** Groups any dated records by their YYYY-MM-DD, for O(1) lookup per cell. */
export function groupByDate<T>(items: T[], dateOf: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  items.forEach((item) => {
    const key = dateOf(item);
    const existing = map.get(key);
    if (existing) existing.push(item);
    else map.set(key, [item]);
  });
  return map;
}
