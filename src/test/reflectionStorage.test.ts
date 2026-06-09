import { describe, it, expect, beforeEach } from "vitest";
import { getAllBiases } from "@/data/biases";
import { registerBiasCatalog, ROTATION_STORAGE_KEY } from "@/lib/biasRotation";
import {
  countReflectionsInWeek,
  getReflectionText,
  migrateReflectionStore,
  readReflectionStore,
  REFLECTION_STORAGE_KEY,
  saveReflectionText,
} from "@/lib/reflectionStorage";
import { buildWeeklyReview } from "@/lib/weeklyReview";
import { reflectionEntryKey } from "@/types/reflection";
import { safeStorage } from "@/lib/safeStorage";

describe("reflectionStorage", () => {
  beforeEach(() => {
    safeStorage._resetForTests();
    safeStorage.removeItem(REFLECTION_STORAGE_KEY);
    safeStorage.removeItem(ROTATION_STORAGE_KEY);
    registerBiasCatalog(getAllBiases());
  });

  it("migrates legacy biasId-only keys to cycle 1", () => {
    safeStorage.setItem(
      REFLECTION_STORAGE_KEY,
      JSON.stringify({ "confirmation-bias": "Cycle 1 note" }),
    );

    const store = readReflectionStore();
    expect(store).toEqual({ "1:confirmation-bias": "Cycle 1 note" });
    expect(JSON.parse(safeStorage.getItem(REFLECTION_STORAGE_KEY) as string)).toEqual({
      "1:confirmation-bias": "Cycle 1 note",
    });
  });

  it("migrateReflectionStore preserves cycle-prefixed keys", () => {
    const input = {
      "confirmation-bias": "legacy",
      "2:anchoring-bias": "cycle two",
    };
    const { store, migrated } = migrateReflectionStore(input);
    expect(migrated).toBe(true);
    expect(store).toEqual({
      "1:confirmation-bias": "legacy",
      "2:anchoring-bias": "cycle two",
    });
  });

  it("cycle 2 same bias starts empty while cycle 1 is preserved", () => {
    saveReflectionText(1, "confirmation-bias", "First cycle thought");
    expect(getReflectionText(1, "confirmation-bias")).toBe("First cycle thought");
    expect(getReflectionText(2, "confirmation-bias")).toBe("");
  });

  it("saving cycle 2 does not overwrite cycle 1", () => {
    saveReflectionText(1, "confirmation-bias", "Cycle 1");
    saveReflectionText(2, "confirmation-bias", "Cycle 2");

    expect(getReflectionText(1, "confirmation-bias")).toBe("Cycle 1");
    expect(getReflectionText(2, "confirmation-bias")).toBe("Cycle 2");
  });

  it("empty save deletes only the current cycle+bias entry", () => {
    saveReflectionText(1, "confirmation-bias", "Keep me");
    saveReflectionText(2, "confirmation-bias", "Remove me");
    saveReflectionText(2, "confirmation-bias", "   ");

    const store = readReflectionStore();
    expect(store[reflectionEntryKey(1, "confirmation-bias")]).toBe("Keep me");
    expect(store[reflectionEntryKey(2, "confirmation-bias")]).toBeUndefined();
  });

  it("weekly review counts only reflections for the current cycle", () => {
    const today = "2026-06-08";
    const all = getAllBiases();
    const bias = all[0];

    safeStorage.setItem(
      ROTATION_STORAGE_KEY,
      JSON.stringify({
        lastSeenDate: today,
        lastSeenIndex: 0,
        lastSeenBiasId: bias.id,
        cycle: 2,
        seenBiasIds: [bias.id],
        activeDays: [today],
        completedCycles: [1],
        milestoneDismissedCycle: 1,
        phase: "foundation",
      }),
    );

    saveReflectionText(1, bias.id, "Old cycle reflection");
    saveReflectionText(2, bias.id, "");

    const review = buildWeeklyReview(today);
    expect(countReflectionsInWeek(review.entries, 1)).toBe(1);
    expect(countReflectionsInWeek(review.entries, 2)).toBe(0);
  });
});
