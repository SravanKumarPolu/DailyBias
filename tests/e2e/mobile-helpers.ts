import { Page } from '@playwright/test';

/**
 * Check if current test is running on mobile viewport
 */
export function isMobileViewport(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    return window.innerWidth <= 768 || 'ontouchstart' in window;
  });
}

/**
 * Wait for mobile-specific elements to be ready
 * Mobile devices may need more time for touch events and rendering
 */
export async function waitForMobileReady(page: Page) {
  // Wait for viewport to stabilize
  await page.waitForLoadState('domcontentloaded');
  
  // Additional wait for mobile rendering
  await page.waitForTimeout(500);
  
  // Ensure touch events are available
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      if ('ontouchstart' in window) {
        // Touch events available, ready
        resolve();
      } else {
        // Not a touch device, but still ready
        resolve();
      }
    });
  });
}

/**
 * Tap element on mobile (uses click but with touch context)
 */
export async function tapElement(page: Page, selector: string) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout: 10000 });
  
  // Use click which works for both mouse and touch
  await element.click({ force: false });
  
  // Small delay for mobile to process touch
  await page.waitForTimeout(200);
}

/**
 * Scroll on mobile viewport
 */
export async function scrollMobile(page: Page, direction: 'up' | 'down' = 'down', pixels: number = 300) {
  const viewport = page.viewportSize();
  if (!viewport) return;
  
  const scrollAmount = direction === 'down' ? pixels : -pixels;
  
  await page.evaluate((amount) => {
    window.scrollBy(0, amount);
  }, scrollAmount);
  
  await page.waitForTimeout(300);
}

