import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("TodayPage accessibility", () => {
  test("has a navigation landmark and aria-current on active tab", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page.getByRole("link", { name: /today/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("keyboard Tab cycles through nav links and Enter activates", async ({ page }) => {
    await page.goto("/");
    // Focus first nav link by tabbing from the document start.
    const today = page.getByRole("link", { name: /today/i });
    await today.focus();
    await expect(today).toBeFocused();

    // Tab to next nav link (Saved) and activate with Enter.
    await page.keyboard.press("Tab");
    const saved = page.getByRole("link", { name: /saved/i });
    await expect(saved).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/saved$/);
  });

  test("no critical axe violations on /", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
  });
});

test("nav remains reachable and aria-current works on mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 915 });
  await page.goto("/");
  const today = page.getByRole("link", { name: /today/i });
  await expect(today).toBeVisible();
  await expect(today).toHaveAttribute("aria-current", "page");
});
