import { createSignal } from "solid-js";
import {
  DatePicker,
  Popover,
  Button,
  type DateRange,
} from "@photon-ai/kumo-solid";
import { CalendarDotsIcon } from "~/components/icons";

/**
 * Single date selection.
 */
export function DatePickerSingleDemo() {
  const [date, setDate] = createSignal<Date | undefined>();

  return (
    <div class="flex flex-col gap-4">
      <DatePicker
        mode="single"
        selected={date()}
        onChange={(d) => {
          if (d) {
            setDate(d);
          }
        }}
      />
      <p class="text-sm text-kumo-subtle">
        Selected: {date()?.toLocaleDateString() ?? "None"}
      </p>
    </div>
  );
}

/**
 * Multiple date selection with a maximum of 5 dates.
 */
export function DatePickerMultipleDemo() {
  const [dates, setDates] = createSignal<Date[] | undefined>();

  return (
    <div class="flex flex-col gap-4">
      <DatePicker
        mode="multiple"
        selected={dates()}
        onChange={setDates}
        max={5}
      />
      <p class="text-sm text-kumo-subtle">
        Selected: {dates()?.length ?? 0} date(s)
      </p>
    </div>
  );
}

/**
 * Date range selection with two months displayed.
 */
export function DatePickerRangeDemo() {
  const [range, setRange] = createSignal<DateRange | undefined>();
  const formattedRange = () => {
    const current = range();
    if (!current?.from) return "None";
    return `${current.from.toLocaleDateString()} - ${current.to?.toLocaleDateString() ?? "..."}`;
  };

  return (
    <div class="flex flex-col gap-4">
      <DatePicker
        mode="range"
        selected={range()}
        onChange={setRange}
        numberOfMonths={2}
      />
      <p class="text-sm text-kumo-subtle">Range: {formattedRange()}</p>
    </div>
  );
}

/**
 * Date range with minimum 3 nights and maximum 7 nights.
 */
export function DatePickerRangeMinMaxDemo() {
  const [range, setRange] = createSignal<DateRange | undefined>();

  return (
    <div class="flex flex-col gap-4">
      <DatePicker
        mode="range"
        selected={range()}
        onChange={setRange}
        min={3}
        max={7}
        footer={<span class="text-xs text-kumo-subtle">Select 3-7 nights</span>}
      />
    </div>
  );
}

/**
 * Date picker composed with a Popover for dropdown behavior.
 */
export function DatePickerPopoverDemo() {
  const [date, setDate] = createSignal<Date | undefined>();

  return (
    <Popover>
      <Popover.Trigger
        render={(renderProps) => (
          <Button {...renderProps} variant="outline" icon={CalendarDotsIcon} />
        )}
      >
        {date()?.toLocaleDateString() ?? "Pick a date"}
      </Popover.Trigger>
      <Popover.Content className="p-3">
        <DatePicker mode="single" selected={date()} onChange={setDate} />
      </Popover.Content>
    </Popover>
  );
}

/**
 * Date range picker composed with a Popover for dropdown behavior.
 */
export function DatePickerRangePopoverDemo() {
  const [range, setRange] = createSignal<DateRange | undefined>();

  const formatRange = () => {
    const current = range();
    if (!current?.from) return "Select dates";
    if (!current.to) return current.from.toLocaleDateString();
    return `${current.from.toLocaleDateString()} – ${current.to.toLocaleDateString()}`;
  };

  return (
    <Popover>
      <Popover.Trigger
        render={(renderProps) => (
          <Button {...renderProps} variant="outline" icon={CalendarDotsIcon} />
        )}
      >
        {formatRange()}
      </Popover.Trigger>
      <Popover.Content className="p-3">
        <DatePicker
          mode="range"
          selected={range()}
          onChange={setRange}
          numberOfMonths={2}
        />
      </Popover.Content>
    </Popover>
  );
}

/**
 * Date range picker with preset options in a popover.
 */
