import { Tabs as TabsBase } from "@msviderok/base-ui-solid/tabs";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
  type Accessor,
  type ComponentProps,
  type JSX,
} from "solid-js";
import { cn } from "../../utils/cn";

/** Tabs variant definitions. */
export const KUMO_TABS_VARIANTS = {
  variant: ["segmented", "underline"],
  size: ["base", "sm"],
} as const;

export const KUMO_TABS_DEFAULT_VARIANTS = {
  variant: "segmented",
  size: "base",
} as const;

export const KUMO_TABS_STYLING = {
  container: {
    height: 34,
    borderRadius: 8,
    background: "color-accent",
    padding: 1,
  },
  tab: {
    paddingX: 10,
    verticalMargin: 1,
    fontSize: 16,
    fontWeight: 500,
    borderRadius: 8,
    activeColor: "text-color-surface",
    inactiveColor: "text-color-label",
  },
  indicator: {
    background: "color-surface-secondary",
    ring: "color-color-2",
    borderRadius: 6,
    shadow: "shadow-sm",
  },
} as const;

/** Labels for internationalization of Tabs component. */
export interface TabsLabels {
  /** Aria label for the button that scrolls to earlier tabs. @default "Scroll tabs left" */
  scrollStart?: string;
  /** Aria label for the button that scrolls to later tabs. @default "Scroll tabs right" */
  scrollEnd?: string;
}

const DEFAULT_LABELS: Required<TabsLabels> = {
  scrollStart: "Scroll tabs left",
  scrollEnd: "Scroll tabs right",
};

export interface KumoTabsVariantsProps {
  /**
   * Tab style.
   * - `"segmented"` — Pill-shaped indicator on a filled track
   * - `"underline"` — Underline indicator below tab text
   * @default "segmented"
   */
  variant?: (typeof KUMO_TABS_VARIANTS.variant)[number];
  /**
   * Tab size.
   * - `"base"` — Default size (h-9, text-base)
   * - `"sm"` — Compact size (h-6.5, text-xs)
   * @default "base"
   */
  size?: (typeof KUMO_TABS_VARIANTS.size)[number];
}

type BaseTabProps = ComponentProps<typeof TabsBase.Tab>;

/** Configuration for a single tab within the Tabs component. */
export type TabsItem = {
  /** Unique identifier for the tab, used as the controlled value. */
  value: string;
  /** Display content for the tab trigger. */
  label: JSX.Element;
  /** Additional CSS classes for this tab trigger. */
  class?: string;
  /** React-compatible alias for additional CSS classes. */
  className?: string;
  /**
   * Custom render function or element to replace the tab element (e.g. for
   * link-based tabs).
   */
  render?: BaseTabProps["render"];
};

export type TabsProps = KumoTabsVariantsProps & {
  /** Array of tab items to render. */
  tabs?: TabsItem[];
  /** Controlled value. When set, component becomes controlled. */
  value?: string;
  /** Default selected value for uncontrolled mode. Ignored when `value` is set. */
  selectedValue?: string;
  /** Callback fired when the active tab changes. */
  onValueChange?: (value: string) => void;
  /**
   * When `true`, tabs are activated immediately upon receiving focus via arrow
   * keys. When `false` (default), tabs receive focus but require Enter/Space to
   * activate.
   */
  activateOnFocus?: boolean;
  /** Additional CSS classes for the root element. */
  class?: string;
  /** React-compatible alias for root classes. */
  className?: string;
  /** Additional CSS classes for the tab list element. */
  listClassName?: string;
  /** Additional CSS classes for the indicator element. */
  indicatorClassName?: string;
  /** Labels for internationalization of aria-labels. */
  labels?: TabsLabels;
};

/**
 * Tab navigation component with segmented or underline style.
 * Built on Base UI Solid Tabs with an animated active indicator.
 */
