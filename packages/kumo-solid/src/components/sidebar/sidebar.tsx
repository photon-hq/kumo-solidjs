import { mergeProps as mergeBaseUIProps } from "@msviderok/base-ui-solid/merge-props";
import { useRender } from "@msviderok/base-ui-solid/use-render";
import {
  For,
  Match,
  Show,
  Switch,
  createContext,
  createEffect,
  createSignal,
  createUniqueId,
  onCleanup,
  onMount,
  splitProps,
  useContext,
  type Component,
  type JSX,
  type Ref,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { CaretRightIcon, XIcon } from "../../internal/icons";
import { cn } from "../../utils/cn";
import { useLinkComponent } from "../../utils/link-provider";
import { Button } from "../button";
import { SkeletonLine } from "../loader";
import { Tooltip, TooltipProvider } from "../tooltip";

export const KUMO_SIDEBAR_VARIANTS = {
  variant: {
    sidebar: {
      classes: "",
      description: "Standard sidebar with border separator",
    },
    floating: {
      classes: "",
      description: "Floating sidebar with shadow and rounded corners",
    },
    inset: {
      classes: "",
      description: "Inset sidebar within the content area",
    },
  },
  collapsible: {
    icon: {
      classes: "",
      description: "Collapses to show icons only",
    },
    offcanvas: {
      classes: "",
      description: "Slides off screen when collapsed",
    },
    none: {
      classes: "",
      description: "Cannot be collapsed",
    },
  },
  side: {
    left: { classes: "", description: "Left-aligned sidebar" },
    right: { classes: "", description: "Right-aligned sidebar" },
  },
} as const;

export const KUMO_SIDEBAR_DEFAULT_VARIANTS = {
  variant: "sidebar",
  collapsible: "icon",
  side: "left",
} as const;

export const KUMO_SIDEBAR_STYLING = {
  width: { expanded: "16.25rem", icon: "57px" },
  mobile: { breakpoint: 768 },
} as const;

export type SidebarSide = "left" | "right";
export type SidebarVariant = "sidebar" | "floating" | "inset";
export type SidebarCollapsible = "icon" | "offcanvas" | "none";
export type SidebarState = "expanded" | "collapsed" | "peeking";

const SIDEBAR_WIDTH = "16.25rem";
const SIDEBAR_WIDTH_ICON = "57px";
const SIDEBAR_EASING = "cubic-bezier(0.77, 0, 0.175, 1)";
const SIDEBAR_ANIMATION_DURATION_MS = 250;
const MOBILE_BREAKPOINT = 768;
const DEFAULT_WIDTH_PX = 256;
const MIN_WIDTH_PX = 200;
const MAX_WIDTH_PX = 480;
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function setRef<T>(ref: Ref<T> | undefined, value: T) {
  if (typeof ref === "function") {
    (ref as (value: T) => void)(value);
    return;
  }
  if (ref && typeof ref === "object" && "current" in ref) {
    (ref as { current: T }).current = value;
  }
}

function callEventHandler<T, E extends Event>(
  handler: JSX.EventHandlerUnion<T, E> | undefined,
  event: E & { currentTarget: T; target: Element },
) {
  if (!handler) return;
  if (typeof handler === "function") {
    handler(event);
  } else {
    handler[0](handler[1], event);
  }
}

function createIsMobile(breakpoint: () => number) {
  const [mobile, setMobile] = createSignal(false);
  createEffect(() => {
    const value = breakpoint();
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia(`(max-width: ${value - 1}px)`);
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener?.("change", update);
    onCleanup(() => query.removeEventListener?.("change", update));
  });
  return mobile;
}

export interface SidebarContextValue {
  readonly state: SidebarState;
  readonly open: boolean;
  setOpen: (open: boolean) => void;
  readonly openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  readonly isMobile: boolean;
  toggleSidebar: () => void;
  readonly variant: SidebarVariant;
  readonly side: SidebarSide;
  readonly collapsible: SidebarCollapsible;
  readonly width: number;
  readonly resizable: boolean;
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly isResizing: boolean;
  setIsResizing: (resizing: boolean) => void;
  setWidth: (width: number) => void;
  readonly isPeeking: boolean;
  readonly peekable: boolean;
  startPeek: () => void;
  stopPeek: () => void;
  readonly contained: boolean;
  readonly animationDuration: number;
}

const SidebarContext = createContext<SidebarContextValue>();

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a Sidebar.Provider");
  }
  return context;
}

export interface SidebarProviderProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children" | "class" | "className"
> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: SidebarVariant;
  side?: SidebarSide;
  collapsible?: SidebarCollapsible;
  resizable?: boolean;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  onWidthChange?: (width: number) => void;
  contained?: boolean;
  peekable?: boolean;
  animationDuration?: number;
  mobileBreakpoint?: number;
  children: JSX.Element;
  class?: string;
  className?: string;
}

