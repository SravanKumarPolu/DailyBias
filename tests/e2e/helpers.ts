import { Page, expect } from '@playwright/test';

/**
 * Skip onboarding by setting the completion flag in localStorage
 * This should be called before navigating to pages that check onboarding
 */
export async function skipOnboarding(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('onboarding-completed', 'true');
  });
}

/**
 * Freeze browser time to a fixed date for deterministic E2E tests
 * This prevents the Daily bias from changing during test execution
 * 
 * The app uses getLocalDateString() which calls new Date(), so we need to
 * override the Date constructor to return a fixed date.
 */
export async function freezeDate(page: Page, dateString: string = '2024-12-04') {
  // Parse the date string (YYYY-MM-DD) and create a Date at noon local time
  const [year, month, day] = dateString.split('-').map(Number);
  const fixedDate = new Date(year, month - 1, day, 12, 0, 0, 0);
  const fixedTimestamp = fixedDate.getTime();

  // Override Date constructor and Date.now() in the browser context
  await page.addInitScript((timestamp: number) => {
    const OriginalDate = window.Date;

    // Override Date constructor
    // @ts-ignore
    window.Date = function Date(...args: any[]) {
      if (args.length === 0) {
        // new Date() - return fixed date
        const date = new OriginalDate(timestamp);
        // Copy all methods to ensure compatibility
        Object.setPrototypeOf(date, OriginalDate.prototype);
        return date;
      } else {
        // new Date(value) or new Date(year, month, ...) - use original
        // eslint-disable-next-line prefer-spread
        return new (OriginalDate as any)(...args);
      }
    } as any;

    // Copy prototype
    Object.setPrototypeOf(window.Date, OriginalDate);
    Object.defineProperty(window.Date, 'prototype', {
      value: OriginalDate.prototype,
      writable: false,
      configurable: false,
    });

    // Override static methods
    window.Date.now = () => timestamp;
    window.Date.parse = OriginalDate.parse;
    window.Date.UTC = OriginalDate.UTC;
  }, fixedTimestamp);
}

/**
 * Setup page for E2E tests - skip onboarding and freeze date
 */
export async function setupTestPage(page: Page, dateString: string = '2024-12-04') {
  // Suppress hydration warnings in console (expected when freezing date)
  // Set this up before any navigation
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Suppress hydration mismatch errors - expected when freezing date in tests
      if (text.includes('Hydration') || text.includes('hydration')) {
        return; // Suppress this error
      }
    }
  });

  await skipOnboarding(page);
  await freezeDate(page, dateString);
}

/**
 * Wait for the bias card to be visible and loaded
 */
export async function waitForBiasCard(page: Page) {
  // Wait for bias card to be visible
  await page.waitForSelector('[data-testid="bias-card"]', { state: 'visible', timeout: 10000 });
  
  // Wait for card content (title) to be visible
  const biasCard = page.locator('[data-testid="bias-card"]');
  await expect(biasCard.locator('h1, h3').first()).toBeVisible({ timeout: 5000 });
  
  // Wait a bit more for content to fully render
  await page.waitForTimeout(300);
}

/**
 * Wait for navigation to be visible
 */
export async function waitForNavigation(page: Page) {
  await page.waitForSelector('[data-testid="bottom-navigation"]', { state: 'visible', timeout: 10000 });
}

/**
 * Wait for page to be fully loaded (not on onboarding)
 */
export async function waitForPageLoad(page: Page, expectedPath: string = '/') {
  // Wait for URL to match (not onboarding)
  await page.waitForURL(expectedPath, { timeout: 10000 });
  
  // Wait for React to hydrate (DOMContentLoaded + a bit more for React)
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for network to be idle (or timeout quickly)
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
    // Ignore if networkidle times out, just wait a bit
  });
  
  // Wait for React hydration to complete
  // The hydration mismatch is expected when we freeze dates, so we wait for it to settle
  // Reduced timeout to prevent test timeouts
  await page.waitForTimeout(500);
  
  // Wait for any client-side re-renders to complete (with timeout)
  try {
    await page.evaluate(() => {
      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Page load timeout'));
        }, 5000);
        
        if (document.readyState === 'complete') {
          // Use requestAnimationFrame to wait for React to finish rendering
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              clearTimeout(timeout);
              resolve();
            });
          });
        } else {
          window.addEventListener('load', () => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                clearTimeout(timeout);
                resolve();
              });
            });
          });
        }
      });
    });
  } catch (error) {
    // If evaluation times out, just wait a bit more and continue
    await page.waitForTimeout(500);
  }
}

