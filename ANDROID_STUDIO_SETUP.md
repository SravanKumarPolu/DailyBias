# Android Studio Setup Guide

## Current Status

Android Studio is **not installed** on your system. The sync worked perfectly, but we need Android Studio to build and run the app.

## Option 1: Install Android Studio (Recommended)

### Step 1: Download Android Studio

1. Go to [https://developer.android.com/studio](https://developer.android.com/studio)
2. Click "Download Android Studio"
3. Download the macOS version (.dmg file)

### Step 2: Install

1. Open the downloaded .dmg file
2. Drag "Android Studio" to your Applications folder
3. Open Android Studio from Applications
4. Follow the setup wizard:
   - Choose "Standard" installation
   - Accept licenses
   - Let it download SDK components (this takes a while)

### Step 3: Verify Installation

```bash
# Check if Android Studio is installed
ls -la /Applications/Android\ Studio.app

# If installed, you can now use:
pnpm android:dev:open
```

### Step 4: Configure Android SDK

1. Open Android Studio
2. Go to `Android Studio` → `Settings` (or `Preferences` on macOS)
3. Navigate to `Appearance & Behavior` → `System Settings` → `Android SDK`
4. Ensure these are installed:
   - Android SDK Platform (latest)
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform-Tools

## Option 2: Use Command Line Tools (Without Android Studio)

You can build and run the app using command line tools without Android Studio:

### Install Command Line Tools Only

1. Download Android SDK Command Line Tools:
   ```bash
   # Create SDK directory
   mkdir -p ~/android-sdk
   cd ~/android-sdk
   
   # Download command line tools (check latest version)
   # Visit: https://developer.android.com/studio#command-tools
   ```

2. Set environment variables:
   ```bash
   # Add to ~/.zshrc or ~/.bash_profile
   export ANDROID_HOME=$HOME/android-sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   ```

### Build from Command Line

```bash
# Sync (already working)
pnpm android:dev

# Build APK
cd android
./gradlew assembleDebug

# Install on connected device
./gradlew installDebug

# Or use adb directly
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Option 3: Use Alternative IDEs

### Visual Studio Code

1. Install Android extensions:
   - "Android iOS Emulator"
   - "Android for VS Code"

2. Configure:
   ```json
   // .vscode/settings.json
   {
     "android.sdk": "/Users/YOUR_USERNAME/Library/Android/sdk"
   }
   ```

### IntelliJ IDEA

IntelliJ IDEA Community Edition can also build Android apps, but Android Studio is recommended.

## Quick Fix: Update Scripts

I've updated your scripts so `android:dev` just syncs (doesn't try to open Android Studio):

```bash
# Just sync (works without Android Studio)
pnpm android:dev

# Sync and open (requires Android Studio)
pnpm android:dev:open
```

## Testing Without Android Studio

### Option A: Use Physical Device

1. Enable Developer Options on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"

2. Connect device via USB

3. Build and install:
   ```bash
   pnpm android:dev
   cd android
   ./gradlew installDebug
   ```

### Option B: Use Online Emulator

1. Use [BrowserStack](https://www.browserstack.com/app-live) or similar
2. Upload your APK
3. Test in cloud emulator

### Option C: Use Expo Go (Temporary)

While setting up Android Studio, you could temporarily test your web app:
```bash
pnpm dev
# Open in browser and test
```

## Recommended Path

**For best experience, install Android Studio:**

1. ✅ Full IDE with debugging
2. ✅ Visual emulator
3. ✅ Easy APK building
4. ✅ Play Store publishing tools
5. ✅ Better error messages

## After Installing Android Studio

Once installed, you can:

```bash
# Sync and open
pnpm android:dev:open

# Or just sync
pnpm android:dev

# Then manually open Android Studio and open the android/ folder
```

## Troubleshooting

### Android Studio Not Found

If Android Studio is installed but not found:

1. Find the exact path:
   ```bash
   find /Applications -name "Android Studio.app" -type d
   ```

2. Set environment variable:
   ```bash
   export CAPACITOR_ANDROID_STUDIO_PATH="/Applications/Android Studio.app"
   ```

3. Or create alias:
   ```bash
   # Add to ~/.zshrc
   alias android-studio="open -a 'Android Studio'"
   ```

### Build Errors

If you get build errors:

1. Make sure Java JDK 17+ is installed:
   ```bash
   java -version
   ```

2. Install JDK if needed:
   ```bash
   # macOS
   brew install openjdk@17
   ```

3. Set JAVA_HOME:
   ```bash
   export JAVA_HOME=$(/usr/libexec/java_home -v 17)
   ```

## Next Steps

1. **Install Android Studio** (recommended)
2. **Or** use command line tools
3. **Or** test on physical device
4. **Then** continue with development

The sync is working perfectly - you just need the build tools! 🚀

