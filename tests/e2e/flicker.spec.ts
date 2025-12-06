import { test, expect } from '@playwright/test';
import { setupTestPage, waitForBiasCard, waitForPageLoad } from './helpers';

test.describe('Flicker Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestPage(page, '2025-12-05');
    await page.goto('/');
    await waitForPageLoad(page, '/');
  });

  test('no skeleton placeholders appear after content loads', async ({ page }) => {
    await test.step('Wait for initial content to load', async () => {
      await waitForBiasCard(page);
      
      // Verify bias card is visible
      const biasCard = page.locator('[data-testid="bias-card"]');
      await expect(biasCard).toBeVisible({ timeout: 15000 });
      
      // Verify card has content (title) - try multiple selectors
      const title = biasCard.locator('h1, h3, h2, #bias-title').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      const titleText = await title.textContent();
      expect(titleText?.trim().length).toBeGreaterThan(0);
    });

    await test.step('Monitor for skeleton placeholders after content is visible', async () => {
      // Wait a bit to ensure content is stable
      await page.waitForTimeout(2000);
      
      // Count skeleton loaders (common patterns: animate-pulse, skeleton classes)
      // But exclude elements that are hidden or in non-content areas
      const skeletonSelectors = [
        '[class*="animate-pulse"]:visible',
        '[class*="skeleton"]:visible',
      ];
      
      let visibleSkeletonCount = 0;
      for (const selector of skeletonSelectors) {
        try {
          const elements = page.locator(selector);
          const count = await elements.count();
          // Check if any are actually visible in the viewport
          for (let i = 0; i < count; i++) {
            const element = elements.nth(i);
            const isVisible = await element.isVisible().catch(() => false);
            if (isVisible) {
              visibleSkeletonCount++;
            }
          }
        } catch {
          // Ignore errors
        }
      }
      
      // After content is loaded, visible skeleton count should be 0
      // (skeletons might exist but should be hidden)
      expect(visibleSkeletonCount).toBe(0);
    });

    await test.step('Verify content remains stable on interaction', async () => {
      const biasCard = page.locator('[data-testid="bias-card"]');
      const initialTitle = await biasCard.locator('h1, h3').first().textContent();
      
      // Interact with the page (scroll, hover, etc.)
      await page.mouse.move(100, 100);
      await page.waitForTimeout(500);
      
      // Title should remain the same
      const titleAfterInteraction = await biasCard.locator('h1, h3').first().textContent();
      expect(titleAfterInteraction).toBe(initialTitle);
    });
  });

  test('bias card content does not flicker during hydration', async ({ page }) => {
    await test.step('Capture initial render', async () => {
      // Take a screenshot after initial load
      await waitForBiasCard(page);
      await page.waitForTimeout(1000);
    });

    await test.step('Verify content is stable', async () => {
      const biasCard = page.locator('[data-testid="bias-card"]');
      await expect(biasCard).toBeVisible({ timeout: 15000 });
      
      // Get the title text - try multiple selectors
      const title = biasCard.locator('h1, h3, h2, #bias-title').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      const titleText = await title.textContent();
      expect(titleText).toBeTruthy();
      expect(titleText?.trim().length).toBeGreaterThan(0);
      
      // Wait a bit and verify title hasn't changed
      await page.waitForTimeout(2000);
      const titleTextAfter = await title.textContent();
      expect(titleTextAfter).toBe(titleText);
    });
  });
});

