# Core Features Verification Checklist

**Purpose:** Ensure no core features are missing or damaged during development, refactoring, or deployment.

**Last Updated:** 2025-01-21

---

## 🎯 Core Feature Categories

### 1. Daily Bias Feature ✅
**Location:** `app/page.tsx`, `hooks/use-daily-bias.ts`, `lib/daily-selector.ts`

**Critical Functionality:**
- [ ] Daily bias displays correctly on home page
- [ ] Bias changes at midnight (respects timezone settings)
- [ ] No flicker on initial load (hydration issue fixed)
- [ ] Personalized selection based on progress
- [ ] Falls back to core biases if user biases unavailable
- [ ] Respects `mixUserBiasesInDaily` setting
- [ ] Caches daily bias in localStorage/IndexedDB
- [ ] Pull-to-refresh works correctly
- [ ] Date header displays correctly

**Data Flow:**
- [ ] `useDailyBias` hook works correctly
- [ ] `getPersonalizedDailyBias` function works
- [ ] `getStoredDailyBias` retrieves cached bias
- [ ] `cacheDailyBias` stores bias correctly

**Test Commands:**
```bash
# Run daily bias tests
pnpm test __tests__/hooks/use-daily-bias.test.ts
pnpm test __tests__/lib/daily-selector.test.ts
```

---

### 2. All Biases Page ✅
**Location:** `app/all/page.tsx`

**Critical Functionality:**
- [ ] All biases list loads correctly
- [ ] Search functionality works (title, description, category)
- [ ] Category filters work (decision, memory, social, perception, misc)
- [ ] Search results are relevant and accurate
- [ ] Lazy loading works (loads more as you scroll)
- [ ] Favorite button works on each card
- [ ] Mastered button works on each card
- [ ] Recommendation card displays when no search active
- [ ] Empty state displays when no results
- [ ] Responsive grid layout works on all screen sizes

**Data Flow:**
- [ ] `searchBiases` function works correctly
- [ ] `validateSearchQuery` sanitizes input
- [ ] `getBalancedRecommendation` provides recommendations
- [ ] Favorites state syncs with context

**Test Commands:**
```bash
# Run all biases page tests
pnpm test __tests__/app/all.test.ts
pnpm test __tests__/lib/search-utils.test.ts
```

---

### 3. Favorites Feature ✅
**Location:** `app/favorites/page.tsx`, `hooks/use-favorites.ts`

**Critical Functionality:**
- [ ] Favorites page loads correctly
- [ ] Previously favorited biases appear
- [ ] Favorite/unfavorite works from any page
- [ ] Favorites persist after app restart
- [ ] Empty state displays when no favorites
- [ ] Favorites sorted by most recently added
- [ ] Mastered state displays correctly
- [ ] Navigation to bias detail page works

**Data Flow:**
- [ ] `toggleFavorite` function works
- [ ] `isFavorite` function works
- [ ] IndexedDB storage persists correctly
- [ ] Context updates immediately after toggle

**Test Commands:**
```bash
# Run favorites tests
pnpm test __tests__/hooks/use-favorites.test.ts
pnpm test __tests__/app/favorites.test.ts
```

---

### 4. Custom Biases (Add/Edit) ✅
**Location:** `app/add/page.tsx`, `hooks/use-biases.ts`

**Critical Functionality:**
- [ ] Add button opens dialog/form
- [ ] Form fields are accessible and validated
- [ ] Can create custom bias with all fields
- [ ] Can edit existing custom bias
- [ ] Can delete custom bias (with confirmation)
- [ ] Custom bias appears in all biases list
- [ ] Custom bias can be favorited
- [ ] Custom bias can appear in daily selection (if setting enabled)
- [ ] Form validation works (title, summary required)
- [ ] Duplicate title detection works
- [ ] Character limits enforced (title: 100, summary: 500, why/counter: 1000)

