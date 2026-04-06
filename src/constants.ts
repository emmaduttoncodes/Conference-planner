import type { Day, SessionType } from "./types";

export const DAYS: Day[] = ["April 8", "April 9", "April 10"];

export const ROOM_ORDER: string[] = [
  "Keynote",
  "Abbey",
  "Fleming",
  "Moore",
  "St. James",
  "Westminster",
];

export const SESSION_TYPES: SessionType[] = [
  "keynote",
  "talk",
  "workshop",
  "panel",
  "break",
  "expo",
];

export const FAVORITES_KEY = "aie-schedule-favorites";
export const SESSIONS_CACHE_KEY = "aie-sessions-cache";
export const SPEAKERS_CACHE_KEY = "aie-speakers-cache";
export const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const SESSIONS_URL = "https://ai.engineer/europe/sessions.json";
export const SPEAKERS_URL = "https://ai.engineer/europe/speakers.json";

export const TBD_REGEX = /^tbd\b/i;

export const TYPE_COLORS: Record<string, string> = {
  keynote: "bg-amber-100 text-amber-800",
  talk: "bg-blue-100 text-blue-800",
  workshop: "bg-purple-100 text-purple-800",
  panel: "bg-green-100 text-green-800",
  break: "bg-gray-100 text-gray-600",
  expo: "bg-orange-100 text-orange-800",
};
