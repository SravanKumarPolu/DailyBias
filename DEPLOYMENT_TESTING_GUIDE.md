# Deployment Testing Guide - Web & Play Store

## Overview

This guide outlines the comprehensive testing strategy required before deploying DailyBias to:
1. **Web** (production website)
2. **Play Store** (Android mobile app)

## Testing Pyramid

Your testing should follow this structure (from most to least tests):

```
        /\
       /E2E\          ← Fewer, broader tests (Critical user flows)
      /------\
     /Integration\    ← Moderate, feature-focused tests
    /------------\
   /   Unit Tests \   ← Many, fast tests (Individual components/functions)
  /----------------\
```

---

## 1. Unit Tests (Current: ~29 files)

**Purpose**: Test individual functions, components, and utilities in isolation

### Required Coverage:
- ✅ **Component Tests** (19 test files)
  - All UI components render correctly
  - Props handling
  - Event handlers
  - State management
  
- ✅ **Utility Function Tests** (6 test files)
  - Data transformations
  - Validation logic
  - Storage operations
  - Date calculations
  
- ✅ **Hook Tests** (1 test file)
  - Custom React hooks
  - State updates
  - Side effects

### Target Coverage: **70-80% code coverage**

**Run with**: `pnpm test:coverage`

**What to Check**:
- All components have basic render tests
- All utility functions have tests
- All hooks are tested
- Edge cases are covered

---

## 2. Integration Tests (Current: ~7 files)

**Purpose**: Test how multiple components/modules work together

### Required Tests:

#### ✅ Critical Flows:
- [ ] **Daily bias flow**: Load → Display → Favorite → Mark mastered
- [ ] **Navigation flow**: Switch between all pages
- [ ] **Search flow**: Search biases → Filter → View details
- [ ] **Settings persistence**: Change settings → Restart → Verify persistence
- [ ] **Favorites flow**: Add → View in favorites → Remove
- [ ] **Analytics flow**: View biases → Check analytics updates
- [ ] **Add bias flow**: Create custom bias → View in list → Edit → Delete

#### ✅ Data Flow:
- [ ] App context data loading
- [ ] Progress tracking integration
- [ ] Storage operations (IndexedDB)
- [ ] Date selection and daily bias calculation

**Run with**: `pnpm test:integration`

**Target**: All user-facing features have at least one integration test

---

## 3. E2E Tests (Current: 11 files)

**Purpose**: Test complete user workflows from browser/device perspective

### Required E2E Test Suites:

#### ✅ **Smoke Tests** (Critical paths - MUST pass)
- [ ] App loads successfully
- [ ] Daily page displays
- [ ] Navigation works
- [ ] No console errors

**File**: `tests/e2e/smoke.spec.ts`

#### ✅ **Core Functionality**
- [ ] **Navigation** (`navigation.spec.ts`): All pages accessible
- [ ] **Daily Page** (`smoke.spec.ts`): Daily bias displays correctly
- [ ] **Favorites** (`favorites.spec.ts`): Add/remove favorites works
- [ ] **Settings** (`settings.spec.ts`): Settings persist and apply
- [ ] **Analytics** (`analytics.spec.ts`): Analytics display correctly
- [ ] **Add Page** (`add-page.spec.ts`): Custom bias creation works

#### ✅ **Mobile-Specific**
- [ ] **Mobile Emulation** (`mobile-emulation.spec.ts`): Test on mobile viewports
- [ ] **Responsive Design** (`responsive.spec.ts`): Layout adapts correctly
- [ ] **Touch Interactions**: Tap, swipe, scroll work correctly

#### ✅ **Quality Assurance**
- [ ] **Accessibility** (`accessibility.spec.ts`): WCAG compliance
- [ ] **Visual Regression** (`visual-regression.spec.ts`): UI doesn't break
- [ ] **Performance** (`flicker.spec.ts`): No flickering, smooth transitions

**Run with**: `pnpm e2e`

**Target**: All critical user journeys covered

---

## 4. Visual Regression Tests

**Purpose**: Ensure UI doesn't break with changes

### Required Snapshots:
- ✅ All pages (Daily, All, Favorites, Analytics, Settings, Add)
- ✅ Light and dark themes
- ✅ Mobile and desktop layouts
- ✅ Component variations (different states)

**Run with**: `pnpm e2e:visual`

**Before Deployment**:
- [ ] Review all visual differences
- [ ] Update snapshots only for intentional changes
- [ ] Verify mobile snapshots match real devices

