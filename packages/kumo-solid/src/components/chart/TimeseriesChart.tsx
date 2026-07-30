import { mergeProps as mergeBaseUIProps } from "@msviderok/base-ui-solid/merge-props";
import { Tooltip as TooltipPrimitive } from "@msviderok/base-ui-solid/tooltip";
import type { BarSeriesOption, LineSeriesOption } from "echarts/charts";
import type { EChartsOption, SeriesOption, SetOptionOpts } from "echarts";
import type * as echarts from "echarts/core";
import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  on,
  onCleanup,
  onMount,
  type JSX,
} from "solid-js";
import { ChartPalette } from "./Color";
import {
  Chart,
  type ChartEvents,
  type ChartInstanceRef,
  type KumoChartOption,
} from "./EChart";
import {
  buildTimeseriesMarkerAnnotations,
  clusterTimeseriesMarkers,
  getApproximateMarkerClusterInterval,
  getTimeseriesMarkerFromEvent,
  type TimeseriesMarker,
} from "./timeseries-markers";
import {
  buildTimeseriesThresholdAnnotations,
  getThresholdValueExtent,
  type TimeseriesThreshold,
} from "./timeseries-thresholds";
import {
  TooltipContent,
  type MarkerTooltipState,
  type TooltipRow,
  type TooltipState,
} from "./timeseries-tooltip";

export type { TimeseriesMarker } from "./timeseries-markers";
export type { TimeseriesThreshold } from "./timeseries-thresholds";

export interface TimeseriesData {
  name: string;
  data: [number, number][];
  color: string;
}

export interface TimeseriesChartProps {
  echarts: typeof echarts;
  type?: "line" | "bar";
  data: TimeseriesData[];
  markers?: TimeseriesMarker[];
  thresholds?: TimeseriesThreshold[];
  xAxisName?: string;
  xAxisTickCount?: number;
  xAxisTickFormat?: (value: number) => string;
  yAxisTickFormat?: (value: number) => string;
  /** @deprecated Use `tooltipValueFormat`. */
  yAxisTickLabelFormat?: (value: number) => string;
  yAxisName?: string;
  yAxisTickCount?: number;
  tooltipValueFormat?: (value: number) => string;
  tooltipMode?: "all" | "single";
  tooltipMaxItems?: number;
  tooltipBoundary?: "clipping-ancestors" | Element | Element[];
  tooltipFollowCursor?: "both" | "x";
  incomplete?: { before?: number; after?: number };
  enableLegendSelection?: boolean;
  height?: number;
  onTimeRangeChange?: (from: number, to: number) => void;
  isDarkMode?: boolean;
  gradient?: boolean;
  loading?: boolean;
  ariaDescription?: string;
  optionUpdateBehavior?: SetOptionOpts;
  ref?: ChartInstanceRef;
}

const DEFAULT_X_AXIS_TICK_COUNT = 5;

