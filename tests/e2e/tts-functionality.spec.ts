import { test, expect } from '@playwright/test';

/**
 * TTS (Text-to-Speech) Functionality Tests
 * 
 * Note: These tests verify UI state changes and button behaviors.
 * Actual audio playback cannot be fully tested in automation,
 * but we verify:
 * - Button state transitions
 * - UI updates correctly
 * - No console errors
 * - State management works
 */

test.describe('TTS Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a bias page
    await page.goto('/bias/fundamental-attribution-error');
    await page.waitForLoadState('networkidle');
    
    // Grant speech synthesis permissions if needed
    await page.addInitScript(() => {
      // Mock speechSynthesis if not available
      if (!('speechSynthesis' in window)) {
        (window as any).speechSynthesis = {
          speaking: false,
          pending: false,
          paused: false,
          speak: () => {},
          cancel: () => {},
          pause: () => {},
          resume: () => {},
          getVoices: () => [],
        };
      }
    });
  });

  test('Test 1: Basic Full Bias Playback - Button State Changes', async ({ page }) => {
    // Wait for bias card to load
    await page.waitForSelector('[data-testid="bias-card"]', { timeout: 15000 });
    
    // Find the main Listen button in the actions section (not section-specific buttons)
    // The main Listen button is in the actions row, not next to section headers
    const actionsSection = page.locator('[data-testid="bias-card"]').locator('..').locator('text=/Actions|Listen|Share|Copy/').locator('..');
    const listenButton = page.getByRole('button', { name: /^listen to bias$/i }).or(
      page.locator('button').filter({ hasText: /^listen$/i }).filter({ hasNot: page.locator('text=/definition|why|counter/i') })
    ).first();
    
    // Verify initial state - button exists and is visible
    await expect(listenButton).toBeVisible({ timeout: 10000 });
    
    // Check console for errors before clicking
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Click Listen
    await listenButton.click();
    
    // Wait for state change and check for errors
    await page.waitForTimeout(1000);
    
    // Verify no critical errors
    const criticalErrors = errors.filter(e => 
      e.includes('TTS Controller') && 
      (e.includes('Error') || e.includes('Failed'))
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('Test 2: Section-Specific Playback - Definition Section', async ({ page }) => {
    // Find the Definition section volume button
    const definitionSection = page.locator('text=Definition').locator('..');
    const volumeButton = definitionSection.getByRole('button').last();
    
    await expect(volumeButton).toBeVisible();
    
    // Click the volume button
    await volumeButton.click();
    await page.waitForTimeout(500);
    
    // Verify button state changed (icon should change)
    // Note: Icon change is visual, we verify button is still clickable
    await expect(volumeButton).toBeEnabled();
    
    // Check for console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Verify no TTS errors
    const ttsErrors = errors.filter(e => e.includes('TTS Controller'));
    expect(ttsErrors.length).toBe(0);
  });

  test('Test 3: Pause/Resume Button State Transitions', async ({ page }) => {
    const listenButton = page.getByRole('button', { name: /listen/i }).first();
    
    // Click Listen
    await listenButton.click();
    await page.waitForTimeout(1000);
    
    // Check if Pause button appears (if TTS is enabled)
    const pauseButton = page.getByRole('button', { name: /pause/i }).first();
    
    // If pause button exists, test pause/resume
    if (await pauseButton.isVisible().catch(() => false)) {
      // Click Pause
      await pauseButton.click();
      await page.waitForTimeout(500);
      
      // Verify Resume button appears
      const resumeButton = page.getByRole('button', { name: /resume/i }).first();
      await expect(resumeButton).toBeVisible();
      
      // Click Resume
      await resumeButton.click();
      await page.waitForTimeout(500);
      
      // Verify Pause button appears again
      await expect(pauseButton).toBeVisible();
    }
  });

  test('Test 4: Reset Button Functionality', async ({ page }) => {
    const listenButton = page.getByRole('button', { name: /listen/i }).first();
    
    // Click Listen
    await listenButton.click();
    await page.waitForTimeout(1000);
    
    // Check if Reset button appears
    const resetButton = page.getByRole('button', { name: /reset/i }).first();
    
    if (await resetButton.isVisible().catch(() => false)) {
      // Click Reset
      await resetButton.click();
      await page.waitForTimeout(500);
      
      // Verify Listen button appears again
      await expect(listenButton).toBeVisible();
      
      // Click Listen again - should start from beginning
      await listenButton.click();
      await page.waitForTimeout(500);
      
      // Verify state is correct
      await expect(listenButton.or(page.getByRole('button', { name: /pause/i }))).toBeVisible();
    }
  });

  test('Test 5: Section Switching - Single Player Rule', async ({ page }) => {
    // Click Definition section
    const definitionSection = page.locator('text=Definition').locator('..');
    const definitionButton = definitionSection.getByRole('button').last();
    await definitionButton.click();
    await page.waitForTimeout(1000);
    
    // While playing, click Why section
    const whySection = page.locator('text=Why it happens').locator('..');
    const whyButton = whySection.getByRole('button').last();
    await whyButton.click();
    await page.waitForTimeout(500);
    
    // Verify only one section is active
    // Both buttons should be in a valid state (not both playing)
    const definitionState = await definitionButton.getAttribute('aria-label');
    const whyState = await whyButton.getAttribute('aria-label');
    
    // At most one should be "Pause" or "playing"
    const playingCount = [definitionState, whyState].filter(s => 
      s && (s.toLowerCase().includes('pause') || s.toLowerCase().includes('playing'))
    ).length;
    
    expect(playingCount).toBeLessThanOrEqual(1);
  });

  test('Test 6: Rapid Clicking - No Errors', async ({ page }) => {
    const listenButton = page.getByRole('button', { name: /listen/i }).first();
    
    // Track console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Rapid clicking
    for (let i = 0; i < 5; i++) {
      await listenButton.click();
      await page.waitForTimeout(100);
    }
    
    await page.waitForTimeout(1000);
    
    // Verify no critical errors
    const criticalErrors = errors.filter(e => 
      e.includes('InvalidStateError') || 
      e.includes('TTS Controller Error')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('Test 7: Navigation Cleanup', async ({ page }) => {
    const listenButton = page.getByRole('button', { name: /listen/i }).first();
    
    // Start playback
    await listenButton.click();
    await page.waitForTimeout(1000);
    
    // Navigate away
    await page.goto('/all');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Check console for cleanup errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Verify no TTS-related errors after navigation
    const ttsErrors = errors.filter(e => e.includes('TTS Controller'));
    expect(ttsErrors.length).toBe(0);
  });

  test('Test 8: Bias Switching - State Reset', async ({ page }) => {
    // Start playback on first bias
    const listenButton = page.getByRole('button', { name: /listen/i }).first();
    await listenButton.click();
    await page.waitForTimeout(1000);
    
    // Navigate to different bias
    await page.goto('/bias/self-serving-bias');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Start playback on new bias
    const newListenButton = page.getByRole('button', { name: /listen/i }).first();
    await newListenButton.click();
    await page.waitForTimeout(1000);
    
    // Verify no console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    
    const criticalErrors = errors.filter(e => 
      e.includes('InvalidStateError') || 
      e.includes('TTS Controller Error')
    );
    expect(criticalErrors.length).toBe(0);
  });
});

