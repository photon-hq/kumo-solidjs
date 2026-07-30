import { Show, type JSX } from "solid-js";
import { cn } from "../../utils/cn";
import { SkeletonLine } from "../loader";

const onInteractiveKeyDown: JSX.EventHandler<HTMLDivElement, KeyboardEvent> = (
  event,
) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  event.currentTarget.click();
};

interface LegendItemContentProps {
  name: string;
  color: string;
  value: string;
  unit?: string;
  inactive?: boolean;
  onPointerEnter?: JSX.EventHandlerUnion<HTMLDivElement, PointerEvent>;
  onPointerLeave?: JSX.EventHandlerUnion<HTMLDivElement, PointerEvent>;
  onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
}

type LegendItemProps = {
  className?: string;
} & (
  | ({ loading: true } & Partial<LegendItemContentProps>)
  | ({ loading?: boolean } & LegendItemContentProps)
);

function LargeItem(props: LegendItemProps) {
  return (
    <Show
      when={!props.loading}
      fallback={
        <div
          aria-hidden="true"
          class={cn(
            "inline-flex min-w-42 flex-col gap-2 py-2",
            props.className,
          )}
        >
          <div class="flex items-center gap-2">
            <span class="inline-block size-2 rounded-full bg-kumo-fill" />
            <SkeletonLine className="h-3 w-[8ch]" />
          </div>
          <SkeletonLine className="h-5 w-[5ch]" />
        </div>
      }
    >
      <div
        role="button"
        tabindex={props.onClick ? 0 : -1}
        class={cn(
          "inline-flex min-w-42 flex-col gap-2 py-2",
          props.onClick && "cursor-pointer",
          props.className,
        )}
        onPointerEnter={props.onPointerEnter}
        onPointerLeave={props.onPointerLeave}
        onClick={props.onClick}
        onKeyDown={props.onClick ? onInteractiveKeyDown : undefined}
      >
        <div class="flex items-center gap-2">
          <span
            class={cn(
              "inline-block size-2 rounded-full",
              props.inactive && "opacity-50",
            )}
            style={{ "background-color": props.color }}
          />
          <span class={cn("text-xs", props.inactive && "opacity-50")}>
            {props.name}
          </span>
        </div>
        <div class="flex items-baseline gap-0.5">
          <span
            class={cn(
              "text-lg leading-none font-medium",
              props.inactive && "opacity-50",
            )}
          >
            {props.value}
          </span>
          <Show when={props.unit}>
            <span
              class={cn(
                "text-xs leading-none text-kumo-subtle",
                props.inactive && "opacity-50",
              )}
            >
              {props.unit}
            </span>
          </Show>
        </div>
      </div>
    </Show>
  );
}
LargeItem.displayName = "ChartLegend.LargeItem";

function SmallItem(props: LegendItemProps) {
  return (
    <Show
      when={!props.loading}
      fallback={
        <div
          aria-hidden="true"
          class={cn("inline-flex h-4 items-center gap-2", props.className)}
        >
          <span class="inline-block size-2 rounded-full bg-kumo-fill" />
          <SkeletonLine className="h-3 w-[5ch]" />
          <SkeletonLine className="h-3 w-[3ch]" />
        </div>
      }
    >
      <div
        role="button"
        tabindex={props.onClick ? 0 : -1}
        class={cn(
          "inline-flex h-4 items-center gap-2",
          props.onClick && "cursor-pointer",
          props.className,
        )}
        onPointerEnter={props.onPointerEnter}
        onPointerLeave={props.onPointerLeave}
        onClick={props.onClick}
        onKeyDown={props.onClick ? onInteractiveKeyDown : undefined}
      >
        <span
          class={cn(
            "inline-block size-2 rounded-full",
            props.inactive && "opacity-50",
          )}
          style={{ "background-color": props.color }}
        />
        <span class={cn("text-xs", props.inactive && "opacity-50")}>
          {props.name}
        </span>
        <span class={cn("text-xs font-medium", props.inactive && "opacity-50")}>
          {props.value}
        </span>
      </div>
    </Show>
  );
}
SmallItem.displayName = "ChartLegend.SmallItem";

export const ChartLegend = {
  SmallItem,
  LargeItem,
};
