import { useCallback, useEffect, useState } from "react";
import { getLocalDateString } from "@/lib/dates";
import { safeStorage } from "@/lib/safeStorage";

const STORAGE_KEY = "debiasdaily.quizCompletion";

const todayKey = () => getLocalDateString();

interface QuizCompletionRecord {
  date: string;
  biasId: string;
  score: number;
  total: number;
}

const read = (): QuizCompletionRecord | null => {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuizCompletionRecord;
    if (!parsed?.date) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const useQuizCompletion = (biasId?: string) => {
  const [record, setRecord] = useState<QuizCompletionRecord | null>(() => read());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setRecord(read());
    };
    const onCustom = () => setRecord(read());
    window.addEventListener("storage", onStorage);
    window.addEventListener("quiz-completion-changed", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("quiz-completion-changed", onCustom);
    };
  }, []);

  const isDoneToday =
    !!record &&
    record.date === todayKey() &&
    (biasId ? record.biasId === biasId : true);

  const markDone = useCallback(
    (data: { biasId: string; score: number; total: number }) => {
      const next: QuizCompletionRecord = { date: todayKey(), ...data };
      safeStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setRecord(next);
      window.dispatchEvent(new Event("quiz-completion-changed"));
    },
    [],
  );

  const reset = useCallback(() => {
    safeStorage.removeItem(STORAGE_KEY);
    setRecord(null);
    window.dispatchEvent(new Event("quiz-completion-changed"));
  }, []);

  return { isDoneToday, record: isDoneToday ? record : null, markDone, reset };
};
