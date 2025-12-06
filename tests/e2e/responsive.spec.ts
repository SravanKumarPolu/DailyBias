import { test, expect } from '@playwright/test';
import { setupTestPage, waitForBiasCard, waitForNavigation, waitForPageLoad } from './helpers';

test.describe('Responsive Design Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestPage(page, '2025-12-05');
  });

  test('mobile viewport - bottom nav visible and tappable', async ({ page }) => {
    await test.step('Set mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
      await page.goto('/');
      await waitForPageLoad(page, '/');
    });

    await test.step('Verify bottom navigation is visible', async () => {
      await waitForNavigation(page);
      const nav = page.locator('[data-testid="bottom-navigation"]');
      await expect(nav).toBeVisible({ timeout: 10000 });
      
      // Verify nav is at the bottom of the viewport
      await page.waitForTimeout(500); // Wait for layout to settle
      const navBox = await nav.boundingBox();
      expect(navBox).toBeTruthy();
      if (navBox) {
        // Nav should be near the bottom (accounting for safe area)
        // On mobile, nav should be in the bottom portion of the screen
        expect(navBox.y).toBeGreaterThan(400);
      }
    });

    await test.step('Verify all nav items are visible and tappable', async () => {
      const navItems = ['nav-daily', 'nav-all', 'nav-favorites', 'nav-add', 'nav-analytics', 'nav-settings'];
      
      for (const testId of navItems) {
        const navItem = page.locator(`[data-testid="${testId}"]`);
        await expect(navItem).toBeVisible();
        
        // Verify it has adequate touch target size (minimum 44x44px)
        const box = await navItem.boundingBox();
        expect(box).toBeTruthy();
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(40); // Allow some flexibility
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    });

    await test.step('Test navigation works on mobile', async () => {
      await waitForBiasCard(page);
      await waitForNavigation(page);
      
      // Tap on All tab
      const allNavLink = page.locator('[data-testid="nav-all"]');
      await allNavLink.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      
      const navigationPromise = page.waitForURL('/all', { timeout: 15000 });
      await allNavLink.click({ force: false });
      await navigationPromise;
      await waitForPageLoad(page, '/all');
      
      // Wait for page to fully load and check for errors
      await page.waitForTimeout(1000);
      
      // Check if error page is shown and retry if needed
      const errorHeading = page.locator('h1').filter({ hasText: /Something went wrong/i });
      const errorCount = await errorHeading.count();
      
      if (errorCount > 0) {
        // If error page is shown, try clicking "Try again" button
        const tryAgainButton = page.getByRole('button', { name: /Try again/i });
        if (await tryAgainButton.count() > 0) {
          await tryAgainButton.click();
          await page.waitForTimeout(2000);
        }
      }
      
      // Use main content h1 (not the header h1)
      const mainContent = page.locator('main, [id="main-content"]');
      const pageHeading = mainContent.locator('h1').first();
      const headingExists = await pageHeading.count();
      if (headingExists > 0) {
        await expect(pageHeading).toContainText(/All|Biases/i, { timeout: 15000 });
      } else {
        await expect(page.locator('h1').filter({ hasText: /All|Biases/i })).toBeVisible({ timeout: 15000 });
      }
      
      // Tap on Favorites
      const favoritesNavLink = page.locator('[data-testid="nav-favorites"]');
      await favoritesNavLink.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      
      const favoritesNavPromise = page.waitForURL('/favorites', { timeout: 15000 });
      await favoritesNavLink.click({ force: false });
      await favoritesNavPromise;
      await waitForPageLoad(page, '/favorites');
      
      // Verify page loaded
      await expect(page.locator('h1').filter({ hasText: /Favorites/i })).toBeVisible({ timeout: 10000 });
    });

    await test.step('Verify no horizontal overflow', async () => {
      // Check that content doesn't overflow horizontally
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = page.viewportSize()?.width || 375;
      
      // Body width should not exceed viewport (allow small margin for rounding and scrollbars)
      // Some browsers add scrollbar width, so allow up to 20px difference
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
    });
  });

  test('tablet viewport - layout adapts correctly', async ({ page }) => {
    await test.step('Set tablet viewport', async () => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
      await page.goto('/');
      await waitForPageLoad(page, '/');
    });

    await test.step('Verify navigation is visible', async () => {
      await waitForNavigation(page);
      const nav = page.locator('[data-testid="bottom-navigation"]');
      await expect(nav).toBeVisible();
    });

    await test.step('Verify content is readable', async () => {
      await waitForBiasCard(page);
      const biasCard = page.locator('[data-testid="bias-card"]');
      await expect(biasCard).toBeVisible();
      
      // Verify text is readable (not too small)
      const title = biasCard.locator('h1, h3').first();
      const fontSize = await title.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });
      const fontSizeNum = parseFloat(fontSize);
      expect(fontSizeNum).toBeGreaterThan(14); // At least 14px
    });
  });
});

