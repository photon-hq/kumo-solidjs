import {
  For,
  Show,
  createContext,
  createEffect,
  on,
  splitProps,
  useContext,
  type Accessor,
  type JSX,
} from "solid-js";
import { CaretDownIcon, CheckIcon, XIcon } from "../../internal/icons";
import {
  SearchChip,
  SearchChipRemove,
  SearchChipValueProvider,
  SearchChips,
  SearchClear,
  SearchCollection,
  SearchEmpty,
  SearchGroup,
  SearchGroupLabel,
  SearchIcon,
  SearchInput,
  SearchItem,
  SearchList,
  SearchPopup,
  SearchRoot,
  SearchTrigger,
  SearchValue,
  createSearchFilter,
  useSearchControl,
  type SearchChangeDetails,
  type SearchFilter,
  type SearchFilterOptions,
  type SearchGroupLabelProps,
  type SearchGroupProps,
  type SearchInputProps,
  type SearchItemProps,
  type SearchListProps,
  type SearchPopupProps,
  type SearchTriggerProps,
  type SearchValueProps,
} from "../../internal/search-control";
import { cn } from "../../utils/cn";
import {
  usePortalContainerAccessor,
  type PortalContainer,
} from "../../utils/portal-provider";
import { resolveVariant } from "../../utils/resolve-variant";
import { Field, normalizeFieldError, type FieldErrorMatch } from "../field";
import {
  inputVariants,
  KUMO_INPUT_VARIANTS,
  type KumoInputSize,
} from "../input/input";

/** Combobox variant definitions. */
export const KUMO_COMBOBOX_VARIANTS = {
  size: KUMO_INPUT_VARIANTS.size,
  inputSide: {
    right: {
      classes: "",
      description: "Input positioned inline to the right of chips",
    },
    top: {
      classes: "",
      description: "Input positioned above chips",
    },
  },
} as const;

export const KUMO_COMBOBOX_DEFAULT_VARIANTS = {
  size: "base",
  inputSide: "right",
} as const;

export type KumoComboboxSize = keyof typeof KUMO_COMBOBOX_VARIANTS.size;
export type KumoComboboxInputSide =
  keyof typeof KUMO_COMBOBOX_VARIANTS.inputSide;
export type ComboboxInputSide = KumoComboboxInputSide;
export type ComboboxSize = KumoComboboxSize;

export interface KumoComboboxVariantsProps {
  /** @default "base" */
  size?: KumoComboboxSize;
  /** @default "right" */
  inputSide?: KumoComboboxInputSide;
}

export function comboboxVariants({
  inputSide = KUMO_COMBOBOX_DEFAULT_VARIANTS.inputSide,
}: KumoComboboxVariantsProps = {}) {
  return cn(
    resolveVariant(
      KUMO_COMBOBOX_VARIANTS.inputSide,
      inputSide,
      KUMO_COMBOBOX_DEFAULT_VARIANTS.inputSide,
    ).classes,
  );
}

type ComboboxValue<
  Value,
  Multiple extends boolean | undefined,
> = Multiple extends true ? Value[] : Value | null;

export type ComboboxRootProps<
  Item = unknown,
  Multiple extends boolean | undefined = false,
  Value = Item,
> = {
  items: readonly Item[];
  value?: ComboboxValue<Value, Multiple>;
  defaultValue?: ComboboxValue<Value, Multiple>;
  onValueChange?: (
    value: ComboboxValue<Value, Multiple>,
    details: SearchChangeDetails,
  ) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string, details: SearchChangeDetails) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: SearchChangeDetails) => void;
  onItemHighlighted?: (
    item: Item | undefined,
    details: { reason: string; event: Event; index: number },
  ) => void;
  filter?: (item: Item, query: string) => boolean;
  itemToStringLabel?: (item: Item) => string;
  itemToStringValue?: (item: Value) => string;
  isItemEqualToValue?: (item: Value, value: Value) => boolean;
  multiple?: Multiple;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  children?: JSX.Element;
  class?: string;
  className?: string;
  label?: JSX.Element;
  labelTooltip?: JSX.Element;
  description?: JSX.Element;
  error?: string | { message: JSX.Element; match: FieldErrorMatch };
  size?: KumoComboboxSize;
};

export interface ComboboxProps extends ComboboxRootProps<
  unknown,
  boolean,
  unknown
> {}

interface ComboboxContextValue {
  size: Accessor<KumoInputSize>;
  hasError: Accessor<boolean>;
}

