# DebiasDaily

A calm daily web app to learn one cognitive bias per day — streaks, quizzes, reflections, and weekly review. All progress is stored locally in the browser.

## Production configuration

Live site: **https://debiasdaily.com**

| Variable | Production value | Notes |
| --- | --- | --- |
| `VITE_SITE_URL` | `https://debiasdaily.com` | Canonical, `og:url`, and social image URLs (baked in at build) |
| `VITE_GA_MEASUREMENT_ID` | `G-QMF2Q394SC` | GA4 for debiasdaily.com — set in `.env` or CI/host env |

Production build:

```sh
VITE_SITE_URL=https://debiasdaily.com VITE_GA_MEASUREMENT_ID=G-QMF2Q394SC npm run build
```

If `VITE_SITE_URL` is omitted, the build defaults to `https://debiasdaily.com`.

## Launch checklist

1. Copy `.env.example` to `.env` and set:
   - `VITE_SITE_URL=https://debiasdaily.com`
   - `VITE_GA_MEASUREMENT_ID=G-QMF2Q394SC` (leave empty to disable analytics locally)
2. Build: `npm run build` (or `bun run build`)
3. Preview locally: `npm run preview`
4. Run tests: `npm test` and `npm run test:e2e`
5. Deploy the `dist/` folder to your static host (Vercel, Netlify, Cloudflare Pages, etc.)
6. Verify favicon, `/og-image.png`, and share previews after deploy
7. Verify GA4 events in **Admin → DebugView** (see [Analytics](#analytics-ga4) below)

## Analytics (GA4)

DebiasDaily uses **Google Analytics 4 only** (no other analytics providers). Events are anonymous — no email, names, or reflection text.

### Setup

1. Create a GA4 property at [Google Analytics](https://analytics.google.com/).
2. Copy the **Measurement ID** (`G-XXXXXXXXXX`).
3. Set `VITE_GA_MEASUREMENT_ID=G-QMF2Q394SC` in `.env` (or your host’s environment variables).
4. Rebuild and deploy — the ID is baked in at build time.

### Events tracked

| Event | When |
| --- | --- |
| `page_view` | Route change (Today, Bias Detail, Quiz, Weekly Review, Saved, Settings, About) |
| `bias_viewed` | Today or bias detail page loads |
| `quiz_completed` | User finishes the daily quiz |
| `bias_bookmarked` / `bias_unbookmarked` | Bookmark toggle |
| `reflection_saved` | First save of reflection text for a bias (content not sent) |
| `cycle_completed` | User views all 60 biases in a cycle |
| `weekly_review_opened` | Weekly Review page opened |

### Verify in GA4 DebugView

1. Install the [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) Chrome extension (or use GA4’s built-in debug mode).
2. Open your deployed site (or local preview with `VITE_GA_MEASUREMENT_ID` set).
3. In GA4: **Admin → Data display → DebugView**.
4. Navigate the app — you should see `page_view` and product events in real time.
5. Confirm custom parameters (`bias_id`, `score`, etc.) appear on each event.

### Limitations

- Analytics are disabled when `VITE_GA_MEASUREMENT_ID` is empty.
- SPA page views require client-side tracking (implemented via `AnalyticsRouteTracker`).
- Ad blockers may prevent events in some browsers.
- Changing the Measurement ID requires a new build.

## Development

```sh
npm install
npm run dev
```

## Playwright visual regression baselines

The end-to-end suite includes screenshot-diff tests (`e2e/visual.spec.ts`) that
run on six browser projects: `desktop-chromium`, `mobile-chromium`,
`desktop-firefox`, `mobile-firefox`, `desktop-webkit`, `mobile-webkit`.

### Where baselines live

Committed PNGs sit next to the spec they belong to:

```
e2e/
└── visual.spec.ts-snapshots/
    ├── today-desktop-chromium.png
    ├── today-mobile-chromium.png
    ├── today-desktop-firefox.png
    ├── today-mobile-firefox.png
    ├── today-desktop-webkit.png
    ├── today-mobile-webkit.png
    ├── bias-card-desktop-chromium.png
    └── … (one per project × per test)
```

If a baseline file is missing the test is **skipped** with a clear annotation
instead of failing — first-time setup never red-builds the pipeline.

### Refreshing baselines (the right way)

Snapshot PNGs are pixel-sensitive to OS, fonts, and antialiasing. Only commit
PNGs generated on CI's Ubuntu runner — locally generated ones (macOS / Windows)
will fail in CI.

1. Open **GitHub → Actions → Update Playwright snapshots → Run workflow**.
2. Leave both inputs blank to update every project, or pick a single
   `project` / `spec` to scope the refresh.
3. The workflow runs `playwright test --update-snapshots` on `ubuntu-latest`
   and opens a PR titled
   _"chore(e2e): refresh Playwright visual baselines"_ containing only the
   PNG changes under `e2e/**/*-snapshots/**`.
4. Review the PNGs in that PR — confirm the layout/glassmorphism actually
   matches the intended design — then merge.

### Refreshing baselines locally (optional)

For quick local iteration only:

```sh
bun run test:e2e:update                       # all projects, visual spec
bun run test:e2e:update -- --project=desktop-webkit
bun run test:e2e:update -- e2e/visual.spec.ts --project=mobile-firefox
```

The script forces `CI=1` for parity and prints which snapshot files were
added or updated. **Don't commit those PNGs** unless you generated them on
Ubuntu — use the GitHub workflow above for anything that lands on `main`.

### When CI fails on a visual diff

Each failing browser job uploads three artifacts and posts a sticky PR
comment summarizing them:

| Artifact | Contents |
| --- | --- |
| `visual-diffs-<project>` | The `-expected.png` / `-actual.png` / `-diff.png` trio for every failing screenshot |
| `playwright-report-<project>` | Full HTML report |
| `playwright-traces-<project>` | Traces, videos, screenshots — open with `bunx playwright show-trace …` or <https://trace.playwright.dev> |
| `stabilization-logs-<project>` | JSONL log of `document.fonts.ready` and layout-settle durations per test — always uploaded, even on green runs |

Every CI job (pass or fail) writes a **Stabilization timings** table to the
Actions Step Summary for its browser project, with a direct link to the
matching `stabilization-logs-<project>` artifact so you can correlate
flakiness with font/layout wait times.

### CI env toggles

All visual-regression knobs are environment variables so you can flip them
per-run without editing code. Set them as repo/workflow **Variables**
(Settings → Secrets and variables → Actions → Variables) or inline when
running locally.

| Variable | Default | Effect |
| --- | --- | --- |
| `PLAYWRIGHT_MAX_DIFF_PIXEL_RATIO` | `0.02` | Max fraction of pixels allowed to differ before the build fails. |
| `PLAYWRIGHT_DIFF_THRESHOLD` | `0.2` | Per-pixel color sensitivity (0 = strict, 1 = lax). |
| `PLAYWRIGHT_DISABLE_FREEZE_CSS` | `0` | `1` skips the injected animation/transition freeze stylesheet. Useful to confirm whether the freeze is masking or causing diffs. |
| `PLAYWRIGHT_SKIP_LAYOUT_POLL` | `0` | `1` skips `scrollHeight`/`scrollWidth` stability polling; only awaits `document.fonts.ready`. Faster, slightly less strict. |
| `PLAYWRIGHT_FAIL_ON_DIMENSION_MISMATCH` | `0` | `1` makes the job **fail** when a cached baseline's width doesn't match the project's expected viewport×DPR instead of auto-regenerating. Use on protected branches to enforce baseline freshness. |


The active values are echoed in each job's Step Summary so you can tell at
a glance which configuration produced a given run.

Example combinations (local shell):

```sh
# Default — full stabilization
bun run test:e2e

# Diagnose animation flake: keep layout polling, drop freeze CSS
PLAYWRIGHT_DISABLE_FREEZE_CSS=1 bun run test:e2e

# Diagnose layout flake: keep freeze CSS, drop polling
PLAYWRIGHT_SKIP_LAYOUT_POLL=1 bun run test:e2e

# Fastest mode (both stabilization steps off) — only document.fonts.ready
PLAYWRIGHT_DISABLE_FREEZE_CSS=1 PLAYWRIGHT_SKIP_LAYOUT_POLL=1 bun run test:e2e

# Loosen diff thresholds while triaging
PLAYWRIGHT_MAX_DIFF_PIXEL_RATIO=0.05 PLAYWRIGHT_DIFF_THRESHOLD=0.3 bun run test:e2e
```

### Baseline caching

Each browser job caches `e2e/visual.spec.ts-snapshots/` with a key that
combines:

- **browser project name** (`desktop-chromium`, `mobile-webkit`, …) — each
  engine caches independently
- **viewport × device-pixel-ratio** (e.g. `1280x800@1`, `390x844@2`) — so
  desktop and mobile entries reuse only baselines matching their dimensions
- **`PLAYWRIGHT_DISABLE_FREEZE_CSS` + `PLAYWRIGHT_SKIP_LAYOUT_POLL`** —
  flipping a toggle changes rendered pixels, so the cache invalidates
- **hash of `playwright.config.ts` + `e2e/visual.spec.ts`** — any
  threshold/project/stabilization change invalidates the cache
- **hash of the snapshot tree** — committed PNG updates invalidate the cache

The computed key, every component hash, the matched restore-key, and the
`cache-hit` boolean are printed to the job log and to the Step Summary
table titled **🗝️ Baseline cache key**, so you can diagnose unexpected
misses without reverse-engineering the workflow YAML.

**Stale baseline auto-fallback.** After restore, every cached PNG is
checked against the project's expected width in device pixels (viewport
width × DPR). The full expected-vs-actual table is written to
`dimension-report/<project>.json` and surfaced in the Step Summary
(per-file, grouped by browser project). By default any PNG with the wrong
width is copied to `regenerated-baselines-<project>/before/`, deleted,
then `playwright test --update-snapshots` runs for that project — the
freshly generated PNGs are also uploaded under
`regenerated-baselines-<project>/after/` so you can diff exactly what
changed. Set `PLAYWRIGHT_FAIL_ON_DIMENSION_MISMATCH=1` to fail the job
instead of auto-regenerating.

Each browser job also emits a **📦 Cache summary** table to the Step
Summary with hit/miss, the matched restore-key, stale/total counts, the
regenerated-image count, and a link to the dimension report.

### Debug the cache key locally

`scripts/baseline-cache-key.mjs` computes the same key the workflow uses
without needing to push to CI. Hashing mirrors GitHub Actions'
`hashFiles()` (sha256 of concatenated per-file sha256 digests, sorted).

```sh
node scripts/baseline-cache-key.mjs                      # all projects
node scripts/baseline-cache-key.mjs desktop-webkit       # one project
PLAYWRIGHT_DISABLE_FREEZE_CSS=1 node scripts/baseline-cache-key.mjs
```

The script prints the viewport/DPR, toggles, config hash, snapshot-tree
hash, full key, and the ordered restore-key prefixes — the exact same
fields the workflow's **🗝️ Baseline cache key** summary table shows.

