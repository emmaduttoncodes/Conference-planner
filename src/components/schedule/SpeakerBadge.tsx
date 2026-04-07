import { useState } from "react";
import type { Speaker } from "../../types";
import { TBD_REGEX } from "../../constants";

interface SpeakerBadgeProps {
  speaker: Speaker | undefined;
  speakerName: string;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 0 || !words[0]) return "?";
  return words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function SpeakerBadge({ speaker, speakerName }: SpeakerBadgeProps) {
  const [imgError, setImgError] = useState(false);
  const name = speaker?.name ?? speakerName;

  // Hide TBD speakers entirely
  if (TBD_REGEX.test(name) || !name.trim()) return null;

  const photoUrl = speaker?.photoUrl;
  const showImg = photoUrl && !imgError;

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs"
      title={
        [name, speaker?.company, speaker?.role].filter(Boolean).join(" — ")
      }
    >
      {showImg ? (
        <img
          src={photoUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="w-5 h-5 rounded-full object-cover shrink-0 bg-slate-600"
        />
      ) : (
        <span className="w-5 h-5 rounded-full bg-slate-600 text-white flex items-center justify-center text-[9px] font-semibold shrink-0">
          {getInitials(name)}
        </span>
      )}
      <span className="text-slate-300 truncate max-w-[130px]">{name}</span>
    </span>
  );
}