const ComboboxContext = createContext<ComboboxContextValue>({
  size: () => "base" as KumoInputSize,
  hasError: () => false,
});

function serializeValue(
  value: unknown,
  itemToStringValue?: (value: never) => string,
) {
  if (itemToStringValue) {
    return itemToStringValue(value as never);
  }
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  if (value && typeof value === "object") {
    const candidate = value as Record<string, unknown>;
    if (
      typeof candidate.value === "string" ||
      typeof candidate.value === "number"
    ) {
      return String(candidate.value);
    }
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function HiddenInputs(props: {
  name: string;
  itemToStringValue?: (value: never) => string;
}) {
  const search = useSearchControl();
  const values = () => {
    const selected = search.selectedValue();
    if (Array.isArray(selected)) return selected;
    return selected == null ? [] : [selected];
  };

  return (
    <For each={values()}>
      {(value) => (
        <input
          type="hidden"
          name={props.name}
          value={serializeValue(value, props.itemToStringValue)}
        />
      )}
    </For>
  );
}

function Root<Item, Multiple extends boolean | undefined = false, Value = Item>(
  props: ComboboxRootProps<Item, Multiple, Value>,
) {
  const size = () => props.size ?? KUMO_COMBOBOX_DEFAULT_VARIANTS.size;
  const hasError = () => Boolean(props.error);
  const accessibleLabel = () =>
    typeof props.label === "string" ? props.label : undefined;
  const control = () => (
    <ComboboxContext.Provider value={{ size, hasError }}>
      <SearchRoot
        items={props.items}
        inputValue={props.inputValue}
        defaultInputValue={props.defaultInputValue}
        onInputValueChange={props.onInputValueChange}
        open={props.open}
        defaultOpen={props.defaultOpen}
        onOpenChange={props.onOpenChange}
        onItemHighlighted={props.onItemHighlighted}
        itemToStringValue={
          props.itemToStringLabel ??
          (props.itemToStringValue as ((item: Item) => string) | undefined)
        }
        filter={props.filter}
        autoHighlight="always"
        openOnInputClick
        disabled={props.disabled}
        required={props.required}
        accessibleLabel={accessibleLabel()}
        selectionMode={props.multiple ? "multiple" : "single"}
        selectedValue={
          props.value as unknown as Item | Item[] | null | undefined
        }
        defaultSelectedValue={
          props.defaultValue as unknown as Item | Item[] | null | undefined
        }
        onSelectedValueChange={(value, details) =>
          props.onValueChange?.(
            value as unknown as ComboboxValue<Value, Multiple>,
            details,
          )
        }
        isItemEqualToValue={
          props.isItemEqualToValue as
            | ((item: Item, value: Item) => boolean)
            | undefined
        }
        closeOnSelect={!props.multiple}
      >
        {props.children}
        <Show when={props.name}>
          {(name) => (
            <HiddenInputs
              name={name()}
              itemToStringValue={
                props.itemToStringValue as
                  | ((value: never) => string)
                  | undefined
              }
            />
          )}
        </Show>
      </SearchRoot>
    </ComboboxContext.Provider>
  );
  const styledControl = () => (
    <Show when={props.class ?? props.className} fallback={control()}>
      <div class={cn(props.class, props.className)}>{control()}</div>
    </Show>
  );

  return (
    <Show when={props.label} fallback={styledControl()}>
      {(label) => (
        <Field
          label={label()}
          required={props.required}
          labelTooltip={props.labelTooltip}
          description={props.description}
          error={normalizeFieldError(props.error)}
        >
          {styledControl()}
        </Field>
      )}
    </Show>
  );
}

export interface ComboboxContentProps extends Omit<SearchPopupProps, "class"> {
  class?: string;
  className?: string;
  container?: PortalContainer;
}

function Content(inputProps: ComboboxContentProps) {
  const [props, popupProps] = splitProps(inputProps, [
    "align",
    "class",
    "className",
    "container",
    "sideOffset",
  ]);
  const contextContainer = usePortalContainerAccessor();
  const container = () => props.container ?? contextContainer() ?? undefined;
  return (
    <SearchPopup
      {...popupProps}
      align={props.align ?? "start"}
      sideOffset={props.sideOffset ?? 4}
      container={container()}
      data-kumo-component="Combobox"
      data-kumo-part="content"
      class={cn(
        "z-50 flex flex-col",
        "max-h-[min(var(--available-height),24rem)] max-w-(--available-width) min-w-(--anchor-width) py-1.5",
        "bg-kumo-base text-kumo-default",
        "rounded-lg shadow-lg ring ring-kumo-line",
        props.class,
        props.className,
      )}
    />
  );
}

const triggerValueIconStyles: Record<
  KumoComboboxSize,
  { padding: string; iconSize: number; iconRight: string }
> = {
  xs: { padding: "pr-5", iconSize: 12, iconRight: "right-1" },
  sm: { padding: "pr-6", iconSize: 14, iconRight: "right-1.5" },
  base: { padding: "pr-8", iconSize: 16, iconRight: "right-2" },
  lg: { padding: "pr-10", iconSize: 18, iconRight: "right-3" },
};

export interface ComboboxTriggerValueProps extends SearchValueProps {
  "aria-label"?: string;
  disabled?: boolean;
}

function TriggerValue(props: ComboboxTriggerValueProps) {
  const combobox = useContext(ComboboxContext);
  const search = useSearchControl();
  const iconStyles = () => triggerValueIconStyles[combobox.size()];
  const placeholder = () => search.selectedValue() == null;

  return (
    <SearchTrigger
      data-kumo-component="Combobox"
      data-kumo-part="trigger"
      aria-label={props["aria-label"]}
      disabled={props.disabled}
      data-placeholder={placeholder() ? "" : undefined}
      class={cn(
        inputVariants({
          size: combobox.size(),
          variant: combobox.hasError() ? "error" : "default",
        }),
        "relative flex items-center",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        "data-[placeholder]:text-kumo-placeholder",
        iconStyles().padding,
        props.class,
        props.className,
      )}
    >
      <SearchValue placeholder={props.placeholder} class={props.class}>
        {props.children}
      </SearchValue>
      <SearchIcon
        class={cn(
          "absolute top-1/2 flex -translate-y-1/2 items-center text-kumo-subtle",
          iconStyles().iconRight,
        )}
      >
        <CaretDownIcon size={iconStyles().iconSize} class="fill-current" />
      </SearchIcon>
    </SearchTrigger>
  );
}

const triggerInputIconStyles: Record<
  KumoComboboxSize,
  {
    padding: string;
    iconSize: number;
    clearRight: string;
    caretRight: string;
  }
> = {
  xs: {
    padding: "pr-7",
    iconSize: 12,
    clearRight: "right-5",
    caretRight: "right-1",
  },
  sm: {
    padding: "pr-9",
    iconSize: 14,
    clearRight: "right-6",
    caretRight: "right-1.5",
  },
  base: {
    padding: "pr-12",
    iconSize: 16,
    clearRight: "right-8",
    caretRight: "right-2",
  },
  lg: {
    padding: "pr-14",
    iconSize: 18,
    clearRight: "right-9",
    caretRight: "right-3",
  },
};

export interface ComboboxTriggerInputProps extends Omit<
  SearchInputProps,
  "class"
> {
  class?: string;
  className?: string;
  clearLabel?: string;
  showOptionsLabel?: string;
}

function TriggerInput(inputProps: ComboboxTriggerInputProps) {
  const [props, inputPropsRest] = splitProps(inputProps, [
    "class",
    "className",
    "clearLabel",
    "showOptionsLabel",
  ]);
  const combobox = useContext(ComboboxContext);
  const search = useSearchControl();
  const iconStyles = () => triggerInputIconStyles[combobox.size()];

  createEffect(
    on(
      search.selectedValue,
      (selected) => {
        if (Array.isArray(selected)) return;
        search.syncInputValue(
          selected == null ? "" : search.itemToString(selected),
        );
      },
      { defer: false },
    ),
  );

  return (
    <div
      ref={search.setAnchor}
      class={cn(
        "relative inline-block w-full max-w-xs",
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        props.class,
        props.className,
      )}
    >
      <SearchInput
        {...inputPropsRest}
        anchor={false}
        data-kumo-component="Combobox"
        data-kumo-part="input"
        class={cn(
          inputVariants({
            size: combobox.size(),
            variant: combobox.hasError() ? "error" : "default",
          }),
          "w-full disabled:cursor-not-allowed",
          iconStyles().padding,
        )}
      />
      <SearchClear
        data-kumo-component="Combobox"
        data-kumo-part="clear"
        aria-label={props.clearLabel ?? "Clear selection"}
        class={cn(
          "absolute top-1/2 flex -translate-y-1/2 cursor-pointer bg-transparent p-0",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-0",
          iconStyles().clearRight,
        )}
      >
        <XIcon size={iconStyles().iconSize} />
      </SearchClear>
      <SearchTrigger
        anchor={false}
        data-kumo-component="Combobox"
        data-kumo-part="trigger"
        role="button"
        aria-label={props.showOptionsLabel ?? "Show options"}
        class={cn(
          "absolute top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center text-kumo-subtle",
          "m-0 bg-transparent p-0",
          iconStyles().caretRight,
        )}
      >
        <SearchIcon class="flex items-center">
          <CaretDownIcon size={iconStyles().iconSize} class="fill-current" />
        </SearchIcon>
      </SearchTrigger>
    </div>
  );
}

export interface ComboboxItemProps<Item = unknown> extends Omit<
  SearchItemProps<Item>,
  "class"
> {
  class?: string;
  className?: string;
}

function Item<Item = unknown>(inputProps: ComboboxItemProps<Item>) {
  const [props, itemProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "value",
  ]);
  const search = useSearchControl();
  return (
    <SearchItem
      {...itemProps}
      value={props.value}
      data-kumo-component="Combobox"
      data-kumo-part="item"
      class={cn(
        "group mx-1.5 grid grid-cols-[1fr_16px] gap-2 rounded px-2 py-1.5 text-base",
        "cursor-pointer data-highlighted:bg-kumo-tint",
        "data-[disabled]:cursor-not-allowed data-[disabled]:text-kumo-subtle data-[disabled]:opacity-60 data-[disabled]:data-highlighted:bg-transparent",
        props.class,
        props.className,
      )}
    >
      <div class="col-start-1">{props.children}</div>
      <Show when={search.isSelected(props.value)}>
        <span class="col-start-2 flex items-center">
          <CheckIcon />
        </span>
      </Show>
    </SearchItem>
  );
}

export interface ComboboxEmptyProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children" | "class"
> {
  children?: JSX.Element;
  class?: string;
  className?: string;
}

function Empty(inputProps: ComboboxEmptyProps) {
  const [props, emptyProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
  ]);
  return (
    <SearchEmpty
      {...emptyProps}
      class={cn(
        "mx-1.5 shrink-0 px-4 py-2 text-[0.925rem] leading-4 text-kumo-subtle empty:m-0 empty:p-0",
        props.class,
        props.className,
      )}
    >
      {props.children ?? "No labels found."}
    </SearchEmpty>
  );
}

