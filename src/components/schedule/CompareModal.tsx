import { useEffect, useRef } from "react";
import type { Talk, SpeakerMap } from "../../types";
import { DAYS } from "../../constants";
import { parseTimeToMinutes } from "../../lib/time";

interface CompareModalProps {
  myIds: string[];
  theirIds: string[];
  sessions: Talk[];
  speakers: SpeakerMap;
  onSelect: (id: string) => void;
  onImport: () => void;
  onClose: () => void;
}

interface Section {
  label: string;
  sublabel: string;
  sessions: Talk[];
  accent: "green" | "indigo" | "slate";
}

const DAY_ORDER = Object.fromEntries(DAYS.map((d, i) => [d, i]));

function sortSessions(sessions: Talk[]): Talk[] {
  return [...sessions].sort((a, b) => {
    const dayDiff = (DAY_ORDER[a.day] ?? 99) - (DAY_ORDER[b.day] ?? 99);
    if (dayDiff !== 0) return dayDiff;
    return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
  });
}

const ACCENT_STYLES: Record<Section["accent"], { badge: string; dot: string; row: string }> = {
  green: {
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    dot: "bg-emerald-500",
    row: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
  },
  indigo: {
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
    dot: "bg-indigo-400",
    row: "hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
  },
  slate: {
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    dot: "bg-slate-400",
    row: "hover:bg-slate-50 dark:hover:bg-slate-800/60",
  },
};

function SessionRow({
  session,
  accent,
  onSelect,
}: {
  session: Talk;
  accent: Section["accent"];
  onSelect: (id: string) => void;
}) {
  const styles = ACCENT_STYLES[accent];
  const startTime = session.time.split("-")[0];

  return (
    <button
      onClick={() => onSelect(session.id)}
      className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors ${styles.row}`}
    >
      <div className="w-12 shrink-0 text-right pt-0.5">
        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">{startTime}</span>
      </div>
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900 dark:text-white leading-snug truncate">
            {session.title}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {session.day} · {session.room}
            {session.track ? ` · ${session.track}` : ""}
          </p>
        </div>
      </div>
    </button>
  );
}

export function CompareModal({
  myIds,
  theirIds,
  sessions,
  onSelect,
  onImport,
  onClose,
}: CompareModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  const mySet = new Set(myIds);
  const theirSet = new Set(theirIds);

  const bothIds = theirIds.filter((id) => mySet.has(id));
  const onlyMineIds = myIds.filter((id) => !theirSet.has(id));
  const onlyTheirsIds = theirIds.filter((id) => !mySet.has(id));

  const sessionById = new Map(sessions.map((s) => [s.id, s]));
  const resolve = (ids: string[]) =>
    sortSessions(ids.flatMap((id) => (sessionById.has(id) ? [sessionById.get(id)!] : [])));

  const sections: Section[] = ([
    {
      label: "Going together",
      sublabel: `${bothIds.length} session${bothIds.length !== 1 ? "s" : ""} you both saved`,
      sessions: resolve(bothIds),
      accent: "green" as const,
    },
    {
      label: "Only you",
      sublabel: `${onlyMineIds.length} session${onlyMineIds.length !== 1 ? "s" : ""} only in your schedule`,
      sessions: resolve(onlyMineIds),
      accent: "indigo" as const,
    },
    {
      label: "Only them",
      sublabel: `${onlyTheirsIds.length} session${onlyTheirsIds.length !== 1 ? "s" : ""} only in their schedule`,
      sessions: resolve(onlyTheirsIds),
      accent: "slate" as const,
    },
  ] as Section[]).filter((s) => s.sessions.length > 0);

  useEffect(() => {
    closeRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const styles = ACCENT_STYLES.green;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Compare schedules"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 dark:bg-black/75" />

      <div
        className="relative w-full sm:max-w-lg max-h-[92dvh] flex flex-col bg-white dark:bg-slate-900 sm:rounded-xl rounded-t-2xl border-t sm:border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Compare Schedules</h2>
            <div className="flex items-center gap-3 mt-1.5">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles.badge}`}>
                {bothIds.length} in common
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {myIds.length} yours · {theirIds.length} theirs
              </span>
            </div>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Scrollable sections */}
        <div className="overflow-y-auto overscroll-contain flex-1">
          {sections.map((section) => (
            <div key={section.label}>
              {/* Section header */}
              <div className="sticky top-0 z-10 px-4 py-2 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${ACCENT_STYLES[section.accent].dot}`} />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {section.label}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  — {section.sublabel}
                </span>
              </div>

              {section.sessions.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  accent={section.accent}
                  onSelect={(id) => { onClose(); onSelect(id); }}
                />
              ))}
            </div>
          ))}

          {sections.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
              <span className="text-3xl mb-3">🤷</span>
              <p className="text-sm">No sessions to compare yet.</p>
            </div>
          )}

          {/* Import CTA at the bottom */}
          {onlyTheirsIds.length > 0 && (
            <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={onImport}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Add their {onlyTheirsIds.length} unique session{onlyTheirsIds.length !== 1 ? "s" : ""} to My Schedule
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
