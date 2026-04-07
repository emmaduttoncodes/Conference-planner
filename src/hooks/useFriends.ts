import { useState, useEffect, useCallback } from "react";
import { subscribeToRoom } from "../lib/sync";

const FRIENDS_KEY = "aie-friends";

export interface Friend {
  code: string;
  name: string;
}

function loadFriends(): Friend[] {
  try {
    const raw = localStorage.getItem(FRIENDS_KEY);
    return raw ? (JSON.parse(raw) as Friend[]) : [];
  } catch {
    return [];
  }
}

function saveFriends(friends: Friend[]) {
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
}

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>(loadFriends);
  // Map of code → set of favorited session IDs
  const [friendFavorites, setFriendFavorites] = useState<Map<string, Set<string>>>(new Map());

  // Subscribe to each friend's room in real time
  useEffect(() => {
    if (friends.length === 0) {
      setFriendFavorites(new Map());
      return;
    }

    const unsubscribes = friends.map((friend) =>
      subscribeToRoom(
        friend.code,
        (ids) => {
          setFriendFavorites((prev) => {
            const next = new Map(prev);
            next.set(friend.code, new Set(ids));
            return next;
          });
        },
        () => {} // ignore per-friend errors silently
      )
    );

    return () => unsubscribes.forEach((u) => u());
  }, [friends]);

  const addFriend = useCallback((code: string, name: string) => {
    const normalized = code.toUpperCase().trim();
    setFriends((prev) => {
      if (prev.some((f) => f.code === normalized)) return prev;
      const next = [...prev, { code: normalized, name: name.trim() || normalized }];
      saveFriends(next);
      return next;
    });
  }, []);

  const removeFriend = useCallback((code: string) => {
    setFriends((prev) => {
      const next = prev.filter((f) => f.code !== code);
      saveFriends(next);
      return next;
    });
    setFriendFavorites((prev) => {
      const next = new Map(prev);
      next.delete(code);
      return next;
    });
  }, []);

  /** Returns the list of friends attending a given session */
  const friendsForSession = useCallback(
    (sessionId: string): Friend[] => {
      return friends.filter((f) => friendFavorites.get(f.code)?.has(sessionId));
    },
    [friends, friendFavorites]
  );

  return { friends, friendFavorites, addFriend, removeFriend, friendsForSession };
}
