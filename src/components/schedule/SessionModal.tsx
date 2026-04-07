import { useEffect } from "react";
import type { Talk, SpeakerMap, Speaker } from "../../types";
import { TYPE_COLORS } from "../../constants";
import { TBD_REGEX } from "../../constants";

interface SessionModalProps {
  talk: Talk;
  speakers: SpeakerMap;
  isFavorite: boolean;
  onToggle: (id: string) => void;
  onClose: () => void;
}

function SpeakerDetail({ speaker, name }: { speaker: Speaker | undefined; name: string }) {
  const isTbd = TBD_REGEX.test(name);
  if (isTbd) return null;

  const displayName = speaker?.name ?? name;
  const photo = speaker?.photoUrl;

  return (
    <div className="flex gap-3 items-start">
      {photo ? (
        <img
          src={photo}
          alt={displayName}
          className="w-12 h-12 rounded-full object-cover shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
          {displayName.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("")}
        </div>
      )}
      <div className="min-w-0">
        <p className="font-semibold text-white">{displayName}</p>
        {(speaker?.role || speaker?.company) && (
          <p className="text-sm text-slate-400">
            {[speaker.role, speaker.company].filter(Boolean).join(" · ")}
          </p>
        )}
        {speaker?.bio && (
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">{speaker.bio}</p>
        )}
      </div>
    </div>
  );
}

export function SessionModal({ talk, speakers, isFavorite, onToggle, onClose }: SessionModalProps) {
  const typeColor = TYPE_COLORS[talk.type] ?? "bg-slate-100 text-slate-700";

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full sm:max-w-lg max-h-[90dvh] flex flex-col bg-slate-900 sm:rounded-xl border border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-4 border-b border-slate-800 shrink-0">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${typeColor}`}>
              {talk.type}
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-700 text-slate-300">
              {talk.room}
            </span>
            {talk.track && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {talk.track}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggle(talk.id)}
              aria-label={isFavorite ? "Remove from my schedule" : "Add to my schedule"}
              className={`text-2xl leading-none transition-colors ${isFavorite ? "text-amber-400" : "text-slate-500 hover:text-amber-400"}`}
            >
              {isFavorite ? "★" : "☆"}
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-slate-400 hover:text-white text-xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto p-4 flex flex-col gap-4">
          {/* Time + day */}
          <p className="text-xs text-slate-400 font-medium">
            {talk.day} · {talk.time}
          </p>

          {/* Title */}
          <h2 className="text-lg font-bold text-white leading-snug">{talk.title}</h2>

          {/* Description */}
          {talk.description ? (
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{talk.description}</p>
          ) : (
            <p className="text-sm text-slate-500 italic">No description available.</p>
          )}

          {/* Speakers */}
          {talk.speakers.length > 0 && (
            <div className="flex flex-col gap-4 pt-3 border-t border-slate-800 pb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {talk.speakers.length === 1 ? "Speaker" : "Speakers"}
              </p>
              {talk.speakers.map((name) => (
                <SpeakerDetail key={name} name={name} speaker={speakers[name]} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
