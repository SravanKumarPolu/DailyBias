# Mobile App Setup Guide

This guide covers setting up and building the Bias Daily mobile app using Capacitor.

## Architecture

- **Single codebase**: Next.js web app with static export
- **Mobile wrapper**: Capacitor (Android WebView + iOS WKWebView)
- **Native features**: Notifications, Share, Offline support
- **Build output**: `out/` directory (static files)

## Prerequisites

### For Android Development
- Android Studio (latest version)
- JDK 17 or higher
- Android SDK

### For iOS Development
- macOS with **full Xcode installed** (not just Command Line Tools)
- CocoaPods: `sudo gem install cocoapods`
- Apple Developer account (for App Store)

**Note**: If you see `xcode-select` errors, you need to install full Xcode from App Store, not just Command Line Tools. See `IOS_SETUP_FIX.md` for detailed instructions.

## Quick Start

### 1. Build Web App
```bash
pnpm mobile:build
```
This builds the web app and syncs it to native platforms.

### 2. Open in Native IDE

**Android:**
```bash
pnpm android:open
```
Opens Android Studio. Then:
- Wait for Gradle sync
- Select a device/emulator
- Click Run ▶️

**iOS:**
```bash
pnpm ios:open
```
Opens Xcode. Then:
- Select a simulator or device
- Click Run ▶️

## Development Workflow

### Standard Workflow
1. Make changes to web code
2. Run `pnpm mobile:build` (builds web + syncs to native)
3. Open native IDE and run

### Faster Iteration (Android only)
```bash
# Build web
pnpm build

# Sync to Android only
pnpm android:sync

# Or sync to iOS only
pnpm ios:sync
```

## Native Features

### Local Notifications
- Automatically scheduled on app start (9 AM daily)
- Uses `@capacitor/local-notifications`
- Permission requested automatically

### Share
- Native share sheet on mobile
- Falls back to Web Share API or clipboard on web
- Accessible via share button on bias cards

### Offline Support
- Bias data bundled in app (JSON file)
- Favorites stored in IndexedDB
- Daily bias cached in localStorage
- Works in airplane mode

## Configuration

### Capacitor Config
See `capacitor.config.ts`:
- `appId`: `com.debiasdaily.app`
- `appName`: `Bias Daily`
- `webDir`: `out` (static export directory)

### Android
- Minimum SDK: 22 (Android 5.1)
- Target SDK: 34 (Android 14)
- Build tool: Gradle

### iOS
- Minimum version: iOS 13
- Build tool: Xcode + CocoaPods

## Building for Release

### Android (Play Store)

1. **Generate Keystore** (first time only):
```bash
keytool -genkey -v -keystore debiasdaily-release.keystore -alias debiasdaily -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure Signing**:
   - Create `android/keystore.properties`:
   ```
   storeFile=../debiasdaily-release.keystore
   storePassword=YOUR_STORE_PASSWORD
   keyAlias=debiasdaily
   keyPassword=YOUR_KEY_PASSWORD
   ```
   - Update `android/app/build.gradle` to use keystore

3. **Build AAB** (App Bundle for Play Store):
```bash
cd android
./gradlew bundleRelease
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`

4. **Upload to Play Store**:
   - Go to Google Play Console
   - Create new app or new release
   - Upload AAB file
   - Fill in store listing, screenshots, etc.

### iOS (App Store)

1. **Configure Signing in Xcode**:
   - Open `ios/App/App.xcworkspace`
   - Select project → Signing & Capabilities
   - Select your team
   - Xcode will manage certificates automatically

2. **Archive**:
   - Product → Archive
   - Wait for archive to complete

3. **Distribute**:
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Follow wizard

4. **TestFlight** (recommended first):
   - Upload to TestFlight first
   - Test with internal/external testers
   - Then submit for App Store review

## Troubleshooting

### Android

**Gradle sync fails:**
```bash
cd android
./gradlew clean
```

**Build fails:**
- Check Android SDK is installed
- Check JDK version (need 17+)
- Try: `./gradlew --refresh-dependencies`

**App crashes on launch:**
- Check `capacitor.config.ts` has correct `webDir`
- Ensure `pnpm mobile:build` ran successfully
- Check Android logs: `adb logcat`

### iOS

**Pod install fails:**
```bash
cd ios/App
pod install
```

**Build fails:**
- Ensure Xcode is installed (not just Command Line Tools)
- Run: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`
- Clean build folder: Product → Clean Build Folder

**App crashes on launch:**
- Check `capacitor.config.ts` has correct `webDir`
- Ensure `pnpm mobile:build` ran successfully
- Check Xcode console for errors

### General

**Changes not appearing:**
- Always run `pnpm mobile:build` after web changes
- Or use `npx cap sync` to sync without rebuilding

**Native features not working:**
- Check plugin is installed: `pnpm list | grep capacitor`
- Check permissions are granted (notifications, etc.)
- Check `isNativeApp()` returns true in code

## Testing Checklist

Before submitting to stores:

- [ ] App launches without crash
- [ ] Daily bias loads correctly
- [ ] No flicker on first load (date mismatch fixed)
- [ ] Works offline (airplane mode)
- [ ] Notifications work (if enabled)
- [ ] Share button works
- [ ] Favorites persist
- [ ] Navigation works
- [ ] Settings save correctly
- [ ] Dark/light theme works

## CI/CD (Future)

Recommended setup:
- **Fastlane** for automation
- **GitHub Actions** for CI
- Automate: build → test → upload to TestFlight/Internal Testing

## Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [iOS Developer Guide](https://developer.apple.com/documentation)
- [Play Store Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)

