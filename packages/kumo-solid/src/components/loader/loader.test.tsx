import { render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vite-plus/test";
import { Loader, loaderVariants, KUMO_LOADER_DEFAULT_VARIANTS } from "./loader";
import { SkeletonLine } from "./skeleton-line";

describe("Loader", () => {
  it("maps the Kumo presets to their pixel sizes", () => {
    expect(KUMO_LOADER_DEFAULT_VARIANTS.size).toBe("base");
    expect(loaderVariants({ size: "sm" })).toBe(16);
    expect(loaderVariants()).toBe(24);
    expect(loaderVariants({ size: "lg" })).toBe(32);
    expect(loaderVariants({ size: 19 })).toBe(19);
  });

  it("renders an accessible animated status", () => {
    render(() => <Loader className="custom-loader" />);

    const loader = screen.getByRole("status", { name: "Loading" });
    expect(loader.tagName).toBe("svg");
    expect(loader.classList.contains("custom-loader")).toBe(true);
    expect(loader.querySelector("animateTransform")).toBeTruthy();
  });

  it("keeps size and accessible label reactive", () => {
    const [size, setSize] = createSignal<"sm" | "lg">("sm");
    const [label, setLabel] = createSignal("Loading workers");

    render(() => <Loader size={size()} aria-label={label()} />);

    const loader = screen.getByRole("status");
    expect(loader.style.width).toBe("16px");

    setSize("lg");
    setLabel("Refreshing workers");

    expect(loader.style.width).toBe("32px");
    expect(loader.getAttribute("aria-label")).toBe("Refreshing workers");
  });
});

describe("SkeletonLine", () => {
  it("renders values within the requested ranges", () => {
    const { container } = render(() => (
      <SkeletonLine
        minWidth={40}
        maxWidth={50}
        minDuration={1}
        maxDuration={2}
        minDelay={0.1}
        maxDelay={0.2}
      />
    ));

    const line = container.querySelector(".skeleton-line") as HTMLElement;
    const width = Number.parseInt(
      line.style.getPropertyValue("--skeleton-width"),
      10,
    );
    const duration = Number.parseFloat(
      line.style.getPropertyValue("--shimmer-duration"),
    );
    const delay = Number.parseFloat(
      line.style.getPropertyValue("--shimmer-delay"),
    );

    expect(width).toBeGreaterThanOrEqual(40);
    expect(width).toBeLessThanOrEqual(50);
    expect(duration).toBeGreaterThanOrEqual(1);
    expect(duration).toBeLessThanOrEqual(2);
    expect(delay).toBeGreaterThanOrEqual(0.1);
    expect(delay).toBeLessThanOrEqual(0.2);
  });

  it("wraps the line when blockHeight is provided", () => {
    const { container } = render(() => <SkeletonLine blockHeight={48} />);
    const wrapper = container.firstElementChild as HTMLElement;

    expect(wrapper.className).toBe("flex items-center");
    expect(wrapper.style.height).toBe("48px");
    expect(wrapper.querySelector(".skeleton-line")).toBeTruthy();
  });
});