**Files**: `tests/e2e/visual-regression.spec.ts` + snapshots

---

## 5. Accessibility Tests

**Purpose**: Ensure app is usable by everyone (WCAG 2.1 AA compliance)

### Required Checks:

#### ✅ Automated (via Playwright + axe-core):
- [ ] No accessibility violations (run `pnpm test:a11y`)
- [ ] All images have alt text
- [ ] Form labels are correct
- [ ] Keyboard navigation works
- [ ] Color contrast meets standards
- [ ] ARIA labels are correct

#### ✅ Manual Checks:
- [ ] Screen reader compatibility (VoiceOver/TalkBack)
- [ ] Keyboard-only navigation
- [ ] Focus indicators visible
- [ ] Touch targets are adequate (44x44px minimum)

**Run with**: `pnpm test:a11y` (E2E) + `pnpm test:a11y:unit` (Component-level)

**Target**: Zero critical/high accessibility violations

---

## 6. Performance Tests

**Purpose**: Ensure app loads fast and performs well

### Required Metrics:

#### ✅ Lighthouse Scores (Target):
- **Performance**: 90+ (mobile), 95+ (desktop)
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 90+

#### ✅ Load Time:
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Largest Contentful Paint < 2.5s

#### ✅ Runtime Performance:
- [ ] No memory leaks
- [ ] Smooth scrolling (60fps)
- [ ] Fast page transitions
- [ ] Efficient data loading

**Run with**: 
- `pnpm test:lighthouse` (if configured)
- Chrome DevTools Lighthouse
- Playwright performance tracing

---

## 7. Mobile-Specific Tests (For Play Store)

### ✅ Native Features (Manual Testing Required):
Since Capacitor plugins can't be fully automated:

- [ ] **Splash Screen**: Displays correctly on app launch
- [ ] **Notifications**: Request permission, schedule, receive
- [ ] **Share**: Share bias to other apps works
- [ ] **Back Button** (Android): Navigates correctly, doesn't exit unexpectedly
- [ ] **App State**: Persists when backgrounded/foregrounded

### ✅ Device Testing Matrix:

#### Android (Minimum 3 devices):
- [ ] **Android 8.0+** (API 26+) - Oldest supported
- [ ] **Android 11-13** (API 30-33) - Common versions
- [ ] **Android 14+** (API 34+) - Latest version
- [ ] **Different screen sizes**: Phone (320px-480px), Tablet (768px+)
- [ ] **Different manufacturers**: Samsung, Google Pixel, OnePlus, etc.

### ✅ Play Store Specific:
- [ ] **App Bundle** builds correctly (`./gradlew bundleRelease`)
- [ ] **Signed APK** for internal testing
- [ ] **App Store Listing**: Screenshots, description, icons
- [ ] **Permissions**: Only request necessary permissions
- [ ] **Privacy Policy**: Required for Play Store

**Run with**: Manual testing on physical devices + emulators

---

## 8. Security Tests

**Purpose**: Ensure app is secure

### Required Checks:

#### ✅ Dependency Security:
- [ ] No known vulnerabilities (`pnpm audit`)
- [ ] Dependencies are up-to-date
- [ ] No outdated packages with security issues

#### ✅ Code Security:
- [ ] No sensitive data in code (API keys, secrets)
- [ ] Input validation prevents XSS
- [ ] Secure storage (IndexedDB for sensitive data)
- [ ] HTTPS only in production

#### ✅ Data Privacy:
- [ ] GDPR compliance (if applicable)
- [ ] Privacy policy is accessible
- [ ] User data is handled securely

**Run with**: 
- `pnpm audit:security`
- `pnpm audit:deps`
- Manual code review

---

## 9. Cross-Browser Tests

**Purpose**: Ensure app works on all major browsers

### Required Browsers:

#### ✅ Desktop:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (WebKit)

#### ✅ Mobile Browsers:
- [ ] Chrome (Android)
- [ ] Safari (iOS)
- [ ] Samsung Internet (if significant user base)

**Run with**: Playwright multi-browser tests (`pnpm e2e`)

**Target**: All tests pass on all configured browsers

---

## 10. Pre-Deployment Checklist

### ✅ For Web Deployment:

