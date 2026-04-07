import { useState, useEffect, useCallback } from "react";
import { fetchSessions, fetchSpeakers } from "../lib/api";
import { normalizeSessions, normalizeSpeakers } from "../lib/normalize";
import type { Talk, SpeakerMap } from "../types";

interface UseScheduleResult {
  sessions: Talk[];
  speakers: SpeakerMap;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useSchedule(): UseScheduleResult {
  const [sessions, setSessions] = useState<Talk[]>([]);
  const [speakers, setSpeakers] = useState<SpeakerMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => {
    setError(null);
    setLoading(true);
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    Promise.all([fetchSessions(), fetchSpeakers()])
      .then(([rawSessions, rawSpeakers]) => {
        if (cancelled) return;
        setSessions(normalizeSessions(rawSessions));
        setSpeakers(normalizeSpeakers(rawSpeakers));
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load schedule");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  return { sessions, speakers, loading, error, reload };
}
