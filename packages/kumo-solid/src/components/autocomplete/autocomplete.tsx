import {
  Show,
  createContext,
  splitProps,
  useContext,
  type Accessor,
  type JSX,
} from "solid-js";
import { CheckIcon } from "../../internal/icons";
import {
  SearchCollection,
  SearchEmpty,
  SearchGroup,
  SearchGroupLabel,
  SearchInput,
  SearchItem,
  SearchList,
  SearchPopup,
  SearchRoot,
  SearchSeparator,
  createSearchFilter,
  type SearchChangeDetails,
  type SearchCollectionProps,
  type SearchFilter,
  type SearchFilterOptions,
  type SearchGroupLabelProps,
  type SearchGroupProps,
  type SearchInputProps,
  type SearchInputValue,
  type SearchItemProps,
  type SearchListProps,
  type SearchPopupProps,
  type SearchSeparatorProps,
} from "../../internal/search-control";
import { cn } from "../../utils/cn";
import {
  usePortalContainerAccessor,
  type PortalContainer,
} from "../../utils/portal-provider";
import { resolveVariant } from "../../utils/resolve-variant";
import { Field, normalizeFieldError, type FieldErrorMatch } from "../field";
import { inputVariants, KUMO_INPUT_VARIANTS } from "../input/input";

const AutocompleteContext = createContext<{
  hasError: Accessor<boolean>;
}>({
  hasError: () => false,
});

/** Autocomplete variant definitions. */
export const KUMO_AUTOCOMPLETE_VARIANTS = {
  size: KUMO_INPUT_VARIANTS.size,
} as const;

export const KUMO_AUTOCOMPLETE_DEFAULT_VARIANTS = {
  size: "base",
} as const;

export type KumoAutocompleteSize = keyof typeof KUMO_AUTOCOMPLETE_VARIANTS.size;

export interface KumoAutocompleteVariantsProps {
  /** @default "base" */
  size?: KumoAutocompleteSize;
}

export function autocompleteVariants({
  size = KUMO_AUTOCOMPLETE_DEFAULT_VARIANTS.size,
}: KumoAutocompleteVariantsProps = {}) {
  return cn(
    resolveVariant(
      KUMO_INPUT_VARIANTS.size,
      size,
      KUMO_AUTOCOMPLETE_DEFAULT_VARIANTS.size,
    ).classes,
  );
}

export interface AutocompleteRootProps<Item = unknown> {
  items: readonly Item[];
  value?: SearchInputValue;
  defaultValue?: SearchInputValue;
  onValueChange?: (value: string, details: SearchChangeDetails) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: SearchChangeDetails) => void;
  onItemHighlighted?: (
    item: Item | undefined,
    details: { reason: string; event: Event; index: number },
  ) => void;
  itemToStringValue?: (item: Item) => string;
  filter?: (item: Item, query: string) => boolean;
  mode?: "list" | "both" | "inline" | "none";
  autoHighlight?: boolean | "always";
  keepHighlight?: boolean;
  highlightItemOnHover?: boolean;
  openOnInputClick?: boolean;
  disabled?: boolean;
  children?: JSX.Element;
  class?: string;
  className?: string;
  label?: JSX.Element;
  required?: boolean;
  labelTooltip?: JSX.Element;
  description?: JSX.Element;
  error?: string | { message: JSX.Element; match: FieldErrorMatch };
}

/** Simplified non-generic props retained for registry compatibility. */
export interface AutocompleteProps extends AutocompleteRootProps<unknown> {}

