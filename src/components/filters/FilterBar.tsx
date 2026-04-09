import type { Filters, Day } from "../../types";
import { DAYS, TYPE_LABELS } from "../../constants";

interface FilterBarProps {
  filters: Filters;
  availableTracks: string[];
  availableRooms: string[];
  onChange: (filters: Filters) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  disabled?: boolean;
}

const TYPE_OPTIONS = ["All", ...Object.keys(TYPE_LABELS)] as const;

const SELECT_CLASS = [
  "filter-select border text-xs rounded-lg px-2 py-1.5 pr-6 focus:outline-none transition-colors disabled:opacity-40 appearance-none",
  "bg-white border-slate-300 text-slate-700 focus:border-indigo-500",
  "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:focus:border-indigo-500",
].join(" ");

export function FilterBar({
  filters,
  availableTracks,
  availableRooms,
  onChange,
  onClear,
  hasActiveFilters,
  disabled = false,
}: FilterBarProps) {
  const dayOptions: Array<Day | "All"> = ["All", ...DAYS];

  return (
    <div className="sticky top-[57px] z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="px-4 py-3 flex flex-col gap-2.5">
        {/* Row 1: Day chips */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 w-10 shrink-0">
            Day
          </span>
          <div className="flex gap-1 flex-wrap">
            {dayOptions.map((day) => (
              <button
                key={day}
                disabled={disabled}
                onClick={() => onChange({ ...filters, day })}
                className={[
                  "px-2.5 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-40",
                  filters.day === day
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white",
                ].join(" ")}
              >
                {day === "All" ? "All days" : day}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Type + Track dropdowns + Clear */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Type
            </span>
            <select
              value={filters.type}
              disabled={disabled}
              onChange={(e) =>
                onChange({ ...filters, type: e.target.value as Filters["type"] })
              }
              className={SELECT_CLASS}
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "All types" : TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          {availableTracks.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Track
              </span>
              <select
                value={filters.track}
                disabled={disabled}
                onChange={(e) =>
                  onChange({ ...filters, track: e.target.value })
                }
                className={`${SELECT_CLASS} max-w-[150px]`}
              >
                <option value="All">All tracks</option>
                {availableTracks.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {availableRooms.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Room
              </span>
              <select
                value={filters.room}
                disabled={disabled}
                onChange={(e) =>
                  onChange({ ...filters, room: e.target.value })
                }
                className={`${SELECT_CLASS} max-w-[150px]`}
              >
                <option value="All">All rooms</option>
                {availableRooms.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors ml-auto"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
