import type { Day } from "./types";

export const DAYS: Day[] = ["April 8", "April 9", "April 10"];

export const ROOM_ORDER: string[] = [
  "Keynote",
  "Abbey",
  "Fleming",
  "Moore",
  "Shelley",
  "St. James",
  "Westminster",
  "Wordsworth",
];

export const FAVORITES_KEY = "aie-schedule-favorites";
export const SESSIONS_CACHE_KEY = "aie-sessions-cache";
export const SPEAKERS_CACHE_KEY = "aie-speakers-cache";
export const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const SESSIONS_URL = "https://ai.engineer/europe/sessions.json";
export const SPEAKERS_URL = "https://ai.engineer/europe/speakers.json";

// Same-origin copies fetched at build time — no CORS, no proxy required
export const LOCAL_SESSIONS_URL = `${import.meta.env.BASE_URL}data/sessions.json`;
export const LOCAL_SPEAKERS_URL = `${import.meta.env.BASE_URL}data/speakers.json`;

export const TBD_REGEX = /^tbd\b/i;

// Human-readable labels for session types
export const TYPE_LABELS: Record<string, string> = {
  keynote: "Keynote",
  talk: "Talk",
  workshop: "Workshop",
  panel: "Panel",
  break: "Break",
  expo: "Expo",
};

// Badge colours — light bg + dark text for contrast on dark cards
export const TYPE_COLORS: Record<string, string> = {
  keynote: "bg-amber-100 text-amber-900",
  talk: "bg-blue-100 text-blue-900",
  workshop: "bg-purple-100 text-purple-900",
  panel: "bg-green-100 text-green-900",
  break: "bg-slate-200 text-slate-600",
  expo: "bg-orange-100 text-orange-900",
};
