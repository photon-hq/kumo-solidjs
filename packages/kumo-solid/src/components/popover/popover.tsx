import { Popover as PopoverBase } from "@photon-ai/base-ui-solid/popover";
import {
  createContext,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
  useContext,
  type Accessor,
  type ComponentProps,
  type JSX,
} from "solid-js";
import { cn } from "../../utils/cn";
import {
  usePortalContainerAccessor,
  type PortalContainer,
} from "../../utils/portal-provider";

/** Popover side variant definitions. */
export const KUMO_POPOVER_VARIANTS = {
  side: {
    top: {
      classes: "",
      description: "Popover appears above the trigger",
    },
    bottom: {
      classes: "",
      description: "Popover appears below the trigger",
    },
    left: {
      classes: "",
      description: "Popover appears to the left of the trigger",
    },
    right: {
      classes: "",
      description: "Popover appears to the right of the trigger",
    },
  },
} as const;

export const KUMO_POPOVER_DEFAULT_VARIANTS = {
  side: "bottom",
} as const;

export type KumoPopoverSide = keyof typeof KUMO_POPOVER_VARIANTS.side;

export interface KumoPopoverVariantsProps {
  /**
   * Which side of the trigger the popover appears on.
   * @default "bottom"
   */
  side?: KumoPopoverSide;
}

type BasePopoverRootProps = ComponentProps<typeof PopoverBase.Root>;
type BasePopoverTriggerProps = ComponentProps<typeof PopoverBase.Trigger>;
type BasePopoverPositionerProps = ComponentProps<typeof PopoverBase.Positioner>;
type BasePopoverTitleProps = ComponentProps<typeof PopoverBase.Title>;
type BasePopoverDescriptionProps = ComponentProps<
  typeof PopoverBase.Description
>;
type BasePopoverCloseProps = ComponentProps<typeof PopoverBase.Close>;

type TriggerHoverOptions = {
  openOnHover: Accessor<boolean | undefined>;
  delay: Accessor<number | undefined>;
  closeDelay: Accessor<number | undefined>;
};

type TriggerHoverOptionsContextValue = {
  register: (options: TriggerHoverOptions) => () => void;
};

const TriggerHoverOptionsContext =
  createContext<TriggerHoverOptionsContextValue>();

export interface PopoverRootProps extends Omit<
  BasePopoverRootProps,
  "children"
> {
  children?: JSX.Element;
}

function PopoverRoot(inputProps: PopoverRootProps) {
  const [props, rootProps] = splitProps(inputProps, [
    "children",
    "openOnHover",
    "delay",
    "closeDelay",
  ]);
  const [triggerOptions, setTriggerOptions] =
    createSignal<TriggerHoverOptions>();
  const context: TriggerHoverOptionsContextValue = {
    register(options) {
      setTriggerOptions(options);
      return () => {
        setTriggerOptions((currentOptions) =>
          currentOptions === options ? undefined : currentOptions,
        );
      };
    },
  };

  return (
    <TriggerHoverOptionsContext.Provider value={context}>
      <PopoverBase.Root
        {...rootProps}
        openOnHover={props.openOnHover ?? triggerOptions()?.openOnHover()}
        delay={props.delay ?? triggerOptions()?.delay()}
        closeDelay={props.closeDelay ?? triggerOptions()?.closeDelay()}
      >
        {props.children}
      </PopoverBase.Root>
    </TriggerHoverOptionsContext.Provider>
  );
}

export interface PopoverTriggerProps extends Omit<
  BasePopoverTriggerProps,
  "children" | "class" | "render"
> {
  children?: JSX.Element;
  class?: string;
  className?: string;
  render?: BasePopoverTriggerProps["render"];
  /**
   * Whether the popover should also open when the trigger is hovered.
   * This is placed on the trigger for compatibility with Kumo's React API.
   */
  openOnHover?: boolean;
  /** Delay before opening on hover, in milliseconds. */
  delay?: number;
  /** Delay before closing after hover, in milliseconds. */
  closeDelay?: number;
  /**
   * @deprecated Use the `render` prop instead.
   */
  asChild?: boolean;
}

function PopoverTrigger(inputProps: PopoverTriggerProps) {
  const [props, triggerProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "asChild",
    "render",
    "openOnHover",
    "delay",
    "closeDelay",
    "nativeButton",
  ]);
  const hoverOptionsContext = useContext(TriggerHoverOptionsContext);
  const hoverOptions: TriggerHoverOptions = {
    openOnHover: () => props.openOnHover,
    delay: () => props.delay,
    closeDelay: () => props.closeDelay,
  };
  const resolvedRender = () =>
    props.render ??
    (props.asChild
      ? (props.children as BasePopoverTriggerProps["render"])
      : undefined);

  onMount(() => {
    const unregister = hoverOptionsContext?.register(hoverOptions);
    if (unregister) onCleanup(unregister);
  });

  return (
    <PopoverBase.Trigger
      {...triggerProps}
      data-kumo-component="Popover"
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
    </PopoverBase.Trigger>
  );
}

