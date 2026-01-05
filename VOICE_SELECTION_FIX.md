# Voice Selection Bug Fix

## Problem
Only "Samantha" voice was working. When users selected other voices, they weren't being used - the system kept falling back to Samantha.

## Root Cause Analysis

### Issue 1: Case-Sensitive Exact Matching
- Voice name matching was case-sensitive (`voice.name === targetVoiceName`)
- Browser voice names might have different casing (e.g., "Samantha" vs "SAMANTHA")
- When exact match failed, system fell back to priority list

### Issue 2: Priority List Override
- When exact match failed, the code immediately fell back to priority list
- Priority list had "Samantha" as second priority
- This caused Samantha to always be selected when other voices weren't found

### Issue 3: Auto-Selection Override
- Settings page had auto-selection logic that would override user's choice
- If a "better" voice was found, it would replace user's selection

## Fixes Applied

### Fix 1: Case-Insensitive Matching (3 levels)
```typescript
// 1. Try exact match (case-sensitive)
selectedVoice = voices.find((voice) => voice.name === targetVoiceName)

// 2. Try case-insensitive exact match
if (!selectedVoice) {
  selectedVoice = voices.find((voice) => 
    voice.name.toLowerCase() === targetVoiceName.toLowerCase()
  )
}

// 3. Try partial match (for variations)
if (!selectedVoice) {
  const targetLower = targetVoiceName.toLowerCase()
  selectedVoice = voices.find((voice) => 
    voice.name.toLowerCase().includes(targetLower) ||
    targetLower.includes(voice.name.toLowerCase())
  )
}
```

**Benefit:** Matches voices even with casing differences or slight name variations

### Fix 2: Priority List Only for First-Time Setup
```typescript
// Only use priority list if no user selection exists
if (!settings.voiceName) {
  // ... priority list logic
}
```

**Benefit:** Prevents priority list from overriding user's explicit voice choice

### Fix 3: Prevent Auto-Selection Override
```typescript
// Only auto-select if user hasn't explicitly selected a voice yet
if (bestVoice && !settings.voiceName) {
  saveSetting("voiceName", bestVoice.name)
}
```

**Benefit:** Respects user's explicit voice selection and doesn't override it

## Testing

### Test Cases:
1. ✅ Select "Google US English" → Should use Google US English
2. ✅ Select "Samantha" → Should use Samantha
3. ✅ Select "Alex" → Should use Alex
4. ✅ Select any other voice → Should use that voice
5. ✅ Test voice button should use selected voice
6. ✅ Auto-read should use selected voice
7. ✅ Manual speak button should use selected voice

### Verification Steps:
1. Open Settings → Voice Settings
2. Enable "Read bias content aloud"
3. Open voice selector dropdown
4. Select a different voice (not Samantha)
5. Click "Test Voice" button
6. Verify the selected voice is used (check console logs)
7. Navigate to home page
8. Verify bias auto-reads with selected voice

## Console Logs for Debugging

The fix adds better logging:
- `[Speech] Using selected voice: [voice name]` - When exact match works
- `[Speech] Target voice not found: [voice name]` - When voice isn't found (lists available voices)
- `[Speech] Using priority voice as fallback:` - Only when no user selection exists

## Expected Behavior After Fix

1. **User selects voice** → Voice is saved to settings
2. **Speak is called** → System tries to find selected voice:
   - Exact match (case-sensitive)
   - Exact match (case-insensitive)
   - Partial match
   - If found → Use it
   - If not found → Log warning and use fallback
3. **No override** → User's selection is never overridden by auto-selection
4. **All voices work** → Any voice selected in dropdown will be used

## Files Changed

1. `hooks/use-speech.ts` - Fixed `selectBestVoice` function
2. `app/settings/page.tsx` - Fixed auto-selection logic

## Status

✅ **FIXED** - All voices should now work correctly when selected by the user.


