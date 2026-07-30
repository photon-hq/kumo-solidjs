import { For, Show } from "solid-js";
import type { TimeseriesMarker } from "./timeseries-markers";

export interface TooltipRow {
  name: string;
  value: number;
  color: string;
}

export interface SeriesTooltipState {
  type: "series";
  ts: number;
  rows: TooltipRow[];
  hiddenCount: number;
}

export interface MarkerTooltipState {
  type: "marker";
  ts: number;
  color: string;
  markers: TimeseriesMarker[];
  rows: TooltipRow[];
  hiddenCount: number;
}

export type TooltipState = SeriesTooltipState | MarkerTooltipState;

export interface TooltipContentProps {
  state: TooltipState;
  formatValue?: (value: number) => string;
  formatTimestamp: (timestamp: number | string | Date) => string;
}

export function TooltipContent(props: TooltipContentProps) {
  return (
    <Show
      when={props.state.type === "marker"}
      fallback={
        <>
          <div class="mb-1 text-xs font-semibold text-kumo-default">
            {props.formatTimestamp(props.state.ts)}
          </div>
          <SeriesTooltipRows
            rows={props.state.rows}
            hiddenCount={props.state.hiddenCount}
            formatValue={props.formatValue}
          />
        </>
      }
    >
      <MarkerTooltipContent
        state={props.state as MarkerTooltipState}
        formatValue={props.formatValue}
        formatTimestamp={props.formatTimestamp}
      />
    </Show>
  );
}

function MarkerTooltipContent(props: {
  state: MarkerTooltipState;
  formatValue?: (value: number) => string;
  formatTimestamp: (timestamp: number | string | Date) => string;
}) {
  return (
    <>
      <Show when={props.state.markers.length === 1}>
        <div class="mb-1 text-xs font-semibold text-kumo-default">
          {props.formatTimestamp(props.state.markers[0].timestamp)}
        </div>
      </Show>
      <div class="space-y-1">
        <For each={props.state.markers}>
          {(marker) => (
            <div>
              <div class="flex items-center gap-2 text-xs text-kumo-default">
                <span
                  class="h-3 w-3 shrink-0 rounded-full"
                  style={{
                    "background-color": marker.color ?? props.state.color,
                  }}
                />
                <span class="font-medium">
                  {marker.label ?? "Reference marker"}
                </span>
                <Show when={props.state.markers.length > 1}>
                  <span class="text-kumo-subtle">
                    {props.formatTimestamp(marker.timestamp)}
                  </span>
                </Show>
              </div>
              <Show when={marker.description}>
                <div class="mt-0.5 ml-5 text-xs text-kumo-default">
                  {marker.description}
                </div>
              </Show>
            </div>
          )}
        </For>
      </div>
      <Show when={props.state.rows.length > 0}>
        <div class="mt-2 border-t border-kumo-line pt-2">
          <SeriesTooltipRows
            rows={props.state.rows}
            hiddenCount={props.state.hiddenCount}
            formatValue={props.formatValue}
          />
        </div>
      </Show>
    </>
  );
}

function SeriesTooltipRows(props: {
  rows: TooltipRow[];
  hiddenCount: number;
  formatValue?: (value: number) => string;
}) {
  return (
    <>
      <For each={props.rows}>
        {(row) => (
          <div class="flex items-center justify-between gap-4 py-0.5">
            <div class="flex min-w-0 items-center gap-2">
              <span
                class="h-3 w-3 shrink-0 rounded-full"
                style={{ "background-color": row.color }}
              />
              <span
                class="truncate text-xs font-medium text-kumo-default"
                title={row.name}
              >
                {row.name}
              </span>
            </div>
            <span class="shrink-0 text-xs font-semibold text-kumo-default">
              {props.formatValue
                ? props.formatValue(row.value)
                : formatDefaultValue(row.value)}
            </span>
          </div>
        )}
      </For>
      <Show when={props.hiddenCount > 0}>
        <div class="mt-1 text-xs text-kumo-subtle">
          +{props.hiddenCount} more
        </div>
      </Show>
    </>
  );
}

const defaultNumberFormat = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 3,
});

function formatDefaultValue(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return defaultNumberFormat.format(value);
}
