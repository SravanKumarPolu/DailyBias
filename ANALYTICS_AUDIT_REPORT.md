# Analytics Audit Report

**Date:** June 11, 2026  
**Auditor:** Senior Frontend Engineer  
**Scope:** Google Analytics 4 implementation in DebiasDaily

---

## Executive Summary

Comprehensive audit of the analytics implementation in DebiasDaily. The implementation follows best practices with proper validation, error handling, and event tracking. However, there are opportunities to expand coverage for TTS playback events and settings changes.

**Status:** Generally well-implemented with minor gaps in coverage

---

## 1. VITE_GA_MEASUREMENT_ID Usage

### 1.1 Implementation Location
**File:** `src/lib/analytics.ts` (lines 6-14)

### 1.2 Validation
```typescript
function getMeasurementId(): string {
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID ?? "";
  // Validate GA measurement ID format (starts with G- followed by alphanumeric)
  if (id && !/^G-[A-Z0-9]+$/.test(id)) {
    console.error("Invalid GA measurement ID format. Expected format: G-XXXXXXXX");
    return "";
  }
  return id;
}
```

### 1.3 Findings
✅ **Correct:** Environment variable is validated for format (G-XXXXXXXX)  
✅ **Correct:** Returns empty string if validation fails  
✅ **Correct:** Console error logged for invalid format  
✅ **Correct:** Analytics disabled when ID is empty (local dev)

### 1.4 Initialization
**File:** `src/main.tsx` (line 7)

```typescript
initAnalytics();
```

✅ **Correct:** Called at app startup  
✅ **Correct:** Single initialization with guard against duplicate calls

---

## 2. bias_shared Event Tracking

### 2.1 Implementation Location
**File:** `src/hooks/useShareBias.ts` (lines 56-67)

### 2.2 Event Parameters
```typescript
trackBiasShared({
  bias_id: bias.id,
  bias_title: bias.title,
  category: bias.category,
  share_method: "native" | "clipboard",
});
```

### 2.3 Findings
✅ **Correct:** Event tracked on successful share  
✅ **Correct:** Event tracked on clipboard copy  
✅ **Correct:** Includes bias_id, bias_title, category, share_method  
✅ **Correct:** share_method distinguishes between native share and clipboard copy  
✅ **Correct:** Called in both success and copy outcomes

---

## 3. bias_feedback_submitted Event Tracking

### 3.1 Implementation Location
**File:** `src/hooks/useBiasFeedback.ts` (line 68)

### 3.2 Event Parameters
```typescript
trackBiasFeedbackSubmitted({ bias_id: biasId, useful });
```

### 3.3 Findings
✅ **Correct:** Event tracked on feedback submission  
✅ **Correct:** Includes bias_id and useful (boolean)  
✅ **Correct:** Does NOT include comment text (privacy-preserving)  
✅ **Correct:** Called after saving feedback entry

---

## 4. Page View Tracking

### 4.1 Implementation Location
**File:** `src/components/AnalyticsRouteTracker.tsx` (lines 10-11)

### 4.2 Implementation
```typescript
const AnalyticsRouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname, location.search);
  }, [location.pathname, location.search]);

  return null;
};
```

### 4.3 Page Name Mapping
**File:** `src/lib/analytics.ts` (lines 61-71)

```typescript
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
```

### 4.4 Findings
✅ **Correct:** Page view tracked on every route change  
✅ **Correct:** Includes pathname and search params  
✅ **Correct:** Human-readable page names for reporting  
✅ **Correct:** Returns null for unknown routes (prevents tracking)  
✅ **Correct:** Component mounted in App.tsx (line 61)

### 4.5 Coverage
All known routes are covered:
- Today (/)
- Home (/welcome)
- Bias Detail (/bias/:id)
- Quiz (/quiz)
- Weekly Review (/weekly-review)
- Saved (/saved)
- Settings (/settings)
- About (/about)

---

## 5. Event Tracking Consistency

### 5.1 Tracked Events

