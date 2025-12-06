import { test, expect } from '@playwright/test';
import { setupTestPage, waitForPageLoad } from './helpers';

test.describe('Add Page Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await setupTestPage(page, '2025-12-05');
    await page.goto('/add', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page, '/add');
  });

  test('add page loads and shows form', async ({ page }) => {
    await test.step('Verify page heading', async () => {
      const heading = page.locator('main h1, [id="main-content"] h1').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
      await expect(heading).toContainText(/Your Biases|Add|Create/i);
    });

    await test.step('Verify add button is visible', async () => {
      const addButton = page.getByRole('button', { name: /add|create|new/i });
      await expect(addButton.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test('can create a custom bias', async ({ page }) => {
    await test.step('Open add dialog', async () => {
      // Find the add button using aria-label - use first() to handle multiple matches
      const addButton = page.getByRole('button', { name: /add.*bias|add.*first/i }).first();
      await expect(addButton).toBeVisible({ timeout: 10000 });
      
      // Scroll button into view and wait a bit
      await addButton.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      
      // Click the button
      await addButton.click({ force: false });
      
      // Wait for dialog to open - Radix UI Dialog renders in a portal, so wait for it
      // Check for dialog content or overlay
      await page.waitForTimeout(500);
      
      // Try multiple ways to detect the dialog
      const dialog = page.getByRole('dialog').or(
        page.locator('[role="dialog"]')
      ).or(
        page.locator('text=/Add New Bias|Edit Bias/i').locator('..')
      );
      
      await expect(dialog.first()).toBeVisible({ timeout: 15000 });
      
      // Verify dialog title
      const dialogTitle = page.getByRole('heading', { name: /add.*bias|new.*bias/i });
      await expect(dialogTitle.first()).toBeVisible({ timeout: 5000 });
    });

    await test.step('Fill in bias form', async () => {
      // Fill title - use ID selector which is more reliable
      const titleInput = page.locator('#title').or(page.getByLabel(/title/i));
      await expect(titleInput.first()).toBeVisible({ timeout: 10000 });
      await titleInput.first().fill('Test Bias Title E2E');

      // Fill summary - use ID selector
      const summaryInput = page.locator('#summary').or(page.getByLabel(/summary/i));
      await expect(summaryInput.first()).toBeVisible({ timeout: 10000 });
      await summaryInput.first().fill('This is a test bias summary for E2E testing.');

      // Category is already set to "misc" by default, so we can skip it
      await page.waitForTimeout(500);
    });

    await test.step('Submit form', async () => {
      // Find submit button - look for button with "Add" or "Save" text in dialog
      const dialog = page.getByRole('dialog');
      const submitButton = dialog.getByRole('button', { name: /add|save|create/i }).first();
      await expect(submitButton).toBeVisible({ timeout: 5000 });
      await submitButton.click();
      
      // Wait for dialog to close
      await expect(dialog).not.toBeVisible({ timeout: 10000 });
    });

    await test.step('Verify bias appears in list', async () => {
      // Wait a bit for the bias to be added and page to update
      await page.waitForTimeout(3000);
      
      // Look for the bias card with the title we just created
      // The bias might be in a list, so check for h3 or any heading with the title
      const biasCard = page.locator('h3, h2, h1').filter({ 
        hasText: 'Test Bias Title E2E' 
      }).or(
        page.locator('*').filter({ hasText: 'Test Bias Title E2E' })
      );
      await expect(biasCard.first()).toBeVisible({ timeout: 20000 });
    });
  });

  test('form validation works', async ({ page }) => {
    await test.step('Open add dialog', async () => {
      const addButton = page.getByRole('button', { name: /add.*bias|add.*first/i }).first();
      await expect(addButton).toBeVisible({ timeout: 10000 });
      
      // Scroll button into view
      await addButton.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      
      await addButton.click({ force: false });
      
      await page.waitForTimeout(500);
      
      // Try multiple ways to detect the dialog
      const dialog = page.getByRole('dialog').or(
        page.locator('[role="dialog"]')
      ).or(
        page.locator('text=/Add New Bias|Edit Bias/i').locator('..')
      );
      
      await expect(dialog.first()).toBeVisible({ timeout: 15000 });
    });

    await test.step('Try to submit empty form', async () => {
      const dialog = page.getByRole('dialog');
      const submitButton = dialog.getByRole('button', { name: /add|save|create/i }).first();
      await expect(submitButton).toBeVisible({ timeout: 5000 });
      
      // Try to click submit - form should show validation errors
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      // Wait for validation error to appear (title is required)
      const errorMessage = page.locator('text=/required|invalid|error/i').or(
        page.locator('.text-destructive')
      );
      const errorCount = await errorMessage.count();
      
      // Should have at least one validation error
      expect(errorCount).toBeGreaterThan(0);
    });
  });
});

