import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import {
  DateRangePicker,
  KUMO_DATE_RANGE_PICKER_DEFAULT_VARIANTS,
  dateRangePickerVariants,
} from "./date-range-picker";

function calendarDay(day: number, month = "May") {
  return screen.getByRole("button", {
    name: new RegExp(`${month} ${day}, 2025`),
  });
}

describe("DateRangePicker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 4, 1, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("matches the legacy Kumo structure and defaults", () => {
    const { container } = render(() => (
      <DateRangePicker
        onStartDateChange={() => undefined}
        onEndDateChange={() => undefined}
      />
    ));

    expect(KUMO_DATE_RANGE_PICKER_DEFAULT_VARIANTS).toEqual({
      size: "base",
      variant: "default",
    });
    expect(dateRangePickerVariants()).toContain("bg-kumo-overlay");
    expect(container.querySelector(".w-\\[196px\\]")).toBeTruthy();
    const headers = screen.getAllByRole("textbox", {
      name: "Edit month and year",
    });
    expect(headers.map((header) => (header as HTMLInputElement).value)).toEqual(
      ["May 2025", "June 2025"],
    );
    expect(
      screen.getByText("Timezone: New York, NY, USA (GMT-4)"),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Previous month" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Next month" })).toBeTruthy();
  });

  it("selects a start and end date with matching visual states", () => {
    const onStartDateChange = vi.fn();
    const onEndDateChange = vi.fn();
    render(() => (
      <DateRangePicker
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
      />
    ));

    const start = calendarDay(10);
    fireEvent.click(start);
    const end = calendarDay(14);
    fireEvent.click(end);

    expect(onStartDateChange).toHaveBeenCalledWith(expect.any(Date));
    expect(onStartDateChange.mock.calls[0][0].getDate()).toBe(10);
    expect(onEndDateChange).toHaveBeenCalledWith(expect.any(Date));
    expect(onEndDateChange.mock.calls[0][0].getDate()).toBe(14);
    expect(start.classList.contains("!bg-kumo-contrast")).toBe(true);
    expect(end.classList.contains("!bg-kumo-contrast")).toBe(true);
    expect(calendarDay(12).classList.contains("bg-kumo-interact")).toBe(true);
    expect(start.getAttribute("aria-label")).toContain(
      "selected as start date",
    );
    expect(end.getAttribute("aria-label")).toContain("selected as end date");
  });

  it("previews a range on hover before an end date is chosen", () => {
    render(() => (
      <DateRangePicker
        onStartDateChange={() => undefined}
        onEndDateChange={() => undefined}
      />
    ));

    fireEvent.click(calendarDay(10));
    fireEvent.mouseOver(calendarDay(14));

    expect(calendarDay(12).classList.contains("bg-kumo-interact")).toBe(true);
    expect(calendarDay(12).getAttribute("aria-label")).toContain(
      "within selected range",
    );
  });

  it("moves the dual-calendar view with navigation controls", () => {
    render(() => (
      <DateRangePicker
        onStartDateChange={() => undefined}
        onEndDateChange={() => undefined}
      />
    ));

    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(
      screen
        .getAllByRole("textbox", { name: "Edit month and year" })
        .map((header) => (header as HTMLInputElement).value),
    ).toEqual(["June 2025", "July 2025"]);

    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(
      screen
        .getAllByRole("textbox", { name: "Edit month and year" })
        .map((header) => (header as HTMLInputElement).value),
    ).toEqual(["May 2025", "June 2025"]);
  });

  it("accepts direct month and year edits", () => {
    render(() => (
      <DateRangePicker
        onStartDateChange={() => undefined}
        onEndDateChange={() => undefined}
      />
    ));
    const firstHeader = screen.getAllByRole("textbox", {
      name: "Edit month and year",
    })[0];

    fireEvent.input(firstHeader, { target: { value: "August 2026" } });
    fireEvent.blur(firstHeader);

    expect(
      screen
        .getAllByRole("textbox", { name: "Edit month and year" })
        .map((header) => (header as HTMLInputElement).value),
    ).toEqual(["August 2026", "September 2026"]);
  });

  it("resets both dates and notifies consumers", () => {
    const onStartDateChange = vi.fn();
    const onEndDateChange = vi.fn();
    render(() => (
      <DateRangePicker
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
      />
    ));

    fireEvent.click(calendarDay(10));
    fireEvent.click(calendarDay(14));
    fireEvent.click(screen.getByRole("button", { name: "Reset Dates" }));

    expect(onStartDateChange).toHaveBeenLastCalledWith(null);
    expect(onEndDateChange).toHaveBeenLastCalledWith(null);
    expect(calendarDay(10).classList.contains("!bg-kumo-contrast")).toBe(false);
    expect(calendarDay(12).classList.contains("bg-kumo-interact")).toBe(false);
  });

  it("reacts to size, variant, timezone, classes, and refs", () => {
    const [size, setSize] = createSignal<"sm" | "lg">("sm");
    const [variant, setVariant] = createSignal<"default" | "subtle">("default");
    let root: HTMLDivElement | undefined;
    const { container } = render(() => (
      <>
        <DateRangePicker
          ref={(element) => {
            root = element;
          }}
          size={size()}
          variant={variant()}
          timezone="UTC"
          class="consumer-class"
          className="legacy-class"
          onStartDateChange={() => undefined}
          onEndDateChange={() => undefined}
        />
        <button
          type="button"
          onClick={() => {
            setSize("lg");
            setVariant("subtle");
          }}
        >
          Change
        </button>
      </>
    ));

    expect(root).toBe(container.firstElementChild);
    expect(root?.classList.contains("p-3")).toBe(true);
    expect(root?.classList.contains("bg-kumo-overlay")).toBe(true);
    expect(root?.classList.contains("consumer-class")).toBe(true);
    expect(root?.classList.contains("legacy-class")).toBe(true);
    expect(screen.getByText("Timezone: UTC")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(root?.classList.contains("p-5")).toBe(true);
    expect(root?.classList.contains("bg-kumo-base")).toBe(true);
    expect(container.querySelector(".w-\\[252px\\]")).toBeTruthy();
  });
});
