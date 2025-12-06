# DebiasDaily Testing Strategy

This document maps all 20 testing types to DebiasDaily test coverage, tools, and execution strategy.

## Overview

DebiasDaily is a Next.js web app with Capacitor mobile support. Testing covers:
- **Routes**: Daily (/), All (/all), Favorites (/favorites), Add (/add), Analytics (/analytics), Settings (/settings)
- **Data Sources**: Local JSON (`data/biases.json`), IndexedDB (favorites, progress, settings, user biases)
- **State Management**: React Context API (`app-context.tsx`)
- **Theming**: next-themes (light/dark/system)
- **i18n**: English only (localization tests prepare for future expansion)
- **Build**: Next.js 15 (static export), TypeScript, Tailwind CSS, Capacitor 7

---

## Testing Types & Coverage

### 1. Unit Tests
**What to Test:**
- Individual components (BiasCard, Navigation, etc.)
- Utility functions (daily-selector, search-utils, validation, etc.)
- Hooks (use-debounce, use-favorites, use-settings, etc.)
- Date/time logic (timezone handling, daily bias selection)

**Tools:** Vitest + React Testing Library + @testing-library/jest-dom

**Location:** `__tests__/components/`, `__tests__/hooks/`, `__tests__/lib/`

**Execution:**
- Local: `pnpm test:unit`
- CI: Runs in parallel, < 30s target

**Key Tests:**
- Component rendering without errors
- Hook state management
- Utility function edge cases
- Date-dependent logic with mocked dates

---

### 2. Integration Tests
**What to Test:**
- Multi-component interactions
- Context provider integration
- IndexedDB operations (favorites, progress, settings persistence)
- Navigation flows
- Settings persistence across sessions
- Daily bias selection with progress tracking
- Analytics computation

**Tools:** Vitest + React Testing Library + fake-indexeddb

**Location:** `__tests__/integration/`

**Execution:**
- Local: `pnpm test:integration`
- CI: Runs sequentially (to avoid IndexedDB conflicts), < 2min target

**Key Tests:**
- Daily page → Favorite → Persist → Reload
- Settings toggle → Persist → Reload
- Navigation between pages
- Analytics page with seeded data
- No flicker on Daily page first load

---

### 3. E2E Tests
**What to Test:**
- Complete user flows across pages
- Navigation bottom tabs
- Favorite/unfavorite persistence
- Add custom bias flow
- Settings toggles and persistence
- Analytics page rendering
- Daily page no-flicker guarantee

**Tools:** Playwright

**Location:** `tests/e2e/`

**Execution:**
- Local: `pnpm e2e`
- CI: Runs on 3 browsers (Chromium, Firefox, WebKit), < 5min target

**Key Tests:**
- `smoke.spec.ts` - Basic app loads and navigation works
- `navigation.spec.ts` - All bottom tabs navigate correctly
- `favorites.spec.ts` - Favorite/unfavorite works and persists
- `settings.spec.ts` - Settings toggles work and persist
- `flicker.spec.ts` - Daily page doesn't flicker on first load
- `responsive.spec.ts` - Mobile/tablet/desktop layouts
- `accessibility.spec.ts` - Axe checks on all pages

---

### 4. Smoke Tests
**What to Test:**
- App builds successfully
- Main pages load without errors
- Critical paths work (Daily page, Navigation)

**Tools:** Vitest (integration) + Playwright

**Location:** `__tests__/smoke*.test.tsx`, `tests/e2e/smoke.spec.ts`

**Execution:**
- Local: `pnpm test:run --smoke` or `pnpm e2e --grep smoke`
- CI: Runs first in pipeline, < 1min target

**Key Tests:**
- App builds without TypeScript/lint errors
- Daily page renders
- Navigation renders and links work
- No console errors on load

---

### 5. Sanity Tests
**What to Test:**
- Core functionality works after changes
- No regressions in critical flows
- Data persistence intact

**Tools:** Vitest (integration) + Playwright

