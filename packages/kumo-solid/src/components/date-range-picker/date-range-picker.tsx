import { For, createMemo, createSignal, splitProps, type JSX } from "solid-js";
import {
  CaretLeftIcon,
  CaretRightIcon,
  GlobeHemisphereWestIcon,
} from "../../internal/icons";
import { cn } from "../../utils/cn";
import { resolveVariant } from "../../utils/resolve-variant";

export const KUMO_DATE_RANGE_PICKER_VARIANTS = {
  size: {
    sm: {
      classes: "p-3 gap-2",
      cellHeight: "h-[22px]",
      cellWidth: "w-6",
      calendarWidth: "w-[168px]",
      textSize: "text-xs",
      iconSize: 14,
      description: "Compact calendar for tight spaces",
    },
    base: {
      classes: "p-4 gap-2.5",
      cellHeight: "h-[26px]",
      cellWidth: "w-7",
      calendarWidth: "w-[196px]",
      textSize: "text-sm",
      iconSize: 16,
      description: "Default calendar size",
    },
    lg: {
      classes: "p-5 gap-3",
      cellHeight: "h-[32px]",
      cellWidth: "w-9",
      calendarWidth: "w-[252px]",
      textSize: "text-base",
      iconSize: 18,
      description: "Large calendar for prominent date selection",
    },
  },
  variant: {
    default: {
      classes: "bg-kumo-overlay",
      description: "Default calendar appearance",
    },
    subtle: {
      classes: "bg-kumo-base",
      description: "Subtle calendar with minimal background",
    },
  },
} as const;

export const KUMO_DATE_RANGE_PICKER_DEFAULT_VARIANTS = {
  size: "base",
  variant: "default",
} as const;

export type KumoDateRangePickerSize =
  keyof typeof KUMO_DATE_RANGE_PICKER_VARIANTS.size;
export type KumoDateRangePickerVariant =
  keyof typeof KUMO_DATE_RANGE_PICKER_VARIANTS.variant;

export interface KumoDateRangePickerVariantsProps {
  size?: KumoDateRangePickerSize;
  variant?: KumoDateRangePickerVariant;
}

export function dateRangePickerVariants({
  size = KUMO_DATE_RANGE_PICKER_DEFAULT_VARIANTS.size,
  variant = KUMO_DATE_RANGE_PICKER_DEFAULT_VARIANTS.variant,
}: KumoDateRangePickerVariantsProps = {}) {
  return cn(
    "flex w-fit flex-col rounded-xl select-none",
    resolveVariant(
      KUMO_DATE_RANGE_PICKER_VARIANTS.variant,
      variant,
      KUMO_DATE_RANGE_PICKER_DEFAULT_VARIANTS.variant,
    ).classes,
    resolveVariant(
      KUMO_DATE_RANGE_PICKER_VARIANTS.size,
      size,
      KUMO_DATE_RANGE_PICKER_DEFAULT_VARIANTS.size,
    ).classes,
  );
}

enum DateRangeCellMode {
  OUT_OF_RANGE,
  ENABLED,
  SELECTED_START_NODE,
  SELECTED_END_NODE,
  SELECTED,
  SELECTED_OUT_OF_RANGE,
}

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

type DivRef = JSX.HTMLAttributes<HTMLDivElement>["ref"];

export interface DateRangePickerProps extends KumoDateRangePickerVariantsProps {
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  timezone?: string;
  class?: string;
  className?: string;
  ref?: DivRef;
}

function getSizeConfig(size: KumoDateRangePickerSize) {
  return resolveVariant(
    KUMO_DATE_RANGE_PICKER_VARIANTS.size,
    size,
    KUMO_DATE_RANGE_PICKER_DEFAULT_VARIANTS.size,
  );
}

function startOfMonth(date: Date, offset = 0) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

function monthName(date: Date, offset = 0) {
  return startOfMonth(date, offset).toLocaleString("default", {
    month: "long",
  });
}

function monthYear(date: Date, offset = 0) {
  return startOfMonth(date, offset).getFullYear();
}

function monthStartingDay(date: Date, offset = 0) {
  return startOfMonth(date, offset).getDay();
}

function daysInMonth(date: Date, offset = 0) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + offset + 1,
    0,
  ).getDate();
}

function dateFromCell(date: Date, offset: number, index: number) {
  const month = startOfMonth(date, offset);
  const startingDay = month.getDay();
  const result = new Date(month);
  result.setDate(index - startingDay + 1);
  return result;
}

function isDateEqual(left: Date | null, right: Date | null) {
  return Boolean(left && right && left.toDateString() === right.toDateString());
}

