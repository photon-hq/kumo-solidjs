import type * as echarts from "echarts/core";
import { createMemo } from "solid-js";
import { Chart, type ChartEvents, type KumoChartOption } from "./EChart";
import { ChartPalette } from "./Color";
import { defaultValueFormat, escapeHtml } from "./tooltip-utils";

export interface SankeyNodeData {
  id?: string;
  name: string;
  color?: string;
  value?: number;
  tooltipData?: Record<string, number | string>;
  isDrillable?: boolean;
  childCount?: number;
}

export interface SankeyLinkData {
  id?: string;
  source: number;
  target: number;
  value: number;
  isDrillable?: boolean;
}

export type DrillTarget =
  | { type: "node"; nodeId: string }
  | { type: "link"; sourceId: string; targetId: string };

export interface DrillSelection {
  id: string;
  type: "node" | "link";
  label: string;
  depth: number;
}

export interface DrillDownContext {
  selections: DrillSelection[];
  isMultiSelect: boolean;
}

export interface SankeyData {
  nodes: SankeyNodeData[];
  links: SankeyLinkData[];
}

export interface SankeyTooltipParams {
  type: "node" | "link";
  name: string;
  node?: SankeyNodeData;
  link?: { source: string; target: string; value: number };
  color?: string;
}

export interface SankeyChartProps {
  echarts: typeof echarts;
  nodes: SankeyNodeData[];
  links: SankeyLinkData[];
  height?: number;
  showNodeValues?: boolean;
  nodeLabelLayout?: "stacked" | "inline";
  formatValue?: (value: number) => string;
  tooltipFormatter?: (params: SankeyTooltipParams) => string;
  nodeWidth?: number;
  nodePadding?: number;
  showTooltip?: boolean;
  defaultNodeColor?: string;
  left?: number | string;
  right?: number | string;
  linkColor?: "gradient" | "gray";
  linkOpacity?: number;
  className?: string;
  isDarkMode?: boolean;
  onNodeClick?: (node: SankeyNodeData) => void;
  onLinkClick?: (link: SankeyLinkData) => void;
}

interface TooltipParams {
  dataType?: string;
  name?: string;
  data?: { source?: string; target?: string; value?: number };
  value?: number | number[];
  color?: string;
}

function isTooltipParams(params: unknown): params is TooltipParams {
  return typeof params === "object" && params !== null;
}

export const escapeRichText = (value: string): string =>
  value.replace(/[{}|]/g, (character) => `\\${character}`);

export const sanitizeColor = (color: string): string => {
  const fallback = "#666";
  if (!color || typeof color !== "string") return fallback;
  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color)) {
    return color;
  }
  if (
    /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*[\d.]+\s*)?\)$/i.test(
      color,
    )
  ) {
    return color;
  }
  if (
    /^hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(?:,\s*[\d.]+\s*)?\)$/i.test(
      color,
    )
  ) {
    return color;
  }
  if (/^[a-z]{3,20}$/i.test(color)) return color;
  return fallback;
};

