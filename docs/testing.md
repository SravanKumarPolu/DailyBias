# DebiasDaily Testing Strategy

## Overview

This document maps all 20 production-grade testing types to DebiasDaily's test coverage, tools, test locations, and CI/local execution strategy.

## Testing Types Coverage

### 1. Unit Testing
**What to test:**
- Individual components (BiasCard, Navigation, DailyHeader, etc.)
- Utility functions (daily-selector, timezone-utils, analytics-utils)
- Hooks (use-biases, use-favorites, use-settings, use-progress)
- Business logic (bias selection, progress tracking, favorites management)

**Tools:** Vitest + React Testing Library + @testing-library/user-event

**Test Location:** `__tests__/components/`, `__tests__/hooks/`, `__tests__/lib/`

**CI vs Local:**
- **CI:** Runs on every push/PR (`pnpm test:run`)
- **Local:** `pnpm test` (watch mode) or `pnpm test:unit`

**Coverage Target:** >80% for utilities, >70% for components

---

### 2. Integration Testing
**What to test:**
- Component interactions (favorite toggle + persistence)
- Context providers (AppContext with multiple hooks)
- Data flow (biases → favorites → progress)
- Settings persistence across sessions
- Navigation flows between pages

**Tools:** Vitest + React Testing Library + fake-indexeddb

**Test Location:** `__tests__/integration/`

**CI vs Local:**
- **CI:** Runs with unit tests (`pnpm test:run`)
- **Local:** `pnpm test:integration`

**Key Tests:**
- Daily page → favorite → favorites page
- Settings changes persist
- Navigation between all pages
- No flicker on daily page load

---

### 3. End-to-End (E2E) Testing
**What to test:**
- Complete user flows:
  - Daily page loads with correct bias (no flicker)
  - Favorite/unfavorite works and persists
  - Navigation tabs work (Daily/All/Favorites/Add/Analytics/Settings)
  - Add page: creating custom bias works
  - Settings toggles work and persist
  - Analytics page renders with correct values

**Tools:** Playwright

**Test Location:** `tests/e2e/`

**CI vs Local:**
- **CI:** Runs on 3 browsers (Chromium, Firefox, WebKit) + mobile emulation
- **Local:** `pnpm e2e` (Chromium only) or `pnpm e2e:ui` (interactive)

**Key Test Files:**
- `smoke.spec.ts` - Basic app functionality
- `navigation.spec.ts` - Navigation flows
- `favorites.spec.ts` - Favorite functionality
- `settings.spec.ts` - Settings persistence
- `analytics.spec.ts` - Analytics page
- `add-page.spec.ts` - Add custom bias
- `flicker.spec.ts` - No flicker on load

---

### 4. Smoke Testing
**What to test:**
- Critical paths work after deployment
- App loads without errors
- Daily bias displays
- Navigation renders
- No console errors

**Tools:** Playwright (E2E) + Vitest (unit smoke)

**Test Location:** 
- E2E: `tests/e2e/smoke.spec.ts`
- Unit: `__tests__/smoke.test.tsx`, `__tests__/smoke-comprehensive.test.tsx`

**CI vs Local:**
- **CI:** Runs first in E2E pipeline (fastest tests)
- **Local:** `pnpm e2e tests/e2e/smoke.spec.ts`

**Execution Time:** <30 seconds

---

### 5. Sanity Testing
**What to test:**
- Core features work after changes
- Daily page → All page → Favorites page
- Settings save/load
- Favorite toggle works

**Tools:** Playwright + Vitest

**Test Location:** 
- E2E: `tests/e2e/smoke.spec.ts` (subset)
- Unit: `__tests__/sanity-comprehensive.test.tsx`

**CI vs Local:**
- **CI:** Runs after smoke tests
- **Local:** `pnpm test:run __tests__/sanity-comprehensive.test.tsx`

**Execution Time:** <2 minutes

---

### 6. Regression Testing
**What to test:**
- Previously fixed bugs don't reappear
- Critical flows still work after changes
- No performance degradation
- No UI regressions

**Tools:** Playwright (E2E) + Visual Regression

**Test Location:** 
- `__tests__/regression/critical-flows.regression.test.tsx`
- `tests/e2e/visual-regression.spec.ts`

**CI vs Local:**
- **CI:** Runs full E2E suite
- **Local:** `pnpm e2e` or `pnpm test:run __tests__/regression/`

