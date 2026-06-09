import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { waitForVoices } from "@/lib/ttsPlatform";

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
});