| Event | Parameters | Location | Status |
|-------|-----------|----------|--------|
| page_view | page_title, page_path, page_location | AnalyticsRouteTracker.tsx | ✅ |
| bias_viewed | bias_id, bias_title, category | useTrackBiasViewed.ts | ✅ |
| quiz_completed | bias_id, score, total_questions | QuizPage.tsx | ✅ |
| bias_bookmarked | bias_id | useBookmarks.ts | ✅ |
| bias_unbookmarked | bias_id | useBookmarks.ts | ✅ |
| reflection_saved | bias_id | useReflection.ts | ✅ |
| cycle_completed | cycle_number | TodayPage.tsx | ✅ |
| weekly_review_opened | (none) | WeeklyReviewPage.tsx | ✅ |
| bias_shared | bias_id, bias_title, category, share_method | useShareBias.ts | ✅ |
| bias_feedback_submitted | bias_id, useful | useBiasFeedback.ts | ✅ |

### 5.2 Findings
✅ **Correct:** All events follow consistent naming convention (snake_case)  
✅ **Correct:** All events include relevant parameters  
✅ **Correct:** No personally identifiable information (PII) in events  
✅ **Correct:** Comment text excluded from feedback event (privacy)  
✅ **Correct:** Bias IDs used instead of titles for consistency  
✅ **Correct:** Events tracked in appropriate lifecycle hooks

---

## 6. Error Handling

### 6.1 Validation Errors
**File:** `src/lib/analytics.ts` (lines 9-11)

```typescript
if (id && !/^G-[A-Z0-9]+$/.test(id)) {
  console.error("Invalid GA measurement ID format. Expected format: G-XXXXXXXX");
  return "";
}
```

✅ **Correct:** Console error logged for invalid format  
✅ **Correct:** Returns empty string to disable analytics  
✅ **Correct:** Does not throw exceptions

### 6.2 Initialization Guard
**File:** `src/lib/analytics.ts` (line 36)

```typescript
if (!isAnalyticsEnabled() || initialized || typeof window === "undefined") return;
```

✅ **Correct:** Checks if analytics is enabled  
✅ **Correct:** Prevents duplicate initialization  
✅ **Correct:** SSR-safe (checks for window)

### 6.3 Event Sending Guard
**File:** `src/lib/analytics.ts` (lines 55-58)

```typescript
function sendEvent(eventName: string, params?: Record<string, string | number | boolean>) {
  if (!isAnalyticsEnabled() || !window.gtag) return;
  window.gtag("event", eventName, params);
}
```

✅ **Correct:** Checks if analytics is enabled before sending  
✅ **Correct:** Checks if gtag is available  
✅ **Correct:** Silent fail (no errors thrown)  
⚠️ **Note:** No try-catch around gtag calls (assumes gtag is stable)

### 6.4 Page View Guard
**File:** `src/lib/analytics.ts` (lines 73-75)

```typescript
export function trackPageView(pathname: string, search = "") {
  const pageName = getAnalyticsPageName(pathname);
  if (!pageName) return;
  // ...
}
```

✅ **Correct:** Returns early for unknown routes  
✅ **Correct:** Prevents tracking of 404 or unknown pages

---

## 7. Missing Analytics Coverage

### 7.1 TTS Playback Events
**Status:** ❌ **NOT TRACKED**

**Missing Events:**
- tts_play_started (when user starts listening)
- tts_play_paused (when user pauses)
- tts_play_resumed (when user resumes)
- tts_play_stopped (when user stops)
- tts_listen_all_started (when Listen All is clicked)
- tts_section_played (when individual section is played)
- tts_playback_completed (when playback ends naturally)

**Impact:** Medium - Cannot analyze TTS usage patterns

**Recommendation:** Add TTS playback event tracking to understand:
- How many users use TTS
- Which sections are most listened to
- Listen All vs individual section preference
- Average playback duration

### 7.2 Settings Changes
**Status:** ❌ **NOT TRACKED**

**Missing Events:**
- settings_voice_changed (when user changes voice)
- settings_rate_changed (when user changes playback speed)
- settings_volume_changed (when user changes volume)

**Impact:** Low - Settings are personal preferences

**Recommendation:** Optional - Track settings changes to understand:
- Most popular voice choices
- Preferred playback speeds
- Volume preferences

**Implementation:** Add tracking in `src/components/VoiceSpeedSelector.tsx` after state changes

### 7.3 Navigation Events
**Status:** ✅ **COVERED**

Page views are tracked via `AnalyticsRouteTracker.tsx`, which covers all route changes. No additional navigation events needed.

### 7.4 Error Events
**Status:** ❌ **NOT TRACKED**

**Missing Events:**
- error_occurred (when errors happen in the app)

**Impact:** Low - Error boundary exists but no error analytics

