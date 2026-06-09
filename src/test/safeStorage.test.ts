import { describe, it, expect, beforeEach, vi } from "vitest";
import { safeStorage, isStorageAvailable } from "@/lib/safeStorage";

describe("safeStorage", () => {
  beforeEach(() => {
    safeStorage._resetForTests();
    try {
      window.localStorage.clear();
    } catch {
      /* ignore */
    }
  });

  it("round-trips values when localStorage is available", () => {
    expect(isStorageAvailable()).toBe(true);
    safeStorage.setItem("k", "v");
    expect(safeStorage.getItem("k")).toBe("v");
    safeStorage.removeItem("k");
    expect(safeStorage.getItem("k")).toBeNull();
  });

  it("falls back to in-memory storage when setItem throws (private browsing)", () => {
    const setSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
    const getSpy = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => null);

    // Reset cache so probe re-runs and registers the failure.
    safeStorage._resetForTests();
    expect(isStorageAvailable()).toBe(false);

    // Should not throw, should round-trip via memory.
    expect(() => safeStorage.setItem("bookmark", "data")).not.toThrow();
    expect(safeStorage.getItem("bookmark")).toBe("data");
    safeStorage.removeItem("bookmark");
    expect(safeStorage.getItem("bookmark")).toBeNull();

    setSpy.mockRestore();
    getSpy.mockRestore();
  });
});
