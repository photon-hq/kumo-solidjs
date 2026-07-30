import { Menu as DropdownMenuPrimitive } from "@photon-ai/base-ui-solid/menu";
import {
  Show,
  splitProps,
  type Component,
  type ComponentProps,
  type JSX,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { CaretRightIcon, CheckIcon } from "../../internal/icons";
import { cn } from "../../utils/cn";
import { useLinkComponent } from "../../utils/link-provider";
import {
  usePortalContainerAccessor,
  type PortalContainer,
} from "../../utils/portal-provider";
import { resolveVariant } from "../../utils/resolve-variant";

/** Dropdown item variant definitions (default and danger styles). */
export const KUMO_DROPDOWN_VARIANTS = {
  variant: {
    default: {
      classes: "",
      description: "Default dropdown item appearance",
    },
    danger: {
      classes:
        "text-kumo-danger data-highlighted:bg-kumo-danger/5 data-highlighted:text-kumo-danger",
      description: "Destructive action item",
    },
  },
} as const;

export const KUMO_DROPDOWN_DEFAULT_VARIANTS = {
  variant: "default",
} as const;

export type KumoDropdownVariant = keyof typeof KUMO_DROPDOWN_VARIANTS.variant;

export interface KumoDropdownVariantsProps {
  /** @default "default" */
  variant?: KumoDropdownVariant;
}

export function dropdownVariants({
  variant = KUMO_DROPDOWN_DEFAULT_VARIANTS.variant,
}: KumoDropdownVariantsProps = {}) {
  return cn(
    resolveVariant(
      KUMO_DROPDOWN_VARIANTS.variant,
      variant,
      KUMO_DROPDOWN_DEFAULT_VARIANTS.variant,
    ).classes,
  );
}

export type DropdownMenuIcon = Component | JSX.Element;

function renderIconNode(icon: DropdownMenuIcon | undefined) {
  if (!icon) return null;
  if (typeof icon === "function") {
    const IconComponent = icon as Component<{ class?: string }>;
    return <IconComponent class="mr-2 h-4 w-4" />;
  }
  return icon;
}

type BaseRootProps = ComponentProps<typeof DropdownMenuPrimitive.Root>;
type BaseTriggerProps = ComponentProps<typeof DropdownMenuPrimitive.Trigger>;
type BasePositionerProps = ComponentProps<
  typeof DropdownMenuPrimitive.Positioner
>;
type BaseItemProps = ComponentProps<typeof DropdownMenuPrimitive.Item>;
type BaseCheckboxItemProps = ComponentProps<
  typeof DropdownMenuPrimitive.CheckboxItem
>;
type BaseRadioItemProps = ComponentProps<
  typeof DropdownMenuPrimitive.RadioItem
>;
type BaseRadioItemIndicatorProps = ComponentProps<
  typeof DropdownMenuPrimitive.RadioItemIndicator
>;
type BaseGroupLabelProps = ComponentProps<
  typeof DropdownMenuPrimitive.GroupLabel
>;
type BaseSeparatorProps = ComponentProps<
  typeof DropdownMenuPrimitive.Separator
>;
type BaseSubmenuTriggerProps = ComponentProps<
  typeof DropdownMenuPrimitive.SubmenuTrigger
>;

export interface DropdownMenuRootProps extends Omit<BaseRootProps, "children"> {
  children: JSX.Element;
}

function DropdownMenuRoot(props: DropdownMenuRootProps) {
  return <DropdownMenuPrimitive.Root {...props} />;
}

export interface DropdownMenuTriggerProps extends Omit<
  BaseTriggerProps,
  "children" | "class" | "render"
> {
  children?: JSX.Element;
  class?: string;
  className?: string;
  render?: BaseTriggerProps["render"];
  /**
   * @deprecated Use the Solid `render` prop instead.
   */
  asChild?: boolean;
}

function DropdownMenuTrigger(inputProps: DropdownMenuTriggerProps) {
  const [props, triggerProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "render",
    "asChild",
    "nativeButton",
  ]);
  const resolvedRender = () =>
    props.render ??
    (props.asChild
      ? (props.children as BaseTriggerProps["render"])
      : undefined);

  return (
    <DropdownMenuPrimitive.Trigger
      {...triggerProps}
      data-kumo-component="DropdownMenu"
      data-kumo-part="trigger"
      class={cn(props.class, props.className)}
      render={resolvedRender()}
      nativeButton={
        props.nativeButton ??
        (resolvedRender() === undefined ||
          resolvedRender() === null ||
          resolvedRender() === "button")
      }
    >
      {props.asChild ? undefined : props.children}
    </DropdownMenuPrimitive.Trigger>
  );
}

