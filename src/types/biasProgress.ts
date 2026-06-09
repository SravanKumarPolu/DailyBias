/** Learning cycle phase — Phase A uses foundation only. */
export type LearningPhase = "foundation";

export interface RotationState {
  lastSeenDate: string;
  lastSeenIndex: number;
  lastSeenBiasId: string;
  /** Current cycle (1 = first pass through all biases). */
  cycle: number;
  /** Unique bias IDs seen in the current cycle. */
  seenBiasIds: string[];
  /** Local calendar dates (YYYY-MM-DD) the user opened the app. */
  activeDays: string[];
  /** Cycles the user has fully completed. */
  completedCycles: number[];
  /** Cycle for which the completion modal was dismissed. */
  milestoneDismissedCycle: number;
  phase: LearningPhase;
}

export interface RotationResult {
  bias: import("@/data/biases").CognitiveBias;
  state: RotationState;
  /** True when the 60th unique bias was just seen and the modal has not been dismissed. */
  cycleJustCompleted: boolean;
}

export interface CycleMilestoneStats {
  daysActive: number;
  streak: number;
  bookmarksCount: number;
  cycle: number;
}
