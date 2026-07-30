import { Fieldset } from "@msviderok/base-ui-solid/fieldset";
import { Radio as BaseRadio } from "@msviderok/base-ui-solid/radio";
import { RadioGroup as BaseRadioGroup } from "@msviderok/base-ui-solid/radio-group";
import {
  createContext,
  createSignal,
  createUniqueId,
  useContext,
  type JSX,
} from "solid-js";
import { cn } from "../../utils/cn";
import { resolveVariant } from "../../utils/resolve-variant";

export interface RadioGroupChangeEventDetails {
  readonly reason: "none";
  readonly event: Event;
  readonly trigger: Element | undefined;
  readonly isCanceled: boolean;
  readonly isPropagationAllowed: boolean;
  cancel: () => void;
  allowPropagation: () => void;
}

function createRadioChangeEventDetails(
  event: Event,
): RadioGroupChangeEventDetails {
  let canceled = false;
  let propagationAllowed = false;

  return {
    reason: "none",
    event,
    trigger:
      event.currentTarget instanceof Element ? event.currentTarget : undefined,
    get isCanceled() {
      return canceled;
    },
    get isPropagationAllowed() {
      return propagationAllowed;
    },
    cancel() {
      canceled = true;
      event.preventDefault();
    },
    allowPropagation() {
      propagationAllowed = true;
    },
  };
}

export const KUMO_RADIO_VARIANTS = {
  variant: {
    default: {
      classes: "ring-kumo-hairline",
      description: "Default radio appearance",
    },
    error: {
      classes: "ring-kumo-danger",
      description: "Error state for validation failures",
    },
  },
  appearance: {
    default: {
      classes: "",
      description: "Standard inline radio item",
    },
    card: {
      classes:
        "rounded-lg border border-kumo-hairline bg-kumo-base p-3 transition-colors hover:bg-kumo-tint has-[[data-checked]]:border-kumo-interact has-[[data-checked]]:bg-kumo-tint",
      description:
        "Choice card appearance with border, padding, and highlighted selection state",
    },
  },
} as const;

export const KUMO_RADIO_DEFAULT_VARIANTS = {
  variant: "default",
  appearance: "default",
} as const;

export type KumoRadioVariant = keyof typeof KUMO_RADIO_VARIANTS.variant;
export type KumoRadioAppearance = keyof typeof KUMO_RADIO_VARIANTS.appearance;

export interface KumoRadioVariantsProps {
  variant?: KumoRadioVariant;
  appearance?: KumoRadioAppearance;
}

export function radioVariants({
  variant = KUMO_RADIO_DEFAULT_VARIANTS.variant,
  appearance = KUMO_RADIO_DEFAULT_VARIANTS.appearance,
}: KumoRadioVariantsProps = {}) {
  return cn(
    resolveVariant(
      KUMO_RADIO_VARIANTS.variant,
      variant,
      KUMO_RADIO_DEFAULT_VARIANTS.variant,
    ).classes,
    resolveVariant(
      KUMO_RADIO_VARIANTS.appearance,
      appearance,
      KUMO_RADIO_DEFAULT_VARIANTS.appearance,
    ).classes,
  );
}

export type RadioVariant = KumoRadioVariant;
export type RadioControlPosition = "start" | "end";

interface RadioGroupContextValue {
  readonly controlPosition: RadioControlPosition | undefined;
  readonly appearance: KumoRadioAppearance;
  readonly legendId: string | undefined;
}

const RadioGroupContext = createContext<RadioGroupContextValue>({
  controlPosition: undefined,
  appearance: "default",
  legendId: undefined,
});

export interface RadioLegendProps {
  children: JSX.Element;
  className?: string;
}

export interface RadioGroupProps<Value = string> {
  legend?: string;
  children: JSX.Element;
  orientation?: "vertical" | "horizontal";
  appearance?: KumoRadioAppearance;
  error?: string;
  description?: JSX.Element;
  defaultValue?: Value;
  value?: Value;
  onValueChange?: (
    value: Value,
    eventDetails: RadioGroupChangeEventDetails,
  ) => void;
  disabled?: boolean;
  controlPosition?: RadioControlPosition;
  name?: string;
  className?: string;
}

export type RadioItemProps<Value = string> = {
  variant?: RadioVariant;
  appearance?: KumoRadioAppearance;
  label: JSX.Element;
  description?: JSX.Element;
  value: Value;
  className?: string;
  disabled?: boolean;
  ref?: JSX.ButtonHTMLAttributes<HTMLButtonElement>["ref"];
};

function RadioControl<Value>(props: {
  value: Value;
  disabled?: boolean;
  variant: RadioVariant;
  ref?: JSX.ButtonHTMLAttributes<HTMLButtonElement>["ref"];
  card: boolean;
}) {
  return (
    <BaseRadio.Root
      ref={props.ref}
      data-kumo-component="Radio"
      data-kumo-part="item"
      value={props.value}
      disabled={props.disabled}
      class={cn(
        "relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-0 bg-kumo-base focus:outline-none",
        props.card
          ? "ring-2 focus:ring-kumo-focus focus-visible:ring-2 focus-visible:ring-kumo-brand"
          : "ring after:absolute after:-inset-x-3 after:-inset-y-2",
        props.variant === "error" ? "ring-kumo-danger" : "ring-kumo-line",
        !props.disabled &&
          props.variant !== "error" &&
          (props.card
            ? "group-hover:ring-kumo-hairline focus-visible:outline-offset-3"
            : "group-hover:ring-kumo-hairline focus:ring-2 focus:ring-kumo-focus focus-visible:ring-2 focus-visible:ring-kumo-brand focus-visible:outline-offset-3"),
        !props.disabled &&
          props.variant === "error" &&
          "focus-visible:outline-offset-3",
        "data-[checked]:bg-kumo-contrast",
      )}
    >
      <BaseRadio.Indicator keepMounted class="flex items-center justify-center">
        <span class="h-2 w-2 rounded-full bg-kumo-base" />
      </BaseRadio.Indicator>
    </BaseRadio.Root>
  );
}

