import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vite-plus/test";
import { Input } from "../input";
import { InputGroup } from "../input-group";
import { Toolbar } from "./toolbar";

describe("Toolbar", () => {
  it("applies toolbar size and item styles through Toolbar.Input", () => {
    render(() => (
      <Toolbar size="sm">
        <Toolbar.Input aria-label="Toolbar input" />
        <Input aria-label="Direct input" size="lg" />
      </Toolbar>
    ));

    const toolbarInput = screen.getByRole("textbox", {
      name: "Toolbar input",
    });
    const directInput = screen.getByRole("textbox", { name: "Direct input" });

    expect(toolbarInput.className).toContain("h-6.5");
    expect(toolbarInput.className).toContain("rounded-none");
    expect(directInput.className).toContain("h-10");
    expect(directInput.className).not.toContain("rounded-none");
  });

  it("passes toolbar sizing and styles directly to Toolbar.InputGroup", () => {
    const { container } = render(() => (
      <Toolbar size="sm">
        <Toolbar.InputGroup aria-label="Hostname">
          <InputGroup.Input placeholder="example" aria-label="Hostname" />
          <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
        </Toolbar.InputGroup>
        <InputGroup>
          <InputGroup.Input placeholder="plain" aria-label="Plain" />
        </InputGroup>
      </Toolbar>
    ));

    const groups = container.querySelectorAll('[data-slot="input-group"]');
    const toolbarGroup = groups[0] as HTMLElement;
    const plainGroup = groups[1] as HTMLElement;
    const input = screen.getByRole("textbox", { name: "Hostname" });

    expect(toolbarGroup.className).toContain("h-6.5");
    expect(toolbarGroup.className).toContain("rounded-none");
    expect(plainGroup.className).not.toContain("rounded-none");
    expect(input.className).not.toContain("not-first:border-l");
  });

  it("moves focus from a grouped input through subsequent buttons", async () => {
    render(() => (
      <Toolbar>
        <Toolbar.InputGroup aria-label="Search DNS records">
          <InputGroup.Input placeholder="Search DNS records" />
        </Toolbar.InputGroup>
        <Toolbar.Button aria-label="Filter">Filter</Toolbar.Button>
        <Toolbar.Button aria-label="Settings">Settings</Toolbar.Button>
      </Toolbar>
    ));

    const input = screen.getByRole("textbox", {
      name: "Search DNS records",
    });
    const filter = screen.getByRole("button", { name: "Filter" });
    const settings = screen.getByRole("button", { name: "Settings" });

    input.focus();
    fireEvent.keyDown(input, { key: "ArrowRight" });
    await Promise.resolve();
    expect(document.activeElement).toBe(filter);

    fireEvent.keyDown(filter, { key: "ArrowRight" });
    await Promise.resolve();
    expect(document.activeElement).toBe(settings);
  });

  it("keeps size and disabled state reactive", () => {
    const [compact, setCompact] = createSignal(false);
    render(() => (
      <Toolbar size={compact() ? "xs" : "lg"} disabled={compact()}>
        <Toolbar.Input aria-label="Reactive toolbar input" />
        <Toolbar.Button>Save</Toolbar.Button>
      </Toolbar>
    ));

    const input = screen.getByRole("textbox", {
      name: "Reactive toolbar input",
    });
    const button = screen.getByRole("button", { name: "Save" });

    expect(input.className).toContain("h-10");
    setCompact(true);
    const updatedButton = screen.getByRole("button", { name: "Save" });
    expect(updatedButton).toBe(button);
    expect(input.className).toContain("h-5");
    expect(button.className).toContain("h-5");
    expect(input.getAttribute("aria-disabled")).toBe("true");
    expect(button.hasAttribute("data-disabled")).toBe(true);
    expect(button.getAttribute("aria-disabled")).toBe("true");
  });
});
