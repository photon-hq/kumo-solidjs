import { Meter as BaseMeter } from "@photon-ai/base-ui-solid/meter";
import { splitProps, type ComponentProps } from "solid-js";
import { cn } from "../../utils/cn";

export const KUMO_METER_VARIANTS = {} as const;
export const KUMO_METER_DEFAULT_VARIANTS = {} as const;

export interface KumoMeterVariantsProps {}

export function meterVariants(_props: KumoMeterVariantsProps = {}) {
  return cn("flex w-full flex-col gap-2");
}

type RootProps = ComponentProps<typeof BaseMeter.Root>;

export interface MeterProps
  extends
    Omit<RootProps, "children" | "class" | "value">,
    KumoMeterVariantsProps {
  value: number;
  customValue?: string;
  label: string;
  showValue?: boolean;
  trackClassName?: string;
  indicatorClassName?: string;
  className?: string;
}

export function Meter(inputProps: MeterProps) {
  const [props, rootProps] = splitProps(inputProps, [
    "value",
    "customValue",
    "label",
    "showValue",
    "className",
    "trackClassName",
    "indicatorClassName",
  ]);

  return (
    <BaseMeter.Root
      {...rootProps}
      value={props.value}
      class={cn(meterVariants(), props.className)}
    >
      <div class="flex items-center justify-between gap-4">
        <BaseMeter.Label class="text-xs text-kumo-subtle">
          {props.label}
        </BaseMeter.Label>
        {props.customValue ? (
          <span class="text-sm font-medium text-kumo-default tabular-nums">
            {props.customValue}
          </span>
        ) : (
          <>
            {(props.showValue ?? true) && (
              <BaseMeter.Value class="text-sm font-medium text-kumo-default tabular-nums" />
            )}
          </>
        )}
      </div>
      <BaseMeter.Track
        class={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-kumo-fill",
          props.trackClassName,
        )}
      >
        <BaseMeter.Indicator
          class={cn(
            "absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-kumo-brand via-kumo-brand to-kumo-brand transition-[width] duration-300 ease-out",
            props.indicatorClassName,
          )}
        />
      </BaseMeter.Track>
    </BaseMeter.Root>
  );
}
