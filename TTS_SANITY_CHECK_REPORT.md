# TTS Feature Sanity Check Report

**Date**: 2024-12-19  
**Reviewer**: Senior Frontend Engineer + QA  
**Scope**: TTS Controller, Listen UI Controls, State Persistence

---

## Executive Summary

**Status**: ⚠️ **PARTIAL PASS** - Core functionality works correctly, but **section-specific controls are missing** (tests reference them but implementation doesn't have them). One potential race condition issue identified.

---

## 1) Functional Sanity Checklist

### A) Basic Playback

| Test | Status | Notes |
|------|--------|-------|
| Clicking Listen on "full bias" reads whole content | ✅ **PASS** | `generateBiasText()` (bias-card.tsx:137-155) includes title, summary, why, counter, examples, tips in correct order |
| Clicking Listen on a section plays ONLY that section | ❌ **FAIL** | **Section-specific Listen buttons are NOT implemented**. Only full bias Listen exists. Tests reference them (tts-functionality.spec.ts:75-103, 161-185) but UI doesn't have them. |
| While playing, UI shows correct state (Playing + active section label) | ⚠️ **PARTIAL** | Shows "Pause" when playing (bias-card.tsx:515-523), but no section label (section controls don't exist) |

**Finding**: The test file `tests/e2e/tts-functionality.spec.ts` references section-specific buttons (line 75-103, 161-185), but they don't exist in `components/bias-card.tsx`. This is a **missing feature**, not a regression.

### B) Pause/Resume Accuracy

| Test | Status | Notes |
|------|--------|-------|
| Clicking Pause pauses without losing progress | ✅ **PASS** | `pause()` (use-tts-controller.ts:616-658) saves `currentChunkIndexRef.current` to `pausedChunkIndexRef.current` (line 627-628) |
| Clicking Resume continues from same position | ⚠️ **PARTIAL** | Resumes from **chunk boundary**, not exact word position (Web Speech API limitation). `resume()` (line 432-511) correctly sets `currentChunkIndexRef.current = resumeIndex` (line 493) |
| Resume does NOT restart from beginning | ✅ **PASS** | `resume()` sets `currentChunkIndexRef.current = resumeIndex` before calling `speakChunks()` (line 493-498) |

**Note**: Web Speech API doesn't support resuming from exact character/word position. The implementation correctly resumes from the chunk where it paused, which is the best possible behavior.

### C) Stop vs Reset Behavior

| Test | Status | Notes |
|------|--------|-------|
| Stop cancels speech and sets state to idle | ✅ **PASS** | `reset()` (use-tts-controller.ts:661-699) calls `speechSynthesis.cancel()` (line 669) and clears all state (lines 673-680) |
| Reset restarts from beginning | ✅ **PASS** | `reset()` clears `currentChunkIndexRef.current = 0` (line 676) and all pause state |
| After Stop/Reset, no "ghost" speech continues | ✅ **PASS** | `reset()` cancels all speech including paused (`window.speechSynthesis.paused` checked at line 668) |

### D) Single-Player Rule

| Test | Status | Notes |
|------|--------|-------|
| Only one playback at a time | ✅ **PASS** | `speak()` checks `activeBiasIdRef.current !== biasId` (line 535) and cancels previous (lines 537-547) |
| Starting new section cancels old section | ❌ **N/A** | Section controls don't exist |
| Switching bias card cancels previous playback | ✅ **PASS** | `speak()` line 535-547 handles bias switching correctly |

---

## 2) Browser/Permission Robustness

### Speech Engine Readiness

| Test | Status | Notes |
|------|--------|-------|
| If `window.speechSynthesis` not available: disable controls | ✅ **PASS** | `useEffect` (use-tts-controller.ts:41-45) sets `isSupported`, buttons disabled via `disabled={!isSupported}` (bias-card.tsx:513) |
| No crashes in SSR/hydration | ✅ **PASS** | All `window` access is inside `useEffect` or guarded with `typeof window !== "undefined"` (lines 42, 54, 91) |
| Any init using window runs inside useEffect | ✅ **PASS** | `getVoices()` is called from `speak()`/`resume()` which are user-triggered |

### Event Cleanup

| Test | Status | Notes |
|------|--------|-------|
| Utterance handlers cleaned/reset properly | ✅ **PASS** | Handlers are set per utterance (lines 253-387), cleaned when utterance completes/errors |
| `cancel()` called on switching sections | ❌ **N/A** | Section controls don't exist |
| `cancel()` called on switching biases | ✅ **PASS** | Line 537-538 in `speak()` |
| `cancel()` called on navigating away/unmount | ✅ **PASS** | `useEffect` cleanup (use-tts-controller.ts:52-58) |
| `cancel()` called on stop/reset | ✅ **PASS** | `reset()` line 668-669 |

---

## 3) State Correctness

| Test | Status | Notes |
|------|--------|-------|
| `state` only: "idle" \| "playing" \| "paused" | ✅ **PASS** | Type definition (use-tts-controller.ts:9) enforces this |
| `activeBiasId` matches what UI shows | ✅ **PASS** | `isCurrentBias = activeBiasId === biasId` (bias-card.tsx:51) |
| `textChunks`, `currentChunkIndex` updated correctly | ✅ **PASS** | Incremented in `onend` (line 274), preserved on pause (line 627-628), reset on stop (line 676) |
| No stale closures | ✅ **PASS** | All callbacks use `useCallback` with correct dependencies |
| No multiple utterances queued unintentionally | ⚠️ **POTENTIAL ISSUE** | See Bug #1 below |

---

## 4) Core Feature Regression Check

| Feature | Status | Notes |
|---------|--------|-------|
| Daily bias selection/rotation | ✅ **PASS** | No changes to `use-daily-bias.ts` or `lib/daily-selector.ts` |
| Favorites/likes | ✅ **PASS** | No changes to favorite logic in `bias-card.tsx` (lines 95-112) |
| Progress tracking | ✅ **PASS** | No changes to `use-progress.ts` or `lib/db.ts` |
| Streak calculation | ✅ **PASS** | No changes to progress/streak logic |
| Local storage keys/schemas | ✅ **PASS** | TTS controller doesn't use localStorage (verified: no localStorage calls in use-tts-controller.ts) |
| Share/copy functionality | ✅ **PASS** | `handleShare()` and `handleCopy()` unchanged in `bias-card.tsx` (lines 59-91) |

**All core features are intact** ✅

---

## 5) Bugs Found

### Bug #1: Potential Race Condition in `speak()` for Same Bias (MINOR)
- **File**: `hooks/use-tts-controller.ts`
- **Lines**: 526-530, 606-609
- **Issue**: The `isSpeakingRef` guard (line 527) only prevents concurrent calls for **different biases**. If user rapidly clicks "Listen" on the **same bias**, the guard allows it because `activeBiasIdRef.current === biasId` passes. The guard is reset after 200ms (line 607-609), which might allow duplicate calls.
- **Impact**: Low - The check at line 551 (`if (activeBiasIdRef.current === biasId && state === "playing")`) should prevent this, but there's a small window where state might not be updated yet.
- **Recommendation**: Add additional guard to prevent rapid clicks on same bias, or make the guard more robust.

### Bug #2: Missing Section-Specific Controls (FEATURE GAP)
- **File**: `components/bias-card.tsx`
- **Issue**: Tests reference section-specific Listen buttons (Definition, Why, Counter sections), but they don't exist in the implementation.
- **Impact**: Users can only listen to full bias, not individual sections (Definition, Why, Counter).
- **Note**: This may be intentional - verify with product requirements. If section controls are required, they need to be implemented.

### Bug #3: Native Pause/Resume State Mismatch (MINOR)
- **File**: `hooks/use-tts-controller.ts`
- **Line**: 453
- **Issue**: When using native resume, we check `window.speechSynthesis.paused`, but if pause failed and we fell back to chunk-based, this check may be incorrect. However, `useNativePauseResumeRef.current` should track this.
- **Impact**: Low - fallback to chunk-based works correctly (lines 473-498).

---

## 6) Issues Requiring Fix

### Issue #1: Section-Specific Controls Missing
**Priority**: HIGH (if required by product spec)  
**Status**: Not implemented

If section-specific controls are required:
1. Add Listen buttons to each section (Definition, Why, Counter) in `bias-card.tsx`
2. Modify `speak()` to accept optional `sectionId` parameter
3. Update TTS controller to track active section
4. Ensure single-player rule: starting a section cancels full bias or other sections

### Issue #2: Race Condition Guard Enhancement (Optional)
**Priority**: LOW  
**Status**: Minor improvement

Consider adding a debounce or more robust guard for rapid clicks on the same bias:
```typescript
// In speak(), add before line 527:
if (isSpeakingRef.current && activeBiasIdRef.current === biasId) {
  console.log("[TTS Controller] Already processing this bias, ignoring duplicate call")
  return
}
```

---

## 7) Manual Test Plan

### Chrome Desktop

1. **Full Bias Playback**
   - Navigate to `/bias/[any-bias]` (e.g., `/bias/fundamental-attribution-error`)
   - Click "Listen" button
   - ✅ Verify: Speech starts, button changes to "Pause"
   - ✅ Verify: Entire bias content is read (title, summary, why, counter, examples, tips)

2. **Pause/Resume**
   - While playing, click "Pause"
   - ✅ Verify: Speech pauses, button changes to "Resume"
   - Click "Resume"
   - ✅ Verify: Speech continues from same position (same chunk, not from beginning)

3. **Reset**
   - Start playback, then click "Reset"
   - ✅ Verify: Speech stops, button returns to "Listen"
   - Click "Listen" again
   - ✅ Verify: Starts from beginning

4. **Bias Switching**
   - Start playback on Bias A
   - Navigate to Bias B, click "Listen"
   - ✅ Verify: Bias A stops, Bias B starts (no overlap)

5. **Rapid Clicking**
   - Rapidly click "Listen" 5 times
   - ✅ Verify: No errors in console, only one playback active

### Firefox Desktop

6. **Repeat tests 1-5**
   - ✅ Verify: Same behavior as Chrome

### Edge Cases

7. **Browser Not Supported**
   - Disable `window.speechSynthesis` (dev tools: `window.speechSynthesis = undefined`)
   - ✅ Verify: "Listen" button is disabled
   - ✅ Verify: No console errors, no crashes

8. **Voice Disabled**
   - Disable voice in Settings
   - ✅ Verify: "Listen" button shows "Voice Off" and is disabled

9. **Navigation Cleanup**
   - Start playback on a bias
   - Navigate to `/all` or another page
   - ✅ Verify: Speech stops, no console errors

10. **Component Unmount**
    - Start playback
    - Navigate away (unmounts component)
    - ✅ Verify: Cleanup runs, no memory leaks

---

## 8) Summary

### ✅ What Works
- Core TTS functionality: Working correctly
- Pause/Resume: Working (chunk-level, not word-level - API limitation)
- Reset: Working correctly
- Single-player rule: Enforced correctly
- Core features: No regressions
- Browser compatibility: Handled correctly
- State management: Correct
- Cleanup: Properly implemented

### ⚠️ What's Missing
- **Section-specific controls**: Not implemented (tests reference them but UI doesn't have them)
  - This may be intentional - verify with product requirements

### 🔧 Minor Issues
- Potential race condition for rapid clicks on same bias (low impact, has fallback protection)
- Native pause/resume state check edge case (low impact, has fallback)

### 📋 Recommendations

1. **Verify product requirements**: Are section-specific controls required? If yes, implement them.
2. **Update tests**: If section controls are not required, update `tests/e2e/tts-functionality.spec.ts` to remove section-specific tests (lines 75-103, 161-185).
3. **Optional enhancement**: Add debounce/guard for rapid clicks on same bias (low priority).

---

## 9) Final Verdict

**Overall Status**: ✅ **READY FOR PRODUCTION** (with caveat about section controls)

The TTS implementation is **solid and production-ready** for full bias playback. The missing section-specific controls are a feature gap (not a bug) if they're not required. If they are required, they need to be implemented before production.

**Critical Issues**: 0  
**High Priority Issues**: 1 (section controls - if required)  
**Low Priority Issues**: 2 (race condition guard, native pause/resume edge case)

---

**Review Complete** ✅
