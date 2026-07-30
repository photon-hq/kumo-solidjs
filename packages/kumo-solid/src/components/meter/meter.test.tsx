import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vite-plus/test";
import { Meter, meterVariants } from "./meter";

describe("Meter", () => {
  it("renders the accessible meter, default value, and indicator", () => {
    render(() => <Meter label="Storage used" value={65} />);
    const meter = screen.getByRole("meter", { name: "Storage used" });
    const indicator = meter.querySelector(
      ".from-kumo-brand",
    ) as HTMLElement | null;

    expect(meter.className).toContain("flex-col");
    expect(meter.getAttribute("aria-valuetext")).toBe("65%");
    expect(screen.getByText("65%").getAttribute("aria-hidden")).toBe("true");
    expect(indicator?.style.width).toBe("65%");
  });

  it("supports custom ranges, values, visibility, and styling hooks", () => {
    const { unmount } = render(() => (
      <Meter
        label="Requests"
        value={750}
        max={1000}
        customValue="750 / 1,000"
        className="custom-root"
        trackClassName="custom-track"
        indicatorClassName="custom-indicator"
      />
    ));
    const meter = screen.getByRole("meter", { name: "Requests" });

    expect(meter.className).toContain("custom-root");
    expect(screen.getByText("750 / 1,000")).not.toBeNull();
    expect(meter.querySelector(".custom-track")).not.toBeNull();
    expect(meter.querySelector(".custom-indicator")).not.toBeNull();
    expect(
      (meter.querySelector(".custom-indicator") as HTMLElement).style.width,
    ).toBe("75%");

    unmount();
    render(() => <Meter label="Hidden" value={40} showValue={false} />);
    expect(screen.queryByText("40%")).toBeNull();
  });

  it("keeps value, label, and styling reactive", () => {
    const [value, setValue] = createSignal(20);
    const [label, setLabel] = createSignal("Initial");
    const [indicatorClass, setIndicatorClass] = createSignal("first");
    render(() => (
      <>
        <Meter
          label={label()}
          value={value()}
          indicatorClassName={indicatorClass()}
        />
        <button
          type="button"
          onClick={() => {
            setValue(80);
            setLabel("Updated");
            setIndicatorClass("second");
          }}
        >
          Change
        </button>
      </>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    const meter = screen.getByRole("meter", { name: "Updated" });
    expect(screen.getByText("80%")).not.toBeNull();
    expect((meter.querySelector(".second") as HTMLElement).style.width).toBe(
      "80%",
    );
  });

  it("preserves the variant helper", () => {
    expect(meterVariants()).toBe("flex w-full flex-col gap-2");
  });
});
