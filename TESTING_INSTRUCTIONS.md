# Quick Testing Instructions

## ✅ Build Successful!

The app built successfully. The installation issue is just an emulator connection problem. Here's the easiest way to test:

---

## 🚀 Method 1: Use Android Studio Run Button (Easiest)

1. **In Android Studio**, look at the top toolbar
2. **Select your emulator** from the device dropdown (should show "Medium Phone API 36.1")
3. **Click the green Run button** ▶️ (or press `Shift + F10`)
4. Android Studio will build and install automatically

**This is the most reliable method!**

---

## 🔧 Method 2: Fix Emulator and Try Again

The emulator might need to be restarted:

1. **Close the emulator** (click X on emulator window)
2. **Restart emulator** from Android Studio:
   - Device Manager → Click ▶️ next to your device
3. **Wait for emulator to fully boot** (home screen appears)
4. **Click Run** ▶️ in Android Studio

---

## 📱 Method 3: Use Physical Device

If you have an Android phone:

1. **Enable USB Debugging** on phone:
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable "USB Debugging"
2. **Connect phone via USB**
3. **Select phone** from device dropdown in Android Studio
4. **Click Run** ▶️

---

## ✅ What to Test

Once the app launches:

### Basic Tests:
- [ ] App opens without crash
- [ ] Daily bias screen loads
- [ ] No flicker on first load
- [ ] Navigation works (bottom tabs)
- [ ] Share button works (tap share → native share sheet)
- [ ] Favorites work (tap heart icon)
- [ ] Works offline (enable airplane mode)

### Native Features:
- [ ] **Share**: Tap share button → native Android share sheet appears
- [ ] **Notifications**: Permission requested, scheduled at 9 AM
- [ ] **Offline**: Enable airplane mode → app still works

---

## 🐛 If App Doesn't Launch

### Check Logcat:
1. In Android Studio, open **Logcat** (bottom pane)
2. Look for red error messages
3. Filter by "Error" or "Exception"

### Common Fixes:
```bash
# Re-sync assets
cd /Users/sravanpolu/Projects/DailyBias
pnpm android:sync

# Clean and rebuild
cd android
./gradlew clean
cd ..
pnpm android:sync
```

---

## 🎯 Quick Test Checklist

**Must Test:**
- ✅ App launches
- ✅ Daily bias shows
- ✅ No flicker
- ✅ Share works
- ✅ Offline works

**Nice to Test:**
- ✅ Notifications
- ✅ All navigation
- ✅ Settings persistence
- ✅ Favorites persistence

---

## 💡 Pro Tip

**The easiest way**: Just click the **Run button** ▶️ in Android Studio's toolbar. It handles everything automatically!

---

## 📊 Expected Result

When the app launches, you should see:
1. **Splash screen** (black background)
2. **Daily bias screen** with:
   - Today's cognitive bias
   - No flicker
   - Smooth loading
   - All buttons working

**Good luck!** 🚀

