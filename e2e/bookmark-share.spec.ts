import { test, expect } from "@playwright/test";

test.describe("Bookmark + share from TodayPage", () => {
  test("bookmark toggles, persists across reload, and updates aria-pressed", async ({ page }) => {
    await page.goto("/");

    const bookmarkBtn = page.getByRole("button", { name: /bookmark today's bias/i });
    await expect(bookmarkBtn).toHaveAttribute("aria-pressed", "false");
    await bookmarkBtn.click();

    // After toggling, the accessible name flips and aria-pressed=true.
    const saved = page.getByRole("button", { name: /remove bookmark from today's bias/i });
    await expect(saved).toHaveAttribute("aria-pressed", "true");

    // Persisted to localStorage under the documented key.
    const stored = await page.evaluate(() =>
      localStorage.getItem("debiasdaily.bookmarks.v1"),
    );
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored as string)).toHaveLength(1);

    // Survives a hard reload.
    await page.reload();
    await expect(
      page.getByRole("button", { name: /remove bookmark from today's bias/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("share button falls back to clipboard copy when navigator.share is unavailable", async ({
    page,
    context,
    browserName,
  }) => {
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }

    await page.addInitScript(() => {
      // @ts-expect-error – intentionally removing for fallback path
      delete (navigator as Navigator).share;
    });

    await page.goto("/");

    const shareBtn = page.getByRole("button", { name: /share today's bias/i });
    await shareBtn.click();

    await expect(page.getByText(/copied to clipboard/i)).toBeVisible({ timeout: 5000 });

    if (browserName === "chromium") {
      const clip = await page.evaluate(() => navigator.clipboard.readText());
      expect(clip).toContain("Today's Bias:");
      expect(clip).toContain("Learn one cognitive bias per day:");
      expect(clip).toContain("https://debiasdaily.com");
    }
  });

  test("share button invokes navigator.share when available", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __sharePayload?: unknown }).__sharePayload = null;
      (navigator as Navigator & { share: (d: unknown) => Promise<void> }).share = async (
        data: unknown,
      ) => {
        (window as unknown as { __sharePayload?: unknown }).__sharePayload = data;
      };
    });
    await page.goto("/");

    const shareBtn = page.getByRole("button", { name: /share today's bias/i });
    await shareBtn.click();

    const payload = await page.evaluate(
      () =>
        (window as unknown as { __sharePayload?: { title: string; text: string; url: string } })
          .__sharePayload,
    );
    expect(payload?.title).toContain("Today's Bias:");
    expect(payload?.text).toContain("Today's Bias:");
    expect(payload?.text).toContain("https://debiasdaily.com");
    expect(payload?.url).toContain("/bias/");
  });
});
