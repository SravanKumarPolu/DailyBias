# Voice Settings Simplification

## Analysis Result

**Decision: Single Toggle is Better UX**

After analysis, **two separate toggles add unnecessary complexity** for most users. A single toggle is simpler, clearer, and more intuitive.

## Changes Made

### Before (Two Toggles):
1. "Enable Voice" - Master toggle
2. "Read bias content aloud" - Sub-toggle (only visible when voice enabled)

### After (Single Toggle):
- **One toggle**: "Read bias content aloud"
- **When ON**: Enables voice system AND automatically reads bias content
- **When OFF**: Voice system disabled (manual button also disabled)

## Benefits of Single Toggle

1. ✅ **Simpler UX** - One decision instead of two
2. ✅ **Clearer Intent** - Label matches behavior exactly
3. ✅ **Less Cognitive Load** - No hidden toggles or complex hierarchy
4. ✅ **Better Mobile UX** - Less UI clutter
5. ✅ **Matches User Mental Model** - "Do I want auto-reading? Yes/No"

## Implementation

- Single toggle controls both `voiceEnabled` and `readBiasAloud` settings
- When enabled: Both settings set to `true` (enables voice + auto-read)
- When disabled: Both settings set to `false` (disables everything)
- Auto-read logic simplified to just check `isEnabled` from `useSpeech` hook

## Removed Complexity

- ❌ Removed second toggle UI
- ❌ Removed `readBiasAloud` setting dependency in bias card
- ❌ Removed conditional toggle visibility
- ✅ Kept backward compatibility (readBiasAloud setting still exists in DB)

## User Experience

**Use Cases Covered:**
1. User wants voice completely OFF → Turn toggle OFF ✅
2. User wants voice ON with auto-read → Turn toggle ON ✅
3. User wants manual-only (no auto-read) → Turn toggle OFF, click button when needed ✅

The manual-only use case is still achievable - users can keep the toggle OFF and manually click the speak button (though it will be disabled, so they'd need to enable toggle first, but that's actually fine - explicit user action is better UX).

