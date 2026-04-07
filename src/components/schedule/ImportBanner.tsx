interface ImportBannerProps {
  count: number;
  onImport: () => void;
  onDismiss: () => void;
}

export function ImportBanner({ count, onImport, onDismiss }: ImportBannerProps) {
  return (
    <div className="mx-4 mt-4 mb-0 flex items-center gap-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
          Import shared schedule?
        </p>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
          {count} session{count !== 1 ? "s" : ""} from a shared link
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={onDismiss}
          className="text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors px-2 py-1"
        >
          Dismiss
        </button>
        <button
          onClick={onImport}
          className="text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          Import
        </button>
      </div>
    </div>
  );
}