**Location:** `__tests__/sanity-comprehensive.test.tsx`, `tests/e2e/`

**Execution:**
- Local: `pnpm test:run --sanity`
- CI: Runs after smoke, < 2min target

**Key Tests:**
- Daily bias displays correctly
- Favorites work
- Settings persist
- Navigation works
- Analytics computes correctly

---

### 6. Regression Tests
**What to Test:**
- Previously fixed bugs don't reappear
- Critical flows remain stable
- Performance doesn't degrade

**Tools:** Vitest (integration) + Playwright

**Location:** `__tests__/regression/`, `tests/e2e/`

**Execution:**
- Local: `pnpm test:run --regression`
- CI: Runs in full test suite, < 3min target

**Key Tests:**
- No flicker on Daily page (critical fix)
- Navigation state persists
- Settings don't reset unexpectedly
- Analytics calculations remain accurate

---

### 7. UI Tests
**What to Test:**
- Component interactions (clicks, inputs, toggles)
- Form validation
- Error states
- Loading states
- Empty states

**Tools:** Vitest + React Testing Library + @testing-library/user-event

**Location:** `__tests__/ui/`, `__tests__/components/`

**Execution:**
- Local: `pnpm test:ui` (custom script) or `pnpm test`
- CI: Runs with unit tests, < 1min target

**Key Tests:**
- Button clicks trigger actions
- Form inputs validate correctly
- Toggles change state
- Modals open/close
- Dropdowns work

---

### 8. Visual Regression Tests
**What to Test:**
- UI appearance doesn't change unexpectedly
- Layout consistency across pages
- Component visual states

**Tools:** Playwright screenshots + Percy/Chromatic (optional)

**Location:** `tests/e2e/visual-regression.spec.ts`

**Execution:**
- Local: `pnpm e2e:visual` (custom script)
- CI: Runs on Chromium only, compares screenshots, < 2min target

**Key Tests:**
- Daily page screenshot matches baseline
- All pages screenshots match baselines
- Settings page in light/dark mode
- Mobile/desktop viewport screenshots

**Baseline Location:** `tests/e2e/screenshots/baseline/`

---

### 9. Accessibility Tests
**What to Test:**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility
- ARIA labels and roles
- Color contrast
- Focus management

**Tools:** Axe-core (@axe-core/playwright, @axe-core/react)

**Location:** `tests/e2e/accessibility.spec.ts`, `__tests__/a11y/` (unit-level)

**Execution:**
- Local: `pnpm e2e --grep accessibility` or `pnpm test:a11y`
- CI: Runs on all pages, non-blocking warnings, < 2min target

**Key Tests:**
- All pages pass Axe checks (no critical violations)
- Navigation is keyboard accessible
- Forms have proper labels
- Focus indicators visible
- ARIA live regions work

---

### 10. Responsiveness Tests
**What to Test:**
- Layout works on mobile (320px+), tablet (768px+), desktop (1024px+)
- Touch targets are adequate (44x44px minimum)
- Text is readable at all sizes
- Navigation works on all viewports

**Tools:** Playwright with viewport emulation

**Location:** `tests/e2e/responsive.spec.ts`

**Execution:**
- Local: `pnpm e2e --grep responsive`
- CI: Runs on multiple viewports, < 3min target

**Key Tests:**
- iPhone SE (375x667), iPad (768x1024), Desktop (1920x1080)
- Navigation bottom bar visible on mobile
- Cards stack correctly on mobile
- Settings page usable on all sizes

---

### 11. Cross-Browser Tests
**What to Test:**
- App works in Chromium, Firefox, WebKit
- Feature parity across browsers
- No browser-specific bugs

**Tools:** Playwright (multi-browser)

**Location:** `playwright.config.ts` (projects), `tests/e2e/`

**Execution:**
- Local: `pnpm e2e` (runs all browsers)
- CI: Runs on Chromium, Firefox, WebKit, < 5min target

**Key Tests:**
- All E2E tests pass on all browsers
- IndexedDB works (Chromium/WebKit)
- CSS animations work
- Touch events work (WebKit mobile)

