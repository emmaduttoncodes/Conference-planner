import type { Talk, Speaker, SpeakerMap } from "../types";
import { generateSessionId } from "./sessionId";

export interface RawTalk {
  title: string;
  description?: string;
  day: string;
  time: string;
  room: string;
  type: string;
  track?: string;
  speakers?: string[];
}

export interface RawSpeaker {
  id?: string;
  name: string;
  bio?: string;
  abstract?: string;
  description?: string;
  photoUrl?: string;
  photo?: string;
  avatar?: string;
  company?: string;
  organization?: string;
  role?: string;
  title?: string;
  jobTitle?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

// API returns envelope objects, not plain arrays
export interface SessionsResponse {
  sessions: RawTalk[];
  totalSessions?: number;
}

export interface SpeakersResponse {
  speakers: RawSpeaker[];
  totalSpeakers?: number;
}

/**
 * Maps raw API type strings (e.g. "expo_session", "track_keynote") to
 * the canonical lowercase types used throughout the app.
 */
const TYPE_MAP: Record<string, string> = {
  keynote: "keynote",
  track_keynote: "keynote",
  "track keynote": "keynote",
  talk: "talk",
  lightning: "talk",
  workshop: "workshop",
  panel: "panel",
  break: "break",
  networking: "break",
  expo: "expo",
  expo_session: "expo",
  "expo session": "expo",
};

function normalizeType(raw: string): string {
  const key = raw.toLowerCase().trim();
  return TYPE_MAP[key] ?? TYPE_MAP[key.replace(/_/g, " ")] ?? key;
}

export function normalizeSessions(raw: RawTalk[]): Talk[] {
  return raw
    .filter((r) => r.title?.trim()) // skip sessions with no title
    .map((r) => {
      const base = {
        title: r.title.trim(),
        description: r.description?.trim() || undefined,
        day: r.day as Talk["day"],
        time: r.time ?? "",
        room: r.room ?? "",
        type: normalizeType(r.type ?? "talk"),
        track: r.track?.trim() || undefined,
        speakers: r.speakers ?? [],
      };
      return { ...base, id: generateSessionId(base) };
    });
}

export function normalizeSpeakers(raw: RawSpeaker[]): SpeakerMap {
  const map: SpeakerMap = {};
  for (const s of raw) {
    const name = s.name?.trim() ?? "";
    if (!name) continue;

    const speaker: Speaker = {
      id: s.id ?? name,
      name,
      bio: s.bio?.trim() ?? s.abstract?.trim() ?? s.description?.trim(),
      photoUrl: s.photoUrl ?? s.photo ?? s.avatar,
      company: s.company?.trim() ?? s.organization?.trim(),
      role: s.role?.trim() ?? s.title?.trim() ?? s.jobTitle?.trim(),
      twitter: s.twitter,
      linkedin: s.linkedin,
      github: s.github,
      website: s.website,
    };

    // Index by id and by name (case-insensitive fallback handled at lookup)
    map[speaker.id] = speaker;
    if (name !== speaker.id) map[name] = speaker;
    // Also index by lowercase name for case-insensitive matching
    map[name.toLowerCase()] = speaker;
  }
  return map;
}

/**
 * Case-insensitive speaker lookup — sessions may reference speakers with
 * slightly different capitalisation than the speakers endpoint uses.
 */
export function lookupSpeaker(map: SpeakerMap, name: string): Speaker | undefined {
  return map[name] ?? map[name.toLowerCase()];
}
