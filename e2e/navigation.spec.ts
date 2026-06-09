import { test, expect } from "@playwright/test";

test.describe("Today tab + navigation", () => {
  test("highlights Today tab on / and switches when navigating", async ({ page }) => {
    await page.goto("/");
    const today = page.getByRole("link", { name: /today/i });
    await expect(today).toHaveAttribute("aria-current", "page");

    await page.getByRole("link", { name: /saved/i }).click();
    await expect(page).toHaveURL(/\/saved$/);
    await expect(page.getByRole("link", { name: /saved/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.getByRole("link", { name: /today/i })).not.toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("renders today's bias content by default at /", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.getByText(/definition/i).first()).toBeVisible();
  });
});
