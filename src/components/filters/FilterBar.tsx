import type { Filters, Day, SessionType } from "../../types";
import { DAYS, SESSION_TYPES } from "../../constants";

interface FilterBarProps {
  filters: Filters;
  availableTracks: string[];
  onChange: (filters: Filters) => void;
}

export function FilterBar({ filters, availableTracks, onChange }: FilterBarProps) {
  const dayOptions: Array<Day | "All"> = ["All", ...DAYS];
  const typeOptions: Array<SessionType | "All"> = ["All", ...SESSION_TYPES];

  return (
    <div className="flex flex-col gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800 sticky top-[57px] z-10">
      {/* Day chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-widest text-slate-500 w-10 shrink-0">Day</span>
        <div className="flex gap-1 flex-wrap">
          {dayOptions.map((day) => (
            <button
              key={day}
              onClick={() => onChange({ ...filters, day })}
              className={[
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                filters.day === day
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700",
              ].join(" ")}
            >
              {day === "All" ? "All days" : day}
            </button>
          ))}
        </div>
      </div>

      {/* Type + Track dropdowns */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-slate-500">Type</span>
          <select
            value={filters.type}
            onChange={(e) => onChange({ ...filters, type: e.target.value as SessionType | "All" })}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
          >
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {t === "All" ? "All types" : t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {availableTracks.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">Track</span>
            <select
              value={filters.track}
              onChange={(e) => onChange({ ...filters, track: e.target.value })}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All tracks</option>
              {availableTracks.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
