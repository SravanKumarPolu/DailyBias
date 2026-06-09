/**
 * Pure helpers for share / copy behavior. Kept dependency-free so they can
 * be unit-tested under jsdom without rendering the full bias page.
 */

export const DEFAULT_SITE_URL = "https://debiasdaily.com";

/** Production site origin for share text (no trailing slash). */
export function getSiteUrl(
  env: { VITE_SITE_URL?: string } = import.meta.env,
): string {
  return (env.VITE_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/+$/, "");
}

export interface ShareableBias {
  id: string;
  title: string;
  definition: string;
  category: string;
}

/** Formatted clipboard / share body for a cognitive bias. */
export function buildBiasShareText(
  bias: Pick<ShareableBias, "title" | "definition">,
  siteUrl = getSiteUrl(),
): string {
  return [
    "Today's Bias:",
    bias.title,
    "",
    bias.definition,
    "",
    "Learn one cognitive bias per day:",
    siteUrl,
  ].join("\n");
}

/** Web Share API payload for a bias. */
export function buildBiasShareData(
  bias: Pick<ShareableBias, "id" | "title" | "definition">,
  siteUrl = getSiteUrl(),
): ShareData {
  const text = buildBiasShareText(bias, siteUrl);
  return {
    title: `Today's Bias: ${bias.title}`,
    text,
    url: `${siteUrl}/bias/${bias.id}`,
  };
}

export interface ShareCapability {
  /** True when `navigator.share` is callable in this context. */
  canShare: boolean;
  /** Machine-readable reason when `canShare` is false. */
  reason:
    | "ok"
    | "unsupported" // navigator.share missing
    | "iframe" // running inside an iframe (preview, embed)
    | "insecure"; // not HTTPS / not a secure context
}

interface CapabilityEnv {
  nav?: Pick<Navigator, "share"> | undefined;
  win?: { isSecureContext?: boolean; self?: unknown; top?: unknown };
}

/**
 * Decide whether the Web Share API can actually be used. The browser will
 * happily expose `navigator.share` inside iframes but then reject the call
 * with `NotAllowedError`, so we treat iframes as unsupported up-front.
 */
export function getShareCapability(env: CapabilityEnv = {
  nav: typeof navigator !== "undefined" ? navigator : undefined,
  win: typeof window !== "undefined" ? window : undefined,
}): ShareCapability {
  const nav = env.nav;
  const win = env.win;
  if (!nav || typeof nav.share !== "function") {
    return { canShare: false, reason: "unsupported" };
  }
  if (!win) {
    return { canShare: false, reason: "unsupported" };
  }
  if (!win.isSecureContext) {
    return { canShare: false, reason: "insecure" };
  }
  if (win.self !== win.top) {
    return { canShare: false, reason: "iframe" };
  }
  return { canShare: true, reason: "ok" };
}

/** Build a fully-qualified shareable URL honoring Vite's BASE_URL. */
export function buildShareUrl(
  biasId: string | undefined,
  opts: { origin?: string; base?: string; pathname?: string } = {},
): string {
  const origin =
    opts.origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  const rawBase = opts.base ?? "/";
  const base = String(rawBase).replace(/\/+$/, "");
  const fallbackPath =
    opts.pathname ??
    (typeof window !== "undefined" ? window.location.pathname : "/");
  const path = biasId ? `/bias/${biasId}` : fallbackPath;
  return `${origin}${base}${path}`;
}

export type ShareOutcome =
  | "shared" // native share completed
  | "cancelled" // user dismissed the native sheet
  | "copied" // fell back to clipboard copy
  | "failed"; // both native share and copy failed

interface RunShareDeps {
  capability: ShareCapability;
  share: (data: ShareData) => Promise<void>;
  copy: (text: string) => Promise<void>;
}

/**
 * Orchestrates the share flow with deterministic fallbacks:
 *   - capability ok           → try native share, fall back to copy on
 *                               non-abort errors, signal "cancelled" on abort
 *   - capability not ok       → copy directly
 * Returned outcome lets the caller drive UI state (button, tooltip, copied
 * indicator) consistently regardless of which branch ran.
 */
export async function runShareFlow(
  data: ShareData,
  deps: RunShareDeps,
): Promise<ShareOutcome> {
  const { capability, share, copy } = deps;
  const copyText = data.text ?? data.url ?? "";
  if (!capability.canShare) {
    try {
      await copy(copyText);
      return "copied";
    } catch {
      return "failed";
    }
  }
  try {
    await share(data);
    return "shared";
  } catch (err) {
    const name = (err as { name?: string } | null)?.name;
    if (name === "AbortError") return "cancelled";
    try {
      await copy(copyText);
      return "copied";
    } catch {
      return "failed";
    }
  }
}
