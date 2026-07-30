export type TreeNode =
  | { kind: "list"; children: TreeNode[] }
  | { kind: "parallel"; children: TreeNode[]; align?: "end" }
  | { kind: "node"; id: string };

export type FlowAlign = "start" | "center";
export type FlowOrientation = "horizontal" | "vertical";

export type FlowState = {
  nodes: Record<
    string,
    {
      width: number;
      height: number;
      disabled?: boolean;
      startAnchorOffset?: number;
      endAnchorOffset?: number;
    }
  >;
  tree: TreeNode;
  align: FlowAlign;
  orientation: FlowOrientation;
};

export type Edges = [string, string][];
export type NodePositions = Record<string, { x: number; y: number }>;
export type DiagramRect = { width: number; height: number };

function entryIds(node: TreeNode): string[] {
  if (node.kind === "node") return [node.id];
  if (node.kind === "parallel") {
    return node.children.flatMap(entryIds);
  }
  return node.children.length === 0 ? [] : entryIds(node.children[0]);
}

function exitIds(node: TreeNode): string[] {
  if (node.kind === "node") return [node.id];
  if (node.kind === "parallel") {
    return node.children.flatMap(exitIds);
  }
  return node.children.length === 0
    ? []
    : exitIds(node.children[node.children.length - 1]);
}

function collectEdges(node: TreeNode, edges: Edges) {
  if (node.kind === "node") return;
  if (node.kind === "parallel") {
    for (const child of node.children) collectEdges(child, edges);
    return;
  }

  for (const child of node.children) collectEdges(child, edges);
  for (let index = 0; index < node.children.length - 1; index += 1) {
    const current = node.children[index];
    const next = node.children[index + 1];
    if (current.kind === "parallel" && next.kind === "parallel") continue;
    for (const from of exitIds(current)) {
      for (const to of entryIds(next)) edges.push([from, to]);
    }
  }
}

/** Compute connector edges from a flow tree. */
export function computeEdges(flowState: FlowState): Edges {
  const edges: Edges = [];
  collectEdges(flowState.tree, edges);
  return edges;
}

/** Compute top-left node positions for the requested orientation. */
export function computePositions(
  flowState: FlowState,
  { columnGap = 64, rowGap = 16 } = {},
): NodePositions {
  const positions: NodePositions = {};
  const { align, orientation } = flowState;

  function layout(
    node: TreeNode,
    originX: number,
    originY: number,
    out: NodePositions,
  ): DiagramRect {
    if (node.kind === "node") {
      const measured = flowState.nodes[node.id];
      const width = measured?.width ?? 0;
      const height = measured?.height ?? 0;
      out[node.id] = { x: originX, y: originY };
      return { width, height };
    }

    if (node.kind === "list") {
      if (orientation === "vertical") {
        if (align === "center") {
          const sizes = node.children.map((child) => layout(child, 0, 0, {}));
          const width = sizes.reduce(
            (maximum, size) => Math.max(maximum, size.width),
            0,
          );
          let cursorY = originY;
          node.children.forEach((child, index) => {
            layout(
              child,
              originX + (width - sizes[index].width) / 2,
              cursorY,
              out,
            );
            cursorY += sizes[index].height;
            if (index < node.children.length - 1) cursorY += columnGap;
          });
          return { width, height: cursorY - originY };
        }

        let cursorY = originY;
        let width = 0;
        node.children.forEach((child, index) => {
          const size = layout(child, originX, cursorY, out);
          cursorY += size.height;
          if (index < node.children.length - 1) cursorY += columnGap;
          width = Math.max(width, size.width);
        });
        return { width, height: cursorY - originY };
      }

      if (align === "center") {
        const sizes = node.children.map((child) => layout(child, 0, 0, {}));
        const height = sizes.reduce(
          (maximum, size) => Math.max(maximum, size.height),
          0,
        );
        let cursorX = originX;
        node.children.forEach((child, index) => {
          layout(
            child,
            cursorX,
            originY + (height - sizes[index].height) / 2,
            out,
          );
          cursorX += sizes[index].width;
          if (index < node.children.length - 1) cursorX += columnGap;
        });
        return { width: cursorX - originX, height };
      }

      let cursorX = originX;
      let height = 0;
      node.children.forEach((child, index) => {
        const size = layout(child, cursorX, originY, out);
        cursorX += size.width;
        if (index < node.children.length - 1) cursorX += columnGap;
        height = Math.max(height, size.height);
      });
      return { width: cursorX - originX, height };
    }

    if (orientation === "vertical") {
      if (node.align === "end") {
        const sizes = node.children.map((child) => layout(child, 0, 0, {}));
        const height = sizes.reduce(
          (maximum, size) => Math.max(maximum, size.height),
          0,
        );
        let cursorX = originX;
        node.children.forEach((child, index) => {
          layout(child, cursorX, originY + height - sizes[index].height, out);
          cursorX += sizes[index].width;
          if (index < node.children.length - 1) cursorX += rowGap;
        });
        return { width: cursorX - originX, height };
      }

      let cursorX = originX;
      let height = 0;
      node.children.forEach((child, index) => {
        const size = layout(child, cursorX, originY, out);
        height = Math.max(height, size.height);
        cursorX += size.width;
        if (index < node.children.length - 1) cursorX += rowGap;
      });
      return { width: cursorX - originX, height };
    }

    if (node.align === "end") {
      const sizes = node.children.map((child) => layout(child, 0, 0, {}));
      const width = sizes.reduce(
        (maximum, size) => Math.max(maximum, size.width),
        0,
      );
      let cursorY = originY;
      node.children.forEach((child, index) => {
        layout(child, originX + width - sizes[index].width, cursorY, out);
        cursorY += sizes[index].height;
        if (index < node.children.length - 1) cursorY += rowGap;
      });
      return { width, height: cursorY - originY };
    }

    let cursorY = originY;
    let width = 0;
    node.children.forEach((child, index) => {
      const size = layout(child, originX, cursorY, out);
      width = Math.max(width, size.width);
      cursorY += size.height;
      if (index < node.children.length - 1) cursorY += rowGap;
    });
    return { width, height: cursorY - originY };
  }

  layout(flowState.tree, 0, 0, positions);
  return positions;
}

/** Compute the bounding rectangle occupied by the positioned nodes. */
export function computeDiagramRect(
  positions: NodePositions,
  flowState: FlowState,
): DiagramRect {
  let width = 0;
  let height = 0;
  for (const [id, position] of Object.entries(positions)) {
    const node = flowState.nodes[id];
    if (!node) continue;
    width = Math.max(width, position.x + node.width);
    height = Math.max(height, position.y + node.height);
  }
  return { width, height };
}