export function DatePickerRangeWithPresetsDemo() {
  const [range, setRange] = createSignal<DateRange | undefined>();
  const [month, setMonth] = createSignal<Date>(new Date());

  const today = new Date();

  const presets = [
    {
      label: "Today",
      range: { from: today, to: today },
    },
    {
      label: "Last 7 days",
      range: {
        from: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
        to: today,
      },
    },
    {
      label: "Last 30 days",
      range: {
        from: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
        to: today,
      },
    },
    {
      label: "Last 90 days",
      range: {
        from: new Date(today.getTime() - 89 * 24 * 60 * 60 * 1000),
        to: today,
      },
    },
    {
      label: "This month",
      range: {
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to: new Date(today.getFullYear(), today.getMonth() + 1, 0),
      },
    },
    {
      label: "Last month",
      range: {
        from: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        to: new Date(today.getFullYear(), today.getMonth(), 0),
      },
    },
  ];

  const handlePresetClick = (preset: { range: DateRange }) => {
    setRange(preset.range);
    // Navigate calendar to show the start of the range
    if (preset.range.from) {
      setMonth(preset.range.from);
    }
  };

  const isPresetActive = (preset: { range: DateRange }) => {
    const current = range();
    if (
      !current?.from ||
      !current.to ||
      !preset.range.from ||
      !preset.range.to
    ) {
      return false;
    }
    // Compare dates only (ignore time)
    const sameFrom =
      current.from.toDateString() === preset.range.from.toDateString();
    const sameTo = current.to.toDateString() === preset.range.to.toDateString();
    return sameFrom && sameTo;
  };

  const formatRange = () => {
    const current = range();
    if (!current?.from) return "Select dates";
    if (!current.to) return current.from.toLocaleDateString();
    return `${current.from.toLocaleDateString()} – ${current.to.toLocaleDateString()}`;
  };

  return (
    <Popover>
      <Popover.Trigger
        render={(renderProps) => (
          <Button {...renderProps} variant="outline" icon={CalendarDotsIcon} />
        )}
      >
        {formatRange()}
      </Popover.Trigger>
      <Popover.Content className="p-0">
        <div class="flex">
          <div class="flex flex-col gap-1 border-r border-kumo-hairline p-2 text-sm">
            {presets.map((preset) => {
              const isActive = isPresetActive(preset);
              return (
                <button
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  class={`rounded-md px-3 py-1.5 text-left whitespace-nowrap ${
                    isActive
                      ? "bg-kumo-bg-inverse text-kumo-text-inverse"
                      : "text-kumo-subtle hover:bg-kumo-control"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          <div class="p-3">
            <DatePicker
              mode="range"
              selected={range()}
              onChange={setRange}
              month={month()}
              onMonthChange={setMonth}
              numberOfMonths={2}
            />
          </div>
        </div>
      </Popover.Content>
    </Popover>
  );
}

/**
 * Date picker with disabled dates and a footer showing usage limits.
 */
export function DatePickerDisabledWithFooterDemo() {
  const [dates, setDates] = createSignal<Date[] | undefined>();
  const today = new Date();

  // Example: some dates are already used/unavailable
  const unavailableDates = [
    new Date(today.getFullYear(), today.getMonth(), 5),
    new Date(today.getFullYear(), today.getMonth(), 12),
    new Date(today.getFullYear(), today.getMonth(), 18),
    new Date(today.getFullYear(), today.getMonth(), 25),
  ];

  const selectedCount = () => dates()?.length ?? 0;
  const maxDays = 5;

  return (
    <DatePicker
      mode="multiple"
      selected={dates()}
      onChange={setDates}
      max={maxDays}
      disabled={unavailableDates}
      fixedWeeks
      footer={
        <p class="w-full pt-2 text-xs text-kumo-subtle">
          {selectedCount()}/{maxDays} days selected. Grayed dates are
          unavailable.
        </p>
      }
    />
  );
}
