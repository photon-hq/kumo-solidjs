import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import {
  Radio,
  radioVariants,
  KUMO_RADIO_DEFAULT_VARIANTS,
  KUMO_RADIO_VARIANTS,
  type RadioGroupChangeEventDetails,
} from "./radio";

function selectRadio(name: string) {
  const control = screen.getByRole("radio", { name });
  const input = control.nextElementSibling as HTMLInputElement;

  input.checked = true;
  fireEvent.change(input);
}

describe("Radio", () => {
  it("renders an accessible group, legend, items, and default value", () => {
    render(() => (
      <Radio.Group legend="Choose option" defaultValue="a">
        <Radio.Item label="Option A" value="a" />
        <Radio.Item label="Option B" value="b" />
      </Radio.Group>
    ));

    expect(
      screen.getByRole("radiogroup", { name: "Choose option" }),
    ).not.toBeNull();
    expect(
      screen
        .getByRole("radio", { name: "Option A" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      screen
        .getByRole("radio", { name: "Option B" })
        .getAttribute("aria-checked"),
    ).toBe("false");
  });

  it("renders card descriptions and appearance-aware control positions", () => {
    render(() => (
      <Radio.Group
        legend="Plan"
        appearance="card"
        controlPosition="start"
        defaultValue="free"
      >
        <Radio.Item
          label="Free"
          description="For personal projects."
          value="free"
        />
      </Radio.Group>
    ));

    const label = screen.getByText("Free").closest("label")!;
    expect(label.className).toContain("flex-row-reverse");
    expect(label.className).toContain("border-kumo-hairline");
    expect(screen.getByText("For personal projects.")).not.toBeNull();
  });

  it("hides item descriptions in default appearance", () => {
    render(() => (
      <Radio.Group legend="Plan">
        <Radio.Item label="Free" description="Hidden" value="free" />
      </Radio.Group>
    ));
    expect(screen.queryByText("Hidden")).toBeNull();
  });

  it("supports rich labels, custom legends, errors, and descriptions", () => {
    render(() => (
      <Radio.Group error="Required" description="Pick one">
        <Radio.Legend className="sr-only">Plans</Radio.Legend>
        <Radio.Item
          label={
            <span>
              Pro <span data-testid="badge">Popular</span>
            </span>
          }
          value="pro"
        />
      </Radio.Group>
    ));

    expect(screen.getByRole("radiogroup", { name: "Plans" })).not.toBeNull();
    expect(screen.getByText("Plans").className).toContain("sr-only");
    expect(screen.getByTestId("badge")).not.toBeNull();
    expect(screen.getByText("Required")).not.toBeNull();
    expect(screen.getByText("Pick one")).not.toBeNull();
  });

  it("changes uncontrolled values and supplies compatibility event details", () => {
    const onValueChange = vi.fn(
      (_value: string, details: RadioGroupChangeEventDetails) => {
        details.allowPropagation();
      },
    );
    render(() => (
      <Radio.Group
        legend="Choice"
        defaultValue="a"
        onValueChange={onValueChange}
      >
        <Radio.Item label="A" value="a" />
        <Radio.Item label="B" value="b" />
      </Radio.Group>
    ));

    // Happy DOM recursively activates a nested label when Base UI forwards a
    // button click to its hidden radio input. Dispatching the input change
    // directly exercises the same state path without that environment bug.
    selectRadio("B");
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange.mock.calls[0]?.[0]).toBe("b");
    expect(onValueChange.mock.calls[0]?.[1].reason).toBe("none");
    expect(onValueChange.mock.calls[0]?.[1].event).toBeInstanceOf(Event);
    expect(onValueChange.mock.calls[0]?.[1].isPropagationAllowed).toBe(true);
    expect(
      screen.getByRole("radio", { name: "B" }).getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("honors canceled uncontrolled changes", () => {
    render(() => (
      <Radio.Group
        legend="Choice"
        defaultValue="a"
        onValueChange={(_value, details) => details.cancel()}
      >
        <Radio.Item label="A" value="a" />
        <Radio.Item label="B" value="b" />
      </Radio.Group>
    ));

    selectRadio("B");
    expect(
      screen.getByRole("radio", { name: "A" }).getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("keeps controlled values, layout, appearance, and items reactive", () => {
    const [value, setValue] = createSignal("a");
    const [card, setCard] = createSignal(false);
    render(() => (
      <>
        <Radio.Group
          legend="Choice"
          value={value()}
          appearance={card() ? "card" : "default"}
          orientation={card() ? "horizontal" : "vertical"}
          onValueChange={(next) => setValue(next)}
        >
          <Radio.Item label="A" value="a" description="Description" />
          <Radio.Item label="B" value="b" />
        </Radio.Group>
        <button type="button" onClick={() => setCard(true)}>
          Cards
        </button>
      </>
    ));

    selectRadio("B");
    expect(value()).toBe("b");
    fireEvent.click(screen.getByRole("button", { name: "Cards" }));
    expect(screen.getByText("Description")).not.toBeNull();
    expect(screen.getByText("A").closest("label")?.className).toContain(
      "rounded-lg",
    );
  });
});

describe("radio metadata", () => {
  it("preserves variants, defaults, and fallback behavior", () => {
    expect(KUMO_RADIO_DEFAULT_VARIANTS).toEqual({
      variant: "default",
      appearance: "default",
    });
    expect(KUMO_RADIO_VARIANTS.appearance.card.classes).toContain(
      "border-kumo-hairline",
    );
    expect(radioVariants({ variant: "error" })).toContain("ring-kumo-danger");

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(radioVariants({ variant: "invalid" as never })).toBe(
      radioVariants(),
    );
    warn.mockRestore();
  });
});
