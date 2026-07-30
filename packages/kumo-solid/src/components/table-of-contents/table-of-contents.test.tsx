import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import {
  KUMO_TABLE_OF_CONTENTS_DEFAULT_VARIANTS,
  KUMO_TABLE_OF_CONTENTS_VARIANTS,
  TableOfContents,
} from "./table-of-contents";

describe("TableOfContents", () => {
  it("renders its semantic compound structure and default accessible name", () => {
    render(() => (
      <TableOfContents className="custom-root">
        <TableOfContents.Title>On this page</TableOfContents.Title>
        <TableOfContents.List data-testid="toc-list">
          <TableOfContents.Item href="#intro">
            Introduction
          </TableOfContents.Item>
          <TableOfContents.Group label="Getting Started">
            <TableOfContents.Item href="#install">
              Installation
            </TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents.List>
      </TableOfContents>
    ));

    const navigation = screen.getByRole("navigation", {
      name: "Table of contents",
    });
    expect(navigation.classList.contains("custom-root")).toBe(true);
    expect(screen.getByText("On this page").tagName).toBe("P");
    expect(screen.getByTestId("toc-list").tagName).toBe("UL");
    expect(screen.getByText("Introduction").closest("li")).toBeTruthy();
    expect(screen.getByText("Getting Started").tagName).toBe("P");
    expect(
      screen.getByText("Installation").closest("ul")?.parentElement?.tagName,
    ).toBe("LI");
  });

  it("reactively applies active state and aria-current", () => {
    const [active, setActive] = createSignal(false);
    render(() => (
      <>
        <TableOfContents>
          <TableOfContents.List>
            <TableOfContents.Item href="#usage" active={active()}>
              Usage
            </TableOfContents.Item>
          </TableOfContents.List>
        </TableOfContents>
        <button type="button" onClick={() => setActive(true)}>
          Activate
        </button>
      </>
    ));

    const link = screen.getByRole("link", { name: "Usage" });
    expect(link.hasAttribute("aria-current")).toBe(false);
    expect(link.classList.contains("text-kumo-subtle")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Activate" }));
    expect(link.getAttribute("aria-current")).toBe("true");
    expect(link.classList.contains("border-kumo-brand")).toBe(true);
  });

  it("supports Solid render overrides and merges consumer props", () => {
    const onClick = vi.fn();
    render(() => (
      <TableOfContents>
        <TableOfContents.List>
          <TableOfContents.Item
            render="button"
            type="button"
            active
            className="custom-item"
            onClick={onClick}
          >
            Select section
          </TableOfContents.Item>
        </TableOfContents.List>
      </TableOfContents>
    ));

    const button = screen.getByRole("button", { name: "Select section" });
    expect(button.parentElement?.tagName).toBe("LI");
    expect(button.classList.contains("custom-item")).toBe(true);
    expect(button.getAttribute("aria-current")).toBe("true");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders linked groups without leaking label clicks to nested items", () => {
    const onGroupClick = vi.fn((event: MouseEvent) => event.preventDefault());
    const onItemClick = vi.fn((event: MouseEvent) => event.preventDefault());
    render(() => (
      <TableOfContents aria-label="Guide sections">
        <TableOfContents.List>
          <TableOfContents.Group
            label="API"
            href="#api"
            active
            onClick={onGroupClick}
          >
            <TableOfContents.Item href="#methods" onClick={onItemClick}>
              Methods
            </TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents.List>
      </TableOfContents>
    ));

    const groupLink = screen.getByRole("link", { name: "API" });
    expect(groupLink.getAttribute("href")).toBe("#api");
    expect(groupLink.getAttribute("aria-current")).toBe("true");
    fireEvent.click(screen.getByRole("link", { name: "Methods" }));
    expect(onItemClick).toHaveBeenCalledOnce();
    expect(onGroupClick).not.toHaveBeenCalled();
    fireEvent.click(groupLink);
    expect(onGroupClick).toHaveBeenCalledOnce();
  });

  it("exposes the same state metadata as the React package", () => {
    expect(KUMO_TABLE_OF_CONTENTS_VARIANTS.state.active.classes).toContain(
      "text-kumo-default",
    );
    expect(KUMO_TABLE_OF_CONTENTS_VARIANTS.state.default.classes).toContain(
      "text-kumo-subtle",
    );
    expect(KUMO_TABLE_OF_CONTENTS_DEFAULT_VARIANTS.state).toBe("default");
  });
});
