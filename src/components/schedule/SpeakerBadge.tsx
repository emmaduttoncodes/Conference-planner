import { useState } from "react";
import type { Speaker } from "../../types";
import { TBD_REGEX } from "../../constants";

interface SpeakerBadgeProps {
  speaker: Speaker | undefined;
  speakerName: string;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function SpeakerBadge({ speaker, speakerName }: SpeakerBadgeProps) {
  const [imgError, setImgError] = useState(false);
  const name = speaker?.name ?? speakerName;
  const isTbd = TBD_REGEX.test(name);
  const photoUrl = speaker?.photoUrl;
  const showImg = photoUrl && !imgError && !isTbd;

  return (
    <span
      className="inline-flex items-center gap-1 text-xs"
      style={{ opacity: isTbd ? 0.5 : 1 }}
      title={`${name}${speaker?.company ? ` — ${speaker.company}` : ""}${speaker?.role ? `, ${speaker.role}` : ""}`}
    >
      {showImg ? (
        <img
          src={photoUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="w-5 h-5 rounded-full object-cover shrink-0"
        />
      ) : (
        <span className="w-5 h-5 rounded-full bg-slate-600 text-white flex items-center justify-center text-[9px] font-semibold shrink-0">
          {getInitials(name)}
        </span>
      )}
      <span className="text-slate-300 truncate max-w-[120px]">{name}</span>
    </span>
  );
}