function SidebarProvider(inputProps: SidebarProviderProps) {
  const [props, wrapperProps] = splitProps(inputProps, [
    "animationDuration",
    "children",
    "class",
    "className",
    "collapsible",
    "contained",
    "defaultOpen",
    "defaultWidth",
    "maxWidth",
    "minWidth",
    "mobileBreakpoint",
    "onOpenChange",
    "onWidthChange",
    "open",
    "peekable",
    "resizable",
    "side",
    "style",
    "variant",
  ]);
  const [internalOpen, setInternalOpen] = createSignal(
    props.defaultOpen ?? true,
  );
  const [internalMobileOpen, setInternalMobileOpen] = createSignal(false);
  const [width, setWidthState] = createSignal(
    props.defaultWidth ?? DEFAULT_WIDTH_PX,
  );
  const [resizing, setResizing] = createSignal(false);
  const [peeking, setPeeking] = createSignal(false);
  const isMobile = createIsMobile(
    () => props.mobileBreakpoint ?? MOBILE_BREAKPOINT,
  );
  const open = () => props.open ?? internalOpen();
  const openMobile = () =>
    isMobile() && props.open !== undefined ? props.open : internalMobileOpen();
  const state = (): SidebarState =>
    peeking() ? "peeking" : open() ? "expanded" : "collapsed";

  const setOpen = (next: boolean) => {
    props.onOpenChange?.(next);
    setInternalOpen(next);
  };
  const setOpenMobile = (next: boolean) => {
    setInternalMobileOpen(next);
    if (isMobile() && props.open !== undefined) {
      props.onOpenChange?.(next);
    }
  };
  const setWidth = (next: number) => {
    const clamped = Math.min(
      props.maxWidth ?? MAX_WIDTH_PX,
      Math.max(props.minWidth ?? MIN_WIDTH_PX, next),
    );
    setWidthState(clamped);
    props.onWidthChange?.(clamped);
  };
  const toggleSidebar = () => {
    if (isMobile()) {
      setOpenMobile(!openMobile());
    } else {
      setPeeking(false);
      setOpen(!open());
    }
  };
  const startPeek = () => {
    if ((props.peekable ?? false) && !open() && !isMobile()) {
      setPeeking(true);
    }
  };
  const stopPeek = () => setPeeking(false);

  const context: SidebarContextValue = {
    get state() {
      return state();
    },
    get open() {
      return open();
    },
    setOpen,
    get openMobile() {
      return openMobile();
    },
    setOpenMobile,
    get isMobile() {
      return isMobile();
    },
    toggleSidebar,
    get variant() {
      return props.variant ?? KUMO_SIDEBAR_DEFAULT_VARIANTS.variant;
    },
    get side() {
      return props.side ?? KUMO_SIDEBAR_DEFAULT_VARIANTS.side;
    },
    get collapsible() {
      return props.collapsible ?? KUMO_SIDEBAR_DEFAULT_VARIANTS.collapsible;
    },
    get width() {
      return width();
    },
    get resizable() {
      return props.resizable ?? false;
    },
    get minWidth() {
      return props.minWidth ?? MIN_WIDTH_PX;
    },
    get maxWidth() {
      return props.maxWidth ?? MAX_WIDTH_PX;
    },
    get isResizing() {
      return resizing();
    },
    setIsResizing: setResizing,
    setWidth,
    get isPeeking() {
      return peeking();
    },
    get peekable() {
      return props.peekable ?? false;
    },
    startPeek,
    stopPeek,
    get contained() {
      return props.contained ?? false;
    },
    get animationDuration() {
      return props.animationDuration ?? SIDEBAR_ANIMATION_DURATION_MS;
    },
  };

  const sidebarWidth = () =>
    context.resizable ? `${context.width}px` : SIDEBAR_WIDTH;

  return (
    <SidebarContext.Provider value={context}>
      <div
        {...wrapperProps}
        data-sidebar-wrapper=""
        data-state={state()}
        data-side={context.side}
        style={{
          "--sidebar-width": sidebarWidth(),
          "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          "--sidebar-animation-duration": `${context.animationDuration}ms`,
          "--sidebar-easing": SIDEBAR_EASING,
          ...(props.style as JSX.CSSProperties),
        }}
        class={cn(
          "group/sidebar-wrapper relative isolate flex w-full [--sidebar-active-bg:var(--color-kumo-tint)] [--sidebar-bg:var(--color-kumo-base)]",
          !context.contained && !context.isMobile && "min-h-svh",
          "has-data-[variant=inset]:bg-kumo-recessed",
          context.isResizing && "select-none",
          props.class,
          props.className,
        )}
      >
        {props.children}
      </div>
    </SidebarContext.Provider>
  );
}

const NamedSidebarProvider = Object.assign(SidebarProvider, {
  displayName: "Sidebar.Provider",
});

export interface SidebarRootProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "children" | "class" | "className"
> {
  children: JSX.Element;
  class?: string;
  className?: string;
  contentClassName?: string;
  fullScreenOnMobile?: boolean;
  ref?: Ref<HTMLElement>;
}

