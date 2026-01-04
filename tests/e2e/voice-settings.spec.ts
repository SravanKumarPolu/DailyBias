import { test, expect } from '@playwright/test';
import { setupTestPage, waitForNavigation, waitForPageLoad } from './helpers';

test.describe('Voice Settings Feature', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await setupTestPage(page, '2025-12-05');
    await page.goto('/');
    await waitForPageLoad(page, '/');
    await waitForNavigation(page);
  });

  test('should display voice settings section correctly', async ({ page }) => {
    await test.step('Navigate to Settings', async () => {
      await page.goto('/settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await waitForPageLoad(page, '/settings');
      await page.waitForTimeout(2000);
    });

    await test.step('Verify Voice Settings section is visible', async () => {
      const voiceSection = page.locator('h2').filter({ hasText: /Voice Settings/i });
      await expect(voiceSection).toBeVisible({ timeout: 10000 });
      
      // Verify subtitle
      const subtitle = page.locator('text=Text-to-speech preferences');
      await expect(subtitle).toBeVisible();
    });

    await test.step('Verify Enable Voice toggle exists', async () => {
      const enableVoiceToggle = page.locator('[data-testid="setting-voice-enabled"]');
      await expect(enableVoiceToggle).toBeVisible({ timeout: 10000 });
    });
  });

  test('should toggle Enable Voice setting', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForPageLoad(page, '/settings');
    await page.waitForTimeout(2000);

    const enableVoiceToggle = page.locator('[data-testid="setting-voice-enabled"]');
    await expect(enableVoiceToggle).toBeVisible({ timeout: 10000 });
    await enableVoiceToggle.scrollIntoViewIfNeeded();

    // Get initial state
    const initialChecked = await enableVoiceToggle.isChecked();

    // Toggle the setting
    await enableVoiceToggle.click({ force: false });
    await page.waitForTimeout(1000);

    // Verify state changed
    const afterToggle = await enableVoiceToggle.isChecked();
    expect(afterToggle).toBe(!initialChecked);

    // Toggle back
    await enableVoiceToggle.click({ force: false });
    await page.waitForTimeout(1000);

    const afterSecondToggle = await enableVoiceToggle.isChecked();
    expect(afterSecondToggle).toBe(initialChecked);
  });

  test('should show voice controls when voice is enabled', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForPageLoad(page, '/settings');
    await page.waitForTimeout(2000);

    const enableVoiceToggle = page.locator('[data-testid="setting-voice-enabled"]');
    await enableVoiceToggle.scrollIntoViewIfNeeded();

    // Enable voice if not already enabled
    const isChecked = await enableVoiceToggle.isChecked();
    if (!isChecked) {
      await enableVoiceToggle.click({ force: false });
      await page.waitForTimeout(1000);
    }

    // Verify voice controls are visible
    const voiceSelect = page.locator('button[id="voice-select"], [id="voice-select"]');
    await expect(voiceSelect).toBeVisible({ timeout: 5000 });

    // Verify Currently Active Voice section exists
    const activeVoiceSection = page.locator('text=Currently Active Voice:');
    await expect(activeVoiceSection).toBeVisible({ timeout: 5000 });

    // Verify speech rate slider exists
    const speechRateSlider = page.locator('input[type="range"][id="voice-rate"]');
    await expect(speechRateSlider).toBeVisible({ timeout: 5000 });

    // Verify pitch slider exists
    const pitchSlider = page.locator('input[type="range"][id="voice-pitch"]');
    await expect(pitchSlider).toBeVisible({ timeout: 5000 });
  });

  test('should hide voice controls when voice is disabled', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForPageLoad(page, '/settings');
    await page.waitForTimeout(2000);

    const enableVoiceToggle = page.locator('[data-testid="setting-voice-enabled"]');
    await enableVoiceToggle.scrollIntoViewIfNeeded();

    // Disable voice if enabled
    const isChecked = await enableVoiceToggle.isChecked();
    if (isChecked) {
      await enableVoiceToggle.click({ force: false });
      await page.waitForTimeout(1000);
    }

    // Verify voice controls are NOT visible
    const voiceSelect = page.locator('button[id="voice-select"]').first();
    await expect(voiceSelect).not.toBeVisible({ timeout: 2000 });
  });

  test('should display Reset button when voice is enabled', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForPageLoad(page, '/settings');
    await page.waitForTimeout(2000);

    const enableVoiceToggle = page.locator('[data-testid="setting-voice-enabled"]');
    await enableVoiceToggle.scrollIntoViewIfNeeded();

    // Enable voice if not already enabled
    const isChecked = await enableVoiceToggle.isChecked();
    if (!isChecked) {
      await enableVoiceToggle.click({ force: false });
      await page.waitForTimeout(1000);
    }

    // Verify Reset button exists
    const resetButton = page.locator('button').filter({ hasText: /Reset/i }).filter({ hasText: /Reset/i });
    await expect(resetButton.first()).toBeVisible({ timeout: 5000 });
  });

  test('should open voice selection popover', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForPageLoad(page, '/settings');
    await page.waitForTimeout(3000);

    const enableVoiceToggle = page.locator('[data-testid="setting-voice-enabled"]');
    await enableVoiceToggle.scrollIntoViewIfNeeded();

    // Enable voice if not already enabled
    const isChecked = await enableVoiceToggle.isChecked();
    if (!isChecked) {
      await enableVoiceToggle.click({ force: false });
      await page.waitForTimeout(1000);
    }

    // Click on voice select button
    const voiceSelectButton = page.locator('button[id="voice-select"]').first();
    await expect(voiceSelectButton).toBeVisible({ timeout: 5000 });
    await voiceSelectButton.click();
    await page.waitForTimeout(1000);

    // Verify popover is open
    const voicePopover = page.locator('text=Select a voice');
    await expect(voicePopover).toBeVisible({ timeout: 5000 });

    // Verify search input exists
    const searchInput = page.locator('input[id="voice-search"]');
    await expect(searchInput).toBeVisible({ timeout: 3000 });
  });

  test('should display device type in Currently Active Voice section', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForPageLoad(page, '/settings');
    await page.waitForTimeout(3000);

    const enableVoiceToggle = page.locator('[data-testid="setting-voice-enabled"]');
    await enableVoiceToggle.scrollIntoViewIfNeeded();

    // Enable voice if not already enabled
    const isChecked = await enableVoiceToggle.isChecked();
    if (!isChecked) {
      await enableVoiceToggle.click({ force: false });
      await page.waitForTimeout(1000);
    }

    // Verify device type is displayed (should be Desktop or Mobile)
    const deviceText = page.locator('text=/Device: (Desktop|Mobile)/i');
    await expect(deviceText).toBeVisible({ timeout: 5000 });
  });

  test('should adjust speech rate slider', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForPageLoad(page, '/settings');
    await page.waitForTimeout(3000);

    const enableVoiceToggle = page.locator('[data-testid="setting-voice-enabled"]');
    await enableVoiceToggle.scrollIntoViewIfNeeded();

    // Enable voice if not already enabled
    const isChecked = await enableVoiceToggle.isChecked();
    if (!isChecked) {
      await enableVoiceToggle.click({ force: false });
      await page.waitForTimeout(1000);
    }

    const speechRateSlider = page.locator('input[type="range"][id="voice-rate"]');
    await expect(speechRateSlider).toBeVisible({ timeout: 5000 });
    await speechRateSlider.scrollIntoViewIfNeeded();

    // Get initial value
    const initialValue = await speechRateSlider.inputValue();
    
    // Change the value
    await speechRateSlider.fill('1.2');
    await page.waitForTimeout(500);

    // Verify value changed
    const newValue = await speechRateSlider.inputValue();
    expect(parseFloat(newValue)).toBeGreaterThan(parseFloat(initialValue));
  });

  test('should adjust pitch slider', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForPageLoad(page, '/settings');
    await page.waitForTimeout(3000);

    const enableVoiceToggle = page.locator('[data-testid="setting-voice-enabled"]');
    await enableVoiceToggle.scrollIntoViewIfNeeded();

    // Enable voice if not already enabled
    const isChecked = await enableVoiceToggle.isChecked();
    if (!isChecked) {
      await enableVoiceToggle.click({ force: false });
      await page.waitForTimeout(1000);
    }

    const pitchSlider = page.locator('input[type="range"][id="voice-pitch"]');
    await expect(pitchSlider).toBeVisible({ timeout: 5000 });
    await pitchSlider.scrollIntoViewIfNeeded();

    // Get initial value
    const initialValue = await pitchSlider.inputValue();
    
    // Change the value
    await pitchSlider.fill('1.2');
    await page.waitForTimeout(500);

    // Verify value changed
    const newValue = await pitchSlider.inputValue();
    expect(parseFloat(newValue)).toBeGreaterThan(parseFloat(initialValue));
  });

  test('should display speech rate and pitch labels with values', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForPageLoad(page, '/settings');
    await page.waitForTimeout(3000);

    const enableVoiceToggle = page.locator('[data-testid="setting-voice-enabled"]');
    await enableVoiceToggle.scrollIntoViewIfNeeded();

    // Enable voice if not already enabled
    const isChecked = await enableVoiceToggle.isChecked();
    if (!isChecked) {
      await enableVoiceToggle.click({ force: false });
      await page.waitForTimeout(1000);
    }

    // Verify speech rate label displays value
    const speechRateLabel = page.locator('label[for="voice-rate"]');
    await expect(speechRateLabel).toBeVisible({ timeout: 5000 });
    const rateLabelText = await speechRateLabel.textContent();
    expect(rateLabelText).toMatch(/Speech Rate: \d+\.\d+x/i);

    // Verify pitch label displays value
    const pitchLabel = page.locator('label[for="voice-pitch"]');
    await expect(pitchLabel).toBeVisible({ timeout: 5000 });
    const pitchLabelText = await pitchLabel.textContent();
    expect(pitchLabelText).toMatch(/Pitch: \d+\.\d+x/i);
  });

  test('should show Test Current Voice and Test Voice buttons', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForPageLoad(page, '/settings');
    await page.waitForTimeout(3000);

    const enableVoiceToggle = page.locator('[data-testid="setting-voice-enabled"]');
    await enableVoiceToggle.scrollIntoViewIfNeeded();

    // Enable voice if not already enabled
    const isChecked = await enableVoiceToggle.isChecked();
    if (!isChecked) {
      await enableVoiceToggle.click({ force: false });
      await page.waitForTimeout(1000);
    }

    // Verify Test Current Voice button exists
    const testCurrentVoiceButton = page.locator('button').filter({ hasText: /Test Current Voice/i });
    await expect(testCurrentVoiceButton).toBeVisible({ timeout: 5000 });

    // Verify Test Voice button exists
    const testVoiceButton = page.locator('button').filter({ hasText: /Test voice/i });
    await expect(testVoiceButton).toBeVisible({ timeout: 5000 });
  });

  test('should show Refresh voices button', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForPageLoad(page, '/settings');
    await page.waitForTimeout(3000);

    const enableVoiceToggle = page.locator('[data-testid="setting-voice-enabled"]');
    await enableVoiceToggle.scrollIntoViewIfNeeded();

    // Enable voice if not already enabled
    const isChecked = await enableVoiceToggle.isChecked();
    if (!isChecked) {
      await enableVoiceToggle.click({ force: false });
      await page.waitForTimeout(1000);
    }

    // Verify Refresh voices button exists
    const refreshButton = page.locator('button').filter({ hasText: /Refresh voices/i });
    await expect(refreshButton).toBeVisible({ timeout: 5000 });
  });

  test('should display high-quality voice indicator note', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForPageLoad(page, '/settings');
    await page.waitForTimeout(3000);

    const enableVoiceToggle = page.locator('[data-testid="setting-voice-enabled"]');
    await enableVoiceToggle.scrollIntoViewIfNeeded();

    // Enable voice if not already enabled
    const isChecked = await enableVoiceToggle.isChecked();
    if (!isChecked) {
      await enableVoiceToggle.click({ force: false });
      await page.waitForTimeout(1000);
    }

    // Verify the star indicator note exists
    const starNote = page.locator('text=/indicates high-quality local voices/i');
    await expect(starNote).toBeVisible({ timeout: 5000 });
  });

  test('should persist voice settings after page reload', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForPageLoad(page, '/settings');
    await page.waitForTimeout(3000);

    const enableVoiceToggle = page.locator('[data-testid="setting-voice-enabled"]');
    await enableVoiceToggle.scrollIntoViewIfNeeded();

    // Enable voice and adjust settings
    const initialChecked = await enableVoiceToggle.isChecked();
    if (!initialChecked) {
      await enableVoiceToggle.click({ force: false });
      await page.waitForTimeout(1000);
    }

    // Adjust speech rate
    const speechRateSlider = page.locator('input[type="range"][id="voice-rate"]');
    await speechRateSlider.fill('1.1');
    await page.waitForTimeout(500);

    // Reload page
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page, '/settings');
    await page.waitForTimeout(3000);

    // Verify settings persisted
    const reloadedToggle = page.locator('[data-testid="setting-voice-enabled"]');
    await expect(reloadedToggle).toBeVisible({ timeout: 10000 });
    const reloadedChecked = await reloadedToggle.isChecked();
    expect(reloadedChecked).toBe(true);

    const reloadedSlider = page.locator('input[type="range"][id="voice-rate"]');
    const reloadedValue = await reloadedSlider.inputValue();
    expect(parseFloat(reloadedValue)).toBe(1.1);
  });
});
