import { useState, useEffect } from "react";
import { fetchSessions, fetchSpeakers } from "../lib/api";
import { normalizeSessions, normalizeSpeakers } from "../lib/normalize";
import type { Talk, SpeakerMap } from "../types";

interface UseScheduleResult {
  sessions: Talk[];
  speakers: SpeakerMap;
  loading: boolean;
  error: string | null;
}

export function useSchedule(): UseScheduleResult {
  const [sessions, setSessions] = useState<Talk[]>([]);
  const [speakers, setSpeakers] = useState<SpeakerMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchSessions(), fetchSpeakers()])
      .then(([rawSessions, rawSpeakers]) => {
        setSessions(normalizeSessions(rawSessions));
        setSpeakers(normalizeSpeakers(rawSpeakers));
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load schedule");
      })
      .finally(() => setLoading(false));
  }, []);

  return { sessions, speakers, loading, error };
}