function SidebarRoot(inputProps: SidebarRootProps) {
  const [props, asideProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "contentClassName",
    "fullScreenOnMobile",
    "ref",
  ]);
  const sidebar = useSidebar();
  let mobileNode: HTMLElement | undefined;
  let opener: HTMLElement | null = null;
  let restoreFocus = false;

  createEffect(() => {
    const open = sidebar.openMobile;
    if (!mobileNode) return;
    mobileNode.toggleAttribute("inert", !open);
  });

  createEffect(() => {
    if (!sidebar.isMobile || !sidebar.openMobile) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      restoreFocus = true;
      sidebar.setOpenMobile(false);
    };
    document.addEventListener("keydown", onKeyDown);
    onCleanup(() => document.removeEventListener("keydown", onKeyDown));
  });

  createEffect(() => {
    if (!sidebar.isMobile) return;
    if (sidebar.openMobile) {
      opener = document.activeElement as HTMLElement | null;
      restoreFocus = false;
      requestAnimationFrame(() => {
        const first =
          mobileNode?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        (first ?? mobileNode)?.focus();
      });
    } else if (restoreFocus && opener) {
      opener.focus();
      restoreFocus = false;
      opener = null;
    }
  });

  const expandedWidth = () =>
    sidebar.resizable ? `${sidebar.width}px` : "var(--sidebar-width)";
  const collapsedWidth = () =>
    sidebar.collapsible === "icon" ? "var(--sidebar-width-icon)" : "0px";
  const railWidth = () => (sidebar.open ? expandedWidth() : collapsedWidth());
  const contentWidth = () =>
    sidebar.open || sidebar.isPeeking ? expandedWidth() : collapsedWidth();
  const borderClasses = () =>
    sidebar.variant === "sidebar"
      ? sidebar.side === "left"
        ? "border-r border-kumo-line"
        : "border-l border-kumo-line"
      : sidebar.variant === "floating"
        ? "border border-kumo-line"
        : "";

  return (
    <Switch>
      <Match when={sidebar.collapsible === "none"}>
        <aside
          {...asideProps}
          ref={(node) => setRef(props.ref, node)}
          data-state="expanded"
          data-side={sidebar.side}
          data-variant={sidebar.variant}
          data-sidebar="sidebar"
          style={{
            width: "var(--sidebar-width)",
            "min-width": "var(--sidebar-width)",
            "max-width": "var(--sidebar-width)",
          }}
          class={cn(
            "relative flex h-full shrink-0 grow-0 flex-col overflow-hidden bg-(--sidebar-bg) text-kumo-default",
            sidebar.variant === "sidebar" &&
              (sidebar.side === "left"
                ? "border-r border-kumo-line"
                : "border-l border-kumo-line"),
            sidebar.variant === "floating" &&
              "m-2 rounded-lg border border-kumo-line shadow-lg",
            props.class,
            props.className,
          )}
        >
          {props.children}
        </aside>
      </Match>
      <Match when={sidebar.isMobile}>
        <>
          <div
            data-sidebar-backdrop=""
            class={cn(
              sidebar.contained
                ? "absolute inset-0 z-40 bg-kumo-recessed"
                : "fixed inset-0 z-40 bg-kumo-recessed",
              "transition-opacity duration-(--sidebar-animation-duration) ease-(--sidebar-easing) motion-reduce:transition-none",
              sidebar.openMobile && !props.fullScreenOnMobile
                ? "opacity-80"
                : "pointer-events-none opacity-0",
            )}
            onClick={() => {
              restoreFocus = true;
              sidebar.setOpenMobile(false);
            }}
            aria-hidden="true"
          />
          <nav
            {...asideProps}
            ref={(node) => {
              mobileNode = node;
              node.toggleAttribute("inert", !sidebar.openMobile);
              setRef(props.ref, node);
            }}
            tabindex={-1}
            aria-label="Navigation"
            aria-hidden={!sidebar.openMobile}
            data-state={sidebar.openMobile ? "expanded" : "collapsed"}
            data-side={sidebar.side}
            data-variant={sidebar.variant}
            data-collapsible={sidebar.collapsible}
            data-sidebar="sidebar"
            data-mobile="true"
            class={cn(
              "group/sidebar inset-y-0 z-50 flex flex-col overflow-hidden",
              sidebar.contained ? "absolute" : "fixed",
              props.fullScreenOnMobile ? "w-full" : "w-(--sidebar-width)",
              "bg-(--sidebar-bg) text-kumo-default",
              !props.fullScreenOnMobile && "border-r border-kumo-line",
              "transition-transform duration-(--sidebar-animation-duration) ease-(--sidebar-easing) motion-reduce:transition-none",
              sidebar.side === "left" && "left-0",
              sidebar.side === "right" && "right-0",
              sidebar.side === "left" &&
                (sidebar.openMobile ? "translate-x-0" : "-translate-x-full"),
              sidebar.side === "right" &&
                (sidebar.openMobile ? "translate-x-0" : "translate-x-full"),
              props.class,
              props.className,
            )}
          >
            {props.children}
          </nav>
        </>
      </Match>
      <Match when>
        <aside
          {...asideProps}
          ref={(node) => setRef(props.ref, node)}
          data-state={sidebar.state}
          data-side={sidebar.side}
          data-variant={sidebar.variant}
          data-collapsible={sidebar.collapsible}
          data-sidebar="sidebar"
          style={{ width: railWidth() }}
          class={cn(
            "group/sidebar relative h-full shrink-0 grow-0 overflow-visible",
            "transition-[width] duration-(--sidebar-animation-duration) ease-(--sidebar-easing) motion-reduce:transition-none",
            sidebar.isResizing && "transition-none!",
            sidebar.variant === "floating" && "m-2 rounded-lg shadow-lg",
            props.class,
            props.className,
          )}
        >
          <TooltipProvider>
            <div
              data-sidebar="content-container"
              style={{ width: contentWidth() }}
              class={cn(
                "flex h-full min-w-0 flex-col overflow-hidden bg-(--sidebar-bg) whitespace-nowrap text-kumo-default",
                borderClasses(),
                "transition-[width] duration-(--sidebar-animation-duration) ease-(--sidebar-easing) motion-reduce:transition-none",
                sidebar.isResizing && "transition-none!",
                !sidebar.open &&
                  cn(
                    sidebar.contained ? "absolute" : "fixed",
                    "inset-y-0 z-40",
                    sidebar.side === "left" && "left-0",
                    sidebar.side === "right" && "right-0",
                  ),
                sidebar.open && "relative",
                props.contentClassName,
              )}
            >
              <div
                data-sidebar="peek-zone"
                class="flex min-h-0 flex-1 flex-col"
                onMouseEnter={sidebar.startPeek}
                onMouseLeave={sidebar.stopPeek}
                onFocusIn={sidebar.startPeek}
                onFocusOut={(event) => {
                  if (
                    !event.currentTarget.contains(
                      event.relatedTarget as Node | null,
                    )
                  ) {
                    sidebar.stopPeek();
                  }
                }}
              >
                {props.children}
              </div>
            </div>
          </TooltipProvider>
        </aside>
      </Match>
    </Switch>
  );
}

const NamedSidebarRoot = Object.assign(SidebarRoot, {
  displayName: "Sidebar",
});

type DivProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "className"
> & {
  class?: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
};

function SidebarHeader(inputProps: DivProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "class",
    "className",
    "ref",
  ]);
  return (
    <div
      {...elementProps}
      ref={props.ref}
      data-sidebar="header"
      class={cn(
        "flex h-[58px] shrink-0 items-center gap-1 overflow-hidden border-b border-kumo-line px-3",
        props.class,
        props.className,
      )}
    />
  );
}
const NamedSidebarHeader = Object.assign(SidebarHeader, {
  displayName: "Sidebar.Header",
});

function SidebarContent(inputProps: DivProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "ref",
  ]);
  return (
    <div
      {...elementProps}
      ref={props.ref}
      data-sidebar="content"
      class={cn(
        "relative min-w-0 flex-1 overflow-hidden",
        props.class,
        props.className,
      )}
    >
      <div
        tabindex={-1}
        class={cn(
          "h-full overflow-x-hidden! overflow-y-auto px-[11px] py-3 group-not-data-[state=collapsed]/sidebar:px-3.5",
          "transition-[padding] duration-(--sidebar-animation-duration)",
        )}
      >
        <div class="flex min-w-0! flex-col">{props.children}</div>
      </div>
    </div>
  );
}
const NamedSidebarContent = Object.assign(SidebarContent, {
  displayName: "Sidebar.Content",
});

function SidebarFooter(inputProps: DivProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "class",
    "className",
    "ref",
  ]);
  return (
    <div
      {...elementProps}
      ref={props.ref}
      data-sidebar="footer"
      class={cn(
        "sticky bottom-0 flex h-12 w-(--sidebar-width) shrink-0 items-center gap-4 overflow-hidden border-t border-kumo-line bg-(--sidebar-bg) bg-clip-padding px-[11px] whitespace-nowrap",
        "transition-[width,padding] duration-(--sidebar-animation-duration) ease-(--sidebar-easing) motion-reduce:transition-none",
        "group-not-data-[state=collapsed]/sidebar:px-4 group-data-[state=collapsed]/sidebar:w-(--sidebar-width-icon)",
        "group-data-[state=collapsed]/sidebar:border-r group-data-[state=collapsed]/sidebar:border-kumo-line",
        props.class,
        props.className,
      )}
    />
  );
}
const NamedSidebarFooter = Object.assign(SidebarFooter, {
  displayName: "Sidebar.Footer",
});

const SIDEBAR_LOADING_GROUPS = [
  ["w-28", "w-40", "w-24"],
  ["w-24", "w-36", "w-32"],
] as const;

export interface SidebarLoadingProps extends DivProps {
  label?: string;
}

