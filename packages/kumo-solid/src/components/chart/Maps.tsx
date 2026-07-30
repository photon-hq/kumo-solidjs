import { geoMercator } from "d3-geo";
import type * as echarts from "echarts/core";
import { createEffect, createMemo } from "solid-js";
import { ChartPalette } from "./Color";
import {
  Chart,
  type ChartEvents,
  type ChartInstanceRef,
  type KumoChartOption,
} from "./EChart";
import { defaultValueFormat, escapeHtml } from "./tooltip-utils";

export interface MapGeoJson {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id?: string | number;
    properties?: Record<string, unknown> | null;
    geometry: unknown;
  }>;
}

type KeysWithValue<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

export type MapAccessor<T, V> = KeysWithValue<T, V> | ((row: T) => V);

function resolve<T, V>(row: T, accessor: MapAccessor<T, V>): V {
  return typeof accessor === "function" ? accessor(row) : (row[accessor] as V);
}

export type MapStyle<T, V> = V | ((row: T) => V);

function resolveStyle<T, V>(row: T, style: MapStyle<T, V>): V {
  return typeof style === "function" ? (style as (value: T) => V)(row) : style;
}

export interface MapProjection {
  project: (point: number[]) => number[];
  unproject: (point: number[]) => number[];
}

const MERCATOR_MAX_LAT = 85.0511;
const mercatorProjection = geoMercator();
const DEFAULT_PROJECTION: MapProjection = {
  project: (point) => {
    const latitude = Math.max(
      -MERCATOR_MAX_LAT,
      Math.min(MERCATOR_MAX_LAT, point[1]),
    );
    return mercatorProjection([point[0], latitude]) ?? [0, 0];
  },
  unproject: (point) =>
    mercatorProjection.invert?.(point as [number, number]) ?? [0, 0],
};

const DEFAULT_BOUNDING_COORDS: [[number, number], [number, number]] = [
  [-180, 80],
  [180, -58],
];
const MAX_ZOOM_FACTOR = 8;
const geoJsonMapNames = new WeakMap<MapGeoJson, string>();

function resolveProjection(
  projection: MapProjection | null | undefined,
): MapProjection | undefined {
  if (projection === null) return undefined;
  return projection ?? DEFAULT_PROJECTION;
}

function projectedAspect(
  projection: MapProjection | undefined,
  [[west, north], [east, south]]: [[number, number], [number, number]],
): number {
  const project = projection ? projection.project : (point: number[]) => point;
  const middleLatitude = Math.min(north, Math.max(south, 0));
  const width = Math.abs(
    project([east, middleLatitude])[0] - project([west, middleLatitude])[0],
  );
  const height = Math.abs(project([0, north])[1] - project([0, south])[1]);
  return width > 0 && height > 0 ? width / height : 16 / 9;
}

export function sanitizeMapName(name: string) {
  return name.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(31, hash) + value.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
}

export function getMapName(geoJson: MapGeoJson, mapName?: string) {
  if (mapName) return sanitizeMapName(mapName);
  const existing = geoJsonMapNames.get(geoJson);
  if (existing) return existing;
  const generated = `kumo-map-${hashString(JSON.stringify(geoJson))}`;
  geoJsonMapNames.set(geoJson, generated);
  return generated;
}

function buildGeo(options: {
  mapName: string;
  areaColor: string;
  center?: [number, number];
  zoom: number;
  roam: boolean;
  projection?: MapProjection;
}) {
  return {
    map: options.mapName,
    nameProperty: "name",
    roam: options.roam,
    ...(options.roam
      ? {
          scaleLimit: {
            min: Math.min(1, options.zoom),
            max: options.zoom * MAX_ZOOM_FACTOR,
          },
        }
      : {}),
    center: options.center,
    zoom: options.zoom,
    boundingCoords: DEFAULT_BOUNDING_COORDS,
    ...(options.projection
      ? { projection: options.projection }
      : { aspectScale: 1 }),
    silent: true,
    itemStyle: {
      areaColor: options.areaColor,
      borderColor: options.areaColor,
      borderWidth: 0.5,
    },
    emphasis: { disabled: true },
  };
}