export function Tabs(props: TabsProps) {
  const items = createMemo(() => props.tabs ?? []);
  const variant = () => props.variant ?? KUMO_TABS_DEFAULT_VARIANTS.variant;
  const size = () => props.size ?? KUMO_TABS_DEFAULT_VARIANTS.size;
  const isSegmented = () => variant() === "segmented";
  const isUnderline = () => variant() === "underline";
  const isSm = () => size() === "sm";
  const isControlled = () => props.value !== undefined;
  const labels = createMemo<Required<TabsLabels>>(() => ({
    ...DEFAULT_LABELS,
    ...props.labels,
  }));
  const overflow = useOverflowDetect(() => items().length > 0);
  const dragHandlers = useHorizontalDragScroll(
    overflow.element,
    overflow.isOverflowing,
  );
  const [indicatorMounted, setIndicatorMounted] = createSignal(false);

  onMount(() => {
    setIndicatorMounted(true);
  });

  const indicatorClass = () =>
    cn(
      "absolute left-0 z-1",
      "w-(--active-tab-width) translate-x-(--active-tab-left) transition-all duration-200",
      "data-[rendered=false]:scale-90 data-[rendered=false]:opacity-0",
      isSegmented() &&
        cn(
          "top-(--active-tab-top) h-(--active-tab-height) bg-kumo-base shadow-sm ring ring-kumo-line",
          isSm() ? "rounded" : "rounded-md",
        ),
      isUnderline() && "bottom-0 h-0.5 bg-kumo-brand",
      props.indicatorClassName,
    );

  return (
    <Show when={items().length > 0}>
      <TabsBase.Root
        value={isControlled() ? props.value : undefined}
        defaultValue={
          isControlled()
            ? undefined
            : (props.selectedValue ?? items()[0]?.value)
        }
        class={cn(
          "relative isolate min-w-0 font-medium",
          isSegmented() && (isSm() ? "rounded-md" : "rounded-lg"),
          isSegmented() && "ring ring-kumo-hairline/70",
          props.class,
          props.className,
        )}
        onValueChange={(nextValue) => {
          props.onValueChange?.(nextValue as string);
        }}
      >
        <Show when={isSegmented()}>
          <div
            class={cn(
              "absolute inset-x-0 top-1/2 z-0 -translate-y-1/2 rounded-lg bg-kumo-recessed",
              isSm() ? "h-6.5" : "h-9",
            )}
          />
        </Show>
        <TabsBase.List
          ref={overflow.ref}
          activateOnFocus={props.activateOnFocus ?? false}
          data-overflowing={overflow.isOverflowing() ? "" : undefined}
          data-overflow-start={overflow.canScrollStart() ? "" : undefined}
          data-overflow-end={overflow.canScrollEnd() ? "" : undefined}
          {...dragHandlers}
          class={cn(
            "kumo-tabs-list relative flex min-w-0 shrink scroll-px-(--scroll-fade-width) items-stretch overflow-x-auto overflow-y-hidden [--scroll-fade-width:3rem]",
            isSegmented() && "rounded-lg bg-kumo-recessed px-0.5",
            isSegmented() && (isSm() ? "h-6.5 rounded-md" : "h-9"),
            overflow.isOverflowing() && "cursor-grab active:cursor-grabbing",
            isUnderline() && "gap-4 border-b border-kumo-hairline pb-2",
            isUnderline() && (isSm() ? "h-6.5" : "h-7.5"),
            props.listClassName,
          )}
        >
          <For each={items()}>
            {(tab) => (
              <TabsBase.Tab
                data-kumo-component="Tabs"
                data-kumo-part="tab"
                value={tab.value}
                render={tab.render}
                nativeButton={
                  tab.render === undefined ||
                  tab.render === null ||
                  tab.render === "button"
                }
                onClick={(event) => {
                  const target = event.currentTarget as HTMLElement;
                  target.scrollIntoView?.({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "nearest",
                  });
                }}
                class={cn(
                  "relative z-2 flex items-center rounded bg-transparent whitespace-nowrap focus:ring-kumo-focus/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand",
                  overflow.isOverflowing()
                    ? "cursor-grab active:cursor-grabbing"
                    : "cursor-pointer",
                  isSm() ? "text-xs" : "text-base",
                  isSegmented() &&
                    "my-0.5 text-kumo-subtle hover:text-kumo-default focus-visible:ring-inset aria-selected:text-kumo-default",
                  isSegmented() &&
                    (isSm() ? "rounded-sm px-2" : "rounded-md px-2.5"),
                  isUnderline() &&
                    "text-kumo-subtle hover:bg-kumo-tint hover:text-kumo-default aria-selected:font-medium aria-selected:text-kumo-default aria-selected:hover:bg-kumo-tint",
                  isUnderline() && (isSm() ? "px-1.5 py-2.5" : "px-2 py-3"),
                  tab.class,
                  tab.className,
                )}
              >
                {tab.label}
              </TabsBase.Tab>
            )}
          </For>
          <Show
            when={indicatorMounted()}
            fallback={
              <div
                role="presentation"
                hidden
                data-kumo-part="indicator"
                class={indicatorClass()}
              />
            }
          >
            <TabsBase.Indicator
              render={(indicatorProps) => (
                <div
                  {...indicatorProps}
                  data-kumo-part="indicator"
                  class={indicatorClass()}
                />
              )}
            />
          </Show>
        </TabsBase.List>
        <TabsOverflowControl
          side="start"
          visible={overflow.canScrollStart()}
          variant={variant()}
          size={size()}
          label={labels().scrollStart}
          onClick={() => scrollTabs(overflow.element(), "start")}
        />
        <TabsOverflowControl
          side="end"
          visible={overflow.canScrollEnd()}
          variant={variant()}
          size={size()}
          label={labels().scrollEnd}
          onClick={() => scrollTabs(overflow.element(), "end")}
        />
      </TabsBase.Root>
    </Show>
  );
}

