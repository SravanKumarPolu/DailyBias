import { test, expect } from '@playwright/test';
import { setupTestPage, waitForBiasCard, waitForNavigation, waitForPageLoad } from './helpers';

test.describe('App Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test page (skip onboarding, freeze date, suppress hydration warnings)
    await setupTestPage(page, '2024-12-04');
    
    // Navigate to page
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Wait for page to fully load and hydrate
    await waitForPageLoad(page, '/');
  });

  test('app loads and shows daily bias', async ({ page }) => {
    await test.step('Wait for page to load', async () => {
      await waitForBiasCard(page);
      await waitForNavigation(page);
    });

    await test.step('Verify header is visible', async () => {
      const header = page.locator('header');
      await expect(header).toBeVisible();
    });

    await test.step('Verify daily bias card is visible', async () => {
      const biasCard = page.locator('[data-testid="bias-card"]');
      await expect(biasCard).toBeVisible({ timeout: 10000 });
      
      // Verify card has a title (use the bias-title id or first h1/h3 in card)
      const title = biasCard.locator('#bias-title, h1, h3').first();
      await expect(title).toBeVisible({ timeout: 5000 });
      await expect(title).not.toHaveText('');
    });

    await test.step('Verify bottom navigation is visible', async () => {
      const nav = page.locator('[data-testid="bottom-navigation"]');
      await expect(nav).toBeVisible();
      
      // Verify all nav items are present
      await expect(page.locator('[data-testid="nav-daily"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-all"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-favorites"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-add"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-analytics"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-settings"]')).toBeVisible();
    });
  });
});

