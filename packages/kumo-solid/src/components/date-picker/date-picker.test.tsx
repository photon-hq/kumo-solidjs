import { fireEvent, render, screen, within } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import {
  DatePicker,
  type DatePickerModifiers,
  type DateRange,
} from "./date-picker";

const MAY_2025 = new Date(2025, 4, 1);

function dayButton(day: number, month = "May") {
  return screen.getByRole("button", {
    name: new RegExp(`${month} ${day}, 2025`),
  });
}

describe("DatePicker", () => {
  it("renders Kumo's DayPicker structure and defaults", () => {
    const { container } = render(() => (
      <DatePicker mode="single" month={MAY_2025} />
    ));

    expect(container.querySelector(".rdp-root")).toBeTruthy();
    expect(container.querySelector(".rounded-xl.bg-kumo-base")).toBeTruthy();
    expect(screen.getByText("May 2025")).toBeTruthy();
    expect(screen.getByRole("grid", { name: "May 2025" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Sunday" })).toBeTruthy();
    expect(dayButton(1).textContent).toBe("1");
    expect(
      screen.getByRole("button", { name: "Go to the Next Month" }),
    ).toBeTruthy();
  });

  it("supports uncontrolled single selection and optional clearing", () => {
    render(() => <DatePicker mode="single" month={MAY_2025} />);
    const day = dayButton(8);

    fireEvent.click(day);
    expect(day.closest("td")?.classList.contains("rdp-selected")).toBe(true);
    expect(day.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(day);
    expect(day.closest("td")?.classList.contains("rdp-selected")).toBe(false);
    expect(day.getAttribute("aria-pressed")).toBe("false");
  });

  it("preserves controlled single-selection callback semantics", () => {
    const [selected, setSelected] = createSignal<Date>();
    const onChange = vi.fn(
      (
        value: Date | undefined,
        _trigger: Date,
        _modifiers: DatePickerModifiers,
        _event: MouseEvent | KeyboardEvent,
      ) => setSelected(value),
    );
    render(() => (
      <DatePicker
        mode="single"
        month={MAY_2025}
        selected={selected()}
        onChange={onChange}
      />
    ));

    const day = dayButton(12);
    fireEvent.click(day);

    expect(selected()?.toDateString()).toBe(
      new Date(2025, 4, 12).toDateString(),
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.any(Date),
      expect.any(Date),
      expect.objectContaining({ selected: false }),
      expect.any(MouseEvent),
    );
    expect(day.closest("td")?.classList.contains("rdp-selected")).toBe(true);
  });

  it("supports multiple selection limits", () => {
    const [selected, setSelected] = createSignal<Date[]>([
      new Date(2025, 4, 2),
      new Date(2025, 4, 3),
    ]);
    render(() => (
      <DatePicker
        mode="multiple"
        month={MAY_2025}
        selected={selected()}
        max={2}
        onChange={(value) => setSelected(value ?? [])}
      />
    ));

    fireEvent.click(dayButton(4));
    expect(selected()).toHaveLength(1);
    expect(selected()[0].getDate()).toBe(4);
    expect(dayButton(4).closest("td")?.classList.contains("rdp-selected")).toBe(
      true,
    );
  });

  it("selects and styles ranges", () => {
    const [selected, setSelected] = createSignal<DateRange>();
    render(() => (
      <DatePicker
        mode="range"
        month={MAY_2025}
        selected={selected()}
        min={1}
        onChange={setSelected}
      />
    ));

    fireEvent.click(dayButton(10));
    fireEvent.click(dayButton(14));

    expect(selected()?.from?.getDate()).toBe(10);
    expect(selected()?.to?.getDate()).toBe(14);
    expect(
      dayButton(10).closest("td")?.classList.contains("rdp-range_start"),
    ).toBe(true);
    expect(
      dayButton(12).closest("td")?.classList.contains("rdp-range_middle"),
    ).toBe(true);
    expect(
      dayButton(14).closest("td")?.classList.contains("rdp-range_end"),
    ).toBe(true);
  });

  it("supports disabled matchers and custom modifiers", () => {
    const onChange = vi.fn();
    const { container } = render(() => (
      <DatePicker
        mode="single"
        month={MAY_2025}
        disabled={{ dayOfWeek: [0, 6] }}
        modifiers={{ billingDay: new Date(2025, 4, 15) }}
        modifiersClassNames={{ billingDay: "billing-day" }}
        onChange={onChange}
      />
    ));

    const saturday = dayButton(3);
    expect(saturday).toHaveProperty("disabled", true);
    fireEvent.click(saturday);
    expect(onChange).not.toHaveBeenCalled();
    expect(container.querySelector(".billing-day")).toBe(
      dayButton(15).closest("td"),
    );
  });

  it("navigates months and reacts to a controlled month", () => {
    const [month, setMonth] = createSignal(MAY_2025);
    const onMonthChange = vi.fn(setMonth);
    render(() => (
      <DatePicker mode="single" month={month()} onMonthChange={onMonthChange} />
    ));

    fireEvent.click(
      screen.getByRole("button", { name: "Go to the Next Month" }),
    );
    expect(screen.getByText("June 2025")).toBeTruthy();
    expect(onMonthChange).toHaveBeenCalledWith(expect.objectContaining({}));

    setMonth(new Date(2025, 6, 1));
    expect(screen.getByText("July 2025")).toBeTruthy();
  });

  it("renders multiple months, fixed weeks, week numbers, and a footer", () => {
    const { container } = render(() => (
      <DatePicker
        mode="range"
        month={MAY_2025}
        numberOfMonths={2}
        fixedWeeks
        showWeekNumber
        footer={<span>Select a stay</span>}
      />
    ));

    expect(screen.getByText("May 2025")).toBeTruthy();
    expect(screen.getByText("June 2025")).toBeTruthy();
    expect(container.querySelectorAll(".rdp-week")).toHaveLength(12);
    expect(screen.getByRole("status").textContent).toContain("Select a stay");
  });

  it("merges root classes and honors internal class overrides", () => {
    const { container } = render(() => (
      <DatePicker
        mode="single"
        month={MAY_2025}
        class="consumer-class"
        className="legacy-class"
        classNames={{ root: "custom-root", day: "custom-day" }}
        data-testid="calendar"
      />
    ));

    const root = screen.getByTestId("calendar");
    expect(root.classList.contains("rdp-root")).toBe(true);
    expect(root.classList.contains("custom-root")).toBe(true);
    expect(root.classList.contains("consumer-class")).toBe(true);
    expect(root.classList.contains("legacy-class")).toBe(true);
    expect(container.querySelector(".custom-day")).toBeTruthy();
  });

  it("supports month and year dropdown navigation", () => {
    render(() => (
      <DatePicker
        mode="single"
        month={MAY_2025}
        onMonthChange={() => undefined}
        captionLayout="dropdown"
        startMonth={new Date(2024, 0, 1)}
        endMonth={new Date(2026, 11, 1)}
      />
    ));

    const monthSelect = screen.getByRole("combobox", {
      name: "Choose the month",
    });
    const yearSelect = screen.getByRole("combobox", {
      name: "Choose the year",
    });
    expect(within(monthSelect).getAllByRole("option")).toHaveLength(12);
    expect(within(yearSelect).getAllByRole("option")).toHaveLength(3);
  });
});