function SidebarLoading(inputProps: SidebarLoadingProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "class",
    "className",
    "label",
    "ref",
  ]);
  return (
    <div
      {...elementProps}
      ref={props.ref}
      data-sidebar="loading"
      role="status"
      aria-label={props.label ?? "Loading"}
      class={cn(
        "flex min-h-0 w-full flex-1 flex-col gap-4 px-2 py-3",
        props.class,
        props.className,
      )}
    >
      <For each={SIDEBAR_LOADING_GROUPS}>
        {(widths) => (
          <div class="flex flex-col gap-0.5">
            <SkeletonLine className="mb-1 ml-2 h-2 w-16 rounded-full group-data-[state=collapsed]/sidebar:hidden" />
            <For each={widths}>
              {(width) => (
                <div class="flex min-h-8.5 items-center gap-3 rounded-lg px-3 group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:px-0">
                  <SkeletonLine className="size-4.5 shrink-0 rounded-md" />
                  <SkeletonLine
                    className={cn(
                      "h-2.5 rounded-full group-data-[state=collapsed]/sidebar:hidden",
                      width,
                    )}
                  />
                </div>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
}
const NamedSidebarLoading = Object.assign(SidebarLoading, {
  displayName: "Sidebar.Loading",
});

function SidebarGroup(inputProps: DivProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "class",
    "className",
    "ref",
  ]);
  return (
    <div
      {...elementProps}
      ref={props.ref}
      data-sidebar="group"
      class={cn("flex min-w-0 flex-col gap-y-px", props.class, props.className)}
    />
  );
}
const NamedSidebarGroup = Object.assign(SidebarGroup, {
  displayName: "Sidebar.Group",
});

function SidebarGroupLabel(inputProps: DivProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "ref",
  ]);
  return (
    <div
      {...elementProps}
      ref={props.ref}
      data-sidebar="group-label"
      class={cn(
        "my-3 grid grid-rows-[0fr] overflow-hidden border-b border-kumo-line",
        "transition-[grid-template-rows,margin,border-color] duration-(--sidebar-animation-duration) ease-(--sidebar-easing)",
        "[[data-sidebar=group]:first-child_&]:my-0 [[data-sidebar=group]:first-child_&]:border-transparent",
        "group-not-data-[state=collapsed]/sidebar:my-0 group-not-data-[state=collapsed]/sidebar:grid-rows-[1fr] group-not-data-[state=collapsed]/sidebar:border-transparent",
        "group-data-[mobile=true]/sidebar:my-0 group-data-[mobile=true]/sidebar:grid-rows-[1fr] group-data-[mobile=true]/sidebar:border-transparent",
        props.class,
        props.className,
      )}
    >
      <div class="min-h-0 min-w-0">
        <div class="mt-4 mb-2 truncate px-3 text-sm font-medium text-kumo-subtle [[data-sidebar=group]:first-child_&]:mt-2">
          {props.children}
        </div>
      </div>
    </div>
  );
}
const NamedSidebarGroupLabel = Object.assign(SidebarGroupLabel, {
  displayName: "Sidebar.GroupLabel",
});

const MenuItemContext = createContext(false);
const MenuSubItemContext = createContext(false);

type UlProps = Omit<
  JSX.HTMLAttributes<HTMLUListElement>,
  "class" | "className"
> & {
  class?: string;
  className?: string;
  ref?: Ref<HTMLUListElement>;
};

function SidebarMenu(inputProps: UlProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "class",
    "className",
    "ref",
  ]);
  return (
    <ul
      {...elementProps}
      ref={props.ref}
      data-sidebar="menu"
      class={cn(
        "m-0 flex min-w-0 list-none flex-col items-stretch gap-y-px p-0",
        props.class,
        props.className,
      )}
    />
  );
}
const NamedSidebarMenu = Object.assign(SidebarMenu, {
  displayName: "Sidebar.Menu",
});

type LiProps = Omit<
  JSX.LiHTMLAttributes<HTMLLIElement>,
  "class" | "className"
> & {
  class?: string;
  className?: string;
  ref?: Ref<HTMLLIElement>;
};

function SidebarMenuItem(inputProps: LiProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "ref",
  ]);
  return (
    <MenuItemContext.Provider value>
      <li
        {...elementProps}
        ref={props.ref}
        data-sidebar="menu-item"
        class={cn(
          "relative group-data-[state=collapsed]/sidebar:overflow-hidden",
          props.class,
          props.className,
        )}
      >
        {props.children}
      </li>
    </MenuItemContext.Provider>
  );
}
const NamedSidebarMenuItem = Object.assign(SidebarMenuItem, {
  displayName: "Sidebar.MenuItem",
});

export type SidebarMenuButtonSize = "base" | "sm";
export interface SidebarMenuButtonProps extends Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "class" | "className"
> {
  icon?: Component<{ class?: string; className?: string }> | JSX.Element;
  active?: boolean;
  size?: SidebarMenuButtonSize;
  href?: string;
  target?: JSX.AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  tooltip?: string;
  class?: string;
  className?: string;
  children?: JSX.Element;
  ref?: Ref<HTMLButtonElement>;
}

