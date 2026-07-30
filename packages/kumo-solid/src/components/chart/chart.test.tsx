import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import type * as echarts from "echarts/core";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { ChartPalette } from "./Color";
import { Chart, prepareChartOptions } from "./EChart";
import { BubbleMap, ChoroplethMap, type MapGeoJson } from "./Maps";
import { SankeyChart, sanitizeColor } from "./SankeyChart";
import { TimeseriesChart } from "./TimeseriesChart";
import { ChartLegend } from "./Legend";

function createMockChart() {
  return {
    setOption: vi.fn(),
    dispatchAction: vi.fn(),
    convertFromPixel: vi.fn(() => [0, 0]),
    on: vi.fn(),
    off: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
  };
}

function createMockEcharts(chart = createMockChart()) {
  return {
    init: vi.fn(() => chart),
    registerMap: vi.fn(),
    graphic: {
      LinearGradient: class {
        constructor(
          public x: number,
          public y: number,
          public x2: number,
          public y2: number,
          public colorStops: unknown[],
        ) {}
      },
    },
  } as unknown as typeof echarts;
}

function eventHandler(chart: ReturnType<typeof createMockChart>, name: string) {
  return chart.on.mock.calls.find((call) => call[0] === name)?.[1] as
    | ((params: any) => void)
    | undefined;
}

describe("Chart", () => {
  it("prepares safe tooltip formatters and mode palettes", () => {
    const formatter = vi.fn(() => "<b>safe</b>");
    const options = prepareChartOptions({
      isDarkMode: true,
      options: {
        tooltip: { dangerousHtmlFormatter: formatter },
      },
    });
    expect(options.color).toEqual([
      "#4290F0",
      "#EEB720",
      "#E8649D",
      "#8D58EE",
      "#50C3B6",
      "#D37536",
    ]);
    expect((options.tooltip as { formatter?: unknown }).formatter).toBe(
      formatter,
    );
    expect(options.backgroundColor).toBe("transparent");
  });

  it("initializes, updates, exposes, and disposes an ECharts instance", async () => {
    const instance = createMockChart();
    const factory = createMockEcharts(instance);
    const ref = { current: null as any };
    const { unmount } = render(() => (
      <Chart
        echarts={factory}
        ref={ref}
        options={{ aria: { enabled: true }, series: [] }}
        height={240}
      />
    ));
    await waitFor(() => expect(factory.init).toHaveBeenCalledOnce());
    expect(ref.current).toBe(instance);
    expect(instance.setOption).toHaveBeenCalled();
    const element = screen.getByRole("img");
    expect(element.style.height).toBe("240px");
    expect(element.getAttribute("tabindex")).toBe("0");
    unmount();
    expect(instance.dispose).toHaveBeenCalledOnce();
    expect(ref.current).toBeNull();
  });

  it("keeps stable event wrappers while using the latest handler", async () => {
    const instance = createMockChart();
    const factory = createMockEcharts(instance);
    const first = vi.fn();
    const second = vi.fn();
    function Example() {
      const [handler, setHandler] = createSignal(first);
      return (
        <>
          <button type="button" onClick={() => setHandler(() => second)}>
            Update
          </button>
          <Chart
            echarts={factory}
            options={{ series: [] }}
            onEvents={{ click: handler() }}
          />
        </>
      );
    }
    render(() => <Example />);
    await waitFor(() =>
      expect(eventHandler(instance, "click")).toBeTypeOf("function"),
    );
    const wrapper = eventHandler(instance, "click")!;
    wrapper({ componentType: "series" });
    expect(first).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Update" }));
    expect(eventHandler(instance, "click")).toBe(wrapper);
    wrapper({ componentType: "series" });
    expect(second).toHaveBeenCalledOnce();
    expect(instance.on).toHaveBeenCalledTimes(1);
  });
});

describe("ChartLegend", () => {
  it("supports keyboard activation and inactive styling", () => {
    const click = vi.fn();
    render(() => (
      <ChartLegend.SmallItem
        name="Requests"
        color="#4290F0"
        value="42"
        inactive
        onClick={click}
      />
    ));
    const item = screen.getByRole("button");
    fireEvent.keyDown(item, { key: "Enter" });
    expect(click).toHaveBeenCalledOnce();
    expect(item.querySelector(".opacity-50")).not.toBeNull();
  });

  it("renders skeleton variants while loading", () => {
    render(() => (
      <>
        <ChartLegend.SmallItem loading />
        <ChartLegend.LargeItem loading />
      </>
    ));
    expect(document.querySelectorAll(".skeleton-line")).toHaveLength(4);
  });
});

