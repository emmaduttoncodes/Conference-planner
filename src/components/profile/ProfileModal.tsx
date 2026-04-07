import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import type { Profile } from "../../hooks/useProfile";

interface ProfileModalProps {
  profile: Profile;
  onSave: (profile: Profile) => void;
  onClose: () => void;
}

/** Normalise a LinkedIn input to a full URL */
function normaliseLinkedIn(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  // Already a full URL
  if (trimmed.startsWith("http")) return trimmed;
  // Handle "linkedin.com/in/..." or "in/username" or just "username"
  if (trimmed.includes("linkedin.com")) return `https://${trimmed}`;
  if (trimmed.startsWith("in/")) return `https://www.linkedin.com/${trimmed}`;
  // Assume bare username
  return `https://www.linkedin.com/in/${trimmed}`;
}

export function ProfileModal({ profile, onSave, onClose }: ProfileModalProps) {
  const [editing, setEditing] = useState(!profile.linkedInUrl);
  const [nameInput, setNameInput] = useState(profile.name);
  const [urlInput, setUrlInput] = useState(profile.linkedInUrl);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const linkedInUrl = normaliseLinkedIn(profile.linkedInUrl);

  // Generate QR when showing QR view
  useEffect(() => {
    if (editing || !linkedInUrl) return;
    QRCode.toDataURL(linkedInUrl, {
      width: 280,
      margin: 2,
      color: { dark: "#0a0a23", light: "#ffffff" },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [editing, linkedInUrl]);

  // Focus management
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    } else {
      closeRef.current?.focus();
    }
  }, [editing]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleSave = () => {
    const url = normaliseLinkedIn(urlInput);
    if (!url) {
      setError("Please enter your LinkedIn profile URL or username.");
      return;
    }
    setError("");
    onSave({ name: nameInput.trim(), linkedInUrl: url });
    setEditing(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="My LinkedIn QR"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 dark:bg-black/75" />

      <div
        className="relative w-full sm:max-w-sm mx-0 sm:mx-4 bg-white dark:bg-slate-900 sm:rounded-xl rounded-t-2xl border-t sm:border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {editing ? (
          /* ── Edit / Setup view ── */
          <div className="p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">My LinkedIn</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Save your profile to share a QR code at the conference
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Your name <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  LinkedIn URL or username
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="linkedin.com/in/yourname"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                  className={[
                    "w-full text-sm px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors",
                    error ? "border-red-400" : "border-slate-200 dark:border-slate-700",
                  ].join(" ")}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Save & show QR code
            </button>
          </div>
        ) : (
          /* ── QR display view ── */
          <div className="p-6 flex flex-col items-center gap-5">
            <div className="w-full flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {profile.name || "My LinkedIn"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[220px]">
                  {linkedInUrl.replace("https://www.", "").replace("https://", "")}
                </p>
              </div>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* QR code — white background always so it scans reliably */}
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="LinkedIn QR code"
                  className="w-[240px] h-[240px] block"
                />
              ) : (
                <div className="w-[240px] h-[240px] bg-slate-100 dark:bg-slate-800 animate-pulse" />
              )}
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
              Ask someone to scan this to connect on LinkedIn
            </p>

            {/* LinkedIn blue button linking directly */}
            <div className="w-full flex gap-2">
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0A66C2] hover:bg-[#0958a8] text-white text-sm font-semibold transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Open profile
              </a>
              <button
                onClick={() => {
                  setUrlInput(profile.linkedInUrl);
                  setNameInput(profile.name);
                  setEditing(true);
                }}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
