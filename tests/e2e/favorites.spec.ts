import { test, expect } from '@playwright/test';
import { setupTestPage, waitForBiasCard, waitForNavigation, waitForPageLoad } from './helpers';

test.describe('Favorites Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear storage before each test for better isolation
    await context.clearCookies();
    await context.clearPermissions();

    // Setup page first to get the proper context
    await setupTestPage(page, '2025-12-05');
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Clear localStorage and IndexedDB after page loads
    await page.evaluate(async () => {
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();

      // Clear IndexedDB - the app uses 'bias-daily-db'
      try {
        const deleteReq = indexedDB.deleteDatabase('bias-daily-db');
        await new Promise<void>((resolve) => {
          deleteReq.onsuccess = () => resolve();
          deleteReq.onerror = () => resolve(); // Ignore errors if database doesn't exist
          deleteReq.onblocked = () => resolve();
          // Timeout after 1 second
          setTimeout(() => resolve(), 1000);
        });
      } catch (error) {
        // Ignore errors
      }
    });

    // Re-setup onboarding skip after clearing storage
    await page.evaluate(() => {
      localStorage.setItem('onboarding-completed', 'true');
    });

    await waitForPageLoad(page, '/');
    await waitForBiasCard(page);
    await waitForNavigation(page);
  });

  test('favorite flow and persistence', async ({ page }) => {
    let biasTitle: string;

    await test.step('Get initial bias title', async () => {
      const biasCard = page.locator('[data-testid="bias-card"]');
      await expect(biasCard).toBeVisible();

      // Get the bias title for later verification
      const titleElement = biasCard.locator('h1, h3').first();
      await expect(titleElement).toBeVisible();
      biasTitle = await titleElement.textContent() || '';
      expect(biasTitle.length).toBeGreaterThan(0);
    });

    await test.step('Favorite the current bias', async () => {
      const favoriteButton = page.locator('[data-testid="bias-favorite-button"]');
      await expect(favoriteButton).toBeVisible();

      // Verify button is not already favorited (heart should not be filled initially)
      const heartIcon = favoriteButton.locator('svg');
      const initialFill = await heartIcon.getAttribute('class');
      const isInitiallyFavorited = initialFill?.includes('fill-destructive') || false;

      // Click to favorite
      await favoriteButton.click();

      // Wait for favorite state to update - verify heart is now filled
      await expect(async () => {
        const heartIconAfter = favoriteButton.locator('svg');
        const classAfter = await heartIconAfter.getAttribute('class');
        const isFavorited = classAfter?.includes('fill-destructive') || false;
        expect(isFavorited).toBe(!isInitiallyFavorited);
      }).toPass({ timeout: 5000 });

      // Wait a bit to ensure IndexedDB write is complete
      await page.waitForTimeout(2000);
    });

    await test.step('Navigate to Favorites page', async () => {
      // Verify navigation link exists
      const favoritesNavLink = page.locator('[data-testid="nav-favorites"]');
      await expect(favoritesNavLink).toBeVisible({ timeout: 10000 });

      // Use direct navigation
      await page.goto('/favorites', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL('/favorites');

      // Wait for the loading status to disappear
      const loading = page
        .getByRole('status')
        .filter({ hasText: /Loading favorites/i });

      // Ignore if it never appears, but if it does, wait until it hides
      try {
        await expect(loading).toBeHidden({ timeout: 15000 });
      } catch {
        // no-op - loading indicator might not appear or already gone
      }

      // Now the Favorites heading should actually be visible
      await expect(
        page.getByRole('heading', { name: /Favorites/i })
      ).toBeVisible({ timeout: 10000 });

      // Wait a bit more for favorites to load from IndexedDB
      await page.waitForTimeout(1000);
    });

    await test.step('Verify favorite appears on Favorites page', async () => {
      // Wait for at least one favorite card to be visible
      // The loading state should already be gone from the previous step
      // Favorites page uses Link components, so we need to look for the content inside
      await page.waitForTimeout(2000);

      // Try multiple selectors for bias cards - favorites might be in Links
      const biasCards = page.locator('[data-testid="bias-card"]').or(
        page.getByRole('article')
      ).or(
        page.locator('a').filter({ has: page.locator('h1, h2, h3') })
      );

      // Wait for at least one card to appear
      await expect(async () => {
        const count = await biasCards.count();
        expect(count).toBeGreaterThan(0);
      }).toPass({ timeout: 20000 });

      // Verify the card contains the bias title we favorited
      if (biasTitle) {
        // Look for the title text anywhere on the page - be more flexible with matching
        const titleElement = page.locator(`text=${biasTitle}`).or(
          page.locator('h1, h2, h3').filter({ hasText: new RegExp(biasTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') })
        ).or(
          page.getByText(biasTitle, { exact: false })
        );
        await expect(titleElement.first()).toBeVisible({ timeout: 15000 });
      }
    });

    await test.step('Reload page and verify favorite persists', async () => {
      // Wait a bit to ensure IndexedDB write is complete before reload
      await page.waitForTimeout(1500);

      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL('/favorites');

      // Wait for the loading status to disappear (same logic as navigation step)
      const loading = page
        .getByRole('status')
        .filter({ hasText: /Loading favorites/i });

      try {
        await expect(loading).toBeHidden({ timeout: 10000 });
      } catch {
        // no-op - loading indicator might not appear or already gone
      }

      // Now assert that at least one favorite card is visible (favorite persisted)
      // Try multiple selectors for bias cards
      await page.waitForTimeout(2000);

      const biasCards = page.locator('[data-testid="bias-card"]').or(
        page.getByRole('article')
      ).or(
        page.locator('a').filter({ has: page.locator('h1, h2, h3') })
      );

      await expect(async () => {
        const count = await biasCards.count();
        expect(count).toBeGreaterThan(0);
      }).toPass({ timeout: 20000 });

      // Verify the favorite persisted with the correct title
      if (biasTitle) {
        const titleElement = page.locator(`text=${biasTitle}`).or(
          page.locator('h1, h2, h3').filter({ hasText: new RegExp(biasTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') })
        ).or(
          page.getByText(biasTitle, { exact: false })
        );
        await expect(titleElement.first()).toBeVisible({ timeout: 15000 });
      }
    });
  }, { timeout: 60000 });

  test('unfavorite removes from favorites page', async ({ page }) => {
    await test.step('Favorite a bias', async () => {
      const favoriteButton = page.locator('[data-testid="bias-favorite-button"]');
      await expect(favoriteButton).toBeVisible();

      // Click to favorite
      await favoriteButton.click();

      // Wait for favorite state to update
      await expect(async () => {
        const heartIcon = favoriteButton.locator('svg');
        const classAfter = await heartIcon.getAttribute('class');
        const isFavorited = classAfter?.includes('fill-destructive') || false;
        expect(isFavorited).toBe(true);
      }).toPass({ timeout: 5000 });

      // Wait a bit to ensure IndexedDB write is complete
      await page.waitForTimeout(2000);
    });

    await test.step('Navigate to Favorites and verify it appears', async () => {
      // Wait a bit to ensure IndexedDB write is complete before navigating
      await page.waitForTimeout(2000);

      // Verify navigation link exists
      const favoritesNavLink = page.locator('[data-testid="nav-favorites"]');
      await expect(favoritesNavLink).toBeVisible({ timeout: 10000 });

      await page.goto('/favorites', { waitUntil: 'domcontentloaded', timeout: 45000 });
      await expect(page).toHaveURL('/favorites', { timeout: 20000 });

      // Wait for loading to finish
      const loading = page
        .getByRole('status')
        .filter({ hasText: /Loading favorites/i });

      try {
        await expect(loading).toBeHidden({ timeout: 15000 });
      } catch {
        // ignore if it was never shown
      }

      // Wait a bit more for favorites to load from IndexedDB
      await page.waitForTimeout(3000);

      // Now assert that at least one favorite card is visible
      // Favorites are wrapped in Link components with DynamicBiasCard inside
      // Wait a bit more for the favorites to load
      await page.waitForTimeout(2000);

      const biasCards = page.locator('[data-testid="bias-card"]').or(
        page.locator('a[href*="/bias/"]')
      ).or(
        page.locator('article')
      );

      await expect(async () => {
        const count = await biasCards.count();
        expect(count).toBeGreaterThan(0);
      }).toPass({ timeout: 25000 });
    });

    await test.step('Unfavorite from Favorites page', async () => {
      // Wait for the favorite button to be available
      const favoriteButton = page.locator('[data-testid="bias-favorite-button"]').first();
      await expect(favoriteButton).toBeVisible({ timeout: 15000 });

      // Get initial card count
      const initialCards = page.getByRole('article');
      const initialCount = await initialCards.count();
      expect(initialCount).toBeGreaterThan(0);

      // Wait a bit before clicking to ensure button is ready
      await page.waitForTimeout(1000);

      // Click to unfavorite
      await favoriteButton.click();

      // Wait for the heart icon to change (indicates the action worked)
      await expect(async () => {
        const heartIcon = favoriteButton.locator('svg').first();
        const classAfter = await heartIcon.getAttribute('class').catch(() => '');
        const isFavorited = classAfter?.includes('fill-destructive') || false;
        expect(isFavorited).toBe(false);
      }).toPass({ timeout: 10000 });

      // Wait for IndexedDB write to complete and page to re-render
      await page.waitForTimeout(3000);

      // Wait for the card to be removed or empty state to appear
      // The favorites list should update when a favorite is removed
      await expect(async () => {
        const biasCards = page.getByRole('article');
        const count = await biasCards.count();
        const emptyState = page.getByRole('heading', { name: /no favorites yet/i });
        const emptyStateVisible = await emptyState.isVisible().catch(() => false);

        // Either the count should be 0 OR the empty state should be visible
        expect(count === 0 || emptyStateVisible).toBe(true);
      }).toPass({ timeout: 20000 });
    });

    await test.step('Verify empty state appears', async () => {
      // Reload the page to ensure we see the updated state
      // Sometimes React state updates don't trigger a re-render immediately
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });

      // Wait for the page to load
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(2000);

      // Check if we're on the favorites page
      await expect(page).toHaveURL('/favorites', { timeout: 5000 });

      // Should show empty state message - the empty state uses h3 with "No favorites yet" text
      const emptyState = page.getByRole('heading', { name: /no favorites yet/i });

      // Wait for empty state to appear - it should show when favorites list is empty
      await expect(emptyState).toBeVisible({ timeout: 15000 });

      // Verify no bias cards are present
      const biasCards = page.locator('[data-testid="bias-card"]').or(
        page.getByRole('article')
      );
      const count = await biasCards.count();
      expect(count).toBe(0);
    });
  });
});

