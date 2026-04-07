import type { View } from "../../types";

interface HeaderProps {
  view: View;
  onViewChange: (view: View) => void;
  favoriteCount: number;
  theme: "light" | "dark";
  onThemeToggle: () => void;
}

export function Header({ view, onViewChange, favoriteCount, theme, onThemeToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg font-bold text-slate-900 dark:text-white whitespace-nowrap">AIE</span>
          <span className="text-slate-500 dark:text-slate-400 text-sm truncate hidden sm:block">AI Engineer Europe '26</span>
        </div>

        <nav className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 gap-1 shrink-0">
          <button
            onClick={() => onViewChange("schedule")}
            className={[
              "px-3 py-1 rounded text-sm font-medium transition-colors",
              view === "schedule"
                ? "bg-indigo-600 text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
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
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
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

        <button
          onClick={onThemeToggle}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          {theme === "dark" ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