export interface BubbleMapProps<T> {
  echarts: typeof echarts;
  geoJson: MapGeoJson;
  mapName?: string;
  data: T[];
  lng: MapAccessor<T, number>;
  lat: MapAccessor<T, number>;
  value: MapAccessor<T, number>;
  name?: MapAccessor<T, string>;
  minRadius?: number;
  maxRadius?: number;
  bubbleSize?: (value: number) => number;
  bubbleColor?: MapStyle<T, string>;
  bubbleBorderColor?: MapStyle<T, string>;
  bubbleBorderWidth?: MapStyle<T, number>;
  center?: [number, number];
  zoom?: number;
  roam?: boolean;
  projection?: MapProjection | null;
  showTooltip?: boolean;
  valueFormat?: (value: number) => string;
  tooltipFormatter?: (row: T) => string;
  onBubbleHover?: (row: T | undefined) => void;
  onBubbleClick?: (row: T) => void;
  aspectRatio?: number | string;
  height?: number;
  className?: string;
  isDarkMode?: boolean;
  ref?: ChartInstanceRef;
}

interface BubblePoint<T> {
  name?: string;
  value: [number, number, number];
  symbolSize: number;
  itemStyle: {
    color: string;
    borderColor: string;
    borderWidth: number;
  };
  datum: T;
}

function registerMap(
  factory: typeof echarts,
  mapName: () => string,
  geoJson: () => MapGeoJson,
) {
  createEffect(() => {
    factory.registerMap(
      mapName(),
      geoJson() as Parameters<typeof factory.registerMap>[1],
    );
  });
}

function assignChartRef(
  ref: ChartInstanceRef | undefined,
  instance: echarts.ECharts | null,
) {
  if (typeof ref === "function") ref(instance);
  else if (ref) ref.current = instance;
}

function BubbleMapRoot<T>(props: BubbleMapProps<T>) {
  const mapName = createMemo(() => getMapName(props.geoJson, props.mapName));
  registerMap(props.echarts, mapName, () => props.geoJson);
  const palette = createMemo(() => ChartPalette.mapColors(props.isDarkMode));
  const geo = createMemo(() =>
    buildGeo({
      mapName: mapName(),
      areaColor: palette().area,
      center:
        props.center?.[0] !== undefined && props.center?.[1] !== undefined
          ? [props.center[0], props.center[1]]
          : undefined,
      zoom: props.zoom ?? 1.25,
      roam: props.roam ?? false,
      projection: resolveProjection(props.projection),
    }),
  );
  const resolvedAspect = createMemo(() => {
    if (props.height !== undefined) return undefined;
    return (
      props.aspectRatio ??
      projectedAspect(
        resolveProjection(props.projection),
        DEFAULT_BOUNDING_COORDS,
      )
    );
  });

  let appliedGeo: ReturnType<typeof geo> | undefined;
  const options = createMemo<KumoChartOption>(() => {
    const paletteValue = palette();
    const geoValue = geo();
    const includeGeo = appliedGeo !== geoValue;
    const values = props.data.map((row) => resolve(row, props.value));
    const maximum = values.length ? Math.max(...values) : 1;
    const radiusFor = (value: number) => {
      if (props.bubbleSize) return props.bubbleSize(value);
      const minimumRadius = props.minRadius ?? 6;
      const maximumRadius = props.maxRadius ?? 26;
      if (maximum <= 0) return minimumRadius;
      const ratio = Math.sqrt(Math.max(0, value) / maximum);
      return minimumRadius + ratio * (maximumRadius - minimumRadius);
    };
    const points: BubblePoint<T>[] = props.data.map((row) => {
      const value = resolve(row, props.value);
      return {
        name: props.name ? resolve(row, props.name) : undefined,
        value: [resolve(row, props.lng), resolve(row, props.lat), value],
        symbolSize: radiusFor(value),
        itemStyle: {
          color: props.bubbleColor
            ? resolveStyle(row, props.bubbleColor)
            : paletteValue.bubble,
          borderColor: resolveStyle(
            row,
            props.bubbleBorderColor ?? "transparent",
          ),
          borderWidth: resolveStyle(row, props.bubbleBorderWidth ?? 0),
        },
        datum: row,
      };
    });

    return {
      backgroundColor: "transparent",
      animation: true,
      animationDuration: 500,
      animationDurationUpdate: 0,
      ...(includeGeo ? { geo: geoValue } : {}),
      tooltip:
        (props.showTooltip ?? true)
          ? {
              trigger: "item",
              triggerOn: "mousemove",
              backgroundColor: "var(--color-kumo-base)",
              borderColor: "var(--color-kumo-line)",
              borderWidth: 1,
              padding: 8,
              textStyle: {
                color: "var(--text-color-kumo-default)",
                fontSize: 13,
              },
              extraCssText: "border-radius: 0.5rem;",
              dangerousHtmlFormatter: (params: unknown) => {
                const value = params as {
                  name?: string;
                  value?: number[];
                  data?: { datum?: T };
                };
                const row = value.data?.datum;
                if (props.tooltipFormatter && row !== undefined) {
                  return props.tooltipFormatter(row);
                }
                const numericValue = value.value?.[2];
                const name = value.name
                  ? `<strong>${escapeHtml(value.name)}</strong>`
                  : "";
                const formatted =
                  numericValue === undefined
                    ? ""
                    : `<span style="color:var(--text-color-kumo-subtle)">${escapeHtml((props.valueFormat ?? defaultValueFormat)(numericValue))}</span>`;
                return `<div style="display:flex;flex-direction:column;gap:2px;">${name}${formatted}</div>`;
              },
            }
          : undefined,
      series: [
        {
          id: "bubbles",
          type: "scatter",
          coordinateSystem: "geo",
          data: points,
          itemStyle: { opacity: 0.8 },
          emphasis: {
            scale: 1.2,
            itemStyle: { opacity: 1 },
          },
          z: 3,
        },
      ],
    } as KumoChartOption;
  });

  createEffect(() => {
    options();
    appliedGeo = geo();
  });

  const mouseOver: ChartEvents["mouseover"] = (params) => {
    const datum = (params.data as { datum?: T } | undefined)?.datum;
    if (datum !== undefined) props.onBubbleHover?.(datum);
  };
  const mouseOut = () => props.onBubbleHover?.(undefined);
  const click: ChartEvents["click"] = (params) => {
    const datum = (params.data as { datum?: T } | undefined)?.datum;
    if (datum !== undefined) props.onBubbleClick?.(datum);
  };
  const events = createMemo<Partial<ChartEvents>>(() => ({
    ...(props.onBubbleHover
      ? {
          mouseover: mouseOver,
          mouseout: mouseOut,
          globalout: mouseOut,
        }
      : {}),
    ...(props.onBubbleClick ? { click } : {}),
  }));
  const mergedRef = (instance: echarts.ECharts | null) =>
    assignChartRef(props.ref, instance);

  return (
    <Chart
      echarts={props.echarts}
      ref={mergedRef}
      options={options()}
      className={props.className}
      isDarkMode={props.isDarkMode}
      height={props.height}
      aspectRatio={resolvedAspect()}
      onEvents={events()}
    />
  );
}

