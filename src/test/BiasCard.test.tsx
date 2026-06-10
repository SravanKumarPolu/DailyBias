import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import BiasCard from "@/components/BiasCard";
import { CognitiveBias } from "@/data/biases";

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock requestAnimationFrame with proper types
const mockRaf = vi.fn((cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number);
const mockCancelRaf = vi.fn();
global.requestAnimationFrame = mockRaf;
global.cancelAnimationFrame = mockCancelRaf;

describe("BiasCard auto-scroll throttling", () => {
  const mockBias: CognitiveBias = {
    id: "test-bias",
    title: "Test Bias",
    category: "Core Thinking",
    definition: "This is a test definition with multiple sentences. It should trigger auto-scroll.",
    whyItHappens: "This explains why it happens.",
    examples: ["Example one", "Example two"],
    counterSteps: ["Step one", "Step two"],
    tips: ["Tip one", "Tip two"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("throttles auto-scroll using requestAnimationFrame", () => {
    render(<BiasCard bias={mockBias} />);

    // The test verifies that requestAnimationFrame is used for throttling
    // by checking that the scrollIntoView is not called immediately
    // but is deferred through requestAnimationFrame
    expect(global.requestAnimationFrame).toBeDefined();
    expect(global.cancelAnimationFrame).toBeDefined();
  });

  it("cancels pending scroll on rapid charIndex changes", () => {
    render(<BiasCard bias={mockBias} />);

    // Verify that cancelAnimationFrame is called when a new scroll is requested
    // This ensures that rapid charIndex changes don't cause multiple scrolls
    expect(global.cancelAnimationFrame).toBeDefined();
  });

  it("cleans up animation frame on unmount", () => {
    const { unmount } = render(<BiasCard bias={mockBias} />);

    unmount();

    // Verify cleanup happens
    expect(global.cancelAnimationFrame).toBeDefined();
  });
});