function TimeseriesChartRoot(props: TimeseriesChartProps) {
  let container: HTMLDivElement | undefined;
  const [chart, setChart] = createSignal<echarts.ECharts | null>(null);
  const [tooltipState, setTooltipState] = createSignal<TooltipState | null>(
    null,
  );
  let legendSelected: Record<string, boolean> | null = null;
  let markerHover = false;
  let activeMarkerKey: string | null = null;
  const [mousePosition, setMousePosition] = createSignal({
    x: 0,
    y: 0,
    clientX: 0,
    clientY: 0,
  });

  const setChartRef = (instance: echarts.ECharts | null) => {
    setChart(instance);
    const ref = props.ref;
    if (typeof ref === "function") ref(instance);
    else if (ref) ref.current = instance;
  };

  createEffect(
    on(
      () => [props.enableLegendSelection, props.isDarkMode] as const,
      () => {
        legendSelected = null;
      },
    ),
  );

  const closeTooltip = () => {
    activeMarkerKey = null;
    markerHover = false;
    setTooltipState(null);
  };
  const tooltipOpen = () => tooltipState() !== null;

  createEffect(() => {
    if (!tooltipOpen() || typeof window === "undefined") return;
    const closeWhenOutside = (event: MouseEvent) => {
      if (!container) return;
      const rectangle = container.getBoundingClientRect();
      if (
        event.clientX < rectangle.left ||
        event.clientX > rectangle.right ||
        event.clientY < rectangle.top ||
        event.clientY > rectangle.bottom
      ) {
        closeTooltip();
      }
    };
    window.addEventListener("mousemove", closeWhenOutside);
    onCleanup(() => window.removeEventListener("mousemove", closeWhenOutside));
  });

  onMount(() => {
    if (!container) return;
    const updateMousePosition = (event: MouseEvent) => {
      const rectangle = container!.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rectangle.left,
        y: event.clientY - rectangle.top,
        clientX: event.clientX,
        clientY: event.clientY,
      });
    };
    container.addEventListener("mousemove", updateMousePosition);
    onCleanup(() =>
      container?.removeEventListener("mousemove", updateMousePosition),
    );
  });

  const markerColor = () => ChartPalette.text("primary", props.isDarkMode);
  const axisTextColor = () => ChartPalette.text("primary", props.isDarkMode);
  const gridLineColor = () => colorWithOpacity(axisTextColor(), 0.2);
  const markerLabelBackgroundColor = () =>
    props.isDarkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)";

  const options = createMemo<KumoChartOption>(() => {
    const type = props.type ?? "line";
    const transformed: Array<LineSeriesOption | BarSeriesOption> = [];
    const seriesType =
      type === "bar"
        ? ({ type: "bar", stack: "total" } as const)
        : ({ type: "line", showSymbol: false } as const);
    const thresholdAnnotations = buildTimeseriesThresholdAnnotations(
      props.thresholds,
    );
    const thresholdExtent = getThresholdValueExtent(props.thresholds);
    const markerClusters = clusterTimeseriesMarkers(
      props.markers,
      getApproximateMarkerClusterInterval(
        getTimestamps(props.data, props.markers),
        props.xAxisTickCount ?? DEFAULT_X_AXIS_TICK_COUNT,
      ),
    );
    const markerAnnotations = buildTimeseriesMarkerAnnotations(markerClusters, {
      color: markerColor(),
      labelBackgroundColor: markerLabelBackgroundColor(),
    });

    for (const series of props.data) {
      const incompleteBeforePoints =
        props.incomplete?.before && type === "line"
          ? series.data.filter((point) => point[0] <= props.incomplete!.before!)
          : [];
      const incompleteAfterPoints =
        props.incomplete?.after && type === "line"
          ? series.data.filter((point) => point[0] >= props.incomplete!.after!)
          : [];
      const completePoints =
        incompleteBeforePoints.length > 0 || incompleteAfterPoints.length > 0
          ? series.data.slice(
              Math.max(0, incompleteBeforePoints.length - 1),
              Math.max(
                0,
                series.data.length - incompleteAfterPoints.length + 1,
              ),
            )
          : series.data;
      const areaStyle =
        props.gradient && type === "line"
          ? {
              color: new props.echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: colorWithOpacity(series.color, 0.4),
                },
                {
                  offset: 1,
                  color: colorWithOpacity(series.color, 0),
                },
              ]),
            }
          : undefined;
      transformed.push({
        data: completePoints,
        color: series.color,
        name: series.name,
        emphasis: { focus: "series" },
        ...(areaStyle ? { areaStyle } : {}),
        ...seriesType,
      });
      const incompleteSeries = {
        color: series.color,
        name: series.name,
        type: "line" as const,
        lineStyle: { type: "dashed" as const },
        showSymbol: false,
        emphasis: { focus: "series" as const },
      };
      if (incompleteBeforePoints.length > 0) {
        transformed.push({
          ...incompleteSeries,
          data: incompleteBeforePoints,
        });
      }
      if (incompleteAfterPoints.length > 0) {
        transformed.push({
          ...incompleteSeries,
          data: incompleteAfterPoints,
        });
      }
    }

    if (markerAnnotations) {
      transformed.push({
        data: [],
        name: "Markers",
        type: type === "bar" ? "bar" : "line",
        animation: false,
        markLine: markerAnnotations.markLine,
      });
    }
    if (thresholdAnnotations) {
      transformed.push({
        data: [],
        name: "Thresholds",
        type: type === "bar" ? "bar" : "line",
        animation: false,
        markLine: thresholdAnnotations.markLine,
      });
    }

    return {
      aria: {
        enabled: true,
        ...(props.ariaDescription && {
          label: { description: props.ariaDescription },
        }),
      },
      brush: {
        xAxisIndex: "all",
        brushType: "lineX",
        brushMode: "single",
        outOfBrush: { colorAlpha: 0.3 },
        brushStyle: {
          borderWidth: 1,
          color: "rgba(120,140,180,0.3)",
          borderColor: "rgba(120,140,180,0.8)",
        },
      },
      tooltip: {
        trigger: "axis",
        showContent: false,
        axisPointer: { type: "shadow" },
      },
      backgroundColor: "transparent",
      toolbox: { show: false },
      ...(props.enableLegendSelection ? { legend: { show: false } } : {}),
      xAxis: {
        name: props.xAxisName,
        nameLocation: "middle",
        nameGap: 30,
        nameTextStyle: { color: axisTextColor() },
        type: "time",
        splitLine: { show: false },
        axisLine: { show: false },
        splitNumber: props.xAxisTickCount ?? DEFAULT_X_AXIS_TICK_COUNT,
        axisLabel: {
          color: axisTextColor(),
          ...(props.xAxisTickFormat && {
            formatter: (value: number) => props.xAxisTickFormat!(value),
          }),
        },
      },
      yAxis: {
        name: props.yAxisName,
        nameLocation: "middle",
        nameGap: 40,
        nameTextStyle: { color: axisTextColor() },
        type: "value",
        axisTick: { show: true },
        axisLabel: {
          margin: 15,
          color: axisTextColor(),
          ...(props.yAxisTickFormat && {
            formatter: (value: number) => props.yAxisTickFormat!(value),
          }),
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",
            width: 1,
            color: gridLineColor(),
          },
        },
        splitNumber: props.yAxisTickCount,
        ...(thresholdExtent && {
          min: (value: { min: number }) =>
            Math.min(value.min, thresholdExtent.min),
          max: (value: { max: number }) =>
            Math.max(value.max, thresholdExtent.max),
        }),
      },
      grid: {
        left: props.yAxisName ? 30 : 24,
        right: 24,
        top: 24,
        bottom: props.xAxisName ? 30 : 24,
      },
      series: transformed as SeriesOption[],
    } as KumoChartOption;
  });

  const events: Partial<ChartEvents> = {
    updateaxispointer(params: any) {
      if (markerHover) return;
      const timestamp: number | undefined = params?.axesInfo?.[0]?.value;
      if (timestamp == null) return;
      const allRows = getAllTooltipRowsAtTimestamp(
        props.data,
        timestamp,
        legendSelected,
      );
      let rows: TooltipRow[];
      let hiddenCount = 0;
      if ((props.tooltipMode ?? "all") === "single") {
        const instance = chart();
        const cursorValue = instance
          ? (
              instance.convertFromPixel("grid", [0, mousePosition().y]) as [
                number,
                number,
              ]
            )?.[1]
          : null;
        if (cursorValue != null && allRows.length > 0) {
          rows = [
            allRows.reduce((best, row) =>
              Math.abs(row.value - cursorValue) <
              Math.abs(best.value - cursorValue)
                ? row
                : best,
            ),
          ];
        } else {
          rows = allRows.slice(0, 1);
        }
      } else {
        ({ rows, hiddenCount } = limitTooltipRows(
          allRows,
          props.tooltipMaxItems ?? 10,
        ));
      }
      const next: TooltipState = {
        type: "series",
        ts: timestamp,
        rows,
        hiddenCount,
      };
      setTooltipState((previous) =>
        isSameTooltipState(previous, next) ? previous : next,
      );
    },
    mouseover(params) {
      const marker = getTimeseriesMarkerFromEvent(params);
      if (!marker) return;
      const key = `${marker.timestamp}-${marker.label ?? ""}`;
      if (activeMarkerKey === key) return;
      activeMarkerKey = key;
      markerHover = true;
      chart()?.dispatchAction({ type: "hideTip" });
      chart()?.dispatchAction({
        type: "updateAxisPointer",
        currTrigger: "leave",
      });
      const { rows, hiddenCount } = getTooltipRowsAtTimestamp(
        props.data,
        marker.timestamp,
        legendSelected,
        props.tooltipMaxItems ?? 10,
      );
      setTooltipState({
        type: "marker",
        ts: marker.timestamp,
        color: marker.color ?? markerColor(),
        markers: marker.markers,
        rows,
        hiddenCount,
      });
    },
    mouseout(params) {
      if (getTimeseriesMarkerFromEvent(params)) closeTooltip();
    },
    globalout: closeTooltip,
    legendselectchanged(params) {
      legendSelected = params.selected;
    },
    legendselected(params) {
      legendSelected = params.selected;
    },
    legendunselected(params) {
      legendSelected = params.selected;
    },
    brushend(params) {
      if (!props.onTimeRangeChange || !params.areas[0]) return;
      const range = params.areas[0].coordRange as [number, number];
      props.onTimeRangeChange(range[0], range[1]);
      chart()?.dispatchAction({ type: "brush", areas: [] });
    },
  };

  createEffect(
    on(
      () =>
        [
          chart(),
          Boolean(props.onTimeRangeChange),
          props.loading,
          props.optionUpdateBehavior?.notMerge ? options() : undefined,
        ] as const,
      ([instance, enabled]) => {
        if (!instance || !enabled) return;
        instance.dispatchAction({
          type: "takeGlobalCursor",
          key: "brush",
          brushOption: {
            brushType: "lineX",
            brushMode: "single",
          },
        });
        onCleanup(() => {
          instance.dispatchAction({
            type: "takeGlobalCursor",
            key: "brush",
            brushOption: { brushType: false },
          });
        });
      },
    ),
  );

  const height = () => props.height ?? 350;
  const formatValue = () =>
    props.tooltipValueFormat ?? props.yAxisTickLabelFormat;
  const cursorAnchor = () => {
    const pointer = mousePosition();
    const vertical =
      (props.tooltipFollowCursor ?? "both") === "x" && container
        ? container.getBoundingClientRect().top
        : pointer.clientY;
    return {
      getBoundingClientRect: () => new DOMRect(pointer.clientX, vertical, 0, 0),
    };
  };

  return (
    <TooltipPrimitive.Root open={tooltipOpen()} trackCursorAxis="none">
      <TooltipPrimitive.Trigger
        render={(triggerProps) => (
          <div
            {...(mergeBaseUIProps<"div">(
              triggerProps as JSX.HTMLAttributes<HTMLDivElement>,
              {
                ref: (node: HTMLDivElement) => {
                  container = node;
                },
                class: "relative w-full",
                style: { height: `${height()}px` },
                "data-base-ui-tooltip-trigger": "",
                get "aria-busy"() {
                  return props.loading || undefined;
                },
              } as JSX.HTMLAttributes<HTMLDivElement>,
            ) as unknown as JSX.HTMLAttributes<HTMLDivElement>)}
          >
            {props.loading ? (
              <ChartSkeletonLoader
                height={height()}
                isDarkMode={props.isDarkMode}
                type={props.type ?? "line"}
              />
            ) : (
              <Chart
                echarts={props.echarts}
                ref={setChartRef}
                options={options() as EChartsOption}
                height={height()}
                isDarkMode={props.isDarkMode}
                onEvents={events}
                optionUpdateBehavior={props.optionUpdateBehavior}
              />
            )}
          </div>
        )}
      />
      <Show when={tooltipState()}>
        {(state) => (
          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Positioner
              side="right"
              align="start"
              sideOffset={12}
              anchor={cursorAnchor}
              collisionAvoidance={{ side: "flip", align: "shift" }}
              collisionBoundary={props.tooltipBoundary}
              collisionPadding={8}
            >
              <TooltipPrimitive.Popup
                data-mode={props.isDarkMode ? "dark" : "light"}
                class="max-w-xs min-w-[150px] rounded-lg bg-kumo-base p-2 shadow-lg shadow-kumo-tip-shadow outline-1 outline-kumo-fill"
              >
                <TooltipContent
                  state={state()}
                  formatValue={formatValue()}
                  formatTimestamp={formatTimestamp}
                />
              </TooltipPrimitive.Popup>
            </TooltipPrimitive.Positioner>
          </TooltipPrimitive.Portal>
        )}
      </Show>
    </TooltipPrimitive.Root>
  );
}

