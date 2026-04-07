import type { Talk, SpeakerMap } from "../../types";
import type { Friend } from "../../hooks/useFriends";
import { TYPE_COLORS, TYPE_LABELS, TBD_REGEX } from "../../constants";
import { lookupSpeaker } from "../../lib/normalize";
import { SpeakerBadge } from "./SpeakerBadge";
import { friendColor, friendInitial } from "../sync/SyncModal";

interface SessionCardProps {
  talk: Talk;
  speakers: SpeakerMap;
  isFavorite: boolean;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  friendsAttending?: Friend[];
}

export function SessionCard({
  talk,
  speakers,
  isFavorite,
  onToggle,
  onSelect,
  friendsAttending = [],
}: SessionCardProps) {
  const isBreak = talk.type === "break";
  const typeColor = TYPE_COLORS[talk.type] ?? "bg-slate-100 text-slate-600 dark:bg-slate-200 dark:text-slate-700";
  const typeLabel = TYPE_LABELS[talk.type] ?? talk.type;
  const visibleSpeakers = talk.speakers.filter((n) => !TBD_REGEX.test(n));
  const hasFriends = friendsAttending.length > 0;

  return (
    <div
      role={isBreak ? undefined : "button"}
      tabIndex={isBreak ? undefined : 0}
      aria-label={isBreak ? undefined : `Open details for ${talk.title}`}
      onKeyDown={
        isBreak ? undefined : (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(talk.id); }
        }
      }
      onClick={isBreak ? undefined : () => onSelect(talk.id)}
      className={[
        "rounded-lg border flex flex-col gap-1.5 text-sm transition-all outline-none",
        isBreak
          ? "bg-slate-100/80 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800"
          : "bg-white dark:bg-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/80 focus-visible:ring-2 focus-visible:ring-indigo-500",
        isFavorite
          ? "border-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.25)]"
          : hasFriends
          ? "border-violet-300 dark:border-violet-700"
          : isBreak
          ? ""
          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500",
      ].join(" ")}
    >
      <div className="p-3 flex flex-col gap-1.5">
        {/* Badges + star */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${typeColor}`}>
              {typeLabel}
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              {talk.room}
            </span>
            {talk.track && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400">
                {talk.track}
              </span>
            )}
          </div>
          {!isBreak && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(talk.id); }}
              aria-label={isFavorite ? "Remove from My Schedule" : "Add to My Schedule"}
              className={[
                "shrink-0 text-lg leading-none transition-colors mt-0.5",
                isFavorite ? "text-amber-400" : "text-slate-300 dark:text-slate-600 hover:text-amber-400",
              ].join(" ")}
            >
              {isFavorite ? "★" : "☆"}
            </button>
          )}
        </div>

        {/* Time */}
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          {talk.day} · {talk.time}
        </p>

        {/* Title */}
        <p className={`font-semibold leading-snug ${isBreak ? "text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white"}`}>
          {talk.title}
        </p>

        {/* Speakers */}
        {visibleSpeakers.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
            {visibleSpeakers.map((name) => (
              <SpeakerBadge key={name} speakerName={name} speaker={lookupSpeaker(speakers, name)} />
            ))}
          </div>
        )}

        {/* Friends attending */}
        {hasFriends && (
          <div className="flex items-center gap-1.5 mt-0.5 pt-1.5 border-t border-slate-100 dark:border-slate-700">
            <div className="flex -space-x-1">
              {friendsAttending.slice(0, 5).map((friend, i) => (
                <span
                  key={friend.code}
                  title={friend.name}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold border border-white dark:border-slate-800 ${friendColor(i)}`}
                >
                  {friendInitial(friend.name)}
                </span>
              ))}
            </div>
            <span className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">
              {friendsAttending.length === 1
                ? `${friendsAttending[0].name} is going`
                : `${friendsAttending.map((f) => f.name).join(" & ")} are going`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
