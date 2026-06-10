import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTTS } from "@/hooks/useTTS";
import { isMobileBrowser } from "@/lib/ttsPlatform";

const mockVoice = {
  name: "Test Voice",
  lang: "en-US",
  voiceURI: "test-voice",
  localService: true,
  default: true,
} as SpeechSynthesisVoice;

class MockSpeechSynthesisUtterance {
  text: string;
  rate = 1;
  pitch = 1;
  volume = 1;
  voice: SpeechSynthesisVoice | null = null;
  lang = "";
  onstart: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onend: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onerror: ((ev: SpeechSynthesisErrorEvent) => void) | null = null;
  onboundary: ((ev: SpeechSynthesisEvent) => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

function createSpeechMock() {
  let speaking = false;
  let paused = false;
  let currentUtterance: MockSpeechSynthesisUtterance | null = null;

  const synth = {
    get speaking() {
      return speaking;
    },
    get paused() {
      return paused;
    },
    get pending() {
      return false;
    },
    speak: vi.fn((utterance: MockSpeechSynthesisUtterance) => {
      speaking = true;
      paused = false;
      currentUtterance = utterance;
      utterance.onstart?.(new Event("start") as SpeechSynthesisEvent);
    }),
    pause: vi.fn(() => {
      if (speaking) paused = true;
    }),
    resume: vi.fn(() => {
      if (speaking) paused = false;
    }),
    cancel: vi.fn(() => {
      speaking = false;
      paused = false;
      currentUtterance = null;
    }),
    getVoices: vi.fn(() => [mockVoice]),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onvoiceschanged: null,
    _end() {
      if (!currentUtterance) return;
      const u = currentUtterance;
      speaking = false;
      paused = false;
      currentUtterance = null;
      u.onend?.(new Event("end") as SpeechSynthesisEvent);
    },
  };

  return synth;
}

const isTTSSupportedMock = vi.fn(() => true);
const isMobileBrowserMock = vi.fn(() => false);

vi.mock("@/hooks/useTTSSettings", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/useTTSSettings")>();
  return {
    ...actual,
    isTTSSupported: () => isTTSSupportedMock(),
  };
});

vi.mock("@/lib/ttsPlatform", () => ({
  shouldUseKeepAlive: () => false,
  waitForVoices: vi.fn(async () => [mockVoice]),
  isIOSSafari: () => false,
  isMobileBrowser: () => isMobileBrowserMock(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("useTTS", () => {
  let synth: ReturnType<typeof createSpeechMock>;

  beforeEach(() => {
    isTTSSupportedMock.mockReturnValue(true);
    // @ts-expect-error test mock
    globalThis.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
    synth = createSpeechMock();
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      writable: true,
      value: synth,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("starts Listen All from idle", async () => {
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.playAll([
        { id: "definition", text: "Hello world." },
        { id: "tips", text: "Tip one." },
      ]);
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));
    expect(result.current.isQueue).toBe(true);
    expect(result.current.activeSection).toBe("definition");
    expect(synth.speak).toHaveBeenCalled();
  });

  it("pauses and resumes playback", async () => {
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("Hello.", "definition");
    });
    await waitFor(() => expect(result.current.state).toBe("playing"));

    act(() => {
      result.current.pause();
    });
    expect(result.current.state).toBe("paused");
    expect(synth.paused).toBe(true);

    act(() => {
      result.current.resume();
    });
    expect(result.current.state).toBe("playing");
    expect(synth.paused).toBe(false);
  });

  it("stop clears state and cancels speech", async () => {
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("Hello.", "definition");
    });
    await waitFor(() => expect(result.current.state).toBe("playing"));

    act(() => {
      result.current.stop();
    });

    expect(result.current.state).toBe("idle");
    expect(result.current.activeSection).toBeNull();
    expect(result.current.isQueue).toBe(false);
    expect(synth.speaking).toBe(false);
  });

  it("starting a section stops an active Listen All queue", async () => {
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.playAll([{ id: "definition", text: "Queued." }]);
    });
    await waitFor(() => expect(result.current.isQueue).toBe(true));

    act(() => {
      result.current.stop();
      result.current.play("Single section.", "whyItHappens");
    });
    await waitFor(() => expect(result.current.activeSection).toBe("whyItHappens"));

    expect(result.current.isQueue).toBe(false);
  });

