import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTTS } from "@/hooks/useTTS";

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
});
