import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import TodayPage from "@/pages/TodayPage";
import { getTodaysBias } from "@/data/biases";
import { FEEDBACK_STORAGE_KEY, readFeedbackStore } from "@/hooks/useBiasFeedback";
import { safeStorage } from "@/lib/safeStorage";

// BiasCard pulls in useTTS which touches speechSynthesis; stub it out.
vi.mock("@/hooks/useTTS", () => ({
  useTTS: () => ({
    state: "idle",
    activeSection: null,
    activeCharIndex: 0,
    isQueue: false,
    queueProgress: 0,
    play: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
    playAll: vi.fn(),
  }),
}));

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]} future={routerFuture}>
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<TodayPage />} />
        </Routes>
      </TooltipProvider>
    </MemoryRouter>,
  );

const renderHeaderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]} future={routerFuture}>
      <Header />
    </MemoryRouter>,
  );

beforeEach(() => {
  safeStorage._resetForTests();
  try {
    window.localStorage.clear();
  } catch {
    /* ignore */
  }
});

describe("Header navigation", () => {
  it("highlights the Today tab when on /", () => {
    renderHeaderAt("/");
    const today = screen.getByRole("link", { name: /today/i });
    expect(today.getAttribute("aria-current")).toBe("page");
  });

  it("does not mark Today as current when on another route", () => {
    renderHeaderAt("/saved");
    const today = screen.getByRole("link", { name: /today/i });
    expect(today.getAttribute("aria-current")).toBeNull();
    const saved = screen.getByRole("link", { name: /saved/i });
    expect(saved.getAttribute("aria-current")).toBe("page");
  });

  it("exposes all primary nav links regardless of viewport", () => {
    renderHeaderAt("/");
    // Labels are sr-only on small screens but the links themselves always render.
    ["Today", "Saved", "Quiz", "Review", "Settings", "About"].forEach((label) => {
      expect(screen.getByRole("link", { name: new RegExp(label, "i") })).toBeInTheDocument();
    });
  });
});

describe("TodayPage", () => {
  it("renders today's bias title, definition, examples and tips by default at /", () => {
    const bias = getTodaysBias();
    renderAt("/");

    // Title
    expect(screen.getByRole("heading", { name: bias.title })).toBeInTheDocument();

    // Definition section
    expect(screen.getByText(/definition/i)).toBeInTheDocument();
    expect(screen.getByText(bias.definition)).toBeInTheDocument();

    // Examples — at least the first item should render in a list.
    const firstExample = bias.examples[0];
    expect(screen.getByText(firstExample)).toBeInTheDocument();

    // Tips — at least the first tip should render.
    const firstTip = bias.tips[0];
    expect(screen.getByText(firstTip)).toBeInTheDocument();
  });

  it("shows bias journey progress", () => {
    renderAt("/");
    expect(screen.getByText(/your journey/i)).toBeInTheDocument();
    expect(screen.getByText(/\/ 60 biases/i)).toBeInTheDocument();
  });

  it("shows the daily reflection section", () => {
    renderAt("/");
    expect(screen.getByText(/daily reflection/i)).toBeInTheDocument();
  });

  it("shows the bias usefulness feedback widget", () => {
    renderAt("/");
    expect(screen.getByText(/was today's bias useful\?/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /yes/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /no/i })).toBeInTheDocument();
  });

  it("stores useful feedback locally and reveals optional comment field", async () => {
    const user = userEvent.setup();
    const bias = getTodaysBias();
    renderAt("/");

    await user.click(screen.getByRole("button", { name: /yes/i }));

    expect(screen.getByRole("textbox", { name: /optional feedback comment/i })).toBeInTheDocument();

    const store = readFeedbackStore();
    const entry = Object.values(store).find((item) => item.biasId === bias.id);
    expect(entry?.useful).toBe(true);
    expect(safeStorage.getItem(FEEDBACK_STORAGE_KEY)).toContain(bias.id);
  });
});