export interface ComboboxInputProps extends Omit<SearchInputProps, "class"> {
  class?: string;
  className?: string;
}

function Input(inputProps: ComboboxInputProps) {
  const [props, searchInputProps] = splitProps(inputProps, [
    "class",
    "className",
  ]);
  return (
    <SearchInput
      {...searchInputProps}
      anchor={false}
      class={cn(
        inputVariants(),
        "mx-1.5 w-[calc(100%-0.75rem)] shrink-0 first:mb-2",
        props.class,
        props.className,
      )}
    />
  );
}

export interface ComboboxListProps<Item = unknown> extends Omit<
  SearchListProps<Item>,
  "class"
> {
  class?: string;
  className?: string;
}

function List<Item = unknown>(inputProps: ComboboxListProps<Item>) {
  const [props, listProps] = splitProps(inputProps, ["class", "className"]);
  return (
    <SearchList
      {...listProps}
      class={cn(
        "min-h-0 flex-1 scroll-pt-2 scroll-pb-2 overflow-y-auto overscroll-contain",
        props.class,
        props.className,
      )}
    />
  );
}

export interface ComboboxGroupLabelProps extends Omit<
  SearchGroupLabelProps,
  "class"
> {
  class?: string;
  className?: string;
}

function GroupLabel(inputProps: ComboboxGroupLabelProps) {
  const [props, labelProps] = splitProps(inputProps, ["class", "className"]);
  return (
    <SearchGroupLabel
      {...labelProps}
      class={cn(
        "mx-1.5 px-2 py-1.5 text-sm text-kumo-subtle",
        props.class,
        props.className,
      )}
    />
  );
}