**Key Areas:**
- Daily page flicker fix
- Favorite persistence
- Settings persistence
- Navigation state

---

### 7. UI Testing
**What to test:**
- Component rendering
- User interactions (clicks, inputs, toggles)
- Form validation
- Error states
- Loading states

**Tools:** Vitest + React Testing Library

**Test Location:** `__tests__/ui/`, `__tests__/components/`

**CI vs Local:**
- **CI:** Runs with unit tests
- **Local:** `pnpm test:watch` (filter by component)

**Key Tests:**
- BiasCard renders correctly
- Navigation buttons work
- Settings toggles update UI
- Form validation messages

---

### 8. Visual Regression Testing
**What to test:**
- UI appearance matches baseline
- No unintended visual changes
- Responsive layouts correct
- Dark mode renders correctly

**Tools:** Playwright screenshots + `toHaveScreenshot()`

**Test Location:** `tests/e2e/visual-regression.spec.ts`

**CI vs Local:**
- **CI:** Runs on all browsers, uploads snapshots as artifacts
- **Local:** `pnpm e2e:visual` or `pnpm e2e:visual:update` (update snapshots)

**Snapshots:** `tests/e2e/visual-regression.spec.ts-snapshots/`

**Coverage:**
- Daily page (light/dark)
- All page
- Favorites page
- Analytics page
- Settings page (light/dark)
- Navigation component
- Bias card component
- Mobile/tablet/desktop viewports

---

### 9. Accessibility (a11y) Testing
**What to test:**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility
- ARIA labels and roles
- Color contrast
- Focus management

**Tools:** 
- `@axe-core/playwright` (E2E)
- `jest-axe` (unit/integration)

**Test Location:**
- E2E: `tests/e2e/accessibility.spec.ts`
- Unit: `__tests__/**/*.a11y.test.*`

**CI vs Local:**
- **CI:** Runs `pnpm test:a11y` (E2E) + `pnpm test:a11y:unit` (unit)
- **Local:** Same commands

**Key Checks:**
- All pages have proper headings
- Interactive elements keyboard accessible
- Images have alt text
- Forms have labels
- Color contrast ratios meet WCAG AA

---

### 10. Responsiveness Testing
**What to test:**
- Layout works on mobile (320px+)
- Layout works on tablet (768px+)
- Layout works on desktop (1024px+)
- Navigation adapts to screen size
- Text is readable at all sizes
- Touch targets are adequate (44x44px minimum)

**Tools:** Playwright with viewport emulation

**Test Location:** `tests/e2e/responsive.spec.ts`

**CI vs Local:**
- **CI:** Runs on multiple viewports (mobile, tablet, desktop)
- **Local:** `pnpm e2e tests/e2e/responsive.spec.ts`

**Viewports Tested:**
- Mobile: 375x667 (iPhone SE), 390x844 (iPhone 12)
- Tablet: 768x1024 (iPad)
- Desktop: 1280x720, 1920x1080

---

### 11. Cross-Browser Testing
**What to test:**
- App works in Chromium (Chrome/Edge)
- App works in Firefox
- App works in WebKit (Safari)
- Feature parity across browsers
- No browser-specific bugs

**Tools:** Playwright (Chromium, Firefox, WebKit)

**Test Location:** All E2E tests run on all browsers

**CI vs Local:**
- **CI:** Runs all E2E tests on 3 browsers (`chromium`, `firefox`, `webkit`)
- **Local:** `pnpm e2e` (Chromium by default), `pnpm e2e --project=firefox` for specific browser

**Browser Coverage:**
- Chromium: Chrome, Edge, Opera
- Firefox: Latest stable
- WebKit: Safari (iOS/macOS)

---

### 12. API Testing
**What to test:**
- Static export works (Next.js `output: 'export'`)
- No API endpoints (app is static)
- Data loading from JSON files
- IndexedDB operations (favorites, settings, progress)

**Tools:** Vitest + fake-indexeddb (for IndexedDB mocking)

**Test Location:** `__tests__/lib/db.test.ts`, `__tests__/hooks/use-*.test.ts`

**CI vs Local:**
- **CI:** Runs with unit tests
- **Local:** `pnpm test:run __tests__/lib/db.test.ts`

**Note:** DebiasDaily is a static app with no backend API. Testing focuses on:
- Data loading from `data/biases.json`
- IndexedDB CRUD operations
- Local storage operations

