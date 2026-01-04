# Voice Settings UI Fix - Separate Toggle Implementation

## Summary
Fixed the UI discrepancy where "Read bias content aloud" was shown as descriptive text instead of a separate toggle switch, matching the design shown in the image.

## Changes Made

### 1. Added New Setting: `readBiasAloud`
- **Location**: `lib/types.ts`
- **Type**: `boolean | undefined` (optional for backward compatibility)
- **Default**: `false` (user must manually trigger reading by default)

### 2. Updated Default Settings
- **Files**: 
  - `lib/db.ts` - Added default value in database defaults
  - `hooks/use-settings.ts` - Added default value in hook state

### 3. Updated UI in Settings Page
- **File**: `app/settings/page.tsx`
- **Changes**:
  - Separated "Enable Voice" and "Read bias content aloud" into two distinct toggles
  - "Enable Voice" is the master toggle with description: "Enable text-to-speech functionality"
  - "Read bias content aloud" is now a separate toggle (only visible when voice is enabled)
    - Description: "Automatically read bias content when viewing"
    - Has its own `data-testid="setting-read-bias-aloud"` for testing

### 4. Added Auto-Read Functionality
- **File**: `components/bias-card.tsx`
- **Implementation**:
  - Added `useSettings()` hook to access `readBiasAloud` setting
  - Added `useEffect` hook to automatically read bias content when:
    - `readBiasAloud` setting is enabled
    - Voice is enabled
    - Speech is supported
    - Bias card is mounted
  - Uses a ref to track if auto-read has already occurred for current bias
  - Only reads once per bias (resets when bias ID changes)
  - Silent failure (no toast) for auto-read to avoid interrupting user experience

## Behavior

### Toggle Hierarchy
1. **Enable Voice** (Master Toggle)
   - When OFF: All voice features are disabled
   - When ON: Voice system is enabled, additional controls appear

2. **Read bias content aloud** (Sub-toggle, only visible when voice is enabled)
   - When OFF: User must manually click speak button to read bias
   - When ON: Bias content automatically starts reading when bias card appears
   - Requires "Enable Voice" to be ON to function

### Auto-Read Behavior
- Triggers automatically when bias card is displayed (mounted)
- Only reads once per bias (tracks by bias ID)
- Includes full bias content: title, summary, why, counter, examples, and tips
- Small 500ms delay to ensure UI is settled before starting speech
- Respects all voice settings (rate, pitch, voice selection)

## Testing

### Manual Testing Steps
1. Navigate to Settings page
2. Verify "Enable Voice" toggle is visible and works
3. Enable "Enable Voice" toggle
4. Verify "Read bias content aloud" toggle appears below
5. Toggle "Read bias content aloud" on/off
6. Navigate to home page with a bias
7. With auto-read enabled, verify bias automatically starts reading
8. With auto-read disabled, verify bias does NOT auto-read (manual button still works)

### E2E Test Coverage
- Test ID: `setting-read-bias-aloud` is available for automated testing
- Existing voice settings tests should continue to pass

## Backward Compatibility
- New setting is optional (`readBiasAloud?: boolean`)
- Defaults to `false` for existing users
- No migration needed - existing users will have manual-only reading by default

## UI Match with Design
✅ "Enable Voice" toggle - Master control  
✅ "Read bias content aloud" toggle - Separate, independent control  
✅ Proper hierarchy and visibility  
✅ Descriptive text for each toggle  
✅ Matches the design shown in the image

