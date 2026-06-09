import { test, expect } from "@playwright/test";

/**
 * Stubs window.speechSynthesis with a deterministic implementation so we can
 * assert play / pause / resume / stop state transitions without depending on
 * real platform voices (which are absent in CI Chromium).
 */
async function installSpeechStub(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    type Listener = (e: Event) => void;
    let speaking = false;
    let paused = false;
    let endTimer: ReturnType<typeof setTimeout> | null = null;
    let currentEnd: Listener | null = null;

    const testVoice = {
      name: "Test",
      lang: "en-US",
      voiceURI: "test",
      localService: true,
      default: true,
    };

    const stub = {
      get speaking() {
        return speaking;
      },
      get paused() {
        return paused;
      },
      get pending() {
        return false;
      },
      speak(utterance: SpeechSynthesisUtterance) {
        speaking = true;
        paused = false;
        currentEnd = utterance.onend as Listener | null;
        utterance.onstart?.(new Event("start") as SpeechSynthesisEvent);
        endTimer = setTimeout(() => {
          speaking = false;
          paused = false;
          currentEnd?.(new Event("end"));
        }, 1500);
      },
      pause() {
        if (speaking) paused = true;
      },
      resume() {
        if (speaking) paused = false;
      },
      cancel() {
        speaking = false;
        paused = false;
        if (endTimer) clearTimeout(endTimer);
        endTimer = null;
        currentEnd = null;
      },
      getVoices() {
        return [testVoice];
      },
      addEventListener() {},
      removeEventListener() {},
      onvoiceschanged: null,
    };

    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      get: () => stub,
    });
  });
}

test.describe("Listen / TTS controls on TodayPage", () => {
  test.beforeEach(async ({ page }) => {
    await installSpeechStub(page);
    await page.goto("/");
  });

  test("Listen All shows Pause and Stop while playing", async ({ page }) => {
    await page.getByRole("button", { name: /listen to all sections/i }).click();
    await expect(page.getByRole("button", { name: /^pause playback$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^stop playback$/i })).toBeVisible();
  });

  test("Pause shows Resume and Stop while paused", async ({ page }) => {
    await page.getByRole("button", { name: /listen to all sections/i }).click();
    await page.getByRole("button", { name: /^pause playback$/i }).click();
    await expect(page.getByRole("button", { name: /^resume playback$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^stop playback$/i })).toBeVisible();
  });

  test("Stop button resets playback to idle", async ({ page }) => {
    await page.getByRole("button", { name: /listen to all sections/i }).click();
    await page.getByRole("button", { name: /^stop playback$/i }).click();
    await expect(page.getByRole("button", { name: /listen to all sections/i })).toBeVisible();
  });

  test("Listen All progress bar appears while playing and hides on stop", async ({ page }) => {
    const progress = page.getByRole("progressbar", { name: /listen all progress/i });

    await page.getByRole("button", { name: /listen to all sections/i }).click();
    await expect(progress).toBeVisible();

    await page.getByRole("button", { name: /^stop playback$/i }).click();
    await expect(progress).toHaveCSS("opacity", "0");
  });

  test("section speaker is touch-friendly and visible on mobile", async ({ page }) => {
    const speaker = page.getByRole("button", { name: /listen to definition/i }).first();
    await expect(speaker).toBeVisible();
    const box = await speaker.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(40);
    expect(box?.height).toBeGreaterThanOrEqual(40);
  });
});
