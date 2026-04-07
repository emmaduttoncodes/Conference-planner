import { useEffect, useRef, useState } from "react";
import type { SyncStatus } from "../../hooks/useSyncedFavorites";
import type { Friend } from "../../hooks/useFriends";

interface SyncModalProps {
  roomCode: string | null;
  syncStatus: SyncStatus;
  friends: Friend[];
  onJoinRoom: (code: string) => void;
  onLeaveRoom: () => void;
  onAddFriend: (code: string, name: string) => void;
  onRemoveFriend: (code: string) => void;
  onClose: () => void;
}

const STATUS_CONFIG: Record<SyncStatus, { label: string; dotClass: string; textClass: string }> = {
  idle:       { label: "Not syncing",  dotClass: "bg-slate-400",              textClass: "text-slate-400" },
  connecting: { label: "Connecting…", dotClass: "bg-amber-400 animate-pulse", textClass: "text-amber-500" },
  synced:     { label: "Live",         dotClass: "bg-emerald-500 animate-pulse", textClass: "text-emerald-500" },
  error:      { label: "Sync error",   dotClass: "bg-red-500",                textClass: "text-red-500" },
};

const FRIEND_COLORS = [
  "bg-violet-500", "bg-pink-500", "bg-cyan-500", "bg-amber-500",
  "bg-teal-500",   "bg-rose-500", "bg-indigo-400","bg-lime-500",
];

export function friendColor(index: number): string {
  return FRIEND_COLORS[index % FRIEND_COLORS.length];
}

export function friendInitial(name: string): string {
  return (name.trim()[0] ?? "?").toUpperCase();
}

export function SyncModal({
  roomCode, syncStatus, friends,
  onJoinRoom, onLeaveRoom,
  onAddFriend, onRemoveFriend,
  onClose,
}: SyncModalProps) {
  const [tab, setTab] = useState<"code" | "friends">("code");
  const [copied, setCopied] = useState(false);
  const [friendCode, setFriendCode] = useState("");
  const [friendName, setFriendName] = useState("");
  const [friendError, setFriendError] = useState("");
  const [showJoin, setShowJoin] = useState(false);
  const [joinInput, setJoinInput] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);

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

  const handleCopy = async () => {
    if (!roomCode) return;
    try { await navigator.clipboard.writeText(roomCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { window.getSelection()?.selectAllChildren(document.getElementById("sync-code-display")!); }
  };

  const handleAddFriend = () => {
    const code = friendCode.toUpperCase().trim();
    if (code.length < 4) { setFriendError("Enter a valid code."); return; }
    if (code === roomCode) { setFriendError("That's your own code!"); return; }
    if (friends.some((f) => f.code === code)) { setFriendError("Already following this person."); return; }
    onAddFriend(code, friendName);
    setFriendCode(""); setFriendName(""); setFriendError("");
  };

  const handleJoin = () => {
    const code = joinInput.toUpperCase().trim();
    if (code.length < 4) return;
    onJoinRoom(code);
    setShowJoin(false);
    setJoinInput("");
  };

  const status = STATUS_CONFIG[syncStatus];

  return (
    <div role="dialog" aria-modal="true" aria-label="Sync & friends"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 dark:bg-black/75" />

      <div className="relative w-full sm:max-w-sm mx-0 sm:mx-4 bg-white dark:bg-slate-900 sm:rounded-xl rounded-t-2xl border-t sm:border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-5 pt-5 pb-0 flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Sync & Friends</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${status.dotClass}`} />
              <span className={`text-xs font-medium ${status.textClass}`}>{status.label}</span>
            </div>
          </div>
          <button ref={closeRef} onClick={onClose} aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mx-5 mt-4 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          {(["code", "friends"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={[
                "flex-1 py-1.5 rounded text-xs font-medium transition-colors",
                tab === t ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300",
              ].join(" ")}>
              {t === "code" ? "My Code" : `Friends${friends.length > 0 ? ` (${friends.length})` : ""}`}
            </button>
          ))}
        </div>

        <div className="p-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">

          {/* ── My Code tab ── */}
          {tab === "code" && !showJoin && roomCode && (
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
                  Share this with a colleague so they can follow your session picks in real time.
                </p>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-col gap-1.5">
                <button onClick={() => setShowJoin(true)}
                  className="w-full py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Sync my picks with another device →
                </button>
                <button onClick={() => { onLeaveRoom(); onClose(); }}
                  className="w-full py-1.5 text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                  Reset sync room
                </button>
              </div>
            </>
          )}

          {/* Join a room (for true two-way sync between your own devices) */}
          {tab === "code" && showJoin && (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400 -mb-1">
                Enter <strong>your own code</strong> from another device to keep both in sync.
              </p>
              <input type="text" placeholder="ABC123" value={joinInput}
                onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === "Enter") handleJoin(); }}
                maxLength={8}
                className="w-full text-center text-2xl font-mono tracking-widest px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white uppercase placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowJoin(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Back
                </button>
                <button onClick={handleJoin}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                  Join
                </button>
              </div>
            </>
          )}

          {/* ── Friends tab ── */}
          {tab === "friends" && (
            <>
              {/* Existing friends */}
              {friends.length > 0 && (
                <div className="flex flex-col gap-2">
                  {friends.map((friend, i) => (
                    <div key={friend.code}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${friendColor(i)}`}>
                        {friendInitial(friend.name)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{friend.name}</p>
                        <p className="text-xs font-mono text-slate-400 dark:text-slate-500">{friend.code}</p>
                      </div>
                      <button onClick={() => onRemoveFriend(friend.code)}
                        aria-label={`Remove ${friend.name}`}
                        className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors text-lg leading-none">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add friend form */}
              <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Follow a friend
                </p>
                <input type="text" placeholder="Their sync code (e.g. HAWK3B)"
                  value={friendCode}
                  onChange={(e) => { setFriendCode(e.target.value.toUpperCase()); setFriendError(""); }}
                  maxLength={8}
                  className={[
                    "w-full text-sm font-mono px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border focus:outline-none focus:border-indigo-500 transition-colors text-slate-900 dark:text-white uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 dark:placeholder:text-slate-500",
                    friendError ? "border-red-400" : "border-slate-200 dark:border-slate-700",
                  ].join(" ")}
                />
                <input type="text" placeholder="Their name (e.g. Jake)"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddFriend(); }}
                  className="w-full text-sm px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 transition-colors text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                {friendError && <p className="text-xs text-red-500">{friendError}</p>}
                <button onClick={handleAddFriend}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                  Follow
                </button>
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                  You'll see their session picks on your schedule in real time.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
