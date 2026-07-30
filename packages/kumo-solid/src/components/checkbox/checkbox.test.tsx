import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import {
  Checkbox,
  checkboxVariants,
  KUMO_CHECKBOX_DEFAULT_VARIANTS,
} from "./checkbox";

describe("Checkbox", () => {
  it("preserves Kumo variant metadata", () => {
    expect(KUMO_CHECKBOX_DEFAULT_VARIANTS.variant).toBe("default");
    expect(checkboxVariants()).toContain(
      "[&:focus-within>span]:ring-kumo-focus",
    );
    expect(checkboxVariants({ variant: "error" })).toContain(
      "[&>span]:ring-kumo-danger",
    );
  });

  it("renders an accessible bare checkbox and toggles it", () => {
    const onCheckedChange = vi.fn();
    render(() => (
      <Checkbox aria-label="Select worker" onCheckedChange={onCheckedChange} />
    ));
    const checkbox = screen.getByRole("checkbox", { name: "Select worker" });

    expect(checkbox.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(checkbox);
    expect(checkbox.getAttribute("aria-checked")).toBe("true");
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.any(Event));
  });

  it("associates a visible label and supports label-first layout", () => {
    const { container } = render(() => (
      <Checkbox
        label="Enable notifications"
        controlFirst={false}
        required={false}
      />
    ));
    const checkbox = screen.getByRole("checkbox", {
      name: "Enable notifications (optional)",
    });
    const fieldLabel = checkbox.closest("label");

    expect(fieldLabel?.className).toContain("flex-row-reverse");
    expect(screen.getByText("(optional)")).toBeTruthy();
    const input = container.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { checked: true } });
    expect(checkbox.getAttribute("aria-checked")).toBe("true");
  });

  it("keeps controlled state, variant, and disabled props reactive", () => {
    const [checked, setChecked] = createSignal(false);
    const [error, setError] = createSignal(false);
    const [disabled, setDisabled] = createSignal(false);
    render(() => (
      <Checkbox
        aria-label="Reactive"
        checked={checked()}
        variant={error() ? "error" : "default"}
        disabled={disabled()}
      />
    ));
    const checkbox = screen.getByRole("checkbox", { name: "Reactive" });

    expect(checkbox.getAttribute("aria-checked")).toBe("false");
    expect(checkbox.className).toContain("ring-kumo-hairline");

    setChecked(true);
    setError(true);
    setDisabled(true);
    expect(checkbox.getAttribute("aria-checked")).toBe("true");
    expect(checkbox.className).toContain("ring-kumo-danger");
    expect(checkbox.hasAttribute("disabled")).toBe(true);
  });

  it("renders the indeterminate indicator", () => {
    render(() => <Checkbox aria-label="Mixed" indeterminate />);
    const checkbox = screen.getByRole("checkbox", { name: "Mixed" });
    const indicator = checkbox.querySelector("span");

    expect(checkbox.getAttribute("aria-checked")).toBe("mixed");
    expect(indicator?.querySelector("svg path")?.getAttribute("d")).toContain(
      "M228,128",
    );
  });

  it("forwards its ref to the button control", () => {
    let ref: HTMLButtonElement | undefined;
    render(() => (
      <Checkbox aria-label="Referenced" ref={(element) => (ref = element)} />
    ));

    expect(ref).toBe(screen.getByRole("checkbox", { name: "Referenced" }));
  });

  it("warns when no accessible name is provided", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(() => <Checkbox />);

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("must have an accessible name"),
    );
    warn.mockRestore();
  });
});

describe("Checkbox.Group", () => {
  it("manages item values and reports changes", () => {
    const onValueChange = vi.fn();
    const { container } = render(() => (
      <Checkbox.Group
        legend="Notifications"
        defaultValue={["email"]}
        onValueChange={onValueChange}
      >
        <Checkbox.Item label="Email" value="email" />
        <Checkbox.Item label="SMS" value="sms" />
      </Checkbox.Group>
    ));
    const email = screen.getByRole("checkbox", { name: "Email" });
    const sms = screen.getByRole("checkbox", { name: "SMS" });

    expect(email.getAttribute("aria-checked")).toBe("true");
    expect(sms.getAttribute("aria-checked")).toBe("false");
    const inputs = container.querySelectorAll('input[type="checkbox"]');
    fireEvent.change(inputs[1] as HTMLInputElement, {
      target: { checked: true },
    });
    expect(sms.getAttribute("aria-checked")).toBe("true");
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(["email", "sms"]);
  });

  it("renders legend, composable legend, error, and description", () => {
    render(() => (
      <Checkbox.Group error="Choose one" description="Used for alerts">
        <Checkbox.Legend className="custom-legend">Preferences</Checkbox.Legend>
        <Checkbox.Item label="Email" value="email" />
      </Checkbox.Group>
    ));

    expect(screen.getByText("Preferences").className).toContain(
      "custom-legend",
    );
    expect(screen.getByText("Choose one").className).toContain(
      "text-kumo-danger",
    );
    expect(screen.getByText("Used for alerts").className).toContain(
      "text-kumo-subtle",
    );
  });

  it("reactively changes item order and group disabled state", () => {
    const [controlFirst, setControlFirst] = createSignal(true);
    const [disabled, setDisabled] = createSignal(false);
    render(() => (
      <Checkbox.Group controlFirst={controlFirst()} disabled={disabled()}>
        <Checkbox.Item label="Email" value="email" />
      </Checkbox.Group>
    ));
    const checkbox = screen.getByRole("checkbox", { name: "Email" });
    const itemLabel = checkbox.closest("label") as HTMLLabelElement;

    expect(itemLabel.className).not.toContain("flex-row-reverse");
    setControlFirst(false);
    setDisabled(true);
    expect(itemLabel.className).toContain("flex-row-reverse");
    expect(checkbox.hasAttribute("disabled")).toBe(true);
  });
});
