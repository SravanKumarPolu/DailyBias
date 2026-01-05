# TTS Manual Test Checklist

## Prerequisites
1. Start dev server: `npm run dev`
2. Open browser console (F12) to monitor logs
3. Ensure browser has microphone/speech permissions (if prompted)

## Test Environment Setup
- **Browser**: Chrome Desktop (latest)
- **URL**: http://localhost:3000/bias/fundamental-attribution-error
- **Voice Settings**: Enable voice in Settings if needed

---

## Test 1: Basic Full Bias Playback ✅
**Steps:**
1. Navigate to any bias card page
2. Click the "Listen" button (full-width button at top)
3. Observe the button changes to "Pause"

**Expected Results:**
- ✅ Button text changes from "Listen" to "Pause"
- ✅ Speech starts reading the entire bias content
- ✅ Content reads in order: Title → Summary → Why → Counter → Examples → Tips
- ✅ No interruptions or stuttering
- ✅ Console shows no errors

**Actual Result**: ________________
**Status**: ⬜ PASS ⬜ FAIL ⬜ PARTIAL

---

## Test 2: Section-Specific Playback ✅
**Steps:**
1. Navigate to bias card page
2. Find the "Definition" section (has a volume icon button)
3. Click the volume icon next to "Definition"
4. Observe the icon changes to pause icon

**Expected Results:**
- ✅ Only the "Definition" (summary) text is read
- ✅ Other sections are NOT read
- ✅ Icon changes to pause while playing
- ✅ Speech stops when definition finishes
- ✅ No other sections start automatically

**Actual Result**: ________________
**Status**: ⬜ PASS ⬜ FAIL ⬜ PARTIAL

---

## Test 3: Pause/Resume Functionality ✅
**Steps:**
1. Click "Listen" on full bias
2. Wait 2-3 seconds for speech to start
3. Click "Pause" button
4. Wait 2 seconds
5. Click "Resume" button

**Expected Results:**
- ✅ Speech pauses immediately when "Pause" clicked
- ✅ Button changes from "Pause" to "Resume"
- ✅ "Reset" button appears
- ✅ When "Resume" clicked, speech continues from EXACT same position
- ✅ Does NOT restart from beginning
- ✅ Content continues smoothly without repetition

**Actual Result**: ________________
**Status**: ⬜ PASS ⬜ FAIL ⬜ PARTIAL

---

## Test 4: Reset Functionality ✅
**Steps:**
1. Click "Listen" on full bias
2. Wait 2-3 seconds
3. Click "Reset" button
4. Wait 1 second
5. Click "Listen" again

**Expected Results:**
- ✅ Speech stops immediately when "Reset" clicked
- ✅ State returns to idle
- ✅ "Listen" button reappears (no Pause/Resume)
- ✅ When "Listen" clicked again, starts from BEGINNING
- ✅ No ghost speech continues
- ✅ Console shows no errors

**Actual Result**: ________________
**Status**: ⬜ PASS ⬜ FAIL ⬜ PARTIAL

---

## Test 5: Section Switching (Single-Player Rule) ✅
**Steps:**
1. Click volume icon on "Definition" section
2. Wait for speech to start
3. While "Definition" is playing, click volume icon on "Why it happens" section
4. Observe behavior

**Expected Results:**
- ✅ "Definition" speech stops immediately
- ✅ "Why it happens" speech starts
- ✅ Only one section plays at a time
- ✅ No overlapping speech
- ✅ UI updates correctly (Definition icon returns to play, Why icon shows pause)

**Actual Result**: ________________
**Status**: ⬜ PASS ⬜ FAIL ⬜ PARTIAL

---

## Test 6: Bias Switching (Single-Player Rule) ✅
**Steps:**
1. Navigate to bias A (e.g., fundamental-attribution-error)
2. Click "Listen" on bias A
3. Wait for speech to start
4. Navigate to bias B (e.g., self-serving-bias) while A is playing
5. Click "Listen" on bias B

