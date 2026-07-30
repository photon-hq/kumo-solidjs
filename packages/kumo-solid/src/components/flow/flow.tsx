import { useRender } from "@msviderok/base-ui-solid/use-render";
import {
  Show,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  on,
  onCleanup,
  onMount,
  useContext,
  type Accessor,
  type JSX,
  type Ref,
} from "solid-js";
import { cn } from "../../utils/cn";
import { FlowConnectors } from "./connectors";
import {
  computeDiagramRect,
  computeEdges,
  computePositions,
  type FlowAlign,
  type FlowOrientation,
  type FlowState,
  type TreeNode,
} from "./flow-layout";

export type { FlowAlign, FlowOrientation, FlowState, TreeNode };

interface TreeRegistration {
  id: string;
  kind: "node" | "list" | "parallel";
  align?: Accessor<"end" | undefined>;
  children?: Accessor<TreeRegistration[]>;
  element: Accessor<Element | undefined>;
}

interface GroupRegistry {
  entries: Accessor<TreeRegistration[]>;
  register: (registration: TreeRegistration) => () => void;
}

function createGroupRegistry(): GroupRegistry {
  const [registrations, setRegistrations] = createSignal<TreeRegistration[]>(
    [],
  );
  const entries = createMemo(() =>
    [...registrations()].sort((first, second) => {
      const firstElement = first.element();
      const secondElement = second.element();
      if (!firstElement || !secondElement || firstElement === secondElement) {
        return 0;
      }
      const relationship = firstElement.compareDocumentPosition(secondElement);
      if (relationship & 4) return -1;
      if (relationship & 2) return 1;
      return 0;
    }),
  );

  return {
    entries,
    register(registration) {
      setRegistrations((current) => [...current, registration]);
      return () => {
        setRegistrations((current) =>
          current.filter((candidate) => candidate !== registration),
        );
      };
    },
  };
}

function registrationToTree(registration: TreeRegistration): TreeNode {
  if (registration.kind === "node") {
    return { kind: "node", id: registration.id };
  }
  const children = (registration.children?.() ?? []).map(registrationToTree);
  if (registration.kind === "parallel") {
    return {
      kind: "parallel",
      children,
      align: registration.align?.(),
    };
  }
  return { kind: "list", children };
}

const GroupContext = createContext<GroupRegistry>();

interface FlowContextValue {
  reportNode: (id: string, measurement: FlowState["nodes"][string]) => void;
  removeNode: (id: string) => void;
  nodePositions: Accessor<Record<string, { x: number; y: number }>>;
  edges: Accessor<[string, string][]>;
  nodes: Accessor<FlowState["nodes"]>;
  orientation: Accessor<FlowOrientation>;
}

const FlowContext = createContext<FlowContextValue>();

function useFlowContext() {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error("Flow components must be used within Flow");
  }
  return context;
}

function setRef<T>(ref: Ref<T> | undefined, value: T) {
  if (typeof ref === "function") {
    (ref as (value: T) => void)(value);
  }
}

function isEventFromNode(target: EventTarget | null) {
  return target instanceof Element && target.closest("[data-node-id]") !== null;
}

const DEFAULT_PADDING = { x: 16, y: 64 };
const MIN_SCROLLBAR_THUMB_SIZE = 10;

export interface FlowDiagramProps {
  orientation?: FlowOrientation;
  canvas?: boolean;
  align?: FlowAlign;
  padding?: { x?: number; y?: number };
  onOverflowChange?: (overflow: { x: boolean; y: boolean }) => void;
  class?: string;
  className?: string;
  children?: JSX.Element;
}