const geoJson: MapGeoJson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "US",
      properties: { name: "United States" },
      geometry: { type: "Polygon", coordinates: [] },
    },
  ],
};
const mapData = [
  {
    city: "San Francisco",
    country: "United States",
    latitude: 37.77,
    longitude: -122.42,
    requests: 10,
  },
  {
    city: "London",
    country: "United Kingdom",
    latitude: 51.5,
    longitude: -0.12,
    requests: 20,
  },
];

describe("map charts", () => {
  it("reuses deterministic map names and sanitizes explicit names", async () => {
    const factory = createMockEcharts();
    const first = render(() => (
      <BubbleMap
        echarts={factory}
        geoJson={geoJson}
        data={mapData}
        lng="longitude"
        lat="latitude"
        name="city"
        value="requests"
      />
    ));
    await waitFor(() => expect(factory.registerMap).toHaveBeenCalledOnce());
    const generated = vi.mocked(factory.registerMap).mock.calls[0][0];
    first.unmount();
    render(() => (
      <BubbleMap
        echarts={factory}
        geoJson={geoJson}
        mapName="world:traffic/map"
        data={mapData}
        lng="longitude"
        lat="latitude"
        value="requests"
      />
    ));
    await waitFor(() => expect(factory.registerMap).toHaveBeenCalledTimes(2));
    expect(generated).toMatch(/^kumo-map-/);
    expect(vi.mocked(factory.registerMap).mock.calls[1][0]).toBe(
      "world-traffic-map",
    );
  });

  it("applies bubble sizing and forwards instance refs", async () => {
    const instance = createMockChart();
    const factory = createMockEcharts(instance);
    const ref = { current: null as any };
    const { unmount } = render(() => (
      <BubbleMap
        ref={ref}
        echarts={factory}
        geoJson={geoJson}
        data={mapData}
        lng="longitude"
        lat="latitude"
        name="city"
        value="requests"
        bubbleSize={(value) => value / 2}
      />
    ));
    await waitFor(() => expect(instance.setOption).toHaveBeenCalled());
    const options = instance.setOption.mock.calls[0][0] as any;
    expect(options.series[0].data[0].symbolSize).toBe(5);
    expect(options.series[0].data[1].symbolSize).toBe(10);
    expect(ref.current).toBe(instance);
    unmount();
    expect(ref.current).toBeNull();
  });

  it("builds choropleth ranges and dispatches row interactions", async () => {
    const instance = createMockChart();
    const factory = createMockEcharts(instance);
    const hover = vi.fn();
    const click = vi.fn();
    render(() => (
      <ChoroplethMap
        echarts={factory}
        geoJson={geoJson}
        data={mapData}
        name="country"
        value="requests"
        showLegend
        onRegionHover={hover}
        onRegionClick={click}
      />
    ));
    await waitFor(() => expect(instance.setOption).toHaveBeenCalled());
    const options = instance.setOption.mock.calls[0][0] as any;
    expect(options.visualMap.min).toBe(10);
    expect(options.visualMap.max).toBe(20);
    expect(options.visualMap.show).toBe(true);
    const datum = options.series[0].data[0].datum;
    eventHandler(instance, "mouseover")?.({ data: { datum } });
    eventHandler(instance, "click")?.({ data: { datum } });
    eventHandler(instance, "globalout")?.({});
    expect(hover).toHaveBeenNthCalledWith(1, mapData[0]);
    expect(hover).toHaveBeenLastCalledWith(undefined);
    expect(click).toHaveBeenCalledWith(mapData[0]);
  });
});

