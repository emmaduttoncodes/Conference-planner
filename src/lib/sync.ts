import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const ROOM_CODE_KEY = "aie-room-code";

// Avoids confusable characters (0/O, 1/I, 5/S)
const CODE_CHARS = "ABCDEFGHJKLMNPQRTUVWXYZ2346789";

export function generateRoomCode(): string {
  return Array.from(
    { length: 6 },
    () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  ).join("");
}

export function getSavedRoomCode(): string | null {
  return localStorage.getItem(ROOM_CODE_KEY);
}

export function saveRoomCode(code: string): void {
  localStorage.setItem(ROOM_CODE_KEY, code.toUpperCase().trim());
}

export function clearRoomCode(): void {
  localStorage.removeItem(ROOM_CODE_KEY);
}

export async function pushFavorites(roomCode: string, favorites: string[]): Promise<void> {
  await setDoc(
    doc(db, "rooms", roomCode),
    { favorites, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export function subscribeToRoom(
  roomCode: string,
  onUpdate: (favorites: string[]) => void,
  onError: (error: Error) => void
): () => void {
  return onSnapshot(
    doc(db, "rooms", roomCode),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.favorites)) {
          onUpdate(data.favorites as string[]);
        }
      } else {
        // New room — no data yet
        onUpdate([]);
      }
    },
    onError
  );
}