export function FlowDiagram(props: FlowDiagramProps) {
  let wrapper: HTMLDivElement | undefined;
  let content: HTMLDivElement | undefined;
  const rootRegistry = createGroupRegistry();
  const [nodes, setNodes] = createSignal<FlowState["nodes"]>({});
  const [bounds, setBounds] = createSignal({ x: 0, y: 0 });
  const [dimensions, setDimensions] = createSignal({
    viewportWidth: 0,
    viewportHeight: 0,
    contentWidth: 0,
    contentHeight: 0,
  });
  const [offsetX, setOffsetX] = createSignal(0);
  const [offsetY, setOffsetY] = createSignal(0);
  const [panning, setPanning] = createSignal(false);
  let lastPointer = { x: 0, y: 0 };

  const orientation = () => props.orientation ?? "horizontal";
  const padding = () => ({
    x: props.padding?.x ?? DEFAULT_PADDING.x,
    y: props.padding?.y ?? DEFAULT_PADDING.y,
  });
  const tree = createMemo<TreeNode>(() => ({
    kind: "list",
    children: rootRegistry.entries().map(registrationToTree),
  }));
  const flowState = createMemo<FlowState>(() => ({
    nodes: nodes(),
    tree: tree(),
    align: props.align ?? "start",
    orientation: orientation(),
  }));
  const edges = createMemo(() => computeEdges(flowState()));
  const nodePositions = createMemo(() => computePositions(flowState()));
  const diagramRect = createMemo(() =>
    computeDiagramRect(nodePositions(), flowState()),
  );

  const reportNode: FlowContextValue["reportNode"] = (id, measurement) => {
    setNodes((current) => {
      const previous = current[id];
      if (
        previous?.width === measurement.width &&
        previous?.height === measurement.height &&
        previous?.disabled === measurement.disabled &&
        previous?.startAnchorOffset === measurement.startAnchorOffset &&
        previous?.endAnchorOffset === measurement.endAnchorOffset
      ) {
        return current;
      }
      return { ...current, [id]: measurement };
    });
  };
  const removeNode = (id: string) => {
    setNodes((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  };
  const context: FlowContextValue = {
    reportNode,
    removeNode,
    nodePositions,
    edges,
    nodes,
    orientation,
  };

  const measure = () => {
    if (!wrapper || !content || props.canvas === false) return;
    const wrapperRect = wrapper.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    const availableWidth = wrapperRect.width - padding().x * 2;
    const availableHeight = wrapperRect.height - padding().y * 2;
    const nextBounds = {
      x: Math.min(0, availableWidth - contentRect.width),
      y: Math.min(0, availableHeight - contentRect.height),
    };
    setBounds(nextBounds);
    setDimensions({
      viewportWidth: availableWidth,
      viewportHeight: availableHeight,
      contentWidth: contentRect.width,
      contentHeight: contentRect.height,
    });
    setOffsetX((value) => Math.max(nextBounds.x, Math.min(0, value)));
    setOffsetY((value) => Math.max(nextBounds.y, Math.min(0, value)));
    props.onOverflowChange?.({
      x: contentRect.width > availableWidth,
      y: contentRect.height > availableHeight,
    });
  };

  createEffect(
    on(
      () =>
        [
          props.canvas,
          padding().x,
          padding().y,
          diagramRect().width,
          diagramRect().height,
        ] as const,
      () => {
        if (!wrapper || !content || props.canvas === false) return;
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(wrapper);
        observer.observe(content);
        onCleanup(() => observer.disconnect());
      },
    ),
  );

  createEffect(() => {
    if (!wrapper || props.canvas === false) return;
    const handleWheel = (event: WheelEvent) => {
      const currentBounds = bounds();
      if (currentBounds.x >= 0 && currentBounds.y >= 0) return;
      event.preventDefault();
      if (currentBounds.y < 0) {
        setOffsetY((value) =>
          Math.max(currentBounds.y, Math.min(0, value - event.deltaY)),
        );
      }
      if (currentBounds.x < 0) {
        setOffsetX((value) =>
          Math.max(currentBounds.x, Math.min(0, value - event.deltaX)),
        );
      }
    };
    wrapper.addEventListener("wheel", handleWheel, { passive: false });
    onCleanup(() => wrapper?.removeEventListener("wheel", handleWheel));
  });

  onCleanup(() => {
    if (typeof document !== "undefined") {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
  });

  const canPan = () => bounds().x < 0 || bounds().y < 0;
  const pointerDown: JSX.EventHandler<HTMLDivElement, PointerEvent> = (
    event,
  ) => {
    if (!canPan() || isEventFromNode(event.target)) return;
    setPanning(true);
    lastPointer = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
  };
  const pointerMove: JSX.EventHandler<HTMLDivElement, PointerEvent> = (
    event,
  ) => {
    if (!panning()) return;
    const deltaX = event.clientX - lastPointer.x;
    const deltaY = event.clientY - lastPointer.y;
    lastPointer = { x: event.clientX, y: event.clientY };
    setOffsetX((value) => Math.max(bounds().x, Math.min(0, value + deltaX)));
    setOffsetY((value) => Math.max(bounds().y, Math.min(0, value + deltaY)));
  };
  const pointerUp = () => {
    if (!panning()) return;
    setPanning(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  const thumbWidth = () => {
    const current = dimensions();
    return current.contentWidth > 0 && current.viewportWidth > 0
      ? Math.max(
          MIN_SCROLLBAR_THUMB_SIZE,
          (current.viewportWidth / current.contentWidth) * 100,
        )
      : 0;
  };
  const thumbHeight = () => {
    const current = dimensions();
    return current.contentHeight > 0 && current.viewportHeight > 0
      ? Math.max(
          MIN_SCROLLBAR_THUMB_SIZE,
          (current.viewportHeight / current.contentHeight) * 100,
        )
      : 0;
  };
  const thumbLeft = () =>
    bounds().x === 0 ? 0 : (offsetX() / bounds().x) * (100 - thumbWidth());
  const thumbTop = () =>
    bounds().y === 0 ? 0 : (offsetY() / bounds().y) * (100 - thumbHeight());

  return (
    <FlowContext.Provider value={context}>
      <div
        ref={(node) => {
          wrapper = node;
        }}
        class={cn(
          "group isolate grow overflow-hidden",
          props.class,
          props.className,
        )}
        style={{
          "padding-top": `${padding().y}px`,
          "padding-bottom": `${padding().y}px`,
          "padding-left": `${padding().x}px`,
          "padding-right": `${padding().x}px`,
          cursor: canPan() && !panning() ? "grab" : undefined,
        }}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
      >
        <div
          data-testid="flow-contents"
          ref={(node) => {
            content = node;
          }}
          class="relative mx-auto"
          style={{
            transform: `translate(${offsetX()}px, ${offsetY()}px)`,
            width: diagramRect().width ? `${diagramRect().width}px` : undefined,
            height: diagramRect().height
              ? `${diagramRect().height}px`
              : undefined,
          }}
        >
          <GroupContext.Provider value={rootRegistry}>
            <ul
              class={cn(
                "ml-0 list-none",
                orientation() === "vertical" && "flex flex-col",
              )}
            >
              {props.children}
            </ul>
          </GroupContext.Provider>
          <div class="pointer-events-none absolute inset-0">
            <FlowConnectors
              edges={edges()}
              nodePositions={nodePositions()}
              nodes={nodes()}
              orientation={orientation()}
            />
          </div>
        </div>
        <Show when={bounds().y < 0}>
          <div class="absolute top-1 right-1 bottom-1 w-1.5 rounded-full bg-kumo-hairline/50 opacity-0 group-hover:opacity-100">
            <div
              class="absolute w-full rounded-full bg-kumo-fill"
              style={{
                height: `${thumbHeight()}%`,
                top: `${thumbTop()}%`,
              }}
            />
          </div>
        </Show>
        <Show when={bounds().x < 0}>
          <div class="absolute right-1 bottom-1 left-1 h-1.5 rounded-full bg-kumo-hairline/50 opacity-0 group-hover:opacity-100">
            <div
              class="absolute h-full rounded-full bg-kumo-fill"
              style={{
                width: `${thumbWidth()}%`,
                left: `${thumbLeft()}%`,
              }}
            />
          </div>
        </Show>
      </div>
    </FlowContext.Provider>
  );
}

type AnchorType = "start" | "end" | "both";
interface AnchorContextValue {
  registerAnchor: (
    type: AnchorType,
    element: HTMLElement | null,
  ) => (() => void) | undefined;
}
const AnchorContext = createContext<AnchorContextValue>();

export interface FlowNodeProps {
  id?: string;
  render?: useRender.RenderProp;
  children?: JSX.Element;
  disabled?: boolean;
  ref?: Ref<HTMLElement>;
}

export function FlowNode(props: FlowNodeProps) {
  const group = useContext(GroupContext);
  const flow = useFlowContext();
  if (!group) throw new Error("Flow.Node must be used within Flow");
  const id = props.id ?? `flow-node-${createUniqueId()}`;
  let element: HTMLElement | undefined;
  let startAnchorOffset: number | undefined;
  let endAnchorOffset: number | undefined;
  const registration: TreeRegistration = {
    id,
    kind: "node",
    element: () => element,
  };
  const index = createMemo(() =>
    group.entries().findIndex((entry) => entry === registration),
  );
  const position = () => flow.nodePositions()[id];

  const reportSize = () => {
    if (!element) return;
    const { width, height } = element.getBoundingClientRect();
    flow.reportNode(id, {
      width,
      height,
      disabled: props.disabled ?? false,
      startAnchorOffset,
      endAnchorOffset,
    });
  };

  onMount(() => {
    const unregister = group.register(registration);
    const observer = new ResizeObserver(reportSize);
    if (element) observer.observe(element);
    reportSize();
    onCleanup(() => {
      observer.disconnect();
      unregister();
      flow.removeNode(id);
    });
  });

  const registerAnchor: AnchorContextValue["registerAnchor"] = (
    type,
    anchor,
  ) => {
    const write = (offset: number | undefined) => {
      if (type === "start" || type === "both") startAnchorOffset = offset;
      if (type === "end" || type === "both") endAnchorOffset = offset;
    };
    if (!anchor) {
      write(undefined);
      reportSize();
      return;
    }
    const measure = () => {
      if (!element) return;
      const anchorRect = anchor.getBoundingClientRect();
      const nodeRect = element.getBoundingClientRect();
      write(anchorRect.top - nodeRect.top + anchorRect.height / 2);
      reportSize();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(anchor);
    return () => observer.disconnect();
  };

  const rendered = useRender({
    render: props.render ?? "li",
    ref: (node: HTMLElement) => {
      element = node;
      setRef(props.ref, node);
    },
    props: {
      get class() {
        return props.render
          ? undefined
          : "absolute cursor-default rounded-md bg-kumo-base px-3 py-2 shadow ring ring-kumo-line";
      },
      get style() {
        const current = position();
        return current
          ? {
              position: "absolute",
              top: `${current.y}px`,
              left: `${current.x}px`,
              cursor: "default",
            }
          : { opacity: 0, cursor: "default" };
      },
      get "data-node-index"() {
        return index();
      },
      "data-node-id": id,
      get "data-testid"() {
        return id;
      },
      get "aria-hidden"() {
        return position() ? undefined : "true";
      },
    },
    children: () => props.children,
  });

  return (
    <AnchorContext.Provider value={{ registerAnchor }}>
      {rendered()}
    </AnchorContext.Provider>
  );
}

const NamedFlowNode = Object.assign(FlowNode, {
  displayName: "Flow.Node",
});

export interface FlowAnchorProps {
  type?: "start" | "end";
  render?: useRender.RenderProp;
  children?: JSX.Element;
  ref?: Ref<HTMLElement>;
}

export function FlowAnchor(props: FlowAnchorProps) {
  const context = useContext(AnchorContext);
  if (!context) {
    throw new Error("Flow.Anchor must be used within Flow.Node");
  }
  let element: HTMLElement | undefined;
  onMount(() => {
    if (!element) return;
    const cleanup = context.registerAnchor(props.type ?? "both", element);
    onCleanup(() => {
      cleanup?.();
      context.registerAnchor(props.type ?? "both", null);
    });
  });
  const rendered = useRender({
    render: props.render ?? "div",
    ref: (node: HTMLElement) => {
      element = node;
      setRef(props.ref, node);
    },
    children: () => props.children,
  });
  return rendered();
}

const NamedFlowAnchor = Object.assign(FlowAnchor, {
  displayName: "Flow.Anchor",
});

interface FlowGroupProps {
  children?: JSX.Element;
  align?: "end";
}

function RegisteredGroup(
  props: FlowGroupProps & { kind: "list" | "parallel" },
) {
  const parent = useContext(GroupContext);
  if (!parent) throw new Error("Flow groups must be used within Flow");
  const local = createGroupRegistry();
  const id = `flow-group-${createUniqueId()}`;
  let element: HTMLLIElement | undefined;
  const registration: TreeRegistration = {
    id,
    kind: props.kind,
    align: () => props.align,
    children: local.entries,
    element: () => element,
  };
  const index = createMemo(() =>
    parent.entries().findIndex((entry) => entry === registration),
  );
  onMount(() => {
    const unregister = parent.register(registration);
    onCleanup(unregister);
  });

  return (
    <li
      ref={(node) => {
        element = node;
      }}
      data-node-index={index()}
    >
      <GroupContext.Provider value={local}>
        <Show when={props.kind === "list"} fallback={props.children}>
          <ul class="ml-0 list-none">{props.children}</ul>
        </Show>
      </GroupContext.Provider>
    </li>
  );
}

export function FlowParallelNode(props: FlowGroupProps) {
  return <RegisteredGroup {...props} kind="parallel" />;
}

export function FlowNodeList(props: { children?: JSX.Element }) {
  return <RegisteredGroup {...props} kind="list" />;
}

const NamedParallel = Object.assign(FlowParallelNode, {
  displayName: "Flow.Parallel",
});
const NamedList = Object.assign(FlowNodeList, {
  displayName: "Flow.List",
});

export const Flow = Object.assign(FlowDiagram, {
  displayName: "Flow",
  Node: NamedFlowNode,
  Parallel: NamedParallel,
  List: NamedList,
  Anchor: NamedFlowAnchor,
});