function SidebarMenuButton(inputProps: SidebarMenuButtonProps) {
  const [props, buttonProps] = splitProps(inputProps, [
    "active",
    "children",
    "class",
    "className",
    "href",
    "icon",
    "onClick",
    "ref",
    "size",
    "target",
    "tooltip",
  ]);
  const sidebar = useSidebar();
  const LinkComponent = useLinkComponent();
  const insideItem = useContext(MenuItemContext);
  const size = () => props.size ?? "base";
  const classes = () =>
    cn(
      "group/menu-button relative flex w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-lg outline-none",
      "before:absolute before:inset-x-0 before:-inset-y-px",
      size() === "base" && "min-h-8.5 px-3 py-0 text-sm font-medium",
      size() === "sm" && "min-h-7 px-2 py-0 text-sm",
      "text-kumo-default transition-[color,box-shadow,outline] duration-(--sidebar-animation-duration)",
      !props.active && "hover:bg-(--sidebar-active-bg)",
      props.active && "bg-(--sidebar-active-bg)",
      "has-[[data-active]]:bg-transparent has-[[data-active]]:hover:bg-(--sidebar-active-bg)",
      "focus:outline-none focus-visible:bg-(--sidebar-active-bg) focus-visible:text-kumo-strong",
      props.class,
      props.className,
    );
  const icon = () => {
    if (!props.icon) return undefined;
    if (typeof props.icon === "function") {
      return (
        <Dynamic
          component={props.icon as Component<{ class?: string }>}
          class={cn(
            "shrink-0 opacity-40",
            size() === "base" ? "size-4" : "size-3.5",
          )}
        />
      );
    }
    return props.icon;
  };
  const content = () => (
    <div class="flex min-w-0 flex-1 translate-x-[-3px] items-center gap-3 transition-transform duration-(--sidebar-animation-duration) group-not-data-[state=collapsed]/sidebar:translate-x-0">
      {icon()}
      <span class="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-left">
        <span class="min-w-0 flex-1 truncate">{props.children}</span>
      </span>
    </div>
  );

  const renderControl = (
    externalProps: JSX.HTMLAttributes<HTMLElement> = {},
  ) => (
    <Show
      when={props.href}
      fallback={
        <button
          {...(mergeBaseUIProps<"button">(
            buttonProps as JSX.ButtonHTMLAttributes<HTMLButtonElement>,
            {
              get ref() {
                return props.ref;
              },
              type: "button",
              get class() {
                return classes();
              },
              get "data-active"() {
                return props.active || undefined;
              },
              "data-sidebar": "menu-button",
              "data-kumo-component": "Sidebar",
              "data-kumo-part": "menu-button",
              get "data-size"() {
                return size();
              },
              get onClick() {
                return props.onClick;
              },
            } as JSX.ButtonHTMLAttributes<HTMLButtonElement>,
            externalProps as JSX.ButtonHTMLAttributes<HTMLButtonElement>,
          ) as unknown as JSX.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {content()}
        </button>
      }
    >
      {(href) => (
        <LinkComponent
          {...(mergeBaseUIProps<"a">(
            externalProps as JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
            {
              get class() {
                return cn(classes(), "no-underline!");
              },
              get ref() {
                return props.ref as unknown as Ref<HTMLAnchorElement>;
              },
              get onClick() {
                return props.onClick as unknown as JSX.EventHandlerUnion<
                  HTMLAnchorElement,
                  MouseEvent
                >;
              },
            } as JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
          ) as unknown as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}
          href={href()}
          to={href()}
          target={props.target}
          data-active={props.active || undefined}
          data-sidebar="menu-button"
          data-kumo-component="Sidebar"
          data-kumo-part="menu-button-link"
          data-size={size()}
        >
          {content()}
        </LinkComponent>
      )}
    </Show>
  );

  const control = () => (
    <Show when={props.tooltip} fallback={renderControl({})}>
      {(tooltip) => (
        <Tooltip
          content={tooltip()}
          disabled={sidebar.state !== "collapsed" || sidebar.peekable}
          side="right"
          render={renderControl}
        />
      )}
    </Show>
  );

  return (
    <Show
      when={insideItem}
      fallback={
        <li
          data-sidebar="menu-item"
          class="relative group-data-[state=collapsed]/sidebar:overflow-hidden"
        >
          {control()}
        </li>
      }
    >
      {control()}
    </Show>
  );
}
const NamedSidebarMenuButton = Object.assign(SidebarMenuButton, {
  displayName: "Sidebar.MenuButton",
});

type SpanProps = Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  "class" | "className"
> & {
  class?: string;
  className?: string;
  ref?: Ref<HTMLSpanElement>;
};

function SidebarMenuBadge(inputProps: SpanProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "class",
    "className",
    "ref",
  ]);
  return (
    <span
      {...elementProps}
      ref={props.ref}
      data-sidebar="menu-badge"
      class={cn(
        "inline-flex shrink-0 items-center rounded-full border border-dashed border-kumo-line px-1.5 py-0.5 text-[11px]/none font-medium text-kumo-strong select-none",
        "group-data-[state=collapsed]/sidebar:hidden",
        props.class,
        props.className,
      )}
    />
  );
}
const NamedSidebarMenuBadge = Object.assign(SidebarMenuBadge, {
  displayName: "Sidebar.MenuBadge",
});

function SidebarMenuSub(inputProps: UlProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "ref",
  ]);
  return (
    <ul
      {...elementProps}
      ref={props.ref}
      data-sidebar="menu-sub"
      class={cn(
        "relative m-0 flex min-w-0 list-none flex-col gap-y-px overflow-hidden p-0 pr-0 pl-7",
        props.class,
        props.className,
      )}
    >
      <div class="absolute inset-y-px left-[19px] z-10 w-px bg-kumo-line" />
      {props.children}
    </ul>
  );
}
const NamedSidebarMenuSub = Object.assign(SidebarMenuSub, {
  displayName: "Sidebar.MenuSub",
});

function SidebarMenuSubItem(inputProps: LiProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "ref",
  ]);
  return (
    <MenuSubItemContext.Provider value>
      <li
        {...elementProps}
        ref={props.ref}
        data-sidebar="menu-sub-item"
        class={cn("relative", props.class, props.className)}
      >
        {props.children}
      </li>
    </MenuSubItemContext.Provider>
  );
}
const NamedSidebarMenuSubItem = Object.assign(SidebarMenuSubItem, {
  displayName: "Sidebar.MenuSubItem",
});

export interface SidebarMenuSubButtonProps extends Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "class" | "className"
> {
  active?: boolean;
  href?: string;
  target?: JSX.AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  class?: string;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
}

function SidebarMenuSubButton(inputProps: SidebarMenuSubButtonProps) {
  const [props, buttonProps] = splitProps(inputProps, [
    "active",
    "children",
    "class",
    "className",
    "href",
    "onClick",
    "ref",
    "target",
  ]);
  const LinkComponent = useLinkComponent();
  const insideItem = useContext(MenuSubItemContext);
  const classes = () =>
    cn(
      "group/menu-button relative flex min-h-8.5 w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg px-3 py-0 text-sm font-medium outline-none",
      "before:absolute before:inset-x-0 before:-inset-y-px",
      "text-kumo-default transition-[color] duration-150",
      !props.active && "hover:bg-(--sidebar-active-bg)",
      props.active && "bg-(--sidebar-active-bg)",
      "focus:outline-none focus-visible:bg-(--sidebar-active-bg) focus-visible:text-kumo-strong",
      props.class,
      props.className,
    );
  const content = () => (
    <span class="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-left">
      <span class="min-w-0 flex-1 truncate">{props.children}</span>
    </span>
  );
  const control = () => (
    <Show
      when={props.href}
      fallback={
        <button
          {...buttonProps}
          ref={props.ref}
          type="button"
          class={classes()}
          data-active={props.active || undefined}
          data-sidebar="menu-sub-button"
          data-kumo-component="Sidebar"
          data-kumo-part="menu-sub-button"
          onClick={props.onClick}
        >
          {content()}
        </button>
      }
    >
      {(href) => (
        <LinkComponent
          class={cn(classes(), "no-underline!")}
          href={href()}
          to={href()}
          target={props.target}
          data-active={props.active || undefined}
          data-sidebar="menu-sub-button"
          data-kumo-component="Sidebar"
          data-kumo-part="menu-sub-button-link"
          onClick={
            props.onClick as unknown as JSX.EventHandlerUnion<
              HTMLAnchorElement,
              MouseEvent
            >
          }
        >
          {content()}
        </LinkComponent>
      )}
    </Show>
  );
  return (
    <Show
      when={insideItem}
      fallback={
        <li data-sidebar="menu-sub-item" class="relative">
          {control()}
        </li>
      }
    >
      {control()}
    </Show>
  );
}
const NamedSidebarMenuSubButton = Object.assign(SidebarMenuSubButton, {
  displayName: "Sidebar.MenuSubButton",
});

