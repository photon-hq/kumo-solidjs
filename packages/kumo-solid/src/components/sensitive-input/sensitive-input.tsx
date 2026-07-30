import { Input as BaseInput } from "@photon-ai/base-ui-solid/input";
import {
  createEffect,
  createSignal,
  createUniqueId,
  onCleanup,
  splitProps,
  type JSX,
} from "solid-js";
import { EyeIcon, EyeSlashIcon } from "../../internal/icons";
import { cn } from "../../utils/cn";
import { Field, normalizeFieldError, type FieldErrorMatch } from "../field";
import {
  inputVariants,
  KUMO_INPUT_VARIANTS,
  type KumoInputSize,
  type KumoInputVariant,
} from "../input";

export const KUMO_SENSITIVE_INPUT_VARIANTS = KUMO_INPUT_VARIANTS;

export const KUMO_SENSITIVE_INPUT_DEFAULT_VARIANTS = {
  size: "base",
  variant: "default",
} as const;

type Mode = "masked" | "revealed" | "empty";
type InputRef = JSX.InputHTMLAttributes<HTMLInputElement>["ref"];
type SensitiveInputEvent = InputEvent & {
  currentTarget: HTMLInputElement;
  target: HTMLInputElement;
};

export interface SensitiveInputProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  | "class"
  | "defaultValue"
  | "onChange"
  | "onInput"
  | "ref"
  | "size"
  | "type"
  | "value"
> {
  autoComplete?: JSX.InputHTMLAttributes<HTMLInputElement>["autocomplete"];
  class?: string;
  className?: string;
  defaultValue?: string;
  description?: JSX.Element;
  error?: string | { message: JSX.Element; match: FieldErrorMatch };
  label?: JSX.Element;
  labelTooltip?: JSX.Element;
  onChange?: (event: SensitiveInputEvent) => void;
  onCopy?: () => void;
  onInput?: (event: SensitiveInputEvent) => void;
  onValueChange?: (value: string) => void;
  ref?: InputRef;
  size?: KumoInputSize;
  value?: string;
  variant?: KumoInputVariant;
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
    if (typeof document.execCommand !== "function") return false;
    return document.execCommand("copy");
  } finally {
    textarea.remove();
    if (previousRange && selection) {
      selection.removeAllRanges();
      selection.addRange(previousRange);
    }
  }
}

