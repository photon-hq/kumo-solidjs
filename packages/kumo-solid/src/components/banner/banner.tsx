import { children as resolveChildren, splitProps, type JSX } from "solid-js";
import { cn } from "../../utils/cn";
import { resolveVariant } from "../../utils/resolve-variant";
import {
  BannerAction,
  BannerActionContext,
  type BannerActionSize,
} from "./banner-action";

export const KUMO_BANNER_BASE_STYLES = "flex w-full";

export const KUMO_BANNER_VARIANTS = {
  variant: {
    default: {
      classes: "bg-kumo-info-tint text-kumo-info",
      iconClasses: "fill-kumo-info",
      description: "Informational banner for general messages",
    },
    alert: {
      classes: "bg-kumo-warning-tint text-kumo-warning",
      iconClasses: "fill-kumo-warning",
      description: "Warning banner for cautionary messages",
    },
    error: {
      classes: "bg-kumo-danger-tint text-kumo-danger",
      iconClasses: "fill-kumo-danger",
      description: "Error banner for critical issues",
    },
    secondary: {
      classes: "bg-kumo-contrast/5 text-kumo-default/70",
      iconClasses: "fill-kumo-interact",
      description: "Neutral banner for secondary messages",
    },
  },
  size: {
    base: {
      classes: "items-start gap-3 rounded-lg px-4 py-3 text-base",
      description: "Default banner size",
    },
    sm: {
      classes: "items-center gap-2 rounded-md px-3 py-2 text-sm",
      description: "Compact banner for dialogs and tight spaces",
    },
  },
} as const;

export const KUMO_BANNER_DEFAULT_VARIANTS = {
  variant: "default",
  size: "base",
} as const;

export type KumoBannerVariant = keyof typeof KUMO_BANNER_VARIANTS.variant;
export type KumoBannerSize = keyof typeof KUMO_BANNER_VARIANTS.size;

const BANNER_SIZE_PARTS: Record<
  KumoBannerSize,
  { row: string; icon: string; description: string; action: BannerActionSize }
> = {
  base: {
    row: "gap-3",
    icon: "h-[1.375em]",
    description: "text-sm",
    action: "sm",
  },
  sm: {
    row: "gap-2",
    icon: "h-[1.25em]",
    description: "text-sm",
    action: "xs",
  },
};

export type {
  BannerActionProps,
  BannerActionSize,
  BannerActionVariant,
} from "./banner-action";

export interface KumoBannerVariantsProps {
  variant?: KumoBannerVariant;
  size?: KumoBannerSize;
}

export function bannerVariants({
  variant = KUMO_BANNER_DEFAULT_VARIANTS.variant,
  size = KUMO_BANNER_DEFAULT_VARIANTS.size,
}: KumoBannerVariantsProps = {}) {
  return cn(
    KUMO_BANNER_BASE_STYLES,
    resolveVariant(
      KUMO_BANNER_VARIANTS.variant,
      variant,
      KUMO_BANNER_DEFAULT_VARIANTS.variant,
    ).classes,
    resolveVariant(
      KUMO_BANNER_VARIANTS.size,
      size,
      KUMO_BANNER_DEFAULT_VARIANTS.size,
    ).classes,
  );
}

export enum BannerVariant {
  DEFAULT,
  ALERT,
  ERROR,
}

export interface BannerProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children" | "class" | "className" | "title"
> {
  icon?: JSX.Element;
  title?: string;
  description?: JSX.Element;
  action?: JSX.Element;
  text?: string;
  children?: JSX.Element;
  variant?: KumoBannerVariant;
  size?: KumoBannerSize;
  class?: string;
  className?: string;
}

function isElementLike(value: JSX.Element) {
  if (Array.isArray(value)) return true;
  if (typeof Node !== "undefined" && value instanceof Node) return true;
  return (
    typeof value === "string" && value.startsWith("<") && value.includes(">")
  );
}

