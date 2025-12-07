import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI 
    ? [['html'], ['github']] 
    : [['html'], ['list']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    /* Video on failure */
    video: 'retain-on-failure',
  },
  
  /* Screenshot configuration for visual regression */
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },
  
  /* Global test timeout - increased for E2E tests that may take longer */
  timeout: 60000,

  /* Configure projects for major browsers and mobile emulation */
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile emulation
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        // Mobile tests may need longer timeouts
        actionTimeout: 30000,
        navigationTimeout: 60000,
        // Enable touch events for mobile
        hasTouch: true,
        // Mobile viewport settings
        viewport: { width: 393, height: 851 },
        // User agent for mobile
        userAgent: devices['Pixel 5'].userAgent,
      },
      timeout: 90000, // Longer timeout for mobile tests
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 13'],
        // Mobile tests may need longer timeouts
        actionTimeout: 30000,
        navigationTimeout: 60000,
        // Enable touch events for mobile
        hasTouch: true,
        // Mobile viewport settings
        viewport: { width: 390, height: 844 },
        // User agent for mobile
        userAgent: devices['iPhone 13'].userAgent,
      },
      timeout: 90000, // Longer timeout for mobile tests
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.SKIP_WEBSERVER
    ? undefined
    : {
        command: 'pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 180 * 1000, // Increased to 3 minutes for first-time compilation
        stdout: process.env.CI ? 'ignore' : 'pipe', // Show output in local dev
        stderr: process.env.CI ? 'ignore' : 'pipe',
        // Wait for the server to be ready - check for successful response
        // Next.js dev server can take time on first run to compile
        // If it hangs, try: SKIP_WEBSERVER=1 pnpm e2e (after starting server manually)
      },
});

