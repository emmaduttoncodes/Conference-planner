import { useEffect, useRef, useState } from "react";
import type { SyncStatus } from "../../hooks/useSyncedFavorites";

interface SyncModalProps {
  roomCode: string | null;
  syncStatus: SyncStatus;
  onJoinRoom: (code: string) => void;
  onLeaveRoom: () => void;
  onClose: () => void;
}

const STATUS_CONFIG: Record<SyncStatus, { label: string; dotClass: string; textClass: string }> = {
  idle:       { label: "Not syncing",   dotClass: "bg-slate-400",                             textClass: "text-slate-400" },
  connecting: { label: "Connecting…",  dotClass: "bg-amber-400 animate-pulse",               textClass: "text-amber-500" },
  synced:     { label: "Live",          dotClass: "bg-emerald-500 animate-pulse",             textClass: "text-emerald-500" },
  error:      { label: "Sync error",    dotClass: "bg-red-500",                               textClass: "text-red-500" },
};

export function SyncModal({ roomCode, syncStatus, onJoinRoom, onLeaveRoom, onClose }: SyncModalProps) {
  const [showJoin, setShowJoin] = useState(false);
  const [joinInput, setJoinInput] = useState("");
  const [joinError, setJoinError] = useState("");
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const joinRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (showJoin) joinRef.current?.focus();
  }, [showJoin]);

  const handleCopy = async () => {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.getSelection()?.selectAllChildren(
        document.getElementById("sync-code-display")!
      );
    }
  };

  const handleJoin = () => {
    const code = joinInput.toUpperCase().trim();
    if (code.length < 4) { setJoinError("Enter a valid room code."); return; }
    onJoinRoom(code);
    setShowJoin(false);
    setJoinInput("");
  };

  const status = STATUS_CONFIG[syncStatus];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Live sync"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 dark:bg-black/75" />

      <div
        className="relative w-full sm:max-w-sm mx-0 sm:mx-4 bg-white dark:bg-slate-900 sm:rounded-xl rounded-t-2xl border-t sm:border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-start justify-between border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Live Sync</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${status.dotClass}`} />
              <span className={`text-xs font-medium ${status.textClass}`}>{status.label}</span>
            </div>
          </div>
          <button ref={closeRef} onClick={onClose} aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0">
            ✕
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Your room code */}
          {roomCode && !showJoin && (
            <>
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Your sync code</p>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3">
                    <span id="sync-code-display"
                      className="text-2xl font-mono font-bold tracking-[0.25em] text-slate-900 dark:text-white select-all">
                      {roomCode}
                    </span>
                  </div>
                  <button onClick={handleCopy}
                    className={`px-4 rounded-xl text-sm font-medium transition-colors ${copied ? "bg-emerald-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}>
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Share this with someone — when they enter it, your schedules sync instantly in both directions.
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-2">
                <button onClick={() => setShowJoin(true)}
                  className="w-full py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Join someone else's room instead
                </button>
                <button onClick={() => { onLeaveRoom(); onClose(); }}
                  className="w-full py-2 text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                  Stop syncing
                </button>
              </div>
            </>
          )}

          {/* Join a room */}
          {showJoin && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Enter their code</label>
                <input
                  ref={joinRef}
                  type="text"
                  placeholder="ABC123"
                  value={joinInput}
                  onChange={(e) => { setJoinInput(e.target.value.toUpperCase()); setJoinError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleJoin(); }}
                  maxLength={8}
                  className={[
                    "w-full text-center text-2xl font-mono tracking-widest px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none focus:border-indigo-500 transition-colors text-slate-900 dark:text-white uppercase placeholder:text-slate-300 dark:placeholder:text-slate-600",
                    joinError ? "border-red-400" : "border-slate-200 dark:border-slate-700",
                  ].join(" ")}
                />
                {joinError && <p className="text-xs text-red-500">{joinError}</p>}
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Warning: joining replaces your current favorites with theirs.
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowJoin(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium">
                  Back
                </button>
                <button onClick={handleJoin}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                  Join
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