export type DropdownMenuContentProps = Omit<
  BasePositionerProps,
  "children" | "class"
> & {
  children?: JSX.Element;
  class?: string;
  className?: string;
  /** @default 8 */
  sideOffset?: number;
  /** Portal container, overriding KumoPortalProvider context. */
  container?: PortalContainer;
};

function DropdownMenuContent(inputProps: DropdownMenuContentProps) {
  const [props, positionerProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "sideOffset",
    "container",
  ]);
  const contextContainer = usePortalContainerAccessor();
  const container = () => props.container ?? contextContainer() ?? undefined;

  return (
    <DropdownMenuPrimitive.Portal container={container()}>
      <DropdownMenuPrimitive.Positioner
        {...positionerProps}
        sideOffset={props.sideOffset ?? 8}
      >
        <DropdownMenuPrimitive.Popup
          data-kumo-component="DropdownMenu"
          data-kumo-part="content"
          class={cn(
            "max-h-[var(--available-height)] min-w-36 overflow-y-auto rounded-lg bg-kumo-control p-1.5 text-kumo-default shadow-lg ring ring-kumo-line",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            props.class,
            props.className,
          )}
        >
          {props.children}
        </DropdownMenuPrimitive.Popup>
      </DropdownMenuPrimitive.Positioner>
    </DropdownMenuPrimitive.Portal>
  );
}

export interface DropdownMenuSubTriggerProps extends Omit<
  BaseSubmenuTriggerProps,
  "children" | "class"
> {
  children?: JSX.Element;
  class?: string;
  className?: string;
  inset?: boolean;
  icon?: DropdownMenuIcon;
}

function DropdownMenuSubTrigger(inputProps: DropdownMenuSubTriggerProps) {
  const [props, triggerProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "inset",
    "icon",
  ]);

  return (
    <DropdownMenuPrimitive.SubmenuTrigger
      {...triggerProps}
      data-kumo-component="DropdownMenu"
      data-kumo-part="submenu-trigger"
      class={cn(
        "flex cursor-default items-center rounded-sm px-2 py-1.5 text-base outline-hidden select-none",
        "focus:bg-kumo-tint focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand data-highlighted:bg-kumo-tint",
        "data-popup-open:bg-kumo-tint",
        props.inset && "pl-8",
        props.class,
        props.className,
      )}
    >
      {renderIconNode(props.icon)}
      {props.children}
      <CaretRightIcon class="ml-auto h-4 w-4" />
    </DropdownMenuPrimitive.SubmenuTrigger>
  );
}

export interface DropdownMenuItemProps extends Omit<
  BaseItemProps,
  "children" | "class" | "render"
> {
  children?: JSX.Element;
  class?: string;
  className?: string;
  render?: BaseItemProps["render"];
  inset?: boolean;
  icon?: DropdownMenuIcon;
  selected?: boolean;
  /**
   * @deprecated Use DropdownMenu.LinkItem for navigation.
   */
  href?: string;
  variant?: KumoDropdownVariant;
}

function DropdownMenuItem(inputProps: DropdownMenuItemProps) {
  const [props, itemProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "render",
    "inset",
    "icon",
    "selected",
    "href",
    "variant",
  ]);
  const LinkComponent = useLinkComponent();
  const isExternal = () =>
    Boolean(props.href && /^(https?:)?\/\//.test(props.href));
  const resolvedRender = (): BaseItemProps["render"] => {
    if (!props.href) return props.render;
    if (isExternal()) {
      return (renderProps) => (
        <a
          {...renderProps}
          href={props.href}
          target="_blank"
          rel="noreferrer"
        />
      );
    }
    return (renderProps) => (
      <Dynamic
        component={LinkComponent}
        {...renderProps}
        href={props.href}
        to={props.href}
      />
    );
  };

  return (
    <DropdownMenuPrimitive.Item
      {...itemProps}
      data-kumo-component="DropdownMenu"
      data-kumo-part="item"
      class={cn(
        "relative flex cursor-default items-center rounded-md px-2 py-1.5 text-base outline-hidden select-none focus:text-kumo-default focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-kumo-overlay",
        props.href && "w-full text-inherit! no-underline!",
        props.inset && "pl-8",
        dropdownVariants({ variant: props.variant }),
        props.class,
        props.className,
      )}
      render={resolvedRender()}
    >
      <Show when={!props.render || Boolean(props.href)}>
        {renderIconNode(props.icon)}
        {props.children}
        <Show when={props.selected}>
          <span aria-hidden="true" class="inline-flex">
            <CheckIcon />
          </span>
        </Show>
      </Show>
    </DropdownMenuPrimitive.Item>
  );
}