**Data Flow:**
- [ ] `addBias` function works
- [ ] `updateBias` function works
- [ ] `deleteBias` function works
- [ ] `getUserBiases` retrieves correctly
- [ ] IndexedDB storage works

**Test Commands:**
```bash
# Run custom biases tests
pnpm test __tests__/hooks/use-biases.test.ts
pnpm test __tests__/app/add.test.ts
```

---

### 5. Analytics Page ✅
**Location:** `app/analytics/page.tsx`

**Critical Functionality:**
- [ ] Analytics page loads correctly
- [ ] Overview tab displays metrics
- [ ] Learning Progress tab shows charts
- [ ] Content Quality tab displays quality metrics
- [ ] Reviews tab shows review statistics
- [ ] Tab navigation works correctly
- [ ] Charts/graphs render correctly
- [ ] Statistics are accurate
- [ ] Data updates when viewing biases
- [ ] Content needing review alert displays

**Data Flow:**
- [ ] `calculateAnalyticsMetrics` works
- [ ] `getRecentActivity` works
- [ ] `contentVersionManager` works
- [ ] Feedback data loads correctly

**Test Commands:**
```bash
# Run analytics tests
pnpm test __tests__/app/analytics.test.ts
pnpm test __tests__/lib/analytics-utils.test.ts
```

---

### 6. Settings Page ✅
**Location:** `app/settings/page.tsx`, `hooks/use-settings.ts`

**Critical Functionality:**
- [ ] All settings toggles work
- [ ] Theme toggle works (light/dark) - via next-themes
- [ ] Background style changes apply (gradient/glass/minimal)
- [ ] Voice settings work (enable, voice selection, rate, pitch)
- [ ] Notification settings work (daily reminder)
- [ ] Timezone settings work (auto-detect/manual)
- [ ] Mix user biases setting works
- [ ] Data export works (downloads JSON)
- [ ] Data import works (merges with existing)
- [ ] Settings persist after app restart

**Data Flow:**
- [ ] `saveSetting` function works
- [ ] `exportAllData` works
- [ ] `importAllData` works
- [ ] IndexedDB storage persists

**Test Commands:**
```bash
# Run settings tests
pnpm test __tests__/hooks/use-settings.test.ts
pnpm test __tests__/app/settings.test.ts
```

---

### 7. Progress Tracking ✅
**Location:** `hooks/use-progress.ts`, `lib/db.ts`

**Critical Functionality:**
- [ ] Mark bias as viewed works
- [ ] Mark bias as mastered works
- [ ] Progress persists after app restart
- [ ] Streak calculation works correctly
- [ ] Progress stats are accurate
- [ ] Progress indicators display correctly
- [ ] Daily progress widget shows correct data

**Data Flow:**
- [ ] `markAsViewed` function works
- [ ] `toggleMastered` function works
- [ ] `isViewed` function works
- [ ] `isMastered` function works
- [ ] Streak calculation is accurate

**Test Commands:**
```bash
# Run progress tests
pnpm test __tests__/hooks/use-progress.test.ts
```

---

### 8. Individual Bias Pages ✅
**Location:** `app/bias/[id]/page.tsx`

**Critical Functionality:**
- [ ] Bias detail page loads correctly
- [ ] All bias information displays (title, summary, why, counter)
- [ ] Favorite button works
- [ ] Mastered button works
- [ ] Text-to-speech works (if enabled)
- [ ] Related biases display
- [ ] Navigation back works
- [ ] 404 page shows for invalid bias IDs

**Test Commands:**
```bash
# Run bias detail tests
pnpm test __tests__/app/bias.test.ts
```

---

### 9. Navigation ✅
**Location:** `components/dynamic-navigation.tsx`

**Critical Functionality:**
- [ ] Bottom navigation is visible
- [ ] All 6 tabs are accessible (Daily, All, Favorites, Add, Analytics, Settings)
- [ ] Active tab is highlighted correctly
- [ ] Navigation works smoothly (no lag)
- [ ] Navigation persists across app restarts
- [ ] Touch targets are large enough (mobile)
- [ ] Keyboard navigation works

