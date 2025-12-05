# Requirements & Prerequisites

## 📱 What You Need to Use the Mobile App

### For Android Development & Testing

#### Required Software
1. **Android Studio** (Latest version)
   - Download: https://developer.android.com/studio
   - Size: ~1 GB
   - Includes: Android SDK, Emulator, Build Tools

2. **JDK (Java Development Kit)** 17 or higher
   - Usually included with Android Studio
   - Or download separately: https://adoptium.net/

3. **Android SDK**
   - Installed automatically with Android Studio
   - Minimum SDK: 22 (Android 5.1)
   - Target SDK: 34 (Android 14)

#### System Requirements
- **OS**: Windows, macOS, or Linux
- **RAM**: 8 GB minimum (16 GB recommended)
- **Disk Space**: 10 GB for Android Studio + SDK
- **Internet**: Required for first-time setup

#### Optional but Recommended
- **Physical Android Device** (for real device testing)
- **USB Cable** (for connecting physical device)

---

### For iOS Development & Testing

#### Required Software
1. **macOS** (Required - iOS development only works on Mac)
   - macOS 12.0 (Monterey) or later
   - Cannot develop iOS apps on Windows/Linux

2. **Xcode** (Full version, not just Command Line Tools)
   - Download: App Store (search "Xcode")
   - Size: ~15 GB
   - Includes: iOS SDK, Simulator, Build Tools

3. **CocoaPods** (Dependency manager)
   - Install: `sudo gem install cocoapods`
   - Required for iOS dependencies

#### System Requirements
- **OS**: macOS only (Windows/Linux not supported)
- **RAM**: 8 GB minimum (16 GB recommended)
- **Disk Space**: 20 GB for Xcode + iOS SDK
- **Internet**: Required for first-time setup

#### Optional but Recommended
- **Apple Developer Account** (Free for testing, $99/year for App Store)
- **Physical iPhone/iPad** (for real device testing)
- **Lightning/USB-C Cable** (for connecting device)

---

### For Web Development (Base Project)

#### Required Software
1. **Node.js** 18 or higher
   - Download: https://nodejs.org/
   - Includes: npm

2. **pnpm** (Package manager)
   - Install: `npm install -g pnpm`
   - Or use npm/yarn (but pnpm is recommended)

3. **Git** (Version control)
   - Usually pre-installed on macOS/Linux
   - Download: https://git-scm.com/

#### System Requirements
- **OS**: Windows, macOS, or Linux
- **RAM**: 4 GB minimum (8 GB recommended)
- **Disk Space**: 2 GB for node_modules
- **Internet**: Required for package installation

---

## 🚀 Quick Setup Checklist

### Android Setup (All Platforms)

```bash
# 1. Install Android Studio
# Download from: https://developer.android.com/studio

# 2. Open Android Studio and install:
# - Android SDK
# - Android SDK Platform-Tools
# - Android Emulator

# 3. Create an Android Virtual Device (AVD)
# Tools → Device Manager → Create Device

# 4. Verify installation
cd /Users/sravanpolu/Projects/DailyBias
pnpm android:open
```

**Time Required**: 30-60 minutes (first time)

---

### iOS Setup (macOS Only)

```bash
# 1. Install Xcode from App Store
# Search "Xcode" in App Store

# 2. Set Xcode path
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept

# 3. Install CocoaPods
sudo gem install cocoapods

# 4. Install iOS dependencies
cd ios/App
pod install
cd ../..

# 5. Verify installation
cd /Users/sravanpolu/Projects/DailyBias
pnpm ios:open
```

**Time Required**: 1-2 hours (first time, includes Xcode download)

---

## 📦 What's Already Installed in This Project

### ✅ Already Configured
- ✅ Capacitor (mobile framework)
- ✅ All dependencies (in `package.json`)
- ✅ Android platform (ready to use)
- ✅ iOS platform (needs Xcode setup)
- ✅ Build scripts (ready to use)
- ✅ Native plugins (notifications, share, splash)

### ✅ No Need to Install
- ❌ No need to install Capacitor separately
- ❌ No need to configure build tools
- ❌ No need to set up project structure

---

## 🎯 Minimum Requirements to Get Started

### Just Want to Test Android? (Easiest)
**You Need:**
1. ✅ Android Studio
2. ✅ 30 minutes setup time

**You Don't Need:**
- ❌ macOS
- ❌ Xcode
- ❌ Apple Developer account

### Want Both Android + iOS?
**You Need:**
1. ✅ macOS (for iOS)
2. ✅ Android Studio
3. ✅ Xcode
4. ✅ 2-3 hours setup time

---

## 💻 Development Environment Options

### Option 1: Local Development (Recommended)
**Pros:**
- ✅ Fast iteration
- ✅ Full control
- ✅ Free (except Apple Developer if needed)

**Cons:**
- ⚠️ Need to install all tools
- ⚠️ Takes disk space

**Best For:** Regular development, testing

---

### Option 2: Cloud CI/CD (Alternative)
**Services:**
- **GitHub Actions** (Free for public repos)
- **Codemagic** (Free tier available)
- **Bitrise** (Free tier available)
- **App Center** (Free tier available)

