import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import {
  Collapsible,
  KUMO_COLLAPSIBLE_DEFAULT_VARIANTS,
  KUMO_COLLAPSIBLE_VARIANTS,
  collapsibleVariants,
} from "./collapsible";

describe("Collapsible", () => {
  it("exposes the React-compatible empty variant contract", () => {
    expect(KUMO_COLLAPSIBLE_VARIANTS).toEqual({});
    expect(KUMO_COLLAPSIBLE_DEFAULT_VARIANTS).toEqual({});
    expect(collapsibleVariants()).toBe("");
  });

  it("opens and closes an uncontrolled default disclosure", () => {
    render(() => (
      <Collapsible.Root>
        <Collapsible.DefaultTrigger>What is Kumo?</Collapsible.DefaultTrigger>
        <Collapsible.DefaultPanel>
          Kumo is a design system.
        </Collapsible.DefaultPanel>
      </Collapsible.Root>
    ));

    const trigger = screen.getByRole("button", { name: "What is Kumo?" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Kumo is a design system.")).toBeNull();

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Kumo is a design system.")).toBeTruthy();

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Kumo is a design system.")).toBeNull();
  });

  it("keeps controlled state reactive and reports changes", () => {
    const [open, setOpen] = createSignal(false);
    const onOpenChange = vi.fn((next: boolean) => setOpen(next));

    render(() => (
      <Collapsible.Root open={open()} onOpenChange={onOpenChange}>
        <Collapsible.Trigger className="custom-trigger">
          Details
        </Collapsible.Trigger>
        <Collapsible.Panel className="custom-panel">
          Controlled content
        </Collapsible.Panel>
      </Collapsible.Root>
    ));

    const trigger = screen.getByRole("button", { name: "Details" });
    expect(trigger.className).toContain("cursor-pointer");
    expect(trigger.className).toContain("custom-trigger");

    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByText("Controlled content").className).toContain(
      "custom-panel",
    );
  });

  it("supports keepMounted and preserves the default panel styling", () => {
    render(() => (
      <Collapsible.Root>
        <Collapsible.DefaultTrigger>Persistent</Collapsible.DefaultTrigger>
        <Collapsible.DefaultPanel keepMounted>
          Persistent content
        </Collapsible.DefaultPanel>
      </Collapsible.Root>
    ));

    const panel = screen.getByText("Persistent content");
    expect(panel.className).toContain("border-kumo-fill");
    expect(panel.hasAttribute("hidden")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Persistent" }));
    expect(panel.hasAttribute("hidden")).toBe(false);
  });

  it("forwards root and trigger refs", () => {
    let root: HTMLDivElement | undefined;
    let trigger: HTMLButtonElement | undefined;

    render(() => (
      <Collapsible
        ref={(element) => {
          root = element;
        }}
      >
        <Collapsible.Trigger
          ref={(element) => {
            trigger = element;
          }}
        >
          Toggle
        </Collapsible.Trigger>
      </Collapsible>
    ));

    expect(root).toBeInstanceOf(HTMLDivElement);
    expect(trigger).toBeInstanceOf(HTMLButtonElement);
  });
});