export function SensitiveInput(inputProps: SensitiveInputProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "class",
    "className",
    "value",
    "defaultValue",
    "onChange",
    "onInput",
    "onValueChange",
    "onCopy",
    "size",
    "variant",
    "disabled",
    "readOnly",
    "id",
    "autoComplete",
    "autocomplete",
    "label",
    "labelTooltip",
    "description",
    "error",
    "required",
    "ref",
    "onBlur",
    "onKeyDown",
    "aria-label",
    "aria-invalid",
  ]);
  const [internalValue, setInternalValue] = createSignal(
    props.defaultValue ?? "",
  );
  const value = () => props.value ?? internalValue();
  const hasValue = () => value().length > 0;
  const [mode, setMode] = createSignal<Mode>(hasValue() ? "masked" : "empty");
  const [copied, setCopied] = createSignal(false);
  const generatedId = `kumo-sensitive-${createUniqueId()}`;
  const liveRegionId = `${generatedId}-status`;
  const maskedInstructionId = `${generatedId}-instructions`;
  const inputId = () => props.id ?? generatedId;
  const size = () => props.size ?? KUMO_SENSITIVE_INPUT_DEFAULT_VARIANTS.size;
  const variant = () =>
    props.variant ??
    (props.error ? "error" : KUMO_SENSITIVE_INPUT_DEFAULT_VARIANTS.variant);
  const isControlled = () => props.value !== undefined;
  const isMaskedWithValue = () => mode() === "masked" && hasValue();
  const showEyeButton = () =>
    !props.disabled &&
    (mode() === "revealed" || (mode() === "empty" && hasValue()));
  const ariaLabelFallback = () =>
    typeof props.label === "string" ? props.label : "Sensitive value";
  let inputElement: HTMLInputElement | undefined;
  let containerElement: HTMLDivElement | undefined;
  let previousHasValue = hasValue();

  if (import.meta.env?.DEV) {
    createEffect(() => {
      if (props.variant === "error") {
        console.warn(
          '[Kumo SensitiveInput]: variant="error" is deprecated. ' +
            "Error styling is now automatically applied when the `error` prop is truthy. " +
            "Simply remove the variant prop and pass an error message instead.",
        );
      }
    });
  }

  createEffect(() => {
    const nextHasValue = hasValue();
    if (
      nextHasValue !== previousHasValue &&
      !nextHasValue &&
      mode() === "masked"
    ) {
      setMode("empty");
    }
    previousHasValue = nextHasValue;
  });

  createEffect(() => {
    if (!copied()) return;
    const timeout = setTimeout(() => setCopied(false), 2_000);
    onCleanup(() => clearTimeout(timeout));
  });

  const focusInput = () => {
    if (props.readOnly) return;
    setTimeout(() => inputElement?.focus(), 0);
  };

  const reveal = () => {
    if (props.disabled || !isMaskedWithValue()) return;
    setMode("revealed");
    focusInput();
  };

  const handleContainerClick: JSX.EventHandler<HTMLDivElement, MouseEvent> = (
    event,
  ) => {
    if (props.disabled || !isMaskedWithValue()) return;

    if (containerElement) {
      const rect = containerElement.getBoundingClientRect();
      const isInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!isInside) return;
    }
    reveal();
  };

  const handleContainerKeyDown: JSX.EventHandler<
    HTMLDivElement,
    KeyboardEvent
  > = (event) => {
    if (isMaskedWithValue() && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      reveal();
    }
  };

  const handleInput = (event: InputEvent) => {
    const inputEvent = event as SensitiveInputEvent;
    const nextValue = inputEvent.currentTarget.value;
    if (!isControlled()) setInternalValue(nextValue);
    if (mode() === "empty" && nextValue.length > 0) {
      setMode("revealed");
    }
    props.onInput?.(inputEvent);
    props.onChange?.(inputEvent);
    props.onValueChange?.(nextValue);
  };

  const handleBlur = (event: FocusEvent) => {
    const relatedTarget = event.relatedTarget;
    if (
      containerElement &&
      relatedTarget instanceof Node &&
      containerElement.contains(relatedTarget)
    ) {
      (
        props.onBlur as
          | ((event: FocusEvent & { currentTarget: HTMLInputElement }) => void)
          | undefined
      )?.(event as FocusEvent & { currentTarget: HTMLInputElement });
      return;
    }
    if (hasValue()) setMode("masked");
    (
      props.onBlur as
        | ((event: FocusEvent & { currentTarget: HTMLInputElement }) => void)
        | undefined
    )?.(event as FocusEvent & { currentTarget: HTMLInputElement });
  };

  const handleInputKeyDown = (event: KeyboardEvent) => {
    if (mode() === "revealed" && event.key === "Escape") {
      setMode("masked");
      setTimeout(() => containerElement?.focus(), 0);
    }
    (
      props.onKeyDown as
        | ((event: KeyboardEvent & { currentTarget: HTMLInputElement }) => void)
        | undefined
    )?.(event as KeyboardEvent & { currentTarget: HTMLInputElement });
  };

  const handleToggleVisibility: JSX.EventHandler<
    HTMLButtonElement,
    MouseEvent
  > = (event) => {
    event.stopPropagation();
    if (mode() === "revealed") {
      setMode("masked");
    } else if (mode() === "empty" && hasValue()) {
      setMode("revealed");
    }
  };

  const handleCopy: JSX.EventHandler<HTMLButtonElement, MouseEvent> = async (
    event,
  ) => {
    event.stopPropagation();
    let didCopy = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value());
        didCopy = true;
      }
    } catch {
      didCopy = false;
    }

    if (!didCopy) {
      try {
        didCopy = copyWithTextarea(value());
      } catch (error) {
        console.warn("Clipboard copy failed", error);
      }
    }

    if (didCopy) {
      setCopied(true);
      props.onCopy?.();
    }
  };

  const iconSize = () =>
    size() === "xs" || size() === "sm" ? "size-3" : "size-4";
  const containerClassName = () =>
    cn(
      inputVariants({
        size: size(),
        variant: variant(),
        parentFocusIndicator: true,
      }),
      "group/container relative flex w-full items-center",
      "focus-within:outline-2 focus-within:outline-kumo-focus",
      isMaskedWithValue() && !props.disabled && "cursor-pointer",
      props.disabled && "cursor-not-allowed",
      props.class,
      props.className,
    );

  const input = () => (
    <div>
      <div
        ref={(element) => {
          containerElement = element;
        }}
        role={isMaskedWithValue() ? "button" : undefined}
        data-kumo-component="SensitiveInput"
        data-kumo-part={isMaskedWithValue() ? "masked-container" : "container"}
        tabIndex={isMaskedWithValue() ? (props.disabled ? -1 : 0) : undefined}
        class={containerClassName()}
        onClick={handleContainerClick}
        onKeyDown={handleContainerKeyDown}
        aria-label={
          isMaskedWithValue() ? `${ariaLabelFallback()}, masked.` : undefined
        }
        aria-describedby={
          isMaskedWithValue()
            ? `${maskedInstructionId} ${liveRegionId}`
            : undefined
        }
        aria-disabled={isMaskedWithValue() ? props.disabled : undefined}
      >
        <BaseInput
          {...elementProps}
          ref={(element) => {
            inputElement = element;
            if (typeof props.ref === "function") props.ref(element);
          }}
          id={inputId()}
          type={mode() === "revealed" ? "text" : "password"}
          value={value()}
          onInput={handleInput}
          onBlur={handleBlur}
          onKeyDown={handleInputKeyDown}
          disabled={props.disabled}
          readOnly={Boolean(props.readOnly || isMaskedWithValue())}
          required={props.required}
          autocomplete={props.autoComplete ?? props.autocomplete ?? "off"}
          tabIndex={isMaskedWithValue() ? -1 : 0}
          class={cn(
            "kumo-input-placeholder w-full border-0 bg-transparent p-0 text-kumo-default ring-0 outline-none disabled:cursor-not-allowed disabled:text-kumo-subtle",
            size() === "xs" && "pr-5",
            size() === "sm" && "pr-6",
            size() === "base" && "pr-8",
            size() === "lg" && "pr-10",
            isMaskedWithValue() && "pointer-events-none text-transparent",
          )}
          aria-label={
            props["aria-label"] ??
            (!props.label ? ariaLabelFallback() : undefined)
          }
          aria-invalid={Boolean(props.error || props["aria-invalid"])}
          aria-hidden={isMaskedWithValue() || undefined}
        />

        <span
          class={cn(
            "pointer-events-none absolute inset-y-0 left-0 flex items-center overflow-hidden select-none",
            size() === "xs" && "right-5 px-1.5",
            size() === "sm" && "right-6 px-2",
            size() === "base" && "right-8 px-3",
            size() === "lg" && "right-10 px-4",
            !isMaskedWithValue() && "invisible",
            isMaskedWithValue() && "pointer-events-auto",
            "text-kumo-default",
            "group/mask",
          )}
          aria-hidden="true"
        >
          <span class="relative">
            <span
              class={cn(
                isMaskedWithValue() &&
                  !props.disabled &&
                  "group-focus-within/container:invisible group-hover/mask:invisible",
              )}
            >
              ••••••••
            </span>
            {isMaskedWithValue() && !props.disabled && (
              <span class="invisible absolute top-0 left-0 whitespace-nowrap text-kumo-subtle group-focus-within/container:visible group-hover/mask:visible">
                Click to reveal
              </span>
            )}
          </span>
        </span>

        <button
          type="button"
          data-kumo-component="SensitiveInput"
          data-kumo-part="toggle-visibility"
          onClick={handleToggleVisibility}
          onKeyDown={(event) => event.stopPropagation()}
          aria-label={mode() === "revealed" ? "Hide value" : "Reveal value"}
          tabIndex={showEyeButton() ? 0 : -1}
          class={cn(
            "absolute top-1/2 right-0 -translate-y-1/2 cursor-pointer text-kumo-subtle hover:text-kumo-default focus:text-kumo-default focus:ring-kumo-focus/50 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-kumo-brand",
            "m-0 inline-flex h-auto min-h-0 items-center justify-center border-none bg-transparent p-0 shadow-none",
            size() === "xs" && "right-1.5",
            size() === "sm" && "right-2",
            size() === "base" && "right-3",
            size() === "lg" && "right-4",
            iconSize(),
            !showEyeButton() && "pointer-events-none opacity-0",
          )}
        >
          {mode() === "revealed" ? (
            <EyeSlashIcon class="size-full" />
          ) : (
            <EyeIcon class="size-full" />
          )}
        </button>

        {hasValue() && !props.disabled && (
          <button
            type="button"
            data-kumo-component="SensitiveInput"
            data-kumo-part="copy"
            onClick={handleCopy}
            onKeyDown={(event) => event.stopPropagation()}
            aria-label={copied() ? "Copied" : "Copy to clipboard"}
            class={cn(
              "absolute -top-px right-2 -translate-y-full cursor-pointer rounded-t-md bg-kumo-brand px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-focus-within/container:opacity-100 group-hover/container:opacity-100 hover:brightness-120 focus:ring-kumo-focus/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand",
              "m-0 h-auto min-h-0 border-none shadow-none",
            )}
          >
            {copied() ? "Copied" : "Copy"}
          </button>
        )}
      </div>

      {isMaskedWithValue() && (
        <span id={maskedInstructionId} class="sr-only">
          Click or press Enter to reveal.
        </span>
      )}
      <span id={liveRegionId} class="sr-only" aria-live="polite">
        {mode() === "masked" && hasValue() && "Value hidden"}
        {copied() && "Copied to clipboard"}
      </span>
    </div>
  );

  return (
    <>
      {props.label ? (
        <Field
          label={props.label}
          required={props.required}
          labelTooltip={props.labelTooltip}
          description={props.description}
          error={normalizeFieldError(props.error)}
        >
          {input()}
        </Field>
      ) : (
        input()
      )}
    </>
  );
}
