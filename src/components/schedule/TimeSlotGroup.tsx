import type { Talk, SpeakerMap } from "../../types";
import type { Friend } from "../../hooks/useFriends";
import type { SlotStatus } from "./ScheduleView";
import { ROOM_ORDER } from "../../constants";
import { SessionCard } from "./SessionCard";

interface TimeSlotGroupProps {
  time: string;
  sessions: Talk[];
  speakers: SpeakerMap;
  isFavorite: (id: string) => boolean;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  friendsForSession: (id: string) => Friend[];
  status: SlotStatus;
}

function roomSortKey(room: string): number {
  const idx = ROOM_ORDER.indexOf(room);
  return idx === -1 ? ROOM_ORDER.length : idx;
}

const STATUS_BADGE: Partial<Record<SlotStatus, { label: string; className: string }>> = {
  live: { label: "Now",  className: "bg-emerald-500 text-white animate-pulse" },
  next: { label: "Next", className: "bg-amber-400 text-slate-900" },
};

export function TimeSlotGroup({
  time, sessions, speakers, isFavorite, onToggle, onSelect, friendsForSession, status,
}: TimeSlotGroupProps) {
  const sorted = [...sessions].sort((a, b) => roomSortKey(a.room) - roomSortKey(b.room));
  const isPast = status === "past";
  const badge = STATUS_BADGE[status];

  return (
    <div className={`flex gap-3 items-start ${isPast ? "opacity-50" : ""}`}>
      {/* Time column */}
      <div className="w-14 shrink-0 pt-3 text-right flex flex-col items-end gap-1">
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500 whitespace-nowrap">
          {time.split("-")[0]}
        </span>
        {badge && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${badge.className}`}>
            {badge.label}
          </span>
        )}
      </div>

      {/* Cards grid */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 min-w-0">
        {sorted.map((talk) => (
          <SessionCard
            key={talk.id}
            talk={talk}
            speakers={speakers}
            isFavorite={isFavorite(talk.id)}
            onToggle={onToggle}
            onSelect={onSelect}
            friendsAttending={friendsForSession(talk.id)}
            isPast={isPast}
          />
        ))}
      </div>
    </div>
  );
}
