import { useState, useMemo, useCallback, useEffect } from "react";
import type { Filters, View } from "./types";
import { useSchedule } from "./hooks/useSchedule";
import { useFavorites } from "./hooks/useFavorites";
import { useTheme } from "./hooks/useTheme";
import { FAVORITES_KEY } from "./constants";
import { readImportParam, clearImportParam } from "./lib/shareSchedule";
import { Header } from "./components/layout/Header";
import { FilterBar } from "./components/filters/FilterBar";
import { ScheduleView } from "./components/schedule/ScheduleView";
import { SessionModal } from "./components/schedule/SessionModal";
import { ShareModal } from "./components/schedule/ShareModal";
import { ImportBanner } from "./components/schedule/ImportBanner";

const DEFAULT_FILTERS: Filters = { day: "All", type: "All", track: "All" };

export default function App() {
  const [view, setView] = useState<View>("schedule");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedTalkId, setSelectedTalkId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pendingImport, setPendingImport] = useState<string[] | null>(null);
  const { sessions, speakers, loading, error, reload } = useSchedule();
  const { favorites, isFavorite, toggle } = useFavorites();
  const { theme, toggle: toggleTheme } = useTheme();

  // Detect shared schedule in URL on mount
  useEffect(() => {
    const imported = readImportParam();
    if (imported && imported.length > 0) {
      setPendingImport(imported);
      clearImportParam();
    }
  }, []);

  // Resolve selected talk from current sessions (avoids stale reference)
  const selectedTalk = useMemo(
    () => (selectedTalkId ? sessions.find((s) => s.id === selectedTalkId) ?? null : null),
    [selectedTalkId, sessions]
  );

  // Clean up ghost favorites whose sessions no longer exist in the API
  useEffect(() => {
    if (sessions.length === 0) return;
    const validIds = new Set(sessions.map((s) => s.id));
    const clean = favorites.filter((id) => validIds.has(id));
    if (clean.length !== favorites.length) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(clean));
    }
  }, [sessions]); // eslint-disable-line react-hooks/exhaustive-deps

  // When switching to My Schedule, reset filters (they don't apply there)
  const handleViewChange = useCallback(
    (newView: View) => {
      if (newView === "my-schedule") setFilters(DEFAULT_FILTERS);
      setView(newView);
    },
    []
  );

  // Auto-reset track filter when it no longer exists in the selected day
  const handleFilterChange = useCallback(
    (newFilters: Filters) => {
      if (newFilters.day !== filters.day && newFilters.track !== "All") {
        const base =
          newFilters.day !== "All"
            ? sessions.filter((s) => s.day === newFilters.day)
            : sessions;
        const tracks = new Set(base.map((s) => s.track).filter(Boolean));
        if (!tracks.has(newFilters.track)) {
          newFilters = { ...newFilters, track: "All" };
        }
      }
      setFilters(newFilters);
    },
    [filters.day, sessions]
  );

  const handleImport = useCallback(() => {
    if (!pendingImport) return;
    // Merge imported IDs with existing favorites (deduplicate)
    const existing = new Set(favorites);
    const merged = [...existing, ...pendingImport.filter((id) => !existing.has(id))];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(merged));
    // Force useFavorites to re-read by toggling a dummy - simpler to just reload the page
    window.location.reload();
  }, [pendingImport, favorites]);

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
    const base =
      filters.day !== "All"
        ? sessions.filter((s) => s.day === filters.day)
        : sessions;
    const tracks = new Set(base.map((s) => s.track).filter((t): t is string => !!t));
    return [...tracks].sort();
  }, [sessions, filters.day]);

  const displaySessions =
    view === "schedule" ? filteredSessions : myScheduleSessions;

  const hasActiveFilters =
    filters.day !== "All" || filters.type !== "All" || filters.track !== "All";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <Header
        view={view}
        onViewChange={handleViewChange}
        favoriteCount={favorites.length}
        theme={theme}
        onThemeToggle={toggleTheme}
        onShare={view === "my-schedule" && favorites.length > 0 ? () => setShowShareModal(true) : undefined}
      />

      {view === "schedule" && (
        <FilterBar
          filters={filters}
          availableTracks={availableTracks}
          onChange={handleFilterChange}
          onClear={() => setFilters(DEFAULT_FILTERS)}
          hasActiveFilters={hasActiveFilters}
          disabled={loading}
        />
      )}

      {/* Import banner — shown when a share link was opened */}
      {pendingImport && (
        <ImportBanner
          count={pendingImport.length}
          onImport={handleImport}
          onDismiss={() => setPendingImport(null)}
        />
      )}

      <main className="max-w-5xl mx-auto px-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm">Loading schedule…</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-4xl">⚠️</span>
            <p className="text-red-500 dark:text-red-400 text-center text-sm">{error}</p>
            <button
              onClick={reload}
              className="mt-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <ScheduleView
            sessions={displaySessions}
            speakers={speakers}
            isFavorite={isFavorite}
            onToggle={toggle}
            onSelect={setSelectedTalkId}
            filterBarShown={view === "schedule"}
            emptyMessage={
              view === "my-schedule"
                ? "No sessions saved yet. Star sessions in the Schedule view to add them here."
                : hasActiveFilters
                ? "No sessions match your filters. Try clearing some."
                : "No sessions available."
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
          onClose={() => setSelectedTalkId(null)}
        />
      )}

      {showShareModal && (
        <ShareModal
          favoriteIds={favorites}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
