/**
 * Safe wrapper around localStorage that survives:
 * - SSR (no window)
 * - Private browsing / quota errors (Safari throws on setItem)
 * - Disabled storage (cookies/storage blocked)
 *
 * Falls back to an in-memory Map so callers can keep using the same API and
 * the UI never crashes on read/write.
 */
const memory = new Map<string, string>();

let cachedAvailable: boolean | null = null;

export function isStorageAvailable(): boolean {
  if (cachedAvailable !== null) return cachedAvailable;
  if (typeof window === "undefined") return (cachedAvailable = false);
  try {
    const probe = "__debiasdaily_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return (cachedAvailable = true);
  } catch {
    return (cachedAvailable = false);
  }
}

export const safeStorage = {
  getItem(key: string): string | null {
    if (isStorageAvailable()) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        /* fall through */
      }
    }
    return memory.has(key) ? (memory.get(key) as string) : null;
  },
  setItem(key: string, value: string): void {
    if (isStorageAvailable()) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        /* fall through to memory */
      }
    }
    memory.set(key, value);
  },
  removeItem(key: string): void {
    if (isStorageAvailable()) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    }
    memory.delete(key);
  },
  /** Test helper — resets the in-memory fallback + availability cache. */
  _resetForTests() {
    memory.clear();
    cachedAvailable = null;
  },
};
