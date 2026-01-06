# TTS Mobile QA Checklist

## Prerequisites
1. Start dev server: `npm run dev`
2. Open browser console (F12 or Safari Web Inspector) to monitor logs
3. Test on actual mobile device or use Chrome DevTools mobile emulation
4. Ensure browser has speech permissions (if prompted)

## Test Environment
- **Primary**: Chrome Mobile (Android) or Safari Mobile (iOS)
- **Secondary**: Firefox Mobile, Samsung Internet
- **URL**: http://localhost:3000/bias/[any-bias-id]
- **Voice Settings**: Enable voice in Settings if needed

---

## Test 1: No Autoplay ✅
**Steps:**
1. Navigate to any bias card page
2. Wait 3-5 seconds
3. Do NOT click anything

**Expected Results:**
- ✅ TTS does NOT start automatically
- ✅ "Listen" button remains visible (not "Pause")
- ✅ Console shows no TTS-related errors
- ✅ No speech audio plays

**Actual Result**: ________________
**Status**: ⬜ PASS ⬜ FAIL ⬜ PARTIAL

---

## Test 2: Listen Button State - Idle to Playing ✅
**Steps:**
1. Navigate to bias card page
2. Wait for page to fully load
3. Tap "Listen" button
4. Observe button immediately after tap

**Expected Results:**
- ✅ Button changes from "Listen" to "Pause" **only after speech actually starts**
- ✅ Speech audio begins playing
- ✅ Console shows `[TTS] Speech started` log (in dev mode)
- ✅ Button shows "Pause" icon and text
- ✅ "Reset" button appears

**Actual Result**: ________________
**Status**: ⬜ PASS ⬜ FAIL ⬜ PARTIAL

---

## Test 3: Pause Functionality ✅
**Steps:**
1. Tap "Listen" button
2. Wait 2-3 seconds for speech to start
3. Tap "Pause" button
4. Observe button state

**Expected Results:**
- ✅ Speech pauses immediately
- ✅ Button changes from "Pause" to "Resume"
- ✅ "Reset" button remains visible
- ✅ Console shows `[TTS] Paused` log (in dev mode)
- ✅ No speech audio continues

**Actual Result**: ________________
**Status**: ⬜ PASS ⬜ FAIL ⬜ PARTIAL

---

## Test 4: Resume Functionality ✅
**Steps:**
1. Tap "Listen" button
2. Wait 2-3 seconds
3. Tap "Pause" button
4. Wait 2 seconds
5. Tap "Resume" button
6. Observe behavior

**Expected Results:**
- ✅ Speech resumes from where it paused (not from beginning)
- ✅ Button changes from "Resume" to "Pause"
- ✅ Console shows `[TTS Resume]` log (in dev mode)
- ✅ Content continues smoothly without repetition

**Actual Result**: ________________
**Status**: ⬜ PASS ⬜ FAIL ⬜ PARTIAL

---

## Test 5: Reset Functionality ✅
**Steps:**
1. Tap "Listen" button
2. Wait 2-3 seconds
3. Tap "Reset" button
4. Tap "Listen" button again

**Expected Results:**
- ✅ Speech stops immediately when "Reset" is tapped
- ✅ Button returns to "Listen"
- ✅ "Reset" button disappears
- ✅ Next "Listen" starts from the beginning (not where it was paused)

**Actual Result**: ________________
**Status**: ⬜ PASS ⬜ FAIL ⬜ PARTIAL

---

## Test 6: Route Change Cleanup ✅
**Steps:**
1. Navigate to bias card page
2. Tap "Listen" button
3. Wait for speech to start
4. Navigate to different page (tap navigation item)
5. Navigate back to bias card

**Expected Results:**
- ✅ Speech stops when navigating away
- ✅ No speech continues in background
- ✅ When returning, button shows "Listen" (idle state)
- ✅ Can start fresh playback

**Actual Result**: ________________
**Status**: ⬜ PASS ⬜ FAIL ⬜ PARTIAL

