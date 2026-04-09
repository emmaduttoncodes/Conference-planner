import { SESSIONS_URL, SPEAKERS_URL, SESSIONS_CACHE_KEY, SPEAKERS_CACHE_KEY, CACHE_TTL_MS } from "../constants";
import type { RawTalk, RawSpeaker, SessionsResponse, SpeakersResponse } from "./normalize";

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

// ai.engineer blocks CORS for non-whitelisted origins; route through proxies as fallback
const CORS_PROXIES = [
  "https://corsproxy.io/?",
  "https://api.allorigins.win/raw?url=",
];

const FETCH_TIMEOUT_MS = 10_000;

function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timeoutId)
  );
}

async function fetchJson<T>(url: string): Promise<T> {
  // Try direct first (works if CORS headers are present)
  try {
    const res = await fetchWithTimeout(url, { mode: "cors" });
    if (res.ok) return res.json() as Promise<T>;
  } catch {
    // CORS or network error — fall through to proxies
  }

  // Try each CORS proxy in sequence
  let lastError: Error | undefined;
  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetchWithTimeout(`${proxy}${encodeURIComponent(url)}`);
      if (res.ok) return res.json() as Promise<T>;
      lastError = new Error(`HTTP ${res.status} fetching ${url}`);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error("Network error");
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${url}`);
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
