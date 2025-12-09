import { defineConfig } from '@playwright/test';

/**
 * Playwright config for Android build validation tests
 * These tests don't require a browser - they validate build configuration files
 */
export default defineConfig({
  testDir: './tests/android',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [['html'], ['github']]
    : [['html'], ['list']],
  /* No browser needed for build validation tests */
  use: {},
  /* Global test timeout */
  timeout: 30000,
  /* No web server needed */
  webServer: undefined,
});

