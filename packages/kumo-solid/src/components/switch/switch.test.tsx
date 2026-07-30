import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import {
  Switch,
  switchVariants,
  KUMO_SWITCH_DEFAULT_VARIANTS,
  KUMO_SWITCH_VARIANTS,
} from "./switch";

describe("Switch", () => {
  it("renders a labeled switch and toggles through Base UI", () => {
    const onCheckedChange = vi.fn();
    render(() => (
      <Switch
        label="Notifications"
        required={false}
        onCheckedChange={onCheckedChange}
      />
    ));
    const control = screen.getByRole("switch", {
      name: "Notifications (optional)",
    });

    expect(control.getAttribute("aria-checked")).toBe("false");
    expect(screen.getByText("(optional)")).not.toBeNull();
    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("renders a bare switch with fallback naming and forwards attributes", () => {
    let ref: HTMLButtonElement | undefined;
    render(() => (
      <Switch
        ref={(element) => (ref = element)}
        id="setting"
        name="setting"
        transitioning
        className="custom-switch"
      />
    ));
    const control = screen.getByRole("switch", { name: "Switch" });

    expect(ref).toBe(control);
    expect(control.getAttribute("id")).toBe("setting");
    expect(control.getAttribute("aria-busy")).toBe("true");
    expect(control.className).toContain("custom-switch");
  });

  it("uses aria-pressed when consumers override the role", () => {
    render(() => <Switch aria-label="Toggle view" role="button" checked />);
    const control = screen.getByRole("button", { name: "Toggle view" });

    expect(control.getAttribute("aria-checked")).toBeNull();
    expect(control.getAttribute("aria-pressed")).toBe("true");
  });

  it("applies size, state, and semantic variant styles", () => {
    const { unmount } = render(() => (
      <Switch aria-label="Default" size="lg" checked />
    ));
    const checked = screen.getByRole("switch");
    expect(checked.className).toContain("h-5");
    expect(checked.className).toContain("w-10");
    expect(checked.className).toContain("bg-kumo-switch-track-checked");
    expect(checked.className).toContain("ring-kumo-switch-ring-checked");
    expect(checked.firstElementChild?.className).toContain("left-5");
    expect(checked.firstElementChild?.className).toContain(
      "bg-kumo-switch-thumb-checked",
    );

    unmount();
    render(() => <Switch aria-label="Neutral" variant="neutral" checked />);
    const neutral = screen.getByRole("switch");
    expect(neutral.className).toContain("bg-kumo-switch-neutral-track-checked");
    expect(neutral.className).toContain(
      "ring-kumo-switch-neutral-ring-checked",
    );
    expect(neutral.firstElementChild?.className).toContain(
      "bg-kumo-switch-neutral-thumb-checked",
    );
  });

  it("renders groups, composable legends, feedback, and item layout", () => {
    render(() => (
      <Switch.Group
        controlFirst={false}
        error="Required"
        description="Choose settings"
      >
        <Switch.Legend className="sr-only">Settings</Switch.Legend>
        <Switch.Item label="Email" />
      </Switch.Group>
    ));

    expect(screen.getByText("Settings").className).toContain("sr-only");
    expect(screen.getByText("Email").closest("label")?.className).toContain(
      "flex-row-reverse",
    );
    expect(screen.getByText("Required")).not.toBeNull();
    expect(screen.getByText("Choose settings")).not.toBeNull();
  });

  it("keeps controlled state, size, variant, and group layout reactive", () => {
    const [checked, setChecked] = createSignal(false);
    const [large, setLarge] = createSignal(false);
    render(() => (
      <>
        <Switch
          label="Reactive"
          checked={checked()}
          size={large() ? "lg" : "sm"}
          variant={large() ? "neutral" : "default"}
          onCheckedChange={setChecked}
        />
        <button type="button" onClick={() => setLarge(true)}>
          Change
        </button>
      </>
    ));
    const control = screen.getByRole("switch", { name: "Reactive" });

    fireEvent.click(control);
    expect(checked()).toBe(true);
    expect(control.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(control.className).toContain("w-10");
    expect(control.className).toContain("bg-kumo-switch-neutral-track-checked");
  });
});

describe("switch metadata", () => {
  it("preserves variants, defaults, and fallback behavior", () => {
    expect(KUMO_SWITCH_DEFAULT_VARIANTS).toEqual({
      size: "base",
      variant: "default",
    });
    expect(Object.keys(KUMO_SWITCH_VARIANTS.size)).toEqual([
      "sm",
      "base",
      "lg",
    ]);
    expect(switchVariants({ size: "lg" })).toContain("h-7.5");

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(switchVariants({ size: "invalid" as never })).toBe(switchVariants());
    warn.mockRestore();
  });
});
