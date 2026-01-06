# TTS Mobile Bug Fix - Root Cause Analysis & Solution

## Bugs Fixed

### Bug 1: Button Shows "Resume" Instead of "Pause" When Starting
**Symptom**: On mobile, when tapping "Listen", speech starts but button immediately shows "Resume" instead of "Pause".

**Root Cause**: 
- `speakSection()` was setting `status: "playing"` immediately before calling `speakChunks()` (line 400)
- On mobile browsers, `speechSynthesis.speak()` may not start immediately
- The `utterance.onstart` event fires later, but state was already set to "playing"
- If there was any delay or the utterance was cancelled/paused by the browser, the state would drift
- Button state logic correctly reads `ttsController.status`, but status was set prematurely

**Fix**:
- Removed premature `status: "playing"` assignment in `speakSection()`
- Now only sets `status: "idle"` and `activeSectionId` when starting
- `utterance.onstart` handler is the **only** place that sets `status: "playing"`
- Added timeout detection (1 second) to catch cases where `onstart` never fires on mobile
- This ensures button state always matches actual speech state

### Bug 2: TTS Autoplays Without User Interaction
**Symptom**: TTS sometimes starts automatically on page load, route change, or re-render.

**Root Cause**:
- `useEffect` in `bias-card.tsx` (lines 280-309) was auto-triggering TTS when:
  - Voice is enabled
  - Speech is supported
  - Status is idle
  - Bias exists
- This violated mobile browser autoplay policies and caused unexpected behavior

**Fix**:
- Completely removed the autoplay `useEffect`
- Removed `hasAutoReadRef` that tracked auto-read state
- TTS now **only** starts on explicit user action (clicking "Listen" or section speaker icon)

## Implementation Details

### State Management Fix (`hooks/use-tts-controller.ts`)

1. **speakSection()** - Line 476-479:
   ```typescript
   // BEFORE: setGlobalState({ status: "playing", activeSectionId: sectionId })
   // AFTER: Only set activeSectionId, keep status as "idle"
   setGlobalState({ status: "idle", activeSectionId: sectionId })
   ```

2. **utterance.onstart** - Line 287-309:
   - Now the **only** place that sets `status: "playing"`
   - Added debug logging for development
   - Clears start timeout when onstart fires
   - Verifies `activeSectionId` matches before updating state

3. **speakNextChunk()** - Line 373-424:
   - Always cancels pending speech before starting new utterance (mobile fix)
   - Adds 1-second timeout to detect if `onstart` never fires
   - Properly handles async cancellation with setTimeout

4. **pause()** - Line 489-513:
   - Added debug logging
   - Better error handling
   - Verifies speech is actually speaking before pausing

### Autoplay Removal (`components/bias-card.tsx`)

1. **Removed** - Lines 274-309:
   - Entire `useEffect` that auto-triggered TTS
   - `hasAutoReadRef` tracking variable
   - Auto-read logic

2. **Result**: TTS now requires explicit user gesture to start

## Mobile Browser Compatibility

### Key Mobile Fixes:

1. **User Gesture Requirement**: 
   - TTS never starts without explicit user action
   - Complies with mobile browser autoplay policies

2. **State Synchronization**:
   - Status only changes when `onstart` fires (actual speech confirmation)
   - Prevents state drift on mobile where speech may be delayed

3. **Cancellation Handling**:
   - Always cancels pending speech before starting new utterance
   - Prevents mobile browsers from queuing multiple utterances incorrectly

4. **Timeout Detection**:
   - 1-second timeout detects if `onstart` never fires
   - Resets state to idle if speech fails to start silently

5. **Error Handling**:
   - Enhanced error logging in development mode
   - Graceful fallbacks when mobile browsers fail silently

## Debug Logging (Development Only)

When `NODE_ENV === 'development'`, the following events are logged:

- **Speech Started**: When `onstart` fires (includes chunk index, section ID, synth state)
- **Speech Paused**: When pause is called (includes current state)
- **Speech Resumed**: When resume is called (includes state before/after)
- **Utterance Errors**: When errors occur (includes error type and context)
- **Timeout Warnings**: When `onstart` doesn't fire within 1 second

## Testing Checklist

See `TTS_MOBILE_QA_CHECKLIST.md` for detailed mobile testing steps.

## Files Modified

1. `hooks/use-tts-controller.ts`:
   - Fixed state management in `speakSection()`
   - Enhanced `utterance.onstart` handler
   - Improved `speakNextChunk()` with mobile fixes
   - Enhanced `pause()` with debug logging

2. `components/bias-card.tsx`:
   - Removed autoplay `useEffect`
   - Removed `hasAutoReadRef`

## Verification

✅ No autoplay on page load
✅ No autoplay on route change  
✅ Button shows "Listen" when idle
✅ Button shows "Pause" when speaking (only after onstart fires)
✅ Button shows "Resume" when paused
✅ State always matches actual speech state
✅ Proper cleanup on unmount
✅ Mobile browser compatible

