export type Day = "April 8" | "April 9" | "April 10";
export type Room =
  | "Keynote"
  | "Abbey"
  | "Fleming"
  | "Moore"
  | "St. James"
  | "Westminster";
export type SessionType =
  | "keynote"
  | "talk"
  | "workshop"
  | "panel"
  | "break"
  | "expo";

export interface Talk {
  id: string;
  title: string;
  description?: string;
  day: Day;
  time: string;
  room: string;
  type: SessionType;
  track?: string;
  speakers: string[];
}

export interface Speaker {
  id: string;
  name: string;
  bio?: string;
  photoUrl?: string;
  company?: string;
  role?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export type SpeakerMap = Record<string, Speaker>;

export interface Filters {
  day: Day | "All";
  type: SessionType | "All";
  track: string | "All";
}

export type View = "schedule" | "my-schedule";
