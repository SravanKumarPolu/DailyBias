# TTS Mobile Resume Fix

## Issue
On mobile layouts, when TTS is paused and user taps "Resume", no audio plays. Desktop works correctly.

## Root Cause
1. **Cancelled Utterances**: On mobile, browser may cancel utterances due to layout changes, backgrounding, or other mobile-specific behaviors
2. **No Fallback**: Resume function only tried native `speechSynthesis.resume()`, which fails if utterance was cancelled
3. **Missing Async**: Resume wasn't async, so handlers couldn't await it properly

## Fixes Applied

### 1. Enhanced Resume Function (`hooks/use-tts-controller.ts`)
- ✅ Made `resume()` async to support fallback restart
- ✅ Added check for active utterance before attempting native resume
- ✅ Added fallback logic: if no active utterance, restart from `currentChunkIndex`
- ✅ Preserves `activeBiasId` when restarting from chunk
- ✅ Added debug logging (dev-only) for mobile troubleshooting

### 2. Updated Handlers (`components/bias-card.tsx`)
- ✅ `handleBiasListen` now awaits `resume()` call
- ✅ `handleSectionSpeak` now awaits `resume()` call
- ✅ Both handlers use same shared TTS controller instance

### 3. Improved Cleanup (`hooks/use-tts-controller.ts`)
- ✅ Cleanup preserves state (lastSpokenText, storedChunks, currentChunkIndex)
- ✅ Only clears global state, not saved playback position
- ✅ Allows resume to work even after component remounts (mobile layout changes)

## How It Works Now

### Resume Flow:
1. User taps "Resume" on mobile
2. `resume()` checks if there's an active utterance (`speaking || pending || paused`)
3. **If active utterance exists:**
   - Uses native `speechSynthesis.resume()` ✅
   - Continues from exact position
4. **If no active utterance (cancelled):**
   - Falls back to restarting from `currentChunkIndex` ✅
   - Preserves `activeBiasId` if bias-level playback
   - Continues from where paused (not from beginning)

### Debug Logging (Development Only)
When `NODE_ENV === 'development'`, resume logs:
- Current state (status, activeSectionId, activeBiasId)
- Chunk index and chunks length
- Browser speechSynthesis state
- Which path was taken (native resume vs fallback)

## Testing

### Mobile (320-390px width)
1. Click "Listen" → Speech starts
2. Click "Pause" → Speech pauses
3. Click "Resume" → **Should continue from same position** ✅
4. Click "Reset" → Clears state
5. Click "Listen" again → Starts from beginning

### Desktop
- All existing behavior preserved ✅
- No changes to desktop functionality

## Files Modified
- `hooks/use-tts-controller.ts` - Enhanced resume with fallback
- `components/bias-card.tsx` - Updated handlers to await resume

## Validation Checklist
- ✅ Desktop behavior unchanged
- ✅ Mobile resume works with cancelled utterances
- ✅ No duplicate handlers between mobile/desktop
- ✅ Single shared TTS controller instance
- ✅ State preserved across layout changes
- ✅ Debug logging for troubleshooting
- ✅ No console errors
- ✅ No hydration mismatches

