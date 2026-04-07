import { useState } from "react";

const PROFILE_KEY = "aie-profile";

export interface Profile {
  name: string;
  linkedInUrl: string;
}

function load(): Profile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw) as Profile;
  } catch { /* ignore */ }
  return { name: "", linkedInUrl: "" };
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(load);

  const save = (next: Profile) => {
    setProfile(next);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  };

  const hasProfile = !!(profile.linkedInUrl.trim());

  return { profile, save, hasProfile };
}