function DateRangeDayCell(props: {
  date: Date;
  mode?: DateRangeCellMode;
  size: KumoDateRangePickerSize;
  onClick?: (date: Date) => void;
  isHoveringDate?: (date: Date) => void;
}) {
  const sizeConfig = () => getSizeConfig(props.size);
  const backgroundClass = () => {
    switch (props.mode) {
      case DateRangeCellMode.SELECTED_START_NODE:
        return "!bg-kumo-contrast rounded-tl-[5px] rounded-bl-[5px]";
      case DateRangeCellMode.SELECTED_END_NODE:
        return "!bg-kumo-contrast rounded-tr-[5px] rounded-br-[5px]";
      case DateRangeCellMode.SELECTED:
        return "bg-kumo-interact";
      case DateRangeCellMode.SELECTED_OUT_OF_RANGE:
        return "bg-kumo-fill";
      default:
        return "bg-transparent";
    }
  };
  const textClass = () => {
    switch (props.mode) {
      case DateRangeCellMode.OUT_OF_RANGE:
      case DateRangeCellMode.SELECTED_OUT_OF_RANGE:
        return "!text-kumo-subtle";
      case DateRangeCellMode.SELECTED_START_NODE:
      case DateRangeCellMode.SELECTED_END_NODE:
        return "!text-kumo-inverse";
      default:
        return "text-kumo-default";
    }
  };
  const ariaLabel = () => {
    const date = props.date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    if (props.mode === DateRangeCellMode.SELECTED_START_NODE) {
      return `${date}, selected as start date`;
    }
    if (props.mode === DateRangeCellMode.SELECTED_END_NODE) {
      return `${date}, selected as end date`;
    }
    if (props.mode === DateRangeCellMode.SELECTED) {
      return `${date}, within selected range`;
    }
    return date;
  };
  const isOutside = () =>
    props.mode === DateRangeCellMode.OUT_OF_RANGE ||
    props.mode === DateRangeCellMode.SELECTED_OUT_OF_RANGE;

  return (
    <button
      type="button"
      aria-label={ariaLabel()}
      id={props.date.toDateString()}
      class={cn(
        sizeConfig().cellHeight,
        sizeConfig().cellWidth,
        sizeConfig().textSize,
        "cursor-pointer text-center text-kumo-default transition-all duration-[50]",
        `leading-[${sizeConfig()
          .cellHeight.replace("h-[", "")
          .replace("]", "")}]`,
        !isOutside() && "hover:bg-kumo-interact",
        backgroundClass(),
        textClass(),
      )}
      onClick={() => props.onClick?.(props.date)}
      onMouseOver={() => props.isHoveringDate?.(props.date)}
      onFocus={() => props.isHoveringDate?.(props.date)}
    >
      {props.date.getDate()}
    </button>
  );
}