function Root<Item>(props: AutocompleteRootProps<Item>) {
  const hasError = () => Boolean(props.error);
  const accessibleLabel = () =>
    typeof props.label === "string" ? props.label : undefined;
  const control = () => (
    <AutocompleteContext.Provider value={{ hasError }}>
      <SearchRoot
        items={props.items}
        inputValue={props.value}
        defaultInputValue={props.defaultValue}
        onInputValueChange={props.onValueChange}
        open={props.open}
        defaultOpen={props.defaultOpen}
        onOpenChange={props.onOpenChange}
        onItemHighlighted={props.onItemHighlighted}
        itemToStringValue={props.itemToStringValue}
        filter={props.filter}
        mode={props.mode}
        autoHighlight={props.autoHighlight}
        keepHighlight={props.keepHighlight}
        highlightItemOnHover={props.highlightItemOnHover}
        openOnInputClick={props.openOnInputClick}
        disabled={props.disabled}
        required={props.required}
        accessibleLabel={accessibleLabel()}
        selectionMode="none"
      >
        {props.children}
      </SearchRoot>
    </AutocompleteContext.Provider>
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

export interface AutocompleteInputGroupProps extends Omit<
  SearchInputProps,
  "class"
> {
  class?: string;
  className?: string;
  size?: KumoAutocompleteSize;
}

function InputGroup(inputProps: AutocompleteInputGroupProps) {
  const [props, inputPropsRest] = splitProps(inputProps, [
    "class",
    "className",
    "size",
  ]);
  const context = useContext(AutocompleteContext);
  const size = () => props.size ?? KUMO_AUTOCOMPLETE_DEFAULT_VARIANTS.size;

  return (
    <SearchInput
      {...inputPropsRest}
      data-kumo-component="Autocomplete"
      data-kumo-part="input"
      class={cn(
        inputVariants({
          size: size(),
          variant: context.hasError() ? "error" : "default",
          focusIndicator: true,
        }),
        "w-full",
        props.class,
        props.className,
      )}
    />
  );
}

export interface AutocompleteContentProps extends Omit<
  SearchPopupProps,
  "class" | "hideWhenEmpty"
> {
  class?: string;
  className?: string;
  container?: PortalContainer;
}

function Content(inputProps: AutocompleteContentProps) {
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
      hideWhenEmpty
      data-kumo-component="Autocomplete"
      data-kumo-part="content"
      class={cn(
        "z-50 flex flex-col",
        "max-h-[min(var(--available-height),24rem)] max-w-(--available-width) min-w-(--anchor-width) py-1.5",
        "bg-kumo-control text-kumo-default",
        "rounded-lg shadow-lg ring ring-kumo-line",
        props.class,
        props.className,
      )}
    />
  );
}

export interface AutocompleteListProps<Item = unknown> extends Omit<
  SearchListProps<Item>,
  "class"
> {
  class?: string;
  className?: string;
}

function List<Item = unknown>(inputProps: AutocompleteListProps<Item>) {
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

export interface AutocompleteItemProps<Item = unknown> extends Omit<
  SearchItemProps<Item>,
  "class"
> {
  class?: string;
  className?: string;
}

function Item<Item = unknown>(inputProps: AutocompleteItemProps<Item>) {
  const [props, itemProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
  ]);
  return (
    <SearchItem
      {...itemProps}
      data-kumo-component="Autocomplete"
      data-kumo-part="item"
      class={cn(
        "group mx-1.5 grid cursor-pointer grid-cols-[1fr_16px] gap-2 rounded px-2 py-1.5 text-base",
        "data-highlighted:bg-kumo-overlay data-selected:font-medium",
        props.class,
        props.className,
      )}
    >
      <div class="col-start-1">{props.children}</div>
      <span class="col-start-2 hidden items-center group-data-selected:flex">
        <CheckIcon size={14} />
      </span>
    </SearchItem>
  );
}

export interface AutocompleteGroupLabelProps extends Omit<
  SearchGroupLabelProps,
  "class"
> {
  class?: string;
  className?: string;
}

function GroupLabel(inputProps: AutocompleteGroupLabelProps) {
  const [props, labelProps] = splitProps(inputProps, ["class", "className"]);
  return (
    <SearchGroupLabel
      {...labelProps}
      class={cn(
        "mx-1.5 px-2 py-1.5 text-sm text-kumo-strong",
        props.class,
        props.className,
      )}
    />
  );
}

export interface AutocompleteGroupProps<Item = unknown> extends Omit<
  SearchGroupProps<Item>,
  "class"
> {
  class?: string;
  className?: string;
}

function Group<Item = unknown>(inputProps: AutocompleteGroupProps<Item>) {
  const [props, groupProps] = splitProps(inputProps, ["class", "className"]);
  return (
    <SearchGroup
      {...groupProps}
      class={cn(
        "mt-2 border-t border-kumo-line pt-2 first:mt-0 first:border-t-0 first:pt-0",
        props.class,
        props.className,
      )}
    />
  );
}

export interface AutocompleteSeparatorProps extends Omit<
  SearchSeparatorProps,
  "class"
> {
  class?: string;
  className?: string;
}

function Separator(inputProps: AutocompleteSeparatorProps) {
  const [props, separatorProps] = splitProps(inputProps, [
    "class",
    "className",
  ]);
  return (
    <SearchSeparator
      {...separatorProps}
      class={cn("mx-0 my-1 h-px bg-kumo-line", props.class, props.className)}
    />
  );
}

const NamedInputGroup = Object.assign(InputGroup, {
  displayName: "Autocomplete.InputGroup",
});
const NamedContent = Object.assign(Content, {
  displayName: "Autocomplete.Content",
});
const NamedItem = Object.assign(Item, {
  displayName: "Autocomplete.Item",
});
const NamedGroupLabel = Object.assign(GroupLabel, {
  displayName: "Autocomplete.GroupLabel",
});
const NamedGroup = Object.assign(Group, {
  displayName: "Autocomplete.Group",
});
const NamedSeparator = Object.assign(Separator, {
  displayName: "Autocomplete.Separator",
});

export const Autocomplete = Object.assign(Root, {
  displayName: "Autocomplete.Root",
  InputGroup: NamedInputGroup,
  Content: NamedContent,
  Item: NamedItem,
  GroupLabel: NamedGroupLabel,
  Group: NamedGroup,
  Separator: NamedSeparator,
  List,
  Empty: SearchEmpty,
  Collection: SearchCollection,
  useFilter: createSearchFilter,
});

export type AutocompleteFilter = SearchFilter;
export type AutocompleteFilterOptions = SearchFilterOptions;
export type {
  SearchCollectionProps as AutocompleteCollectionProps,
  SearchListProps as AutocompletePrimitiveListProps,
};
