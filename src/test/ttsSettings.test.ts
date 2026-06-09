import { describe, it, expect, beforeEach } from "vitest";
import {
  VOLUME_KEY,
  DEFAULT_VOLUME,
  clampVolume,
  readStoredVolume,
} from "@/hooks/useTTSSettings";
import { safeStorage } from "@/lib/safeStorage";

describe("TTS volume settings", () => {
  beforeEach(() => {
    safeStorage._resetForTests();
    safeStorage.removeItem(VOLUME_KEY);
  });

  it("defaults to 50% when unset", () => {
    expect(readStoredVolume()).toBe(DEFAULT_VOLUME);
    expect(DEFAULT_VOLUME).toBe(0.5);
  });

  it("persists volume between 0 and 1", () => {
    safeStorage.setItem(VOLUME_KEY, "0.7");
    expect(readStoredVolume()).toBe(0.7);
  });

  it("clamps invalid values to the valid range", () => {
    expect(clampVolume(1.5)).toBe(1);
    expect(clampVolume(-0.2)).toBe(0);
    expect(clampVolume(Number.NaN)).toBe(DEFAULT_VOLUME);
  });

  it("rounds to 10% steps via clampVolume", () => {
    expect(clampVolume(0.54)).toBe(0.5);
    expect(clampVolume(0.56)).toBe(0.6);
  });
});
