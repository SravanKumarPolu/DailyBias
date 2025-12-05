# Quick Start: Mobile App Development

## 🚀 Get Started in 3 Steps

### 1. Build Web App
```bash
pnpm mobile:build
```
This builds your web app and syncs it to native platforms.

### 2. Open Native IDE

**For Android:**
```bash
pnpm android:open
```
Then in Android Studio:
- Wait for Gradle sync
- Select device/emulator
- Click Run ▶️

**For iOS:**
```bash
pnpm ios:open
```
Then in Xcode:
- Select simulator/device
- Click Run ▶️

### 3. Test Native Features

- **Notifications**: Should schedule automatically on app start (9 AM daily)
- **Share**: Tap share button on any bias card
- **Offline**: Enable airplane mode, app should still work

## 📱 What's Implemented

✅ **Capacitor Setup**: Complete
✅ **Android Platform**: Ready
✅ **iOS Platform**: Ready (needs Xcode)
✅ **Notifications**: Daily reminder at 9 AM
✅ **Share**: Native share sheet
✅ **Offline**: All data local (works in airplane mode)
✅ **Date Flicker Fix**: Storage-based initialization

## 🔧 Common Commands

```bash
# Build and sync
pnpm mobile:build

# Sync only (after web changes)
pnpm mobile:sync

# Open native IDEs
pnpm android:open
pnpm ios:open

# Sync to specific platform
pnpm android:sync
pnpm ios:sync
```

## 📚 Full Documentation

- **Setup Guide**: `MOBILE_SETUP.md`
- **Implementation Summary**: `MOBILE_IMPLEMENTATION_SUMMARY.md`
- **Final Check**: `FINAL_CHECK.md`

## ⚠️ Prerequisites

**Android:**
- Android Studio installed
- Android SDK configured

**iOS:**
- macOS with Xcode installed
- Run `cd ios/App && pod install` first time

## 🐛 Troubleshooting

**App crashes on launch:**
- Ensure `pnpm mobile:build` ran successfully
- Check `capacitor.config.ts` has correct `webDir: 'out'`

**Notifications not working:**
- Check permissions in device settings
- Android: Ensure `POST_NOTIFICATIONS` permission granted
- iOS: Check notification permissions in Settings

**Changes not appearing:**
- Always run `pnpm mobile:build` after web changes
- Or use `npx cap sync` to sync without rebuilding

## ✅ Testing Checklist

Before submitting to stores:
- [ ] App launches without crash
- [ ] Daily bias loads (no flicker)
- [ ] Works offline (airplane mode)
- [ ] Notifications work
- [ ] Share button works
- [ ] Favorites persist
- [ ] Navigation works
- [ ] Settings save

## 🎯 Next Steps

1. Test on Android device/emulator
2. Test on iOS simulator/device
3. Follow `MOBILE_SETUP.md` for store submission