function SidebarSeparator(inputProps: DivProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "class",
    "className",
    "ref",
  ]);
  return (
    <div
      {...elementProps}
      ref={props.ref}
      data-sidebar="separator"
      class={cn("my-3 px-2", props.class, props.className)}
    >
      <div class="border-b border-kumo-line" />
    </div>
  );
}
const NamedSidebarSeparator = Object.assign(SidebarSeparator, {
  displayName: "Sidebar.Separator",
});

function SidebarPanelIcon(props: { class?: string; className?: string }) {
  const sidebar = useSidebar();
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      class={cn("shrink-0", props.class, props.className)}
    >
      <path d="M21.25 6.72v10.56a2.97 2.97 0 0 1-2.97 2.97H5.72a2.97 2.97 0 0 1-2.97-2.97V6.72a2.97 2.97 0 0 1 2.97-2.97h12.56a2.97 2.97 0 0 1 2.97 2.97" />
      <path
        d="M6.25 7.25v9.5"
        class={cn(
          "transition-transform duration-(--sidebar-animation-duration) ease-(--sidebar-easing)",
          sidebar.open ? "translate-x-px" : "translate-x-[10.5px]",
        )}
      />
    </svg>
  );
}

type ButtonProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "class" | "className" | "style"
> & {
  class?: string;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
  style?: JSX.CSSProperties;
};

function SidebarTrigger(inputProps: ButtonProps) {
  const [props, buttonProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "onClick",
    "ref",
  ]);
  const sidebar = useSidebar();
  return (
    <button
      {...buttonProps}
      ref={props.ref}
      type="button"
      data-sidebar="trigger"
      data-kumo-component="Sidebar"
      data-kumo-part="trigger"
      aria-expanded={sidebar.open}
      aria-label={sidebar.open ? "Collapse sidebar" : "Expand sidebar"}
      class={cn(
        "flex size-8.5 shrink-0 cursor-pointer items-center justify-center rounded-lg",
        "text-kumo-subtle hover:bg-(--sidebar-active-bg) hover:text-kumo-default",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand focus-visible:ring-inset",
        props.class,
        props.className,
      )}
      onClick={(event) => {
        callEventHandler(props.onClick, event);
        sidebar.toggleSidebar();
      }}
    >
      {props.children ?? <SidebarPanelIcon />}
    </button>
  );
}
const NamedSidebarTrigger = Object.assign(SidebarTrigger, {
  displayName: "Sidebar.Trigger",
});

function SidebarClose(inputProps: ButtonProps) {
  const [props, buttonProps] = splitProps(inputProps, [
    "class",
    "className",
    "onClick",
    "ref",
  ]);
  const sidebar = useSidebar();
  return (
    <Button
      {...buttonProps}
      ref={props.ref}
      variant="ghost"
      shape="square"
      size="sm"
      data-sidebar="close"
      data-kumo-component="Sidebar"
      data-kumo-part="close"
      aria-label="Close navigation"
      className={cn("shrink-0", props.class, props.className)}
      onClick={(event) => {
        callEventHandler(props.onClick, event);
        sidebar.setOpenMobile(false);
      }}
    >
      <XIcon size={18} />
    </Button>
  );
}
const NamedSidebarClose = Object.assign(SidebarClose, {
  displayName: "Sidebar.Close",
});

function SidebarRail(inputProps: ButtonProps) {
  const [props, buttonProps] = splitProps(inputProps, [
    "class",
    "className",
    "onClick",
    "ref",
  ]);
  const sidebar = useSidebar();
  return (
    <button
      {...buttonProps}
      ref={props.ref}
      type="button"
      data-sidebar="rail"
      data-kumo-component="Sidebar"
      data-kumo-part="rail"
      aria-label="Toggle sidebar"
      tabindex={-1}
      class={cn(
        "absolute inset-y-0 z-1 hidden w-4 -translate-x-1/2 cursor-pointer transition-all",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 hover:after:bg-kumo-brand/20",
        "group-data-[side=left]/sidebar-wrapper:right-0 group-data-[side=right]/sidebar-wrapper:left-0 sm:flex",
        props.class,
        props.className,
      )}
      onClick={(event) => {
        callEventHandler(props.onClick, event);
        sidebar.toggleSidebar();
      }}
    />
  );
}
const NamedSidebarRail = Object.assign(SidebarRail, {
  displayName: "Sidebar.Rail",
});