function DateRangeMonthHeader(props: {
  month: string;
  year: number;
  size: KumoDateRangePickerSize;
  updateCurrentMonth?: (date: Date) => void;
}) {
  const sizeConfig = () => getSizeConfig(props.size);

  return (
    <div>
      <div class="mb-3 text-center">
        <input
          aria-label="Edit month and year"
          value={`${props.month} ${props.year}`}
          class={cn(
            "w-full rounded-md border-none bg-transparent py-1.5 text-center font-semibold text-kumo-default transition-all duration-200 focus:ring-[1.5px] focus:ring-kumo-focus/50 focus:outline-none",
            sizeConfig().textSize,
          )}
          onBlur={(event) => {
            const value = event.currentTarget.value.trim();
            if (!value) return;
            const date = new Date(value);
            if (!Number.isNaN(date.getTime())) {
              props.updateCurrentMonth?.(date);
            }
          }}
        />
      </div>
      <div class="mt-2 grid grid-cols-7 gap-1">
        <For each={DAYS_OF_WEEK}>
          {(day) => (
            <div
              class={cn(
                "h-[22px] text-center text-kumo-subtle",
                sizeConfig().cellWidth,
                sizeConfig().textSize,
              )}
            >
              {day}
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

function DateRangeFooter(props: {
  timezone: string;
  size: KumoDateRangePickerSize;
  reset: () => void;
}) {
  const sizeConfig = () => getSizeConfig(props.size);

  return (
    <div
      class={cn(
        "flex items-center gap-2 text-kumo-subtle",
        sizeConfig().textSize,
      )}
    >
      <GlobeHemisphereWestIcon
        size={sizeConfig().iconSize}
        aria-hidden="true"
      />
      <span class="flex-1">Timezone: {props.timezone}</span>
      <button
        type="button"
        onClick={props.reset}
        class="cursor-pointer font-semibold text-kumo-default underline underline-offset-2"
      >
        Reset Dates
      </button>
    </div>
  );
}

export function DateRangePicker(inputProps: DateRangePickerProps) {
  const [props] = splitProps(inputProps, [
    "onStartDateChange",
    "onEndDateChange",
    "size",
    "variant",
    "timezone",
    "class",
    "className",
    "ref",
  ]);
  const [startDate, setStartDate] = createSignal<Date | null>(null);
  const [endDate, setEndDate] = createSignal<Date | null>(null);
  const [viewingMonth, setViewingMonth] = createSignal(
    startOfMonth(new Date()),
  );
  const [hoveringDate, setHoveringDate] = createSignal<Date | null>(null);
  const size = () => props.size ?? KUMO_DATE_RANGE_PICKER_DEFAULT_VARIANTS.size;
  const variant = () =>
    props.variant ?? KUMO_DATE_RANGE_PICKER_DEFAULT_VARIANTS.variant;
  const sizeConfig = () => getSizeConfig(size());
  const timezone = () => props.timezone ?? "New York, NY, USA (GMT-4)";

  const updateStartDate = (date: Date | null) => {
    setStartDate(date);
    props.onStartDateChange(date);
  };
  const updateEndDate = (date: Date | null) => {
    setEndDate(date);
    props.onEndDateChange(date);
  };
  const adjustMonth = (offset: number) => {
    setViewingMonth((current) => startOfMonth(current, offset));
  };
  const cellMode = (offset: number, index: number) => {
    const date = dateFromCell(viewingMonth(), offset, index);
    const firstDay = monthStartingDay(viewingMonth(), offset);
    const lastDay = firstDay + daysInMonth(viewingMonth(), offset) - 1;
    const outside = index < firstDay || index > lastDay;
    const insideSelectedRange = Boolean(
      startDate() && endDate() && date >= startDate()! && date <= endDate()!,
    );

    if (outside && insideSelectedRange) {
      return DateRangeCellMode.SELECTED_OUT_OF_RANGE;
    }
    if (outside) return DateRangeCellMode.OUT_OF_RANGE;
    if (isDateEqual(date, startDate())) {
      return DateRangeCellMode.SELECTED_START_NODE;
    }
    if (isDateEqual(date, endDate())) {
      return DateRangeCellMode.SELECTED_END_NODE;
    }
    if (insideSelectedRange) return DateRangeCellMode.SELECTED;
    if (
      startDate() &&
      !endDate() &&
      hoveringDate() &&
      hoveringDate()! > startDate()! &&
      date <= hoveringDate()! &&
      date > startDate()!
    ) {
      return DateRangeCellMode.SELECTED;
    }
    return DateRangeCellMode.ENABLED;
  };
  const selectDate = (date: Date) => {
    if (!startDate() || date < startDate()!) {
      updateStartDate(date);
      setHoveringDate(date);
    } else {
      updateEndDate(date);
    }
  };
  const previewDate = (date: Date) => {
    if (startDate() && !endDate() && date > startDate()!) {
      setHoveringDate(date);
    }
  };
  const cells = createMemo(() =>
    Array.from({ length: 42 }, (_, index) => index),
  );

  function MonthCalendar(monthProps: { offset: 0 | 1 }) {
    const offset = () => monthProps.offset;

    return (
      <div class={cn("relative", sizeConfig().calendarWidth)}>
        {offset() === 0 ? (
          <button
            type="button"
            aria-label="Previous month"
            class="absolute top-0 left-0 cursor-pointer rounded bg-kumo-interact/85 p-1.5 hover:bg-kumo-interact"
            onClick={() => adjustMonth(-1)}
          >
            <CaretLeftIcon size={sizeConfig().iconSize} />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Next month"
            class="absolute top-0 right-0 cursor-pointer rounded bg-kumo-interact/85 p-1.5 hover:bg-kumo-interact"
            onClick={() => adjustMonth(1)}
          >
            <CaretRightIcon size={sizeConfig().iconSize} />
          </button>
        )}
        <DateRangeMonthHeader
          month={monthName(viewingMonth(), offset())}
          year={monthYear(viewingMonth(), offset())}
          size={size()}
          updateCurrentMonth={(date) => {
            setViewingMonth(startOfMonth(date, -offset()));
          }}
        />
        <div class="grid grid-cols-7 gap-0 gap-y-0.5">
          <For each={cells()}>
            {(index) => (
              <DateRangeDayCell
                date={dateFromCell(viewingMonth(), offset(), index)}
                size={size()}
                mode={cellMode(offset(), index)}
                onClick={selectDate}
                isHoveringDate={previewDate}
              />
            )}
          </For>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={props.ref}
      class={cn(
        dateRangePickerVariants({ size: size(), variant: variant() }),
        props.class,
        props.className,
      )}
    >
      <div class="flex gap-4">
        <MonthCalendar offset={0} />
        <MonthCalendar offset={1} />
      </div>
      <DateRangeFooter
        timezone={timezone()}
        size={size()}
        reset={() => {
          updateStartDate(null);
          updateEndDate(null);
          setHoveringDate(null);
        }}
      />
    </div>
  );
}

export default DateRangePicker;
