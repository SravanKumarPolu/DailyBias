# How to Run Android App

## ✅ Best Method: Use Android Studio Run Button

The emulator has connection issues with command line, but Android Studio's Run button works perfectly!

### Steps:

1. **In Android Studio**, look at the top toolbar
2. **Select your emulator** from the device dropdown (should show "Medium Phone API 36.1")
3. **Click the green Run button** ▶️ (or press `Shift + F10` / `Ctrl + R`)
4. **Wait** - Android Studio will:
   - Build the app (if needed)
   - Install on emulator
   - Launch automatically

**This is the most reliable method!** ✅

---

## 🔧 Alternative: Restart Emulator First

If Run button doesn't work, restart the emulator:

1. **Close emulator** (click X on emulator window)
2. **In Android Studio**: 
   - Tools → Device Manager
   - Click ▶️ next to "Medium Phone API 36.1"
   - Wait for emulator to fully boot (home screen appears)
3. **Click Run** ▶️ again

---

## 📱 Alternative: Use Physical Device

If you have an Android phone:

1. **Enable USB Debugging**:
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable "USB Debugging"
2. **Connect phone via USB**
3. **In Android Studio**: Select your phone from device dropdown
4. **Click Run** ▶️

---

## 🎯 Available Commands

I've added the `android:run` command, but it has emulator connection issues. Use these instead:

```bash
# Build and sync (do this first)
pnpm android:sync

# Open Android Studio (then use Run button)
pnpm android:open

# Build APK only (without installing)
pnpm android:build
```

---

## ✅ What You Should See

When app launches:
- **Splash screen** (black background)
- **Daily bias screen** loads
- **No flicker** on first load
- **All buttons working**

---

## 🐛 Troubleshooting

### Emulator Not Responding
- **Solution**: Use Android Studio Run button (handles this automatically)
- **Or**: Restart emulator from Device Manager

### "Unknown API Level" Error
- **Solution**: Use Android Studio Run button (bypasses this issue)
- **Or**: Create a new emulator with Android 11+ (API 30+)

### App Doesn't Launch
- Check **Logcat** in Android Studio for errors
- Make sure emulator is fully booted (home screen visible)
- Try restarting emulator

---

## 💡 Pro Tip

**Always use Android Studio's Run button** ▶️ - it's the most reliable way to test Android apps. The command line has emulator connection issues, but Android Studio handles everything automatically.

---

## 📋 Quick Checklist

- [ ] Emulator is running (or physical device connected)
- [ ] Android Studio is open
- [ ] Device selected in dropdown
- [ ] Click Run ▶️
- [ ] App launches! 🎉

**That's it!** The app should launch successfully using Android Studio's Run button.

