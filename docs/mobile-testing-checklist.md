# Capacitor Mobile Testing Checklist

## Overview

This checklist covers manual and automated testing for DebiasDaily's Capacitor mobile apps (Android & iOS).

## Pre-Testing Setup

### Android
- [ ] Android Studio installed
- [ ] Android SDK configured (API 21+)
- [ ] Physical device connected OR emulator running
- [ ] USB debugging enabled (for physical devices)
- [ ] `pnpm mobile:build` completed successfully

### iOS
- [ ] Xcode installed (latest stable)
- [ ] CocoaPods installed (`sudo gem install cocoapods`)
- [ ] Physical device connected OR simulator running
- [ ] Apple Developer account configured (for physical devices)
- [ ] `pnpm mobile:build` completed successfully

## Automated Testing (Limited)

### Playwright Mobile Emulation
- [ ] Run `pnpm e2e --project=mobile-chrome` (Android emulation)
- [ ] Run `pnpm e2e --project=mobile-safari` (iOS emulation)
- [ ] Verify all E2E tests pass on mobile viewports
- [ ] Check visual regression snapshots for mobile

**Limitations:**
- Cannot test native Capacitor plugins (notifications, share)
- Cannot test device-specific features (haptic feedback, biometrics)
- Cannot test app store builds
- Cannot test offline behavior accurately

## Manual Testing Checklist

### Core Functionality

#### Daily Page
- [ ] App opens to Daily page
- [ ] Daily bias displays correctly
- [ ] Bias card is readable and properly formatted
- [ ] Favorite button works (tap to favorite/unfavorite)
- [ ] Mastered button works (if present)
- [ ] Pull-to-refresh works (if implemented)
- [ ] No flicker on initial load
- [ ] Date header displays correctly

#### Navigation
- [ ] Bottom navigation is visible and accessible
- [ ] All 6 tabs are tappable (Daily, All, Favorites, Add, Analytics, Settings)
- [ ] Active tab is highlighted correctly
- [ ] Navigation works smoothly (no lag)
- [ ] Navigation persists across app restarts

#### All Biases Page
- [ ] All biases list loads
- [ ] Search works
- [ ] Category filters work
- [ ] Bias cards are tappable
- [ ] Scrolling is smooth
- [ ] Favorite button works on each card

#### Favorites Page
- [ ] Favorites list loads
- [ ] Previously favorited biases appear
- [ ] Unfavorite works
- [ ] Empty state displays when no favorites
- [ ] Favorites persist after app restart

#### Add Page
- [ ] Add button opens dialog/form
- [ ] Form fields are accessible
- [ ] Form validation works
- [ ] Can create custom bias
- [ ] Custom bias appears in list
- [ ] Can edit custom bias
- [ ] Can delete custom bias

#### Analytics Page
- [ ] Analytics page loads
- [ ] Charts/graphs render correctly
- [ ] Statistics are accurate
- [ ] Data updates when viewing biases
- [ ] No performance issues with large datasets

#### Settings Page
- [ ] All settings toggles work
- [ ] Theme toggle works (light/dark)
- [ ] Voice settings work
- [ ] Notification settings work
- [ ] Background style changes apply
- [ ] Settings persist after app restart
- [ ] Export/import works (if implemented)

### Native Features

#### Notifications (Capacitor)
- [ ] Daily reminder notification appears at set time
- [ ] Notification opens app when tapped
- [ ] Notification permissions requested correctly
- [ ] Can enable/disable notifications in settings

#### Share (Capacitor)
- [ ] Share button works (if implemented)
- [ ] Share dialog appears
- [ ] Can share bias to other apps
- [ ] Shared content is formatted correctly

#### Splash Screen
- [ ] Splash screen displays on app launch
- [ ] Splash screen hides after app loads
- [ ] No white flash between splash and app

### Performance

#### App Launch
- [ ] App launches in <3 seconds (cold start)
- [ ] App launches in <1 second (warm start)
- [ ] No blank screen on launch
- [ ] No crashes on launch

#### Navigation Performance
- [ ] Page transitions are smooth (<300ms)
- [ ] No lag when switching tabs
- [ ] No memory leaks after extended use

#### Data Loading
- [ ] Biases load quickly (<2 seconds)
- [ ] No loading spinners that never finish
- [ ] Offline behavior works (if implemented)

### Device-Specific Testing

#### Android
- [ ] Test on Android 8.0+ (API 26+)
- [ ] Test on different screen sizes (phone, tablet)
- [ ] Test on different manufacturers (Samsung, Google, OnePlus, etc.)
- [ ] Back button works correctly
- [ ] App doesn't close unexpectedly on back press
- [ ] App state persists when backgrounded