function SidebarResizeHandle(inputProps: ButtonProps) {
  const [props, buttonProps] = splitProps(inputProps, [
    "class",
    "className",
    "onKeyDown",
    "onPointerDown",
    "ref",
  ]);
  const sidebar = useSidebar();
  let startX = 0;
  let startWidth = 0;
  let wasCollapsed = false;

  const pointerDown: JSX.EventHandler<HTMLButtonElement, PointerEvent> = (
    event,
  ) => {
    callEventHandler(props.onPointerDown, event);
    event.preventDefault();
    sidebar.setIsResizing(true);
    startX = event.clientX;
    wasCollapsed = !sidebar.open;
    const wrapper = event.currentTarget.closest("[data-sidebar-wrapper]");
    const element = wrapper?.querySelector("[data-sidebar='sidebar']");
    startWidth = element?.getBoundingClientRect().width ?? 0;
    const move = (moveEvent: PointerEvent) => {
      const delta =
        sidebar.side === "left"
          ? moveEvent.clientX - startX
          : startX - moveEvent.clientX;
      const width = startWidth + delta;
      if (wasCollapsed) {
        if (width >= sidebar.minWidth) {
          wasCollapsed = false;
          sidebar.setOpen(true);
          sidebar.setWidth(width);
        }
        return;
      }
      if (width < sidebar.minWidth) {
        sidebar.setOpen(false);
        wasCollapsed = true;
      } else {
        sidebar.setWidth(width);
      }
    };
    const up = () => {
      sidebar.setIsResizing(false);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  };
  const keyDown: JSX.EventHandler<HTMLButtonElement, KeyboardEvent> = (
    event,
  ) => {
    callEventHandler(props.onKeyDown, event);
    const grow = sidebar.side === "left" ? "ArrowRight" : "ArrowLeft";
    const shrink = sidebar.side === "left" ? "ArrowLeft" : "ArrowRight";
    if (event.key === grow) {
      event.preventDefault();
      if (!sidebar.open) {
        sidebar.setOpen(true);
        sidebar.setWidth(sidebar.minWidth);
      } else {
        sidebar.setWidth(Math.min(sidebar.width + 10, sidebar.maxWidth));
      }
    } else if (event.key === shrink) {
      event.preventDefault();
      const next = sidebar.width - 10;
      if (next < sidebar.minWidth) sidebar.setOpen(false);
      else sidebar.setWidth(next);
    } else if (event.key === "Home") {
      event.preventDefault();
      sidebar.setOpen(false);
    } else if (event.key === "End") {
      event.preventDefault();
      sidebar.setOpen(true);
      sidebar.setWidth(sidebar.maxWidth);
    }
  };

  return (
    <Show when={sidebar.resizable}>
      <button
        {...buttonProps}
        ref={props.ref}
        type="button"
        aria-label="Resize sidebar"
        tabindex={0}
        data-sidebar="resize-handle"
        class={cn(
          "absolute inset-y-0 z-2 hidden w-3 cursor-col-resize sm:block",
          "after:absolute after:inset-y-0 after:w-0.5 after:bg-transparent after:transition-colors",
          "hover:after:bg-kumo-hairline focus:outline-none focus-visible:after:bg-kumo-hairline active:after:bg-kumo-hairline",
          sidebar.side === "left" && "right-0 after:right-0",
          sidebar.side === "right" && "left-0 after:left-0",
          props.class,
          props.className,
        )}
        onPointerDown={pointerDown}
        onKeyDown={keyDown}
      />
    </Show>
  );
}
const NamedSidebarResizeHandle = Object.assign(SidebarResizeHandle, {
  displayName: "Sidebar.ResizeHandle",
});

interface CollapseContextValue {
  readonly contentId: string;
  readonly isOpen: boolean;
  readonly isCollapsible: boolean;
  readonly autoScrollOnOpen: boolean;
  toggle: () => void;
}
const CollapseContext = createContext<CollapseContextValue>({
  contentId: "",
  isOpen: true,
  isCollapsible: false,
  autoScrollOnOpen: false,
  toggle: () => undefined,
});

export interface SidebarCollapsibleProps extends DivProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  autoScrollOnOpen?: boolean;
}

function SidebarCollapsibleRoot(inputProps: SidebarCollapsibleProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "autoScrollOnOpen",
    "children",
    "class",
    "className",
    "defaultOpen",
    "onOpenChange",
    "open",
    "ref",
  ]);
  const [internalOpen, setInternalOpen] = createSignal(
    props.defaultOpen ?? false,
  );
  const contentId = `sidebar-collapsible-${createUniqueId()}`;
  let keyboardExpanded = false;
  const open = () => props.open ?? internalOpen();
  const setOpen = (next: boolean) => {
    setInternalOpen(next);
    props.onOpenChange?.(next);
  };
  const toggle = () => {
    setOpen(!open());
    keyboardExpanded = false;
  };
  const context: CollapseContextValue = {
    contentId,
    get isOpen() {
      return open();
    },
    isCollapsible: true,
    get autoScrollOnOpen() {
      return props.autoScrollOnOpen ?? false;
    },
    toggle,
  };

  return (
    <CollapseContext.Provider value={context}>
      <div
        {...elementProps}
        ref={props.ref}
        data-open={open() || undefined}
        class={cn("min-w-0", props.class, props.className)}
        onFocusIn={(event) => {
          if (
            !open() &&
            (event.target as HTMLElement).matches(":focus-visible")
          ) {
            keyboardExpanded = true;
            setOpen(true);
          }
        }}
        onFocusOut={(event) => {
          if (
            keyboardExpanded &&
            !event.currentTarget.contains(event.relatedTarget as Node | null) &&
            !event.currentTarget.querySelector("[data-active]")
          ) {
            keyboardExpanded = false;
            setOpen(false);
          }
        }}
      >
        {props.children}
      </div>
    </CollapseContext.Provider>
  );
}
const NamedSidebarCollapsible = Object.assign(SidebarCollapsibleRoot, {
  displayName: "Sidebar.Collapsible",
});

export interface SidebarCollapsibleTriggerProps {
  render: useRender.RenderProp;
}

function SidebarCollapsibleTrigger(props: SidebarCollapsibleTriggerProps) {
  const collapse = useContext(CollapseContext);
  const rendered = useRender({
    get render() {
      return props.render;
    },
    props: {
      get "aria-expanded"() {
        return collapse.isOpen;
      },
      "aria-controls": collapse.contentId,
      get "data-open"() {
        return collapse.isOpen || undefined;
      },
      onClick: collapse.toggle,
    },
  });
  return rendered();
}
const NamedSidebarCollapsibleTrigger = Object.assign(
  SidebarCollapsibleTrigger,
  { displayName: "Sidebar.CollapsibleTrigger" },
);

function SidebarCollapsibleContent(inputProps: DivProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "ref",
  ]);
  const collapse = useContext(CollapseContext);
  const sidebar = useSidebar();
  let element: HTMLDivElement | undefined;
  const open = () => collapse.isOpen && sidebar.state !== "collapsed";
  createEffect(() => {
    element?.toggleAttribute("inert", !open());
  });
  createEffect(() => {
    if (!open() || !collapse.autoScrollOnOpen) return;
    const timeout = window.setTimeout(() => {
      const reduced = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      element?.scrollIntoView?.({
        block: "nearest",
        behavior: reduced ? "auto" : "smooth",
      });
    }, sidebar.animationDuration);
    onCleanup(() => window.clearTimeout(timeout));
  });
  return (
    <div
      {...elementProps}
      ref={(node) => {
        element = node;
        node.toggleAttribute("inert", !open());
        setRef(props.ref, node);
      }}
      id={collapse.contentId}
      role="region"
      aria-hidden={!open()}
      class={cn(
        "grid transition-[grid-template-rows] duration-(--sidebar-animation-duration) ease-(--sidebar-easing) motion-reduce:transition-none",
        open() ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        props.class,
        props.className,
      )}
    >
      <div class="overflow-hidden">{props.children}</div>
    </div>
  );
}
const NamedSidebarCollapsibleContent = Object.assign(
  SidebarCollapsibleContent,
  { displayName: "Sidebar.CollapsibleContent" },
);