function isKumoLink(value: JSX.Element) {
  if (
    typeof Element !== "undefined" &&
    value instanceof Element &&
    value.getAttribute("data-kumo-component") === "Link"
  ) {
    return true;
  }
  return (
    typeof value === "string" && value.includes('data-kumo-component="Link"')
  );
}

function BannerRoot(inputProps: BannerProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "icon",
    "title",
    "description",
    "action",
    "children",
    "text",
    "variant",
    "size",
    "class",
    "className",
    "ref",
  ]);
  const variant = () => props.variant ?? KUMO_BANNER_DEFAULT_VARIANTS.variant;
  const size = () => props.size ?? KUMO_BANNER_DEFAULT_VARIANTS.size;
  const sizeParts = () => BANNER_SIZE_PARTS[size()];
  const variantConfig = () =>
    resolveVariant(
      KUMO_BANNER_VARIANTS.variant,
      variant(),
      KUMO_BANNER_DEFAULT_VARIANTS.variant,
    );
  const contextValue = {
    get variant() {
      return variant();
    },
    get size() {
      return sizeParts().action;
    },
  };

  function Content() {
    const icon = resolveChildren(() => props.icon);
    const description = resolveChildren(() => props.description);
    const action = resolveChildren(() => props.action);
    const legacyContent = resolveChildren(() => props.children ?? props.text);
    const structured = () => Boolean(props.title || props.description);
    const compact = () => size() === "sm";
    const inlineLinkAction = () => compact() && isKumoLink(action());
    const rootClass = () =>
      cn(
        bannerVariants({ variant: variant(), size: size() }),
        props.class,
        props.className,
      );

    return (
      <>
        {structured() ? (
          <div {...elementProps} ref={props.ref} class={rootClass()}>
            {icon() ? (
              <span
                class={cn(
                  "flex shrink-0 items-center",
                  sizeParts().icon,
                  variantConfig().iconClasses,
                )}
              >
                {icon()}
              </span>
            ) : null}
            <div
              class={cn(
                "flex min-w-0 flex-1 items-center justify-between",
                sizeParts().row,
                !props.title && "pt-px",
              )}
            >
              {compact() ? (
                <div class="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
                  {props.title ? (
                    <span class="leading-snug font-medium">
                      {props.title}
                      {!props.description && inlineLinkAction() ? (
                        <span class="ml-1.5 [&_[data-kumo-component=Link]]:inline">
                          {action()}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                  {props.description ? (
                    <span class={cn(sizeParts().description, "leading-snug")}>
                      {description()}
                      {inlineLinkAction() ? (
                        <span class="ml-1.5 [&_[data-kumo-component=Link]]:inline">
                          {action()}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </div>
              ) : (
                <div class="flex flex-col gap-0.5">
                  {props.title ? (
                    <p class="leading-snug font-medium">{props.title}</p>
                  ) : null}
                  {props.description ? (
                    <div class={cn(sizeParts().description, "leading-snug")}>
                      {isElementLike(description()) ? (
                        description()
                      ) : (
                        <p>{description()}</p>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
              {!inlineLinkAction() && action() != null ? (
                <div class="flex shrink-0 items-center gap-2">{action()}</div>
              ) : null}
            </div>
          </div>
        ) : (
          <div {...elementProps} ref={props.ref} class={rootClass()}>
            {icon() ? (
              <span class={cn("shrink-0", variantConfig().iconClasses)}>
                {icon()}
              </span>
            ) : null}
            {isElementLike(legacyContent()) ? (
              legacyContent()
            ) : (
              <p>{legacyContent()}</p>
            )}
          </div>
        )}
      </>
    );
  }

  return (
    <BannerActionContext.Provider value={contextValue}>
      <Content />
    </BannerActionContext.Provider>
  );
}

type BannerComponent = typeof BannerRoot & {
  Action: typeof BannerAction;
};

export const Banner = Object.assign(BannerRoot, {
  Action: BannerAction,
}) as BannerComponent;
