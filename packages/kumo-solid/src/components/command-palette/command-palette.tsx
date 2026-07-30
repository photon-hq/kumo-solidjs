import { Dialog as DialogBase } from "@msviderok/base-ui-solid/dialog";
import {
  For,
  Show,
  createContext,
  createMemo,
  createSignal,
  splitProps,
  useContext,
  type JSX,
  type Ref,
} from "solid-js";
import {
  ArrowRightIcon,
  ArrowSquareOutIcon,
  CaretRightIcon,
  MagnifyingGlassIcon,
} from "../../internal/icons";
import {
  SearchCollection,
  SearchEmpty,
  SearchGroup,
  SearchGroupLabel,
  SearchInput,
  SearchItem,
  SearchList,
  SearchRoot,
  type SearchListProps,
} from "../../internal/search-control";
import { cn } from "../../utils/cn";
import { usePortalContainerAccessor } from "../../utils/portal-provider";
import { LayerCard } from "../layer-card";
import { Loader } from "../loader";
import type {
  CommandPaletteDialogProps,
  CommandPaletteEmptyProps,
  CommandPaletteFooterProps,
  CommandPaletteGroupLabelProps,
  CommandPaletteGroupProps,
  CommandPaletteInputProps,
  CommandPaletteItemProps,
  CommandPaletteListProps,
  CommandPaletteLoadingProps,
  CommandPalettePanelProps,
  CommandPaletteResultItemProps,
  CommandPaletteRootProps,
  HighlightRange,
} from "./types";

interface DialogContextValue {
  onClose?: () => void;
}

const DialogContext = createContext<DialogContextValue>({});

function setSolidRef<T>(ref: Ref<T> | undefined, value: T) {
  if (typeof ref === "function") {
    (ref as (value: T) => void)(value);
  }
}

function Dialog(props: CommandPaletteDialogProps) {
  const contextContainer = usePortalContainerAccessor();
  const container = () => props.container ?? contextContainer() ?? undefined;
  const close = () => props.onOpenChange(false);

  return (
    <DialogBase.Root
      open={props.open}
      onOpenChange={(open) => props.onOpenChange(open)}
      modal
    >
      <DialogBase.Portal container={container()}>
        <DialogBase.Backdrop
          class="fixed inset-0 bg-kumo-overlay opacity-80 transition-all duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0"
          onClick={(event) => {
            if (props.onBackdropClick) {
              props.onBackdropClick(event);
            } else {
              close();
            }
          }}
        />
        <LayerCard
          render={(popupProps) => (
            <DialogBase.Popup
              {...popupProps}
              data-kumo-component="CommandPalette"
              data-kumo-part="dialog"
            />
          )}
          class={cn(
            "fixed top-[10vh] left-1/2 w-full max-w-2xl -translate-x-1/2",
            "overflow-hidden rounded-lg",
            "duration-150 data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0",
          )}
          style={
            {
              "transition-property": "scale, opacity",
              "transition-timing-function":
                "var(--default-transition-timing-function)",
            } as JSX.CSSProperties
          }
        >
          <DialogContext.Provider value={{ onClose: close }}>
            {props.children}
          </DialogContext.Provider>
        </LayerCard>
      </DialogBase.Portal>
    </DialogBase.Root>
  );
}

function Root<Group, Item = Group>(
  props: CommandPaletteRootProps<Group, Item>,
) {
  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      onBackdropClick={props.onBackdropClick}
      container={props.container}
    >
      <Panel
        items={props.items}
        value={props.value}
        onValueChange={props.onValueChange}
        onItemHighlighted={props.onItemHighlighted}
        itemToStringValue={props.itemToStringValue}
        filter={props.filter}
        open={props.open}
        onSelect={props.onSelect}
        getSelectableItems={props.getSelectableItems}
      >
        {props.children}
      </Panel>
    </Dialog>
  );
}

function InputHeader(props: {
  children?: JSX.Element;
  leading?: JSX.Element;
  trailing?: JSX.Element;
}) {
  return (
    <div class="flex items-center gap-3 bg-kumo-base px-4 py-3 focus-within:ring-2 focus-within:ring-kumo-brand">
      {props.leading ?? (
        <MagnifyingGlassIcon class="h-4 w-4 text-kumo-subtle" />
      )}
      {props.children}
      {props.trailing}
    </div>
  );
}