function SankeyChartRoot(props: SankeyChartProps) {
  const options = createMemo<KumoChartOption>(() => {
    const nodes = props.nodes;
    const links = props.links;
    const dark = props.isDarkMode;
    const formatValue = props.formatValue ?? defaultValueFormat;
    const showValues =
      props.showNodeValues ?? nodes.some((node) => node.value !== undefined);
    const inline = (props.nodeLabelLayout ?? "stacked") === "inline";
    const labelColor = ChartPalette.text("primary", dark);
    const secondaryColor = ChartPalette.text("secondary", dark);
    const nodeColors = nodes.map(
      (node, index) =>
        node.color ??
        props.defaultNodeColor ??
        ChartPalette.categorical(index, dark),
    );
    const nodeDataMap = new Map(
      nodes.map((node, index) => [
        node.name,
        { ...node, computedColor: nodeColors[index] },
      ]),
    );

    return {
      backgroundColor: "transparent",
      animation: true,
      animationDuration: 500,
      animationDurationUpdate: 300,
      animationEasingUpdate: "cubicInOut",
      tooltip:
        (props.showTooltip ?? true)
          ? {
              trigger: "item",
              triggerOn: "mousemove",
              dangerousHtmlFormatter: (params: unknown) => {
                if (!isTooltipParams(params)) return "";

                if (params.dataType === "node" && params.name) {
                  const node = nodeDataMap.get(params.name);
                  const color = sanitizeColor(
                    node?.computedColor ?? params.color ?? "#666",
                  );
                  if (props.tooltipFormatter) {
                    return props.tooltipFormatter({
                      type: "node",
                      name: params.name,
                      node,
                      color,
                    });
                  }
                  return `<div style="display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color}"></span><strong>${escapeHtml(params.name)}</strong></div>`;
                }

                if (params.dataType === "edge" && params.data) {
                  const { source, target, value } = params.data;
                  if (props.tooltipFormatter) {
                    return props.tooltipFormatter({
                      type: "link",
                      name: `${source} → ${target}`,
                      link: {
                        source: source ?? "",
                        target: target ?? "",
                        value: value ?? 0,
                      },
                    });
                  }
                  const sourceColor = sanitizeColor(
                    nodeDataMap.get(source ?? "")?.computedColor ?? "#666",
                  );
                  const targetColor = sanitizeColor(
                    nodeDataMap.get(target ?? "")?.computedColor ?? "#666",
                  );
                  const formatted =
                    value === undefined ? "" : escapeHtml(formatValue(value));
                  return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                  <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${sourceColor}"></span>
                  <strong>${escapeHtml(source ?? "")}</strong>
                  <span style="color:${secondaryColor}">→</span>
                  <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${targetColor}"></span>
                  <strong>${escapeHtml(target ?? "")}</strong>
                </div>
                <strong>${formatted}</strong>`;
                }
                return "";
              },
            }
          : undefined,
      series: [
        {
          type: "sankey",
          ...(props.left !== undefined && { left: props.left }),
          ...(props.right !== undefined && { right: props.right }),
          data: nodes.map((node, index) => ({
            name: node.name,
            value: node.value,
            itemStyle: { color: nodeColors[index] },
          })),
          links: links.map((link) => ({
            source: nodes[link.source]?.name ?? "",
            target: nodes[link.target]?.name ?? "",
            value: link.value,
          })),
          draggable: false,
          emphasis: { focus: "adjacency" },
          nodeWidth: props.nodeWidth ?? 8,
          nodeGap: props.nodePadding ?? 10,
          lineStyle: {
            color:
              (props.linkColor ?? "gradient") === "gradient"
                ? "source"
                : "#d1d5db",
            opacity:
              (props.linkColor ?? "gradient") === "gradient"
                ? (props.linkOpacity ?? 0.5)
                : 0.4,
            curveness: 0.5,
          },
          label: {
            show: true,
            color: labelColor,
            fontSize: 12,
            formatter: showValues
              ? (params: { name?: string }) => {
                  const name = params.name ?? "";
                  const node = nodeDataMap.get(name);
                  const safeName = escapeRichText(name);
                  if (node?.value === undefined) return safeName;
                  const formatted = escapeRichText(formatValue(node.value));
                  return inline
                    ? `{name|${safeName}} {value|${formatted}}`
                    : `{value|${formatted}}\n{name|${safeName}}`;
                }
              : undefined,
            rich: showValues
              ? {
                  value: {
                    fontSize: 11,
                    color: labelColor,
                    lineHeight: inline ? undefined : 16,
                  },
                  name: {
                    fontSize: 12,
                    color: labelColor,
                    fontWeight: 700,
                  },
                }
              : undefined,
          },
        },
      ],
    } as KumoChartOption;
  });

  const onEvents: Partial<ChartEvents> = {
    click(params) {
      if (params.dataType === "node" && props.onNodeClick && params.name) {
        const index = props.nodes.findIndex(
          (node) => node.name === params.name,
        );
        const original = index >= 0 ? props.nodes[index] : undefined;
        props.onNodeClick({ ...original, name: params.name });
        return;
      }
      if (params.dataType !== "edge" || !props.onLinkClick || !params.data) {
        return;
      }
      const source =
        typeof params.data === "object" &&
        params.data !== null &&
        "source" in params.data
          ? String(params.data.source)
          : "";
      const target =
        typeof params.data === "object" &&
        params.data !== null &&
        "target" in params.data
          ? String(params.data.target)
          : "";
      const sourceIndex = props.nodes.findIndex((node) => node.name === source);
      const targetIndex = props.nodes.findIndex((node) => node.name === target);
      if (sourceIndex === -1 || targetIndex === -1) return;
      const value =
        typeof params.value === "number"
          ? params.value
          : Array.isArray(params.value) && typeof params.value[0] === "number"
            ? params.value[0]
            : 0;
      const original = props.links.find(
        (link) => link.source === sourceIndex && link.target === targetIndex,
      );
      props.onLinkClick({
        ...original,
        source: sourceIndex,
        target: targetIndex,
        value,
      });
    },
  };

  return (
    <Chart
      echarts={props.echarts}
      options={options()}
      className={props.className}
      isDarkMode={props.isDarkMode}
      height={props.height ?? 400}
      onEvents={onEvents}
    />
  );
}

export const SankeyChart = Object.assign(SankeyChartRoot, {
  displayName: "SankeyChart",
});
