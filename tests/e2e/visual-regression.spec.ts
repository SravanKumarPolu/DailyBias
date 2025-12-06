import { test, expect } from '@playwright/test';
import { setupTestPage, waitForBiasCard, waitForPageLoad } from './helpers';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestPage(page, '2025-12-05');
  });

  test('daily page visual snapshot', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page, '/');
    await waitForBiasCard(page);
    
    // Wait for animations to complete
    await page.waitForTimeout(1000);
    
    // Take full page screenshot (Playwright will auto-generate snapshot on first run)
    await expect(page).toHaveScreenshot('daily-page.png', {
      fullPage: true,
      maxDiffPixels: 100, // Allow small differences (fonts, rendering)
    });
  });

  test('all page visual snapshot', async ({ page }) => {
    await page.goto('/all', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page, '/all');
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('all-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('favorites page visual snapshot', async ({ page }) => {
    await page.goto('/favorites', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page, '/favorites');
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('favorites-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('settings page visual snapshot', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page, '/settings');
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('settings-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('analytics page visual snapshot', async ({ page }) => {
    await page.goto('/analytics', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page, '/analytics');
    
    // Wait for analytics to load
    await page.waitForTimeout(3000);
    
    await expect(page).toHaveScreenshot('analytics-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('mobile viewport visual snapshot', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page, '/');
    await waitForBiasCard(page);
    
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('daily-page-mobile.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('tablet viewport visual snapshot', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page, '/');
    await waitForBiasCard(page);
    
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('daily-page-tablet.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('dark mode visual snapshot', async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page, '/');
    await waitForBiasCard(page);
    
    // Wait for theme to apply
    await page.waitForTimeout(1500);
    
    await expect(page).toHaveScreenshot('daily-page-dark.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('bias card component snapshot', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page, '/');
    await waitForBiasCard(page);
    
    // Wait for animations to complete
    await page.waitForTimeout(1000);
    
    // Take snapshot of just the bias card component
    const biasCard = page.locator('[data-testid="bias-card"]').first();
    await expect(biasCard).toHaveScreenshot('bias-card-component.png', {
      maxDiffPixels: 50,
    });
  });

  test('navigation component snapshot', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page, '/');
    
    // Wait for navigation to load
    await page.waitForSelector('[data-testid="bottom-navigation"]', { state: 'visible' });
    await page.waitForTimeout(500);
    
    // Take snapshot of navigation component
    const navigation = page.locator('[data-testid="bottom-navigation"]');
    await expect(navigation).toHaveScreenshot('navigation-component.png', {
      maxDiffPixels: 50,
    });
  });

  test('settings page dark mode snapshot', async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page, '/settings');
    
    // Wait for content and theme to load
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('settings-page-dark.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });
});

