import { describe, it, expect, beforeEach } from "vitest";
import { getLocalDateString } from "@/lib/dates";
import {
  loadRotationState,
  registerBiasCatalog,
  resolveTodaysBias,
  acknowledgeCycleMilestone,
  ROTATION_STORAGE_KEY,
  TOTAL_BIASES,
} from "@/lib/biasRotation";
import { getAllBiases } from "@/data/biases";
import { safeStorage } from "@/lib/safeStorage";

describe("biasRotation", () => {
  beforeEach(() => {
    safeStorage._resetForTests();
    safeStorage.removeItem(ROTATION_STORAGE_KEY);
    safeStorage.removeItem("debiasdaily_progress");
    registerBiasCatalog(getAllBiases());
  });

  it("starts at the first bias for a new user", () => {
    const { bias, state } = resolveTodaysBias();
    expect(bias.id).toBe(getAllBiases()[0].id);
    expect(state.seenBiasIds).toContain(bias.id);
    expect(state.cycle).toBe(1);
    expect(state.activeDays).toContain(getLocalDateString());
  });

  it("returns the same bias on the same calendar day", () => {
    const first = resolveTodaysBias();
    const second = resolveTodaysBias();
    expect(second.bias.id).toBe(first.bias.id);
    expect(second.state.seenBiasIds.length).toBe(1);
  });

  it("migrates legacy localStorage progress into v2 state", () => {
    const today = getLocalDateString();
    safeStorage.setItem(
      "debiasdaily_progress",
      JSON.stringify({ lastSeenDate: today, lastSeenIndex: 4 }),
    );

    const state = loadRotationState();
    expect(state).not.toBeNull();
    expect(state!.lastSeenIndex).toBe(4);
    expect(state!.seenBiasIds.length).toBe(5);
    expect(safeStorage.getItem("debiasdaily_progress")).toBeNull();
  });

  it("detects cycle completion after all biases are seen", () => {
    const all = getAllBiases();
    const today = getLocalDateString();
    safeStorage.setItem(
      ROTATION_STORAGE_KEY,
      JSON.stringify({
        lastSeenDate: today,
        lastSeenIndex: all.length - 1,
        lastSeenBiasId: all[all.length - 1].id,
        cycle: 1,
        seenBiasIds: all.slice(0, all.length - 1).map((b) => b.id),
        activeDays: [today],
        completedCycles: [],
        milestoneDismissedCycle: 0,
        phase: "foundation",
      }),
    );

    const { cycleJustCompleted, state } = resolveTodaysBias();
    expect(cycleJustCompleted).toBe(true);
    expect(state.seenBiasIds.length).toBe(TOTAL_BIASES);
  });

  it("starts the next cycle after acknowledging the milestone", () => {
    const all = getAllBiases();
    const today = getLocalDateString();
    safeStorage.setItem(
      ROTATION_STORAGE_KEY,
      JSON.stringify({
        lastSeenDate: today,
        lastSeenIndex: all.length - 1,
        lastSeenBiasId: all[all.length - 1].id,
        cycle: 1,
        seenBiasIds: all.map((b) => b.id),
        activeDays: [today],
        completedCycles: [],
        milestoneDismissedCycle: 0,
        phase: "foundation",
      }),
    );

    const next = acknowledgeCycleMilestone();
    expect(next!.cycle).toBe(2);
    expect(next!.seenBiasIds).toEqual([]);
    expect(next!.completedCycles).toContain(1);
    expect(next!.milestoneDismissedCycle).toBe(1);
  });
});
