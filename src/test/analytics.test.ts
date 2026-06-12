import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  _resetAnalyticsForTests,
  getAnalyticsPageName,
  isAnalyticsEnabled,
  trackBiasFeedbackSubmitted,
  trackBiasShared,
  trackBiasViewed,
  trackPageView,
  trackTTSPlaybackStarted,
  trackTTSPlaybackPaused,
  trackTTSPlaybackResumed,
  trackTTSPlaybackStopped,
  trackTTSPlaybackCompleted,
  trackErrorOccurred,
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

  it("does not send events when gtag is not available", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    delete window.gtag;
    trackBiasViewed({
      bias_id: "confirmation-bias",
      bias_title: "Confirmation Bias",
      category: "Core Thinking",
    });
    // Should not throw error when gtag is not available
    expect(() => trackBiasViewed({
      bias_id: "confirmation-bias",
      bias_title: "Confirmation Bias",
      category: "Core Thinking",
    })).not.toThrow();
  });

  it("validates GA measurement ID format", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "INVALID-FORMAT");
    expect(isAnalyticsEnabled()).toBe(false);
  });

  it("validates GA measurement ID with lowercase", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "g-test123");
    expect(isAnalyticsEnabled()).toBe(false);
  });

  it("accepts valid GA measurement ID", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-ABC123XYZ");
    expect(isAnalyticsEnabled()).toBe(true);
  });

  it("sends TTS playback started event for section", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    const gtag = vi.fn();
    window.gtag = gtag;
    trackTTSPlaybackStarted({ playback_mode: "section", bias_id: "definition" });
    expect(gtag).toHaveBeenCalledWith("event", "tts_playback_started", {
      playback_mode: "section",
      bias_id: "definition",
    });
  });

  it("sends TTS playback started event for all", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    const gtag = vi.fn();
    window.gtag = gtag;
    trackTTSPlaybackStarted({ playback_mode: "all" });
    expect(gtag).toHaveBeenCalledWith("event", "tts_playback_started", {
      playback_mode: "all",
    });
  });

  it("sends TTS playback paused event", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    const gtag = vi.fn();
    window.gtag = gtag;
    trackTTSPlaybackPaused({ playback_mode: "section" });
    expect(gtag).toHaveBeenCalledWith("event", "tts_playback_paused", {
      playback_mode: "section",
    });
  });

  it("sends TTS playback resumed event", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    const gtag = vi.fn();
    window.gtag = gtag;
    trackTTSPlaybackResumed({ playback_mode: "all" });
    expect(gtag).toHaveBeenCalledWith("event", "tts_playback_resumed", {
      playback_mode: "all",
    });
  });

  it("sends TTS playback stopped event", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    const gtag = vi.fn();
    window.gtag = gtag;
    trackTTSPlaybackStopped({ playback_mode: "section" });
    expect(gtag).toHaveBeenCalledWith("event", "tts_playback_stopped", {
      playback_mode: "section",
    });
  });

  it("sends TTS playback completed event for section", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    const gtag = vi.fn();
    window.gtag = gtag;
    trackTTSPlaybackCompleted({ playback_mode: "section", bias_id: "definition" });
    expect(gtag).toHaveBeenCalledWith("event", "tts_playback_completed", {
      playback_mode: "section",
      bias_id: "definition",
    });
  });

  it("sends TTS playback completed event for all", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    const gtag = vi.fn();
    window.gtag = gtag;
    trackTTSPlaybackCompleted({ playback_mode: "all" });
    expect(gtag).toHaveBeenCalledWith("event", "tts_playback_completed", {
      playback_mode: "all",
    });
  });

  it("sends error occurred event with limited message", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    const gtag = vi.fn();
    window.gtag = gtag;
    const longMessage = "a".repeat(300);
    trackErrorOccurred({
      error_message: longMessage,
      error_type: "TypeError",
      component_stack: "stack trace here",
    });
    expect(gtag).toHaveBeenCalledWith("event", "error_occurred", {
      error_message: longMessage.slice(0, 200),
      error_type: "TypeError",
      component_stack: "stack trace here",
    });
  });

  it("sends error occurred event without optional fields", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    const gtag = vi.fn();
    window.gtag = gtag;
    trackErrorOccurred({
      error_message: "Something went wrong",
    });
    expect(gtag).toHaveBeenCalledWith("event", "error_occurred", {
      error_message: "Something went wrong",
    });
  });

  it("does not send page_view for unknown routes", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    const gtag = vi.fn();
    window.gtag = gtag;
    trackPageView("/unknown-route");
    expect(gtag).not.toHaveBeenCalled();
  });

  it("handles page_view with search params", () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    const gtag = vi.fn();
    window.gtag = gtag;
    trackPageView("/quiz", "?category=decision-making");
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "page_view",
      expect.objectContaining({
        page_path: "/quiz?category=decision-making",
      }),
    );
  });
});