export type DropdownMenuLinkItemProps = Omit<
  BaseItemProps,
  "children" | "class" | "render"
> &
  Omit<
    JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
    "children" | "class" | "href"
  > & {
    children?: JSX.Element;
    class?: string;
    className?: string;
    href?: string;
    render?: BaseItemProps["render"];
    inset?: boolean;
    icon?: DropdownMenuIcon;
    variant?: KumoDropdownVariant;
  };

function DropdownMenuLinkItem(inputProps: DropdownMenuLinkItemProps) {
  const [props, itemProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "render",
    "inset",
    "icon",
    "variant",
    "nativeButton",
  ]);
  const defaultRender: BaseItemProps["render"] = (renderProps) => (
    <a {...renderProps} href={inputProps.href} />
  );

  return (
    <DropdownMenuPrimitive.Item
      {...itemProps}
      data-kumo-component="DropdownMenu"
      data-kumo-part="link-item"
      class={cn(
        "relative flex cursor-default items-center rounded-md px-2 py-1.5 text-base text-inherit no-underline outline-hidden select-none",
        "focus:text-kumo-default focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-kumo-overlay",
        props.inset && "pl-8",
        dropdownVariants({ variant: props.variant }),
        props.class,
        props.className,
      )}
      render={props.render ?? defaultRender}
      nativeButton={props.nativeButton ?? false}
    >
      {renderIconNode(props.icon)}
      {props.children}
    </DropdownMenuPrimitive.Item>
  );
}

export interface DropdownMenuCheckboxItemProps extends Omit<
  BaseCheckboxItemProps,
  "children" | "class"
> {
  children?: JSX.Element;
  class?: string;
  className?: string;
}

