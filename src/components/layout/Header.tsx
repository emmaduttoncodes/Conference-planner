import type { View } from "../../types";

interface HeaderProps {
  view: View;
  onViewChange: (view: View) => void;
  favoriteCount: number;
}

export function Header({ view, onViewChange, favoriteCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-slate-900 border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg font-bold text-white whitespace-nowrap">AIE</span>
          <span className="text-slate-400 text-sm truncate hidden sm:block">AI Engineer Europe '26</span>
        </div>

        <nav className="flex bg-slate-800 rounded-lg p-1 gap-1 shrink-0">
          <button
            onClick={() => onViewChange("schedule")}
            className={[
              "px-3 py-1 rounded text-sm font-medium transition-colors",
              view === "schedule"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white",
            ].join(" ")}
          >
            Schedule
          </button>
          <button
            onClick={() => onViewChange("my-schedule")}
            className={[
              "px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1.5",
              view === "my-schedule"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white",
            ].join(" ")}
          >
            My Schedule
            {favoriteCount > 0 && (
              <span className={[
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                view === "my-schedule" ? "bg-white/20 text-white" : "bg-amber-400 text-slate-900",
              ].join(" ")}>
                {favoriteCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