**Pros:**
- ✅ No local setup needed
- ✅ Automated builds
- ✅ Can build iOS without Mac

**Cons:**
- ⚠️ Slower iteration
- ⚠️ May have usage limits

**Best For:** CI/CD, building releases

---

## 🔧 System-Specific Requirements

### Windows
- ✅ Android Studio works perfectly
- ❌ iOS development not possible (need Mac)
- ✅ Can develop Android app fully

### macOS
- ✅ Android Studio works perfectly
- ✅ Xcode works perfectly
- ✅ Can develop both Android + iOS

### Linux
- ✅ Android Studio works perfectly
- ❌ iOS development not possible (need Mac)
- ✅ Can develop Android app fully

---

## 📱 Device Requirements

### For Testing Android App
**Emulator:**
- Any Android version 5.1+ (API 22+)
- Recommended: Android 10+ (API 29+)

**Physical Device:**
- Android 5.1+ (Lollipop)
- USB debugging enabled
- Developer options enabled

### For Testing iOS App
**Simulator:**
- iOS 13+ (included with Xcode)
- Any iPhone/iPad simulator

**Physical Device:**
- iOS 13+
- Free Apple ID (for testing)
- Or Apple Developer account ($99/year)

---

## 🎓 Learning Resources

### Android Development
- **Official Docs**: https://developer.android.com/
- **Capacitor Android**: https://capacitorjs.com/docs/android
- **Android Studio Guide**: https://developer.android.com/studio/intro

### iOS Development
- **Official Docs**: https://developer.apple.com/documentation/
- **Capacitor iOS**: https://capacitorjs.com/docs/ios
- **Xcode Guide**: https://developer.apple.com/xcode/

---

## ⚡ Quick Start Commands

### Check What You Have
```bash
# Check Node.js
node --version  # Should be 18+

# Check pnpm
pnpm --version  # Should be installed

# Check Android Studio (if installed)
adb version  # Android Debug Bridge

# Check Xcode (macOS only)
xcode-select -p  # Should show Xcode path
```

### Install Missing Tools
```bash
# Install pnpm (if missing)
npm install -g pnpm

# Install Android Studio
# Download from: https://developer.android.com/studio

# Install Xcode (macOS only)
# Download from App Store
```

---

## 🆘 Troubleshooting

### "Android Studio not found"
- Install Android Studio from https://developer.android.com/studio
- Make sure it's in your PATH

### "Xcode not found" (macOS)
- Install full Xcode from App Store (not just Command Line Tools)
- Run: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`

### "CocoaPods not found" (iOS)
- Install: `sudo gem install cocoapods`
- May need: `sudo gem install -n /usr/local/bin cocoapods`

### "JDK not found" (Android)
- Android Studio includes JDK
- Or install separately: https://adoptium.net/

---

## 📋 Summary Checklist

### To Develop Android App:
- [ ] Android Studio installed
- [ ] Android SDK installed (via Android Studio)
- [ ] Emulator created OR physical device connected
- [ ] Run: `pnpm android:open`

### To Develop iOS App:
- [ ] macOS computer
- [ ] Xcode installed (from App Store)
- [ ] CocoaPods installed
- [ ] Run: `cd ios/App && pod install`
- [ ] Run: `pnpm ios:open`

### To Just Use the Web App:
- [ ] Node.js installed
- [ ] pnpm installed
- [ ] Run: `pnpm dev`

---

## 💰 Cost Breakdown

### Free (Development)
- ✅ Android Studio: Free
- ✅ Android SDK: Free
- ✅ Xcode: Free (on Mac)
- ✅ CocoaPods: Free
- ✅ Testing on emulators: Free
- ✅ Testing on physical devices: Free

### Paid (Store Submission)
- 💰 Google Play: $25 one-time fee
- 💰 Apple App Store: $99/year
- 💰 Both: $124 first year, $99/year after

---

## 🎯 Recommended Setup for Beginners

### Start with Android (Easiest)
1. Install Android Studio
2. Create emulator
3. Run: `pnpm android:open`
4. Click Run ▶️

**Time**: 30-60 minutes

### Then Add iOS (If You Have Mac)
1. Install Xcode
2. Install CocoaPods
3. Run: `cd ios/App && pod install`
4. Run: `pnpm ios:open`
5. Click Run ▶️

**Time**: 1-2 hours

---

## ✅ You're Ready When...

### Android Ready:
- ✅ `pnpm android:open` opens Android Studio
- ✅ Android Studio shows project
- ✅ Emulator or device is available
- ✅ Can click Run ▶️

### iOS Ready:
- ✅ `pnpm ios:open` opens Xcode
- ✅ Xcode shows project
- ✅ Simulator or device is available
- ✅ Can click Run ▶️

---

## 🚀 Next Steps

1. **Install required tools** (see above)
2. **Run setup commands** (see Quick Setup)
3. **Open project** (`pnpm android:open` or `pnpm ios:open`)
4. **Click Run** ▶️

**That's it!** 🎉