**Recommendation:** Optional - Add error tracking to `src/components/ErrorBoundary.tsx` to monitor:
- JavaScript errors
- React errors
- API failures

### 7.5 Search/Filter Events
**Status:** N/A

No search or filter functionality exists in the current implementation.

---

## 8. Test Coverage

### 8.1 Unit Tests
**File:** `src/test/analytics.test.ts`

**Test Cases:**
- ✅ Disabled when VITE_GA_MEASUREMENT_ID is empty
- ✅ Sends page_view for known routes when enabled
- ✅ Sends bias_shared with share_method when enabled
- ✅ Sends bias_feedback_submitted without comment text when enabled

**Findings:**
✅ **Correct:** Core functionality tested  
⚠️ **Note:** Limited test coverage (only 4 tests)  
⚠️ **Note:** No tests for edge cases (invalid gtag, network errors)

---

## 9. Privacy Considerations

### 9.1 Data Collected
✅ **Correct:** No personally identifiable information (PII)  
✅ **Correct:** No user names or emails  
✅ **Correct:** Comment text excluded from feedback event  
✅ **Correct:** Only anonymous usage data

### 9.2 Cookie/Storage
✅ **Correct:** No cookies used for analytics  
✅ **Correct:** Uses localStorage for user preferences (voice, rate, volume)  
✅ **Correct:** Analytics uses Google's standard cookies (GA4)

---

## 10. Recommendations

### 10.1 High Priority
1. **Add TTS Playback Events**
   - Track when users start, pause, resume, stop playback
   - Track Listen All vs individual section usage
   - Track playback completion rate
   - **Impact:** High - Understand TTS adoption and usage patterns

### 10.2 Medium Priority
2. **Add Error Tracking**
   - Track errors in ErrorBoundary
   - Monitor API failures
   - Track JavaScript errors
   - **Impact:** Medium - Improve app stability monitoring

3. **Expand Test Coverage**
   - Add tests for edge cases
   - Test invalid gtag scenarios
   - Test network error scenarios
   - **Impact:** Medium - Improve reliability

### 10.3 Low Priority
4. **Add Settings Change Events**
   - Track voice selection changes
   - Track rate changes
   - Track volume changes
   - **Impact:** Low - Understand user preferences

5. **Add Try-Catch Around gtag Calls**
   - Wrap gtag calls in try-catch
   - Log errors to console
   - **Impact:** Low - Improve error handling

---

## 11. Files Affected

### 11.1 Analytics Implementation
- `src/lib/analytics.ts` - Core analytics functions
- `src/main.tsx` - Analytics initialization
- `src/components/AnalyticsRouteTracker.tsx` - Page view tracking

### 11.2 Event Tracking
- `src/hooks/useTrackBiasViewed.ts` - bias_viewed event
- `src/hooks/useShareBias.ts` - bias_shared event
- `src/hooks/useBiasFeedback.ts` - bias_feedback_submitted event
- `src/hooks/useBookmarks.ts` - bias_bookmarked, bias_unbookmarked events
- `src/hooks/useReflection.ts` - reflection_saved event
- `src/pages/TodayPage.tsx` - cycle_completed event
- `src/pages/WeeklyReviewPage.tsx` - weekly_review_opened event
- `src/pages/QuizPage.tsx` - quiz_completed event

### 11.3 Settings (No Analytics)
- `src/components/VoiceSpeedSelector.tsx` - Settings UI (no analytics)
- `src/hooks/useTTSSettings.ts` - Settings state (no analytics)

### 11.4 TTS (No Analytics)
- `src/hooks/useTTS.ts` - TTS logic (no analytics)
- `src/components/BiasCard.tsx` - TTS UI (no analytics)

---

## 12. Conclusion

The analytics implementation is well-structured and follows best practices:
- Proper validation of measurement ID
- Consistent event naming
- Privacy-conscious data collection
- Good error handling guards
- Comprehensive page view tracking

**Strengths:**
- Clean separation of concerns
- Privacy-preserving implementation
- Consistent event parameters
- Good test coverage for core functionality

**Weaknesses:**
- No TTS playback event tracking (high impact)
- No settings change tracking (low impact)
- No error tracking (medium impact)
- Limited test coverage for edge cases

**Overall Assessment:** The analytics implementation is solid but could be expanded to provide deeper insights into user behavior, particularly around TTS usage which is a key feature of the application.

---

**Report End**
