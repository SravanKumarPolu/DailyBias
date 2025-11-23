# 🚀 Quick Start: Android Testing

## Fast Testing Commands

```bash
# 1. Build the app
pnpm build

# 2. Sync with Android
pnpm android:sync

# 3. Run on device/emulator
pnpm android:run
```

## ⚡ Quick Test Checklist

### Critical Tests (5 minutes)
- [ ] **Touch Targets** - Tap all buttons, verify they're easy to tap (≥44px)
- [ ] **No Flickering** - Watch the screen for 30 seconds, no blinking/flickering
- [ ] **Navigation** - All 6 nav buttons visible and work
- [ ] **Buttons Work** - Favorite, Mastered, Share buttons respond
- [ ] **Smooth Scrolling** - Scroll through content, no jank

### Detailed Tests (15 minutes)
See `ANDROID_TESTING_GUIDE.md` for complete checklist.

## 🎯 What to Look For

### ✅ Good Signs
- Buttons are easy to tap
- No flickering or blinking
- Smooth animations
- Navigation always visible
- Content loads smoothly

### ❌ Bad Signs
- Buttons too small or hard to tap
- Visible flickering/blinking
- Navigation disappears
- Buttons don't respond
- Janky animations

## 📝 Report Issues

If you find issues, note:
1. **What** - What's the problem?
2. **Where** - Which screen/component?
3. **When** - When does it happen?
4. **How** - Steps to reproduce

---

**Ready to test? Run: `pnpm build && pnpm android:sync && pnpm android:run`**

