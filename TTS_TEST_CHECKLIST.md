# TTS Controls Manual Test Checklist

This document provides a comprehensive manual test plan to verify that all TTS (text-to-speech) controls work correctly and predictably.

## Prerequisites

1. Open the app in a browser that supports Web Speech API (Chrome, Safari, Edge)
2. Ensure voice is enabled in Settings
3. Have at least one bias card visible on the page

## Test Scenarios

### 1. Listen Button - Basic Functionality

**Test 1.1: Start from Idle**
- [ ] Click "Listen" button when no speech is active
- [ ] **Expected**: Speech starts from the beginning of the bias text
- [ ] **Expected**: Button changes to "Pause"
- [ ] **Expected**: Reset button becomes enabled

**Test 1.2: Listen When Paused**
- [ ] Click "Listen" to start speech
- [ ] Click "Pause" to pause speech
- [ ] Click "Listen" again (should behave like Resume)
- [ ] **Expected**: Speech resumes from the paused position (not from beginning)
- [ ] **Expected**: Button changes to "Pause"

**Test 1.3: Listen When Playing**
- [ ] Click "Listen" to start speech
- [ ] While speech is playing, click "Listen" again
- [ ] **Expected**: Speech pauses immediately
- [ ] **Expected**: Button changes to "Resume"

### 2. Pause Button

**Test 2.1: Pause While Playing**
- [ ] Click "Listen" to start speech
- [ ] Wait for speech to start (at least 2-3 seconds)
- [ ] Click "Pause" button
- [ ] **Expected**: Speech pauses immediately (no restarting)
- [ ] **Expected**: Button changes to "Resume"
- [ ] **Expected**: State becomes `paused=true, speaking=false`
- [ ] **Expected**: Reset button remains enabled

**Test 2.2: Pause When Not Playing**
- [ ] Ensure no speech is active (idle state)
- [ ] Try to click "Pause" (button should not be visible or should be disabled)
- [ ] **Expected**: No action occurs, state remains idle

**Test 2.3: Pause Multiple Times**
- [ ] Click "Listen" to start speech
- [ ] Click "Pause"
- [ ] Click "Resume" to resume
- [ ] Click "Pause" again
- [ ] **Expected**: Each pause works correctly, speech stops immediately

### 3. Resume Button

**Test 3.1: Resume After Pause**
- [ ] Click "Listen" to start speech
- [ ] Wait for speech to play for 5-10 seconds
- [ ] Click "Pause"
- [ ] Click "Resume"
- [ ] **Expected**: Speech resumes from the exact point where paused (not from beginning)
- [ ] **Expected**: Button changes to "Pause"
- [ ] **Expected**: State becomes `speaking=true, paused=false`

**Test 3.2: Resume When Not Paused**
- [ ] Ensure no speech is active (idle state)
- [ ] Try to click "Resume" (button should not be visible)
- [ ] **Expected**: No action occurs, state remains idle

**Test 3.3: Resume Multiple Times**
- [ ] Click "Listen" to start speech
- [ ] Click "Pause"
- [ ] Click "Resume"
- [ ] Click "Pause" again
- [ ] Click "Resume" again
- [ ] **Expected**: Each resume continues from the correct position

### 4. Reset Button

**Test 4.1: Reset While Playing**
- [ ] Click "Listen" to start speech
- [ ] Wait for speech to play for 5-10 seconds
- [ ] Click "Reset"
- [ ] **Expected**: Speech stops immediately
- [ ] **Expected**: State becomes `speaking=false, paused=false`
- [ ] **Expected**: Button changes to "Listen" (not "Resume")
- [ ] **Expected**: Reset button becomes disabled

**Test 4.2: Reset While Paused**
- [ ] Click "Listen" to start speech
- [ ] Click "Pause"
- [ ] Click "Reset"
- [ ] **Expected**: Speech stops and all state is cleared
- [ ] **Expected**: Button changes to "Listen" (not "Resume")
- [ ] **Expected**: Reset button becomes disabled

**Test 4.3: Reset Then Listen Again**
- [ ] Click "Listen" to start speech
- [ ] Wait for speech to play for 5-10 seconds
- [ ] Click "Reset"
- [ ] Click "Listen" again
- [ ] **Expected**: Speech starts from the beginning (not from previous position)

**Test 4.4: Reset When Idle**
- [ ] Ensure no speech is active
- [ ] **Expected**: Reset button is disabled

### 5. No Auto-Play

