import type * as echarts from "echarts/core";
import type {
  EChartsOption,
  SetOptionOpts,
  TooltipComponentOption,
} from "echarts";
import { createEffect, createSignal, onCleanup } from "solid-js";
import { cn } from "../../utils/cn";
import { CHART_DARK_COLORS, CHART_LIGHT_COLORS } from "./Color";

type EChartsMouseEventParams = {
  componentType: string;
  seriesType?: string;
  seriesIndex?: number;
  seriesName?: string;
  name?: string;
  dataIndex?: number;
  data?: any;
  dataType?: string;
  value?: number | any[];
  color?: string;
};

export type SafeTooltipOption = Omit<TooltipComponentOption, "formatter"> & {
  dangerousHtmlFormatter?: TooltipComponentOption["formatter"];
};

export type KumoChartOption = {
  [K in keyof EChartsOption]: K extends "tooltip"
    ? SafeTooltipOption | SafeTooltipOption[] | undefined
    : EChartsOption[K];
};

export interface ChartEvents {
  click: (params: EChartsMouseEventParams) => void;
  dblclick: (params: EChartsMouseEventParams) => void;
  mousedown: (params: EChartsMouseEventParams) => void;
  mousemove: (params: EChartsMouseEventParams) => void;
  mouseup: (params: EChartsMouseEventParams) => void;
  mouseover: (params: EChartsMouseEventParams) => void;
  mouseout: (params: EChartsMouseEventParams) => void;
  globalout: (params: any) => void;
  contextmenu: (params: any) => void;
  updateaxispointer: (params: any) => void;
  legendselectchanged: (params: {
    name: string;
    selected: Record<string, boolean>;
  }) => void;
  legendselected: (params: {
    name: string;
    selected: Record<string, boolean>;
  }) => void;
  legendunselected: (params: {
    name: string;
    selected: Record<string, boolean>;
  }) => void;
  legendscroll: (params: any) => void;
  datazoom: (params: any) => void;
  datarangeselected: (params: any) => void;
  timelinechanged: (params: any) => void;
  timelineplaychanged: (params: any) => void;
  restore: (params: any) => void;
  dataviewchanged: (params: any) => void;
  magictypechanged: (params: any) => void;
  pieselectchanged: (params: any) => void;
  pieselected: (params: any) => void;
  pieunselected: (params: any) => void;
  mapselectchanged: (params: any) => void;
  mapselected: (params: any) => void;
  mapunselected: (params: any) => void;
  geoselectchanged: (params: any) => void;
  geoselected: (params: any) => void;
  geounselected: (params: any) => void;
  axisareaselected: (params: any) => void;
  brush: (params: any) => void;
  brushselected: (params: any) => void;
  brushend: (params: {
    areas: Array<{
      coordRange: any;
      brushType?: string;
      panelId?: string;
      range?: any;
    }>;
  }) => void;
}

export type ChartInstanceRef =
  | ((instance: echarts.ECharts | null) => void)
  | { current: echarts.ECharts | null };

export interface ChartProps {
  echarts: typeof echarts;
  options: KumoChartOption;
  optionUpdateBehavior?: SetOptionOpts;
  className?: string;
  isDarkMode?: boolean;
  height?: number;
  aspectRatio?: number | string;
  onEvents?: Partial<ChartEvents>;
  ref?: ChartInstanceRef;
}

const transformTooltip = (tooltip: SafeTooltipOption) => {
  const { dangerousHtmlFormatter, ...rest } = tooltip;
  return { ...rest, formatter: dangerousHtmlFormatter };
};

export function prepareChartOptions({
  options,
  isDarkMode,
}: {
  options: KumoChartOption;
  isDarkMode?: boolean;
}): EChartsOption {
  const withDefaults: EChartsOption = {
    backgroundColor: "transparent",
    color: isDarkMode ? CHART_DARK_COLORS : CHART_LIGHT_COLORS,
    ...options,
  };

  if (!withDefaults.tooltip) return withDefaults;
  return {
    ...withDefaults,
    tooltip: Array.isArray(withDefaults.tooltip)
      ? withDefaults.tooltip.map(transformTooltip)
      : transformTooltip(withDefaults.tooltip as SafeTooltipOption),
  };
}

function assignChartRef(
  ref: ChartInstanceRef | undefined,
  instance: echarts.ECharts | null,
) {
  if (typeof ref === "function") ref(instance);
  else if (ref) ref.current = instance;
}

function ChartRoot(props: ChartProps) {
  let element: HTMLDivElement | undefined;
  const [chart, setChart] = createSignal<echarts.ECharts | null>(null);
  let handlers: Partial<ChartEvents> = {};
  const wrappers: Record<string, (params: any) => void> = {};
  let boundEvents = new Set<string>();

  createEffect(() => {
    const factory = props.echarts;
    const dark = props.isDarkMode;
    if (!element || typeof window === "undefined") return;

    const instance = factory.init(element, dark ? "dark" : undefined);
    setChart(instance);
    assignChartRef(props.ref, instance);

    onCleanup(() => {
      for (const event of boundEvents) {
        const wrapper = wrappers[event];
        if (wrapper) instance.off(event, wrapper);
      }
      boundEvents.clear();
      assignChartRef(props.ref, null);
      setChart(null);
      instance.dispose();
    });
  });

  createEffect(() => {
    const instance = chart();
    if (!instance) return;
    instance.setOption(
      prepareChartOptions({
        options: props.options,
        isDarkMode: props.isDarkMode,
      }),
      {
        notMerge: false,
        lazyUpdate: true,
        ...props.optionUpdateBehavior,
      },
    );
  });

  createEffect(() => {
    const instance = chart();
    handlers = props.onEvents ?? {};
    if (!instance) return;

    const nextBound = new Set<string>();
    for (const [event, handler] of Object.entries(handlers)) {
      if (typeof handler !== "function") continue;
      nextBound.add(event);
      wrappers[event] ??= (params: any) => {
        const current = handlers as Record<
          string,
          ((value: any) => void) | undefined
        >;
        current[event]?.(params);
      };
      if (!boundEvents.has(event)) {
        instance.on(event, wrappers[event]);
      }
    }

    for (const event of boundEvents) {
      if (nextBound.has(event)) continue;
      const wrapper = wrappers[event];
      if (wrapper) instance.off(event, wrapper);
    }
    boundEvents = nextBound;
  });

  createEffect(() => {
    const instance = chart();
    if (!instance || !element || typeof ResizeObserver === "undefined") {
      return;
    }
    let initial = true;
    const observer = new ResizeObserver(() => {
      if (initial) {
        initial = false;
        return;
      }
      instance.resize();
    });
    observer.observe(element);
    onCleanup(() => observer.disconnect());
  });

  const accessible = () => {
    const aria = props.options.aria;
    return !Array.isArray(aria) && Boolean(aria?.enabled);
  };

  return (
    <div
      ref={(node) => {
        element = node;
      }}
      class={cn("w-full", props.className)}
      style={
        props.aspectRatio !== undefined
          ? { "aspect-ratio": String(props.aspectRatio) }
          : { height: `${props.height ?? 350}px` }
      }
      tabindex={accessible() ? 0 : undefined}
      role={accessible() ? "img" : undefined}
    />
  );
}

export const Chart = Object.assign(ChartRoot, {
  displayName: "Chart",
});
