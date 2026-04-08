/**
 * Parse a conference time string to minutes-since-midnight for sorting.
 * Handles formats like "9:00-9:50am", "10:00-10:50am", "1:45-2:03pm", "12:00-1:00pm"
 */
export function parseTimeToMinutes(timeStr: string): number {
  const startPart = timeStr.split("-")[0].trim();
  const colonIdx = startPart.indexOf(":");
  if (colonIdx === -1) return 0;

  const hours = parseInt(startPart.slice(0, colonIdx), 10);
  const mins = parseInt(startPart.slice(colonIdx + 1).replace(/\D/g, ""), 10);
  if (isNaN(hours) || isNaN(mins)) return 0;

  // Conference assumption: if hour is 1–6 without AM/PM context it must be PM.
  const adjustedHours = hours >= 1 && hours <= 6 ? hours + 12 : hours;
  return adjustedHours * 60 + mins;
}

/**
 * Parse a time range string into start and end minutes-since-midnight.
 * The AM/PM suffix appears on the END part and governs both halves.
 * e.g. "9:00-9:50am" → { startMinutes: 540, endMinutes: 590 }
 *      "1:00-1:45pm" → { startMinutes: 780, endMinutes: 825 }
 */
export function parseSessionRange(timeStr: string): { startMinutes: number; endMinutes: number } {
  const dashIdx = timeStr.indexOf("-");
  if (dashIdx === -1) {
    const m = parseTimeToMinutes(timeStr);
    return { startMinutes: m, endMinutes: m + 60 };
  }

  const startPart = timeStr.slice(0, dashIdx).trim();
  const endPart = timeStr.slice(dashIdx + 1).trim();

  // Extract am/pm from end part
  const ampmMatch = endPart.match(/(am|pm)$/i);
  const ampm = ampmMatch ? (ampmMatch[1].toLowerCase() as "am" | "pm") : undefined;

  const endNumeric = endPart.replace(/[ap]m$/i, "").trim();
  const endMinutes = parseTimePart(endNumeric, ampm);
  const startMinutes = parseTimePart(startPart, ampm);

  return { startMinutes, endMinutes };
}

function parseTimePart(part: string, ampm?: "am" | "pm"): number {
  const colonIdx = part.indexOf(":");
  if (colonIdx === -1) return 0;
  let h = parseInt(part.slice(0, colonIdx), 10);
  const m = parseInt(part.slice(colonIdx + 1).replace(/\D/g, ""), 10);
  if (isNaN(h) || isNaN(m)) return 0;

  if (ampm === "pm" && h !== 12) h += 12;
  else if (ampm === "am" && h === 12) h = 0;
  else if (!ampm && h >= 1 && h <= 6) h += 12; // heuristic fallback

  return h * 60 + m;
}

/** Map conference day strings to their calendar date (month is 0-indexed). */
const DAY_TO_CALENDAR: Record<string, [number, number, number]> = {
  "April 8":  [2026, 3, 8],
  "April 9":  [2026, 3, 9],
  "April 10": [2026, 3, 10],
};

/**
 * Convert a conference day + minutes-since-midnight to a real Date in local time.
 * Works correctly when the device is on London time (BST, UTC+1).
 */
export function sessionToDate(day: string, minutesSinceMidnight: number): Date {
  const cal = DAY_TO_CALENDAR[day];
  if (!cal) return new Date(0);
  const [year, month, date] = cal;
  return new Date(year, month, date, Math.floor(minutesSinceMidnight / 60), minutesSinceMidnight % 60, 0, 0);
}

/**
 * Returns the conference day string for today, or null if today isn't a conference day.
 */
export function getTodayConferenceDay(): string | null {
  const now = new Date();
  for (const [dayStr, [year, month, date]] of Object.entries(DAY_TO_CALENDAR)) {
    if (now.getFullYear() === year && now.getMonth() === month && now.getDate() === date) {
      return dayStr;
    }
  }
  return null;
}

/**
 * Returns the best day to show on load:
 * - The first conference day that still has at least one non-past session.
 * - This naturally skips today if all its sessions are already done, advancing
 *   to the next day.
 * - Returns null if the conference is fully over.
 */
export function getBestConferenceDay(
  sessions: Array<{ day: string; time: string }>,
  now: Date
): string | null {
  const ORDERED_DAYS = ["April 8", "April 9", "April 10"];
  for (const day of ORDERED_DAYS) {
    const daySessions = sessions.filter((s) => s.day === day);
    if (daySessions.length === 0) continue;
    const hasUpcoming = daySessions.some((s) => {
      const { endMinutes } = parseSessionRange(s.time);
      return now < sessionToDate(day, endMinutes);
    });
    if (hasUpcoming) return day;
  }
  return null;
}
