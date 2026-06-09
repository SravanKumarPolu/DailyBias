#!/usr/bin/env node
/**
 * Compute the same Playwright baseline cache key the CI workflow uses,
 * locally, so you can debug "why did the cache miss?" without rerunning CI.
 *
 *   node scripts/baseline-cache-key.mjs                  # all projects
 *   node scripts/baseline-cache-key.mjs desktop-webkit   # one project
 *   PLAYWRIGHT_DISABLE_FREEZE_CSS=1 node scripts/baseline-cache-key.mjs
 *
 * Hashing mirrors GitHub Actions `hashFiles()`:
 *   sha256( concat( sha256(file) for file in sort(glob) ) )
 *
 * Globs and the key shape are kept in sync with .github/workflows/test.yml —
 * if you change the key formula there, update it here too.
 */
import { createHash } from "node:crypto";
import { readFileSync, statSync, readdirSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const PROJECT_DIMS = {
  "desktop-chromium": "1280x800@1",
  "desktop-firefox":  "1280x800@1",
  "desktop-webkit":   "1280x800@1",
  "mobile-chromium":  "412x915@2",
  "mobile-firefox":   "412x915@2",
  "mobile-webkit":    "390x844@2",
};

const CFG_FILES = ["playwright.config.ts", "e2e/visual.spec.ts"];
const SNAP_GLOB_ROOT = "e2e/visual.spec.ts-snapshots";

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function walk(root) {
  const out = [];
  if (!existsSync(root)) return out;
  const st = statSync(root);
  if (st.isFile()) return [root];
  for (const name of readdirSync(root)) {
    const full = join(root, name);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

/** GitHub Actions hashFiles() — sha256 of concatenated per-file sha256 digests, sorted by path. */
function hashFiles(paths) {
  const files = [];
  for (const p of paths) files.push(...walk(p));
  if (files.length === 0) return "";
  files.sort((a, b) => a.localeCompare(b));
  const h = createHash("sha256");
  for (const f of files) h.update(sha256(readFileSync(f)));
  return h.digest("hex");
}

function keyFor(project) {
  const dims = PROJECT_DIMS[project] ?? "unknown";
  const cfg = hashFiles(CFG_FILES);
  const snap = hashFiles([SNAP_GLOB_ROOT]);
  const freeze = process.env.PLAYWRIGHT_DISABLE_FREEZE_CSS ?? "0";
  const poll = process.env.PLAYWRIGHT_SKIP_LAYOUT_POLL ?? "0";
  const toggles = `freeze${freeze}-poll${poll}`;
  const prefix = `pw-snap-v3-${project}-${dims}-${toggles}-cfg-${cfg}`;
  const key = `${prefix}-snap-${snap}`;
  return { project, dims, toggles, cfg, snap, key, restorePrefixes: [
    `${prefix}-`,
    `pw-snap-v3-${project}-${dims}-${toggles}-`,
  ]};
}

const argProject = process.argv[2];
const projects = argProject ? [argProject] : Object.keys(PROJECT_DIMS);

for (const p of projects) {
  const r = keyFor(p);
  console.log(`── ${p} ───────────────────────────────────`);
  console.log(`  viewport / dpr : ${r.dims}`);
  console.log(`  toggles        : ${r.toggles}`);
  console.log(`  cfg hash       : ${r.cfg || "<no files matched>"}`);
  console.log(`  snapshots hash : ${r.snap || "<no files matched>"}`);
  console.log(`  full key       : ${r.key}`);
  console.log(`  restore-keys   :`);
  for (const rk of r.restorePrefixes) console.log(`    ${rk}`);
  console.log("");
}
