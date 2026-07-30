import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import {
  MenuBar,
  KUMO_MENUBAR_DEFAULT_VARIANTS,
  KUMO_MENUBAR_VARIANTS,
  menuBarVariants,
} from "./menubar";

function TestIcon() {
  return <svg data-testid="menu-icon" viewBox="0 0 16 16" />;
}

describe("MenuBar", () => {
  it("renders named tooltip triggers and root classes", () => {
    render(() => (
      <MenuBar
        aria-label="View options"
        className="custom-menu"
        isActive={0}
        options={[
          { icon: <TestIcon />, tooltip: "List view", onClick: () => {} },
          { icon: <TestIcon />, tooltip: "Grid view", onClick: () => {} },
        ]}
      />
    ));

    const menu = screen.getByRole("navigation", { name: "View options" });
    const list = screen.getByRole("button", { name: "List view" });
    expect(menu.classList.contains("custom-menu")).toBe(true);
    expect(menu.classList.contains("ring-kumo-line")).toBe(true);
    expect(list.dataset.baseUiTooltipTrigger).toBe("");
    expect(list.classList.contains("bg-kumo-base")).toBe(true);
    expect(screen.getAllByTestId("menu-icon")).toHaveLength(2);
  });

  it("fires option callbacks and updates index-based active state", () => {
    const [active, setActive] = createSignal<number>();
    const listClick = vi.fn(() => setActive(0));
    const gridClick = vi.fn(() => setActive(1));
    render(() => (
      <MenuBar
        isActive={active()}
        options={[
          { icon: <TestIcon />, tooltip: "List view", onClick: listClick },
          { icon: <TestIcon />, tooltip: "Grid view", onClick: gridClick },
        ]}
      />
    ));

    const grid = screen.getByRole("button", { name: "Grid view" });
    expect(grid.classList.contains("bg-kumo-base")).toBe(false);
    fireEvent.click(grid);
    expect(gridClick).toHaveBeenCalledOnce();
    expect(grid.classList.contains("bg-kumo-base")).toBe(true);
  });

  it("matches active state by option id", () => {
    render(() => (
      <MenuBar
        optionIds
        isActive="grid"
        options={[
          {
            id: "list",
            icon: <TestIcon />,
            tooltip: "List view",
            onClick: () => {},
          },
          {
            id: "grid",
            icon: <TestIcon />,
            tooltip: "Grid view",
            onClick: () => {},
          },
        ]}
      />
    ));

    expect(
      screen
        .getByRole("button", { name: "Grid view" })
        .classList.contains("bg-kumo-base"),
    ).toBe(true);
  });

  it("moves focus with horizontal arrows and wraps at both ends", () => {
    render(() => (
      <MenuBar
        options={[
          { icon: <TestIcon />, tooltip: "One", onClick: () => {} },
          { icon: <TestIcon />, tooltip: "Two", onClick: () => {} },
          { icon: <TestIcon />, tooltip: "Three", onClick: () => {} },
        ]}
      />
    ));
    const buttons = screen.getAllByRole("button");

    buttons[0].focus();
    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(buttons[2]);
    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(document.activeElement).toBe(buttons[0]);
    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(document.activeElement).toBe(buttons[1]);
  });

  it("retains public variant metadata", () => {
    expect(KUMO_MENUBAR_VARIANTS).toEqual({});
    expect(KUMO_MENUBAR_DEFAULT_VARIANTS).toEqual({});
    expect(menuBarVariants()).toContain("bg-kumo-recessed");
  });
});
