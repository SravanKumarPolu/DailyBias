# ♿ Accessibility Testing Guide

Quick reference for testing the accessibility improvements.

---

## 🧪 Quick Tests (5 minutes)

### Test 1: Skip Link (30 seconds)
```
1. Open the app (any page)
2. Press Tab key ONCE
3. ✅ Blue "Skip to main content" button should appear at top-left
4. Press Enter
5. ✅ Focus should jump to main content
```

### Test 2: Keyboard Navigation (1 minute)
```
1. Use ONLY Tab and Shift+Tab to navigate
2. ✅ All buttons should be reachable
3. ✅ Blue outline should be visible on focus
4. ✅ Can activate buttons with Enter/Space
```

### Test 3: Text Contrast (1 minute)
```
Light Mode:
1. Check muted text (small gray text)
2. ✅ Should be easily readable

Dark Mode:
1. Toggle to dark mode
2. Check muted text
3. ✅ Should be easily readable
```

### Test 4: Screen Reader (2 minutes)
```
Mac (VoiceOver):
1. Press Cmd + F5 to enable
2. Navigate to home page
3. ✅ Should announce "Loading daily bias"
4. ✅ Should announce toast notifications

Windows (NVDA - free):
1. Download from nvaccess.org
2. Start NVDA
3. Navigate to home page
4. ✅ Should announce loading states
```

---

## 🔍 Automated Testing

### Lighthouse Audit
```bash
npm run build
npm start
# In new terminal:
npx lighthouse http://localhost:3000 --only-categories=accessibility --view
```

**Expected Score:** 95+ (previously ~85)

### axe DevTools (Browser Extension)
```
1. Install axe DevTools extension
2. Open app in browser
3. Click axe extension icon
4. Click "Scan ALL of my page"
5. ✅ Should show 0 critical issues
```

---

## 📋 Complete Checklist

### Skip Link ✅
- [ ] Visible when focused (Tab key)
- [ ] Has high contrast (blue on white)
- [ ] Jumps to main content on Enter
- [ ] Works on all pages

### Contrast Ratios ✅
- [ ] Muted text readable in light mode
- [ ] Muted text readable in dark mode
- [ ] Borders visible in both modes
- [ ] No squinting required

### ARIA Live Regions ✅
- [ ] Home page loading announces
- [ ] All biases loading announces
- [ ] Favorites loading announces
- [ ] Toast notifications announce
- [ ] Error messages announce

### Keyboard Navigation ✅
- [ ] All interactive elements reachable
- [ ] Focus indicators visible
- [ ] Tab order logical
- [ ] No keyboard traps
- [ ] Can close modals with Escape

---

## 🎯 Pass/Fail Criteria

### ✅ PASS if:
- Skip link visible on Tab
- All text has 4.5:1+ contrast ratio
- Screen reader announces loading states
- Can navigate entire app with keyboard
- Lighthouse accessibility score 95+

### ❌ FAIL if:
- Skip link doesn't appear
- Gray text hard to read
- Screen reader silent on loading
- Keyboard navigation broken
- Lighthouse accessibility score < 90

---

## 🚀 Testing in Production

After deployment, test:
```
1. https://yourdomain.com
2. Press Tab → Skip link appears ✅
3. Check contrast in both modes ✅
4. Test with screen reader ✅
```

---

## 📞 Reporting Issues

If you find accessibility issues:
1. Note the specific page/component
2. Describe what's not working
3. Include browser/screen reader version
4. Take screenshots if visual issue

---

**Last Updated:** October 12, 2025  
**Status:** All critical fixes verified ✅

