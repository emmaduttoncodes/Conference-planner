import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { buildShareUrl } from "../../lib/shareSchedule";

interface ShareModalProps {
  favoriteIds: string[];
  onClose: () => void;
}

export function ShareModal({ favoriteIds, onClose }: ShareModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const shareUrl = buildShareUrl(favoriteIds);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Generate QR code
  useEffect(() => {
    QRCode.toDataURL(shareUrl, {
      width: 240,
      margin: 2,
      color: { dark: "#1e293b", light: "#f8fafc" },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [shareUrl]);

  // Focus close button, close on Escape
  useEffect(() => {
    closeRef.current?.focus();
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the input
      const input = document.getElementById("share-url-input") as HTMLInputElement | null;
      input?.select();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share My Schedule"
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 dark:bg-black/75" />

      <div
        className="relative w-full max-w-sm mx-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 flex flex-col items-center gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Share My Schedule</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {favoriteIds.length} session{favoriteIds.length !== 1 ? "s" : ""} · scan or copy the link
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

        {/* QR code */}
        {qrDataUrl ? (
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 p-2 bg-slate-50 dark:bg-slate-800">
            <img src={qrDataUrl} alt="QR code for share link" className="w-[200px] h-[200px]" />
          </div>
        ) : (
          <div className="w-[216px] h-[216px] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        )}

        {/* Copy URL */}
        <div className="w-full flex gap-2">
          <input
            id="share-url-input"
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 min-w-0 text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleCopy}
            className={[
              "shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              copied
                ? "bg-green-600 text-white"
                : "bg-indigo-600 hover:bg-indigo-500 text-white",
            ].join(" ")}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
          Open this link on another device to import these sessions into My Schedule.
        </p>
      </div>
    </div>
  );
}
