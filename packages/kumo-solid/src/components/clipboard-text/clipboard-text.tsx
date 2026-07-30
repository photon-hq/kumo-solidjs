import { mergeProps as mergeBaseUIProps } from "@msviderok/base-ui-solid/merge-props";
import { Show, createSignal, onCleanup, splitProps, type JSX } from "solid-js";
import { Portal } from "solid-js/web";
import { CheckIcon, CopyIcon } from "../../internal/icons";
import { cn } from "../../utils/cn";
import { resolveVariant } from "../../utils/resolve-variant";
import { Button, type ButtonProps } from "../button";
import { inputVariants } from "../input";
import { Tooltip } from "../tooltip";

const COPIED_FEEDBACK_MS = 1_500;

export const KUMO_CLIPBOARD_TEXT_VARIANTS = {
  size: {
    sm: {
      classes: "text-xs",
      buttonSize: "sm" as const,
      description: "Small clipboard text for compact UIs",
    },
    base: {
      classes: "text-sm",
      buttonSize: "base" as const,
      description: "Default clipboard text size",
    },
    lg: {
      classes: "text-sm",
      buttonSize: "lg" as const,
      description: "Large clipboard text for prominent display",
    },
  },
} as const;

export const KUMO_CLIPBOARD_TEXT_DEFAULT_VARIANTS = {
  size: "lg",
} as const;

const clipboardTextAnimations = {
  slide: {
    initial:
      "pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 translate-y-full",
    animate: "translate-y-0 opacity-100",
    end: "pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 -translate-y-full",
  },
} as const;

export type KumoClipboardTextSize =
  keyof typeof KUMO_CLIPBOARD_TEXT_VARIANTS.size;

export interface KumoClipboardTextVariantsProps {
  size?: KumoClipboardTextSize;
}

export function clipboardTextVariants({
  size = KUMO_CLIPBOARD_TEXT_DEFAULT_VARIANTS.size,
}: KumoClipboardTextVariantsProps = {}) {
  return cn(
    "flex items-center overflow-hidden bg-kumo-base px-0 font-mono",
    resolveVariant(
      KUMO_CLIPBOARD_TEXT_VARIANTS.size,
      size,
      KUMO_CLIPBOARD_TEXT_DEFAULT_VARIANTS.size,
    ).classes,
  );
}

export type ClipboardTextSize = KumoClipboardTextSize;

export interface ClipboardTextTooltip {
  text?: string;
  copiedText?: string;
  side?: "top" | "bottom" | "left" | "right";
}

export interface ClipboardTextLabels {
  copyAction?: string;
}

type DivRef = JSX.HTMLAttributes<HTMLDivElement>["ref"];

export interface ClipboardTextProps extends KumoClipboardTextVariantsProps {
  text: string;
  textToCopy?: string;
  class?: string;
  className?: string;
  onCopy?: () => void;
  tooltip?: ClipboardTextTooltip;
  labels?: ClipboardTextLabels;
  ref?: DivRef;
}

function copyWithTextarea(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.append(textarea);

  const selection = document.getSelection();
  const previousRange =
    selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  textarea.select();

  try {
    document.execCommand("copy");
  } finally {
    textarea.remove();
    if (previousRange && selection) {
      selection.removeAllRanges();
      selection.addRange(previousRange);
    }
  }
}

function toastPosition(
  button: HTMLButtonElement | undefined,
  side: NonNullable<ClipboardTextTooltip["side"]>,
): JSX.CSSProperties {
  const rect = button?.getBoundingClientRect();
  if (!rect) return {};
  const offset = 8;

  if (side === "bottom") {
    return {
      left: `${rect.left + rect.width / 2}px`,
      top: `${rect.bottom + offset}px`,
      transform: "translateX(-50%)",
    };
  }
  if (side === "left") {
    return {
      left: `${rect.left - offset}px`,
      top: `${rect.top + rect.height / 2}px`,
      transform: "translate(-100%, -50%)",
    };
  }
  if (side === "right") {
    return {
      left: `${rect.right + offset}px`,
      top: `${rect.top + rect.height / 2}px`,
      transform: "translateY(-50%)",
    };
  }
  return {
    left: `${rect.left + rect.width / 2}px`,
    top: `${rect.top - offset}px`,
    transform: "translate(-50%, -100%)",
  };
}

