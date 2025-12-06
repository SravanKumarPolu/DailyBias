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
export async function freezeDate(page: Page, dateString: string = '2025-12-05') {
  // Override Date constructor and Date.now() in the browser context
  // This must run before any page scripts execute
  // We create the date IN the browser context to avoid timezone issues
  await page.addInitScript((dateStr: string) => {
    const OriginalDate = window.Date;
    const [y, m, d] = dateStr.split('-').map(Number);
    // Create date at noon (12:00:00) in local timezone
    // Using noon ensures we're in the middle of the day, avoiding timezone edge cases
    // This ensures getFullYear(), getMonth(), getDate() always return correct values
    // and toLocaleDateString() will also show the correct day
    const fixedDateObj = new OriginalDate(y, m - 1, d, 12, 0, 0, 0);
    const fixedTime = fixedDateObj.getTime();
    
    // Verify the date string matches what we expect
    const verifyDate = new OriginalDate(fixedTime);
    const verifyYear = verifyDate.getFullYear();
    const verifyMonth = verifyDate.getMonth() + 1;
    const verifyDay = verifyDate.getDate();
    
    if (verifyYear !== y || verifyMonth !== m || verifyDay !== d) {
      console.error('[Test] Date creation mismatch!', {
        expected: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        got: `${verifyYear}-${String(verifyMonth).padStart(2, '0')}-${String(verifyDay).padStart(2, '0')}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    }

    // Create a function that returns the fixed date
    const createFixedDate = () => {
      const date = new OriginalDate(fixedTime);
      // Ensure all Date methods work correctly
      Object.setPrototypeOf(date, OriginalDate.prototype);
      return date;
    };
    
    // Store the fixed time for Date.now()
    const fixedTimeForNow = fixedTime;

    // Override Date constructor
    function DateConstructor(...args: any[]) {
      if (args.length === 0) {
        // new Date() - return fixed date
        return createFixedDate();
      } else if (args.length === 1) {
        if (typeof args[0] === 'string') {
          // new Date(dateString) - parse normally (but check if it's our date format)
          const parsed = OriginalDate.parse(args[0]);
          if (!isNaN(parsed)) {
            return new OriginalDate(parsed);
          }
          return new OriginalDate(args[0]);
        } else if (typeof args[0] === 'number') {
          // new Date(timestamp) - use original
          return new OriginalDate(args[0]);
        }
      } else {
        // new Date(year, month, ...) - use original
        // eslint-disable-next-line prefer-spread
        return new (OriginalDate as any)(...args);
      }
      // Fallback
      return new OriginalDate(...args);
    }

    // Copy prototype
    DateConstructor.prototype = OriginalDate.prototype;
    Object.setPrototypeOf(DateConstructor, OriginalDate);

    // Override static methods
    DateConstructor.now = () => fixedTime;
    DateConstructor.parse = OriginalDate.parse;
    DateConstructor.UTC = OriginalDate.UTC;

    // Replace the global Date
    // @ts-ignore
    window.Date = DateConstructor;
    // @ts-ignore
    globalThis.Date = DateConstructor;
    
    // Ensure getLocalDateString and getTimezoneAwareDateString work correctly
    // by overriding them to use the frozen date
    const testDateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    // Store original functions if they exist
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.__TEST_FROZEN_DATE_STRING__ = testDateStr;
    }
    
    // Verify it works immediately
    const testDate = new Date();
    const testYear = testDate.getFullYear();
    const testMonth = testDate.getMonth();
    const testDay = testDate.getDate();
    
    if (testYear !== y || testMonth !== m - 1 || testDay !== d) {
      console.error('[Test] Date freezing verification failed!', {
        expected: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        got: `${testYear}-${String(testMonth + 1).padStart(2, '0')}-${String(testDay).padStart(2, '0')}`,
        timestamp: fixedTime
      });
    } else {
      console.log('[Test] Date successfully frozen to:', dateStr);
    }
    
    // Also verify Date.now()
    const nowTime = Date.now();
    if (Math.abs(nowTime - fixedTime) > 1000) {
      console.warn('[Test] Date.now() may not be frozen correctly', {
        expected: fixedTime,
        got: nowTime,
        diff: Math.abs(nowTime - fixedTime)
      });
    }
  }, dateString);
  
  // Verify the date is frozen after page loads
  // This will be called in waitForPageLoad
}

/**
 * Ensure IndexedDB is available and initialized
 * This is called after navigation when IndexedDB should be available
 */
export async function ensureIndexedDBReady(page: Page) {
  // Only check IndexedDB after page has loaded
  // IndexedDB might not be available in init scripts
  try {
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        if (!window.indexedDB) {
          // IndexedDB not available - app should handle this gracefully
          resolve();
          return;
        }
        
        // Try to open a test database to ensure IndexedDB is ready
        try {
          const request = indexedDB.open('__test_db__', 1);
          request.onsuccess = () => {
            request.result.close();
            indexedDB.deleteDatabase('__test_db__');
            resolve();
          };
          request.onerror = () => {
            // IndexedDB might not be available in some test environments
            // Continue anyway - the app should handle this gracefully
            resolve();
          };
          request.onblocked = () => {
            resolve();
          };
        } catch (error) {
          // IndexedDB access denied or not available
          // This is OK - the app should work without it (uses core biases)
          resolve();
        }
      });
    });
  } catch (error) {
    // IndexedDB might not be available in test context
    // This is OK - the app should handle this gracefully
    // Core biases are loaded synchronously, so the app should still work
  }
}

/**
 * Setup page for E2E tests - skip onboarding and freeze date
 */
export async function setupTestPage(page: Page, dateString: string = '2025-12-05') {
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
  
  // Also freeze date using a second init script as a backup
  // This ensures the date is frozen even if the first script doesn't run
  await page.addInitScript((dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    // Create date at noon (12:00:00) in local timezone to avoid timezone edge cases
    const fixedDateObj = new Date(y, m - 1, d, 12, 0, 0, 0);
    const fixedTime = fixedDateObj.getTime();
    
    // Verify the date is correct
    const verifyDate = new Date(fixedTime);
    if (verifyDate.getFullYear() !== y || verifyDate.getMonth() + 1 !== m || verifyDate.getDate() !== d) {
      console.warn('[Test] Backup date freeze verification failed', {
        expected: dateStr,
        got: `${verifyDate.getFullYear()}-${String(verifyDate.getMonth() + 1).padStart(2, '0')}-${String(verifyDate.getDate()).padStart(2, '0')}`
      });
    }
    
    // Override Date.now() first (most commonly used)
    const OriginalDate = window.Date;
    // Always override to ensure consistency
    OriginalDate.now = () => fixedTime;
    
    // Override Date constructor only if not already overridden
    if (!window.Date.toString().includes('DateConstructor')) {
    // @ts-ignore
    window.Date = function(...args: any[]) {
      if (args.length === 0) {
        return new OriginalDate(fixedTime);
      }
      // @ts-ignore
      return new OriginalDate(...args);
    };
    
    // Copy prototype and static methods
    Object.setPrototypeOf(window.Date, OriginalDate);
    window.Date.prototype = OriginalDate.prototype;
    window.Date.parse = OriginalDate.parse;
    window.Date.UTC = OriginalDate.UTC;
    window.Date.now = () => fixedTime;
    }
  }, dateString);
  
  // Note: IndexedDB check is done after navigation when it's available
  // We don't check it here because it's not available in init scripts
}

/**
 * Wait for biases to load by checking if loading state is gone
 */
export async function waitForBiasesToLoad(page: Page) {
  // First, wait for the page to be ready
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
    // Continue even if networkidle times out
  });
  
  // Give the app time to initialize and load biases
  // Core biases should be available immediately, but we need to wait for React to hydrate
  await page.waitForTimeout(2000);
  
  // Check if biases are loaded by evaluating in page context
  // This helps ensure the module has loaded before we check for the bias card
  let biasesAvailable = false;
  try {
    biasesAvailable = await page.evaluate(() => {
      // Try to check if biases are available by looking for bias-related functionality
      // The app should have biases loaded from the module
      try {
        // Check if we can access bias data through the window or document
        // This is a workaround to ensure modules are loaded
        return document.body !== null && typeof window !== 'undefined';
      } catch {
        return false;
      }
    });
  } catch {
    // Continue even if evaluation fails
  }
  
  // Check if biases are actually loaded by looking for the bias card or checking for errors
  const hasError = await page.locator('text=Unable to load daily bias').count();
  const hasBiasCard = await page.locator('[data-testid="bias-card"]').count();
  
  // If there's an error and no bias card, wait a bit more and check again
  // Sometimes the app needs more time to load biases
  if (hasError > 0 && hasBiasCard === 0) {
    console.log('[Test] Detected error, waiting longer for biases to load');
    await page.waitForTimeout(3000);
    
    // Check again after waiting
    const retryHasBiasCard = await page.locator('[data-testid="bias-card"]').count();
    const retryHasError = await page.locator('text=Unable to load daily bias').count();
    
    // If still failing, try reloading once
    if (retryHasError > 0 && retryHasBiasCard === 0) {
      console.log('[Test] Still failing, reloading page to retry bias loading');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000);
    }
  }
  
  // Wait for Next.js to be fully ready by checking for React hydration
  // This ensures all modules are loaded before we check for biases
  await page.waitForFunction(() => {
    // Check if React has hydrated by looking for interactive elements
    return document.querySelector('main') !== null && 
           document.querySelector('[data-testid="bottom-navigation"]') !== null;
  }, { timeout: 15000 }).catch(() => {
    // Continue even if this check fails
  });
  
  // Additional wait to ensure all modules are loaded
  await page.waitForTimeout(2000);
  
  // Simply wait for the bias card to appear - that's the best indicator that loading is done
  // Don't try to check loading state as it might be flaky
  try {
    await page.waitForSelector('[data-testid="bias-card"]', { 
      state: 'attached', 
      timeout: 30000 
    });
  } catch (error) {
    // If bias card doesn't appear, check what's on the page for debugging
    try {
      // Get console logs for debugging
      const consoleLogs = await page.evaluate(() => {
        // This won't capture logs that already happened, but helps with future debugging
        return 'Console logs not available in evaluate';
      });
      
      // Check page state
      const loadingElements = await page.locator('text=Loading daily bias').count();
      const errorElements = await page.locator('text=Unable to load').count();
      const hasBiasCard = await page.locator('[data-testid="bias-card"]').count();
      
      // Try to get more info about what's happening
      const pageInfo = await page.evaluate(() => {
        const statusEls = Array.from(document.querySelectorAll('[role="status"]'));
        return {
          statusTexts: statusEls.map(el => el.textContent),
          hasMain: !!document.querySelector('main'),
          bodyText: document.body.innerText.substring(0, 200)
        };
      });
      
      console.log('[Test Debug] Page state:', {
        loadingElements,
        errorElements,
        hasBiasCard,
        pageInfo
      });
      
      if (loadingElements > 0) {
        throw new Error(`Page stuck in loading state - biases may not be loading. Status texts: ${pageInfo.statusTexts.join(', ')}`);
      }
      if (errorElements > 0) {
        throw new Error('Page shows error - unable to load daily bias');
      }
      // If neither loading nor error, just throw the original timeout
      throw error;
    } catch (checkError) {
      throw checkError;
    }
  }
}

/**
 * Wait for the bias card to be visible and loaded
 */
export async function waitForBiasCard(page: Page) {
  // First, wait a bit for the app to initialize and biases to load
  // This helps with the "No bias available" error by giving the app time to load core biases
  await page.waitForTimeout(1000);
  
  // Wait for bias card to be attached to DOM (biases loaded)
  await waitForBiasesToLoad(page);
  
  // Wait for bias card to be visible
  await page.waitForSelector('[data-testid="bias-card"]', { state: 'visible', timeout: 15000 });
  
  // Wait for card content (title) to be visible
  const biasCard = page.locator('[data-testid="bias-card"]');
  await expect(biasCard.locator('h1, h3, h2, #bias-title').first()).toBeVisible({ timeout: 10000 });
  
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
  await page.waitForTimeout(1000);
  
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
    await page.waitForTimeout(1000);
  }
  
  // Additional wait for app context to initialize (biases loading, etc.)
  await page.waitForTimeout(500);
  
  // Try to ensure IndexedDB is ready (after page load when it should be available)
  await ensureIndexedDBReady(page).catch(() => {
    // Ignore errors - IndexedDB might not be available, but core biases should still work
  });
  
  // Verify date is frozen (for debugging)
  try {
    const currentDate = await page.evaluate(() => {
      const now = new Date();
      const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        dateString,
        timestamp: now.getTime(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
    });
    // Log for debugging (expected date should be from setupTestPage call)
    console.log('[Test] Current frozen date:', currentDate.dateString, 'Timezone:', currentDate.timezone);
  } catch (error) {
    // Ignore - date verification is just for debugging
  }
}

