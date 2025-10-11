# 🧪 DailyBias - Complete Testing Guide

**Version:** 1.0.0  
**Last Updated:** October 11, 2025

---

## 📋 Quick Test Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check for linter errors
npm run lint

# Type check
npm run type-check
```

---

## ✅ Feature Testing Checklist

### 1. Onboarding Flow ✨

**First Visit:**
- [ ] Open app in incognito/private mode
- [ ] Should automatically redirect to `/onboarding`
- [ ] See 3 welcome screens with animations
- [ ] Progress dots should update on navigation
- [ ] "Next" button should advance screens
- [ ] "Skip" button should work on screens 1-2
- [ ] "Get Started" on final screen goes to home
- [ ] After completion, reload - should NOT show onboarding again

**Test:**
```bash
# Clear onboarding state
localStorage.removeItem('onboarding-completed')
# Reload page
```

---

### 2. Empty States 🎭

**Favorites Page (Empty):**
- [ ] Navigate to `/favorites`
- [ ] See beautiful empty state with icon
- [ ] "Browse All Biases" button works
- [ ] Animation on load

**All Biases (No Results):**
- [ ] Go to `/all`
- [ ] Search for "xyz123nonexistent"
- [ ] See "No results found" empty state
- [ ] "Clear Filters" button appears and works

**Test Each:**
- Favorites page with no favorites
- Search with no matches
- Filter to category with no items

---

### 3. Error Handling 🛡️

**Test Error Boundary:**
```javascript
// In browser console, on any page:
throw new Error("Test error")
```

**Should See:**
- [ ] Beautiful error screen
- [ ] Animated icon
- [ ] Error message
- [ ] "Reload App" button
- [ ] "Go Home" button
- [ ] "Copy Error" button
- [ ] Dev mode: Error details visible

---

### 4. Search & Filtering 🔍

**Search Functionality:**
- [ ] Go to `/all`
- [ ] Type in search box
- [ ] Results update in real-time (300ms debounce)
- [ ] See result count
- [ ] "High relevance" badge on good matches
- [ ] Clear button (X) appears when typing
- [ ] Clear button clears search

**Category Filtering:**
- [ ] Click "Filter" button
- [ ] Select multiple categories
- [ ] Results update immediately
- [ ] Badge shows count: "Filter (2)"
- [ ] Deselect filters to see all

**Combined:**
- [ ] Search + filter together
- [ ] Results match both criteria
- [ ] Clear all works

---

### 5. Data Visualization 📊

**Settings Page Statistics:**
- [ ] Go to `/settings`
- [ ] See 4 stat cards with circular progress
- [ ] Animations on load (staggered)
- [ ] See 14-day activity chart
- [ ] Hover on chart shows tooltip
- [ ] See category breakdown chart
- [ ] Bars are color-coded
- [ ] Legend shows percentages

**Interact:**
- [ ] Stat cards hover effect
- [ ] Charts are responsive
- [ ] Tooltips follow mouse
- [ ] All data accurate

---

### 6. Advanced Animations 🎨

**3D Tilt Effect:**
- [ ] On desktop, go to home page
- [ ] Move mouse over daily bias card
- [ ] Card should tilt with mouse movement
- [ ] Glare effect follows mouse
- [ ] Smooth spring animation
- [ ] On mobile: No tilt (graceful degradation)

**Scroll Reveals:**
- [ ] Scroll down pages
- [ ] Elements fade in as they enter viewport
- [ ] Smooth, not jarring
- [ ] Staggered animations on lists

---

### 7. Related Content 🔗

**Related Biases:**
- [ ] Click any bias to go to detail page
- [ ] Scroll to bottom
- [ ] See "Related Biases" section
- [ ] 3 related biases shown
- [ ] Same category biases prioritized
- [ ] Each has category badge
- [ ] Hover effect on cards
- [ ] Click goes to that bias
- [ ] "Explore all biases" link works

---

### 8. Real-World Examples 📚

**Examples & Tips:**
- [ ] Click any bias to detail view
- [ ] See "Real-World Examples" section
- [ ] 3 examples with lightbulb icons
- [ ] Smooth animations on load
- [ ] See "Quick Tips" section
- [ ] 4 tips with checkmark icons
- [ ] Hover effects work
- [ ] Content is relevant

---

### 9. Pull-to-Refresh 📱

**Mobile Gesture (Mobile/Touch Device Only):**
- [ ] On mobile, go to home page
- [ ] Scroll to top
- [ ] Pull down beyond top
- [ ] See refresh indicator appear
- [ ] Icon rotates when pulling
- [ ] Progress bar shows pull distance
- [ ] Text changes: "Pull" → "Release" → "Refreshing"
- [ ] Release to refresh
- [ ] Page reloads

**Desktop:**
- [ ] No pull-to-refresh (as expected)

---

### 10. Virtual Scrolling / Lazy Loading ⚡

**All Biases Page:**
- [ ] Go to `/all`
- [ ] Initial load shows 20 items
- [ ] Load is fast (< 500ms)
- [ ] Scroll down
- [ ] See "Loading more..." indicator
- [ ] 10 more items load automatically
- [ ] Smooth, no jank
- [ ] Continue scrolling
- [ ] All items eventually load

**Performance:**
- [ ] Initial render fast
- [ ] Smooth scrolling
- [ ] No lag even with 50+ items

---

## 🎯 Core Functionality Tests

### Daily Bias
- [ ] Shows one bias per day
- [ ] Same bias all day for everyone
- [ ] Changes at midnight
- [ ] Loading states work
- [ ] Error states work

### Favorites
- [ ] Heart icon to add/remove
- [ ] State persists on reload
- [ ] Shows in favorites page
- [ ] Export favorites works
- [ ] Count updates correctly

### Mastered
- [ ] Star icon to mark mastered
- [ ] State persists
- [ ] Progress updates
- [ ] Statistics reflect changes

### Voice Features
- [ ] Text-to-speech works
- [ ] Voice settings in `/settings`
- [ ] Volume controls work
- [ ] Pitch and rate adjustable
- [ ] Voice selection works
- [ ] Stop/play toggle

### PWA
- [ ] Install prompt appears (desktop)
- [ ] Can install as app
- [ ] Works offline after install
- [ ] Manifest loads correctly
- [ ] Service worker registers
- [ ] Icons display properly

---

## 📱 Responsive Testing

### Mobile (320px - 480px)
- [ ] Navigation bar fits
- [ ] Cards stack properly
- [ ] Text is readable (16px min)
- [ ] Buttons are tappable (44px min)
- [ ] No horizontal scroll
- [ ] Pull-to-refresh works

### Tablet (481px - 1024px)
- [ ] 2-column grids work
- [ ] Spacing increases
- [ ] Charts resize properly
- [ ] Navigation comfortable
- [ ] Touch targets good

### Desktop (1025px+)
- [ ] 3D tilt effects work
- [ ] Max-width constrains content
- [ ] Charts full size
- [ ] Hover effects visible
- [ ] Mouse interactions smooth

---

## 🌐 Browser Testing

### Chrome/Edge
- [ ] All features work
- [ ] Animations smooth
- [ ] PWA installs
- [ ] Performance good

### Firefox
- [ ] All features work
- [ ] Animations smooth
- [ ] Service worker OK
- [ ] No console errors

### Safari (macOS)
- [ ] All features work
- [ ] Webkit animations OK
- [ ] PWA can install
- [ ] Performance good

### Mobile Safari (iOS)
- [ ] Touch gestures work
- [ ] Pull-to-refresh works
- [ ] Add to Home Screen
- [ ] Standalone mode
- [ ] Safe area insets

### Android Chrome
- [ ] Touch gestures work
- [ ] Pull-to-refresh works
- [ ] PWA install prompt
- [ ] Performance smooth

---

## ⚡ Performance Testing

### Lighthouse Audit
```bash
# Run Lighthouse
npm run build
npm start
# Open Chrome DevTools → Lighthouse → Run audit
```

**Target Scores:**
- [ ] Performance: 90+
- [ ] Accessibility: 95+
- [ ] Best Practices: 95+
- [ ] SEO: 95+
- [ ] PWA: Installable

### Bundle Size
```bash
npm run build
```

**Check Output:**
- [ ] First Load JS: < 300 KB
- [ ] Total bundle: Reasonable
- [ ] No huge chunks

### Load Time
- [ ] First Contentful Paint: < 1.5s
- [ ] Largest Contentful Paint: < 2.5s
- [ ] Time to Interactive: < 3.5s
- [ ] Cumulative Layout Shift: < 0.1

---

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Focus visible on all elements
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals
- [ ] No keyboard traps

### Screen Reader
**Test with:**
- VoiceOver (Mac/iOS)
- NVDA (Windows)
- TalkBack (Android)

**Check:**
- [ ] All images have alt text
- [ ] Buttons have labels
- [ ] Forms are labeled
- [ ] Page structure clear
- [ ] Announcements work

### Visual
- [ ] Contrast ratios WCAG AA (4.5:1+)
- [ ] Text resizable to 200%
- [ ] No info by color alone
- [ ] Focus indicators visible
- [ ] Touch targets 44px+

---

## 🔒 Security Testing

### Headers
```bash
curl -I https://yourdomain.com
```

**Check for:**
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] X-XSS-Protection: 1
- [ ] Strict-Transport-Security (HSTS)
- [ ] Content-Security-Policy

### Data
- [ ] No sensitive data in localStorage
- [ ] No API keys in client code
- [ ] No console.logs in production
- [ ] XSS protection works
- [ ] Input sanitization

---

## 📊 User Flow Testing

### New User Journey
1. [ ] First visit → Onboarding
2. [ ] Complete onboarding → Home
3. [ ] See daily bias with examples
4. [ ] Add to favorites
5. [ ] View all biases
6. [ ] Search for a bias
7. [ ] Open bias detail
8. [ ] See related biases
9. [ ] Navigate between pages
10. [ ] Install as PWA

### Returning User
1. [ ] Open app (no onboarding)
2. [ ] See new daily bias
3. [ ] Pull to refresh
4. [ ] Check favorites
5. [ ] View progress stats
6. [ ] Update settings

### Power User
1. [ ] Voice commands
2. [ ] Mark biases mastered
3. [ ] Export data
4. [ ] Search & filter
5. [ ] Browse categories
6. [ ] Use keyboard shortcuts

---

## 🐛 Bug Testing

### Edge Cases
- [ ] Empty database (first load)
- [ ] Network offline
- [ ] Slow connection (3G)
- [ ] Large datasets (1000+ items)
- [ ] Long text strings
- [ ] Special characters
- [ ] Different timezones
- [ ] Browser back/forward
- [ ] Deep links

### Error Scenarios
- [ ] Failed fetch
- [ ] Database error
- [ ] Service worker failure
- [ ] Invalid routes
- [ ] Corrupted data
- [ ] Out of memory

---

## ✅ Pre-Production Checklist

### Code
- [ ] No console.log in production
- [ ] No debugger statements
- [ ] No TODO comments critical
- [ ] All dependencies up to date
- [ ] No security vulnerabilities

### Content
- [ ] All text proofread
- [ ] Images optimized
- [ ] Alt text present
- [ ] Meta descriptions
- [ ] Favicon present

### Configuration
- [ ] Environment variables set
- [ ] Analytics configured
- [ ] Error tracking setup
- [ ] Monitoring enabled
- [ ] Backup strategy

### Legal
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Cookie consent (if needed)
- [ ] GDPR compliance (if EU)
- [ ] Copyright notices

---

## 🎭 Manual Test Script

Run through this in 10 minutes:

```
1. Open app in incognito (onboarding)
2. Complete onboarding
3. See daily bias with tilt effect
4. Click Listen button (voice)
5. Add to favorites (heart)
6. Mark as mastered (star)
7. Go to All Biases
8. Search for "confirmation"
9. Click a bias
10. Scroll to see related biases
11. Go to Favorites
12. Go to Settings
13. See progress charts
14. Toggle theme
15. Go back to Home
16. Pull to refresh (mobile)
17. Install as PWA
18. Test offline mode
```

**Expected:** All steps work smoothly, no errors.

---

## 📈 Monitoring After Launch

### Week 1
- [ ] Check error logs daily
- [ ] Monitor performance metrics
- [ ] Watch user feedback
- [ ] Fix critical bugs
- [ ] Update based on usage

### Ongoing
- [ ] Weekly performance checks
- [ ] Monthly dependency updates
- [ ] Quarterly feature reviews
- [ ] Annual security audits

---

## 🎉 Success Criteria

Your app passes testing if:

✅ **Functionality:** All features work  
✅ **Performance:** Lighthouse 90+  
✅ **Accessibility:** WCAG AA compliant  
✅ **Mobile:** Smooth on all devices  
✅ **PWA:** Installable and works offline  
✅ **Animations:** Smooth 60 FPS  
✅ **No Errors:** Clean console  
✅ **Security:** Headers configured  
✅ **UX:** Delightful to use  

---

## 🆘 Common Issues & Solutions

### Issue: Onboarding loops
**Solution:** Clear localStorage and reload

### Issue: Pull-to-refresh not working
**Solution:** Ensure you're at scroll position 0

### Issue: Tilt effect not working
**Solution:** Desktop only, check mouse events

### Issue: Charts not showing
**Solution:** Check if data is available

### Issue: PWA not installing
**Solution:** Verify HTTPS, manifest, service worker

---

## ✨ You're Ready!

If all tests pass, your app is **production-ready**! 🎊

**Next steps:**
1. Deploy to staging
2. Run full test suite
3. Get feedback from beta users
4. Deploy to production
5. Monitor and iterate

**Congratulations on building a world-class app! 🚀**