**Test Commands:**
```bash
# Run navigation tests
pnpm test __tests__/components/dynamic-navigation.test.ts
```

---

### 10. Onboarding ✅
**Location:** `app/onboarding/page.tsx`

**Critical Functionality:**
- [ ] Onboarding displays for new users
- [ ] Onboarding skips for returning users
- [ ] All 3 steps display correctly
- [ ] Navigation between steps works
- [ ] Skip button works
- [ ] Get Started button works
- [ ] Onboarding completion is stored in localStorage
- [ ] No Framer Motion flicker (if removed)

**Test Commands:**
```bash
# Run onboarding tests
pnpm test __tests__/app/onboarding.test.ts
```

---

### 11. Text-to-Speech ✅
**Location:** `hooks/use-speech.ts`, `components/dynamic-bias-card.tsx`

**Critical Functionality:**
- [ ] Voice can be enabled/disabled in settings
- [ ] Voice selection works
- [ ] Speech rate adjustment works
- [ ] Speech pitch adjustment works
- [ ] Play/pause button works on bias cards
- [ ] Voice stops when navigating away
- [ ] High-quality voices are prioritized
- [ ] Voice works on mobile and desktop

**Test Commands:**
```bash
# Run speech tests
pnpm test __tests__/hooks/use-speech.test.ts
```

---

### 12. Offline Support ✅
**Location:** All pages, `data/biases.json`

**Critical Functionality:**
- [ ] App works completely offline after first load
- [ ] Bias data loads from bundled JSON
- [ ] Favorites stored in IndexedDB (works offline)
- [ ] Daily bias cached in localStorage (works offline)
- [ ] Custom biases stored in IndexedDB (works offline)
- [ ] Settings stored in IndexedDB (works offline)
- [ ] Progress stored in IndexedDB (works offline)
- [ ] No network errors when offline

**Test Commands:**
```bash
# Run offline tests
pnpm test __tests__/integration/offline.test.ts
```

---

### 13. PWA/Mobile Features ✅
**Location:** `manifest.json`, `capacitor.config.ts`

**Critical Functionality:**
- [ ] App can be installed as PWA
- [ ] App icon displays correctly
- [ ] Splash screen works
- [ ] Capacitor Android app builds
- [ ] Capacitor iOS app builds
- [ ] Native notifications work (if enabled)
- [ ] Share functionality works (if implemented)
- [ ] Haptic feedback works (if implemented)

**Test Commands:**
```bash
# Build mobile apps
pnpm mobile:build
pnpm android:build
pnpm ios:open
```

---

### 14. Data Persistence ✅
**Location:** `lib/db.ts`, `lib/storage.ts`

**Critical Functionality:**
- [ ] IndexedDB database opens correctly
- [ ] All data types persist (biases, favorites, progress, settings)
- [ ] Data survives app restarts
- [ ] Data export includes all data
- [ ] Data import merges correctly
- [ ] No data loss on updates
- [ ] Migration logic works (if needed)

**Test Commands:**
```bash
# Run database tests
pnpm test __tests__/lib/db.test.ts
pnpm test __tests__/lib/storage.test.ts
```

---

### 15. Feedback System ✅
**Location:** `components/feedback-form.tsx`, `lib/db.ts`

**Critical Functionality:**
- [ ] Feedback form opens correctly
- [ ] Form validation works
- [ ] Feedback submits successfully
- [ ] Feedback stored in IndexedDB
- [ ] EmailJS integration works (if configured)
- [ ] Feedback appears in analytics

**Test Commands:**
```bash
# Run feedback tests
pnpm test __tests__/components/feedback-form.test.ts
```

---

### 16. Achievements/Badges System ✅
**Location:** `lib/achievements.ts`, `hooks/use-achievements.ts`, `components/achievement-badge.tsx`

