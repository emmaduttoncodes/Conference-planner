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
  photoUrl?: string;
  photo?: string;
  company?: string;
  role?: string;
  title?: string;
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

export function normalizeSessions(raw: RawTalk[]): Talk[] {
  return raw.map((r) => {
    const base = {
      title: r.title ?? "",
      description: r.description,
      day: r.day as Talk["day"],
      time: r.time ?? "",
      room: r.room ?? "",
      type: (r.type ?? "talk") as Talk["type"],
      track: r.track,
      speakers: r.speakers ?? [],
    };
    return { ...base, id: generateSessionId(base) };
  });
}

export function normalizeSpeakers(raw: RawSpeaker[]): SpeakerMap {
  const map: SpeakerMap = {};
  for (const s of raw) {
    const speaker: Speaker = {
      id: s.id ?? s.name,
      name: s.name ?? "",
      bio: s.bio,
      photoUrl: s.photoUrl ?? s.photo,
      company: s.company,
      role: s.role ?? s.title,
      twitter: s.twitter,
      linkedin: s.linkedin,
      github: s.github,
      website: s.website,
    };
    // Index by both id and name for flexible lookup
    map[speaker.id] = speaker;
    if (speaker.name && speaker.name !== speaker.id) {
      map[speaker.name] = speaker;
    }
  }
  return map;
}
