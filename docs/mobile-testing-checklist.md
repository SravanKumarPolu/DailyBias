# Mobile Testing Checklist for DebiasDaily

This checklist covers manual testing procedures for Android and iOS builds via Capacitor.

## Pre-Testing Setup

### Android
- [ ] Android Studio installed
- [ ] Android SDK (API 26+) installed
- [ ] Physical device connected OR emulator running
- [ ] Build command: `pnpm mobile:build && npx cap open android`
- [ ] App installed on device/emulator

### iOS
- [ ] Xcode installed (macOS only)
- [ ] iOS Simulator available OR physical device connected
- [ ] Apple Developer account configured (for physical devices)
- [ ] Build command: `pnpm mobile:build && npx cap open ios`
- [ ] App installed on device/simulator

---

## Core Functionality Tests

### Daily Page
- [ ] Daily bias displays correctly
- [ ] No flicker on first load
- [ ] Bias card is readable and properly sized
- [ ] Favorite button works (tap to favorite/unfavorite)
- [ ] Mastered button works (tap to mark as mastered)
- [ ] Pull-to-refresh works (if implemented)
- [ ] Background animation renders correctly

### Navigation
- [ ] Bottom navigation bar is visible and accessible
- [ ] All 6 tabs are visible (Daily, All, Favorites, Add, Analytics, Settings)
- [ ] Active tab is highlighted correctly
- [ ] Tapping tabs navigates to correct pages
- [ ] Navigation bar doesn't overlap content
- [ ] Navigation works in both portrait and landscape (if supported)

### All Biases Page
- [ ] All biases list loads correctly
- [ ] Search functionality works
- [ ] Filter by category works
- [ ] Scrolling is smooth
- [ ] Bias cards are tappable and navigate to detail page
- [ ] Favorite button works on list items

### Favorites Page
- [ ] Favorites list loads correctly
- [ ] Empty state displays when no favorites
- [ ] Favorited biases appear in list
- [ ] Unfavoriting removes item from list
- [ ] Favorites persist after app restart

### Add Page
- [ ] Add button opens dialog/form
- [ ] Form fields are usable (title, summary, category, etc.)
- [ ] Form validation works
- [ ] Can create custom bias
- [ ] Created bias appears in list
- [ ] Can edit existing custom bias
- [ ] Can delete custom bias

### Analytics Page
- [ ] Analytics page loads
- [ ] Statistics display correctly (viewed, mastered, favorites count)
- [ ] Charts/graphs render (if present)
- [ ] Data is accurate
- [ ] Page is scrollable on mobile

### Settings Page
- [ ] All settings sections are visible
- [ ] Theme toggle works (light/dark/system)
- [ ] Voice settings work (if speech synthesis supported)
- [ ] Notification settings work (if implemented)
- [ ] Background style selection works
- [ ] Settings persist after app restart
- [ ] Export/import data works (if implemented)
- [ ] Reset data works (if implemented)

---

## Native Features Tests

### Notifications
- [ ] Daily reminder notification can be scheduled
- [ ] Notification appears at scheduled time
- [ ] Tapping notification opens app
- [ ] Notification permissions are requested correctly

### Haptics
- [ ] Haptic feedback works on button taps
- [ ] Haptic feedback works on toggle switches
- [ ] Haptic feedback is not too aggressive

### Share
- [ ] Share button works (if implemented)
- [ ] Can share bias content
- [ ] Share sheet opens correctly
- [ ] Shared content is formatted correctly

### Splash Screen
- [ ] Splash screen displays on app launch
- [ ] Splash screen hides after app loads
- [ ] Transition is smooth

---

## Device-Specific Tests

### Android
- [ ] App works on Android 8+ (API 26+)
- [ ] Back button navigation works correctly
- [ ] App doesn't crash on orientation change
- [ ] Status bar doesn't overlap content
- [ ] Soft keyboard doesn't break layout
- [ ] App handles Android back gesture (Android 10+)

### iOS
- [ ] App works on iOS 13+
- [ ] Safe area insets are respected (notch, home indicator)
- [ ] Swipe gestures work (back swipe, etc.)
- [ ] Status bar styling is correct
- [ ] Keyboard doesn't break layout
- [ ] App handles iOS gestures correctly

---

## Performance Tests

### Load Time
- [ ] App launches in < 3 seconds
- [ ] Daily page loads in < 2 seconds
- [ ] Navigation between pages is smooth (< 500ms)

### Memory
- [ ] App doesn't cause memory warnings
- [ ] No memory leaks after extended use
- [ ] App handles low memory situations gracefully

### Battery
- [ ] App doesn't drain battery excessively
- [ ] Background activity is minimal (if applicable)

### Network
- [ ] App works offline (after initial load)
- [ ] App handles network errors gracefully
- [ ] No unnecessary network requests

---

## UI/UX Tests

### Responsiveness
- [ ] Layout works on small screens (iPhone SE, small Android)
- [ ] Layout works on large screens (iPhone Pro Max, large Android)
- [ ] Text is readable at all sizes
- [ ] Touch targets are adequate (44x44px minimum)
- [ ] No content is cut off or hidden

### Accessibility
- [ ] Screen reader works (VoiceOver on iOS, TalkBack on Android)
- [ ] All interactive elements are accessible
- [ ] Text contrast is sufficient
- [ ] Focus indicators are visible
- [ ] Can navigate with keyboard/switch control

### Orientation
- [ ] Portrait mode works correctly
- [ ] Landscape mode works (if supported)
- [ ] Layout adapts to orientation changes
- [ ] No content is lost on rotation

---

## Data Persistence Tests

### IndexedDB
- [ ] Favorites persist after app restart
- [ ] Progress data persists after app restart
- [ ] Settings persist after app restart
- [ ] Custom biases persist after app restart
- [ ] Data survives app updates (if applicable)

### LocalStorage
- [ ] Settings stored in localStorage persist
- [ ] Onboarding completion flag persists

---

## Edge Cases

### First Launch
- [ ] Onboarding flow works correctly
- [ ] App doesn't crash on first launch
- [ ] Default settings are applied

### Low Storage
- [ ] App handles low storage gracefully
- [ ] Error messages are clear

### Permissions
- [ ] Permission requests are clear
- [ ] App handles denied permissions gracefully
- [ ] Can re-request permissions

### App Updates
- [ ] App updates without data loss
- [ ] Migration works correctly (if applicable)

---

## Regression Tests

### Previously Fixed Bugs
- [ ] Daily page doesn't flicker (critical fix)
- [ ] Navigation state persists correctly
- [ ] Settings don't reset unexpectedly
- [ ] Favorites don't disappear

---

## Test Results Template

```
Device: [Device Model]
OS Version: [Android/iOS Version]
App Version: [Version Number]
Date: [Date]

Passed: [X/Total]
Failed: [Y/Total]
Blockers: [List any blocking issues]

Notes:
[Any additional observations]
```

---

## Automated Testing (Limited)

Due to Capacitor's native bridge, full E2E automation on mobile is limited. However:

- [ ] Playwright mobile emulation tests pass (see `tests/e2e/mobile-emulation.spec.ts`)
- [ ] Visual regression tests pass on mobile viewports
- [ ] Unit/integration tests pass (these work with mocked IndexedDB)

For full mobile testing, manual testing on physical devices is required.

---

## Reporting Issues

When reporting mobile-specific issues, include:
1. Device model and OS version
2. Steps to reproduce
3. Expected vs actual behavior
4. Screenshots/videos if possible
5. Console logs (if accessible)