export const TimeseriesChart = Object.assign(TimeseriesChartRoot, {
  displayName: "TimeseriesChart",
});

function findNearest(
  data: [number, number][],
  timestamp: number,
): number | null {
  if (data.length === 0) return null;
  let low = 0;
  let high = data.length - 1;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (data[middle][0] < timestamp) low = middle + 1;
    else high = middle;
  }
  if (
    low > 0 &&
    Math.abs(data[low - 1][0] - timestamp) < Math.abs(data[low][0] - timestamp)
  ) {
    low -= 1;
  }
  return data[low][1];
}

function getTimestamps(
  data: TimeseriesData[],
  markers: TimeseriesMarker[] | undefined,
): number[] {
  return [
    ...data.flatMap((series) => series.data.map(([timestamp]) => timestamp)),
    ...(markers?.map((marker) => marker.timestamp) ?? []),
  ];
}

function getAllTooltipRowsAtTimestamp(
  data: TimeseriesData[],
  timestamp: number,
  legendSelected: Record<string, boolean> | null,
): TooltipRow[] {
  const names = new Set<string>();
  const rows: TooltipRow[] = [];
  for (const series of data) {
    if (names.has(series.name)) continue;
    if (legendSelected?.[series.name] === false) continue;
    names.add(series.name);
    const value = findNearest(series.data, timestamp);
    if (value !== null) {
      rows.push({
        name: series.name,
        value,
        color: series.color,
      });
    }
  }
  return rows.sort((first, second) => second.value - first.value);
}

