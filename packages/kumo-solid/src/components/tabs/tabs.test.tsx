import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import {
  Tabs,
  KUMO_TABS_DEFAULT_VARIANTS,
  KUMO_TABS_STYLING,
  KUMO_TABS_VARIANTS,
} from "./tabs";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "analytics", label: "Analytics" },
  { value: "settings", label: "Settings" },
];

describe("Tabs", () => {
  it("preserves the Kumo variant and styling metadata", () => {
    expect(KUMO_TABS_VARIANTS.variant).toEqual(["segmented", "underline"]);
    expect(KUMO_TABS_DEFAULT_VARIANTS).toEqual({
      variant: "segmented",
      size: "base",
    });
    expect(KUMO_TABS_STYLING.container.height).toBe(34);
    expect(KUMO_TABS_STYLING.indicator.shadow).toBe("shadow-sm");
  });

  it("renders nothing when there are no tabs", () => {
    const { container } = render(() => <Tabs />);

    expect(container.innerHTML).toBe("");
  });

  it("selects the first tab by default with segmented styling", () => {
    const { container } = render(() => (
      <Tabs
        tabs={tabs}
        class="custom-root"
        listClassName="custom-list"
        indicatorClassName="custom-indicator"
      />
    ));

    expect(screen.getByRole("tablist")).toBeTruthy();
    expect(
      screen
        .getByRole("tab", { name: "Overview" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(
      screen
        .getByRole("tab", { name: "Analytics" })
        .getAttribute("aria-selected"),
    ).toBe("false");
    expect(container.firstElementChild?.className).toContain(
      "ring-kumo-hairline/70",
    );
    expect(container.firstElementChild?.className).toContain("custom-root");
    expect(screen.getByRole("tablist").className).toContain("custom-list");
    expect(
      container.querySelector('[data-kumo-part="indicator"]')?.className,
    ).toContain("custom-indicator");
    expect(
      container
        .querySelector('button[aria-label="Scroll tabs left"]')
        ?.getAttribute("aria-hidden"),
    ).toBe("true");
  });

  it("uses selectedValue as the uncontrolled initial value", () => {
    render(() => <Tabs tabs={tabs} selectedValue="settings" />);

    expect(
      screen
        .getByRole("tab", { name: "Settings" })
        .getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("updates uncontrolled selection and calls onValueChange", () => {
    const onValueChange = vi.fn();
    render(() => <Tabs tabs={tabs} onValueChange={onValueChange} />);

    fireEvent.click(screen.getByRole("tab", { name: "Analytics" }));

    expect(onValueChange).toHaveBeenCalledWith("analytics");
    expect(
      screen
        .getByRole("tab", { name: "Analytics" })
        .getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("keeps controlled selection reactive", async () => {
    const [value, setValue] = createSignal("overview");
    const onValueChange = vi.fn((nextValue: string) => setValue(nextValue));
    render(() => (
      <Tabs tabs={tabs} value={value()} onValueChange={onValueChange} />
    ));

    fireEvent.click(screen.getByRole("tab", { name: "Settings" }));

    expect(onValueChange).toHaveBeenCalledWith("settings");
    await waitFor(() =>
      expect(
        screen
          .getByRole("tab", { name: "Settings" })
          .getAttribute("aria-selected"),
      ).toBe("true"),
    );
  });

  it("uses manual activation for keyboard navigation by default", async () => {
    const onValueChange = vi.fn();
    render(() => <Tabs tabs={tabs} onValueChange={onValueChange} />);
    const overview = screen.getByRole("tab", { name: "Overview" });
    const analytics = screen.getByRole("tab", { name: "Analytics" });

    overview.focus();
    fireEvent.keyDown(overview, { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(analytics));
    expect(overview.getAttribute("aria-selected")).toBe("true");
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.keyDown(analytics, { key: "Enter" });
    fireEvent.keyUp(analytics, { key: "Enter" });
    fireEvent.click(analytics);
    await waitFor(() =>
      expect(analytics.getAttribute("aria-selected")).toBe("true"),
    );
    expect(onValueChange).toHaveBeenCalledWith("analytics");
  });

  it("activates focused tabs when activateOnFocus is enabled", async () => {
    const onValueChange = vi.fn();
    render(() => (
      <Tabs tabs={tabs} activateOnFocus onValueChange={onValueChange} />
    ));
    const overview = screen.getByRole("tab", { name: "Overview" });
    const analytics = screen.getByRole("tab", { name: "Analytics" });

    overview.focus();
    fireEvent.keyDown(overview, { key: "ArrowRight" });

    await waitFor(() => expect(document.activeElement).toBe(analytics));
    expect(onValueChange).toHaveBeenCalledWith("analytics");
    expect(analytics.getAttribute("aria-selected")).toBe("true");
  });

  it("applies underline and compact variant styles", () => {
    const { container } = render(() => (
      <Tabs tabs={tabs} variant="underline" size="sm" />
    ));
    const list = screen.getByRole("tablist");
    const tab = screen.getByRole("tab", { name: "Overview" });
    const indicator = container.querySelector('[data-kumo-part="indicator"]');

    expect(container.firstElementChild?.className).not.toContain(
      "ring-kumo-hairline/70",
    );
    expect(list.className).toContain("border-kumo-hairline");
    expect(list.className).toContain("h-6.5");
    expect(tab.className).toContain("text-xs");
    expect(indicator?.className).toContain("bottom-0");
    expect(indicator?.className).toContain("bg-kumo-brand");
  });

  it("supports link-based custom tab rendering", () => {
    render(() => (
      <Tabs
        selectedValue="regular"
        tabs={[
          { value: "regular", label: "Regular" },
          {
            value: "linked",
            label: "Linked",
            render: (renderProps) => <a {...renderProps} href="#linked" />,
          },
        ]}
      />
    ));

    const linked = screen.getByRole("tab", { name: "Linked" });
    expect(linked.tagName).toBe("A");
    expect(linked.getAttribute("href")).toBe("#linked");
    expect(linked.hasAttribute("type")).toBe(false);

    fireEvent.click(linked);
    expect(linked.getAttribute("aria-selected")).toBe("true");
  });

  it("detects overflow, localizes controls, and scrolls by whole tabs", () => {
    const { container } = render(() => (
      <Tabs
        tabs={tabs}
        labels={{
          scrollStart: "Earlier tabs",
          scrollEnd: "Later tabs",
        }}
      />
    ));
    const list = screen.getByRole("tablist");
    const renderedTabs = Array.from(
      list.querySelectorAll<HTMLElement>('[data-kumo-part="tab"]'),
    );
    const scrollBy = vi.fn();

    Object.defineProperties(list, {
      clientWidth: { configurable: true, value: 200 },
      scrollWidth: { configurable: true, value: 500 },
      scrollLeft: { configurable: true, value: 0, writable: true },
      scrollBy: { configurable: true, value: scrollBy },
    });
    for (const tab of renderedTabs) {
      Object.defineProperty(tab, "offsetWidth", {
        configurable: true,
        value: 80,
      });
    }

    fireEvent.scroll(list);

    expect(list.hasAttribute("data-overflowing")).toBe(true);
    expect(list.hasAttribute("data-overflow-end")).toBe(true);
    const previous = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Earlier tabs"]',
    );
    const next = screen.getByRole("button", {
      name: "Later tabs",
    });
    expect(previous?.getAttribute("aria-hidden")).toBe("true");
    expect(next.getAttribute("aria-hidden")).toBe("false");

    fireEvent.click(next);
    expect(scrollBy).toHaveBeenCalledWith({
      left: 160,
      behavior: "smooth",
    });
    expect(container.querySelector(".cursor-grab")).toBeTruthy();
  });
});