**Expected Results:**
- ✅ Bias A speech stops when navigating away
- ✅ Bias B speech starts cleanly
- ✅ No ghost speech from bias A
- ✅ State is properly reset
- ✅ Console shows no errors

**Actual Result**: ________________
**Status**: ⬜ PASS ⬜ FAIL ⬜ PARTIAL

---

## Test 7: Rapid Clicking (Stress Test) ✅
**Steps:**
1. Click "Listen"
2. Immediately click "Pause"
3. Immediately click "Resume"
4. Immediately click "Pause"
5. Immediately click "Resume"
6. Repeat 3-4 times rapidly

**Expected Results:**
- ✅ No console errors
- ✅ No crashes or freezes
- ✅ UI remains responsive
- ✅ State transitions correctly
- ✅ Speech behaves correctly (pauses/resumes as expected)

**Actual Result**: ________________
**Status**: ⬜ PASS ⬜ FAIL ⬜ PARTIAL

---

## Test 8: Navigation Cleanup (Edge Case) ✅
**Steps:**
1. Click "Listen" on any bias
2. Wait for speech to start
3. Navigate to a different page (e.g., /all or /settings)
4. Check browser console

**Expected Results:**
- ✅ Speech stops when navigating away
- ✅ No console errors
- ✅ No memory leaks
- ✅ No ghost speech continues
- ✅ State is cleaned up properly

**Actual Result**: ________________
**Status**: ⬜ PASS ⬜ FAIL ⬜ PARTIAL

---

## Firefox Desktop Tests
Repeat tests 1-8 in Firefox browser.

**Firefox-Specific Notes:**
- Firefox may have different voice options
- Some browsers may require user interaction before TTS works
- Check if pause/resume works correctly (Firefox has good support)

---

## Console Monitoring
While testing, watch for these in browser console:
- ❌ `[TTS Controller] Error pausing:` - Should not appear
- ❌ `[TTS Controller] Error resuming:` - Should not appear  
- ❌ `InvalidStateError` - Should not appear
- ❌ Any `speechSynthesis` errors
- ✅ `[TTS Controller]` debug logs are OK

---

## Test Results Summary

| Test # | Test Name | Chrome | Firefox | Notes |
|--------|-----------|--------|---------|-------|
| 1 | Basic Full Bias Playback | ⬜ | ⬜ | |
| 2 | Section-Specific Playback | ⬜ | ⬜ | |
| 3 | Pause/Resume | ⬜ | ⬜ | |
| 4 | Reset | ⬜ | ⬜ | |
| 5 | Section Switching | ⬜ | ⬜ | |
| 6 | Bias Switching | ⬜ | ⬜ | |
| 7 | Rapid Clicking | ⬜ | ⬜ | |
| 8 | Navigation Cleanup | ⬜ | ⬜ | |

**Overall Status**: ⬜ ALL PASS ⬜ SOME FAIL ⬜ NEEDS FIXES

**Issues Found**:
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________

---

## Quick Test Script (Copy to Browser Console)

```javascript
// Quick TTS Test Helper
window.ttsTest = {
  checkSupport: () => {
    console.log('TTS Supported:', 'speechSynthesis' in window);
    console.log('TTS Speaking:', window.speechSynthesis?.speaking);
    console.log('TTS Pending:', window.speechSynthesis?.pending);
    console.log('TTS Paused:', window.speechSynthesis?.paused);
  },
  
  getState: () => {
    const synth = window.speechSynthesis;
    return {
      speaking: synth.speaking,
      pending: synth.pending,
      paused: synth.paused,
      voices: synth.getVoices().length
    };
  },
  
  stopAll: () => {
    window.speechSynthesis.cancel();
    console.log('All speech cancelled');
  }
};

// Usage:
// ttsTest.checkSupport()
// ttsTest.getState()
// ttsTest.stopAll()
```