function limitTooltipRows(
  rows: TooltipRow[],
  maximum: number,
): { rows: TooltipRow[]; hiddenCount: number } {
  return {
    rows: rows.slice(0, maximum),
    hiddenCount: Math.max(0, rows.length - maximum),
  };
}

function getTooltipRowsAtTimestamp(
  data: TimeseriesData[],
  timestamp: number,
  legendSelected: Record<string, boolean> | null,
  maximum: number,
) {
  return limitTooltipRows(
    getAllTooltipRowsAtTimestamp(data, timestamp, legendSelected),
    maximum,
  );
}

function isSameMarkerTooltipState(
  first: MarkerTooltipState,
  second: MarkerTooltipState,
): boolean {
  return (
    first.ts === second.ts &&
    first.color === second.color &&
    first.hiddenCount === second.hiddenCount &&
    isSameTooltipRows(first.rows, second.rows) &&
    first.markers.length === second.markers.length &&
    first.markers.every((marker, index) => {
      const next = second.markers[index];
      return (
        marker.timestamp === next.timestamp &&
        marker.label === next.label &&
        marker.description === next.description &&
        marker.color === next.color &&
        marker.lineStyle === next.lineStyle
      );
    })
  );
}

function isSameTooltipState(
  first: TooltipState | null,
  second: TooltipState,
): boolean {
  if (!first || first.type !== second.type) return false;
  if (first.type === "marker" && second.type === "marker") {
    return isSameMarkerTooltipState(first, second);
  }
  if (first.type !== "series" || second.type !== "series") {
    return false;
  }
  return (
    first.ts === second.ts &&
    first.hiddenCount === second.hiddenCount &&
    isSameTooltipRows(first.rows, second.rows)
  );
}

