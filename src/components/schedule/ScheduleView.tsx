import type { Talk, SpeakerMap } from "../../types";
import { TimeSlotGroup } from "./TimeSlotGroup";

interface ScheduleViewProps {
  sessions: Talk[];
  speakers: SpeakerMap;
  isFavorite: (id: string) => boolean;
  onToggle: (id: string) => void;
  emptyMessage?: string;
}

export function ScheduleView({ sessions, speakers, isFavorite, onToggle, emptyMessage }: ScheduleViewProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <span className="text-4xl mb-3">📅</span>
        <p>{emptyMessage ?? "No sessions found."}</p>
      </div>
    );
  }

  // Group by time, preserving sort order
  const timeMap = new Map<string, Talk[]>();
  for (const session of sessions) {
    const existing = timeMap.get(session.time);
    if (existing) {
      existing.push(session);
    } else {
      timeMap.set(session.time, [session]);
    }
  }

  // Sort time slots lexicographically (HH:MM strings sort correctly)
  const times = [...timeMap.keys()].sort();

  return (
    <div className="flex flex-col gap-4 py-4">
      {times.map((time) => (
        <TimeSlotGroup
          key={time}
          time={time}
          sessions={timeMap.get(time)!}
          speakers={speakers}
          isFavorite={isFavorite}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
