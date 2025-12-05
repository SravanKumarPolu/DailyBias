# Android Testing Guide

## ✅ Build Complete - Ready to Test!

Your Android app has been built and synced successfully. Here's how to test it.

---

## 🚀 Quick Start

### Option 1: Using Android Studio (Recommended)

1. **Open Android Studio** (should open automatically)
   ```bash
   pnpm android:open
   ```

2. **Wait for Gradle Sync** (1-2 minutes first time)
   - Android Studio will download dependencies
   - Watch the progress bar at the bottom

3. **Select a Device**
   - **Emulator**: Click "Device Manager" → Create Virtual Device (if none exists)
   - **Physical Device**: Connect via USB, enable USB debugging

4. **Click Run** ▶️ (Green play button)
   - Or press `Shift + F10` (Windows/Linux) or `Ctrl + R` (Mac)

5. **App Launches!** 🎉

---

### Option 2: Using Command Line

```bash
# Build and install on connected device/emulator
cd android
./gradlew installDebug

# Or run directly
./gradlew installDebug && adb shell am start -n com.debiasdaily.app/.MainActivity
```

---

## 📱 Testing Checklist

### ✅ Basic Functionality

- [ ] **App Launches**
  - No crashes on startup
  - Splash screen appears
  - App loads successfully

- [ ] **Daily Bias Screen**
  - Daily bias loads correctly
  - No flicker on first load (date fix working)
  - Content displays properly
  - Date shows correctly

- [ ] **Navigation**
  - Bottom navigation works
  - Can navigate to All Biases
  - Can navigate to Favorites
  - Can navigate to Settings
  - Back button works

- [ ] **Bias Card Interactions**
  - Tap to view details
  - Favorite button works (heart icon)
  - Mastered button works (star icon)
  - Share button works

---

### ✅ Native Features

- [ ] **Share Functionality**
  - Tap share button on bias card
  - Native share sheet appears
  - Can share to other apps
  - Share content is correct

- [ ] **Notifications** (if enabled)
  - App requests notification permission
  - Daily reminder scheduled (9 AM)
  - Notification appears at scheduled time
  - Tapping notification opens app

- [ ] **Offline Support**
  - Enable airplane mode
  - App still works
  - Daily bias loads
  - Favorites accessible
  - No network errors

---

### ✅ Data Persistence

- [ ] **Favorites**
  - Add bias to favorites
  - Close and reopen app
  - Favorite persists
  - Can remove favorite

- [ ] **Progress**
  - View bias (marks as viewed)
  - Mark as mastered
  - Close and reopen app
  - Progress persists

- [ ] **Settings**
  - Change theme (light/dark)
  - Close and reopen app
  - Theme persists
  - Other settings persist

---

### ✅ UI/UX

- [ ] **No Flicker**
  - App opens smoothly
  - No content → skeleton swap
  - No date mismatch flicker
  - Smooth transitions

- [ ] **Performance**
  - Fast loading
  - Smooth scrolling
  - No lag on interactions
  - Animations smooth

- [ ] **Responsive**
  - Works on different screen sizes
  - Portrait orientation
  - Landscape orientation (if supported)
  - Touch targets are large enough (44px+)

---

### ✅ Edge Cases

- [ ] **First Launch**
  - Onboarding appears (if new user)
  - Or daily bias loads directly
  - No errors

- [ ] **Day Change**
  - Open app on new day
  - New daily bias loads
  - No flicker during transition
  - Old bias doesn't show

- [ ] **Network Issues**
  - Works offline
  - Handles network errors gracefully
  - No crashes

---

## 🔧 Testing on Emulator

### Create Emulator (If Needed)

1. **Open Device Manager**
   - Tools → Device Manager
   - Or click device dropdown → "Device Manager"

2. **Create Virtual Device**
   - Click "Create Device"
   - Select device (e.g., Pixel 6)
   - Select system image (Android 11+ recommended)
   - Finish

3. **Start Emulator**
   - Click ▶️ next to device
   - Wait for emulator to boot

4. **Run App**
   - Select emulator from device dropdown
   - Click Run ▶️

---

## 📲 Testing on Physical Device

### Setup USB Debugging

1. **Enable Developer Options**
   - Settings → About Phone
   - Tap "Build Number" 7 times
   - Developer options enabled

2. **Enable USB Debugging**
   - Settings → Developer Options
   - Enable "USB Debugging"

3. **Connect Device**
   - Connect via USB
   - Accept "Allow USB Debugging" prompt on phone

4. **Verify Connection**
   ```bash
   adb devices
   # Should show your device
   ```

5. **Run App**
   - Select device in Android Studio
   - Click Run ▶️

---

## 🐛 Common Issues & Fixes

### App Crashes on Launch

**Check:**
- Android Studio logs (Logcat)
- Look for error messages
- Check if all plugins synced correctly

**Fix:**
```bash
# Rebuild
cd android
./gradlew clean
cd ..
pnpm android:sync
```

### App Shows Blank Screen

**Check:**
- Web assets synced correctly
- Check `android/app/src/main/assets/public` exists
- Verify `index.html` is present

**Fix:**
```bash
# Re-sync
pnpm android:sync
```

### Native Features Not Working

**Check:**
- Permissions granted in device settings
- Plugins synced correctly
- Check Logcat for errors

**Fix:**
- Grant permissions manually in Settings
- Re-sync: `pnpm android:sync`

### Build Errors

**Check:**
- Gradle sync completed
- Android SDK installed
- JDK version correct (17+)

**Fix:**
```bash
cd android
./gradlew clean
./gradlew --refresh-dependencies
```

---

## 📊 Performance Testing

### Check Performance

1. **Open Android Studio Profiler**
   - View → Tool Windows → Profiler
   - Select your app
   - Monitor CPU, Memory, Network

2. **Key Metrics**
   - **Memory**: Should be stable, no leaks
   - **CPU**: Should be low when idle
   - **Network**: Should be minimal (offline-first)

---

## 🎯 Test Scenarios

### Scenario 1: First Time User
1. Install app
2. Open app
3. Should see onboarding (if implemented)
4. Navigate to daily bias
5. Everything works

### Scenario 2: Returning User
1. Open app
2. Daily bias loads immediately
3. No flicker
4. Favorites still there
5. Settings persisted

### Scenario 3: Offline Usage
1. Enable airplane mode
2. Open app
3. Daily bias loads
4. Can view all biases
5. Can add favorites
6. Everything works

### Scenario 4: Share Feature
1. Open daily bias
2. Tap share button
3. Share sheet appears
4. Share to another app
5. Content is correct

---

## 📝 Test Results Template

```
Date: ___________
Device: ___________
Android Version: ___________

✅ App Launches: [ ] Pass [ ] Fail
✅ Daily Bias: [ ] Pass [ ] Fail
✅ Navigation: [ ] Pass [ ] Fail
✅ Share: [ ] Pass [ ] Fail
✅ Offline: [ ] Pass [ ] Fail
✅ Favorites: [ ] Pass [ ] Fail
✅ Settings: [ ] Pass [ ] Fail
✅ No Flicker: [ ] Pass [ ] Fail

Notes:
_________________________________
_________________________________
```

---

## 🚀 Next Steps After Testing

1. **Fix any issues** found during testing
2. **Re-test** after fixes
3. **Prepare for release** (see `MOBILE_SETUP.md`)
4. **Submit to Play Store** (when ready)

---

## ✅ Success Criteria

Your app is ready when:
- ✅ All basic functionality works
- ✅ No crashes
- ✅ No flicker
- ✅ Native features work
- ✅ Offline works
- ✅ Performance is good

**Good luck with testing!** 🎉

