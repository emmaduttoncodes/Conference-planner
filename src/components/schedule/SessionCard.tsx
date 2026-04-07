import type { Talk, SpeakerMap } from "../../types";
import { TYPE_COLORS, TYPE_LABELS, TBD_REGEX } from "../../constants";
import { lookupSpeaker } from "../../lib/normalize";
import { SpeakerBadge } from "./SpeakerBadge";

interface SessionCardProps {
  talk: Talk;
  speakers: SpeakerMap;
  isFavorite: boolean;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}

export function SessionCard({
  talk,
  speakers,
  isFavorite,
  onToggle,
  onSelect,
}: SessionCardProps) {
  const isBreak = talk.type === "break";
  const typeColor = TYPE_COLORS[talk.type] ?? "bg-slate-200 text-slate-700";
  const typeLabel = TYPE_LABELS[talk.type] ?? talk.type;

  // Filter out TBD speakers for the card preview
  const visibleSpeakers = talk.speakers.filter((n) => !TBD_REGEX.test(n));

  return (
    <div
      role={isBreak ? undefined : "button"}
      tabIndex={isBreak ? undefined : 0}
      aria-label={isBreak ? undefined : `Open details for ${talk.title}`}
      onKeyDown={
        isBreak
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(talk.id);
              }
            }
      }
      onClick={isBreak ? undefined : () => onSelect(talk.id)}
      className={[
        "rounded-lg border flex flex-col gap-1.5 text-sm transition-all outline-none",
        isBreak
          ? "bg-slate-800/40 border-slate-800"
          : "bg-slate-800 cursor-pointer hover:bg-slate-700/80 focus-visible:ring-2 focus-visible:ring-indigo-500",
        isFavorite
          ? "border-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.25)]"
          : isBreak
          ? ""
          : "border-slate-700 hover:border-slate-500",
      ].join(" ")}
    >
      <div className="p-3 flex flex-col gap-1.5">
        {/* Badges + star */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${typeColor}`}
            >
              {typeLabel}
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
              {talk.room}
            </span>
            {talk.track && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400">
                {talk.track}
              </span>
            )}
          </div>
          {!isBreak && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(talk.id);
              }}
              aria-label={
                isFavorite ? "Remove from My Schedule" : "Add to My Schedule"
              }
              className={[
                "shrink-0 text-lg leading-none transition-colors mt-0.5",
                isFavorite
                  ? "text-amber-400"
                  : "text-slate-600 hover:text-amber-400",
              ].join(" ")}
            >
              {isFavorite ? "★" : "☆"}
            </button>
          )}
        </div>

        {/* Time */}
        <p className="text-[10px] text-slate-500 font-medium">
          {talk.day} · {talk.time}
        </p>

        {/* Title */}
        <p
          className={`font-semibold leading-snug ${
            isBreak ? "text-slate-500" : "text-white"
          }`}
        >
          {talk.title}
        </p>

        {/* Speakers */}
        {visibleSpeakers.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
            {visibleSpeakers.map((name) => (
              <SpeakerBadge
                key={name}
                speakerName={name}
                speaker={lookupSpeaker(speakers, name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
