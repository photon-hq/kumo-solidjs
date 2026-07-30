import { render } from "@solidjs/testing-library";
import { createSignal, type Component } from "solid-js";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import {
  useTableOfContentsActiveId,
  type UseTableOfContentsActiveIdResult,
} from "./use-table-of-contents-active-id";

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  observed: Element[] = [];

  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit,
  ) {
    MockIntersectionObserver.instances.push(this);
  }

  observe(element: Element) {
    this.observed.push(element);
  }

  disconnect() {
    this.observed = [];
  }

  intersect(changes: [Element, boolean][]) {
    this.callback(
      changes.map(
        ([target, isIntersecting]) =>
          ({ target, isIntersecting }) as IntersectionObserverEntry,
      ),
      this as unknown as IntersectionObserver,
    );
  }
}

function addSections(ids: string[]) {
  return ids.map((id) => {
    const element = document.createElement("h2");
    element.id = id;
    document.body.append(element);
    return element;
  });
}

function mountHook(factory: () => UseTableOfContentsActiveIdResult): {
  result: () => UseTableOfContentsActiveIdResult;
  unmount: () => void;
} {
  let value: UseTableOfContentsActiveIdResult | undefined;
  const Harness: Component = () => {
    value = factory();
    return null;
  };
  const mounted = render(() => <Harness />);
  return {
    result: () => {
      if (!value) throw new Error("Hook did not initialize");
      return value;
    },
    unmount: mounted.unmount,
  };
}

function latestObserver() {
  const observer = MockIntersectionObserver.instances.at(-1);
  if (!observer) throw new Error("No IntersectionObserver was created");
  return observer;
}

describe("useTableOfContentsActiveId", () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    window.location.hash = "";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("tracks the topmost intersecting section and keeps the last active id", () => {
    const [one, two] = addSections(["one", "two"]);
    const hook = mountHook(() =>
      useTableOfContentsActiveId({ ids: ["one", "two"] }),
    );

    expect(latestObserver().observed).toEqual([one, two]);
    latestObserver().intersect([[two, true]]);
    expect(hook.result().activeId()).toBe("two");
    latestObserver().intersect([[one, true]]);
    expect(hook.result().activeId()).toBe("one");
    latestObserver().intersect([
      [one, false],
      [two, false],
    ]);
    expect(hook.result().activeId()).toBe("one");
  });

  it("uses offset and rebuilds the observer when reactive ids change", () => {
    const [, two] = addSections(["one", "two"]);
    const [ids, setIds] = createSignal(["one"]);
    mountHook(() =>
      useTableOfContentsActiveId({ ids, offset: 64, trackHash: false }),
    );

    const first = latestObserver();
    expect(first.options?.rootMargin).toBe("-64px 0px 0px 0px");
    setIds(["one", "two"]);
    expect(first.observed).toEqual([]);
    expect(latestObserver()).not.toBe(first);
    expect(latestObserver().observed).toContain(two);
  });

  it("pins explicit selection until scrolling settles", () => {
    vi.useFakeTimers();
    try {
      const [one] = addSections(["one", "two"]);
      const hook = mountHook(() =>
        useTableOfContentsActiveId({
          ids: ["one", "two"],
          trackHash: false,
        }),
      );

      hook.result().selectSection("two");
      latestObserver().intersect([[one, true]]);
      expect(hook.result().activeId()).toBe("two");

      vi.advanceTimersByTime(200);
      latestObserver().intersect([[one, true]]);
      expect(hook.result().activeId()).toBe("one");
    } finally {
      vi.useRealTimers();
    }
  });

  it("tracks known hashes and cleans up pending work", () => {
    vi.useFakeTimers();
    try {
      addSections(["one", "two"]);
      window.location.hash = "#two";
      const hook = mountHook(() =>
        useTableOfContentsActiveId({ ids: ["one", "two"] }),
      );
      expect(hook.result().activeId()).toBe("two");

      window.location.hash = "#one";
      window.dispatchEvent(new Event("hashchange"));
      expect(hook.result().activeId()).toBe("one");
      expect(() => {
        hook.unmount();
        window.dispatchEvent(new Event("scroll"));
        vi.advanceTimersByTime(1000);
      }).not.toThrow();
    } finally {
      vi.useRealTimers();
    }
  });
});
