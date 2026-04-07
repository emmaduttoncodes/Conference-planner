/**
 * Parse a conference time string to minutes-since-midnight for sorting.
 * Handles formats like "9:00-9:50am", "10:00-10:50am", "1:45-2:03pm", "12:00-1:00pm"
 */
export function parseTimeToMinutes(timeStr: string): number {
  // Take only the start time (before the dash)
  const startPart = timeStr.split("-")[0].trim();
  const colonIdx = startPart.indexOf(":");
  if (colonIdx === -1) return 0;

  const hours = parseInt(startPart.slice(0, colonIdx), 10);
  const mins = parseInt(startPart.slice(colonIdx + 1).replace(/\D/g, ""), 10);

  if (isNaN(hours) || isNaN(mins)) return 0;

  // Conference assumption: if hour is 1–6 without AM/PM context it must be PM.
  // (Conferences run ~8am–7pm; no session starts at 1–6 AM.)
  const adjustedHours = hours >= 1 && hours <= 6 ? hours + 12 : hours;

  return adjustedHours * 60 + mins;
}