function TabsOverflowControl(props: {
  side: "start" | "end";
  visible: boolean;
  variant: NonNullable<TabsProps["variant"]>;
  size: NonNullable<TabsProps["size"]>;
  label: string;
  onClick: () => void;
}) {
  const isStart = () => props.side === "start";
  const isSegmented = () => props.variant === "segmented";

  return (
    <button
      type="button"
      aria-label={props.label}
      aria-hidden={!props.visible}
      tabIndex={props.visible ? 0 : -1}
      onClick={props.onClick}
      class={cn(
        "absolute inset-y-0 z-3 flex items-center border-0 p-0 transition-opacity duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand",
        isStart()
          ? "left-0 justify-start bg-linear-to-r"
          : "right-0 justify-end bg-linear-to-l",
        props.visible
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
        isSegmented()
          ? "from-kumo-recessed via-kumo-recessed/95 to-transparent"
          : "from-kumo-base via-kumo-base/95 to-transparent",
        isSegmented() &&
          (props.size === "sm" ? "w-8 rounded-md" : "w-10 rounded-lg"),
        !isSegmented() && "w-8",
      )}
    >
      <span
        class={cn(
          "flex items-center justify-center rounded-full bg-kumo-elevated text-kumo-subtle shadow-sm ring ring-kumo-line transition-colors hover:bg-kumo-base hover:text-kumo-default",
          props.size === "sm" ? "size-5" : "size-6",
          isStart() ? "ml-1" : "mr-1",
        )}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          class="size-3.5"
          aria-hidden="true"
        >
          <path
            d={
              isStart()
                ? "M9.25 4.25L5.75 8L9.25 11.75"
                : "M6.75 4.25L10.25 8L6.75 11.75"
            }
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
        </svg>
      </span>
    </button>
  );
}

function scrollTabs(element: HTMLElement | null, direction: "start" | "end") {
  if (!element) return;

  const tabElements = Array.from(
    element.querySelectorAll<HTMLElement>('[data-kumo-part="tab"]'),
  );
  const distance = getTabsScrollSize(element.clientWidth, tabElements);
  const left = direction === "start" ? -distance : distance;

  if (typeof element.scrollBy === "function") {
    element.scrollBy({ left, behavior: "smooth" });
  } else {
    element.scrollLeft += left;
  }
}

function getTabsScrollSize(containerWidth: number, tabs: HTMLElement[]) {
  let totalWidth = 0;

  for (const tab of tabs) {
    const tabWidth = tab.offsetWidth;
    if (totalWidth + tabWidth > containerWidth) {
      return totalWidth || containerWidth;
    }
    totalWidth += tabWidth;
  }

  return Math.max(80, Math.floor(containerWidth * 0.8));
}

type CapturingEventHandler<EventType extends Event> = {
  capture: true;
  handleEvent: (event: EventType) => void;
};

type DragHandlers = {
  "on:pointerdown": CapturingEventHandler<PointerEvent>;
  "on:pointermove": CapturingEventHandler<PointerEvent>;
  "on:pointerup": CapturingEventHandler<PointerEvent>;
  "on:pointercancel": CapturingEventHandler<PointerEvent>;
  "on:click": CapturingEventHandler<MouseEvent>;
};