---

### 13. Load/Stress Testing
**What to test:**
- App handles large datasets (1000+ biases)
- IndexedDB operations scale
- No memory leaks on long sessions
- Performance with many favorites/progress entries

**Tools:** k6 (for load simulation) + Playwright (for stress scenarios)

**Test Location:** `tests/load/load-test.js`

**CI vs Local:**
- **CI:** Runs `pnpm test:load` (non-blocking)
- **Local:** `pnpm test:load`

**Scenarios:**
- Load 1000 biases
- 100 concurrent favorite toggles
- 1000 progress entries
- Long session (1 hour simulated)

---

### 14. Security Testing
**What to test:**
- Dependency vulnerabilities
- XSS prevention (React auto-escapes)
- No sensitive data in client code
- Secure headers (if deployed with server)
- IndexedDB data isolation

**Tools:** 
- `pnpm audit` (dependency audit)
- OWASP ZAP baseline scan (optional)
- Manual security review

**Test Location:** `scripts/security-check.sh`

**CI vs Local:**
- **CI:** Runs `pnpm test:security` (non-blocking)
- **Local:** `pnpm test:security`

**Checks:**
- Dependency audit (`pnpm audit`)
- Security headers check
- XSS vulnerability scan
- Data exposure review

---

### 15. Contract Testing
**What to test:**
- Data structure contracts (Bias type, Settings type)
- JSON schema validation
- Type safety (TypeScript)

**Tools:** TypeScript compiler + Zod (if used) + JSON schema validation

**Test Location:** `__tests__/lib/types.test.ts`

**CI vs Local:**
- **CI:** Runs `pnpm type-check` (TypeScript)
- **Local:** `pnpm type-check`

**Contracts:**
- `Bias` type matches JSON structure
- `Settings` type matches stored format
- `BiasProgress` type matches IndexedDB schema

---

### 16. Mobile Testing
**What to test:**
- Capacitor Android app works
- Capacitor iOS app works
- Native features (notifications, share)
- Touch interactions
- App state persistence
- Offline functionality

**Tools:** Manual testing + Playwright mobile emulation

**Test Location:** 
- Manual: See `docs/mobile-testing-checklist.md`
- Automated: `tests/e2e/mobile-emulation.spec.ts`

**CI vs Local:**
- **CI:** Playwright mobile emulation only (limited)
- **Local:** Manual device testing + `pnpm e2e --project=mobile-chrome`

**Automation Limitations:**
- Native features (notifications, share) require real devices
- Capacitor plugins need device testing
- App store builds need manual verification

---

### 17. Device Testing
**What to test:**
- Real Android devices (various OS versions)
- Real iOS devices (various OS versions)
- Different screen sizes
- Performance on low-end devices

**Tools:** Manual testing on real devices

**Test Location:** Manual testing checklist

**CI vs Local:**
- **CI:** Not automated (requires physical devices)
- **Local:** Manual testing on devices

**Device Matrix:**
- Android: 8.0+, various manufacturers
- iOS: 13.0+, iPhone and iPad
- Screen sizes: Small (320px) to Large (tablets)

---

### 18. Usability Testing
**What to test:**
- User can complete core tasks
- Navigation is intuitive
- Error messages are clear
- Onboarding flow works
- Settings are discoverable

**Tools:** Manual testing + User feedback

**Test Location:** Manual testing + user research

**CI vs Local:**
- **CI:** Not automated (requires human evaluation)
- **Local:** Manual usability sessions

**Key Areas:**
- First-time user onboarding
- Daily bias discovery
- Favorite management
- Settings configuration
- Analytics understanding

---

### 19. Beta Testing
**What to test:**
- Pre-release validation
- Real-world usage scenarios
- Performance under real conditions
- User feedback collection

**Tools:** Beta distribution (TestFlight, Google Play Beta)

**Test Location:** External beta testing

**CI vs Local:**
- **CI:** Not applicable
- **Local:** Beta distribution process

**Process:**
1. Build beta version
2. Distribute via TestFlight (iOS) / Google Play Beta (Android)
3. Collect feedback
4. Fix issues
5. Release to production

---

### 20. Localization Testing
**What to test:**
- Date formatting in different locales
- Timezone handling
- Text rendering (if i18n added)
- RTL support (if needed)

