import { useCallback, useEffect, useState } from "react";
import {
  acknowledgeCycleMilestone,
  loadRotationState,
  ROTATION_CHANGED_EVENT,
  TOTAL_BIASES,
} from "@/lib/biasRotation";
import type { RotationState } from "@/types/biasProgress";

export function useBiasProgress() {
  const [state, setState] = useState<RotationState | null>(() => loadRotationState());

  useEffect(() => {
    const sync = () => setState(loadRotationState());
    window.addEventListener(ROTATION_CHANGED_EVENT, sync);
    return () => window.removeEventListener(ROTATION_CHANGED_EVENT, sync);
  }, []);

  const seenCount = state?.seenBiasIds.length ?? 0;
  const cycle = state?.cycle ?? 1;
  const daysActive = state?.activeDays.length ?? 0;
  const progressPercent = Math.round((seenCount / TOTAL_BIASES) * 100);
  const isCycleComplete =
    seenCount >= TOTAL_BIASES && (state?.milestoneDismissedCycle ?? 0) < cycle;

  const dismissMilestone = useCallback(() => {
    const next = acknowledgeCycleMilestone();
    setState(next);
  }, []);

  return {
    state,
    seenCount,
    totalBiases: TOTAL_BIASES,
    cycle,
    daysActive,
    progressPercent,
    isCycleComplete,
    dismissMilestone,
  };
}
