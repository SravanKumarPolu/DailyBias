# Device Testing Quick Start Guide

## 🚀 5-Minute Quick Test

Run these essential tests before each release:

### Critical Path (5 minutes)
- [ ] **App Launch**: App opens without crashing
- [ ] **Daily Page**: Daily bias displays correctly
- [ ] **Navigation**: All 6 tabs work (Daily, All, Favorites, Add, Analytics, Settings)
- [ ] **Favorite**: Tap favorite button - works and persists
- [ ] **Settings**: Theme toggle works (light/dark)
- [ ] **Restart**: Close and reopen app - data persists

### Platform-Specific (2 minutes each)
**Android:**
- [ ] Back button works correctly
- [ ] App doesn't close unexpectedly

**iOS:**
- [ ] Swipe gestures work
- [ ] Safe area respected (notch/home indicator)

## 📱 Essential Test Scenarios

### Scenario 1: New User (3 minutes)
1. Fresh install → Onboarding appears
2. View daily bias → Content displays
3. Favorite a bias → Heart fills
4. Go to Favorites → Bias appears
5. Change theme → Applies immediately
6. Restart app → Everything persists ✅

### Scenario 2: Daily Usage (2 minutes)
1. Open app → Daily bias loads
2. Navigate to All → List loads
3. Search for bias → Results appear
4. View Analytics → Charts render
5. Background app → Return → State preserved ✅

## ⚡ Performance Checks

- [ ] **Cold Start**: <3 seconds from tap to usable
- [ ] **Warm Start**: <1 second
- [ ] **Navigation**: <300ms between pages
- [ ] **No Flicker**: Smooth transitions

## 🎯 Device Coverage Minimum

**Before Release:**
- [ ] 1 Android device (API 26+)
- [ ] 1 iOS device (iOS 13+)
- [ ] Different screen sizes tested

**Full Coverage:**
- [ ] 2+ Android devices (different manufacturers)
- [ ] 2+ iOS devices (iPhone + iPad if supported)
- [ ] Various screen sizes (small, medium, large)

## 🔧 Quick Setup Commands

```bash
# Build for mobile
pnpm mobile:build

# Open in Android Studio
pnpm android:open

# Open in Xcode
pnpm ios:open

# Run automated mobile emulation tests
pnpm e2e --project=mobile-chrome
pnpm e2e --project=mobile-safari
```

## 📋 Full Checklist

For comprehensive testing, see: [`mobile-testing-checklist.md`](./mobile-testing-checklist.md)

## 🐛 Issue Reporting Template

```
Device: [Model + OS Version]
Issue: [Brief description]
Steps: 
1. [Step 1]
2. [Step 2]
Expected: [What should happen]
Actual: [What actually happens]
Screenshot: [Attach if available]
```

## ✅ Pre-Release Checklist

- [ ] All critical path tests pass
- [ ] At least 1 Android + 1 iOS device tested
- [ ] Performance targets met
- [ ] No crashes on launch
- [ ] Data persists after restart
- [ ] Automated mobile emulation tests pass

---

**Time Estimate:**
- Quick test: ~10 minutes
- Essential scenarios: ~5 minutes
- Full checklist: ~60-90 minutes