function DropdownMenuCheckboxItem(inputProps: DropdownMenuCheckboxItemProps) {
  const [props, itemProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
  ]);

  return (
    <DropdownMenuPrimitive.CheckboxItem
      {...itemProps}
      data-kumo-component="DropdownMenu"
      data-kumo-part="checkbox-item"
      class={cn(
        "relative flex cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-base outline-hidden transition-colors select-none focus:bg-kumo-tint focus:text-kumo-default focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-kumo-tint",
        props.class,
        props.className,
      )}
    >
      <DropdownMenuPrimitive.CheckboxItemIndicator class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-inherit">
        <CheckIcon size={12} />
      </DropdownMenuPrimitive.CheckboxItemIndicator>
      {props.children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

export interface DropdownMenuRadioItemProps extends Omit<
  BaseRadioItemProps,
  "children" | "class"
> {
  children?: JSX.Element;
  class?: string;
  className?: string;
  inset?: boolean;
  icon?: DropdownMenuIcon;
}

function DropdownMenuRadioItem(inputProps: DropdownMenuRadioItemProps) {
  const [props, itemProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "inset",
    "icon",
  ]);

  return (
    <DropdownMenuPrimitive.RadioItem
      {...itemProps}
      data-kumo-component="DropdownMenu"
      data-kumo-part="radio-item"
      class={cn(
        "relative flex cursor-default items-center rounded-md px-2 py-1.5 text-base outline-hidden select-none",
        "data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-kumo-tint",
        props.inset && "pl-8",
        props.class,
        props.className,
      )}
    >
      {renderIconNode(props.icon)}
      {props.children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

export interface DropdownMenuRadioItemIndicatorProps extends Omit<
  BaseRadioItemIndicatorProps,
  "children" | "class"
> {
  children?: JSX.Element;
  class?: string;
  className?: string;
}

function DropdownMenuRadioItemIndicator(
  inputProps: DropdownMenuRadioItemIndicatorProps,
) {
  const [props, indicatorProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
  ]);

  return (
    <DropdownMenuPrimitive.RadioItemIndicator
      {...indicatorProps}
      class={cn("ml-auto", props.class, props.className)}
    >
      {props.children ?? <CheckIcon class="h-4 w-4" />}
    </DropdownMenuPrimitive.RadioItemIndicator>
  );
}

export interface DropdownMenuLabelProps extends Omit<
  BaseGroupLabelProps,
  "children" | "class"
> {
  children?: JSX.Element;
  class?: string;
  className?: string;
  inset?: boolean;
}

function DropdownMenuLabel(inputProps: DropdownMenuLabelProps) {
  const [props, labelProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "inset",
  ]);

  return (
    <DropdownMenuPrimitive.GroupLabel
      {...labelProps}
      class={cn(
        "px-2 py-1.5 text-base font-semibold",
        props.inset && "pl-8",
        props.class,
        props.className,
      )}
    >
      {props.children}
    </DropdownMenuPrimitive.GroupLabel>
  );
}

export interface DropdownMenuSeparatorProps extends Omit<
  BaseSeparatorProps,
  "class"
> {
  class?: string;
  className?: string;
}

function DropdownMenuSeparator(inputProps: DropdownMenuSeparatorProps) {
  const [props, separatorProps] = splitProps(inputProps, [
    "class",
    "className",
  ]);
  return (
    <DropdownMenuPrimitive.Separator
      {...separatorProps}
      class={cn(
        "-mx-1 my-1 h-px bg-kumo-hairline",
        props.class,
        props.className,
      )}
    />
  );
}

export interface DropdownMenuShortcutProps extends Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  "class" | "children"
> {
  children?: JSX.Element;
  class?: string;
  className?: string;
}

function DropdownMenuShortcut(inputProps: DropdownMenuShortcutProps) {
  const [props, shortcutProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
  ]);
  return (
    <span
      {...shortcutProps}
      class={cn(
        "ml-auto text-xs tracking-widest opacity-60",
        props.class,
        props.className,
      )}
    >
      {props.children}
    </span>
  );
}

export type DropdownMenuPortalProps = ComponentProps<
  typeof DropdownMenuPrimitive.Portal
>;
export type DropdownMenuSubProps = ComponentProps<
  typeof DropdownMenuPrimitive.SubmenuRoot
>;
export type DropdownMenuRadioGroupProps = ComponentProps<
  typeof DropdownMenuPrimitive.RadioGroup
>;
export type DropdownMenuGroupProps = ComponentProps<
  typeof DropdownMenuPrimitive.Group
>;

type DropdownMenuComponent = typeof DropdownMenuRoot & {
  Trigger: typeof DropdownMenuTrigger;
  Portal: typeof DropdownMenuPrimitive.Portal;
  Sub: typeof DropdownMenuPrimitive.SubmenuRoot;
  SubTrigger: typeof DropdownMenuSubTrigger;
  SubContent: typeof DropdownMenuContent;
  Content: typeof DropdownMenuContent;
  Item: typeof DropdownMenuItem;
  LinkItem: typeof DropdownMenuLinkItem;
  CheckboxItem: typeof DropdownMenuCheckboxItem;
  RadioGroup: typeof DropdownMenuPrimitive.RadioGroup;
  RadioItem: typeof DropdownMenuRadioItem;
  RadioItemIndicator: typeof DropdownMenuRadioItemIndicator;
  Label: typeof DropdownMenuLabel;
  Separator: typeof DropdownMenuSeparator;
  Shortcut: typeof DropdownMenuShortcut;
  Group: typeof DropdownMenuPrimitive.Group;
};

export const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Trigger: DropdownMenuTrigger,
  Portal: DropdownMenuPrimitive.Portal,
  Sub: DropdownMenuPrimitive.SubmenuRoot,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuContent,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  LinkItem: DropdownMenuLinkItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  RadioGroup: DropdownMenuPrimitive.RadioGroup,
  RadioItem: DropdownMenuRadioItem,
  RadioItemIndicator: DropdownMenuRadioItemIndicator,
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
  Shortcut: DropdownMenuShortcut,
  Group: DropdownMenuPrimitive.Group,
}) as DropdownMenuComponent;

export {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuRadioItem,
  DropdownMenuRadioItemIndicator,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