/** Enables mouse drag to horizontally scroll the tab list. */
function useHorizontalDragScroll(
  element: Accessor<HTMLElement | null>,
  enabled: Accessor<boolean>,
): DragHandlers {
  let dragState: {
    pointerId: number;
    startX: number;
    scrollLeft: number;
    dragging: boolean;
  } | null = null;
  let shouldSuppressClick = false;

  return {
    "on:pointerdown": {
      capture: true,
      handleEvent(event) {
        const currentElement = element();
        if (!currentElement || !enabled()) return;
        if (event.pointerType !== "mouse" || event.button !== 0) return;

        dragState = {
          pointerId: event.pointerId,
          startX: event.clientX,
          scrollLeft: currentElement.scrollLeft,
          dragging: false,
        };
        shouldSuppressClick = false;
      },
    },
    "on:pointermove": {
      capture: true,
      handleEvent(event) {
        const currentElement = element();
        const state = dragState;
        if (
          !currentElement ||
          !enabled() ||
          !state ||
          state.pointerId !== event.pointerId
        ) {
          return;
        }

        const movementX = event.clientX - state.startX;
        if (!state.dragging) {
          if (Math.abs(movementX) <= 3) return;
          state.dragging = true;
          shouldSuppressClick = true;
          currentElement.setPointerCapture?.(event.pointerId);
        }

        event.preventDefault();
        currentElement.scrollLeft = state.scrollLeft - movementX;
      },
    },
    "on:pointerup": {
      capture: true,
      handleEvent(event) {
        const currentElement = element();
        const state = dragState;
        if (!currentElement || !state || state.pointerId !== event.pointerId) {
          return;
        }

        dragState = null;
        if (currentElement.hasPointerCapture?.(event.pointerId)) {
          currentElement.releasePointerCapture?.(event.pointerId);
        }
        if (shouldSuppressClick) {
          window.setTimeout(() => {
            shouldSuppressClick = false;
          }, 0);
        }
      },
    },
    "on:pointercancel": {
      capture: true,
      handleEvent(event) {
        const currentElement = element();
        const state = dragState;
        if (!currentElement || !state || state.pointerId !== event.pointerId) {
          return;
        }

        dragState = null;
        if (currentElement.hasPointerCapture?.(event.pointerId)) {
          currentElement.releasePointerCapture?.(event.pointerId);
        }
      },
    },
    "on:click": {
      capture: true,
      handleEvent(event) {
        if (!shouldSuppressClick) return;
        event.preventDefault();
        event.stopPropagation();
        shouldSuppressClick = false;
      },
    },
  };
}

type OverflowState = {
  isOverflowing: boolean;
  canScrollStart: boolean;
  canScrollEnd: boolean;
};

/** Detects horizontal overflow and the available scroll directions. */
function useOverflowDetect(enabled: Accessor<boolean>) {
  const [element, setElement] = createSignal<HTMLElement | null>(null);
  const [state, setState] = createSignal<OverflowState>({
    isOverflowing: false,
    canScrollStart: false,
    canScrollEnd: false,
  });

  createEffect(() => {
    const currentElement = element();
    if (!enabled() || !currentElement) {
      setState({
        isOverflowing: false,
        canScrollStart: false,
        canScrollEnd: false,
      });
      return;
    }

    const check = () => {
      const maxScrollLeft = Math.max(
        0,
        currentElement.scrollWidth - currentElement.clientWidth,
      );
      const scrollLeft = Math.min(
        Math.max(0, currentElement.scrollLeft),
        maxScrollLeft,
      );
      const nextState = {
        isOverflowing: maxScrollLeft > 1,
        canScrollStart: scrollLeft > 1,
        canScrollEnd: maxScrollLeft - scrollLeft > 1,
      };

      setState((previousState) =>
        previousState.isOverflowing === nextState.isOverflowing &&
        previousState.canScrollStart === nextState.canScrollStart &&
        previousState.canScrollEnd === nextState.canScrollEnd
          ? previousState
          : nextState,
      );
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(check);
    resizeObserver?.observe(currentElement);

    const mutationObserver =
      typeof MutationObserver === "undefined"
        ? undefined
        : new MutationObserver(check);
    mutationObserver?.observe(currentElement, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    currentElement.addEventListener("scroll", check, { passive: true });
    check();

    onCleanup(() => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      currentElement.removeEventListener("scroll", check);
    });
  });

  return {
    element,
    ref: (nextElement: HTMLDivElement) => {
      setElement(nextElement);
    },
    isOverflowing: () => state().isOverflowing,
    canScrollStart: () => state().canScrollStart,
    canScrollEnd: () => state().canScrollEnd,
  };
}