export const BubbleMap = Object.assign(BubbleMapRoot, {
  displayName: "BubbleMap",
});

export interface ChoroplethMapProps<T> {
  echarts: typeof echarts;
  geoJson: MapGeoJson;
  mapName?: string;
  data: T[];
  name: MapAccessor<T, string>;
  value: MapAccessor<T, number>;
  nameProperty?: string;
  colorRange?: string[];
  min?: number;
  max?: number;
  noDataColor?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  valueFormat?: (value: number) => string;
  tooltipFormatter?: (row: T) => string;
  onRegionHover?: (row: T | undefined) => void;
  onRegionClick?: (row: T) => void;
  center?: [number, number];
  zoom?: number;
  roam?: boolean;
  projection?: MapProjection | null;
  aspectRatio?: number | string;
  height?: number;
  className?: string;
  isDarkMode?: boolean;
  ref?: ChartInstanceRef;
}

interface ChoroplethRegion<T> {
  name: string;
  value: number;
  datum: T;
}

function ChoroplethMapRoot<T>(props: ChoroplethMapProps<T>) {
  const mapName = createMemo(() => getMapName(props.geoJson, props.mapName));
  registerMap(props.echarts, mapName, () => props.geoJson);
  const palette = createMemo(() => ChartPalette.mapColors(props.isDarkMode));
  const view = createMemo(() => {
    const zoom = props.zoom ?? 1.25;
    const roam = props.roam ?? false;
    const projection = resolveProjection(props.projection);
    return {
      roam,
      ...(roam
        ? {
            scaleLimit: {
              min: Math.min(1, zoom),
              max: zoom * MAX_ZOOM_FACTOR,
            },
          }
        : {}),
      center:
        props.center?.[0] !== undefined && props.center?.[1] !== undefined
          ? [props.center[0], props.center[1]]
          : undefined,
      zoom,
      boundingCoords: DEFAULT_BOUNDING_COORDS,
      ...(projection ? { projection } : { aspectScale: 1 }),
    };
  });
  const resolvedAspect = createMemo(() => {
    if (props.height !== undefined) return undefined;
    return (
      props.aspectRatio ??
      projectedAspect(
        resolveProjection(props.projection),
        DEFAULT_BOUNDING_COORDS,
      )
    );
  });

  let appliedView: ReturnType<typeof view> | undefined;
  const options = createMemo<KumoChartOption>(() => {
    const paletteValue = palette();
    const viewValue = view();
    const includeView = appliedView !== viewValue;
    const regions: ChoroplethRegion<T>[] = props.data.map((row) => ({
      name: resolve(row, props.name),
      value: resolve(row, props.value),
      datum: row,
    }));
    const values = regions.map((region) => region.value);
    const dataMinimum = values.length ? Math.min(...values) : 0;
    const dataMaximum = values.length ? Math.max(...values) : 1;
    const minimum = props.min ?? dataMinimum;
    const maximum =
      props.max ?? (dataMaximum > dataMinimum ? dataMaximum : dataMinimum + 1);

    return {
      backgroundColor: "transparent",
      animation: true,
      animationDuration: 500,
      animationDurationUpdate: 0,
      visualMap: {
        type: "continuous",
        show: props.showLegend ?? false,
        min: minimum,
        max: maximum,
        calculable: false,
        hoverLink: false,
        inRange: { color: props.colorRange ?? paletteValue.scale },
        orient: "horizontal",
        text: ["High", "Low"],
        left: 0,
        bottom: 8,
        textStyle: {
          color: ChartPalette.text("primary", props.isDarkMode),
          fontSize: 11,
        },
      },
      tooltip:
        (props.showTooltip ?? true)
          ? {
              trigger: "item",
              triggerOn: "mousemove",
              backgroundColor: "var(--color-kumo-base)",
              borderColor: "var(--color-kumo-line)",
              borderWidth: 1,
              padding: 8,
              textStyle: {
                color: "var(--text-color-kumo-default)",
                fontSize: 13,
              },
              extraCssText: "border-radius: 0.5rem;",
              dangerousHtmlFormatter: (params: unknown) => {
                const value = params as {
                  name?: string;
                  value?: number;
                  data?: { datum?: T };
                };
                const row = value.data?.datum;
                if (row === undefined) return "";
                if (props.tooltipFormatter) {
                  return props.tooltipFormatter(row);
                }
                const numericValue =
                  typeof value.value === "number" && !Number.isNaN(value.value)
                    ? value.value
                    : undefined;
                const name = value.name
                  ? `<strong>${escapeHtml(value.name)}</strong>`
                  : "";
                const formatted =
                  numericValue === undefined
                    ? ""
                    : `<span style="color:var(--text-color-kumo-subtle)">${escapeHtml((props.valueFormat ?? defaultValueFormat)(numericValue))}</span>`;
                return `<div style="display:flex;flex-direction:column;gap:2px;">${name}${formatted}</div>`;
              },
            }
          : undefined,
      series: [
        {
          id: "regions",
          type: "map",
          map: mapName(),
          nameProperty: props.nameProperty ?? "name",
          ...(includeView ? viewValue : {}),
          data: regions,
          itemStyle: {
            areaColor: props.noDataColor ?? paletteValue.area,
            borderColor: "transparent",
            borderWidth: 0,
          },
          label: { show: false },
          emphasis: {
            focus: "self",
            label: { show: false },
            itemStyle: { areaColor: "inherit" },
          },
          blur: {
            label: { show: false },
            itemStyle: { opacity: 0.45 },
          },
          select: { disabled: true },
          z: 1,
        },
      ],
    } as KumoChartOption;
  });

  createEffect(() => {
    options();
    appliedView = view();
  });

  const mouseOver: ChartEvents["mouseover"] = (params) => {
    const datum = (params.data as { datum?: T } | undefined)?.datum;
    if (datum !== undefined) props.onRegionHover?.(datum);
  };
  const mouseOut = () => props.onRegionHover?.(undefined);
  const click: ChartEvents["click"] = (params) => {
    const datum = (params.data as { datum?: T } | undefined)?.datum;
    if (datum !== undefined) props.onRegionClick?.(datum);
  };
  const events = createMemo<Partial<ChartEvents>>(() => ({
    ...(props.onRegionHover
      ? {
          mouseover: mouseOver,
          mouseout: mouseOut,
          globalout: mouseOut,
        }
      : {}),
    ...(props.onRegionClick ? { click } : {}),
  }));
  const mergedRef = (instance: echarts.ECharts | null) =>
    assignChartRef(props.ref, instance);

  return (
    <Chart
      echarts={props.echarts}
      ref={mergedRef}
      options={options()}
      className={props.className}
      isDarkMode={props.isDarkMode}
      height={props.height}
      aspectRatio={resolvedAspect()}
      onEvents={events()}
    />
  );
}

export const ChoroplethMap = Object.assign(ChoroplethMapRoot, {
  displayName: "ChoroplethMap",
});