function SidebarMenuChevron(props: { class?: string; className?: string }) {
  const collapse = useContext(CollapseContext);
  return (
    <CaretRightIcon
      size={12}
      class={cn(
        "ml-auto shrink-0 opacity-40 transition-[transform,rotate,opacity] duration-200 group-hover/menu-button:opacity-100",
        collapse.isCollapsible && collapse.isOpen && "rotate-90",
        "group-data-[state=collapsed]/sidebar:hidden",
        props.class,
        props.className,
      )}
    />
  );
}
const NamedSidebarMenuChevron = Object.assign(SidebarMenuChevron, {
  displayName: "Sidebar.MenuChevron",
});

interface SlidingContextValue {
  activeKey: () => string;
  register: (value: string) => () => void;
}
const SlidingContext = createContext<SlidingContextValue>();

export interface SidebarSlidingViewsProps extends DivProps {
  activeKey: string;
  direction?: "left" | "right";
}

function SidebarSlidingViews(inputProps: SidebarSlidingViewsProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "activeKey",
    "children",
    "class",
    "className",
    "direction",
    "ref",
  ]);
  const [values, setValues] = createSignal<string[]>([]);
  const context: SlidingContextValue = {
    activeKey: () => props.activeKey,
    register(value) {
      setValues((current) => [...current, value]);
      return () =>
        setValues((current) =>
          current.filter((candidate) => candidate !== value),
        );
    },
  };
  const activeIndex = () => Math.max(0, values().indexOf(props.activeKey));
  const reducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  return (
    <SlidingContext.Provider value={context}>
      <div
        {...elementProps}
        ref={props.ref}
        data-sidebar="sliding-views"
        class={cn(
          "flex min-h-0 max-w-(--sidebar-width) flex-1 overflow-hidden",
          props.class,
          props.className,
        )}
      >
        <div
          class="flex min-h-0 w-full shrink-0"
          style={{
            transform: `translateX(-${activeIndex() * 100}%)`,
            transition: reducedMotion()
              ? "none"
              : "transform var(--sidebar-animation-duration) var(--sidebar-easing)",
          }}
        >
          {props.children}
        </div>
      </div>
    </SlidingContext.Provider>
  );
}
const NamedSidebarSlidingViews = Object.assign(SidebarSlidingViews, {
  displayName: "Sidebar.SlidingViews",
});

export interface SidebarSlidingViewProps extends DivProps {
  value: string;
}

function SidebarSlidingView(inputProps: SidebarSlidingViewProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "ref",
    "value",
  ]);
  const sliding = useContext(SlidingContext);
  if (!sliding) {
    throw new Error(
      "Sidebar.SlidingView must be used within Sidebar.SlidingViews",
    );
  }
  let element: HTMLDivElement | undefined;
  const active = () => sliding.activeKey() === props.value;
  onMount(() => {
    const unregister = sliding.register(props.value);
    onCleanup(unregister);
  });
  createEffect(() => element?.toggleAttribute("inert", !active()));
  return (
    <div
      {...elementProps}
      ref={(node) => {
        element = node;
        node.toggleAttribute("inert", !active());
        setRef(props.ref, node);
      }}
      data-sidebar="sliding-view"
      data-value={props.value}
      aria-hidden={!active()}
      class={cn(
        "flex min-h-0 w-full shrink-0 flex-col",
        !active() && "pointer-events-none",
        props.class,
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}
const NamedSidebarSlidingView = Object.assign(SidebarSlidingView, {
  displayName: "Sidebar.SlidingView",
});

export const Sidebar = Object.assign(NamedSidebarRoot, {
  Provider: NamedSidebarProvider,
  Header: NamedSidebarHeader,
  Content: NamedSidebarContent,
  Footer: NamedSidebarFooter,
  Loading: NamedSidebarLoading,
  Group: NamedSidebarGroup,
  GroupLabel: NamedSidebarGroupLabel,
  Menu: NamedSidebarMenu,
  MenuItem: NamedSidebarMenuItem,
  MenuButton: NamedSidebarMenuButton,
  MenuBadge: NamedSidebarMenuBadge,
  MenuSub: NamedSidebarMenuSub,
  MenuSubItem: NamedSidebarMenuSubItem,
  MenuSubButton: NamedSidebarMenuSubButton,
  Separator: NamedSidebarSeparator,
  Trigger: NamedSidebarTrigger,
  Close: NamedSidebarClose,
  Rail: NamedSidebarRail,
  ResizeHandle: NamedSidebarResizeHandle,
  MenuChevron: NamedSidebarMenuChevron,
  Collapsible: NamedSidebarCollapsible,
  CollapsibleTrigger: NamedSidebarCollapsibleTrigger,
  CollapsibleContent: NamedSidebarCollapsibleContent,
  SlidingViews: NamedSidebarSlidingViews,
  SlidingView: NamedSidebarSlidingView,
});

export {
  NamedSidebarProvider as SidebarProvider,
  NamedSidebarRoot as SidebarRoot,
  NamedSidebarHeader as SidebarHeader,
  NamedSidebarContent as SidebarContent,
  NamedSidebarFooter as SidebarFooter,
  NamedSidebarLoading as SidebarLoading,
  NamedSidebarGroup as SidebarGroup,
  NamedSidebarGroupLabel as SidebarGroupLabel,
  NamedSidebarMenu as SidebarMenu,
  NamedSidebarMenuItem as SidebarMenuItem,
  NamedSidebarMenuButton as SidebarMenuButton,
  NamedSidebarMenuBadge as SidebarMenuBadge,
  NamedSidebarMenuSub as SidebarMenuSub,
  NamedSidebarMenuSubItem as SidebarMenuSubItem,
  NamedSidebarMenuSubButton as SidebarMenuSubButton,
  NamedSidebarSeparator as SidebarSeparator,
  NamedSidebarTrigger as SidebarTrigger,
  NamedSidebarClose as SidebarClose,
  NamedSidebarRail as SidebarRail,
  NamedSidebarResizeHandle as SidebarResizeHandle,
  NamedSidebarMenuChevron as SidebarMenuChevron,
  NamedSidebarCollapsible as SidebarCollapsible,
  NamedSidebarCollapsibleTrigger as SidebarCollapsibleTrigger,
  NamedSidebarCollapsibleContent as SidebarCollapsibleContent,
  NamedSidebarSlidingViews as SidebarSlidingViews,
  NamedSidebarSlidingView as SidebarSlidingView,
};
