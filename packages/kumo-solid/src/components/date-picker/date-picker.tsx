import {
  For,
  Show,
  createMemo,
  createSignal,
  splitProps,
  type Component,
  type JSX,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "../../internal/icons";
import { cn } from "../../utils/cn";

export type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

export type DateAfter = { after: Date };
export type DateBefore = { before: Date };
export type DateInterval = { after: Date; before: Date };
export type DayOfWeek = { dayOfWeek: number | number[] };
export type Matcher =
  | boolean
  | ((date: Date) => boolean)
  | Date
  | Date[]
  | DateRange
  | DateAfter
  | DateBefore
  | DateInterval
  | DayOfWeek;

export type DatePickerModifiers = Record<string, boolean>;
export type DatePickerClassNames = Record<string, string | undefined>;
export type DatePickerStyles = Record<string, JSX.CSSProperties | undefined>;

export interface DatePickerChevronProps {
  orientation: "up" | "down" | "left" | "right";
  size?: number;
  class?: string;
  disabled?: boolean;
}

export interface DatePickerCustomComponents {
  Chevron?: Component<DatePickerChevronProps>;
}

export interface DatePickerLabels {
  labelDayButton?: (date: Date, modifiers: DatePickerModifiers) => string;
  labelGrid?: (month: Date) => string;
  labelMonthDropdown?: () => string;
  labelNav?: () => string;
  labelNext?: (month?: Date) => string;
  labelPrevious?: (month?: Date) => string;
  labelWeekday?: (date: Date) => string;
  labelWeekNumber?: (weekNumber: number) => string;
  labelWeekNumberHeader?: () => string;
  labelYearDropdown?: () => string;
}

export interface DatePickerFormatters {
  formatCaption?: (month: Date) => string;
  formatDay?: (date: Date) => string;
  formatMonthDropdown?: (month: Date) => string;
  formatWeekdayName?: (date: Date) => string;
  formatWeekNumber?: (weekNumber: number) => string;
  formatWeekNumberHeader?: () => string;
  formatYearDropdown?: (year: Date) => string;
}

export interface DatePickerLocale {
  code?: string;
  options?: {
    weekStartsOn?: number;
  };
}

export type DatePickerSelectionEvent = MouseEvent | KeyboardEvent;
export type DatePickerOnChange<Value> = (
  selected: Value,
  triggerDate: Date,
  modifiers: DatePickerModifiers,
  event: DatePickerSelectionEvent,
) => void;
export type DatePickerDayEventHandler<EventType extends Event> = (
  date: Date,
  modifiers: DatePickerModifiers,
  event: EventType,
) => void;

type RootProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children" | "class" | "className" | "hidden" | "onChange" | "onSelect"
>;

export interface DatePickerBaseProps extends RootProps {
  class?: string;
  className?: string;
  classNames?: Partial<DatePickerClassNames>;
  styles?: Partial<DatePickerStyles>;
  modifiersClassNames?: Record<string, string>;
  modifiersStyles?: Record<string, JSX.CSSProperties>;
  defaultMonth?: Date;
  month?: Date;
  numberOfMonths?: number;
  startMonth?: Date;
  endMonth?: Date;
  /** @deprecated Use `startMonth`. */
  fromMonth?: Date;
  /** @deprecated Use `startMonth`. */
  fromYear?: number;
  /** @deprecated Use `endMonth`. */
  toMonth?: Date;
  /** @deprecated Use `endMonth`. */
  toYear?: number;
  pagedNavigation?: boolean;
  reverseMonths?: boolean;
  hideNavigation?: boolean;
  disableNavigation?: boolean;
  captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years";
  reverseYears?: boolean;
  navLayout?: "around" | "after";
  fixedWeeks?: boolean;
  hideWeekdays?: boolean;
  showOutsideDays?: boolean;
  showWeekNumber?: boolean;
  animate?: boolean;
  footer?: JSX.Element;
  autoFocus?: boolean;
  /** @deprecated Use `autoFocus`. */
  initialFocus?: boolean;
  disabled?: Matcher | Matcher[];
  hidden?: Matcher | Matcher[];
  today?: Date;
  modifiers?: Record<string, Matcher | Matcher[] | undefined>;
  labels?: Partial<DatePickerLabels>;
  formatters?: Partial<DatePickerFormatters>;
  locale?: DatePickerLocale | Intl.LocalesArgument;
  numerals?:
    | "latn"
    | "arab"
    | "arabext"
    | "deva"
    | "beng"
    | "guru"
    | "gujr"
    | "orya"
    | "tamldec"
    | "telu"
    | "knda"
    | "mlym";
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  onMonthChange?: (month: Date) => void;
  onNextClick?: (month: Date) => void;
  onPrevClick?: (month: Date) => void;
  onDayClick?: DatePickerDayEventHandler<MouseEvent>;
  onDayFocus?: DatePickerDayEventHandler<FocusEvent>;
  onDayBlur?: DatePickerDayEventHandler<FocusEvent>;
  onDayKeyDown?: DatePickerDayEventHandler<KeyboardEvent>;
  onDayMouseEnter?: DatePickerDayEventHandler<MouseEvent>;
  onDayMouseLeave?: DatePickerDayEventHandler<MouseEvent>;
  components?: DatePickerCustomComponents;
  min?: number;
  max?: number;
  excludeDisabled?: boolean;
}

export interface DatePickerSingleProps extends DatePickerBaseProps {
  mode: "single";
  required?: false | undefined;
  selected?: Date;
  onChange?: DatePickerOnChange<Date | undefined>;
}

export interface DatePickerSingleRequiredProps extends DatePickerBaseProps {
  mode: "single";
  required: true;
  selected: Date | undefined;
  onChange?: DatePickerOnChange<Date>;
}

export interface DatePickerMultipleProps extends DatePickerBaseProps {
  mode: "multiple";
  required?: false | undefined;
  selected?: Date[];
  onChange?: DatePickerOnChange<Date[] | undefined>;
  min?: number;
  max?: number;
}

export interface DatePickerMultipleRequiredProps extends DatePickerBaseProps {
  mode: "multiple";
  required: true;
  selected: Date[] | undefined;
  onChange?: DatePickerOnChange<Date[]>;
  min?: number;
  max?: number;
}

export interface DatePickerRangeProps extends DatePickerBaseProps {
  mode: "range";
  required?: false | undefined;
  selected?: DateRange;
  onChange?: DatePickerOnChange<DateRange | undefined>;
  min?: number;
  max?: number;
  excludeDisabled?: boolean;
}

export interface DatePickerRangeRequiredProps extends DatePickerBaseProps {
  mode: "range";
  required: true;
  selected: DateRange | undefined;
  onChange?: DatePickerOnChange<DateRange>;
  min?: number;
  max?: number;
  excludeDisabled?: boolean;
}

export type DatePickerProps =
  | DatePickerSingleProps
  | DatePickerSingleRequiredProps
  | DatePickerMultipleProps
  | DatePickerMultipleRequiredProps
  | DatePickerRangeProps
  | DatePickerRangeRequiredProps;

export type DayPickerProps = DatePickerProps;

type SelectionValue = Date | Date[] | DateRange | undefined;

const DEFAULT_CLASS_NAMES: DatePickerClassNames = {
  root: "rdp-root",
  months: "rdp-months",
  month: "rdp-month",
  month_caption: "rdp-month_caption",
  caption_label: "rdp-caption_label",
  dropdowns: "rdp-dropdowns",
  dropdown_root: "rdp-dropdown_root",
  dropdown: "rdp-dropdown",
  chevron: "rdp-chevron",
  nav: "rdp-nav",
  button_previous: "rdp-button_previous",
  button_next: "rdp-button_next",
  month_grid: "rdp-month_grid",
  weekdays: "rdp-weekdays",
  weekday: "rdp-weekday",
  weeks: "rdp-weeks",
  week: "rdp-week",
  week_number_header: "rdp-week_number_header",
  week_number: "rdp-week_number",
  day: "rdp-day",
  day_button: "rdp-day_button",
  today: "rdp-today",
  selected: "rdp-selected",
  outside: "rdp-outside",
  disabled: "rdp-disabled",
  hidden: "rdp-hidden",
  range_start: "rdp-range_start",
  range_middle: "rdp-range_middle",
  range_end: "rdp-range_end",
  focusable: "rdp-focusable",
  footer: "rdp-footer",
};

const DAY_MS = 86_400_000;

function isDatePickerLocale(
  locale: DatePickerBaseProps["locale"],
): locale is DatePickerLocale {
  return Boolean(
    locale &&
    typeof locale === "object" &&
    !Array.isArray(locale) &&
    ("code" in locale || "options" in locale),
  );
}

function isDateRangeValue(value: SelectionValue): value is DateRange {
  return Boolean(
    value &&
    !(value instanceof Date) &&
    !Array.isArray(value) &&
    "from" in value,
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function compareDays(left: Date, right: Date) {
  return startOfDay(left).getTime() - startOfDay(right).getTime();
}

function isSameDay(left: Date | undefined, right: Date | undefined) {
  return Boolean(left && right && compareDays(left, right) === 0);
}

function differenceInCalendarDays(later: Date, earlier: Date) {
  const laterUtc = Date.UTC(
    later.getFullYear(),
    later.getMonth(),
    later.getDate(),
  );
  const earlierUtc = Date.UTC(
    earlier.getFullYear(),
    earlier.getMonth(),
    earlier.getDate(),
  );
  return Math.round((laterUtc - earlierUtc) / DAY_MS);
}

function dateKey(date: Date) {
  return [
    date.getFullYear().toString().padStart(4, "0"),
    (date.getMonth() + 1).toString().padStart(2, "0"),
    date.getDate().toString().padStart(2, "0"),
  ].join("-");
}

function matchesDate(
  date: Date,
  matcher: Matcher | Matcher[] | undefined,
): boolean {
  if (matcher === undefined) return false;
  if (Array.isArray(matcher)) {
    return matcher.some((entry) => matchesDate(date, entry));
  }
  if (typeof matcher === "boolean") return matcher;
  if (typeof matcher === "function") return matcher(date);
  if (matcher instanceof Date) return isSameDay(date, matcher);

  if ("dayOfWeek" in matcher) {
    const days = Array.isArray(matcher.dayOfWeek)
      ? matcher.dayOfWeek
      : [matcher.dayOfWeek];
    return days.includes(date.getDay());
  }
  if ("after" in matcher && "before" in matcher) {
    return (
      compareDays(date, matcher.after) > 0 &&
      compareDays(date, matcher.before) < 0
    );
  }
  if ("after" in matcher) return compareDays(date, matcher.after) > 0;
  if ("before" in matcher) return compareDays(date, matcher.before) < 0;
  if ("from" in matcher || "to" in matcher) {
    const afterStart = matcher.from
      ? compareDays(date, matcher.from) >= 0
      : true;
    const beforeEnd = matcher.to ? compareDays(date, matcher.to) <= 0 : true;
    return afterStart && beforeEnd;
  }
  return false;
}

function addToRange(
  date: Date,
  initialRange: DateRange | undefined,
  min = 0,
  max = 0,
  required = false,
) {
  const from = initialRange?.from;
  const to = initialRange?.to;
  let range: DateRange | undefined;

  if (!from && !to) {
    range = { from: date, to: min > 0 ? undefined : date };
  } else if (from && !to) {
    if (isSameDay(from, date)) {
      if (min === 0) range = { from, to: date };
      else if (required) range = { from, to: undefined };
      else range = undefined;
    } else if (compareDays(date, from) < 0) {
      range = { from: date, to: from };
    } else {
      range = { from, to: date };
    }
  } else if (from && to) {
    if (isSameDay(from, date) && isSameDay(to, date)) {
      range = required ? { from, to } : undefined;
    } else if (isSameDay(from, date)) {
      range = { from, to: min > 0 ? undefined : date };
    } else if (isSameDay(to, date)) {
      range = { from: date, to: min > 0 ? undefined : date };
    } else if (compareDays(date, from) < 0) {
      range = { from: date, to };
    } else {
      range = { from, to: date };
    }
  }

  if (range?.from && range.to) {
    const difference = differenceInCalendarDays(range.to, range.from);
    if (max > 0 && difference > max) {
      return { from: date, to: undefined };
    }
    if (min > 1 && difference < min) {
      return { from: date, to: undefined };
    }
  }
  return range;
}

function rangeContainsMatcher(
  range: DateRange,
  matcher: Matcher | Matcher[] | undefined,
) {
  if (!range.from || !range.to || !matcher) return false;
  const cursor = startOfDay(range.from);
  const end = startOfDay(range.to);
  while (compareDays(cursor, end) <= 0) {
    if (matchesDate(cursor, matcher)) return true;
    cursor.setDate(cursor.getDate() + 1);
  }
  return false;
}

function weekNumber(date: Date, weekStartsOn: number) {
  const first = new Date(date.getFullYear(), 0, 1);
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  return Math.floor((differenceInCalendarDays(date, first) + offset) / 7) + 1;
}

function DefaultChevron(props: DatePickerChevronProps) {
  const iconProps = {
    class: props.class,
    size: props.size ?? 16,
    "aria-hidden": true,
  };
  if (props.orientation === "left") {
    return <CaretLeftIcon {...iconProps} />;
  }
  if (props.orientation === "right") {
    return <CaretRightIcon {...iconProps} />;
  }
  return (
    <CaretDownIcon
      {...iconProps}
      class={cn(props.class, props.orientation === "up" && "rotate-180")}
    />
  );
}

export function DatePicker(inputProps: DatePickerProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "mode",
    "required",
    "selected",
    "onChange",
    "min",
    "max",
    "excludeDisabled",
    "class",
    "className",
    "classNames",
    "styles",
    "modifiersClassNames",
    "modifiersStyles",
    "defaultMonth",
    "month",
    "numberOfMonths",
    "startMonth",
    "endMonth",
    "fromMonth",
    "fromYear",
    "toMonth",
    "toYear",
    "pagedNavigation",
    "reverseMonths",
    "hideNavigation",
    "disableNavigation",
    "captionLayout",
    "reverseYears",
    "navLayout",
    "fixedWeeks",
    "hideWeekdays",
    "showOutsideDays",
    "showWeekNumber",
    "animate",
    "footer",
    "autoFocus",
    "initialFocus",
    "disabled",
    "hidden",
    "today",
    "modifiers",
    "labels",
    "formatters",
    "locale",
    "numerals",
    "weekStartsOn",
    "onMonthChange",
    "onNextClick",
    "onPrevClick",
    "onDayClick",
    "onDayFocus",
    "onDayBlur",
    "onDayKeyDown",
    "onDayMouseEnter",
    "onDayMouseLeave",
    "components",
    "style",
  ]);
  const initialSelection = props.selected as SelectionValue;
  const [internalSelection, setInternalSelection] =
    createSignal<SelectionValue>(initialSelection);
  const initialMonth =
    props.month ??
    props.defaultMonth ??
    (initialSelection instanceof Date
      ? initialSelection
      : Array.isArray(initialSelection)
        ? initialSelection[0]
        : initialSelection?.from) ??
    props.today ??
    new Date();
  const [internalMonth, setInternalMonth] = createSignal(
    startOfMonth(initialMonth),
  );
  const selected = () =>
    props.onChange ? (props.selected as SelectionValue) : internalSelection();
  const visibleMonth = () =>
    props.month ? startOfMonth(props.month) : internalMonth();
  const monthCount = () => Math.max(1, props.numberOfMonths ?? 1);
  const weekStart = () =>
    props.weekStartsOn ??
    (isDatePickerLocale(props.locale)
      ? props.locale.options?.weekStartsOn
      : undefined) ??
    0;
  const locale = (): Intl.LocalesArgument => {
    if (isDatePickerLocale(props.locale)) {
      return props.locale.code ?? elementProps.lang ?? "en-US";
    }
    return (
      (props.locale as Intl.LocalesArgument | undefined) ??
      elementProps.lang ??
      "en-US"
    );
  };
  const firstAllowedMonth = () =>
    startOfMonth(
      props.startMonth ??
        props.fromMonth ??
        (props.fromYear !== undefined
          ? new Date(props.fromYear, 0, 1)
          : new Date(-100_000, 0, 1)),
    );
  const lastAllowedMonth = () =>
    startOfMonth(
      props.endMonth ??
        props.toMonth ??
        (props.toYear !== undefined
          ? new Date(props.toYear, 11, 1)
          : new Date(100_000, 11, 1)),
    );
  const visibleMonths = createMemo(() => {
    const months = Array.from({ length: monthCount() }, (_, index) =>
      addMonths(visibleMonth(), index),
    );
    return props.reverseMonths ? months.reverse() : months;
  });
  const classFor = (part: string) =>
    props.classNames?.[part] ?? DEFAULT_CLASS_NAMES[part];
  const styleFor = (parts: string[]) =>
    Object.assign(
      {},
      ...parts.map((part) => props.styles?.[part] ?? {}),
    ) as JSX.CSSProperties;
  const rootStyle = () => {
    if (typeof props.style === "string") return props.style;
    return {
      ...(props.styles?.root ?? {}),
      ...(props.style ?? {}),
    } as JSX.CSSProperties;
  };
  const Chevron = () => props.components?.Chevron ?? DefaultChevron;
  const dateFormatter = () =>
    new Intl.DateTimeFormat(locale(), {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
      numberingSystem: props.numerals,
    });

  const isSelected = (date: Date) => {
    const value = selected();
    if (props.mode === "single") {
      return value instanceof Date && isSameDay(value, date);
    }
    if (props.mode === "multiple") {
      return (
        Array.isArray(value) &&
        value.some((selectedDate) => isSameDay(selectedDate, date))
      );
    }
    const range = value as DateRange | undefined;
    return Boolean(
      range?.from &&
      compareDays(date, range.from) >= 0 &&
      (!range.to || compareDays(date, range.to) <= 0),
    );
  };

  const dayModifiers = (date: Date, outside: boolean) => {
    const value = selected();
    const range =
      props.mode === "range" ? (value as DateRange | undefined) : undefined;
    const result: DatePickerModifiers = {
      today: isSameDay(date, props.today ?? new Date()),
      selected: isSelected(date),
      outside,
      disabled: matchesDate(date, props.disabled),
      hidden: matchesDate(date, props.hidden),
      range_start: Boolean(range?.from && isSameDay(date, range.from)),
      range_end: Boolean(range?.to && isSameDay(date, range.to)),
      range_middle: Boolean(
        range?.from &&
        range.to &&
        compareDays(date, range.from) > 0 &&
        compareDays(date, range.to) < 0,
      ),
      focusable: true,
    };
    for (const [name, matcher] of Object.entries(props.modifiers ?? {})) {
      result[name] = matchesDate(date, matcher);
    }
    return result;
  };

  const triggerSelection = (
    date: Date,
    modifiers: DatePickerModifiers,
    event: DatePickerSelectionEvent,
  ) => {
    if (modifiers.disabled || modifiers.hidden) return;
    const current = selected();
    let next: SelectionValue;

    if (props.mode === "single") {
      const currentDate = current instanceof Date ? current : undefined;
      next = !props.required && isSameDay(currentDate, date) ? undefined : date;
    } else if (props.mode === "multiple") {
      const dates = Array.isArray(current) ? current : [];
      const alreadySelected = dates.some((entry) => isSameDay(entry, date));
      if (alreadySelected) {
        if (
          dates.length === props.min ||
          (props.required && dates.length === 1)
        ) {
          return;
        }
        next = dates.filter((entry) => !isSameDay(entry, date));
      } else if (dates.length === props.max) {
        next = [date];
      } else {
        next = [...dates, date];
      }
    } else {
      next = addToRange(
        date,
        current as DateRange | undefined,
        props.min,
        props.max,
        props.required,
      );
      if (
        props.excludeDisabled &&
        next &&
        rangeContainsMatcher(next, props.disabled)
      ) {
        next = { from: date, to: undefined };
      }
    }

    if (!props.onChange) setInternalSelection(next);
    const callback = props.onChange as
      | DatePickerOnChange<SelectionValue>
      | undefined;
    callback?.(next, date, modifiers, event);
  };

  const setVisibleMonth = (
    nextMonth: Date,
    direction?: "next" | "previous",
  ) => {
    const next = startOfMonth(nextMonth);
    if (
      compareDays(next, firstAllowedMonth()) < 0 ||
      compareDays(next, lastAllowedMonth()) > 0
    ) {
      return;
    }
    if (!props.month) setInternalMonth(next);
    props.onMonthChange?.(next);
    if (direction === "next") props.onNextClick?.(next);
    if (direction === "previous") props.onPrevClick?.(next);
  };

  const navigationStep = () => (props.pagedNavigation ? monthCount() : 1);
  const previousMonth = () => addMonths(visibleMonth(), -navigationStep());
  const nextMonth = () => addMonths(visibleMonth(), navigationStep());
  const previousDisabled = () =>
    Boolean(
      props.disableNavigation ||
      compareDays(previousMonth(), firstAllowedMonth()) < 0,
    );
  const nextDisabled = () =>
    Boolean(
      props.disableNavigation ||
      compareDays(nextMonth(), lastAllowedMonth()) > 0,
    );

  const weekdayDates = createMemo(() => {
    const sunday = new Date(2024, 0, 7);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + ((weekStart() + index) % 7));
      return date;
    });
  });

  const weeksForMonth = (month: Date) => {
    const first = startOfMonth(month);
    const offset = (first.getDay() - weekStart() + 7) % 7;
    const daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    ).getDate();
    const weekCount = props.fixedWeeks
      ? 6
      : Math.ceil((offset + daysInMonth) / 7);
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - offset);

    return Array.from({ length: weekCount }, (_, weekIndex) =>
      Array.from({ length: 7 }, (_unused, dayIndex) => {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + weekIndex * 7 + dayIndex);
        return date;
      }),
    );
  };

  const focusTarget = () => {
    const value = selected();
    if (value instanceof Date) return value;
    if (Array.isArray(value) && value[0]) return value[0];
    if (isDateRangeValue(value) && value.from) return value.from;
    return props.today ?? new Date();
  };

  const focusRelativeDay = (
    button: HTMLButtonElement,
    date: Date,
    offset: number,
  ) => {
    const target = new Date(date);
    target.setDate(date.getDate() + offset);
    const root = button.closest(".rdp-root");
    const targetButton = root?.querySelector<HTMLButtonElement>(
      `[data-day="${dateKey(target)}"]:not(:disabled)`,
    );
    targetButton?.focus();
  };

  const formatMonthCaption = (month: Date) =>
    props.formatters?.formatCaption?.(month) ??
    new Intl.DateTimeFormat(locale(), {
      month: "long",
      year: "numeric",
    }).format(month);
  const formatMonthOption = (month: Date) =>
    props.formatters?.formatMonthDropdown?.(month) ??
    new Intl.DateTimeFormat(locale(), { month: "long" }).format(month);
  const formatYearOption = (year: Date) =>
    props.formatters?.formatYearDropdown?.(year) ??
    new Intl.NumberFormat(locale(), {
      useGrouping: false,
      numberingSystem: props.numerals,
    }).format(year.getFullYear());
  const formatWeekday = (date: Date) =>
    props.formatters?.formatWeekdayName?.(date) ??
    new Intl.DateTimeFormat(locale(), { weekday: "short" }).format(date);
  const formatDay = (date: Date) =>
    props.formatters?.formatDay?.(date) ??
    new Intl.NumberFormat(locale(), {
      numberingSystem: props.numerals,
    }).format(date.getDate());

  const dropdownYears = createMemo(() => {
    const start =
      props.startMonth?.getFullYear() ??
      props.fromMonth?.getFullYear() ??
      props.fromYear ??
      new Date().getFullYear() - 100;
    const end =
      props.endMonth?.getFullYear() ??
      props.toMonth?.getFullYear() ??
      props.toYear ??
      new Date().getFullYear();
    const years = Array.from(
      { length: Math.max(0, end - start + 1) },
      (_, index) => start + index,
    );
    return props.reverseYears ? years.reverse() : years;
  });

  function CalendarChevron(chevronProps: DatePickerChevronProps) {
    return (
      <Dynamic
        component={Chevron()}
        {...chevronProps}
        class={cn(classFor("chevron"), chevronProps.class)}
      />
    );
  }

  function Caption(propsForCaption: { month: Date }) {
    const layout = () => props.captionLayout ?? "label";
    const showMonthDropdown = () =>
      layout() === "dropdown" || layout() === "dropdown-months";
    const showYearDropdown = () =>
      layout() === "dropdown" || layout() === "dropdown-years";

    return (
      <div
        class={classFor("month_caption")}
        style={styleFor(["month_caption"])}
      >
        <Show
          when={showMonthDropdown() || showYearDropdown()}
          fallback={
            <span
              class={classFor("caption_label")}
              style={styleFor(["caption_label"])}
            >
              {formatMonthCaption(propsForCaption.month)}
            </span>
          }
        >
          <div class={classFor("dropdowns")} style={styleFor(["dropdowns"])}>
            <Show
              when={showMonthDropdown()}
              fallback={
                <span class={classFor("caption_label")}>
                  {formatMonthOption(propsForCaption.month)}
                </span>
              }
            >
              <span
                class={classFor("dropdown_root")}
                style={styleFor(["dropdown_root"])}
              >
                <span class={classFor("caption_label")}>
                  {formatMonthOption(propsForCaption.month)}
                  <CalendarChevron orientation="down" size={14} />
                </span>
                <select
                  class={classFor("dropdown")}
                  aria-label={
                    props.labels?.labelMonthDropdown?.() ?? "Choose the month"
                  }
                  value={propsForCaption.month.getMonth()}
                  onChange={(event) => {
                    setVisibleMonth(
                      new Date(
                        propsForCaption.month.getFullYear(),
                        Number(event.currentTarget.value),
                        1,
                      ),
                    );
                  }}
                >
                  <For each={Array.from({ length: 12 }, (_, index) => index)}>
                    {(monthIndex) => {
                      const optionDate = new Date(
                        propsForCaption.month.getFullYear(),
                        monthIndex,
                        1,
                      );
                      return (
                        <option value={monthIndex}>
                          {formatMonthOption(optionDate)}
                        </option>
                      );
                    }}
                  </For>
                </select>
              </span>
            </Show>
            <Show
              when={showYearDropdown()}
              fallback={
                <span class={classFor("caption_label")}>
                  {formatYearOption(propsForCaption.month)}
                </span>
              }
            >
              <span
                class={classFor("dropdown_root")}
                style={styleFor(["dropdown_root"])}
              >
                <span class={classFor("caption_label")}>
                  {formatYearOption(propsForCaption.month)}
                  <CalendarChevron orientation="down" size={14} />
                </span>
                <select
                  class={classFor("dropdown")}
                  aria-label={
                    props.labels?.labelYearDropdown?.() ?? "Choose the year"
                  }
                  value={propsForCaption.month.getFullYear()}
                  onChange={(event) => {
                    setVisibleMonth(
                      new Date(
                        Number(event.currentTarget.value),
                        propsForCaption.month.getMonth(),
                        1,
                      ),
                    );
                  }}
                >
                  <For each={dropdownYears()}>
                    {(year) => (
                      <option value={year}>
                        {formatYearOption(new Date(year, 0, 1))}
                      </option>
                    )}
                  </For>
                </select>
              </span>
            </Show>
          </div>
        </Show>
      </div>
    );
  }

  function Month(propsForMonth: { month: Date }) {
    const gridLabel = () =>
      props.labels?.labelGrid?.(propsForMonth.month) ??
      formatMonthCaption(propsForMonth.month);

    return (
      <div class={classFor("month")} style={styleFor(["month"])}>
        <Caption month={propsForMonth.month} />
        <table
          class={classFor("month_grid")}
          style={styleFor(["month_grid"])}
          role="grid"
          aria-label={gridLabel()}
        >
          <Show when={!props.hideWeekdays}>
            <thead>
              <tr class={classFor("weekdays")} style={styleFor(["weekdays"])}>
                <Show when={props.showWeekNumber}>
                  <th
                    class={classFor("week_number_header")}
                    style={styleFor(["week_number_header"])}
                    aria-label={
                      props.labels?.labelWeekNumberHeader?.() ?? "Week number"
                    }
                  >
                    {props.formatters?.formatWeekNumberHeader?.() ?? ""}
                  </th>
                </Show>
                <For each={weekdayDates()}>
                  {(weekday) => (
                    <th
                      class={classFor("weekday")}
                      style={styleFor(["weekday"])}
                      scope="col"
                      aria-label={
                        props.labels?.labelWeekday?.(weekday) ??
                        new Intl.DateTimeFormat(locale(), {
                          weekday: "long",
                        }).format(weekday)
                      }
                    >
                      {formatWeekday(weekday)}
                    </th>
                  )}
                </For>
              </tr>
            </thead>
          </Show>
          <tbody class={classFor("weeks")} style={styleFor(["weeks"])}>
            <For each={weeksForMonth(propsForMonth.month)}>
              {(week) => (
                <tr class={classFor("week")} style={styleFor(["week"])}>
                  <Show when={props.showWeekNumber}>
                    {(() => {
                      const number = weekNumber(week[0], weekStart());
                      return (
                        <th
                          class={classFor("week_number")}
                          style={styleFor(["week_number"])}
                          scope="row"
                          aria-label={
                            props.labels?.labelWeekNumber?.(number) ??
                            `Week ${number}`
                          }
                        >
                          {props.formatters?.formatWeekNumber?.(number) ??
                            number}
                        </th>
                      );
                    })()}
                  </Show>
                  <For each={week}>
                    {(date) => {
                      const outside =
                        date.getMonth() !== propsForMonth.month.getMonth();
                      const modifiers = () => dayModifiers(date, outside);
                      const hiddenOutside = () =>
                        outside && props.showOutsideDays === false;
                      const activeModifierNames = () =>
                        Object.entries(modifiers())
                          .filter(([, active]) => active)
                          .map(([name]) => name);
                      const cellClass = () =>
                        cn(
                          classFor("day"),
                          ...activeModifierNames().map((name) =>
                            classFor(name),
                          ),
                          ...activeModifierNames().map(
                            (name) => props.modifiersClassNames?.[name],
                          ),
                          hiddenOutside() && classFor("hidden"),
                        );
                      const cellStyle = () =>
                        Object.assign(
                          {},
                          styleFor(["day", ...activeModifierNames()]),
                          ...activeModifierNames().map(
                            (name) => props.modifiersStyles?.[name] ?? {},
                          ),
                        ) as JSX.CSSProperties;
                      const dayLabel = () =>
                        props.labels?.labelDayButton?.(date, modifiers()) ??
                        `${dateFormatter().format(date)}${
                          modifiers().selected ? ", selected" : ""
                        }`;
                      const disabled = () =>
                        modifiers().disabled ||
                        modifiers().hidden ||
                        hiddenOutside();
                      const isFocusTarget = () =>
                        isSameDay(date, focusTarget()) && !disabled();

                      return (
                        <td
                          class={cellClass()}
                          style={cellStyle()}
                          role="gridcell"
                          aria-selected={
                            props.mode ? modifiers().selected : undefined
                          }
                          aria-hidden={
                            modifiers().hidden || hiddenOutside()
                              ? "true"
                              : undefined
                          }
                          data-day={dateKey(date)}
                        >
                          <button
                            type="button"
                            class={classFor("day_button")}
                            style={styleFor(["day_button"])}
                            disabled={disabled()}
                            aria-label={dayLabel()}
                            aria-pressed={
                              props.mode ? modifiers().selected : undefined
                            }
                            tabIndex={isFocusTarget() ? 0 : -1}
                            autofocus={
                              (props.autoFocus || props.initialFocus) &&
                              isFocusTarget()
                            }
                            data-day={dateKey(date)}
                            onClick={(event) => {
                              triggerSelection(date, modifiers(), event);
                              props.onDayClick?.(date, modifiers(), event);
                            }}
                            onFocus={(event) =>
                              props.onDayFocus?.(date, modifiers(), event)
                            }
                            onBlur={(event) =>
                              props.onDayBlur?.(date, modifiers(), event)
                            }
                            onMouseEnter={(event) =>
                              props.onDayMouseEnter?.(date, modifiers(), event)
                            }
                            onMouseLeave={(event) =>
                              props.onDayMouseLeave?.(date, modifiers(), event)
                            }
                            onKeyDown={(event) => {
                              props.onDayKeyDown?.(date, modifiers(), event);
                              const offsets: Partial<
                                Record<KeyboardEvent["key"], number>
                              > = {
                                ArrowLeft: elementProps.dir === "rtl" ? 1 : -1,
                                ArrowRight: elementProps.dir === "rtl" ? -1 : 1,
                                ArrowUp: -7,
                                ArrowDown: 7,
                                Home: -((date.getDay() - weekStart() + 7) % 7),
                                End:
                                  6 - ((date.getDay() - weekStart() + 7) % 7),
                              };
                              const offset = offsets[event.key];
                              if (offset !== undefined) {
                                event.preventDefault();
                                focusRelativeDay(
                                  event.currentTarget,
                                  date,
                                  offset,
                                );
                              }
                            }}
                          >
                            {hiddenOutside() ? "" : formatDay(date)}
                          </button>
                        </td>
                      );
                    }}
                  </For>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div
      {...elementProps}
      class={cn(
        "rdp-root rounded-xl bg-kumo-base select-none",
        props.classNames?.root,
        props.class,
        props.className,
      )}
      style={rootStyle()}
      data-nav-layout={props.navLayout}
      data-animated={props.animate ? "" : undefined}
    >
      <div class={classFor("months")} style={styleFor(["months"])}>
        <Show when={!props.hideNavigation}>
          <nav
            class={classFor("nav")}
            style={styleFor(["nav"])}
            aria-label={props.labels?.labelNav?.() ?? "Month navigation"}
          >
            <button
              type="button"
              class={classFor("button_previous")}
              style={styleFor(["button_previous"])}
              disabled={previousDisabled()}
              aria-label={
                props.labels?.labelPrevious?.(previousMonth()) ??
                "Go to the Previous Month"
              }
              onClick={() => setVisibleMonth(previousMonth(), "previous")}
            >
              <CalendarChevron orientation="left" size={16} />
            </button>
            <button
              type="button"
              class={classFor("button_next")}
              style={styleFor(["button_next"])}
              disabled={nextDisabled()}
              aria-label={
                props.labels?.labelNext?.(nextMonth()) ?? "Go to the Next Month"
              }
              onClick={() => setVisibleMonth(nextMonth(), "next")}
            >
              <CalendarChevron orientation="right" size={16} />
            </button>
          </nav>
        </Show>
        <For each={visibleMonths()}>{(month) => <Month month={month} />}</For>
      </div>
      <Show when={props.footer !== undefined}>
        <div
          class={classFor("footer")}
          style={styleFor(["footer"])}
          role="status"
          aria-live="polite"
        >
          {props.footer}
        </div>
      </Show>
    </div>
  );
}