function List(inputProps: CommandPaletteListProps) {
  const [props, listProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "ref",
  ]);
  return (
    <div
      {...listProps}
      ref={(element) => setSolidRef(props.ref, element)}
      class={cn(
        "relative min-h-0 flex-1 scroll-py-2 overflow-y-auto rounded-b-lg bg-kumo-base px-2 py-2 ring-1 ring-kumo-hairline",
        props.class,
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}

function Group<Item = unknown>(props: CommandPaletteGroupProps<Item>) {
  return (
    <SearchGroup
      items={props.items}
      class={cn("space-y-0.5", props.class, props.className)}
    >
      {props.children}
    </SearchGroup>
  );
}

function GroupLabel(props: CommandPaletteGroupLabelProps) {
  return (
    <SearchGroupLabel
      class={cn(
        "mb-2 px-2 pt-1 text-xs font-semibold text-kumo-subtle",
        props.class,
        props.className,
      )}
    >
      {props.children}
    </SearchGroupLabel>
  );
}

function Item<Item = unknown>(inputProps: CommandPaletteItemProps<Item>) {
  const [props, itemProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "disabled",
    "onClick",
    "value",
  ]);
  return (
    <SearchItem
      {...itemProps}
      value={props.value}
      disabled={props.disabled}
      onClick={props.onClick}
      class={cn(
        "group flex w-full items-center gap-3 px-2 py-1.5 text-left text-base transition-colors",
        "cursor-pointer rounded-lg data-[highlighted]:bg-kumo-overlay",
        props.disabled && "cursor-default opacity-50",
        props.class,
        props.className,
      )}
    >
      {props.children}
    </SearchItem>
  );
}

function Empty(props: CommandPaletteEmptyProps) {
  return (
    <SearchEmpty>
      <div class="p-8 text-center">
        <p class="text-kumo-subtle">{props.children ?? "No results found"}</p>
      </div>
    </SearchEmpty>
  );
}

function Loading(props: CommandPaletteLoadingProps) {
  return (
    <div class="flex items-center justify-center p-8">
      {props.children ?? <Loader size={24} />}
    </div>
  );
}

function Footer(props: CommandPaletteFooterProps) {
  return (
    <div class="flex items-center justify-between rounded-b-lg bg-kumo-elevated px-4 py-3 text-xs text-kumo-subtle">
      {props.children}
    </div>
  );
}

type HighlightPart =
  | { kind: "text"; text: string }
  | { kind: "highlight"; text: string };

function mergeHighlights(
  text: string,
  highlights: readonly HighlightRange[] | undefined,
): HighlightPart[] {
  if (!highlights || highlights.length === 0) {
    return [{ kind: "text", text }];
  }
  const sorted = highlights
    .map(([start, end]) => [start, end] as HighlightRange)
    .sort((first, second) => first[0] - second[0]);
  const merged: HighlightRange[] = [];
  for (const range of sorted) {
    const previous = merged.at(-1);
    if (previous && range[0] <= previous[1] + 1) {
      previous[1] = Math.max(previous[1], range[1]);
    } else {
      merged.push([...range]);
    }
  }

  const parts: HighlightPart[] = [];
  let lastIndex = 0;
  for (const [start, end] of merged) {
    if (start > lastIndex) {
      parts.push({
        kind: "text",
        text: text.slice(lastIndex, start),
      });
    }
    parts.push({
      kind: "highlight",
      text: text.slice(start, end + 1),
    });
    lastIndex = end + 1;
  }
  if (lastIndex < text.length) {
    parts.push({ kind: "text", text: text.slice(lastIndex) });
  }
  return parts;
}

function HighlightedText(props: {
  text: string;
  highlights?: readonly HighlightRange[];
  class?: string;
  className?: string;
}) {
  const parts = createMemo(() => mergeHighlights(props.text, props.highlights));
  return (
    <span class={cn(props.class, props.className)}>
      <For each={parts()}>
        {(part) => (
          <Show
            when={part.kind === "highlight"}
            fallback={<span>{part.text}</span>}
          >
            <mark class="rounded-sm bg-kumo-warning/50 text-kumo-default">
              {part.text}
            </mark>
          </Show>
        )}
      </For>
    </span>
  );
}

function ResultItem<Item = unknown>(
  props: CommandPaletteResultItemProps<Item>,
) {
  return (
    <SearchItem
      value={props.value}
      onClick={props.nonInteractive ? undefined : props.onClick}
      class={cn(
        "group flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors",
        props.nonInteractive
          ? "cursor-default"
          : "cursor-pointer data-[highlighted]:bg-kumo-overlay",
      )}
    >
      <Show when={props.icon}>
        <div class="flex shrink-0 items-center text-kumo-subtle">
          {props.icon}
        </div>
      </Show>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 truncate">
          <For each={props.breadcrumbs}>
            {(crumb, index) => (
              <span class="flex items-center gap-2">
                <HighlightedText
                  text={crumb}
                  highlights={props.breadcrumbHighlights?.[index()]}
                  class="text-base text-kumo-default"
                />
                <CaretRightIcon class="h-3 w-3 shrink-0 text-kumo-subtle" />
              </span>
            )}
          </For>
          <HighlightedText
            text={props.title}
            highlights={props.titleHighlights}
            class="text-base text-kumo-default"
          />
          <Show when={props.external}>
            <ArrowSquareOutIcon class="h-3.5 w-3.5 shrink-0 text-kumo-subtle" />
          </Show>
          <Show when={props.description}>
            {(description) => (
              <>
                <span class="text-kumo-subtle">—</span>
                <span class="truncate text-sm text-kumo-subtle">
                  {description()}
                </span>
              </>
            )}
          </Show>
        </div>
      </div>
      <Show
        when={
          (props.showArrow ?? true) && !props.external && !props.nonInteractive
        }
      >
        <ArrowRightIcon class="h-4 w-4 shrink-0 text-kumo-subtle opacity-0 transition-opacity group-data-[highlighted]:opacity-100" />
      </Show>
    </SearchItem>
  );
}

function Container(props: {
  children?: JSX.Element;
  class?: string;
  className?: string;
}) {
  return (
    <div
      class={cn(
        "flex max-h-[60vh] flex-col overflow-hidden rounded-lg bg-kumo-elevated",
        props.class,
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}

interface PanelContextValue {
  onInputKeyDown?: (
    event: KeyboardEvent & { currentTarget: HTMLInputElement },
  ) => void;
}

const PanelContext = createContext<PanelContextValue>({});
const defaultFilter = () => true;

function Panel<Group, Item = Group>(
  props: CommandPalettePanelProps<Group, Item>,
) {
  const [highlightedIndex, setHighlightedIndex] = createSignal(-1);
  const handleItemHighlighted = (
    item: Group | undefined,
    details: { reason: string; event: Event; index: number },
  ) => {
    setHighlightedIndex(details.index);
    props.onItemHighlighted?.(item, details);
  };
  const handleInputKeyDown = (
    event: KeyboardEvent & { currentTarget: HTMLInputElement },
  ) => {
    if (
      event.key !== "Enter" ||
      (!event.metaKey && !event.ctrlKey) ||
      !props.onSelect ||
      !props.getSelectableItems
    ) {
      return;
    }
    const selected = props.getSelectableItems(props.items)[highlightedIndex()];
    if (selected === undefined) return;
    event.preventDefault();
    props.onSelect(selected, { newTab: true });
  };

  return (
    <Container class={props.class} className={props.className}>
      <SearchRoot
        items={props.items}
        inputValue={props.value}
        onInputValueChange={(value) => props.onValueChange?.(value)}
        onItemHighlighted={handleItemHighlighted}
        itemToStringValue={props.itemToStringValue}
        filter={props.filter ?? defaultFilter}
        autoHighlight="always"
        keepHighlight
        open={props.open ?? true}
        selectionMode="none"
        fillInputOnSelect={false}
      >
        <PanelContext.Provider value={{ onInputKeyDown: handleInputKeyDown }}>
          {props.children}
        </PanelContext.Provider>
      </SearchRoot>
    </Container>
  );
}

function PanelInput(inputProps: CommandPaletteInputProps) {
  const [props, searchInputProps] = splitProps(inputProps, [
    "autoFocus",
    "class",
    "className",
    "leading",
    "onKeyDown",
    "placeholder",
    "trailing",
  ]);
  const panel = useContext(PanelContext);
  const dialog = useContext(DialogContext);

  return (
    <InputHeader leading={props.leading} trailing={props.trailing}>
      <SearchInput
        {...searchInputProps}
        placeholder={props.placeholder}
        class={cn(
          "kumo-input-placeholder flex-1 border-none bg-transparent text-base outline-none",
          props.class,
          props.className,
        )}
        onKeyDown={(event) => {
          props.onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === "Escape" && dialog.onClose) {
            event.preventDefault();
            dialog.onClose();
            return;
          }
          panel.onInputKeyDown?.(event);
        }}
        autofocus={props.autoFocus ?? true}
      />
    </InputHeader>
  );
}

export interface CommandPaletteResultsProps<Group = unknown> extends Omit<
  SearchListProps<Group>,
  "class"
> {
  class?: string;
  className?: string;
}

function Results<Group = unknown>(
  inputProps: CommandPaletteResultsProps<Group>,
) {
  const [props, listProps] = splitProps(inputProps, ["class", "className"]);
  return (
    <SearchList
      {...listProps}
      class={cn("space-y-3", props.class, props.className)}
    />
  );
}

export const KUMO_COMMAND_PALETTE_VARIANTS = {} as const;
export const KUMO_COMMAND_PALETTE_DEFAULT_VARIANTS = {} as const;

export const CommandPalette = {
  Dialog,
  Root,
  Panel,
  Input: PanelInput,
  List,
  Group,
  GroupLabel,
  Item,
  ResultItem,
  HighlightedText,
  Empty,
  Loading,
  Footer,
  Results,
  Items: SearchCollection,
};