export interface ComboboxGroupProps<Item = unknown> extends Omit<
  SearchGroupProps<Item>,
  "class"
> {
  class?: string;
  className?: string;
}

function Group<Item = unknown>(inputProps: ComboboxGroupProps<Item>) {
  const [props, groupProps] = splitProps(inputProps, ["class", "className"]);
  return (
    <SearchGroup
      {...groupProps}
      class={cn(
        "mt-2 border-t border-kumo-hairline pt-2 first:mt-0 first:border-t-0 first:pt-0",
        props.class,
        props.className,
      )}
    />
  );
}

export interface ComboboxChipProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class"
> {
  class?: string;
  className?: string;
  value?: unknown;
  removeLabel?: string;
}

function Chip(inputProps: ComboboxChipProps) {
  const [props, chipProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "removeLabel",
    "value",
  ]);
  return (
    <SearchChip
      {...chipProps}
      value={props.value}
      class={cn(
        "flex items-center gap-2.5",
        "h-6 pr-[3px] pl-2",
        "rounded-sm ring-1 ring-kumo-hairline",
        "bg-kumo-overlay text-sm",
        props.class,
        props.className,
      )}
    >
      {props.children}
      <SearchChipRemove
        data-kumo-component="Combobox"
        data-kumo-part="chip-remove"
        aria-label={props.removeLabel ?? "Remove"}
        value={props.value}
        class={cn(
          "flex cursor-pointer rounded-md bg-transparent p-1 hover:bg-kumo-fill-hover",
        )}
      >
        <XIcon size={10} />
      </SearchChipRemove>
    </SearchChip>
  );
}

