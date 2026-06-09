#!/usr/bin/env node
/**
 * Local helper to refresh Playwright visual baselines using the same settings CI uses.
 *
 *   bun run test:e2e:update                  # all projects, all visual specs
 *   bun run test:e2e:update -- --project=desktop-webkit
 *   bun run test:e2e:update -- e2e/visual.spec.ts --project=mobile-firefox
 *
 * Notes:
 * - PNGs generated on non-Ubuntu machines (macOS / Windows) will likely NOT
 *   match the bytes CI produces. For real baselines, run the
 *   "Update Playwright snapshots" GitHub Actions workflow.
 * - This script forces CI-equivalent flags (`CI=1`) and defaults to the
 *   visual spec so locally-generated snapshots stay in scope.
 */
import { spawnSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SNAPSHOT_ROOT = "e2e";
const args = process.argv.slice(2);
const hasSpec = args.some((a) => a.endsWith(".spec.ts"));
const cmd = [
  "playwright",
  "test",
  ...(hasSpec ? [] : ["e2e/visual.spec.ts"]),
  "--update-snapshots",
  ...args,
];

function listSnapshots() {
  const found = [];
  function walk(dir) {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of entries) {
      const full = join(dir, name);
      const st = statSync(full);
      if (st.isDirectory()) walk(full);
      else if (name.endsWith(".png") && full.includes("-snapshots")) {
        found.push({ path: relative(process.cwd(), full), mtime: st.mtimeMs });
      }
    }
  }
  walk(SNAPSHOT_ROOT);
  return found;
}

const before = new Map(listSnapshots().map((s) => [s.path, s.mtime]));

console.log(`> bunx ${cmd.join(" ")}\n`);
const result = spawnSync("bunx", cmd, {
  stdio: "inherit",
  env: { ...process.env, CI: "1" },
});

const after = listSnapshots();
const added = after.filter((s) => !before.has(s.path));
const updated = after.filter((s) => before.has(s.path) && before.get(s.path) !== s.mtime);

console.log("\n— Snapshot directory changes —");
if (!added.length && !updated.length) {
  console.log("  (no PNG additions or modifications detected)");
} else {
  for (const s of added) console.log(`  added    ${s.path}`);
  for (const s of updated) console.log(`  updated  ${s.path}`);
}
console.log(
  "\nReminder: only commit baselines generated on Ubuntu (CI workflow). " +
    "PNGs from macOS/Windows will fail in CI due to font/AA differences.\n",
);

process.exit(result.status ?? 1);