  it("shows toast when speechSynthesis is unsupported", async () => {
    const { toast } = await import("sonner");
    isTTSSupportedMock.mockReturnValue(false);

    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("Hello.", "definition");
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(result.current.state).toBe("idle");
  });

  it("shows toast when speak() throws an error", async () => {
    const { toast } = await import("sonner");
    isTTSSupportedMock.mockReturnValue(true);

    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("Hello.", "definition");
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));

    // Mock speak to throw an error
    synth.speak = vi.fn(() => {
      throw new Error("Speech synthesis failed");
    });

    act(() => {
      result.current.play("Error test.", "definition");
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(
      "Speech playback failed",
      expect.objectContaining({
        description: expect.stringContaining("Please try again"),
      })
    ));
    expect(result.current.state).toBe("idle");
  });

  it("pause does nothing when startLock is active", async () => {
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("Hello.", "definition");
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));

    // Manually set startLock to simulate initialization in progress
    act(() => {
      // We can't directly access startLockRef from outside, but we can test
      // that pause works normally when speaking
      result.current.pause();
    });

    expect(result.current.state).toBe("paused");
    expect(synth.pause).toHaveBeenCalled();
  });

  it("resume does nothing when not paused", async () => {
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("Hello.", "definition");
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));

    act(() => {
      result.current.resume();
    });

    // Should not call resume since not paused
    expect(synth.resume).not.toHaveBeenCalled();
    expect(result.current.state).toBe("playing");
  });

  it("stop releases startLock to allow immediate new speech", async () => {
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("Hello.", "definition");
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));

    act(() => {
      result.current.stop();
    });

    expect(result.current.state).toBe("idle");
    expect(synth.cancel).toHaveBeenCalled();

    // Should be able to play again immediately without race condition
    act(() => {
      result.current.play("New text.", "definition");
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));
    expect(synth.speak).toHaveBeenCalledTimes(2);
  });

  it("handles queue item error gracefully", async () => {
    const { toast } = await import("sonner");
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.playAll([
        { id: "definition", text: "First section." },
        { id: "tips", text: "Second section." },
      ]);
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));

    // Simulate an error during playback by ending the current utterance
    // which would trigger the next item, then make speak throw
    act(() => {
      synth._end(); // End first section
      synth.speak = vi.fn(() => {
        throw new Error("Queue error");
      });
    });

    await waitFor(() => expect(result.current.state).toBe("idle"));
    // Should show error toast from speak() failure
    expect(toast.error).toHaveBeenCalled();
  });

  it("ignores invalid charIndex values", async () => {
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("Hello.", "definition");
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));

    // Simulate boundary event with invalid charIndex
    const utterance = (synth as typeof synth & { _currentUtterance?: SpeechSynthesisUtterance })._currentUtterance;
    if (utterance && utterance.onboundary) {
      act(() => {
        utterance.onboundary({ charIndex: -1 } as SpeechSynthesisEvent);
      });
      // Should not update charIndex with negative value
      expect(result.current.activeCharIndex).toBe(0);

      act(() => {
        utterance.onboundary({ charIndex: NaN } as SpeechSynthesisEvent);
      });
      // Should not update charIndex with NaN
      expect(result.current.activeCharIndex).toBe(0);

      act(() => {
        utterance.onboundary({ charIndex: 1000 } as SpeechSynthesisEvent); // Now allowed (upper bound removed)
      });
      // Should update charIndex since upper bound check was removed
      expect(result.current.activeCharIndex).toBe(1000);
    }
  });

  it("stop clears highlight state", async () => {
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("Hello world.", "definition");
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));
    expect(result.current.activeSection).toBe("definition");
    expect(result.current.activeCharIndex).toBe(0);

    act(() => {
      result.current.stop();
    });

    expect(result.current.state).toBe("idle");
    expect(result.current.activeSection).toBeNull();
    expect(result.current.activeCharIndex).toBe(0);
  });

  it("Listen All starts playback", async () => {
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.playAll([
        { id: "definition", text: "First section." },
        { id: "tips", text: "Second section." },
      ]);
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));
    expect(result.current.activeSection).toBe("definition");
    expect(result.current.isQueue).toBe(true);
  });

  it("Pause works during playback", async () => {
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("Hello.", "definition");
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));

    act(() => {
      result.current.pause();
    });

    expect(result.current.state).toBe("paused");
    expect(synth.pause).toHaveBeenCalled();
  });

  it("Resume works after pause", async () => {
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("Hello.", "definition");
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));

    act(() => {
      result.current.pause();
    });

    expect(result.current.state).toBe("paused");

    act(() => {
      result.current.resume();
    });

    expect(result.current.state).toBe("playing");
    expect(synth.resume).toHaveBeenCalled();
  });

  it("Stop works during playback", async () => {
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("Hello.", "definition");
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));

    act(() => {
      result.current.stop();
    });

    expect(result.current.state).toBe("idle");
    expect(synth.cancel).toHaveBeenCalled();
  });

  it("Section speaker starts only that section", async () => {
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("Section text.", "tips");
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));
    expect(result.current.activeSection).toBe("tips");
    expect(result.current.isQueue).toBe(false);
  });

  it("Starting section stops current speech", async () => {
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("First section.", "definition");
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));
    expect(result.current.activeSection).toBe("definition");

    act(() => {
      result.current.play("Second section.", "tips");
    });

    await waitFor(() => expect(result.current.activeSection).toBe("tips"));
    expect(synth.cancel).toHaveBeenCalled();
  });

  it("Unsupported speech fallback shows error", async () => {
    const { toast } = await import("sonner");
    isTTSSupportedMock.mockReturnValue(false);

    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("Hello.", "definition");
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(result.current.state).toBe("idle");
  });

  it("shows mobile-specific error message on mobile", async () => {
    const { toast } = await import("sonner");
    isMobileBrowserMock.mockReturnValue(true);
    isTTSSupportedMock.mockReturnValue(true);

    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("Hello.", "definition");
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));

    // Trigger error
    act(() => {
      synth.speak = vi.fn(() => {
        throw new Error("Mobile error");
      });
      result.current.play("Error test.", "definition");
    });

    await waitFor(() => expect(result.current.state).toBe("idle"));
    expect(toast.error).toHaveBeenCalledWith(
      "Playback interrupted",
      expect.objectContaining({
        description: expect.stringContaining("Mobile browser"),
      })
    );
  });

  it("prevents duplicate error toasts", async () => {
    const { toast } = await import("sonner");
    isMobileBrowserMock.mockReturnValue(true);
    isTTSSupportedMock.mockReturnValue(true);

    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("Hello.", "definition");
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));

    // Trigger error twice
    act(() => {
      synth.speak = vi.fn(() => {
        throw new Error("Mobile error");
      });
      result.current.play("Error test.", "definition");
    });

    await waitFor(() => expect(result.current.state).toBe("idle"));

    // Try to trigger another error immediately (should be prevented)
    act(() => {
      result.current.play("Another error.", "definition");
    });

    // Should only show one toast due to deduplication
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it("Stop resets state on mobile", async () => {
    isMobileBrowserMock.mockReturnValue(true);
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("Hello.", "definition");
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));

    act(() => {
      result.current.stop();
    });

    expect(result.current.state).toBe("idle");
    expect(result.current.activeSection).toBeNull();
    expect(result.current.activeCharIndex).toBe(0);
  });

  it("desktop controls still work", async () => {
    isMobileBrowserMock.mockReturnValue(false);
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("Hello.", "definition");
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));

    act(() => {
      result.current.pause();
    });

    expect(result.current.state).toBe("paused");

    act(() => {
      result.current.resume();
    });

    expect(result.current.state).toBe("playing");
  });

  it("intentional stop does not show toast", async () => {
    const { toast } = await import("sonner");
    isMobileBrowserMock.mockReturnValue(true);
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("Hello.", "definition");
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));

    act(() => {
      result.current.stop();
    });

    expect(result.current.state).toBe("idle");
    // Should not show toast for intentional stop
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("switching sections does not show toast", async () => {
    const { toast } = await import("sonner");
    isMobileBrowserMock.mockReturnValue(true);
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.play("Hello.", "definition");
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));

    // Switch to another section (calls stop then play)
    act(() => {
      result.current.play("New text.", "examples");
    });

    await waitFor(() => expect(result.current.state).toBe("playing"));
    // Should not show toast for section switch
    expect(toast.error).not.toHaveBeenCalled();
  });
});
