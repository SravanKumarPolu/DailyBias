import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  _resetAnalyticsForTests,
  getAnalyticsPageName,
  isAnalyticsEnabled,
  trackBiasFeedbackSubmitted,
  trackBiasShared,
  trackBiasViewed,
  trackPageView,
} from "@/lib/analytics";

describe("analytics", () => {
  beforeEach(() => {
    _resetAnalyticsForTests();
    vi.unstubAllEnvs();
    delete window.gtag;
    window.dataLayer = [];
  });

  it("is disabled when VITE_GA_MEASUREMENT_ID is empty", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "");
    expect(isAnalyticsEnabled()).toBe(false);
    const gtag = vi.fn();
    window.gtag = gtag;
    trackBiasViewed({
      bias_id: "confirmation-bias",
      bias_title: "Confirmation Bias",
      category: "Core Thinking",
    });
    expect(gtag).not.toHaveBeenCalled();
  });

  it("maps routes to page names", () => {
    expect(getAnalyticsPageName("/")).toBe("Today");
    expect(getAnalyticsPageName("/today")).toBe("Today");
    expect(getAnalyticsPageName("/bias/anchoring-bias")).toBe("Bias Detail");
    expect(getAnalyticsPageName("/quiz")).toBe("Quiz");
    expect(getAnalyticsPageName("/weekly-review")).toBe("Weekly Review");
    expect(getAnalyticsPageName("/saved")).toBe("Saved");
    expect(getAnalyticsPageName("/settings")).toBe("Settings");
    expect(getAnalyticsPageName("/about")).toBe("About");
    expect(getAnalyticsPageName("/unknown")).toBeNull();
  });

  it("sends page_view for known routes when enabled", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    const gtag = vi.fn();
    window.gtag = gtag;
    trackPageView("/quiz");
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "page_view",
      expect.objectContaining({ page_title: "Quiz", page_path: "/quiz" }),
    );
  });

  it("sends bias_shared with share_method when enabled", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    const gtag = vi.fn();
    window.gtag = gtag;
    trackBiasShared({
      bias_id: "anchoring-bias",
      bias_title: "Anchoring Bias",
      category: "Decision-Making",
      share_method: "clipboard",
    });
    expect(gtag).toHaveBeenCalledWith("event", "bias_shared", {
      bias_id: "anchoring-bias",
      bias_title: "Anchoring Bias",
      category: "Decision-Making",
      share_method: "clipboard",
    });
  });

  it("sends bias_feedback_submitted without comment text when enabled", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    const gtag = vi.fn();
    window.gtag = gtag;
    trackBiasFeedbackSubmitted({ bias_id: "anchoring-bias", useful: true });
    expect(gtag).toHaveBeenCalledWith("event", "bias_feedback_submitted", {
      bias_id: "anchoring-bias",
      useful: true,
    });
    expect(gtag).not.toHaveBeenCalledWith(
      "event",
      "bias_feedback_submitted",
      expect.objectContaining({ comment: expect.anything() }),
    );
  });
});