#### iOS
- [ ] Test on iOS 13.0+
- [ ] Test on iPhone (various sizes)
- [ ] Test on iPad (if supported)
- [ ] Swipe gestures work correctly
- [ ] Safe area insets respected (notch, home indicator)
- [ ] App state persists when backgrounded

### Responsive Design

#### Small Screens (320-375px width)
- [ ] Content is readable
- [ ] Touch targets are adequate (44x44px minimum)
- [ ] No horizontal scrolling
- [ ] Navigation is accessible
- [ ] Text doesn't overflow

#### Medium Screens (375-768px width)
- [ ] Layout adapts correctly
- [ ] Content is well-spaced
- [ ] Navigation is accessible

#### Large Screens (768px+ width)
- [ ] Layout uses available space
- [ ] Content doesn't stretch too wide
- [ ] Tablet-specific optimizations (if any)

### Accessibility

#### Screen Reader (Android TalkBack / iOS VoiceOver)
- [ ] All interactive elements are announced
- [ ] Navigation is understandable
- [ ] Bias content is readable
- [ ] Buttons have descriptive labels
- [ ] Forms are navigable

#### Keyboard Navigation (Android TV / External keyboards)
- [ ] Can navigate with keyboard
- [ ] Focus indicators are visible
- [ ] Tab order is logical

### Error Handling

#### Network Errors
- [ ] App handles offline gracefully
- [ ] Error messages are clear
- [ ] Retry mechanisms work (if implemented)

#### Data Errors
- [ ] App handles corrupted data
- [ ] App handles missing data
- [ ] App doesn't crash on invalid input

### Edge Cases

#### First Launch
- [ ] Onboarding flow works (if implemented)
- [ ] App doesn't crash on first launch
- [ ] Default settings are applied

#### App Updates
- [ ] App updates without data loss
- [ ] Settings persist across updates
- [ ] Favorites persist across updates
- [ ] Progress persists across updates

#### Low Memory
- [ ] App works on low-end devices
- [ ] No crashes under memory pressure
- [ ] Performance is acceptable

#### Battery Usage
- [ ] App doesn't drain battery excessively
- [ ] Background tasks are optimized

## Testing Tools

### Android
- **Android Studio**: Debugging, profiling, logcat
- **adb**: Command-line debugging
- **Chrome DevTools**: Remote debugging (chrome://inspect)

### iOS
- **Xcode**: Debugging, profiling, console
- **Safari Web Inspector**: Remote debugging
- **Instruments**: Performance profiling

## Test Scenarios

### Scenario 1: New User Flow
1. Install app
2. Complete onboarding (if any)
3. View daily bias
4. Favorite a bias
5. Navigate to Favorites
6. View bias details
7. Change settings
8. Restart app
9. Verify all data persisted

### Scenario 2: Daily Usage
1. Open app
2. View daily bias
3. Mark as mastered
4. Navigate to All
5. Search for a bias
6. View analytics
7. Change theme
8. Background app
9. Return to app
10. Verify state persisted

### Scenario 3: Extended Session
1. Open app
2. Navigate through all pages
3. Create custom bias
4. Favorite multiple biases
5. View analytics multiple times
6. Change settings multiple times
7. Use app for 30+ minutes
8. Verify no memory leaks
9. Verify no performance degradation

## Reporting Issues

When reporting issues, include:
- Device model and OS version
- App version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos
- Logs (if available)

## Automation Limitations

The following cannot be fully automated and require manual testing:
- Native Capacitor plugins (notifications, share, etc.)
- Device-specific features (haptics, biometrics)
- App store builds
- Real-world network conditions
- Battery usage
- Memory pressure scenarios
- User experience and usability

## Continuous Testing

### Before Each Release
- [ ] Run all manual tests on at least 2 Android devices
- [ ] Run all manual tests on at least 2 iOS devices
- [ ] Test on different screen sizes
- [ ] Test on different OS versions
- [ ] Verify no regressions from previous version

### Automated CI Testing
- [ ] Playwright mobile emulation tests pass
- [ ] Visual regression tests pass
- [ ] Accessibility tests pass
- [ ] Performance tests pass (Lighthouse)

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Testing Guide](https://developer.android.com/training/testing)
- [iOS Testing Guide](https://developer.apple.com/documentation/xctest)
- [Playwright Mobile Testing](https://playwright.dev/docs/emulation)
