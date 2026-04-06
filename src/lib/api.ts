import { SESSIONS_URL, SPEAKERS_URL, SESSIONS_CACHE_KEY, SPEAKERS_CACHE_KEY, CACHE_TTL_MS } from "../constants";
import type { RawTalk, RawSpeaker } from "./normalize";

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

async function fetchWithCache<T>(url: string, cacheKey: string): Promise<T> {
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const entry = JSON.parse(cached) as CacheEntry<T>;
      if (Date.now() - entry.fetchedAt < CACHE_TTL_MS) {
        return entry.data;
      }
    } catch {
      // invalid cache, fall through to fetch
    }
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const data = (await res.json()) as T;
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ data, fetchedAt: Date.now() }));
  } catch {
    // localStorage might be full; ignore
  }
  return data;
}

export const fetchSessions = (): Promise<RawTalk[]> =>
  fetchWithCache<RawTalk[]>(SESSIONS_URL, SESSIONS_CACHE_KEY);

export const fetchSpeakers = (): Promise<RawSpeaker[]> =>
  fetchWithCache<RawSpeaker[]>(SPEAKERS_URL, SPEAKERS_CACHE_KEY);
