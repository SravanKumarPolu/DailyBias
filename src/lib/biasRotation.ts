import { getLocalDateString } from "@/lib/dates";
import { safeStorage } from "@/lib/safeStorage";
import type { RotationResult, RotationState } from "@/types/biasProgress";
import type { CognitiveBias } from "@/data/biases";

let biasCatalog: CognitiveBias[] = [];

/**
 * Registers the complete bias catalog for use in rotation logic.
 * This should be called once during application initialization after the bias data is loaded.
 * @param biases - Array of all cognitive biases available in the application
 */
export function registerBiasCatalog(biases: CognitiveBias[]): void {
  biasCatalog = biases;
}

/**
 * Retrieves the complete catalog of registered cognitive biases.
 * @returns Array of all cognitive biases
 */
function getAllBiases(): CognitiveBias[] {
  return biasCatalog;
}

export const ROTATION_STORAGE_KEY = "debiasdaily.rotation.v2";
const LEGACY_STORAGE_KEY = "debiasdaily_progress";

export const ROTATION_CHANGED_EVENT = "bias-rotation-changed";

export const TOTAL_BIASES = 60;

interface LegacyDailyProgress {
  lastSeenDate: string;
  lastSeenIndex: number;
}

/**
 * Creates the default rotation state for first-time users.
 * Initializes the user on their first bias with basic progress tracking.
 * @param today - The current date in local date string format
 * @returns Initial rotation state with first bias
 */
function defaultState(today: string): RotationState {
  const all = getAllBiases();
  const first = all[0];
  return {
    lastSeenDate: today,
    lastSeenIndex: 0,
    lastSeenBiasId: first?.id ?? "",
    cycle: 1,
    seenBiasIds: first ? [first.id] : [],
    activeDays: [today],
    completedCycles: [],
    milestoneDismissedCycle: 0,
    phase: "foundation",
  };
}

function parseRotationState(raw: string): RotationState | null {
  try {
    const parsed = JSON.parse(raw) as Partial<RotationState>;
    if (
      typeof parsed.lastSeenDate !== "string" ||
      typeof parsed.lastSeenIndex !== "number" ||
      typeof parsed.lastSeenBiasId !== "string" ||
      typeof parsed.cycle !== "number" ||
      !Array.isArray(parsed.seenBiasIds) ||
      !Array.isArray(parsed.activeDays)
    ) {
      return null;
    }
    return {
      lastSeenDate: parsed.lastSeenDate,
      lastSeenIndex: parsed.lastSeenIndex,
      lastSeenBiasId: parsed.lastSeenBiasId,
      cycle: parsed.cycle,
      seenBiasIds: parsed.seenBiasIds.filter((id): id is string => typeof id === "string"),
      activeDays: parsed.activeDays.filter((d): d is string => typeof d === "string"),
      completedCycles: Array.isArray(parsed.completedCycles)
        ? parsed.completedCycles.filter((n): n is number => typeof n === "number")
        : [],
      milestoneDismissedCycle:
        typeof parsed.milestoneDismissedCycle === "number" ? parsed.milestoneDismissedCycle : 0,
      phase: parsed.phase === "foundation" ? "foundation" : "foundation",
    };
  } catch {
    return null;
  }
}

function migrateFromLegacy(legacy: LegacyDailyProgress): RotationState {
  const all = getAllBiases();
  const index = Math.max(0, Math.min(legacy.lastSeenIndex, all.length - 1));
  const seenBiasIds = all.slice(0, index + 1).map((b) => b.id);
  const bias = all[index];
  return {
    lastSeenDate: legacy.lastSeenDate,
    lastSeenIndex: index,
    lastSeenBiasId: bias?.id ?? "",
    cycle: 1,
    seenBiasIds,
    activeDays: [legacy.lastSeenDate],
    completedCycles: [],
    milestoneDismissedCycle: 0,
    phase: "foundation",
  };
}

