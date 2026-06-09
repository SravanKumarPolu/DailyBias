import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 4173);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * Configurable visual-regression diff thresholds.
 *
 * Defaults are intentionally tight so real regressions still fail the build,
 * but both knobs can be relaxed per-run via env (e.g. in CI matrix or locally):
 *
 *   PLAYWRIGHT_MAX_DIFF_PIXEL_RATIO=0.05   # 5% of pixels may differ
 *   PLAYWRIGHT_MAX_DIFF_PIXELS=500         # absolute pixel cap
 *   PLAYWRIGHT_DIFF_THRESHOLD=0.2          # per-pixel color sensitivity (0..1)
 */
const maxDiffPixelRatio = Number(process.env.PLAYWRIGHT_MAX_DIFF_PIXEL_RATIO ?? 0.02);
const maxDiffPixelsEnv = process.env.PLAYWRIGHT_MAX_DIFF_PIXELS;
const perPixelThreshold = Number(process.env.PLAYWRIGHT_DIFF_THRESHOLD ?? 0.2);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio,
      ...(maxDiffPixelsEnv ? { maxDiffPixels: Number(maxDiffPixelsEnv) } : {}),
      threshold: perPixelThreshold,
      animations: "disabled",
      caret: "hide",
      scale: "css",
    },
  },
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Pinned defaults to reduce cross-browser screenshot flake. Individual
    // projects can override viewport/deviceScaleFactor below.
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    colorScheme: "light",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 7"],
        // Override Pixel 7's dpr=2.625 → 2 for stable diffs.
        deviceScaleFactor: 2,
      },
    },
    {
      name: "desktop-firefox",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: "mobile-firefox",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 412, height: 915 },
        deviceScaleFactor: 2,
        hasTouch: true,
        isMobile: false,
        userAgent:
          "Mozilla/5.0 (Android 13; Mobile; rv:124.0) Gecko/124.0 Firefox/124.0",
      },
    },
    {
      name: "desktop-webkit",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: "mobile-webkit",
      use: {
        ...devices["iPhone 14"],
        deviceScaleFactor: 2,
      },
    },
  ],
  webServer: {
    command: `bun run build && bunx vite preview --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
