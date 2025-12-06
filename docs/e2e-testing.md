# E2E Testing Guide

This guide covers how to run and write E2E tests for DebiasDaily using Playwright.

## Overview

Our E2E test suite uses [Playwright](https://playwright.dev/) to test the complete user journey through the web application. Tests are located in `tests/e2e/` and follow the naming convention `*.spec.ts`.

## Quick Start

### Running Tests

```bash
# Run all E2E tests (headless, starts dev server automatically)
pnpm e2e

# Run tests in UI mode (interactive)
pnpm e2e:ui

# Run tests in headed mode (see browser)
pnpm e2e:headed

# Run tests in debug mode (step through)
pnpm e2e:debug
```

### Prerequisites

- Node.js and pnpm installed
- Dev server will start automatically via Playwright's `webServer` config
- **Note:** If you already have `pnpm dev` running, you can skip the webServer by setting `SKIP_WEBSERVER=1 pnpm e2e`

## Test Structure

### Test Files

- `smoke.spec.ts` - Basic app loading and visibility tests
- `navigation.spec.ts` - Bottom navigation and page routing tests
- `favorites.spec.ts` - Favorite/unfavorite flow and persistence
- `flicker.spec.ts` - Regression tests for UI flickering
- `settings.spec.ts` - Settings persistence across navigation/reload
- `responsive.spec.ts` - Mobile/tablet viewport tests
- `accessibility.spec.ts` - Accessibility scans using Axe

### Helpers

The `helpers.ts` file provides utilities for:
- `freezeDate()` - Freezes browser time to prevent daily bias changes during tests
- `waitForBiasCard()` - Waits for bias card to be visible and loaded
- `waitForNavigation()` - Waits for bottom navigation to be visible

## Date/Time Stabilization

To prevent flaky tests caused by the daily bias changing during test execution, we freeze the browser's Date object using `page.addInitScript()`. This ensures:

- Tests run deterministically
- Daily bias selection remains consistent
- No race conditions from date changes

**Usage:**
```typescript
import { freezeDate } from './helpers';

test.beforeEach(async ({ page }) => {
  await freezeDate(page, '2025-12-05'); // Freeze to specific date
  await page.goto('/');
});
```

The date is frozen before page navigation, ensuring the app always sees the same "today" value throughout the test.

## Writing New Tests

### Test Selectors

We use a minimal set of `data-testid` attributes for stable selectors:

**Navigation:**
- `data-testid="bottom-navigation"` - Navigation container
- `data-testid="nav-daily"` - Daily tab
- `data-testid="nav-all"` - All tab
- `data-testid="nav-favorites"` - Favorites tab
- `data-testid="nav-add"` - Add tab
- `data-testid="nav-analytics"` - Analytics tab
- `data-testid="nav-settings"` - Settings tab

**Bias Card:**
- `data-testid="bias-card"` - Bias card container
- `data-testid="bias-favorite-button"` - Favorite toggle button

**Settings:**
- `data-testid="setting-voice-enabled"` - Voice toggle
- `data-testid="setting-daily-reminder"` - Daily reminder toggle
- `data-testid="setting-mix-user-biases"` - Mix user biases toggle
- `data-testid="setting-bg-gradient"` - Background style options
- `data-testid="setting-bg-glass"` - Background style options
- `data-testid="setting-bg-minimal"` - Background style options

**Best Practices:**
- Use `data-testid` only where needed for E2E tests
- Prefer semantic selectors (role, aria-label) when possible
- Use `test.step()` for readable test reports
- Use `expect().toBeVisible()` instead of `waitForTimeout()`

### Example Test

```typescript
import { test, expect } from '@playwright/test';
import { freezeDate, waitForBiasCard } from './helpers';

test.describe('My Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    await freezeDate(page, '2025-12-05');
    await page.goto('/');
  });

  test('my feature works correctly', async ({ page }) => {
    await test.step('Wait for page to load', async () => {
      await waitForBiasCard(page);
    });

    await test.step('Interact with feature', async () => {
      const button = page.locator('[data-testid="my-button"]');
      await expect(button).toBeVisible();
      await button.click();
    });

    await test.step('Verify result', async () => {
      await expect(page.locator('text=Success')).toBeVisible();
    });
  });
});
```

## Configuration

Playwright configuration is in `playwright.config.ts`:

- **Base URL:** `http://localhost:3000`
- **Web Server:** Automatically starts `pnpm dev` before tests
- **Retries:** 2 retries in CI, 0 locally
- **Trace:** Enabled on first retry
- **Screenshots/Video:** Captured on failure
- **Browsers:** Chromium (Desktop Chrome)

## CI/CD Integration

In CI environments:
- Tests run with 2 retries
- Traces are captured on retries
- Screenshots and videos are saved on failure
- Tests run in parallel (1 worker per project)

## Troubleshooting

### Tests are flaky

1. **Date-related flakiness:** Ensure `freezeDate()` is called before `page.goto()`
2. **Timing issues:** Use `expect().toBeVisible()` instead of `waitForTimeout()`
3. **Network issues:** Check if dev server started successfully

### Dev server not starting

- Ensure port 3000 is available
- Check `pnpm dev` works manually
- Increase `webServer.timeout` in config if needed

### Tests fail locally but pass in CI

- Clear browser storage: `await context.clearCookies()`
- Check for local state pollution
- Ensure date is frozen consistently

## Best Practices

1. **Always freeze date** in `beforeEach` for tests that depend on daily bias
2. **Use test.step()** for better test reports
3. **Clear storage** between tests if needed: `await context.clearCookies()`
4. **Wait for elements** using `expect().toBeVisible()` instead of fixed timeouts
5. **Keep tests focused** - one feature per test file
6. **Use semantic selectors** when possible, `data-testid` only when needed

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Axe Core Documentation](https://github.com/dequelabs/axe-core)

