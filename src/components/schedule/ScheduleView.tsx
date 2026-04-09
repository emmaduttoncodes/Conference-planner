import { useEffect, useRef } from "react";
import type { Talk, SpeakerMap } from "../../types";
import type { Friend } from "../../hooks/useFriends";
import { DAYS } from "../../constants";
import { parseTimeToMinutes, parseSessionRange, sessionToDate } from "../../lib/time";
import { TimeSlotGroup } from "./TimeSlotGroup";

export type SlotStatus = "past" | "live" | "next" | "future";

interface ScheduleViewProps {
  sessions: Talk[];
  speakers: SpeakerMap;
  isFavorite: (id: string) => boolean;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  emptyMessage?: string;
  filterBarShown?: boolean;
  friendsForSession: (id: string) => Friend[];
  now: Date;
}

const DAY_ORDER = Object.fromEntries(DAYS.map((d, i) => [d, i]));

/** Compute status for a slot using the earliest start and latest end across all its sessions. */
function getSlotStatus(day: string, slotSessions: Talk[], now: Date): SlotStatus {
  let earliestStart = Infinity;
  let latestEnd = 0;
  for (const s of slotSessions) {
    const { startMinutes, endMinutes } = parseSessionRange(s.time);
    if (startMinutes < earliestStart) earliestStart = startMinutes;
    if (endMinutes > latestEnd) latestEnd = endMinutes;
  }
  const start = sessionToDate(day, earliestStart);
  const end = sessionToDate(day, latestEnd);
  if (now >= end) return "past";
  if (now >= start) return "live";
  return "future"; // "next" assigned by caller
}

export function ScheduleView({
  sessions, speakers, isFavorite, onToggle, onSelect,
  emptyMessage, filterBarShown = true, friendsForSession, now,
}: ScheduleViewProps) {
  const scrollTargetRef = useRef<HTMLDivElement>(null);

  // Scroll to the first live/next slot on mount
  useEffect(() => {
    if (!scrollTargetRef.current) return;
    const id = setTimeout(() => {
      scrollTargetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
        <span className="text-4xl mb-3">📅</span>
        <p className="text-sm">{emptyMessage ?? "No sessions found."}</p>
      </div>
    );
  }

  // Group by day → START TIME ONLY (so "12:00-12:10pm" and "12:00-12:20pm" share one row)
  const dayMap = new Map<string, Map<string, Talk[]>>();
  for (const session of sessions) {
    if (!dayMap.has(session.day)) dayMap.set(session.day, new Map());
    const timeMap = dayMap.get(session.day)!;
    const startKey = session.time.split("-")[0].trim(); // e.g. "12:00"
    if (!timeMap.has(startKey)) timeMap.set(startKey, []);
    timeMap.get(startKey)!.push(session);
  }

  const days = [...dayMap.keys()].sort((a, b) => (DAY_ORDER[a] ?? 99) - (DAY_ORDER[b] ?? 99));
  const multiDay = days.length > 1;

  // Compute statuses, then mark the single "next" slot
  type SlotKey = string; // `${day}||${startTime}`
  const statusMap = new Map<SlotKey, SlotStatus>();
  let nextAssigned = false;

  for (const day of days) {
    const timeMap = dayMap.get(day)!;
    const times = [...timeMap.keys()].sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
    for (const startTime of times) {
      const raw = getSlotStatus(day, timeMap.get(startTime)!, now);
      const status: SlotStatus = (raw === "future" && !nextAssigned) ? (nextAssigned = true, "next") : raw;
      statusMap.set(`${day}||${startTime}`, status);
    }
  }

  // Find the first "live" or "next" slot for scroll target
  let scrollTarget: SlotKey | null = null;
  for (const [key, status] of statusMap) {
    if (status === "live" || status === "next") { scrollTarget = key; break; }
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      {days.map((day) => {
        const timeMap = dayMap.get(day)!;
        const times = [...timeMap.keys()].sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));

        return (
          <div key={day}>
            {multiDay && (
              <div className={`sticky ${filterBarShown ? "top-[113px]" : "top-14"} z-10 -mx-4 px-4 py-2 mb-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800`}>
                <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  {day}
                </span>
              </div>
            )}
            <div className="flex flex-col gap-4">
              {times.map((startTime) => {
                const key = `${day}||${startTime}`;
                const status = statusMap.get(key) ?? "future";
                const isScrollTarget = key === scrollTarget;
                return (
                  <div
                    key={key}
                    ref={isScrollTarget ? scrollTargetRef : undefined}
                    className={isScrollTarget ? "scroll-mt-[120px]" : undefined}
                  >
                    <TimeSlotGroup
                      time={startTime}
                      sessions={timeMap.get(startTime)!}
                      speakers={speakers}
                      isFavorite={isFavorite}
                      onToggle={onToggle}
                      onSelect={onSelect}
                      friendsForSession={friendsForSession}
                      status={status}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
