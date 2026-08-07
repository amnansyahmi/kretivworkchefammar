// Time helpers for the call-time picker.
//
// Times are stored as 12-hour labels ("9:00 AM") because that is the format
// already in the content_shoots table and the one the team writes by hand.
// Parsing is deliberately lenient so previously typed values ("09:00",
// "9.30pm", "9 AM") survive being opened in the picker.

export type TimeParts = { hour: number; minute: number };

/** Parses a stored or hand-typed time. Returns null when unreadable. */
export function parseTimeLabel(raw: string): TimeParts | null {
  const text = raw.trim().toLowerCase();
  if (!text) return null;

  const match = text.match(/^(\d{1,2})\s*[:.]?\s*(\d{2})?\s*(am|pm)?$/);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = match[2] === undefined ? 0 : Number(match[2]);
  const meridiem = match[3];

  if (!Number.isInteger(hour) || !Number.isInteger(minute) || minute > 59) return null;

  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    if (meridiem === "pm" && hour !== 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;
  } else if (hour > 23) {
    return null;
  }

  return { hour, minute };
}

/** Formats 24-hour parts as the stored 12-hour label, e.g. "9:00 AM". */
export function formatTime12(hour: number, minute: number): string {
  const suffix = hour < 12 ? "AM" : "PM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

/** Minutes since midnight, for comparing and sorting times. */
export function minutesOf({ hour, minute }: TimeParts): number {
  return hour * 60 + minute;
}

/**
 * Picker options between two hours at a fixed step. Defaults cover a
 * realistic shoot day (5am–11:45pm) in 15-minute slots.
 */
export function timeOptions(startHour = 5, endHour = 23, stepMinutes = 15): string[] {
  const options: string[] = [];
  for (let minutes = startHour * 60; minutes <= endHour * 60 + (60 - stepMinutes); minutes += stepMinutes) {
    options.push(formatTime12(Math.floor(minutes / 60), minutes % 60));
  }
  return options;
}

/**
 * The option list with `current` folded in — so a time that isn't on the
 * step grid (say "9:07 AM", typed before the picker existed) still shows and
 * stays selectable rather than silently disappearing.
 */
export function timeOptionsIncluding(current: string, startHour?: number, endHour?: number, stepMinutes?: number): string[] {
  const options = timeOptions(startHour, endHour, stepMinutes);
  const parsed = parseTimeLabel(current);
  if (!parsed) return options;

  const normalised = formatTime12(parsed.hour, parsed.minute);
  if (options.includes(normalised)) return options;

  return [...options, normalised].sort((a, b) => {
    const pa = parseTimeLabel(a);
    const pb = parseTimeLabel(b);
    return (pa ? minutesOf(pa) : 0) - (pb ? minutesOf(pb) : 0);
  });
}
