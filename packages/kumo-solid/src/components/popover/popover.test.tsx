import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { KumoPortalProvider } from "../../utils/portal-provider";
import {
  Popover,
  KUMO_POPOVER_DEFAULT_VARIANTS,
  KUMO_POPOVER_VARIANTS,
} from "./popover";

afterEach(() => {
  vi.useRealTimers();
});

function BasicPopover(props: { onOpenChange?: (open: boolean) => void }) {
  return (
    <Popover onOpenChange={props.onOpenChange}>
      <Popover.Trigger>Open details</Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Deployment details</Popover.Title>
        <Popover.Description>
          Configuration for this deployment.
        </Popover.Description>
        <Popover.Close>Close details</Popover.Close>
      </Popover.Content>
    </Popover>
  );
}

describe("Popover", () => {
  it("preserves the Kumo side variant contract", () => {
    expect(KUMO_POPOVER_DEFAULT_VARIANTS.side).toBe("bottom");
    expect(Object.keys(KUMO_POPOVER_VARIANTS.side)).toEqual([
      "top",
      "bottom",
      "left",
      "right",
    ]);
  });

  it("renders a closed accessible trigger without popup content", () => {
    render(() => <BasicPopover />);

    const trigger = screen.getByRole("button", {
      name: "Open details",
    });
    expect(trigger.getAttribute("data-kumo-component")).toBe("Popover");
    expect(trigger.getAttribute("data-kumo-part")).toBe("trigger");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Deployment details")).toBeNull();
  });

  it("opens, labels, describes, and closes popup content", async () => {
    const onOpenChange = vi.fn();
    render(() => <BasicPopover onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Open details" }));

    const title = await screen.findByText("Deployment details");
    const description = screen.getByText("Configuration for this deployment.");
    const popup = title.closest('[data-kumo-part="content"]');
    expect(popup).toBeTruthy();
    expect(popup?.getAttribute("aria-labelledby")).toBe(title.id);
    expect(popup?.getAttribute("aria-describedby")).toBe(description.id);
    expect(popup?.className).toContain("kumo-popover-popup");
    expect(popup?.querySelector("svg")).toBeTruthy();
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Close details" }));
    expect(onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);
    await waitFor(() =>
      expect(screen.queryByText("Deployment details")).toBeNull(),
    );
  });

  it("keeps controlled open state reactive", async () => {
    const [open, setOpen] = createSignal(false);
    const onOpenChange = vi.fn((nextOpen: boolean) => setOpen(nextOpen));
    render(() => (
      <Popover open={open()} onOpenChange={onOpenChange}>
        <Popover.Trigger>Controlled trigger</Popover.Trigger>
        <Popover.Content>
          <Popover.Title>Controlled content</Popover.Title>
        </Popover.Content>
      </Popover>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Controlled trigger" }));
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(true);
    expect(await screen.findByText("Controlled content")).toBeTruthy();

    setOpen(false);
    await waitFor(() =>
      expect(screen.queryByText("Controlled content")).toBeNull(),
    );
  });

  it("supports custom trigger and close render functions", async () => {
    render(() => (
      <Popover>
        <Popover.Trigger
          render={(renderProps) => (
            <a {...renderProps} href="#custom-popover" />
          )}
        >
          Custom trigger
        </Popover.Trigger>
        <Popover.Content>
          <Popover.Title>Custom content</Popover.Title>
          <Popover.Close
            render={(renderProps) => (
              <button {...renderProps} data-testid="custom-close" />
            )}
          >
            Custom close
          </Popover.Close>
        </Popover.Content>
      </Popover>
    ));

    const trigger = screen.getByRole("button", {
      name: "Custom trigger",
    });
    expect(trigger.tagName).toBe("A");
    expect(trigger.getAttribute("href")).toBe("#custom-popover");
    expect(trigger.hasAttribute("type")).toBe(false);

    fireEvent.click(trigger);
    expect(await screen.findByText("Custom content")).toBeTruthy();
    const close = screen.getByTestId("custom-close");
    expect(close.getAttribute("type")).toBe("button");
    fireEvent.click(close);
    await waitFor(() =>
      expect(screen.queryByText("Custom content")).toBeNull(),
    );
  });

  it("keeps title, description, and content class aliases", async () => {
    render(() => (
      <Popover defaultOpen>
        <Popover.Trigger>Styled trigger</Popover.Trigger>
        <Popover.Content class="custom-content" side="top">
          <Popover.Title className="custom-title">Styled title</Popover.Title>
          <Popover.Description class="custom-description">
            Styled description
          </Popover.Description>
        </Popover.Content>
      </Popover>
    ));

    const title = await screen.findByText("Styled title");
    expect(title.className).toContain("font-medium");
    expect(title.className).toContain("custom-title");
    expect(screen.getByText("Styled description").className).toContain(
      "custom-description",
    );
    expect(title.closest('[data-kumo-part="content"]')?.className).toContain(
      "custom-content",
    );
  });

  it("adapts trigger hover options to the Solid primitive", async () => {
    render(() => (
      <Popover>
        <Popover.Trigger openOnHover delay={0} closeDelay={0}>
          Hover trigger
        </Popover.Trigger>
        <Popover.Content>
          <Popover.Title>Hover content</Popover.Title>
        </Popover.Content>
      </Popover>
    ));
    const trigger = screen.getByRole("button", {
      name: "Hover trigger",
    });

    expect(trigger.hasAttribute("openOnHover")).toBe(false);
    expect(trigger.hasAttribute("delay")).toBe(false);
    fireEvent.mouseEnter(trigger);
    expect(await screen.findByText("Hover content")).toBeTruthy();
  });

  it("uses the Kumo portal context and content override", async () => {
    const contextContainer = document.createElement("div");
    const overrideContainer = document.createElement("div");
    document.body.append(contextContainer, overrideContainer);
    const result = render(() => (
      <KumoPortalProvider container={contextContainer}>
        <Popover defaultOpen>
          <Popover.Trigger>Portal trigger</Popover.Trigger>
          <Popover.Content>
            <Popover.Title>Context portal</Popover.Title>
          </Popover.Content>
        </Popover>
        <Popover defaultOpen>
          <Popover.Trigger>Override trigger</Popover.Trigger>
          <Popover.Content container={overrideContainer}>
            <Popover.Title>Override portal</Popover.Title>
          </Popover.Content>
        </Popover>
      </KumoPortalProvider>
    ));

    await screen.findByText("Context portal");
    expect(contextContainer.textContent).toContain("Context portal");
    expect(overrideContainer.textContent).toContain("Override portal");

    result.unmount();
    contextContainer.remove();
    overrideContainer.remove();
  });
});
