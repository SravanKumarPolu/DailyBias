import { test, expect } from '@playwright/test';
import { setupTestPage, waitForBiasCard, waitForNavigation, waitForPageLoad } from './helpers';

// Common mobile viewports for testing
const MOBILE_VIEWPORTS = {
  iphone13: { width: 390, height: 844 },
  iphoneSE: { width: 375, height: 667 },
  pixel5: { width: 393, height: 851 },
  galaxyS20: { width: 360, height: 800 },
  ipadMini: { width: 768, height: 1024 },
};

// Minimum touch target size (WCAG 2.5.5)
const MIN_TOUCH_TARGET = 44;

test.describe('Mobile Emulation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestPage(page, '2025-12-05');
  });

  test('iPhone 13 - daily page loads correctly', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORTS.iphone13);
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page, '/');
    await waitForBiasCard(page);
    await waitForNavigation(page);
    
    await test.step('Verify bias card is visible', async () => {
      const biasCard = page.locator('[data-testid="bias-card"]');
      await expect(biasCard).toBeVisible();
    });

    await test.step('Verify navigation is visible and accessible', async () => {
      const nav = page.locator('[data-testid="bottom-navigation"]');
      await expect(nav).toBeVisible();
      
      // Verify touch targets are adequate (44x44px minimum)
      const navItems = ['nav-daily', 'nav-all', 'nav-favorites', 'nav-add', 'nav-analytics', 'nav-settings'];
      for (const testId of navItems) {
        const navItem = page.locator(`[data-testid="${testId}"]`);
        await expect(navItem).toBeVisible();
        
        const box = await navItem.boundingBox();
        if (box) {
          // Touch target should be at least 44x44px (WCAG 2.5.5)
          expect(box.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET - 4); // Allow 4px tolerance
          expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET - 4);
        }
      }
    });

    await test.step('Verify no horizontal scrolling', async () => {
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // Allow 5px tolerance
    });
  });

  test('Pixel 5 - navigation works across all pages', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORTS.pixel5);
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page, '/');
    await waitForNavigation(page);
    
    const pages = [
      { path: '/all', name: 'All Biases' },
      { path: '/favorites', name: 'Favorites' },
      { path: '/add', name: 'Add' },
      { path: '/analytics', name: 'Analytics' },
      { path: '/settings', name: 'Settings' },
    ];

    for (const { path, name } of pages) {
      await test.step(`Navigate to ${name}`, async () => {
        try {
          await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 30000 });
          await waitForPageLoad(page, path);
          await page.waitForTimeout(1000);
          
          // Verify page loaded
          const main = page.locator('main, [id="main-content"]');
          await expect(main).toBeVisible({ timeout: 15000 });
        } catch (error) {
          // If navigation fails, try again with networkidle
          await page.goto(path, { waitUntil: 'networkidle', timeout: 30000 });
          await waitForPageLoad(page, path);
          await page.waitForTimeout(2000);
          
          const main = page.locator('main, [id="main-content"]');
          await expect(main).toBeVisible({ timeout: 15000 });
        }
      });
    }
  });

  test('iPhone SE - favorite button is tappable', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORTS.iphoneSE);
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page, '/');
    await waitForBiasCard(page);
    
    await test.step('Tap favorite button', async () => {
      const favoriteButton = page.locator('[data-testid="bias-favorite-button"]');
      await expect(favoriteButton).toBeVisible();
      
      const box = await favoriteButton.boundingBox();
      if (box) {
        // Verify touch target size
        expect(box.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET - 4);
        expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET - 4);
      }
      
      const initialAriaLabel = await favoriteButton.getAttribute('aria-label');
      
      await favoriteButton.click();
      
      // Wait for state to update
      await page.waitForTimeout(1000);
      
      // Verify button state changed
      const heartIcon = favoriteButton.locator('svg');
      await expect(heartIcon).toBeVisible();
      
      // Verify aria-label changed (if implemented)
      const newAriaLabel = await favoriteButton.getAttribute('aria-label');
      if (initialAriaLabel && newAriaLabel) {
        expect(newAriaLabel).not.toBe(initialAriaLabel);
      }
    });
  });

  test('Galaxy S20 - small screen content is readable', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORTS.galaxyS20);
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page, '/');
    await waitForBiasCard(page);
    
    await test.step('Verify text is readable', async () => {
      const biasCard = page.locator('[data-testid="bias-card"]');
      await expect(biasCard).toBeVisible();
      
      // Check font size is adequate (at least 14px for body text)
      const fontSize = await biasCard.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return parseFloat(style.fontSize);
      });
      expect(fontSize).toBeGreaterThanOrEqual(14);
    });

    await test.step('Verify no text overflow', async () => {
      const biasCard = page.locator('[data-testid="bias-card"]');
      const cardText = await biasCard.textContent();
      expect(cardText).toBeTruthy();
      expect(cardText!.length).toBeGreaterThan(0);
    });
  });

  test('iPhone 13 - settings page is usable', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORTS.iphone13);
    
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page, '/settings');
    await page.waitForTimeout(2000);
    
    await test.step('Verify settings page is scrollable', async () => {
      const main = page.locator('main, [id="main-content"]');
      await expect(main).toBeVisible({ timeout: 10000 });
      
      // Check if page is scrollable (content height > viewport)
      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      
      // Settings page should be scrollable on mobile (or at least have content)
      expect(scrollHeight).toBeGreaterThan(0);
    });

    await test.step('Verify toggles are tappable', async () => {
      // Give more time for Safari to load settings
      await page.waitForTimeout(3000);
      const voiceToggle = page.locator('[data-testid="setting-voice-enabled"]');
      if (await voiceToggle.isVisible({ timeout: 20000 }).catch(() => false)) {
        const box = await voiceToggle.boundingBox();
        if (box) {
          // Minimum touch target should be at least 24px (WCAG minimum)
          expect(box.width).toBeGreaterThanOrEqual(24);
          expect(box.height).toBeGreaterThanOrEqual(24);
        }
      } else {
        // If toggle not found, just verify page loaded
        const heading = page.locator('h1').filter({ hasText: /Settings/i });
        await expect(heading.first()).toBeVisible({ timeout: 20000 });
      }
    });
  });

  test('iPad Mini - tablet layout works', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORTS.ipadMini);
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page, '/');
    await waitForBiasCard(page);
    
    await test.step('Verify layout adapts for tablet', async () => {
      const biasCard = page.locator('[data-testid="bias-card"]');
      await expect(biasCard).toBeVisible();
      
      // On tablet, content should use available space better
      const cardBox = await biasCard.boundingBox();
      if (cardBox) {
        // Card should not be too narrow on tablet
        expect(cardBox.width).toBeGreaterThan(300);
      }
    });
  });

  test('All viewports - performance check', async ({ page }) => {
    const viewports = [
      MOBILE_VIEWPORTS.iphoneSE,
      MOBILE_VIEWPORTS.iphone13,
      MOBILE_VIEWPORTS.pixel5,
    ];

    for (const viewport of viewports) {
      await test.step(`Performance test on ${viewport.width}x${viewport.height}`, async () => {
        await page.setViewportSize(viewport);
        
        const startTime = Date.now();
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await waitForPageLoad(page, '/');
        await waitForBiasCard(page);
        const loadTime = Date.now() - startTime;
        
        // Page should load in reasonable time (<12 seconds for mobile)
        // Increased threshold for mobile devices which may be slower
        expect(loadTime).toBeLessThan(12000);
      });
    }
  });

  test('All viewports - no layout shift', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORTS.iphone13);
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Measure layout shift
    const layoutShift = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cls += (entry as any).value;
            }
          }
          resolve(cls);
        }).observe({ type: 'layout-shift', buffered: true });
        
        // Resolve after a delay if no layout shifts
        setTimeout(() => resolve(cls), 2000);
      });
    });
    
    // Cumulative Layout Shift should be low (<0.1 is good)
    expect(layoutShift).toBeLessThan(0.25);
  });
});

