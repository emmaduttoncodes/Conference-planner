import { SESSIONS_URL, SPEAKERS_URL, SESSIONS_CACHE_KEY, SPEAKERS_CACHE_KEY, CACHE_TTL_MS } from "../constants";
import type { RawTalk, RawSpeaker, SessionsResponse, SpeakersResponse } from "./normalize";

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

// ai.engineer blocks CORS for non-whitelisted origins; route through a proxy as fallback
const CORS_PROXY = "https://corsproxy.io/?";

async function fetchJson<T>(url: string): Promise<T> {
  // Try direct first (works if CORS headers are present)
  try {
    const res = await fetch(url, { mode: "cors" });
    if (res.ok) return res.json() as Promise<T>;
  } catch {
    // CORS or network error — fall through to proxy
  }

  // Fallback: CORS proxy
  const res = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.json() as Promise<T>;
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

  const data = await fetchJson<T>(url);
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ data, fetchedAt: Date.now() }));
  } catch {
    // localStorage might be full; ignore
  }
  return data;
}

export const fetchSessions = async (): Promise<RawTalk[]> => {
  const envelope = await fetchWithCache<SessionsResponse>(SESSIONS_URL, SESSIONS_CACHE_KEY);
  return envelope.sessions ?? [];
};

export const fetchSpeakers = async (): Promise<RawSpeaker[]> => {
  const envelope = await fetchWithCache<SpeakersResponse>(SPEAKERS_URL, SPEAKERS_CACHE_KEY);
  return envelope.speakers ?? [];
};
