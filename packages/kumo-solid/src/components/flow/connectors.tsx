import { For, createUniqueId, type JSX, type Ref } from "solid-js";
import type {
  Edges,
  FlowOrientation,
  FlowState,
  NodePositions,
} from "./flow-layout";

export interface Connector {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isBottom?: boolean;
  disabled?: boolean;
  single?: boolean;
  fromId?: string;
  toId?: string;
}

type PathProps = Partial<{
  cornerRadius: number;
  midOffset: number;
  arrowheadOffset: number;
  isBottom: boolean;
  single: boolean;
  orientation: FlowOrientation;
}>;

export interface ConnectorsProps
  extends
    Omit<JSX.SvgSVGAttributes<SVGSVGElement>, "children" | "ref">,
    Omit<PathProps, "isBottom" | "single"> {
  connectors: Connector[];
  children?: JSX.Element;
  ref?: Ref<SVGSVGElement>;
}

const FLAT_THRESHOLD = 2;

export function createRoundedPath(
  { x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number },
  {
    cornerRadius: maximumRadius = 8,
    midOffset = 32,
    arrowheadOffset = 8,
    isBottom = false,
    single = false,
    orientation = "vertical",
  }: PathProps = {},
) {
  const radius = Math.min(
    maximumRadius,
    Math.abs(orientation === "horizontal" ? (y2 - y1) / 2 : (x2 - x1) / 2),
  );

  if (orientation === "horizontal") {
    if (Math.abs(y2 - y1) <= FLAT_THRESHOLD) {
      return `M ${x1} ${y1} L ${x2 - arrowheadOffset} ${y2}`;
    }
    const turnX = single || isBottom ? x2 - midOffset : x1 + midOffset;
    const horizontalSign = x2 > x1 ? 1 : -1;
    const verticalSign = y2 > y1 ? 1 : -1;
    const firstEnd = turnX - horizontalSign * radius;
    const verticalStart = y1 + verticalSign * radius;
    const verticalEnd = y2 - verticalSign * radius;
    const secondStart = turnX + horizontalSign * radius;
    const pathEnd = x2 - horizontalSign * arrowheadOffset;
    const bottom = [
      `L ${firstEnd} ${y1}`,
      `Q ${turnX} ${y1} ${turnX} ${verticalStart}`,
      single
        ? `L ${turnX} ${verticalEnd} Q ${turnX} ${y2} ${secondStart} ${y2}`
        : `L ${turnX} ${y2}`,
    ];
    const top = [
      single
        ? `L ${firstEnd} ${y1} Q ${turnX} ${y1} ${turnX} ${verticalStart}`
        : `L ${turnX} ${y1}`,
      `L ${turnX} ${verticalEnd}`,
      `Q ${turnX} ${y2} ${secondStart} ${y2}`,
    ];
    return [
      `M ${x1} ${y1}`,
      ...(isBottom ? bottom : top),
      `L ${pathEnd} ${y2}`,
    ].join(" ");
  }

  if (Math.abs(x2 - x1) <= FLAT_THRESHOLD) {
    return `M ${x1} ${y1} L ${x2} ${y2 - arrowheadOffset}`;
  }
  const turnY = single || isBottom ? y2 - midOffset : y1 + midOffset;
  const horizontalSign = x2 > x1 ? 1 : -1;
  const verticalSign = y2 > y1 ? 1 : -1;
  const firstEnd = turnY - radius;
  const horizontalStart = x1 + horizontalSign * radius;
  const horizontalEnd = x2 - horizontalSign * radius;
  const secondStart = turnY + radius;
  const pathEnd = y2 - verticalSign * arrowheadOffset;
  const bottom = [
    `L ${x1} ${firstEnd}`,
    `Q ${x1} ${turnY} ${horizontalStart} ${turnY}`,
    single
      ? `L ${horizontalEnd} ${turnY} Q ${x2} ${turnY} ${x2} ${secondStart}`
      : `L ${x2} ${turnY}`,
  ];
  const top = [
    single
      ? `L ${x1} ${firstEnd} Q ${x1} ${turnY} ${horizontalStart} ${turnY}`
      : `L ${x1} ${turnY}`,
    `L ${horizontalEnd} ${turnY}`,
    `Q ${x2} ${turnY} ${x2} ${secondStart}`,
  ];
  return [
    `M ${x1} ${y1}`,
    ...(isBottom ? bottom : top),
    `L ${x2} ${pathEnd}`,
  ].join(" ");
}

export function FlowConnectors(props: {
  edges: Edges;
  nodePositions: NodePositions;
  nodes: FlowState["nodes"];
  orientation: FlowOrientation;
}) {
  const connectors = () => {
    const result: Connector[] = [];
    for (const [fromId, toId] of props.edges) {
      const fromPosition = props.nodePositions[fromId];
      const toPosition = props.nodePositions[toId];
      const fromNode = props.nodes[fromId];
      const toNode = props.nodes[toId];
      if (!fromPosition || !toPosition || !fromNode || !toNode) continue;
      const points =
        props.orientation === "vertical"
          ? {
              x1: fromPosition.x + fromNode.width / 2,
              y1: fromPosition.y + fromNode.height,
              x2: toPosition.x + toNode.width / 2,
              y2: toPosition.y,
            }
          : {
              x1: fromPosition.x + fromNode.width,
              y1:
                fromPosition.y +
                (fromNode.startAnchorOffset ?? fromNode.height / 2),
              x2: toPosition.x,
              y2: toPosition.y + (toNode.endAnchorOffset ?? toNode.height / 2),
            };
      result.push({
        ...points,
        disabled: fromNode.disabled || toNode.disabled,
        fromId,
        toId,
        single: true,
      });
    }
    return result;
  };
  return (
    <Connectors connectors={connectors()} orientation={props.orientation} />
  );
}

export function Connectors(props: ConnectorsProps) {
  const markerId = `kumo-flow-arrow-${createUniqueId()}`;
  const sorted = () =>
    [...props.connectors].sort((first, second) =>
      first.disabled === second.disabled ? 0 : first.disabled ? -1 : 1,
    );

  return (
    <svg
      width="100%"
      height="100%"
      overflow="visible"
      aria-hidden="true"
      class="overflow-visible text-kumo-placeholder"
      ref={props.ref}
    >
      <defs>
        <marker
          id={markerId}
          markerWidth="8"
          markerHeight="8"
          refX="0"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M 0,1.5 Q 0,0 1.5,0 Q 3.5,1 5.8,3.2 Q 6.5,4 5.8,4.8 Q 3.5,7 1.5,8 Q 0,8 0,6.5 Z"
            fill="currentColor"
            stroke="none"
          />
        </marker>
      </defs>
      <For each={sorted()}>
        {(connector, index) => {
          const id = () =>
            connector.fromId && connector.toId
              ? `${connector.fromId}-${connector.toId}`
              : `path-${index()}`;
          return (
            <g class={connector.disabled ? "opacity-40" : undefined}>
              <path
                d={createRoundedPath(connector, {
                  cornerRadius: props.cornerRadius,
                  midOffset: props.midOffset,
                  arrowheadOffset: props.arrowheadOffset,
                  isBottom: connector.isBottom,
                  single: connector.single,
                  orientation: props.orientation,
                })}
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                marker-end={`url(#${markerId})`}
                data-index={index()}
                data-testid={id()}
              />
            </g>
          );
        }}
      </For>
      {props.children}
    </svg>
  );
}
