import { test, expect } from "@playwright/test";
import { existsSync, mkdirSync, appendFileSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * Guard: on the very first run (or when a new project is added), no baseline
 * PNG exists yet. Without this, the build would fail with "missing snapshot"
 * which is noisy and confusing — visual-regression is only meaningful once a
 * baseline is committed. We skip the assertion in that case and emit a clear
 * annotation telling the maintainer to run the `Update Playwright snapshots`
 * workflow. Once baselines exist, every diff will fail the build as normal.
 */
function snapshotPath(testInfo: import("@playwright/test").TestInfo, name: string) {
  return join(dirname(testInfo.file), `${testInfo.titlePath[0] ?? "visual"}-snapshots`, name);
}

function baselineMissing(testInfo: import("@playwright/test").TestInfo, name: string) {
  const candidate = join(`${testInfo.file}-snapshots`, name);
  return !existsSync(candidate) && !existsSync(snapshotPath(testInfo, name));
}

/**
 * Env toggles (read at runtime so CI can flip them without code edits):
 *
 *   PLAYWRIGHT_DISABLE_FREEZE_CSS=1    → skip the motion-freeze stylesheet
 *                                        (helps diagnose whether the freeze
 *                                        itself is masking/causing flakiness).
 *   PLAYWRIGHT_SKIP_LAYOUT_POLL=1      → skip the scrollHeight/scrollWidth
 *                                        stability polling. Only awaits
 *                                        document.fonts.ready. Faster but
 *                                        slightly less strict.
 */
const FREEZE_CSS_DISABLED = process.env.PLAYWRIGHT_DISABLE_FREEZE_CSS === "1";
const LAYOUT_POLL_DISABLED = process.env.PLAYWRIGHT_SKIP_LAYOUT_POLL === "1";

const FREEZE_MOTION_CSS = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    animation-iteration-count: 1 !important;
    animation-play-state: paused !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
    caret-color: transparent !important;
  }
  html { scroll-behavior: auto !important; }
`;

const STABILIZE_FONTS_CSS = `
  html, body, * {
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
                 "Helvetica Neue", Arial, sans-serif !important;
    font-synthesis: none !important;
    font-feature-settings: "kern" 0, "liga" 0, "calt" 0 !important;
    font-variant-ligatures: none !important;
    font-kerning: none !important;
    text-rendering: geometricPrecision !important;
    -webkit-font-smoothing: antialiased !important;
    -moz-osx-font-smoothing: grayscale !important;
  }
`;

/**
 * Append a per-test stabilization timing record to a JSON-lines log so the CI
 * job can surface font/layout wait durations per browser project in the
 * GitHub step summary. One line per test:
 *   {"project":"...","test":"...","fontsMs":12,"layoutMs":80,"totalMs":92,...}
 */
function recordTiming(
  testInfo: import("@playwright/test").TestInfo,
  metrics: { fontsMs: number; layoutMs: number; totalMs: number; layoutPolled: boolean; freezeApplied: boolean },
) {
  try {
    const dir = "test-results/stabilization";
    mkdirSync(dir, { recursive: true });
    const file = join(dir, `${testInfo.project.name}.jsonl`);
    appendFileSync(
      file,
      JSON.stringify({
        project: testInfo.project.name,
        test: testInfo.title,
        ...metrics,
        at: new Date().toISOString(),
      }) + "\n",
    );
  } catch {
    /* best-effort; never fail tests because of logging */
  }
}

test.describe("Visual regression — TodayPage @visual", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      const origMM = window.matchMedia.bind(window);
      window.matchMedia = (q: string) => {
        if (q.includes("prefers-reduced-motion")) {
          return { ...origMM(q), matches: true, media: q } as MediaQueryList;
        }
        return origMM(q);
      };
    });
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });

    const PRE_PAINT_CSS =
      (FREEZE_CSS_DISABLED ? "" : FREEZE_MOTION_CSS) + STABILIZE_FONTS_CSS;
    await context.addInitScript((css) => {
      const inject = () => {
        const style = document.createElement("style");
        style.setAttribute("data-test-stabilize", "true");
        style.textContent = css;
        (document.head || document.documentElement).appendChild(style);
      };
      if (document.head) inject();
      else document.addEventListener("DOMContentLoaded", inject, { once: true });
    }, PRE_PAINT_CSS);
  });

  async function settle(
    page: import("@playwright/test").Page,
    testInfo: import("@playwright/test").TestInfo,
  ) {
    const tStart = Date.now();
    await page.addStyleTag({
      content: (FREEZE_CSS_DISABLED ? "" : FREEZE_MOTION_CSS) + STABILIZE_FONTS_CSS,
    });
    await page.waitForLoadState("networkidle");

    const { fontsMs, layoutMs } = await page.evaluate(async (skipLayoutPoll) => {
      const t0 = performance.now();
      const fonts = document.fonts;
      if (fonts?.ready) await fonts.ready;
      const t1 = performance.now();

      let layoutEnd = t1;
      if (!skipLayoutPoll) {
        const measure = () => ({
          h: document.documentElement.scrollHeight,
          w: document.documentElement.scrollWidth,
          bh: document.body.scrollHeight,
          bw: document.body.scrollWidth,
        });
        const raf = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
        let prev = measure();
        let stableFrames = 0;
        const maxFrames = 30;
        for (let i = 0; i < maxFrames; i++) {
          await raf();
          const cur = measure();
          if (
            cur.h === prev.h && cur.w === prev.w &&
            cur.bh === prev.bh && cur.bw === prev.bw
          ) {
            if (++stableFrames >= 2) break;
          } else {
            stableFrames = 0;
            prev = cur;
          }
        }
        layoutEnd = performance.now();
      }
      return { fontsMs: Math.round(t1 - t0), layoutMs: Math.round(layoutEnd - t1) };
    }, LAYOUT_POLL_DISABLED);

    recordTiming(testInfo, {
      fontsMs,
      layoutMs,
      totalMs: Date.now() - tStart,
      layoutPolled: !LAYOUT_POLL_DISABLED,
      freezeApplied: !FREEZE_CSS_DISABLED,
    });
  }

  test("TodayPage full layout snapshot", async ({ page }, testInfo) => {
    await page.goto("/");
    await settle(page, testInfo);

    const name = `today-${testInfo.project.name}.png`;
    if (baselineMissing(testInfo, name)) {
      testInfo.annotations.push({
        type: "skip-reason",
        description: `No baseline at e2e/visual.spec.ts-snapshots/${name}. Run the "Update Playwright snapshots" workflow to seed it.`,
      });
      test.skip(true, `Missing baseline ${name} — run the update workflow to initialize.`);
    }

    await expect(page).toHaveScreenshot(name, {
      fullPage: true,
      mask: [page.locator('[aria-label$="day streak"]')],
    });
  });

  test("glassmorphism bias card snapshot", async ({ page }, testInfo) => {
    await page.goto("/");
    await settle(page, testInfo);

    const name = `bias-card-${testInfo.project.name}.png`;
    if (baselineMissing(testInfo, name)) {
      testInfo.annotations.push({
        type: "skip-reason",
        description: `No baseline at e2e/visual.spec.ts-snapshots/${name}. Run the "Update Playwright snapshots" workflow to seed it.`,
      });
      test.skip(true, `Missing baseline ${name} — run the update workflow to initialize.`);
    }

    const card = page.locator("article, [class*='glass']").first();
    await expect(card).toBeVisible();
    await expect(card).toHaveScreenshot(name);
  });
});
