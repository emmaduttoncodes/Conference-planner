import { useState, useMemo } from "react";
import type { Filters, View, Talk } from "./types";
import { useSchedule } from "./hooks/useSchedule";
import { useFavorites } from "./hooks/useFavorites";
import { Header } from "./components/layout/Header";
import { FilterBar } from "./components/filters/FilterBar";
import { ScheduleView } from "./components/schedule/ScheduleView";
import { SessionModal } from "./components/schedule/SessionModal";

const DEFAULT_FILTERS: Filters = { day: "All", type: "All", track: "All" };

export default function App() {
  const [view, setView] = useState<View>("schedule");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedTalk, setSelectedTalk] = useState<Talk | null>(null);
  const { sessions, speakers, loading, error } = useSchedule();
  const { favorites, isFavorite, toggle } = useFavorites();

  const filteredSessions = useMemo(() => {
    let result = sessions;
    if (filters.day !== "All") result = result.filter((s) => s.day === filters.day);
    if (filters.type !== "All") result = result.filter((s) => s.type === filters.type);
    if (filters.track !== "All") result = result.filter((s) => s.track === filters.track);
    return result;
  }, [sessions, filters]);

  const myScheduleSessions = useMemo(
    () => sessions.filter((s) => isFavorite(s.id)),
    [sessions, isFavorite]
  );

  const availableTracks = useMemo(() => {
    const base = filters.day !== "All"
      ? sessions.filter((s) => s.day === filters.day)
      : sessions;
    const tracks = new Set(base.map((s) => s.track).filter((t): t is string => !!t));
    return [...tracks].sort();
  }, [sessions, filters.day]);

  const displaySessions = view === "schedule" ? filteredSessions : myScheduleSessions;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header view={view} onViewChange={setView} favoriteCount={favorites.length} />

      {view === "schedule" && (
        <FilterBar
          filters={filters}
          availableTracks={availableTracks}
          onChange={setFilters}
        />
      )}

      <main className="max-w-5xl mx-auto px-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p>Loading schedule…</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-red-400">
            <span className="text-4xl mb-3">⚠️</span>
            <p className="text-center">{error}</p>
            <p className="text-sm text-slate-500 mt-2">Check your connection and refresh.</p>
          </div>
        )}

        {!loading && !error && (
          <ScheduleView
            sessions={displaySessions}
            speakers={speakers}
            isFavorite={isFavorite}
            onToggle={toggle}
            onSelect={setSelectedTalk}
            filterBarShown={view === "schedule"}
            emptyMessage={
              view === "my-schedule"
                ? "No sessions saved yet. Star sessions in the Schedule view to add them here."
                : "No sessions match your filters."
            }
          />
        )}
      </main>

      {selectedTalk && (
        <SessionModal
          talk={selectedTalk}
          speakers={speakers}
          isFavorite={isFavorite(selectedTalk.id)}
          onToggle={toggle}
          onClose={() => setSelectedTalk(null)}
        />
      )}
    </div>
  );
}
