# Fix iOS Setup - Step by Step

## 🔍 Current Status

- ❌ **Xcode**: Not installed (only Command Line Tools)
- ⚠️ **CocoaPods**: Installing now...
- ✅ **iOS Platform**: Ready
- ✅ **Code**: All ready

---

## 🚀 Fix Steps

### Step 1: Install Xcode (REQUIRED)

**You must install full Xcode from App Store:**

1. **Open App Store** on your Mac
2. **Search** for "Xcode"
3. **Click "Get"** or "Install"
4. **Wait** for download (~15 GB, takes 30-60 minutes)
5. **Open Xcode once** after installation (it will install additional components, 10-20 min)

**Important**: You need the **full Xcode app**, not just Command Line Tools.

---

### Step 2: Configure Xcode Path

After Xcode is installed, run:

```bash
# Set Xcode path
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# Accept Xcode license
sudo xcodebuild -license accept

# Verify it worked
xcode-select -p
# Should show: /Applications/Xcode.app/Contents/Developer
```

---

### Step 3: Install CocoaPods (If Not Already Done)

```bash
# Install CocoaPods
sudo gem install cocoapods

# Verify installation
pod --version
```

---

### Step 4: Install iOS Dependencies

```bash
cd ios/App
pod install
cd ../..
```

This will install all iOS native dependencies.

---

### Step 5: Sync and Open

```bash
# Sync assets to iOS
pnpm ios:sync

# Open in Xcode
pnpm ios:open
```

---

### Step 6: Run in Xcode

1. **In Xcode**, select a simulator (iPhone 14, iPhone 15, etc.)
2. **Click Run** ▶️
3. **App launches!** 🎉

---

## ⚡ Quick Fix Script

I've created a script that will check and fix everything automatically:

```bash
# Run the fix script (after Xcode is installed)
./fix_ios_setup.sh
```

This script will:
- ✅ Check if Xcode is installed
- ✅ Fix xcode-select path
- ✅ Accept Xcode license
- ✅ Install CocoaPods (if needed)
- ✅ Install iOS dependencies

---

## 🎯 What You Need

### Required:
1. **Xcode** (~15 GB, free from App Store)
2. **CocoaPods** (installing now via gem)
3. **macOS** (you have this ✅)

### Time:
- **Xcode Download**: 30-60 minutes
- **Xcode Setup**: 10-20 minutes (first launch)
- **CocoaPods**: 2-5 minutes
- **Pod Install**: 5-10 minutes
- **Total**: ~1-2 hours

---

## 📋 Checklist

- [ ] Install Xcode from App Store
- [ ] Open Xcode once (installs components)
- [ ] Run: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`
- [ ] Run: `sudo xcodebuild -license accept`
- [ ] Run: `sudo gem install cocoapods` (if not done)
- [ ] Run: `cd ios/App && pod install`
- [ ] Run: `pnpm ios:sync`
- [ ] Run: `pnpm ios:open`
- [ ] Click Run ▶️ in Xcode

---

## 🆘 If Xcode Installation Fails

### Alternative: Use Cloud CI/CD

If you can't install Xcode locally, you can:
- Use **GitHub Actions** with macOS runner
- Use **Codemagic** (free tier)
- Use **Bitrise** (free tier)
- Build iOS without local Xcode

---

## ✅ After Everything is Installed

Once Xcode and CocoaPods are ready:

```bash
# Quick test
xcode-select -p
# Should show: /Applications/Xcode.app/Contents/Developer

pod --version
# Should show version number

# Then sync and open
pnpm ios:sync
pnpm ios:open
```

---

## 💡 Pro Tips

1. **Xcode is Large**: ~15 GB, make sure you have space
2. **First Launch**: Xcode needs 10-20 minutes to install components
3. **Simulator**: Included with Xcode, no physical device needed
4. **Free Testing**: Can test on simulator without Apple Developer account

---

## 🎉 Summary

**Current Issue**: Xcode not installed (only Command Line Tools)

**Solution**: 
1. Install Xcode from App Store
2. Run the setup commands above
3. Run `pnpm ios:open` and click Run ▶️

**Everything else is ready!** Just needs Xcode. 🚀

