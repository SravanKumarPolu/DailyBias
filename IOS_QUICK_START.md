# iOS Quick Start Guide

## ✅ Current Status

- ✅ **iOS Platform**: Created and ready
- ✅ **Code**: All ready for iOS
- ✅ **Assets**: Synced to iOS
- ⚠️ **Xcode**: Not installed (only Command Line Tools)
- ⚠️ **CocoaPods**: Not installed

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Install Xcode (Required)

**Option A: App Store (Recommended)**
1. Open **App Store** on your Mac
2. Search for **"Xcode"**
3. Click **"Get"** or **"Install"**
4. Wait for download (~15 GB, takes 30-60 minutes)

**Option B: Apple Developer**
- Download from: https://developer.apple.com/xcode/

**Important**: Install the **full Xcode app**, not just Command Line Tools.

---

### Step 2: Configure Xcode

After Xcode is installed:

```bash
# Set Xcode path
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# Accept Xcode license
sudo xcodebuild -license accept

# Verify it's set correctly
xcode-select -p
# Should show: /Applications/Xcode.app/Contents/Developer
```

---

### Step 3: Install CocoaPods & Dependencies

```bash
# Install CocoaPods
sudo gem install cocoapods

# Verify installation
pod --version

# Install iOS dependencies
cd ios/App
pod install
cd ../..
```

---

## 🎯 Run iOS App

After setup is complete:

```bash
# Build and sync
pnpm ios:sync

# Open in Xcode
pnpm ios:open
```

Then in Xcode:
1. Select a simulator (iPhone 14, iPhone 15, etc.)
2. Click **Run** ▶️
3. App launches! 🎉

---

## 📱 What You'll Need

### Required:
- ✅ **macOS** (you have this)
- ⚠️ **Xcode** (~15 GB, free from App Store)
- ⚠️ **CocoaPods** (install via: `sudo gem install cocoapods`)

### Optional:
- **Apple Developer Account**: Free for testing, $99/year for App Store
- **Physical iPhone**: Optional, can use Simulator

---

## ⏱️ Time Required

- **Xcode Download**: 30-60 minutes (depends on internet)
- **Xcode Setup**: 10-20 minutes (first launch)
- **CocoaPods Install**: 2-5 minutes
- **Pod Install**: 5-10 minutes
- **Total**: ~1-2 hours (mostly waiting for Xcode)

---

## 🔍 Check Current Status

```bash
# Check Xcode
xcode-select -p
# Currently shows: /Library/Developer/CommandLineTools (needs full Xcode)

# Check CocoaPods
pod --version
# Currently: not installed
```

---

## ✅ After Setup

Once Xcode and CocoaPods are installed:

```bash
# 1. Sync assets
pnpm ios:sync

# 2. Install dependencies
cd ios/App && pod install && cd ../..

# 3. Open in Xcode
pnpm ios:open

# 4. Click Run ▶️ in Xcode
```

---

## 🎯 Quick Commands Reference

```bash
# Build and sync iOS
pnpm ios:sync

# Open Xcode
pnpm ios:open

# Install CocoaPods dependencies
cd ios/App && pod install

# Check Xcode path
xcode-select -p

# Check CocoaPods
pod --version
```

---

## 💡 Pro Tips

1. **Xcode First Launch**: Takes 10-20 minutes to install components
2. **Simulator**: Included with Xcode, no need for physical device
3. **Free Testing**: Can test on simulator/device without Apple Developer account
4. **App Store**: Need $99/year Apple Developer account for submission

---

## 🆘 Troubleshooting

### "xcode-select: error"
- **Fix**: Install full Xcode from App Store (not just Command Line Tools)

### "pod: command not found"
- **Fix**: Install CocoaPods: `sudo gem install cocoapods`

### "Pod install fails"
- **Fix**: Make sure Xcode is fully installed and path is set correctly
- **Fix**: Try: `cd ios/App && pod deintegrate && pod install`

### "Build fails in Xcode"
- **Fix**: Make sure you open `.xcworkspace` (not `.xcodeproj`)
- **Fix**: Run: `cd ios/App && pod install` first

---

## 📋 Setup Checklist

- [ ] Install Xcode from App Store
- [ ] Set Xcode path: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`
- [ ] Accept license: `sudo xcodebuild -license accept`
- [ ] Install CocoaPods: `sudo gem install cocoapods`
- [ ] Install dependencies: `cd ios/App && pod install`
- [ ] Sync assets: `pnpm ios:sync`
- [ ] Open Xcode: `pnpm ios:open`
- [ ] Click Run ▶️

---

## 🎉 Summary

**Current**: iOS platform ready, needs Xcode + CocoaPods

**Next Steps**:
1. Install Xcode from App Store (~15 GB, 30-60 min)
2. Install CocoaPods (2-5 min)
3. Run `pod install` (5-10 min)
4. Run `pnpm ios:open` and click Run ▶️

**Time**: ~1-2 hours total (mostly waiting for Xcode download)

**Status**: ✅ Everything is ready, just needs Xcode setup!

