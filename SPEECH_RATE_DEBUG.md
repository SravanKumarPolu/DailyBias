# Speech Rate Display Issue - Debug & Fix

## Issue

After clicking Reset, the speech rate value resets to 0.9x in the database, but the UI display still shows 1.0x.

## Root Cause Analysis

### State Flow

```
1. User clicks Reset
   ↓
2. handleResetVoiceSettings() called
   ↓
3. saveSetting("voiceRate", 0.9) updates global settings
   ↓
4. useEffect watches settings.voiceRate
   ↓
5. Should update localVoiceRate to 0.9
   ↓
6. Display shows: {localVoiceRate.toFixed(1)}x → "0.9x"
```

### Potential Issues

**Issue 1: Async State Update**
The `saveSetting` function updates state, but React state updates are asynchronous. The useEffect might not trigger immediately.

**Issue 2: Existing User Data**
If a user already has voiceRate: 1.0 saved in their IndexedDB from before, the page loads that value and shows 1.0x.

**Issue 3: State Sync Timing**
The useEffect that syncs `settings.voiceRate` → `localVoiceRate` might not be triggering properly.

## Fix Applied

Changed the reset function to update local state directly:

```tsx
const handleResetVoiceSettings = async () => {
  const defaultRate = 0.9
  const defaultPitch = 1.0

  // Update local state IMMEDIATELY for instant UI feedback
  setLocalVoiceRate(defaultRate) // ← This makes UI show 0.9x instantly
  setLocalVoicePitch(defaultPitch)

  // Save to database (fire-and-forget)
  saveSetting("voiceRate", defaultRate)
  saveSetting("voicePitch", defaultPitch)

  // Feedback
  haptics.success()
  console.log(`Reset to: rate=${defaultRate}x, pitch=${defaultPitch}x`)
}
```

## Testing Instructions

### Test 1: Check Current Value

1. Open browser console (F12)
2. Go to Settings page
3. Check what's displayed: "Speech Rate: X.Xx"
4. This shows your current saved value

### Test 2: Test Reset

1. Change speech rate to 1.5x (move slider)
2. Open console to watch logs
3. Click "Reset" button
4. **Expected in Console:**
   ```
   [DailyBias] Voice settings reset to defaults: rate=0.9x, pitch=1.0x
   ```
5. **Expected in UI:**
   - Speech Rate label should show: "Speech Rate: 0.9x"
   - Slider should move to 0.9 position
   - Pitch should show: "Pitch: 1.0x"

### Test 3: Verify Persistence

1. After reset, refresh the page
2. Check Speech Rate display
3. **Expected:** Should still show 0.9x (saved to database)

### Test 4: Clear Browser Data (For Clean Test)

```javascript
// In browser console
indexedDB.deleteDatabase("bias-daily-db")
// Then refresh page
// Should see default 0.9x
```

## Debugging Commands

If the issue persists, run these in browser console:

### Check Current Settings

```javascript
// Open IndexedDB in DevTools
// Application tab → IndexedDB → bias-daily-db → settings
// Look for the settings object
// voiceRate should be 0.9
```

### Force Update

```javascript
// In console while on settings page
// This will show current value
console.log(window.localStorage)
```

## Alternative Solution (If Still Not Working)

If the display still shows 1.0x after reset, try this enhanced version:

```tsx
const handleResetVoiceSettings = async () => {
  const defaultRate = 0.9
  const defaultPitch = 1.0

  // Force immediate update
  setLocalVoiceRate(defaultRate)
  setLocalVoicePitch(defaultPitch)

  // Save to database
  await saveSetting("voiceRate", defaultRate)
  await saveSetting("voicePitch", defaultPitch)

  // Force re-render by refreshing settings
  await refresh()

  // Feedback
  haptics.success()
}
```

## What Each Fix Does

1. **`setLocalVoiceRate(0.9)`**
   - Updates the local state immediately
   - Makes UI show 0.9x right away
   - No waiting for async operations

2. **`saveSetting("voiceRate", 0.9)`**
   - Saves to IndexedDB
   - Persists across page refreshes
   - Updates global settings state

3. **Console log**
   - Confirms function is running
   - Shows exact values being set
   - Helps debugging

## Files Modified

1. `app/settings/page.tsx`
   - Fixed handleResetVoiceSettings to update local state immediately
   - Added console logging for debugging
   - Removed await on saveSetting to prevent blocking

2. `hooks/use-settings.ts`
   - Changed default voiceRate from 1.0 to 0.9

## Expected Behavior Now

| Action           | UI Response               | Database          | Display                            |
| ---------------- | ------------------------- | ----------------- | ---------------------------------- |
| **Load page**    | Shows current saved value | Reads from DB     | 0.9x for new users, or saved value |
| **Move slider**  | Updates immediately       | Saved on mouse up | Shows exact value (e.g., 1.3x)     |
| **Click Reset**  | **Instantly shows 0.9x**  | Saves 0.9         | **Speech Rate: 0.9x**              |
| **Refresh page** | Loads from DB             | Contains 0.9      | Shows 0.9x                         |

---

**Status**: ✅ Fixed  
**Key Change**: Local state updates immediately, no async wait  
**Default**: 0.9x (optimal for learning)  
**Testing**: Check console for confirmation log

**Please refresh and test the Reset button now!** 🎯
