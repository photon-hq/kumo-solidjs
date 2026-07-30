import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal, onMount } from "solid-js";
import { describe, expect, it } from "vite-plus/test";
import { createRoundedPath } from "./connectors";
import { Flow } from "./flow";
import { computeEdges, type FlowState, type TreeNode } from "./flow-layout";

function state(tree: TreeNode): FlowState {
  return {
    nodes: {},
    tree,
    align: "start",
    orientation: "horizontal",
  };
}

const node = (id: string): TreeNode => ({ kind: "node", id });
const list = (children: TreeNode[]): TreeNode => ({ kind: "list", children });
const parallel = (children: TreeNode[]): TreeNode => ({
  kind: "parallel",
  children,
});

describe("Flow", () => {
  it("preserves connector path routing", () => {
    expect(
      createRoundedPath(
        { x1: 0, y1: 17, x2: 56, y2: 71 },
        { orientation: "horizontal", single: false },
      ),
    ).toBe("M 0 17 L 32 17 L 32 63 Q 32 71 40 71 L 48 71");
    expect(
      createRoundedPath(
        { x1: 0, y1: 0, x2: 56, y2: 71 },
        { orientation: "vertical", single: true },
      ),
    ).toBe("M 0 0 L 0 31 Q 0 39 8 39 L 48 39 Q 56 39 56 47 L 56 63");
  });

  it("computes sequential, parallel, and nested-list edges", () => {
    const edges = computeEdges(
      state(
        list([
          node("A"),
          parallel([list([node("B1"), node("B2")]), node("C")]),
          node("D"),
        ]),
      ),
    );
    expect(new Set(edges.map(([from, to]) => `${from}-${to}`))).toEqual(
      new Set(["A-B1", "A-C", "B1-B2", "B2-D", "C-D"]),
    );
  });

  it("renders sequential and parallel nodes with stable compound metadata", async () => {
    render(() => (
      <Flow>
        <Flow.Node id="start">Start</Flow.Node>
        <Flow.Parallel>
          <Flow.Node id="branch-a">Branch A</Flow.Node>
          <Flow.Node id="branch-b">Branch B</Flow.Node>
        </Flow.Parallel>
        <Flow.Node id="end">End</Flow.Node>
      </Flow>
    ));

    expect(Flow.displayName).toBe("Flow");
    expect(Flow.Node.displayName).toBe("Flow.Node");
    expect(Flow.Anchor.displayName).toBe("Flow.Anchor");
    expect(screen.getByText("Start").getAttribute("data-node-id")).toBe(
      "start",
    );
    await waitFor(() =>
      expect(screen.getByText("Start").getAttribute("data-node-index")).toBe(
        "0",
      ),
    );
    expect(screen.getByText("Branch B").getAttribute("data-node-index")).toBe(
      "1",
    );
    expect(screen.getByText("End").getAttribute("data-node-index")).toBe("2");
  });

  it("supports vertical lists, custom rendering, and anchors", () => {
    render(() => (
      <Flow orientation="vertical">
        <Flow.Node
          id="custom"
          render={(renderProps) => (
            <li {...renderProps} class="custom-node" data-testid="custom" />
          )}
        >
          <Flow.Anchor type="start">
            <span>Custom anchor</span>
          </Flow.Anchor>
        </Flow.Node>
        <Flow.Node>Next</Flow.Node>
      </Flow>
    ));

    expect(screen.getByText("Custom anchor")).toBeTruthy();
    expect(screen.getByTestId("custom").className).toContain("custom-node");
    expect(
      screen.getByText("Custom anchor").closest("ul")?.className,
    ).toContain("flex-col");
  });

  it("reindexes nodes inserted before an existing child", async () => {
    function Fixture() {
      const [visible, setVisible] = createSignal(false);
      onMount(() => setVisible(true));
      return (
        <Flow>
          {visible() && <Flow.Node>Delayed</Flow.Node>}
          <Flow.Node>Immediate</Flow.Node>
        </Flow>
      );
    }
    render(() => <Fixture />);
    await waitFor(() => expect(screen.getByText("Delayed")).toBeTruthy());
    await waitFor(() =>
      expect(screen.getByText("Delayed").getAttribute("data-node-index")).toBe(
        "0",
      ),
    );
    expect(screen.getByText("Immediate").getAttribute("data-node-index")).toBe(
      "1",
    );
  });

  it("does not start canvas panning from a node", () => {
    const { container } = render(() => (
      <Flow>
        <Flow.Node>Interactive node</Flow.Node>
      </Flow>
    ));
    const wrapper = container.firstElementChild as HTMLElement;
    fireEvent.pointerDown(screen.getByText("Interactive node"), {
      pointerId: 1,
      clientX: 10,
      clientY: 10,
    });
    expect(wrapper.style.cursor).not.toBe("grabbing");
  });

  it("rejects anchors outside nodes", () => {
    expect(() =>
      render(() => (
        <Flow>
          <Flow.Anchor>Orphan</Flow.Anchor>
        </Flow>
      )),
    ).toThrow("Flow.Anchor must be used within Flow.Node");
  });
});
