import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { waitForVoices, isIOSSafari, isMobileBrowser } from "@/lib/ttsPlatform";

describe("isIOSSafari", () => {
  it("detects iPhone", () => {
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      configurable: true,
    });
    expect(isIOSSafari()).toBe(true);
  });

  it("detects iPad", () => {
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)",
      configurable: true,
    });
    expect(isIOSSafari()).toBe(true);
  });

  it("detects iPod", () => {
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (iPod touch; CPU iPhone OS 14_0 like Mac OS X)",
      configurable: true,
    });
    expect(isIOSSafari()).toBe(true);
  });

  it("detects iPadOS 13+ using maxTouchPoints", () => {
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15",
      configurable: true,
    });
    Object.defineProperty(navigator, "maxTouchPoints", {
      value: 5,
      configurable: true,
    });
    expect(isIOSSafari()).toBe(true);
  });

  it("does not detect iPadOS 13+ when neither maxTouchPoints nor ontouchend", () => {
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15",
      configurable: true,
    });
    Object.defineProperty(navigator, "maxTouchPoints", {
      value: 0,
      configurable: true,
    });
    // Remove ontouchend to simulate desktop without touch
    delete (document as any).ontouchend;
    expect(isIOSSafari()).toBe(false);
  });

  it("does not detect desktop Mac without touch", () => {
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      configurable: true,
    });
    Object.defineProperty(navigator, "maxTouchPoints", {
      value: 0,
      configurable: true,
    });
    // Remove ontouchend to simulate desktop without touch
    delete (document as any).ontouchend;
    expect(isIOSSafari()).toBe(false);
  });

  it("does not detect Android", () => {
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
      configurable: true,
    });
    expect(isIOSSafari()).toBe(false);
  });
});

describe("isMobileBrowser", () => {
  it("detects Android", () => {
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
      configurable: true,
    });
    expect(isMobileBrowser()).toBe(true);
  });

  it("detects iPhone", () => {
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      configurable: true,
    });
    expect(isMobileBrowser()).toBe(true);
  });

  it("detects iPad", () => {
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)",
      configurable: true,
    });
    expect(isMobileBrowser()).toBe(true);
  });

  it("detects iPadOS 13+", () => {
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15",
      configurable: true,
    });
    Object.defineProperty(navigator, "maxTouchPoints", {
      value: 5,
      configurable: true,
    });
    expect(isMobileBrowser()).toBe(true);
  });

  it("does not detect desktop Chrome", () => {
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      configurable: true,
    });
    expect(isMobileBrowser()).toBe(false);
  });

  it("does not detect desktop Safari", () => {
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      configurable: true,
    });
    Object.defineProperty(navigator, "maxTouchPoints", {
      value: 0,
      configurable: true,
    });
    delete (document as any).ontouchend;
    expect(isMobileBrowser()).toBe(false);
  });
});

describe("waitForVoices", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves immediately when voices are already available", async () => {
    const voice = { name: "A", lang: "en-US" } as SpeechSynthesisVoice;
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        getVoices: () => [voice],
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    await expect(waitForVoices()).resolves.toEqual([voice]);
  });

  it("waits for voiceschanged when list is initially empty", async () => {
    let voices: SpeechSynthesisVoice[] = [];
    const listeners: Record<string, () => void> = {};

    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        getVoices: () => voices,
        addEventListener: (event: string, cb: () => void) => {
          listeners[event] = cb;
        },
        removeEventListener: vi.fn(),
      },
    });

    const pending = waitForVoices(500);
    voices = [{ name: "B", lang: "en-GB" } as SpeechSynthesisVoice];
    listeners.voiceschanged?.();

    await expect(pending).resolves.toHaveLength(1);
  });

  it("uses default 3000ms timeout", async () => {
    let voices: SpeechSynthesisVoice[] = [];
    const listeners: Record<string, () => void> = {};

    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        getVoices: () => voices,
        addEventListener: (event: string, cb: () => void) => {
          listeners[event] = cb;
        },
        removeEventListener: vi.fn(),
      },
    });

    const pending = waitForVoices();
    vi.advanceTimersByTime(3000);

    await expect(pending).resolves.toEqual([]);
  });
});
