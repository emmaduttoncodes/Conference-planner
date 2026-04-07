import type { Filters, Day } from "../../types";
import { DAYS, TYPE_LABELS } from "../../constants";

interface FilterBarProps {
  filters: Filters;
  availableTracks: string[];
  onChange: (filters: Filters) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  disabled?: boolean;
}

const TYPE_OPTIONS = ["All", ...Object.keys(TYPE_LABELS)] as const;

export function FilterBar({
  filters,
  availableTracks,
  onChange,
  onClear,
  hasActiveFilters,
  disabled = false,
}: FilterBarProps) {
  const dayOptions: Array<Day | "All"> = ["All", ...DAYS];

  return (
    <div className="sticky top-[57px] z-10 bg-slate-900 border-b border-slate-800">
      <div className="px-4 py-3 flex flex-col gap-2.5">
        {/* Row 1: Day chips */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 w-10 shrink-0">
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
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white",
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
            <span className="text-[10px] uppercase tracking-widest text-slate-500">
              Type
            </span>
            <select
              value={filters.type}
              disabled={disabled}
              onChange={(e) =>
                onChange({ ...filters, type: e.target.value as Filters["type"] })
              }
              className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 disabled:opacity-40 appearance-none pr-6 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20fill%3D%22%2394a3b8%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.2rem] bg-[right_0.3rem_center] bg-no-repeat"
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
              <span className="text-[10px] uppercase tracking-widest text-slate-500">
                Track
              </span>
              <select
                value={filters.track}
                disabled={disabled}
                onChange={(e) =>
                  onChange({ ...filters, track: e.target.value })
                }
                className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 disabled:opacity-40 max-w-[150px] appearance-none pr-6 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20fill%3D%22%2394a3b8%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.2rem] bg-[right_0.3rem_center] bg-no-repeat"
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

          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors ml-auto"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