- [ ] All unit tests pass (`pnpm test:run`)
- [ ] All integration tests pass (`pnpm test:integration`)
- [ ] All E2E tests pass (`pnpm e2e`)
- [ ] Visual regression tests pass (`pnpm e2e:visual`)
- [ ] Accessibility tests pass (`pnpm test:a11y`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Production build tested locally
- [ ] Performance scores meet targets
- [ ] Security audit passes
- [ ] All critical user flows tested manually
- [ ] Error pages work (404, 500)
- [ ] Analytics tracking works
- [ ] SEO meta tags correct

### ✅ For Play Store Deployment:

- [ ] All web tests pass (above checklist)
- [ ] Android build succeeds (`pnpm android:build`)
- [ ] App runs on minimum 3 Android devices
- [ ] All native features tested manually
- [ ] App doesn't crash on launch
- [ ] App handles permissions correctly
- [ ] App works offline (if applicable)
- [ ] App state persists correctly
- [ ] Battery usage is acceptable
- [ ] App size is reasonable (<50MB recommended)
- [ ] App Store assets ready (screenshots, icons, description)
- [ ] Privacy policy URL ready
- [ ] Content rating completed
- [ ] Internal testing group validates app
- [ ] Beta testing completed (if doing staged rollout)

---

## Test Count Summary

### Current Test Files:
- **Unit Tests**: ~29 files
- **Integration Tests**: ~7 files
- **E2E Tests**: 11 files
- **Total**: ~47 test files

### Recommended Minimum Coverage:

| Test Type | Current | Target | Priority |
|-----------|---------|--------|----------|
| **Unit Tests** | ~29 files | 30-40 files | High |
| **Integration Tests** | ~7 files | 10-15 files | High |
| **E2E Tests** | 11 files | 15-20 files | Critical |
| **Visual Regression** | ✅ | ✅ | Medium |
| **Accessibility** | ✅ | ✅ | High |
| **Performance** | Partial | ✅ | Medium |
| **Security** | ✅ | ✅ | Critical |
| **Manual Mobile** | - | Full checklist | Critical |

---

## Running All Tests

### Before Web Deployment:
```bash
# Run all automated tests
pnpm validate                    # Type check + lint + unit tests
pnpm test:integration            # Integration tests
pnpm e2e                         # E2E tests (all browsers)
pnpm e2e:visual                  # Visual regression
pnpm test:a11y                   # Accessibility
pnpm audit:security              # Security audit
pnpm build                       # Production build
```

### Before Play Store Deployment:
```bash
# Run all web tests first
# Then...
pnpm mobile:build                # Build for mobile
pnpm android:build               # Build Android APK/AAB
# Then manual testing on devices (see mobile-testing-checklist.md)
```

---

## Continuous Integration

Your GitHub Actions workflow (`.github/workflows/code-quality.yml`) already includes:
- ✅ Linting & formatting
- ✅ Security audit
- ✅ Visual regression tests
- ✅ Accessibility tests

**Recommendation**: Add a job for:
- [ ] Unit test coverage reporting
- [ ] Integration tests
- [ ] Performance budgets (Lighthouse CI)

---

## Test Coverage Goals

### Code Coverage Targets:
- **Overall**: 70-80%
- **Critical paths**: 90%+
- **Utilities**: 90%+
- **Components**: 70%+
- **Hooks**: 80%+

### User Flow Coverage:
- **Critical flows**: 100% (all have tests)
- **Common flows**: 90%
- **Edge cases**: 70%

---

## Priority Order for Testing

1. **Critical** (Do First):
   - Smoke tests
   - Navigation tests
   - Core functionality (Daily, Favorites)
   - Mobile manual testing on real devices

2. **High** (Do Before Release):
   - Integration tests
   - E2E tests for all pages
   - Accessibility tests
   - Security audit

3. **Medium** (Do Regularly):
   - Visual regression
   - Performance tests
   - Cross-browser tests
   - Unit test coverage

4. **Nice to Have**:
   - Load testing
   - Stress testing
   - Beta user testing

---

## Resources

- [Mobile Testing Checklist](./docs/mobile-testing-checklist.md)
- [Testing Documentation](./docs/testing.md)
- [E2E Testing Guide](./docs/e2e-testing.md)
- [Integration Testing Guide](./docs/integration-testing.md)

---

## Getting Help

If tests fail:
1. Check test output for specific errors
2. Review test files for expected behavior
3. Check recent code changes
4. Review [TESTING_INSTRUCTIONS.md](./TESTING_INSTRUCTIONS.md)

---

**Last Updated**: Based on current codebase structure
**Status**: Comprehensive test suite in place, focus on mobile manual testing for Play Store

