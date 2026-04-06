import type { Talk } from "../types";

export function generateSessionId(talk: Omit<Talk, "id">): string {
  return `${talk.day}|${talk.time}|${talk.room}|${talk.title}`
    .toLowerCase()
    .replace(/\s+/g, "-");
}
