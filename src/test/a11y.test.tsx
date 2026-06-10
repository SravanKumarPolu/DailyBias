import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Header from "@/components/Header";

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

const renderHeader = (path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]} future={routerFuture}>
      <Header />
    </MemoryRouter>,
  );

describe("Header accessibility", () => {
  it("exposes a navigation landmark", () => {
    renderHeader("/");
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("sets aria-current=page only on the active tab", () => {
    renderHeader("/");
    expect(screen.getByRole("link", { name: /today/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /saved/i })).not.toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("nav links are keyboard-focusable in document order", async () => {
    const user = userEvent.setup();
    renderHeader("/");
    await user.tab(); // brand logo
    await user.tab(); // first nav link → Today
    expect(screen.getByRole("link", { name: /today/i })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: /biases/i })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: /saved/i })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: /quiz/i })).toHaveFocus();
  });

  it("every primary nav link has an accessible name", () => {
    renderHeader("/");
    ["Today", "Saved", "Quiz", "Review", "Settings", "About"].forEach((label) => {
      const link = screen.getByRole("link", { name: new RegExp(label, "i") });
      expect(link).toHaveAccessibleName();
    });
  });
});