describe("SankeyChart", () => {
  const nodes = [
    { id: "source", name: "Source <script>", value: 100 },
    { id: "target", name: "Target", value: 80 },
  ];
  const links = [
    {
      id: "edge",
      source: 0,
      target: 1,
      value: 80,
      isDrillable: true,
    },
  ];

  it("builds Sankey options, labels, and escaped tooltips", async () => {
    const instance = createMockChart();
    const factory = createMockEcharts(instance);
    render(() => (
      <SankeyChart
        echarts={factory}
        nodes={nodes}
        links={links}
        nodeWidth={12}
        nodePadding={14}
      />
    ));
    await waitFor(() => expect(instance.setOption).toHaveBeenCalled());
    const options = instance.setOption.mock.calls[0][0] as any;
    expect(options.series[0].type).toBe("sankey");
    expect(options.series[0].nodeWidth).toBe(12);
    expect(options.series[0].nodeGap).toBe(14);
    expect(options.series[0].links[0]).toEqual({
      source: "Source <script>",
      target: "Target",
      value: 80,
    });
    expect(
      options.series[0].label.formatter({
        name: "Source <script>",
      }),
    ).toContain("{value|100}");
    const tooltip = options.tooltip.formatter({
      dataType: "node",
      name: "Source <script>",
      color: "#4290F0",
    });
    expect(tooltip).toContain("Source &lt;script&gt;");
    expect(tooltip).not.toContain("<script>");
  });

  it("maps node and link click events back to source data", async () => {
    const instance = createMockChart();
    const factory = createMockEcharts(instance);
    const nodeClick = vi.fn();
    const linkClick = vi.fn();
    render(() => (
      <SankeyChart
        echarts={factory}
        nodes={nodes}
        links={links}
        onNodeClick={nodeClick}
        onLinkClick={linkClick}
      />
    ));
    await waitFor(() =>
      expect(eventHandler(instance, "click")).toBeTypeOf("function"),
    );
    const click = eventHandler(instance, "click")!;
    click({
      dataType: "node",
      name: "Source <script>",
      componentType: "series",
    });
    click({
      dataType: "edge",
      data: {
        source: "Source <script>",
        target: "Target",
      },
      value: 80,
      componentType: "series",
    });
    expect(nodeClick).toHaveBeenCalledWith(nodes[0]);
    expect(linkClick).toHaveBeenCalledWith(links[0]);
  });

  it("sanitizes unsafe CSS colors", () => {
    expect(sanitizeColor("#abc")).toBe("#abc");
    expect(sanitizeColor("rgba(1,2,3,0.5)")).toBe("rgba(1,2,3,0.5)");
    expect(sanitizeColor("red;position:fixed")).toBe("#666");
  });
});

describe("TimeseriesChart", () => {
  const data = [
    {
      name: "Requests",
      color: "#4290F0",
      data: [
        [1, 10],
        [2, 20],
      ] as [number, number][],
    },
  ];

  it("shows and closes the cursor tooltip outside chart bounds", async () => {
    const instance = createMockChart();
    const factory = createMockEcharts(instance);
    render(() => <TimeseriesChart echarts={factory} data={data} />);
    await waitFor(() =>
      expect(eventHandler(instance, "updateaxispointer")).toBeTypeOf(
        "function",
      ),
    );
    eventHandler(
      instance,
      "updateaxispointer",
    )?.({
      axesInfo: [{ value: 1 }],
    });
    expect(await screen.findByText("Requests")).not.toBeNull();
    const trigger = document.querySelector(
      "[data-base-ui-tooltip-trigger]",
    ) as HTMLElement;
    trigger.getBoundingClientRect = () => new DOMRect(0, 0, 100, 100);
    fireEvent.mouseMove(window, { clientX: 101, clientY: 50 });
    await waitFor(() => expect(screen.queryByText("Requests")).toBeNull());
  });

  it("reactivates brush selection after notMerge updates", async () => {
    const instance = createMockChart();
    const factory = createMockEcharts(instance);
    function Example() {
      const [rows, setRows] = createSignal(data);
      return (
        <>
          <button
            type="button"
            onClick={() =>
              setRows([
                {
                  ...data[0],
                  data: [
                    [1, 10],
                    [2, 20],
                    [3, 30],
                  ],
                },
              ])
            }
          >
            Update
          </button>
          <TimeseriesChart
            echarts={factory}
            data={rows()}
            onTimeRangeChange={vi.fn()}
            optionUpdateBehavior={{ notMerge: true }}
          />
        </>
      );
    }
    render(() => <Example />);
    await waitFor(() =>
      expect(instance.dispatchAction).toHaveBeenCalledWith({
        type: "takeGlobalCursor",
        key: "brush",
        brushOption: {
          brushType: "lineX",
          brushMode: "single",
        },
      }),
    );
    instance.dispatchAction.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Update" }));
    await waitFor(() =>
      expect(instance.dispatchAction).toHaveBeenCalledWith({
        type: "takeGlobalCursor",
        key: "brush",
        brushOption: {
          brushType: "lineX",
          brushMode: "single",
        },
      }),
    );
  });

  it("renders an accessible chart-shaped loading skeleton", () => {
    const factory = createMockEcharts();
    render(() => (
      <TimeseriesChart
        echarts={factory}
        data={data}
        type="bar"
        loading
        height={220}
      />
    ));
    expect(
      screen.getByRole("status", { name: "Loading chart" }),
    ).not.toBeNull();
    expect(document.querySelectorAll("clipPath rect")).toHaveLength(24);
    expect(factory.init).not.toHaveBeenCalled();
  });
});

describe("ChartPalette", () => {
  it("wraps categorical colors and returns defensive map scales", () => {
    expect(ChartPalette.categorical(6)).toBe(ChartPalette.categorical(0));
    const first = ChartPalette.mapColors();
    const second = ChartPalette.mapColors();
    first.scale[0] = "changed";
    expect(second.scale[0]).not.toBe("changed");
  });
});
