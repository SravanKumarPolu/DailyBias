import { addDaysToDateString, daysBetweenDates, getLocalDateString } from "@/lib/dates";
import { loadRotationState } from "@/lib/biasRotation";
import { getAllBiases, type CognitiveBias } from "@/data/biases";
import type { RotationState } from "@/types/biasProgress";

export const WEEKLY_REVIEW_DAYS = 7;

export interface WeeklyBiasEntry {
  date: string;
  bias: CognitiveBias;
  /** User opened the app on this calendar day. */
  visited: boolean;
}

export interface WeeklyReviewData {
  entries: WeeklyBiasEntry[];
  /** Days in the window with a recorded visit. */
  activeDaysThisWeek: number;
  /** Unique biases in the 7-day rotation window. */
  biasesInWeek: number;
  /** True when fewer than 2 visit days exist in the window. */
  showEmptyHint: boolean;
  weekStart: string;
  weekEnd: string;
}

/** Read-only anchor for projecting rotation across calendar days. */
export function getRotationAnchor(
  state: RotationState,
  today = getLocalDateString(),
): { date: string; index: number } {
  const all = getAllBiases();
  const len = all.length || 1;
  const elapsed = daysBetweenDates(state.lastSeenDate, today);
  if (elapsed > 0) {
    return {
      date: today,
      index: (state.lastSeenIndex + elapsed) % len,
    };
  }
  return { date: state.lastSeenDate, index: state.lastSeenIndex % len };
}

export function biasIndexForDate(
  anchor: { date: string; index: number },
  targetDate: string,
  catalogLength: number,
): number {
  const offset = daysBetweenDates(targetDate, anchor.date);
  return ((anchor.index - offset) % catalogLength + catalogLength) % catalogLength;
}

function firstTrackedDay(state: RotationState): string {
  if (!state.activeDays.length) return state.lastSeenDate;
  return state.activeDays.reduce((min, d) => (d < min ? d : min));
}

/**
 * Derives the last 7 calendar days of biases from stored rotation state.
 * Does not mutate rotation or call resolveTodaysBias().
 */
export function buildWeeklyReview(
  today = getLocalDateString(),
): WeeklyReviewData {
  const all = getAllBiases();
  const weekEnd = today;
  const weekStart = addDaysToDateString(today, -(WEEKLY_REVIEW_DAYS - 1));

  const state = loadRotationState();
  if (!state || !all.length) {
    return {
      entries: [],
      activeDaysThisWeek: 0,
      biasesInWeek: 0,
      showEmptyHint: true,
      weekStart,
      weekEnd,
    };
  }

  const anchor = getRotationAnchor(state, today);
  const trackingStart = firstTrackedDay(state);
  const entries: WeeklyBiasEntry[] = [];

  for (let offset = WEEKLY_REVIEW_DAYS - 1; offset >= 0; offset--) {
    const date = addDaysToDateString(today, -offset);
    if (date < trackingStart) continue;

    const index = biasIndexForDate(anchor, date, all.length);
    entries.push({
      date,
      bias: all[index],
      visited: state.activeDays.includes(date),
    });
  }

  const activeDaysThisWeek = entries.filter((e) => e.visited).length;
  const uniqueBiasIds = new Set(entries.map((e) => e.bias.id));

  return {
    entries,
    activeDaysThisWeek,
    biasesInWeek: uniqueBiasIds.size,
    showEmptyHint: activeDaysThisWeek < 2,
    weekStart,
    weekEnd,
  };
}
