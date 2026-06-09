import { test, expect } from "@playwright/test";

test.describe("Streak + bookmark persistence", () => {
  test("streak persists across reload", async ({ page }) => {
    await page.goto("/");
    const streakBefore = await page.evaluate(() =>
      localStorage.getItem("debiasdaily.streak.v1"),
    );
    expect(streakBefore).not.toBeNull();
    const parsed = JSON.parse(streakBefore as string);
    expect(parsed.count).toBeGreaterThanOrEqual(1);

    await page.reload();
    const streakAfter = await page.evaluate(() =>
      localStorage.getItem("debiasdaily.streak.v1"),
    );
    expect(JSON.parse(streakAfter as string).count).toBe(parsed.count);
  });

  test("bookmark survives reload", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem(
        "debiasdaily.bookmarks.v1",
        JSON.stringify([{ biasId: "e2e-test", savedAt: new Date().toISOString() }]),
      );
    });
    await page.reload();
    const saved = await page.evaluate(() =>
      localStorage.getItem("debiasdaily.bookmarks.v1"),
    );
    expect(saved).toContain("e2e-test");
  });
});
