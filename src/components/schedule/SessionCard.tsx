import type { Talk, SpeakerMap } from "../../types";
import { TYPE_COLORS } from "../../constants";
import { SpeakerBadge } from "./SpeakerBadge";

interface SessionCardProps {
  talk: Talk;
  speakers: SpeakerMap;
  isFavorite: boolean;
  onToggle: (id: string) => void;
}

export function SessionCard({ talk, speakers, isFavorite, onToggle }: SessionCardProps) {
  const isBreak = talk.type === "break";
  const typeColor = TYPE_COLORS[talk.type] ?? "bg-slate-100 text-slate-700";

  return (
    <div
      className={[
        "relative rounded-lg p-3 flex flex-col gap-2 text-sm transition-all",
        isBreak
          ? "bg-slate-800/50 border border-slate-700"
          : "bg-slate-800 border",
        isFavorite
          ? "border-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.3)]"
          : "border-slate-700 hover:border-slate-500",
      ].join(" ")}
    >
      {/* Header row: room badge + type badge + star */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
            {talk.room}
          </span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded capitalize ${typeColor}`}>
            {talk.type}
          </span>
          {talk.track && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400">
              {talk.track}
            </span>
          )}
        </div>
        {!isBreak && (
          <button
            onClick={() => onToggle(talk.id)}
            aria-label={isFavorite ? "Remove from my schedule" : "Add to my schedule"}
            className={[
              "shrink-0 text-lg leading-none transition-colors",
              isFavorite ? "text-amber-400" : "text-slate-600 hover:text-amber-400",
            ].join(" ")}
          >
            {isFavorite ? "★" : "☆"}
          </button>
        )}
      </div>

      {/* Title */}
      <p className={`font-semibold leading-snug ${isBreak ? "text-slate-400" : "text-white"}`}>
        {talk.title}
      </p>

      {/* Speakers */}
      {talk.speakers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {talk.speakers.map((speakerName) => (
            <SpeakerBadge
              key={speakerName}
              speakerName={speakerName}
              speaker={speakers[speakerName]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
