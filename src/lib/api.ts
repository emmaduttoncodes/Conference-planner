import {
  SESSIONS_URL, SPEAKERS_URL,
  LOCAL_SESSIONS_URL, LOCAL_SPEAKERS_URL,
  SESSIONS_CACHE_KEY, SPEAKERS_CACHE_KEY, CACHE_TTL_MS,
} from "../constants";
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

async function fetchJson<T>(localUrl: string, remoteUrl: string): Promise<T> {
  // 1. Try the same-origin copy baked in at build time — no CORS, unaffected by
  //    VPNs or DNS filters that might block third-party proxy domains.
  try {
    const res = await fetchWithTimeout(localUrl);
    if (res.ok) return res.json() as Promise<T>;
  } catch {
    // local copy missing (first deploy before workflow runs) — fall through
  }

  // 2. Try direct (works if ai.engineer ever adds CORS headers)
  try {
    const res = await fetchWithTimeout(remoteUrl, { mode: "cors" });
    if (res.ok) return res.json() as Promise<T>;
  } catch {
    // CORS or network error — fall through to proxies
  }

  // 3. Try each CORS proxy in sequence
  let lastError: Error | undefined;
  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetchWithTimeout(`${proxy}${encodeURIComponent(remoteUrl)}`);
      if (res.ok) return res.json() as Promise<T>;
      lastError = new Error(`HTTP ${res.status} fetching ${remoteUrl}`);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error("Network error");
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${remoteUrl}`);
}

async function fetchWithCache<T>(localUrl: string, remoteUrl: string, cacheKey: string): Promise<T> {
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

  const data = await fetchJson<T>(localUrl, remoteUrl);
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ data, fetchedAt: Date.now() }));
  } catch {
    // localStorage might be full; ignore
  }
  return data;
}

export const fetchSessions = async (): Promise<RawTalk[]> => {
  const envelope = await fetchWithCache<SessionsResponse>(LOCAL_SESSIONS_URL, SESSIONS_URL, SESSIONS_CACHE_KEY);
  return envelope.sessions ?? [];
};

export const fetchSpeakers = async (): Promise<RawSpeaker[]> => {
  const envelope = await fetchWithCache<SpeakersResponse>(LOCAL_SPEAKERS_URL, SPEAKERS_URL, SPEAKERS_CACHE_KEY);
  return envelope.speakers ?? [];
};
