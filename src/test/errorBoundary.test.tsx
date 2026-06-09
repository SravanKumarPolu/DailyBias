import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

const Thrower = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error("test boom");
  return <p>All good</p>;
};

describe("ErrorBoundary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when there is no error", () => {
    render(
      <MemoryRouter future={routerFuture}>
        <ErrorBoundary>
          <Thrower shouldThrow={false} />
        </ErrorBoundary>
      </MemoryRouter>,
    );
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("shows a recovery UI when a child throws", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <MemoryRouter future={routerFuture}>
        <ErrorBoundary>
          <Thrower shouldThrow />
        </ErrorBoundary>
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: /something went wrong/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /return to today/i })).toHaveAttribute("href", "/");
    spy.mockRestore();
  });

  it("recovers when Try again is clicked", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    let throwNext = true;

    const MaybeThrow = () => {
      if (throwNext) throw new Error("test boom");
      return <p>Recovered</p>;
    };

    render(
      <MemoryRouter future={routerFuture}>
        <ErrorBoundary>
          <MaybeThrow />
        </ErrorBoundary>
      </MemoryRouter>,
    );

    throwNext = false;
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(screen.getByText("Recovered")).toBeInTheDocument();
    spy.mockRestore();
  });
});
