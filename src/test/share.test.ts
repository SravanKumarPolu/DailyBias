import { describe, it, expect, vi } from "vitest";
import {
  buildShareUrl,
  buildBiasShareData,
  buildBiasShareText,
  getShareCapability,
  getSiteUrl,
  runShareFlow,
} from "@/lib/share";

describe("getShareCapability", () => {
  it("reports unsupported when navigator.share is missing", () => {
    expect(getShareCapability({ nav: undefined, win: { isSecureContext: true } }))
      .toEqual({ canShare: false, reason: "unsupported" });
    expect(getShareCapability({ nav: {} as Navigator, win: { isSecureContext: true } }))
      .toEqual({ canShare: false, reason: "unsupported" });
  });

  it("reports insecure when not in a secure context", () => {
    const w = { isSecureContext: false } as Window;
    (w as unknown as { self: unknown }).self = w;
    (w as unknown as { top: unknown }).top = w;
    expect(getShareCapability({ nav: { share: vi.fn() }, win: w }))
      .toEqual({ canShare: false, reason: "insecure" });
  });

  it("detects iframe (self !== top) and falls back", () => {
    const top = {};
    const w = { isSecureContext: true, self: {}, top } as unknown as Window;
    expect(getShareCapability({ nav: { share: vi.fn() }, win: w }))
      .toEqual({ canShare: false, reason: "iframe" });
  });

  it("returns ok in a top-level secure context", () => {
    const w: { isSecureContext: boolean; self?: unknown; top?: unknown } = { isSecureContext: true };
    w.self = w;
    w.top = w;
    expect(getShareCapability({ nav: { share: vi.fn() }, win: w as Window }))
      .toEqual({ canShare: true, reason: "ok" });
  });
});

describe("buildBiasShareText", () => {
  const bias = {
    title: "Confirmation Bias",
    definition: "Seeking information that confirms existing beliefs.",
  };

  it("formats title, definition, and site link", () => {
    expect(buildBiasShareText(bias, "https://debiasdaily.com")).toBe(
      [
        "Today's Bias:",
        "Confirmation Bias",
        "",
        "Seeking information that confirms existing beliefs.",
        "",
        "Learn one cognitive bias per day:",
        "https://debiasdaily.com",
      ].join("\n"),
    );
  });

  it("builds ShareData with bias deep link", () => {
    const data = buildBiasShareData(
      { id: "confirmation-bias", ...bias },
      "https://debiasdaily.com",
    );
    expect(data.title).toBe("Today's Bias: Confirmation Bias");
    expect(data.text).toContain("https://debiasdaily.com");
    expect(data.url).toBe("https://debiasdaily.com/bias/confirmation-bias");
  });
});

describe("getSiteUrl", () => {
  it("defaults to production domain", () => {
    expect(getSiteUrl({})).toBe("https://debiasdaily.com");
  });

  it("strips trailing slashes from env value", () => {
    expect(getSiteUrl({ VITE_SITE_URL: "https://debiasdaily.com/" })).toBe(
      "https://debiasdaily.com",
    );
  });
});

describe("buildShareUrl", () => {
  it("uses /bias/:id when an id is provided", () => {
    expect(buildShareUrl("anchoring", { origin: "https://app.test", base: "/" }))
      .toBe("https://app.test/bias/anchoring");
  });

  it("honors a sub-path base and strips trailing slashes", () => {
    expect(buildShareUrl("halo", { origin: "https://x.io", base: "/app/" }))
      .toBe("https://x.io/app/bias/halo");
  });

  it("falls back to pathname when no id is given", () => {
    expect(buildShareUrl(undefined, {
      origin: "https://x.io",
      base: "/",
      pathname: "/saved",
    })).toBe("https://x.io/saved");
  });
});

describe("runShareFlow", () => {
  const data: ShareData = { title: "t", text: "x", url: "https://x.io/bias/a" };

  it("falls back to copy when capability says iframe", async () => {
    const share = vi.fn();
    const copy = vi.fn().mockResolvedValue(undefined);
    const out = await runShareFlow(data, {
      capability: { canShare: false, reason: "iframe" },
      share,
      copy,
    });
    expect(out).toBe("copied");
    expect(share).not.toHaveBeenCalled();
    expect(copy).toHaveBeenCalledWith(data.text);
  });

  it("returns 'shared' when native share resolves", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const copy = vi.fn();
    const out = await runShareFlow(data, {
      capability: { canShare: true, reason: "ok" },
      share,
      copy,
    });
    expect(out).toBe("shared");
    expect(copy).not.toHaveBeenCalled();
  });

  it("returns 'cancelled' on AbortError without copying", async () => {
    const abort = Object.assign(new Error("abort"), { name: "AbortError" });
    const share = vi.fn().mockRejectedValue(abort);
    const copy = vi.fn();
    const out = await runShareFlow(data, {
      capability: { canShare: true, reason: "ok" },
      share,
      copy,
    });
    expect(out).toBe("cancelled");
    expect(copy).not.toHaveBeenCalled();
  });

  it("falls back to copy on non-abort share errors", async () => {
    const share = vi.fn().mockRejectedValue(
      Object.assign(new Error("nope"), { name: "NotAllowedError" }),
    );
    const copy = vi.fn().mockResolvedValue(undefined);
    const out = await runShareFlow(data, {
      capability: { canShare: true, reason: "ok" },
      share,
      copy,
    });
    expect(out).toBe("copied");
    expect(copy).toHaveBeenCalledWith(data.text);
  });

  it("returns 'failed' when both share and copy reject", async () => {
    const share = vi.fn().mockRejectedValue(new Error("nope"));
    const copy = vi.fn().mockRejectedValue(new Error("denied"));
    const out = await runShareFlow(data, {
      capability: { canShare: true, reason: "ok" },
      share,
      copy,
    });
    expect(out).toBe("failed");
  });
});
