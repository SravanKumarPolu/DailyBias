# Quick Start Guide

Get up and running with Bias Daily development in minutes.

## 🚀 Quick Start Options

### Option 1: Install Android Studio (Recommended) ⭐

**One command to open download page:**
```bash
open https://developer.android.com/studio
```

**Then:**
1. Download and install Android Studio
2. Open it and complete setup wizard
3. Run: `pnpm android:open`
4. Build and test! ✅

**Time:** ~15 minutes (mostly downloading)

**Why Android Studio?**
- ✅ Installs everything automatically
- ✅ Visual debugging tools
- ✅ Built-in emulator
- ✅ Easy APK building
- ✅ Play Store publishing tools

---

### Option 2: Install Java Only (Quick Start)

**If you just want to build APKs quickly:**

```bash
# Install Java
brew install openjdk@17

# Set JAVA_HOME
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
source ~/.zshrc

# Verify
java -version

# Build APK
cd android
./gradlew assembleDebug
```

**Time:** ~5 minutes

**Note:** You'll still need Android SDK tools for full development. See `NEXT_STEPS_GUIDE.md` for complete command-line setup.

---

### Option 3: Test on Physical Device

**If you have an Android phone:**

1. Enable Developer Options on phone
2. Enable USB Debugging
3. Connect phone via USB
4. Install ADB (comes with Android Studio or SDK Platform Tools)
5. Run: `adb devices` to verify connection
6. Build and install: `cd android && ./gradlew installDebug`

---

## ✅ Current Status

**Working:**
- ✅ Next.js web app builds successfully
- ✅ Android platform properly initialized
- ✅ Capacitor configuration complete
- ✅ All build scripts ready
- ✅ Static export enabled (required for Android)
- ✅ Code synced to Android
- ✅ Live reload configured
- ✅ Gradle wrapper ready
- ✅ Project structure complete

**Needed:**
- ⚠️ Java JDK (for building)
- ⚠️ Android SDK (for building)
- ⚠️ Android Studio (recommended) or command line tools

---

## 🚀 Quick Commands

### Development:
```bash
# Build web app
pnpm build

# Sync to Android
pnpm android:sync

# Open in Android Studio
pnpm android:open

# Run on device/emulator
pnpm android:run
```

### One-Command Workflow:
```bash
# Build, sync, and open Android Studio
pnpm android:build
```

---

## 📱 Next Steps to Publish

1. **Open Android Studio**
   ```bash
   pnpm android:open
   ```

2. **Test the App**
   - Connect Android device or start emulator
   - Click Run button (▶️) in Android Studio
   - Or: `pnpm android:run`

3. **Create Signing Keystore** (One-time setup)
   - In Android Studio: `Build` → `Generate Signed Bundle / APK`
   - Create new keystore
   - **⚠️ Save keystore securely - you'll need it for all updates!**

4. **Build Release Bundle**
   - `Build` → `Generate Signed Bundle / APK`
   - Select `Android App Bundle` (.aab)
   - Choose release build variant
   - Output: `android/app/release/app-release.aab`

5. **Upload to Play Store**
   - Go to [Google Play Console](https://play.google.com/console)
   - Create app listing
   - Upload .aab file
   - Complete store listing (screenshots, description, etc.)
   - Submit for review

---

## 📋 Important Notes

### ✅ Your Web App is Safe
- No breaking changes
- Works exactly as before
- Static export only affects build, not runtime

### 🔄 Update Workflow
When you update your app:
1. Make changes to Next.js code
2. `pnpm build` → `pnpm android:sync`
3. Test in Android Studio
4. Update version in `android/app/build.gradle`:
   ```gradle
   versionCode 2  // Increment by 1
   versionName "1.0.1"  // User-visible version
   ```
5. Build release bundle
6. Upload to Play Store

### 📦 App Configuration
- **App ID**: `com.dailybias.app`
- **App Name**: `Bias Daily`
- **Current Version**: 1.0 (versionCode: 1)

---

## 🛠️ Troubleshooting

### Build Errors?
- Make sure Java JDK 17+ is installed
- Check Android SDK in Android Studio
- Run `npx cap sync android` after changes

### App Not Loading?
- Verify `pnpm build` completed successfully
- Check `out/` directory exists
- Run `npx cap sync android`

### Need Help?
- See `ANDROID_PUBLISH_GUIDE.md` for detailed steps
- See `TROUBLESHOOTING.md` for common issues
- See `SUPPORT.md` for getting help

---

## ⚡ Quick Test Script

Run this to check what you have:
```bash
./quick-start.sh
```

This will tell you exactly what's installed and what you need! ✅

---

## 📚 More Help

- **Detailed guide:** `NEXT_STEPS_GUIDE.md`
- **Android Studio setup:** See `ANDROID_PUBLISH_GUIDE.md`
- **Development workflow:** `DEVELOPMENT_WORKFLOW.md`
- **Publishing guide:** `ANDROID_PUBLISH_GUIDE.md`
- **Troubleshooting:** `TROUBLESHOOTING.md`

---

## ✨ Summary

**You're all set!** Your single codebase now supports:
- ✅ Web application (unchanged)
- ✅ Android app (ready to build)

**No separate project needed. Maximum efficiency!**

