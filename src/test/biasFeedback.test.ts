import { describe, it, expect, beforeEach } from "vitest";
import {
  FEEDBACK_STORAGE_KEY,
  feedbackEntryKey,
  readFeedbackStore,
  saveFeedbackEntry,
} from "@/hooks/useBiasFeedback";
import { safeStorage } from "@/lib/safeStorage";

describe("bias feedback storage", () => {
  beforeEach(() => {
    safeStorage._resetForTests();
    safeStorage.removeItem(FEEDBACK_STORAGE_KEY);
  });

  it("uses date:biasId as the storage key", () => {
    expect(feedbackEntryKey("confirmation-bias", "2026-06-08")).toBe(
      "2026-06-08:confirmation-bias",
    );
  });

  it("persists useful rating and optional comment", () => {
    saveFeedbackEntry({
      biasId: "anchoring-bias",
      date: "2026-06-08",
      useful: true,
      comment: "Clear examples",
    });

    const store = readFeedbackStore();
    expect(store["2026-06-08:anchoring-bias"]).toEqual({
      biasId: "anchoring-bias",
      date: "2026-06-08",
      useful: true,
      comment: "Clear examples",
    });
  });

  it("overwrites feedback for the same bias and day", () => {
    saveFeedbackEntry({
      biasId: "anchoring-bias",
      date: "2026-06-08",
      useful: true,
    });
    saveFeedbackEntry({
      biasId: "anchoring-bias",
      date: "2026-06-08",
      useful: false,
      comment: "Too short",
    });

    const store = readFeedbackStore();
    expect(Object.keys(store)).toHaveLength(1);
    expect(store["2026-06-08:anchoring-bias"].useful).toBe(false);
    expect(store["2026-06-08:anchoring-bias"].comment).toBe("Too short");
  });
});