**Critical Functionality:**
- [ ] Achievements unlock automatically when requirements met
- [ ] Achievement progress tracked correctly
- [ ] Toast notifications show when achievements unlock
- [ ] Achievements persist after app restart
- [ ] Achievement badges display correctly
- [ ] Achievement categories work (streak, mastery, quiz, exploration, engagement)
- [ ] Rarity levels display correctly (common, rare, epic, legendary)
- [ ] Progress bars show current progress
- [ ] Achievements tab in Analytics page works

**Achievement Types:**
- **Streak Achievements:** First Week Streak (7 days), Two Week Streak (14 days), Month Streak (30 days)
- **Mastery Achievements:** First Mastered, Five Mastered, Ten Mastered
- **Category Mastery:** All Social Biases, All Decision Biases, All Memory Biases, All Perception Biases
- **Quiz Achievements:** Quiz Novice, Quiz Master (10 quizzes), Perfect Quiz (100% score)
- **Exploration:** First Bias, Ten Biases, Twenty-Five Biases, All Core Biases (50)
- **Engagement:** Favorite Collector (5 favorites), Custom Creator, Feedback Provider

**Data Flow:**
- [ ] `calculateAchievementProgress` calculates progress correctly
- [ ] `checkAndUnlockAchievements` unlocks achievements
- [ ] `useAchievements` hook provides achievement data
- [ ] IndexedDB stores unlocked achievements
- [ ] Achievement notifications trigger on unlock

**Test Commands:**
```bash
# Run achievement tests
pnpm test __tests__/lib/achievements.test.ts
```

---

## 🔍 Quick Verification Commands

### Run All Tests
```bash
# Unit tests
pnpm test:run

# Integration tests
pnpm test:integration

# E2E tests
pnpm e2e

# All tests
pnpm test:all
```

### Build Verification
```bash
# Type check
pnpm type-check

# Lint
pnpm lint

# Build
pnpm build

# Validate everything
pnpm validate
```

### Manual Testing Checklist
```bash
# 1. Start dev server
pnpm dev

# 2. Test each page:
# - Daily page (/) - check daily bias loads
# - All page (/all) - check search and filters
# - Favorites (/favorites) - check favorites persist
# - Add (/add) - check create/edit/delete
# - Analytics (/analytics) - check all tabs
# - Settings (/settings) - check all toggles

# 3. Test mobile
pnpm mobile:build
pnpm android:open
```

---

## 🚨 Critical Paths to Test

### Before Any Deployment:
1. ✅ Daily bias loads without flicker
2. ✅ Favorites persist after refresh
3. ✅ Custom biases can be created/edited/deleted
4. ✅ Settings persist after refresh
5. ✅ Progress tracking works
6. ✅ Navigation works on all pages
7. ✅ App works offline
8. ✅ Build succeeds without errors
9. ✅ All tests pass
10. ✅ No console errors
11. ✅ Achievements unlock and persist correctly

### Before App Store Submission:
1. ✅ All core features work on Android
2. ✅ All core features work on iOS
3. ✅ Notifications work (if enabled)
4. ✅ App can be installed
5. ✅ No crashes on startup
6. ✅ Performance is acceptable
7. ✅ Accessibility works
8. ✅ Privacy policy accessible

---

## 📝 Notes

- **Data Storage:** All data is stored locally (IndexedDB + localStorage)
- **No Backend:** App is completely client-side
- **Offline First:** App works offline after first load
- **Privacy:** No user data sent to servers (except optional EmailJS feedback)

---

## 🔄 Update This Checklist

When adding new features:
1. Add feature to appropriate category
2. Add test commands
3. Add to critical paths
4. Update last updated date

When fixing bugs:
1. Add verification step to prevent regression
2. Add test case if missing
3. Update checklist with new test

---

**Remember:** This checklist ensures no core features are broken. Always run this before major changes or deployments!