---

## Test 7: Section-Specific Playback ✅
**Steps:**
1. Navigate to bias card page
2. Find "Definition" section (has volume icon)
3. Tap volume icon next to "Definition"
4. Observe behavior

**Expected Results:**
- ✅ Only "Definition" text is read (not full bias)
- ✅ Icon changes to pause icon while playing
- ✅ Speech stops when definition finishes
- ✅ Other sections do NOT start automatically

**Actual Result**: ________________
**Status**: ⬜ PASS ⬜ FAIL ⬜ PARTIAL

---

## Test 8: Switching Between Sections ✅
**Steps:**
1. Tap volume icon next to "Definition" section
2. Wait 2 seconds
3. Tap volume icon next to "Why it happens" section

**Expected Results:**
- ✅ "Definition" speech stops immediately
- ✅ "Why it happens" speech starts
- ✅ Only one section plays at a time
- ✅ Button states update correctly

**Actual Result**: ________________
**Status**: ⬜ PASS ⬜ FAIL ⬜ PARTIAL

---

## Test 9: Mobile Browser Edge Cases ✅

### 9a. Background Tab
**Steps:**
1. Start TTS playback
2. Switch to different browser tab
3. Switch back after 5 seconds

**Expected Results:**
- ✅ Speech may pause (browser behavior)
- ✅ State remains consistent
- ✅ Can resume or reset when returning

**Actual Result**: ________________
**Status**: ⬜ PASS ⬜ FAIL ⬜ PARTIAL

### 9b. Phone Call Interruption
**Steps:**
1. Start TTS playback
2. Receive phone call (if possible)
3. End call and return to browser

**Expected Results:**
- ✅ Speech stops during call
- ✅ State resets appropriately
- ✅ Can start fresh playback after call

**Actual Result**: ________________
**Status**: ⬜ PASS ⬜ FAIL ⬜ PARTIAL

### 9c. Rapid Tapping
**Steps:**
1. Rapidly tap "Listen" button 5 times quickly
2. Observe behavior

**Expected Results:**
- ✅ No duplicate playback
- ✅ State remains consistent
- ✅ Only one playback session active
- ✅ No console errors

**Actual Result**: ________________
**Status**: ⬜ PASS ⬜ FAIL ⬜ PARTIAL

---

## Test 10: Console Logging (Development) ✅
**Steps:**
1. Open browser console
2. Perform Test 2 (Listen), Test 3 (Pause), Test 4 (Resume)
3. Check console logs

**Expected Results:**
- ✅ `[TTS] Speech started` appears when speech starts
- ✅ `[TTS] Paused` appears when pausing
- ✅ `[TTS Resume]` appears when resuming
- ✅ No error messages
- ✅ State transitions are logged clearly

**Actual Result**: ________________
**Status**: ⬜ PASS ⬜ FAIL ⬜ PARTIAL

---

## Known Mobile Browser Quirks

### iOS Safari:
- May require user gesture to initialize speechSynthesis
- Speech may pause when tab goes to background
- `onstart` may fire with slight delay

### Chrome Mobile:
- Generally more reliable than Safari
- May queue utterances if not properly cancelled
- Better error reporting

### Firefox Mobile:
- May have limited voice support
- Speech synthesis may be slower to initialize

---

## Critical Issues to Report

If any of these occur, report immediately:

1. ❌ TTS starts without user clicking "Listen"
2. ❌ Button shows "Resume" when speech is actually playing
3. ❌ Button shows "Pause" when speech is idle
4. ❌ Speech continues after navigating away
5. ❌ Multiple playback sessions active simultaneously
6. ❌ Console errors related to TTS
7. ❌ State drift (button state doesn't match speech state)

---

## Notes

- Test on multiple mobile browsers if possible
- Test on different screen sizes (phone, tablet)
- Test with different voice settings
- Test with voice disabled/enabled
- Note any browser-specific behaviors