---

### 12. API Tests
**What to Test:**
- No external APIs currently (static app)
- Future: Analytics API, feedback API (if added)
- Mock API responses with MSW

**Tools:** MSW (Mock Service Worker) + Vitest

**Location:** `__tests__/api/` (when APIs are added)

**Execution:**
- Local: `pnpm test:api` (when implemented)
- CI: Runs with integration tests

**Key Tests:**
- API endpoints return expected data
- Error handling for API failures
- Request/response validation

---

### 13. Load/Stress Tests
**What to Test:**
- App handles concurrent users (mostly static, but IndexedDB operations)
- Page load performance under load
- IndexedDB write performance with many biases

**Tools:** k6

**Location:** `tests/load/`

**Execution:**
- Local: `pnpm test:load` (manual)
- CI: Runs on schedule (weekly), non-blocking, < 5min target

**Key Tests:**
- 50 concurrent users load Daily page
- IndexedDB write performance (100 biases)
- Memory usage stays reasonable

---

### 14. Security Tests
**What to Test:**
- Dependency vulnerabilities (npm audit)
- HTTP security headers
- XSS prevention (input sanitization)
- CSRF protection (if APIs added)
- Content Security Policy

**Tools:** npm audit, OWASP ZAP (baseline scan), manual header checks

**Location:** `scripts/security-check.sh`, `.github/workflows/security.yml`

**Execution:**
- Local: `pnpm audit:security`
- CI: Runs on every PR, blocks on high/critical, < 2min target

**Key Tests:**
- No high/critical vulnerabilities
- Security headers present (CSP, X-Frame-Options, etc.)
- Input validation prevents XSS
- ZAP baseline scan passes

---

### 15. Contract Tests
**What to Test:**
- Data structure contracts (Bias type, Settings type)
- IndexedDB schema compatibility
- LocalStorage key contracts

**Tools:** Vitest + Zod (validation)

**Location:** `__tests__/contracts/`

**Execution:**
- Local: `pnpm test:contracts`
- CI: Runs with unit tests, < 30s target

**Key Tests:**
- Bias JSON schema validation
- Settings migration (version compatibility)
- IndexedDB upgrade paths
- Type definitions match runtime

---

### 16. Mobile Tests
**What to Test:**
- Capacitor Android/iOS builds
- Native features (notifications, haptics, share)
- PWA installation
- Touch gestures
- Device orientation

**Tools:** Manual testing + Playwright mobile emulation

**Location:** `docs/mobile-testing-checklist.md`, `tests/e2e/mobile.spec.ts`

**Execution:**
- Local: Manual on devices, `pnpm e2e --project mobile`
- CI: Emulation only (limited), manual checklist required

**Key Tests:**
- App installs on Android/iOS
- Notifications work
- Share functionality works
- Haptics work
- Orientation changes handled

---

### 17. Device Tests
**What to Test:**
- Real device testing (Android/iOS)
- Performance on low-end devices
- Battery usage
- Network conditions (offline mode)

**Tools:** Manual testing, Firebase Test Lab (optional)

**Location:** `docs/mobile-testing-checklist.md`

**Execution:**
- Local: Manual on physical devices
- CI: Not automated (requires physical devices)

**Key Tests:**
- Android 8+ devices
- iOS 13+ devices
- Offline functionality
- Performance on low-end devices

---

### 18. Usability Tests
**What to Test:**
- User flows are intuitive
- Error messages are clear
- Onboarding is helpful
- Navigation is discoverable

**Tools:** Manual testing, user feedback

**Location:** Manual testing sessions

**Execution:**
- Local: Manual user testing
- CI: Not automated

**Key Tests:**
- New users can complete onboarding
- Daily bias is clear and actionable
- Settings are easy to find
- Favorites are easy to access

---

### 19. Beta Tests
**What to Test:**
- Pre-release validation
- Real-world usage patterns
- Performance in production-like environment
- User feedback collection

**Tools:** Beta testing program, analytics

