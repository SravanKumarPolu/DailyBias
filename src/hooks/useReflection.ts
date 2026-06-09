import { useCallback, useEffect, useState } from "react";
import { trackReflectionSaved } from "@/lib/analytics";
import {
  getReflectionText,
  REFLECTION_CHANGED_EVENT,
  REFLECTION_STORAGE_KEY,
  saveReflectionText,
} from "@/lib/reflectionStorage";

export function useReflection(biasId: string, cycle: number) {
  const [text, setText] = useState(() => getReflectionText(cycle, biasId));

  useEffect(() => {
    const sync = () => setText(getReflectionText(cycle, biasId));
    window.addEventListener(REFLECTION_CHANGED_EVENT, sync);
    const onStorage = (e: StorageEvent) => {
      if (e.key === REFLECTION_STORAGE_KEY) sync();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(REFLECTION_CHANGED_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, [biasId, cycle]);

  const save = useCallback(
    (value: string) => {
      const { trimmed, hadContent } = saveReflectionText(cycle, biasId, value);
      setText(trimmed);
      if (trimmed && !hadContent) {
        trackReflectionSaved({ bias_id: biasId });
      }
    },
    [biasId, cycle],
  );

  return { text, save };
}
