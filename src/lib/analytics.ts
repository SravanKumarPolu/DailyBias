/**
 * Google Analytics 4 — anonymous product usage only.
 * Disabled when VITE_GA_MEASUREMENT_ID is unset (local dev).
 */

function getMeasurementId(): string {
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID ?? "";
  // Validate GA measurement ID format (starts with G- followed by alphanumeric)
  if (id && !/^G-[A-Z0-9]+$/.test(id)) {
    console.error("Invalid GA measurement ID format. Expected format: G-XXXXXXXX");
    return "";
  }
  return id;
}

type GtagCommand = "js" | "config" | "event" | "set";

type GtagFn = (command: GtagCommand | string, ...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

let initialized = false;

export function isAnalyticsEnabled(): boolean {
  const id = getMeasurementId();
  return id.length > 0;
}

/** Load gtag.js and configure GA4 (call once at app startup). */
export function initAnalytics(): void {
  if (!isAnalyticsEnabled() || initialized || typeof window === "undefined") return;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };

  const script = document.createElement("script");
  script.async = true;
  const measurementId = getMeasurementId();
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;

  // Wait for script to load before calling gtag
  script.onload = () => {
    window.gtag("js", new Date());
    window.gtag("config", measurementId, { send_page_view: false });
    initialized = true;
  };

  document.head.appendChild(script);
}

function sendEvent(eventName: string, params?: Record<string, string | number | boolean>) {
  if (!isAnalyticsEnabled() || !window.gtag) return;
  try {
    window.gtag("event", eventName, params);
  } catch (error) {
    console.error("Analytics error:", error);
    // Silently fail to avoid breaking app functionality
  }
}

/** Map SPA paths to human-readable page names for reporting. */
export function getAnalyticsPageName(pathname: string): string | null {
  if (pathname === "/" || pathname === "/today") return "Today";
  if (pathname === "/welcome") return "Home";
  if (pathname.startsWith("/bias/")) return "Bias Detail";
  if (pathname === "/quiz") return "Quiz";
  if (pathname === "/weekly-review") return "Weekly Review";
  if (pathname === "/saved") return "Saved";
  if (pathname === "/settings") return "Settings";
  if (pathname === "/about") return "About";
  return null;
}

export function trackPageView(pathname: string, search = "") {
  const pageName = getAnalyticsPageName(pathname);
  if (!pageName) return;

  const pagePath = `${pathname}${search}`;
  sendEvent("page_view", {
    page_title: pageName,
    page_path: pagePath,
    page_location: typeof window !== "undefined" ? window.location.href : pagePath,
  });
}

export function trackBiasViewed(params: {
  bias_id: string;
  bias_title: string;
  category: string;
}) {
  sendEvent("bias_viewed", params);
}

export function trackQuizCompleted(params: {
  bias_id: string;
  score: number;
  total_questions: number;
}) {
  sendEvent("quiz_completed", params);
}

export function trackBiasBookmarked(params: { bias_id: string }) {
  sendEvent("bias_bookmarked", params);
}

export function trackBiasUnbookmarked(params: { bias_id: string }) {
  sendEvent("bias_unbookmarked", params);
}

export function trackReflectionSaved(params: { bias_id: string }) {
  sendEvent("reflection_saved", params);
}

export function trackCycleCompleted(params: { cycle_number: number }) {
  sendEvent("cycle_completed", params);
}

export function trackWeeklyReviewOpened() {
  sendEvent("weekly_review_opened");
}

export function trackBiasShared(params: {
  bias_id: string;
  bias_title: string;
  category: string;
  share_method: "native" | "clipboard";
}) {
  sendEvent("bias_shared", params);
}

export function trackBiasFeedbackSubmitted(params: {
  bias_id: string;
  useful: boolean;
}) {
  sendEvent("bias_feedback_submitted", params);
}

export function trackTTSPlaybackStarted(params: {
  playback_mode: "all" | "section";
  bias_id?: string;
}) {
  sendEvent("tts_playback_started", params);
}

export function trackTTSPlaybackPaused(params: {
  playback_mode: "all" | "section";
}) {
  sendEvent("tts_playback_paused", params);
}

export function trackTTSPlaybackResumed(params: {
  playback_mode: "all" | "section";
}) {
  sendEvent("tts_playback_resumed", params);
}

export function trackTTSPlaybackStopped(params: {
  playback_mode: "all" | "section";
}) {
  sendEvent("tts_playback_stopped", params);
}

export function trackTTSPlaybackCompleted(params: {
  playback_mode: "all" | "section";
  bias_id?: string;
}) {
  sendEvent("tts_playback_completed", params);
}

export function trackErrorOccurred(params: {
  error_message: string;
  error_type?: string;
  component_stack?: string;
}) {
  sendEvent("error_occurred", params);
}

export function trackSettingsVoiceChanged(params: {
  voice_uri?: string | null;
}) {
  sendEvent("settings_voice_changed", params);
}

export function trackSettingsRateChanged(params: {
  rate: number;
}) {
  sendEvent("settings_rate_changed", params);
}

export function trackSettingsVolumeChanged(params: {
  volume: number;
}) {
  sendEvent("settings_volume_changed", params);
}

/** Test helper — reset module state between unit tests. */
export function _resetAnalyticsForTests() {
  initialized = false;
}