export function ClipboardText(inputProps: ClipboardTextProps) {
  const [props] = splitProps(inputProps, [
    "text",
    "textToCopy",
    "class",
    "className",
    "size",
    "onCopy",
    "tooltip",
    "labels",
    "ref",
  ]);
  const [copied, setCopied] = createSignal(false);
  const [toastBump, setToastBump] = createSignal(0);
  const [position, setPosition] = createSignal<JSX.CSSProperties>({});
  let buttonElement: HTMLButtonElement | undefined;
  let resetTimeout: ReturnType<typeof setTimeout> | undefined;
  const size = () => props.size ?? KUMO_CLIPBOARD_TEXT_DEFAULT_VARIANTS.size;
  const sizeConfig = () =>
    resolveVariant(
      KUMO_CLIPBOARD_TEXT_VARIANTS.size,
      size(),
      KUMO_CLIPBOARD_TEXT_DEFAULT_VARIANTS.size,
    );
  const tooltipText = () => props.tooltip?.text ?? "Copy";
  const copiedText = () => props.tooltip?.copiedText ?? "Copied";
  const tooltipSide = () => props.tooltip?.side ?? "top";
  const copyAction = () => props.labels?.copyAction ?? "Copy to clipboard";

  onCleanup(() => {
    if (resetTimeout !== undefined) clearTimeout(resetTimeout);
  });

  const scheduleCopiedReset = () => {
    if (resetTimeout !== undefined) clearTimeout(resetTimeout);
    resetTimeout = setTimeout(() => {
      setCopied(false);
      resetTimeout = undefined;
    }, COPIED_FEEDBACK_MS);
  };

  const copyToClipboard = async () => {
    try {
      const value = props.textToCopy ?? props.text;
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.clipboard?.writeText === "function"
      ) {
        await navigator.clipboard.writeText(value);
      } else if (typeof document !== "undefined") {
        copyWithTextarea(value);
      }

      setPosition(toastPosition(buttonElement, tooltipSide()));
      setToastBump((value) => value + 1);
      setCopied(true);
      scheduleCopiedReset();
      props.onCopy?.();
    } catch (error) {
      console.warn("Clipboard copy failed", error);
    }
  };

  const CopyButton = (
    triggerProps?: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  ) => {
    const internalProps = {
      ref(element: HTMLButtonElement) {
        buttonElement = element;
      },
      get size() {
        return sizeConfig().buttonSize;
      },
      variant: "ghost",
      get className() {
        return cn(
          "relative isolate overflow-hidden rounded-l-none rounded-r-[inherit] border-l! border-kumo-line! px-3 transition-all duration-200",
          "focus:ring-kumo-focus/50 focus:ring-inset",
          "focus-visible:ring-2 focus-visible:ring-kumo-brand focus-visible:ring-inset",
        );
      },
      onClick: copyToClipboard,
      get "aria-label"() {
        return copyAction();
      },
    } satisfies ButtonProps;
    const buttonProps = triggerProps
      ? mergeBaseUIProps([triggerProps, internalProps])
      : internalProps;

    return (
      <Button {...(buttonProps as ButtonProps)}>
        <span
          class={cn(
            "flex items-center gap-1 transition-all duration-200",
            copied()
              ? clipboardTextAnimations.slide.animate
              : clipboardTextAnimations.slide.initial,
          )}
        >
          <CheckIcon />
        </span>
        <span
          class={cn(
            "flex items-center justify-center transition-all duration-200",
            copied()
              ? clipboardTextAnimations.slide.end
              : clipboardTextAnimations.slide.animate,
          )}
        >
          <CopyIcon />
        </span>
      </Button>
    );
  };

  return (
    <>
      <div
        ref={props.ref}
        class={cn(
          inputVariants({ size: sizeConfig().buttonSize }),
          clipboardTextVariants({ size: size() }),
          props.class,
          props.className,
        )}
      >
        <span class="grow truncate ps-4 pe-2">{props.text}</span>
        {props.tooltip ? (
          <Tooltip
            content={tooltipText()}
            side={tooltipSide()}
            render={(triggerProps) => CopyButton(triggerProps)}
          />
        ) : (
          CopyButton()
        )}
        <span class="sr-only" aria-live="polite">
          {copied() ? copiedText() : ""}
        </span>
      </div>
      <Show when={props.tooltip && copied() && toastBump() > 0}>
        <Portal>
          <div class="pointer-events-none fixed inset-0 isolate">
            <Show keyed when={toastBump()}>
              {(bump) => (
                <div class="absolute" style={position()}>
                  <div
                    class={cn(
                      "flex origin-[var(--transform-origin)] flex-col rounded-md bg-kumo-base px-3 py-1.5 font-sans text-xs text-kumo-default",
                      "shadow-lg shadow-kumo-tip-shadow outline outline-kumo-fill",
                      bump > 1 && "animate-clipboard-toast-bump",
                    )}
                  >
                    {copiedText()}
                  </div>
                </div>
              )}
            </Show>
          </div>
        </Portal>
      </Show>
    </>
  );
}
