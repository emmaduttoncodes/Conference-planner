import type { Talk, SpeakerMap } from "../../types";
import { ROOM_ORDER } from "../../constants";
import { SessionCard } from "./SessionCard";

interface TimeSlotGroupProps {
  time: string;
  sessions: Talk[];
  speakers: SpeakerMap;
  isFavorite: (id: string) => boolean;
  onToggle: (id: string) => void;
}

function roomSortKey(room: string): number {
  const idx = ROOM_ORDER.indexOf(room);
  return idx === -1 ? ROOM_ORDER.length : idx;
}

export function TimeSlotGroup({ time, sessions, speakers, isFavorite, onToggle }: TimeSlotGroupProps) {
  const sorted = [...sessions].sort((a, b) => roomSortKey(a.room) - roomSortKey(b.room));

  return (
    <div className="flex gap-3 items-start">
      {/* Time label */}
      <div className="w-14 shrink-0 pt-3 text-right">
        <span className="text-xs font-mono text-slate-400">{time}</span>
      </div>

      {/* Sessions */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 min-w-0">
        {sorted.map((talk) => (
          <SessionCard
            key={talk.id}
            talk={talk}
            speakers={speakers}
            isFavorite={isFavorite(talk.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}
