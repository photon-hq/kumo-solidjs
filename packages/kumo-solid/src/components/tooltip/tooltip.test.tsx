import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import {
  Tooltip,
  KUMO_TOOLTIP_DEFAULT_VARIANTS,
  tooltipVariants,
} from "./tooltip";
import { KumoPortalProvider } from "../../utils/portal-provider";

describe("Tooltip", () => {
  it("uses the same default side metadata and popup styles as Kumo", () => {
    expect(KUMO_TOOLTIP_DEFAULT_VARIANTS.side).toBe("top");
    expect(tooltipVariants()).toContain("bg-kumo-base");
    expect(tooltipVariants()).toContain("shadow-kumo-tip-shadow");
  });

  it("renders an accessible default button trigger", () => {
    render(() => <Tooltip content="Helpful detail">Help</Tooltip>);

    const trigger = screen.getByRole("button", { name: "Help" });
    expect(trigger.dataset.baseUiTooltipTrigger).toBe("");
    expect(trigger.className).toContain("cursor-default");
    expect(trigger.getAttribute("type")).toBe("button");
  });

  it("supports a Solid render function and merges trigger props", () => {
    render(() => (
      <Tooltip
        content="Helpful detail"
        className="custom-trigger"
        render={(triggerProps) => (
          <span {...triggerProps} data-testid="custom-trigger" />
        )}
      >
        Help
      </Tooltip>
    ));

    const trigger = screen.getByTestId("custom-trigger");
    expect(trigger.dataset.baseUiTooltipTrigger).toBe("");
    expect(trigger.className).toContain("custom-trigger");
    expect(trigger.textContent).toBe("Help");
  });

  it("opens immediately on hover when delay is zero", async () => {
    render(() => (
      <Tooltip content="Helpful detail" delay={0}>
        Help
      </Tooltip>
    ));

    const trigger = screen.getByRole("button", { name: "Help" });
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseMove(trigger);

    expect(await screen.findByText("Helpful detail")).toBeTruthy();
  });

  it("keeps controlled props and content reactive", async () => {
    const [open, setOpen] = createSignal(false);
    const [content, setContent] = createSignal("First");
    const onOpenChange = vi.fn((next: boolean) => setOpen(next));

    render(() => (
      <Tooltip
        content={content()}
        open={open()}
        onOpenChange={onOpenChange}
        delay={0}
      >
        Details
      </Tooltip>
    ));

    const trigger = screen.getByRole("button", { name: "Details" });
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseMove(trigger);

    expect(await screen.findByText("First")).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledWith(
      true,
      expect.anything(),
      "trigger-hover",
    );

    setContent("Second");
    expect(await screen.findByText("Second")).toBeTruthy();
  });

  it("uses the Kumo portal provider container", async () => {
    const portalContainer = document.createElement("div");
    document.body.append(portalContainer);

    render(() => (
      <KumoPortalProvider container={portalContainer}>
        <Tooltip content="Portaled detail" open>
          Details
        </Tooltip>
      </KumoPortalProvider>
    ));

    const popup = await screen.findByText("Portaled detail");
    expect(portalContainer.contains(popup)).toBe(true);
    portalContainer.remove();
  });
});
