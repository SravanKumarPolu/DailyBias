import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import BiasCard from "@/components/BiasCard";
import type { CognitiveBias } from "@/data/biases";

// Mock the TTS hook so we can drive activeSection / state directly.
const ttsState: {
  state: "idle" | "playing" | "paused";
  activeSection: string | null;
  activeCharIndex: number;
  isQueue: boolean;
  queueProgress: number;
  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  playAll: () => void;
} = {
  state: "playing",
  activeSection: "whyItHappens",
  activeCharIndex: 0,
  isQueue: false,
  queueProgress: 0,
  play: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  stop: vi.fn(),
  playAll: vi.fn(),
};

vi.mock("@/hooks/useTTS", () => ({
  useTTS: () => ttsState,
}));

vi.mock("@/components/VoiceSpeedSelector", () => ({
  default: () => null,
}));

const baseBias: CognitiveBias = {
  id: "test",
  title: "Test Bias",
  category: "Core Thinking",
  definition: "A definition.",
  whyItHappens: "",
  examples: ["Example one.", "Example two."],
  counterSteps: ["Step one."],
  tips: ["Tip one."],
};

describe("BiasCard – data-tts-active parity for 'Why it happens'", () => {
  beforeEach(() => {
    ttsState.state = "playing";
    ttsState.activeSection = "whyItHappens";
    ttsState.activeCharIndex = 0;
  });

  it("marks a single-sentence 'Why it happens' paragraph with data-tts-active (like list items)", () => {
    const bias = { ...baseBias, whyItHappens: "Only one sentence here." };
    const { container } = render(<BiasCard bias={bias} />);
    const active = container.querySelectorAll('[data-tts-active="true"]');
    // Exactly one active marker, and it lives inside the rendered paragraph.
    expect(active.length).toBe(1);
    expect(active[0].textContent).toContain("Only one sentence here.");
  });

  it("marks exactly one sentence in a multi-sentence 'Why it happens' paragraph", () => {
    const bias = {
      ...baseBias,
      whyItHappens: "First sentence here. Second sentence here. Third one.",
    };
    ttsState.activeCharIndex = 0; // first sentence
    const { container, rerender } = render(<BiasCard bias={bias} />);
    let active = container.querySelectorAll('[data-tts-active="true"]');
    expect(active.length).toBe(1);
    expect(active[0].textContent).toContain("First sentence here.");

    // Advance into second sentence.
    ttsState.activeCharIndex = 25;
    rerender(<BiasCard bias={bias} />);
    active = container.querySelectorAll('[data-tts-active="true"]');
    expect(active.length).toBe(1);
    expect(active[0].textContent).toContain("Second sentence here.");
  });

  it("removes data-tts-active when TTS is idle", () => {
    const bias = { ...baseBias, whyItHappens: "Only one sentence here." };
    ttsState.state = "idle";
    ttsState.activeSection = null;
    const { container } = render(<BiasCard bias={bias} />);
    expect(container.querySelectorAll('[data-tts-active="true"]').length).toBe(0);
  });
});
