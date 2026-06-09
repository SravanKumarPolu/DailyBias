import { useCallback, useEffect, useState } from "react";
import { getLocalDateString, getYesterdayDateString } from "@/lib/dates";
import { safeStorage } from "@/lib/safeStorage";

const STORAGE_KEY = "debiasdaily.streak.v1";

interface StreakRecord {
  count: number;
  lastVisit: string; // YYYY-MM-DD
}

const todayKey = () => getLocalDateString();

const yesterdayKey = () => getYesterdayDateString();

const read = (): StreakRecord => {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, lastVisit: "" };
    const parsed = JSON.parse(raw) as StreakRecord;
    if (typeof parsed?.count !== "number" || typeof parsed?.lastVisit !== "string") {
      return { count: 0, lastVisit: "" };
    }
    return parsed;
  } catch {
    return { count: 0, lastVisit: "" };
  }
};

const write = (rec: StreakRecord) => {
  safeStorage.setItem(STORAGE_KEY, JSON.stringify(rec));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("streak-changed"));
  }
};

/**
 * Apply the daily-visit rule and return the next record.
 * Exposed for unit tests so the logic can be exercised deterministically.
 */
export function computeNextStreak(
  current: StreakRecord,
  today: string,
  yesterday: string,
): StreakRecord {
  if (current.lastVisit === today) {
    return current.count === 0 ? { count: 1, lastVisit: today } : current;
  }
  if (current.lastVisit === yesterday) {
    return { count: current.count + 1, lastVisit: today };
  }
  return { count: 1, lastVisit: today };
}


/**
 * Tracks a daily-visit streak persisted to localStorage.
 * - Same day: no change.
 * - Yesterday: increment.
 * - Older / never: reset to 1.
 */
export function useStreak() {
  const [record, setRecord] = useState<StreakRecord>(() => read());

  useEffect(() => {
    const current = read();
    const next = computeNextStreak(current, todayKey(), yesterdayKey());
    if (next !== current) write(next);
    setRecord(next);


    const sync = () => setRecord(read());
    window.addEventListener("streak-changed", sync);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) sync();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("streak-changed", sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const reset = useCallback(() => {
    write({ count: 0, lastVisit: "" });
  }, []);

  return { streak: record.count, lastVisit: record.lastVisit, reset };
}
