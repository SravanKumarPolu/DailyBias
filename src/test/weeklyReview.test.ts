import { describe, it, expect, beforeEach } from "vitest";
import { registerBiasCatalog, ROTATION_STORAGE_KEY } from "@/lib/biasRotation";
import {
  biasIndexForDate,
  buildWeeklyReview,
  getRotationAnchor,
} from "@/lib/weeklyReview";
import { getAllBiases } from "@/data/biases";
import { safeStorage } from "@/lib/safeStorage";
import { addDaysToDateString } from "@/lib/dates";

describe("weeklyReview", () => {
  beforeEach(() => {
    safeStorage._resetForTests();
    safeStorage.removeItem(ROTATION_STORAGE_KEY);
    registerBiasCatalog(getAllBiases());
  });

  it("projects sequential biases across consecutive days", () => {
    const today = "2026-06-08";
    const all = getAllBiases();
    safeStorage.setItem(
      ROTATION_STORAGE_KEY,
      JSON.stringify({
        lastSeenDate: today,
        lastSeenIndex: 3,
        lastSeenBiasId: all[3].id,
        cycle: 1,
        seenBiasIds: all.slice(0, 4).map((b) => b.id),
        activeDays: ["2026-06-06", "2026-06-07", today],
        completedCycles: [],
        milestoneDismissedCycle: 0,
        phase: "foundation",
      }),
    );

    const review = buildWeeklyReview(today);
    expect(review.entries.length).toBe(3);
    expect(review.entries[0].bias.id).toBe(all[1].id);
    expect(review.entries[2].bias.id).toBe(all[3].id);
    expect(review.activeDaysThisWeek).toBe(3);
    expect(review.showEmptyHint).toBe(false);
  });

  it("uses effective anchor when stored date is before today", () => {
    const today = "2026-06-10";
    const all = getAllBiases();
    const state = {
      lastSeenDate: "2026-06-08",
      lastSeenIndex: 5,
      lastSeenBiasId: all[5].id,
      cycle: 1,
      seenBiasIds: [all[5].id],
      activeDays: ["2026-06-08"],
      completedCycles: [],
      milestoneDismissedCycle: 0,
      phase: "foundation" as const,
    };

    const anchor = getRotationAnchor(state, today);
    expect(anchor.index).toBe(7);

    const indexForToday = biasIndexForDate(anchor, today, all.length);
    expect(all[indexForToday].id).toBe(all[7].id);
  });

  it("shows empty hint for users with only one active day", () => {
    const today = "2026-06-08";
    const all = getAllBiases();
    safeStorage.setItem(
      ROTATION_STORAGE_KEY,
      JSON.stringify({
        lastSeenDate: today,
        lastSeenIndex: 0,
        lastSeenBiasId: all[0].id,
        cycle: 1,
        seenBiasIds: [all[0].id],
        activeDays: [today],
        completedCycles: [],
        milestoneDismissedCycle: 0,
        phase: "foundation",
      }),
    );

    const review = buildWeeklyReview(today);
    expect(review.entries.length).toBe(1);
    expect(review.showEmptyHint).toBe(true);
  });

  it("omits days before the user's first tracked visit", () => {
    const today = "2026-06-08";
    const yesterday = addDaysToDateString(today, -1);
    const all = getAllBiases();
    safeStorage.setItem(
      ROTATION_STORAGE_KEY,
      JSON.stringify({
        lastSeenDate: today,
        lastSeenIndex: 0,
        lastSeenBiasId: all[0].id,
        cycle: 1,
        seenBiasIds: [all[0].id],
        activeDays: [today],
        completedCycles: [],
        milestoneDismissedCycle: 0,
        phase: "foundation",
      }),
    );

    const review = buildWeeklyReview(today);
    expect(review.entries.every((e) => e.date >= today)).toBe(true);
    expect(review.entries.some((e) => e.date === yesterday)).toBe(false);
  });
});