function isSameTooltipRows(first: TooltipRow[], second: TooltipRow[]): boolean {
  return (
    first.length === second.length &&
    first.every((row, index) => {
      const next = second[index];
      return (
        row.name === next.name &&
        row.value === next.value &&
        row.color === next.color
      );
    })
  );
}

const CHART_LOADER_WIDTH = 400;
const CHART_LOADER_SAMPLES = 80;
const CHART_LOADER_BARS = 24;
const CHART_LOADER_BAR_GAP_RATIO = 0.35;

function chartLoaderWave(theta: number): number {
  return (
    0.45 * Math.sin(3 * theta) +
    0.3 * Math.sin(5 * theta + 0.9) +
    0.25 * Math.sin(7 * theta + 2.1)
  );
}

function ChartSkeletonLoader(props: {
  height: number;
  isDarkMode?: boolean;
  type?: "line" | "bar";
}) {
  const id = `kumo-chart-loader-${createUniqueId().replace(
    /[^a-zA-Z0-9_-]/g,
    "",
  )}`;
  const fillId = `${id}-fill`;
  const shineId = `${id}-shine`;
  const clipId = `${id}-clip`;
  const color = () => ChartPalette.semantic("Skeleton", props.isDarkMode);
  const strokeOpacity = () => (props.isDarkMode ? 0.36 : 0.6);
  const fillOpacity = () => (props.isDarkMode ? 0.07 : 0.1);
  const shineOpacity = () => (props.isDarkMode ? 0.16 : 0.24);
  const barFillOpacity = () => (props.isDarkMode ? 0.12 : 0.16);
  const bars = createMemo(() => {
    const slot = CHART_LOADER_WIDTH / CHART_LOADER_BARS;
    const width = slot * (1 - CHART_LOADER_BAR_GAP_RATIO);
    const minimumHeight = props.height * 0.15;
    const maximumHeight = props.height * 0.85;
    return Array.from({ length: CHART_LOADER_BARS }, (_, index) => {
      const theta = ((index + 0.5) / CHART_LOADER_BARS) * 2 * Math.PI;
      const normalized = (chartLoaderWave(theta) + 1) / 2;
      const height =
        minimumHeight + normalized * (maximumHeight - minimumHeight);
      return {
        x: index * slot + (slot - width) / 2,
        y: props.height - height,
        width,
        height,
      };
    });
  });
  const linePath = createMemo(() => {
    const middle = props.height / 2;
    const amplitude = Math.min(props.height * 0.18, 40);
    return Array.from({ length: CHART_LOADER_SAMPLES + 1 }, (_, index) => {
      const x = (index / CHART_LOADER_SAMPLES) * CHART_LOADER_WIDTH;
      const theta = (x / CHART_LOADER_WIDTH) * 2 * Math.PI;
      const y = middle - chartLoaderWave(theta) * amplitude;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");
  });
  const areaPath = () =>
    `${linePath()} L${CHART_LOADER_WIDTH},${props.height} L0,${props.height} Z`;
  const isBar = () => (props.type ?? "line") === "bar";

  return (
    <div
      role="status"
      aria-label="Loading chart"
      class="absolute inset-0 overflow-hidden"
      style={{ height: `${props.height}px` }}
    >
      <svg
        aria-hidden="true"
        width="100%"
        height={props.height}
        viewBox={`0 0 ${CHART_LOADER_WIDTH} ${props.height}`}
        preserveAspectRatio="none"
        class="block w-full"
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stop-color={color()}
              stop-opacity={fillOpacity()}
            />
            <stop offset="100%" stop-color={color()} stop-opacity="0" />
          </linearGradient>
          <linearGradient id={shineId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color={color()} stop-opacity="0" />
            <stop
              offset="50%"
              stop-color={color()}
              stop-opacity={shineOpacity()}
            />
            <stop offset="100%" stop-color={color()} stop-opacity="0" />
          </linearGradient>
          <clipPath id={clipId}>
            <Show when={isBar()} fallback={<path d={areaPath()} />}>
              <For each={bars()}>
                {(bar) => (
                  <rect
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                  />
                )}
              </For>
            </Show>
          </clipPath>
        </defs>

        <Show
          when={isBar()}
          fallback={
            <>
              <path d={areaPath()} fill={`url(#${fillId})`} stroke="none" />
              <path
                d={linePath()}
                fill="none"
                stroke={color()}
                stroke-opacity={strokeOpacity()}
                stroke-width="1"
                vector-effect="non-scaling-stroke"
              />
            </>
          }
        >
          <For each={bars()}>
            {(bar) => (
              <rect
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                fill={color()}
                fill-opacity={barFillOpacity()}
                stroke="none"
              />
            )}
          </For>
        </Show>

        <g clip-path={`url(#${clipId})`}>
          <rect
            class="kumo-chart-shimmer"
            x="0"
            y="0"
            width={CHART_LOADER_WIDTH}
            height={props.height}
            fill={`url(#${shineId})`}
          />
        </g>
      </svg>
    </div>
  );
}

export function colorWithOpacity(color: string, alpha: number): string {
  const boundedAlpha = Math.max(0, Math.min(1, alpha));
  const rgbMatch = color.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i,
  );
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${boundedAlpha})`;
  }
  let hex = color.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length === 8) hex = hex.slice(0, 6);
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${boundedAlpha})`;
}

const tooltipDateFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function formatTimestamp(timestamp: number | string | Date): string {
  return tooltipDateFormat.format(new Date(timestamp));
}