**Test 5.1: Page Load**
- [ ] Reload the page
- [ ] **Expected**: No speech starts automatically
- [ ] **Expected**: All buttons show "Listen" (not "Resume" or "Pause")

**Test 5.2: Navigation**
- [ ] Navigate to a different page/route
- [ ] **Expected**: No speech starts automatically
- [ ] **Expected**: If speech was playing, it should stop

### 6. Navigation/Content Changes

**Test 6.1: Switch Between Biases**
- [ ] Click "Listen" on Bias A
- [ ] Wait for speech to start
- [ ] Navigate to or click on Bias B
- [ ] Click "Listen" on Bias B
- [ ] **Expected**: Speech for Bias A stops
- [ ] **Expected**: Speech for Bias B starts from beginning

**Test 6.2: Content Change (Same Bias)**
- [ ] Click "Listen" on a bias
- [ ] Wait for speech to start
- [ ] If the bias content changes (e.g., user edits), click "Listen" again
- [ ] **Expected**: Previous speech stops
- [ ] **Expected**: New speech starts from beginning with new content

### 7. Button State Accuracy

**Test 7.1: State Reflection**
- [ ] Click "Listen" → **Expected**: Button shows "Pause"
- [ ] Click "Pause" → **Expected**: Button shows "Resume"
- [ ] Click "Resume" → **Expected**: Button shows "Pause"
- [ ] Click "Reset" → **Expected**: Button shows "Listen"

**Test 7.2: Multiple Bias Cards**
- [ ] Have multiple bias cards visible on the page
- [ ] Click "Listen" on Bias A
- [ ] **Expected**: Only Bias A shows "Pause", other cards show "Listen"
- [ ] Click "Pause" on Bias A
- [ ] **Expected**: Only Bias A shows "Resume", other cards show "Listen"
- [ ] Click "Listen" on Bias B
- [ ] **Expected**: Bias A resets to "Listen", Bias B shows "Pause"

**Test 7.3: Button Disable States**
- [ ] When voice is disabled in Settings → **Expected**: All TTS buttons are disabled
- [ ] When browser doesn't support TTS → **Expected**: All TTS buttons are disabled
- [ ] When idle and Reset button → **Expected**: Reset button is disabled
- [ ] When playing/paused and Reset button → **Expected**: Reset button is enabled

### 8. Cleanup and Edge Cases

**Test 8.1: Unmount During Playback**
- [ ] Click "Listen" to start speech
- [ ] Navigate away or close the page
- [ ] **Expected**: Speech stops (no memory leaks)
- [ ] **Expected**: No console errors

**Test 8.2: Rapid Clicking**
- [ ] Rapidly click "Listen", "Pause", "Resume" multiple times
- [ ] **Expected**: No errors, state remains consistent
- [ ] **Expected**: Final state matches last action

**Test 8.3: Voice Disabled During Playback**
- [ ] Click "Listen" to start speech
- [ ] While speech is playing, disable voice in Settings
- [ ] **Expected**: Speech stops immediately
- [ ] **Expected**: State resets to idle

### 9. Cross-Browser Compatibility

**Test 9.1: Chrome/Edge**
- [ ] Test all scenarios above in Chrome or Edge
- [ ] **Expected**: Native pause/resume works

**Test 9.2: Safari**
- [ ] Test all scenarios above in Safari
- [ ] **Expected**: Works correctly (may use chunk-based fallback)

**Test 9.3: Mobile (iOS Safari/Chrome)**
- [ ] Test on mobile device
- [ ] **Expected**: All controls work (may use chunk-based pause/resume)
- [ ] **Expected**: No auto-play (requires user gesture)

### 10. Section-Specific Controls

**Test 10.1: Section Listen Buttons**
- [ ] Click section-specific "Listen" button (Definition, Why, Counter)
- [ ] **Expected**: Only that section is read
- [ ] **Expected**: Main "Listen" button reflects the state

**Test 10.2: Switch Between Sections**
- [ ] Click "Listen" on Definition section
- [ ] While playing, click "Listen" on Why section
- [ ] **Expected**: Definition stops, Why section starts

## Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ State always matches UI
- ✅ No speech continues after reset/navigation
- ✅ Buttons reflect actual engine state
- ✅ No memory leaks
- ✅ Consistent behavior across browsers

## Notes

- Some browsers (especially mobile) may use chunk-based pause/resume instead of native pause/resume
- Speech may resume from chunk boundaries rather than exact word positions (Web Speech API limitation)
- User gesture is required to start speech (no auto-play)