export type PopoverAlign = "start" | "center" | "end";

export type PopoverContentProps = KumoPopoverVariantsProps & {
  /** Element or virtual element to position the popup against. */
  anchor?: BasePopoverPositionerProps["anchor"];
  /** @default "center" */
  align?: PopoverAlign;
  /** @default 8 */
  sideOffset?: number;
  /** @default 0 */
  alignOffset?: number;
  /** @default "absolute" */
  positionMethod?: "absolute" | "fixed";
  class?: string;
  className?: string;
  children?: JSX.Element;
  /** Portal container, overriding KumoPortalProvider context. */
  container?: PortalContainer;
};

function PopoverContent(props: PopoverContentProps) {
  const contextContainer = usePortalContainerAccessor();
  const container = () => props.container ?? contextContainer() ?? undefined;

  return (
    <PopoverBase.Portal container={container()}>
      <PopoverBase.Positioner
        anchor={props.anchor}
        align={props.align ?? "center"}
        alignOffset={props.alignOffset ?? 0}
        side={props.side ?? KUMO_POPOVER_DEFAULT_VARIANTS.side}
        sideOffset={props.sideOffset ?? 8}
        positionMethod={props.positionMethod ?? "absolute"}
      >
        <PopoverBase.Popup
          data-kumo-component="Popover"
          data-kumo-part="content"
          class={cn(
            "flex origin-(--transform-origin) flex-col rounded-lg bg-kumo-base px-4 py-3 text-sm text-kumo-default",
            "shadow-lg shadow-kumo-tip-shadow outline outline-kumo-fill",
            "transition-[transform,scale,opacity] duration-150",
            "data-starting-style:scale-90 data-starting-style:opacity-0",
            "data-ending-style:scale-90 data-ending-style:opacity-0",
            "data-instant:duration-0",
            "kumo-popover-popup",
            props.class,
            props.className,
          )}
        >
          <PopoverBase.Arrow
            class={cn(
              "flex",
              "data-[side=bottom]:-top-2",
              "data-[side=left]:right-[-13px] data-[side=left]:rotate-90",
              "data-[side=right]:left-[-13px] data-[side=right]:-rotate-90",
              "data-[side=top]:-bottom-2 data-[side=top]:rotate-180",
            )}
          >
            <ArrowSvg />
          </PopoverBase.Arrow>
          {props.children}
        </PopoverBase.Popup>
      </PopoverBase.Positioner>
    </PopoverBase.Portal>
  );
}

export interface PopoverTitleProps extends Omit<
  BasePopoverTitleProps,
  "children" | "class"
> {
  children?: JSX.Element;
  class?: string;
  className?: string;
}

function PopoverTitle(inputProps: PopoverTitleProps) {
  const [props, titleProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
  ]);
  return (
    <PopoverBase.Title
      {...titleProps}
      class={cn(
        "m-0 text-base leading-6 font-medium",
        props.class,
        props.className,
      )}
    >
      {props.children}
    </PopoverBase.Title>
  );
}

export interface PopoverDescriptionProps extends Omit<
  BasePopoverDescriptionProps,
  "children" | "class"
> {
  children?: JSX.Element;
  class?: string;
  className?: string;
}

function PopoverDescription(inputProps: PopoverDescriptionProps) {
  const [props, descriptionProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
  ]);
  return (
    <PopoverBase.Description
      {...descriptionProps}
      class={cn(
        "m-0 text-base leading-6 text-kumo-subtle",
        props.class,
        props.className,
      )}
    >
      {props.children}
    </PopoverBase.Description>
  );
}

export interface PopoverCloseProps extends Omit<
  BasePopoverCloseProps,
  "children" | "class" | "render"
> {
  children?: JSX.Element;
  class?: string;
  className?: string;
  render?: BasePopoverCloseProps["render"];
  /**
   * @deprecated Use the `render` prop instead.
   */
  asChild?: boolean;
}

function PopoverClose(inputProps: PopoverCloseProps) {
  const [props, closeProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "asChild",
    "render",
    "type",
  ]);
  const resolvedRender = () =>
    props.render ??
    (props.asChild
      ? (props.children as BasePopoverCloseProps["render"])
      : undefined);

  return (
    <PopoverBase.Close
      {...closeProps}
      type={props.type ?? "button"}
      class={cn(props.class, props.className)}
      render={resolvedRender()}
    >
      {props.asChild ? undefined : props.children}
    </PopoverBase.Close>
  );
}

function ArrowSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        class="fill-kumo-base"
      />
      <path
        d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
        class="fill-kumo-tip-shadow"
      />
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        class="fill-kumo-tip-stroke"
      />
    </svg>
  );
}

type PopoverComponent = typeof PopoverRoot & {
  Trigger: typeof PopoverTrigger;
  Content: typeof PopoverContent;
  Title: typeof PopoverTitle;
  Description: typeof PopoverDescription;
  Close: typeof PopoverClose;
};

export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: PopoverClose,
}) as PopoverComponent;

export {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
};