function readLegacyProgress(): LegacyDailyProgress | null {
  const sources = [
    safeStorage.getItem(LEGACY_STORAGE_KEY),
    typeof window !== "undefined" ? window.localStorage.getItem(LEGACY_STORAGE_KEY) : null,
  ];
  for (const raw of sources) {
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as LegacyDailyProgress;
      if (
        typeof parsed.lastSeenDate === "string" &&
        typeof parsed.lastSeenIndex === "number"
      ) {
        return parsed;
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

function removeLegacyProgress(): void {
  safeStorage.removeItem(LEGACY_STORAGE_KEY);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

export function loadRotationState(): RotationState | null {
  const raw = safeStorage.getItem(ROTATION_STORAGE_KEY);
  if (raw) return parseRotationState(raw);

  const legacy = readLegacyProgress();
  if (legacy) {
    const migrated = migrateFromLegacy(legacy);
    saveRotationState(migrated);
    removeLegacyProgress();
    return migrated;
  }

  return null;
}

export function saveRotationState(state: RotationState): void {
  safeStorage.setItem(ROTATION_STORAGE_KEY, JSON.stringify(state));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ROTATION_CHANGED_EVENT));
  }
}

function recordVisit(state: RotationState, today: string, bias: CognitiveBias): RotationState {
  const activeDays = state.activeDays.includes(today)
    ? state.activeDays
    : [...state.activeDays, today];

  const seenBiasIds = state.seenBiasIds.includes(bias.id)
    ? state.seenBiasIds
    : [...state.seenBiasIds, bias.id];

  return {
    ...state,
    lastSeenBiasId: bias.id,
    activeDays,
    seenBiasIds,
  };
}

function isCycleComplete(state: RotationState): boolean {
  return state.seenBiasIds.length >= TOTAL_BIASES && state.milestoneDismissedCycle < state.cycle;
}

/**
 * Resolves today's bias based on date and user progress.
 * Advances the rotation on new days and updates progress tracking.
 * This function handles both first-time users and returning users with saved progress.
 * 
 * @returns Object containing:
 * - bias: The cognitive bias for today
 * - state: Current rotation state with progress information
 * - cycleJustCompleted: Boolean indicating if the current cycle just completed
 */
export function resolveTodaysBias(): RotationResult {
  const all = getAllBiases();
  const today = getLocalDateString();
  let state = loadRotationState();

  if (!state) {
    state = defaultState(today);
    saveRotationState(state);
    const bias = all[0];
    return {
      bias,
      state,
      cycleJustCompleted: isCycleComplete(state),
    };
  }

  let bias: CognitiveBias;

  if (state.lastSeenDate === today) {
    bias = all[state.lastSeenIndex % all.length];
    const next = recordVisit(state, today, bias);
    if (next !== state) {
      state = next;
      saveRotationState(state);
    }
    return { bias, state, cycleJustCompleted: isCycleComplete(state) };
  }

  const lastDate = new Date(state.lastSeenDate + "T00:00:00");
  const todayDate = new Date(today + "T00:00:00");
  const daysDiff = Math.max(
    1,
    Math.round((todayDate.getTime() - lastDate.getTime()) / 86400000),
  );

  const newIndex = (state.lastSeenIndex + daysDiff) % all.length;
  bias = all[newIndex];

  state = recordVisit(
    {
      ...state,
      lastSeenDate: today,
      lastSeenIndex: newIndex,
    },
    today,
    bias,
  );

  saveRotationState(state);
  return { bias, state, cycleJustCompleted: isCycleComplete(state) };
}

/** Acknowledge cycle completion — starts the next cycle. */
export function acknowledgeCycleMilestone(): RotationState | null {
  const state = loadRotationState();
  if (!state || state.seenBiasIds.length < TOTAL_BIASES) return state;

  const next: RotationState = {
    ...state,
    milestoneDismissedCycle: state.cycle,
    completedCycles: state.completedCycles.includes(state.cycle)
      ? state.completedCycles
      : [...state.completedCycles, state.cycle],
    cycle: state.cycle + 1,
    seenBiasIds: [],
    phase: "foundation",
  };

  saveRotationState(next);
  return next;
}

/** @deprecated Use resolveTodaysBias for progress-aware access. */
export function getTodaysBiasFromRotation(): CognitiveBias {
  return resolveTodaysBias().bias;
}