**Tools:** Manual testing + Playwright locale emulation

**Test Location:** Manual testing (i18n not yet implemented)

**CI vs Local:**
- **CI:** Not automated (i18n not implemented)
- **Local:** Manual locale testing

**Current Status:**
- App uses English only
- Date formatting uses browser locale
- Timezone detection works globally
- Future: Add i18n support for multiple languages

---

## Test Execution Commands

### Local Development

```bash
# Unit + Integration tests (watch mode)
pnpm test

# Unit + Integration tests (single run)
pnpm test:run

# Unit tests only
pnpm test:unit

# Integration tests only
pnpm test:integration

# E2E tests (Chromium)
pnpm e2e

# E2E tests (all browsers)
pnpm e2e --project=chromium --project=firefox --project=webkit

# E2E tests (mobile emulation)
pnpm e2e --project=mobile-chrome --project=mobile-safari

# Visual regression tests
pnpm e2e:visual

# Update visual snapshots
pnpm e2e:visual:update

# Accessibility tests
pnpm test:a11y
pnpm test:a11y:unit

# Run all tests (unit + integration + E2E)
pnpm test:all

# Performance (Lighthouse)
pnpm test:lighthouse

# Load testing
pnpm test:load

# Security audit
pnpm test:security

# Type checking
pnpm type-check
```

### CI/CD

CI runs automatically on:
- Push to `main`, `master`, `develop`
- Pull requests
- Manual workflow dispatch

**CI Workflow Jobs:**
1. **Lint & Format** - Code quality checks
2. **Security Audit** - Dependency vulnerabilities
3. **Unit + Integration Tests** - Fast feedback (<30s)
4. **E2E Tests (Chromium)** - Core flows (<5min)
5. **E2E Tests (Firefox)** - Cross-browser (<5min)
6. **E2E Tests (WebKit)** - Cross-browser (<5min)
7. **E2E Tests (Mobile)** - Mobile emulation (<5min)
8. **Visual Regression** - UI snapshots (non-blocking)
9. **Accessibility** - A11y checks
10. **Lighthouse** - Performance (non-blocking)
11. **Load Testing** - Stress tests (non-blocking)

---

## Test Data Management

### Deterministic Date Handling

All tests use fixed dates to ensure deterministic results:

- **Unit/Integration:** `vitest.setup.ts` mocks `Date.now()` and `getLocalDateString()` to return `2025-12-05`
- **E2E:** `tests/e2e/helpers.ts` freezes browser Date to `2025-12-05`

This ensures:
- Daily bias selection is consistent
- Progress tracking uses fixed timestamps
- No flaky time-dependent tests

### Test Data

- **Core Biases:** Loaded from `data/biases.json`
- **User Biases:** Created in tests via `useBiases().addBias()`
- **Favorites:** Stored in IndexedDB (mocked with `fake-indexeddb`)
- **Settings:** Stored in IndexedDB
- **Progress:** Stored in IndexedDB

---

## Test Coverage Goals

- **Unit Tests:** >80% coverage for utilities, >70% for components
- **Integration Tests:** All critical flows covered
- **E2E Tests:** All user journeys covered
- **Accessibility:** WCAG 2.1 AA compliance
- **Visual Regression:** All pages and components

---

## Continuous Improvement

1. **Monitor test flakiness** - Track and fix flaky tests
2. **Update snapshots** - Review visual changes before updating
3. **Expand coverage** - Add tests for new features
4. **Performance** - Keep test suite fast (<5min for E2E)
5. **Documentation** - Keep this doc updated with new test types

---

## Troubleshooting

### Tests failing due to date issues
- Ensure `vitest.setup.ts` mocks are active
- Check E2E tests use `freezeDate()` helper
- Verify timezone mocks are correct

### Visual regression failures
- Review screenshots in `test-results/`
- Update snapshots if change is intentional: `pnpm e2e:visual:update`
- Check for browser-specific rendering differences

### E2E tests timing out
- Increase timeout in `playwright.config.ts` if needed
- Check web server starts correctly
- Verify test helpers wait for proper elements

### IndexedDB errors in tests
- Ensure `fake-indexeddb/auto` is imported first
- Clear IndexedDB between tests
- Use sequential test execution for IndexedDB tests

---

## References

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Axe Core](https://www.deque.com/axe/)
- [k6 Documentation](https://k6.io/docs/)
