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

function getSlotStatus(day: string, time: string, now: Date): SlotStatus {
  const { startMinutes, endMinutes } = parseSessionRange(time);
  const start = sessionToDate(day, startMinutes);
  const end = sessionToDate(day, endMinutes);
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
    // Small delay so the layout has settled
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

  // Group by day → time
  const dayMap = new Map<string, Map<string, Talk[]>>();
  for (const session of sessions) {
    if (!dayMap.has(session.day)) dayMap.set(session.day, new Map());
    const timeMap = dayMap.get(session.day)!;
    if (!timeMap.has(session.time)) timeMap.set(session.time, []);
    timeMap.get(session.time)!.push(session);
  }

  const days = [...dayMap.keys()].sort((a, b) => (DAY_ORDER[a] ?? 99) - (DAY_ORDER[b] ?? 99));
  const multiDay = days.length > 1;

  // Compute statuses for every (day, time) pair, then mark the single "next" slot
  type SlotKey = string; // `${day}||${time}`
  const statusMap = new Map<SlotKey, SlotStatus>();
  let nextAssigned = false;

  for (const day of days) {
    const timeMap = dayMap.get(day)!;
    const times = [...timeMap.keys()].sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
    for (const time of times) {
      const raw = getSlotStatus(day, time, now);
      const status: SlotStatus = (raw === "future" && !nextAssigned) ? (nextAssigned = true, "next") : raw;
      statusMap.set(`${day}||${time}`, status);
    }
  }

  // Find the first "live" or "next" slot key for scrolling
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
              {times.map((time) => {
                const key = `${day}||${time}`;
                const status = statusMap.get(key) ?? "future";
                const isScrollTarget = key === scrollTarget;
                return (
                  <div
                    key={key}
                    ref={isScrollTarget ? scrollTargetRef : undefined}
                    className={isScrollTarget ? "scroll-mt-[120px]" : undefined}
                  >
                    <TimeSlotGroup
                      time={time}
                      sessions={timeMap.get(time)!}
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
