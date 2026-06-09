import { useEffect, useState, useCallback } from "react";
import { safeStorage } from "@/lib/safeStorage";
import { trackBiasBookmarked, trackBiasUnbookmarked } from "@/lib/analytics";

const STORAGE_KEY = "debiasdaily.bookmarks.v1";

export interface Bookmark {
  biasId: string;
  savedAt: string; // ISO date
}

type Listener = (bookmarks: Bookmark[]) => void;
const listeners = new Set<Listener>();

function read(): Bookmark[] {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (b): b is Bookmark =>
        b && typeof b.biasId === "string" && typeof b.savedAt === "string"
    );
  } catch {
    return [];
  }
}

function write(bookmarks: Bookmark[]) {
  safeStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  listeners.forEach((l) => l(bookmarks));
}


export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => read());

  useEffect(() => {
    const listener: Listener = (next) => setBookmarks(next);
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setBookmarks(read());
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const isBookmarked = useCallback(
    (biasId: string) => bookmarks.some((b) => b.biasId === biasId),
    [bookmarks]
  );

  const toggleBookmark = useCallback((biasId: string) => {
    const current = read();
    const exists = current.some((b) => b.biasId === biasId);
    const next = exists
      ? current.filter((b) => b.biasId !== biasId)
      : [{ biasId, savedAt: new Date().toISOString() }, ...current];
    write(next);
    if (exists) {
      trackBiasUnbookmarked({ bias_id: biasId });
    } else {
      trackBiasBookmarked({ bias_id: biasId });
    }
    return !exists;
  }, []);

  const removeBookmark = useCallback((biasId: string) => {
    const had = read().some((b) => b.biasId === biasId);
    write(read().filter((b) => b.biasId !== biasId));
    if (had) trackBiasUnbookmarked({ bias_id: biasId });
  }, []);

  return { bookmarks, isBookmarked, toggleBookmark, removeBookmark };
}
