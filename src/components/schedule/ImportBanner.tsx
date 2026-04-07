interface ImportBannerProps {
  count: number;
  commonCount: number;
  onImport: () => void;
  onCompare: () => void;
  onDismiss: () => void;
}

export function ImportBanner({ count, commonCount, onImport, onCompare, onDismiss }: ImportBannerProps) {
  return (
    <div className="mx-4 mt-4 mb-0 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-3 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
            Someone shared their schedule
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-indigo-600 dark:text-indigo-400">
              {count} session{count !== 1 ? "s" : ""}
            </span>
            {commonCount > 0 && (
              <>
                <span className="text-indigo-300 dark:text-indigo-700">·</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {commonCount} in common with you
                </span>
              </>
            )}
            {commonCount === 0 && (
              <>
                <span className="text-indigo-300 dark:text-indigo-700">·</span>
                <span className="text-xs text-indigo-500 dark:text-indigo-500">no overlap yet</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors shrink-0 mt-0.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCompare}
          className="flex-1 text-xs font-semibold py-2 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
        >
          Compare schedules
        </button>
        <button
          onClick={onImport}
          className="flex-1 text-xs font-semibold py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
        >
          Import all
        </button>
      </div>
    </div>
  );
}