const sizeToMinHeight: Record<KumoComboboxSize, string> = {
  xs: "min-h-5",
  sm: "min-h-6.5",
  base: "min-h-9",
  lg: "min-h-10",
};

function RenderChip<Value>(props: {
  value: Value;
  renderItem: (value: Value) => JSX.Element;
}) {
  return (
    <SearchChipValueProvider value={props.value}>
      {props.renderItem(props.value)}
    </SearchChipValueProvider>
  );
}

export interface ComboboxTriggerMultipleWithInputProps<Value> {
  placeholder?: string;
  renderItem: (value: Value) => JSX.Element;
  class?: string;
  className?: string;
  inputSide?: KumoComboboxInputSide;
  value?: Value[];
}

function TriggerMultipleWithInput<Value>(
  props: ComboboxTriggerMultipleWithInputProps<Value>,
) {
  const combobox = useContext(ComboboxContext);
  const search = useSearchControl();
  const values = () =>
    props.value ??
    (Array.isArray(search.selectedValue())
      ? (search.selectedValue() as Value[])
      : []);

  return (
    <SearchChips
      class={cn(
        inputVariants({
          size: combobox.size(),
          variant: combobox.hasError() ? "error" : "default",
        }),
        "flex h-auto flex-col gap-1 px-1.5 py-1",
        sizeToMinHeight[combobox.size()],
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        props.class,
        props.className,
      )}
    >
      <Show when={(props.inputSide ?? "right") === "top"}>
        <SearchInput
          placeholder={props.placeholder}
          class="w-full border-0 bg-inherit px-2 py-1"
        />
      </Show>
      <div class="flex flex-1 flex-wrap items-center gap-1.5">
        <For each={values()}>
          {(value) => (
            <RenderChip value={value} renderItem={props.renderItem} />
          )}
        </For>
        <Show when={(props.inputSide ?? "right") === "right"}>
          <SearchInput
            placeholder={props.placeholder}
            class="min-w-[100px] flex-1 border-0 bg-inherit px-2 py-1"
          />
        </Show>
      </div>
    </SearchChips>
  );
}

const NamedContent = Object.assign(Content, {
  displayName: "Combobox.Content",
});
const NamedTriggerValue = Object.assign(TriggerValue, {
  displayName: "Combobox.TriggerValue",
});
const NamedTriggerInput = Object.assign(TriggerInput, {
  displayName: "Combobox.TriggerInput",
});
const NamedTriggerMultiple = Object.assign(TriggerMultipleWithInput, {
  displayName: "Combobox.TriggerMultipleWithInput",
});
const NamedItem = Object.assign(Item, {
  displayName: "Combobox.Item",
});
const NamedChip = Object.assign(Chip, {
  displayName: "Combobox.Chip",
});

export const Combobox = Object.assign(Root, {
  displayName: "Combobox.Root",
  Content: NamedContent,
  TriggerValue: NamedTriggerValue,
  TriggerInput: NamedTriggerInput,
  TriggerMultipleWithInput: NamedTriggerMultiple,
  Chip: NamedChip,
  Item: NamedItem,
  Input,
  Empty,
  GroupLabel,
  Group,
  List,
  Collection: SearchCollection,
  Trigger: SearchTrigger,
  Value: SearchValue,
  Icon: SearchIcon,
  useFilter: createSearchFilter,
});

export type ComboboxFilter = SearchFilter;
export type ComboboxFilterOptions = SearchFilterOptions;
export type {
  SearchTriggerProps as ComboboxTriggerProps,
  SearchValueProps as ComboboxValueProps,
};