**Location:** Staging environment

**Execution:**
- Local: Beta tester feedback
- CI: Staging deployment tests

**Key Tests:**
- Beta users can use all features
- No critical bugs reported
- Performance acceptable
- Analytics show healthy usage

---

### 20. Localization Tests
**What to Test:**
- Text doesn't overflow in other languages
- Date/time formatting for other locales
- RTL support (if added)
- Currency/number formatting

**Tools:** Manual testing, i18n testing tools

**Location:** `__tests__/i18n/` (when i18n added)

**Execution:**
- Local: Manual with locale switching
- CI: Runs when i18n is implemented

**Key Tests:**
- UI text fits in all supported languages
- Dates format correctly per locale
- Navigation works in RTL
- No hardcoded English strings

---

## Test Execution Commands

### Local Development
```bash
# Unit tests only
pnpm test:unit

# Integration tests only
pnpm test:integration

# All unit + integration
pnpm test

# E2E tests (Playwright)
pnpm e2e

# E2E with UI mode
pnpm e2e:ui

# All tests (unit + integration + e2e)
pnpm test:all

# Accessibility tests
pnpm test:a11y

# Visual regression
pnpm e2e:visual

# Security audit
pnpm audit:security

# Lighthouse performance
pnpm test:lighthouse

# Load testing (k6)
pnpm test:load
```

### CI/CD
- **On PR**: Unit, Integration, E2E (Chromium), A11y, Security audit
- **On Merge**: Full E2E (3 browsers), Visual regression, Lighthouse (non-blocking)
- **Weekly**: Load tests, full security scan

---

## Test Data Management

### Deterministic Dates
- All date-dependent tests use mocked dates in `vitest.setup.ts`
- Fixed date: `2025-12-05T08:00:00+05:30` (Asia/Kolkata)
- Timezone utilities are mocked to return consistent values

### Test Biases
- Core biases loaded from `data/biases.json`
- Test-specific biases can be injected via `globalThis.__TEST_BIASES__`
- User biases stored in IndexedDB (cleared between tests)

### IndexedDB
- Uses `fake-indexeddb` for unit/integration tests
- Real IndexedDB in E2E tests (Playwright)
- Cleared between test runs

---

## CI/CD Workflows

### `.github/workflows/test.yml`
- Unit + Integration tests
- Runs on every PR
- Fast feedback (< 2min)

### `.github/workflows/e2e.yml`
- E2E tests on 3 browsers
- Visual regression
- Runs on PR and merge
- < 5min target

### `.github/workflows/security.yml`
- Dependency audit
- Security headers check
- ZAP baseline scan
- Runs on PR (blocking on high/critical)

### `.github/workflows/performance.yml`
- Lighthouse CI
- Runs on merge (non-blocking)
- Reports performance metrics

---

## Mobile Testing Checklist

See `docs/mobile-testing-checklist.md` for detailed Android/iOS manual testing procedures.

---

## Test Coverage Goals

- **Unit Tests**: > 80% coverage
- **Integration Tests**: All critical flows covered
- **E2E Tests**: All user journeys covered
- **Accessibility**: 0 critical violations
- **Performance**: Lighthouse score > 90

---

## Troubleshooting

### Tests are flaky
- Check date/time mocking
- Ensure IndexedDB is cleared between tests
- Use `test.retry()` for network-dependent tests

### E2E tests fail in CI
- Check webServer timeout (increased to 3min)
- Verify baseURL is correct
- Check browser installation in CI

### Visual regression failures
- Update baselines: `pnpm e2e:visual --update`
- Check for dynamic content (dates, random IDs)
- Ensure consistent viewport sizes

---

## Future Enhancements

- [ ] Add MSW for API mocking (when APIs are added)
- [ ] Integrate Percy/Chromatic for visual regression
- [ ] Add Firebase Test Lab for Android device testing
- [ ] Implement i18n testing when localization is added
- [ ] Add performance budgets in Lighthouse CI
- [ ] Set up test result reporting (TestRail, etc.)

