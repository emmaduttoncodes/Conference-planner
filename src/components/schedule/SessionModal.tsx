import { useEffect, useRef } from "react";
import type { Talk, SpeakerMap, Speaker } from "../../types";
import { TYPE_COLORS, TYPE_LABELS, TBD_REGEX } from "../../constants";
import { lookupSpeaker } from "../../lib/normalize";

interface SessionModalProps {
  talk: Talk;
  speakers: SpeakerMap;
  isFavorite: boolean;
  onToggle: (id: string) => void;
  onClose: () => void;
}

function SpeakerDetail({
  speaker,
  name,
}: {
  speaker: Speaker | undefined;
  name: string;
}) {
  if (!name.trim() || TBD_REGEX.test(name)) return null;

  const displayName = speaker?.name ?? name;
  const photo = speaker?.photoUrl;
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

  return (
    <div className="flex gap-3 items-start">
      {photo ? (
        <img
          src={photo}
          alt={displayName}
          className="w-12 h-12 rounded-full object-cover shrink-0 bg-slate-700"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
          {initials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white">{displayName}</p>
        {(speaker?.role || speaker?.company) && (
          <p className="text-sm text-slate-400 mt-0.5">
            {[speaker.role, speaker.company].filter(Boolean).join(" · ")}
          </p>
        )}
        {speaker?.bio && (
          <p className="text-sm text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">
            {speaker.bio.trim()}
          </p>
        )}
      </div>
    </div>
  );
}

export function SessionModal({
  talk,
  speakers,
  isFavorite,
  onToggle,
  onClose,
}: SessionModalProps) {
  const typeColor = TYPE_COLORS[talk.type] ?? "bg-slate-200 text-slate-700";
  const typeLabel = TYPE_LABELS[talk.type] ?? talk.type;
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus close button on mount for keyboard accessibility
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const visibleSpeakers = talk.speakers.filter((n) => n.trim() && !TBD_REGEX.test(n));
  const hasSpeakers = visibleSpeakers.length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={talk.title}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75" />

      {/* Panel */}
      <div
        className="relative w-full sm:max-w-lg max-h-[92dvh] flex flex-col bg-slate-900 sm:rounded-xl border border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="flex items-start gap-3 px-4 pt-4 pb-3 border-b border-slate-800 shrink-0">
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${typeColor}`}
              >
                {typeLabel}
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
            {/* Title always visible */}
            <h2 className="text-base font-bold text-white leading-snug pr-2">
              {talk.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {talk.day} · {talk.time}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0 mt-0.5">
            <button
              onClick={() => onToggle(talk.id)}
              aria-label={
                isFavorite ? "Remove from My Schedule" : "Add to My Schedule"
              }
              className={`text-2xl leading-none p-1 transition-colors rounded ${
                isFavorite
                  ? "text-amber-400"
                  : "text-slate-500 hover:text-amber-400"
              }`}
            >
              {isFavorite ? "★" : "☆"}
            </button>
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close"
              className="text-slate-400 hover:text-white text-lg leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto overscroll-contain flex flex-col divide-y divide-slate-800">
          {/* Description */}
          {talk.description ? (
            <div className="px-4 py-4">
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {talk.description.trim()}
              </p>
            </div>
          ) : (
            <div className="px-4 py-4">
              <p className="text-sm text-slate-500 italic">
                No description available.
              </p>
            </div>
          )}

          {/* Speakers */}
          {hasSpeakers && (
            <div className="px-4 py-4 flex flex-col gap-5 pb-8">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                {visibleSpeakers.length === 1 ? "Speaker" : "Speakers"}
              </p>
              {visibleSpeakers.map((name) => (
                <SpeakerDetail
                  key={name}
                  name={name}
                  speaker={lookupSpeaker(speakers, name)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