function RadioItem<Value = string>(props: RadioItemProps<Value>) {
  const group = useContext(RadioGroupContext);
  const appearance = () => props.appearance ?? group.appearance;
  const isCard = () => appearance() === "card";
  const effectiveControlPosition = (): RadioControlPosition =>
    group.controlPosition ?? (isCard() ? "end" : "start");

  return (
    <>
      {isCard() ? (
        <label
          data-kumo-component="Radio"
          data-kumo-part="item-label"
          class={cn(
            "group relative m-0 flex items-start gap-3 rounded-lg border border-kumo-hairline bg-kumo-base p-3 transition-colors has-[[data-checked]]:border-kumo-interact has-[[data-checked]]:bg-kumo-tint",
            effectiveControlPosition() === "start" && "flex-row-reverse",
            props.variant === "error" &&
              "border-kumo-danger has-[[data-checked]]:border-kumo-danger has-[[data-checked]]:bg-kumo-base",
            props.disabled
              ? "cursor-not-allowed opacity-50"
              : cn(
                  "cursor-pointer has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-50",
                  props.variant !== "error" &&
                    "hover:not-has-[[data-disabled]]:bg-kumo-tint",
                ),
            props.className,
          )}
        >
          <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            <span class="text-base font-medium text-kumo-default">
              {props.label}
            </span>
            {props.description && (
              <span class="text-sm text-kumo-subtle">{props.description}</span>
            )}
          </div>
          <RadioControl
            ref={props.ref}
            value={props.value}
            disabled={props.disabled}
            variant={props.variant ?? KUMO_RADIO_DEFAULT_VARIANTS.variant}
            card
          />
        </label>
      ) : (
        <label
          data-kumo-component="Radio"
          data-kumo-part="item-label"
          class={cn(
            "group relative m-0 inline-flex items-start gap-2",
            effectiveControlPosition() === "end" &&
              "flex-row-reverse justify-end",
            props.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            props.className,
          )}
        >
          <RadioControl
            ref={props.ref}
            value={props.value}
            disabled={props.disabled}
            variant={props.variant ?? KUMO_RADIO_DEFAULT_VARIANTS.variant}
            card={false}
          />
          <span class="text-base text-kumo-default">{props.label}</span>
        </label>
      )}
    </>
  );
}

function RadioLegend(props: RadioLegendProps) {
  const group = useContext(RadioGroupContext);

  return (
    <Fieldset.Legend
      id={group.legendId}
      class={cn("text-base font-medium text-kumo-default", props.className)}
    >
      {props.children}
    </Fieldset.Legend>
  );
}

export function RadioGroup<Value = string>(props: RadioGroupProps<Value>) {
  const legendId = `kumo-radio-${createUniqueId()}`;
  const [internalValue, setInternalValue] = createSignal<Value | undefined>(
    props.defaultValue,
  );
  const appearance = () =>
    props.appearance ?? KUMO_RADIO_DEFAULT_VARIANTS.appearance;
  const orientation = () => props.orientation ?? "vertical";
  const isControlled = () => props.value !== undefined;
  const currentValue = () =>
    (isControlled() ? props.value : internalValue()) ?? null;
  const contextValue: RadioGroupContextValue = {
    get controlPosition() {
      return props.controlPosition;
    },
    get appearance() {
      return appearance();
    },
    legendId,
  };

  const handleValueChange = (newValue: unknown, event: Event) => {
    const details = createRadioChangeEventDetails(event);
    props.onValueChange?.(newValue as Value, details);
    if (!details.isCanceled && !isControlled()) {
      setInternalValue(() => newValue as Value);
    }
  };

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <BaseRadioGroup
        value={currentValue()}
        onValueChange={handleValueChange}
        disabled={props.disabled}
        name={props.name}
        aria-label={props.legend}
        aria-labelledby={legendId}
      >
        <Fieldset.Root
          disabled={props.disabled}
          class={cn("flex flex-col gap-4", props.className)}
        >
          {props.legend && (
            <Fieldset.Legend
              id={legendId}
              class="text-base font-medium text-kumo-default"
            >
              {props.legend}
            </Fieldset.Legend>
          )}
          <div
            class={cn(
              orientation() === "vertical"
                ? cn(
                    "flex flex-col",
                    appearance() === "card" ? "gap-3" : "gap-2",
                  )
                : appearance() === "card"
                  ? "grid grid-cols-2 gap-3"
                  : "flex flex-row flex-wrap gap-2",
            )}
          >
            {props.children}
          </div>
          {props.error && <p class="text-sm text-kumo-danger">{props.error}</p>}
          {props.description && (
            <p class="text-sm text-kumo-subtle">{props.description}</p>
          )}
        </Fieldset.Root>
      </BaseRadioGroup>
    </RadioGroupContext.Provider>
  );
}

type RadioComponent = typeof RadioGroup & {
  Item: typeof RadioItem;
  Group: typeof RadioGroup;
  Legend: typeof RadioLegend;
};

export const Radio = Object.assign(RadioGroup, {
  Item: RadioItem,
  Group: RadioGroup,
  Legend: RadioLegend,
}) as RadioComponent;
