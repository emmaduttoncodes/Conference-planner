import { useState, useEffect, useCallback, useRef } from "react";
import {
  pushFavorites,
  subscribeToRoom,
  getSavedRoomCode,
  saveRoomCode,
  clearRoomCode,
  generateRoomCode,
} from "../lib/sync";
import { FAVORITES_KEY } from "../constants";

export type SyncStatus = "idle" | "connecting" | "synced" | "error";

function loadLocal(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function useSyncedFavorites() {
  const [favorites, setFavorites] = useState<string[]>(loadLocal);
  const [roomCode, setRoomCode] = useState<string | null>(getSavedRoomCode);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const suppressNextRemote = useRef(false);

  // Auto-create a room on first use so sync is always on
  useEffect(() => {
    if (getSavedRoomCode()) return; // already have one
    const code = generateRoomCode();
    saveRoomCode(code);
    const initial = loadLocal();
    // Fire-and-forget — the subscription below will confirm it worked
    pushFavorites(code, initial).catch(() => {});
    setRoomCode(code);
  }, []);

  // Subscribe to Firestore whenever we have a room code
  useEffect(() => {
    if (!roomCode) {
      setSyncStatus("idle");
      return;
    }
    setSyncStatus("connecting");

    const unsubscribe = subscribeToRoom(
      roomCode,
      (remoteFavorites) => {
        setSyncStatus("synced");
        if (suppressNextRemote.current) {
          suppressNextRemote.current = false;
          return;
        }
        setFavorites(remoteFavorites);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(remoteFavorites));
      },
      () => setSyncStatus("error")
    );

    return unsubscribe;
  }, [roomCode]);

  const writeFavorites = useCallback(
    (next: string[]) => {
      setFavorites(next);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      if (roomCode) {
        suppressNextRemote.current = true;
        pushFavorites(roomCode, next).catch(() => {
          suppressNextRemote.current = false;
        });
      }
    },
    [roomCode]
  );

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const toggle = useCallback(
    (id: string) => {
      writeFavorites(
        favorites.includes(id)
          ? favorites.filter((f) => f !== id)
          : [...favorites, id]
      );
    },
    [favorites, writeFavorites]
  );

  // createRoom is now rarely needed (auto-created), but kept for the "reset" case
  const createRoom = useCallback(async (): Promise<string> => {
    const code = generateRoomCode();
    saveRoomCode(code);
    await pushFavorites(code, favorites);
    setRoomCode(code);
    return code;
  }, [favorites]);

  const joinRoom = useCallback((code: string) => {
    const normalized = code.toUpperCase().trim();
    saveRoomCode(normalized);
    setRoomCode(normalized);
  }, []);

  const leaveRoom = useCallback(() => {
    clearRoomCode();
    setRoomCode(null);
    setSyncStatus("idle");
  }, []);

  return {
    favorites,
    isFavorite,
    toggle,
    roomCode,
    syncStatus,
    createRoom,
    joinRoom,
    leaveRoom,
  };
}
