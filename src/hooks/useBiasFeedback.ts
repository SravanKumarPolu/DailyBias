import { useCallback, useEffect, useMemo, useState } from "react";
import { getLocalDateString } from "@/lib/dates";
import { safeStorage } from "@/lib/safeStorage";
import { trackBiasFeedbackSubmitted } from "@/lib/analytics";
import type { BiasFeedbackEntry, BiasFeedbackStore } from "@/types/biasFeedback";

export const FEEDBACK_STORAGE_KEY = "debiasdaily.feedback.v1";
const CHANGED_EVENT = "feedback-changed";

export function feedbackEntryKey(biasId: string, date = getLocalDateString()): string {
  return `${date}:${biasId}`;
}

export function readFeedbackStore(): BiasFeedbackStore {
  try {
    const raw = safeStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as BiasFeedbackStore;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function writeFeedbackStore(store: BiasFeedbackStore): void {
  safeStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(store));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGED_EVENT));
  }
}

export function saveFeedbackEntry(entry: BiasFeedbackEntry): void {
  const store = readFeedbackStore();
  store[feedbackEntryKey(entry.biasId, entry.date)] = entry;
  writeFeedbackStore(store);
}

export function useBiasFeedback(biasId: string, date = getLocalDateString()) {
  const storageKey = useMemo(() => feedbackEntryKey(biasId, date), [biasId, date]);
  const [entry, setEntry] = useState<BiasFeedbackEntry | null>(
    () => readFeedbackStore()[storageKey] ?? null,
  );

  useEffect(() => {
    const sync = () => setEntry(readFeedbackStore()[storageKey] ?? null);
    window.addEventListener(CHANGED_EVENT, sync);
    const onStorage = (e: StorageEvent) => {
      if (e.key === FEEDBACK_STORAGE_KEY) sync();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGED_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, [storageKey]);

  const setUseful = useCallback(
    (useful: boolean) => {
      const next: BiasFeedbackEntry = {
        biasId,
        date,
        useful,
        comment: entry?.comment,
      };
      saveFeedbackEntry(next);
      setEntry(next);
      trackBiasFeedbackSubmitted({ bias_id: biasId, useful });
    },
    [biasId, date, entry?.comment],
  );

  const saveComment = useCallback(
    (comment: string) => {
  if (!entry) return;
      const trimmed = comment.trim();
      const next: BiasFeedbackEntry = {
        biasId,
        date,
        useful: entry.useful,
        comment: trimmed || undefined,
      };
      saveFeedbackEntry(next);
      setEntry(next);
    },
    [biasId, date, entry],
  );

  return { entry, setUseful, saveComment };
}
