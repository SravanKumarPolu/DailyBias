import { describe, it, expect, beforeEach } from "vitest";
import { computeNextStreak } from "@/hooks/useStreak";
import { safeStorage } from "@/lib/safeStorage";

const KEY = "debiasdaily.streak.v1";

describe("streak logic", () => {
  beforeEach(() => {
    safeStorage._resetForTests();
    safeStorage.removeItem(KEY);
  });

  it("starts a fresh streak at 1 when there is no history", () => {
    const next = computeNextStreak({ count: 0, lastVisit: "" }, "2026-06-01", "2026-05-31");
    expect(next).toEqual({ count: 1, lastVisit: "2026-06-01" });
  });

  it("does not increment when visiting again on the same day", () => {
    const current = { count: 3, lastVisit: "2026-06-01" };
    const next = computeNextStreak(current, "2026-06-01", "2026-05-31");
    expect(next).toBe(current); // same reference → no write
    expect(next.count).toBe(3);
  });

  it("increments by exactly one when last visit was yesterday", () => {
    const next = computeNextStreak(
      { count: 4, lastVisit: "2026-05-31" },
      "2026-06-01",
      "2026-05-31",
    );
    expect(next).toEqual({ count: 5, lastVisit: "2026-06-01" });
  });

  it("resets to 1 when the user skips a day", () => {
    const next = computeNextStreak(
      { count: 9, lastVisit: "2026-05-29" },
      "2026-06-01",
      "2026-05-31",
    );
    expect(next).toEqual({ count: 1, lastVisit: "2026-06-01" });
  });

  it("persists across reads via safeStorage", () => {
    safeStorage.setItem(KEY, JSON.stringify({ count: 7, lastVisit: "2026-06-01" }));
    const stored = JSON.parse(safeStorage.getItem(KEY) as string);
    const next = computeNextStreak(stored, "2026-06-01", "2026-05-31");
    expect(next.count).toBe(7); // unchanged on same-day refresh
  });
});
