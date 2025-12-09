# How to Install Xcode

## ⚠️ Important: Xcode Cannot Be Installed via Command Line

Xcode must be installed from the **App Store** (GUI), not from terminal.

---

## 📥 Step-by-Step Installation

### Method 1: App Store (Recommended)

1. **Open App Store** on your Mac
   - Click the App Store icon in Dock
   - Or press `Cmd + Space` and type "App Store"

2. **Search for Xcode**
   - Type "Xcode" in the search bar
   - Look for the official Xcode app (by Apple)

3. **Install Xcode**
   - Click the **"Get"** or **"Install"** button
   - Enter your Apple ID password if prompted
   - Wait for download (~15 GB, takes 30-60 minutes)

4. **First Launch**
   - After installation, open Xcode from Applications
   - Xcode will install additional components (10-20 minutes)
   - Accept any license agreements

---

### Method 2: Apple Developer Website

1. Go to: https://developer.apple.com/xcode/
2. Click "Download" button
3. Sign in with Apple ID
4. Download Xcode
5. Open the downloaded `.xip` file
6. Wait for extraction
7. Move Xcode to Applications folder

---

## ✅ After Installation

Once Xcode is installed, run these commands:

```bash
# Set Xcode path
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# Accept license
sudo xcodebuild -license accept

# Verify installation
xcode-select -p
# Should show: /Applications/Xcode.app/Contents/Developer

xcodebuild -version
# Should show Xcode version
```

---

## 🔍 Verify Installation

```bash
# Check if Xcode is installed
ls -la /Applications/ | grep -i xcode
# Should show: Xcode.app

# Check xcode-select path
xcode-select -p
# Should show: /Applications/Xcode.app/Contents/Developer

# Check Xcode version
xcodebuild -version
# Should show version number
```

---

## ⏱️ Time Required

- **Download**: 30-60 minutes (depends on internet speed)
- **Installation**: 5-10 minutes
- **First Launch Setup**: 10-20 minutes
- **Total**: ~1-2 hours

---

## 💾 Disk Space Required

- **Xcode**: ~15 GB
- **Additional Components**: ~5-10 GB
- **Total**: ~20-25 GB free space needed

---

## 🆘 Troubleshooting

### "Xcode is taking too long to download"
- **Solution**: Check internet connection
- **Alternative**: Download from Apple Developer website (may be faster)

### "Not enough disk space"
- **Solution**: Free up space (need ~25 GB)
- **Check space**: `df -h /`

### "Xcode won't open after installation"
- **Solution**: Right-click Xcode → Open (first time only)
- **Or**: `xattr -cr /Applications/Xcode.app`

### "Command Line Tools error"
- **Solution**: After installing Xcode, run:
  ```bash
  sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
  ```

---

## 📋 Quick Checklist

- [ ] Open App Store
- [ ] Search "Xcode"
- [ ] Click "Get" or "Install"
- [ ] Wait for download (30-60 min)
- [ ] Open Xcode once (installs components)
- [ ] Run: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`
- [ ] Run: `sudo xcodebuild -license accept`
- [ ] Verify: `xcode-select -p`

---

## 🎯 After Xcode is Installed

Then continue with iOS setup:

```bash
# Install CocoaPods
sudo gem install cocoapods

# Install iOS dependencies
cd ios/App
pod install
cd ../..

# Sync and open
pnpm ios:sync
pnpm ios:open
```

---

## 💡 Pro Tips

1. **Download Overnight**: Xcode is large, consider downloading overnight
2. **Keep App Store Open**: Don't close App Store during download
3. **First Launch**: Xcode needs time to install components, be patient
4. **Free**: Xcode is free, no payment needed

---

## ✅ Summary

**Xcode Installation**:
- ❌ Cannot install via command line
- ✅ Must install from App Store
- ✅ Takes 30-60 minutes to download
- ✅ ~15 GB in size

**After Installation**:
- Run setup commands (see above)
- Install CocoaPods
- Run `pod install`
- Open in Xcode

**Status**: Everything else is ready, just need Xcode! 🚀











