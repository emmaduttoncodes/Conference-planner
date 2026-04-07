import type { Talk, SpeakerMap } from "../../types";
import { DAYS } from "../../constants";
import { parseTimeToMinutes } from "../../lib/time";
import { TimeSlotGroup } from "./TimeSlotGroup";

interface ScheduleViewProps {
  sessions: Talk[];
  speakers: SpeakerMap;
  isFavorite: (id: string) => boolean;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  emptyMessage?: string;
  filterBarShown?: boolean;
}

const DAY_ORDER = Object.fromEntries(DAYS.map((d, i) => [d, i]));

export function ScheduleView({
  sessions,
  speakers,
  isFavorite,
  onToggle,
  onSelect,
  emptyMessage,
  filterBarShown = true,
}: ScheduleViewProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
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

  // Sort days by conference order
  const days = [...dayMap.keys()].sort(
    (a, b) => (DAY_ORDER[a] ?? 99) - (DAY_ORDER[b] ?? 99)
  );
  const multiDay = days.length > 1;

  return (
    <div className="flex flex-col gap-4 py-4">
      {days.map((day) => {
        const timeMap = dayMap.get(day)!;
        // Sort times numerically, not lexicographically
        const times = [...timeMap.keys()].sort(
          (a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b)
        );

        return (
          <div key={day}>
            {multiDay && (
              <div
                className={`sticky ${filterBarShown ? "top-[113px]" : "top-14"} z-10 -mx-4 px-4 py-2 mb-2 bg-slate-900/95 backdrop-blur border-b border-slate-800`}
              >
                <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                  {day}
                </span>
              </div>
            )}
            <div className="flex flex-col gap-4">
              {times.map((time) => (
                <TimeSlotGroup
                  key={`${day}-${time}`}
                  time={time}
                  sessions={timeMap.get(time)!}
                  speakers={speakers}
                  isFavorite={isFavorite}
                  onToggle={onToggle}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
