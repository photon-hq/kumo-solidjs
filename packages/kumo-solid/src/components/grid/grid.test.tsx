import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import {
  Grid,
  GridItem,
  gridItemVariants,
  gridVariants,
  KUMO_GRID_VARIANTS,
} from "./grid";

describe("Grid", () => {
  it("renders variants, gaps, attributes, classes, and refs", () => {
    let ref: HTMLDivElement | undefined;
    render(() => (
      <Grid
        ref={(element) => (ref = element)}
        variant="3up"
        gap="sm"
        className="custom-grid"
        data-testid="grid"
      >
        <GridItem className="custom-item">One</GridItem>
      </Grid>
    ));

    const grid = screen.getByTestId("grid");
    expect(ref).toBe(grid);
    expect(grid.className).toContain("md:grid-cols-2");
    expect(grid.className).toContain("lg:grid-cols-3");
    expect(grid.className).toContain("gap-3");
    expect(grid.className).toContain("custom-grid");
    expect(screen.getByText("One").className).toContain("custom-item");
  });

  it("applies mobile dividers only to items inside a 4up grid", () => {
    const { unmount } = render(() => (
      <Grid variant="4up" mobileDivider>
        <GridItem>Divided</GridItem>
      </Grid>
    ));
    expect(screen.getByText("Divided").className).toContain(
      "border-kumo-hairline",
    );

    unmount();
    render(() => (
      <Grid variant="3up" mobileDivider>
        <GridItem>Not divided</GridItem>
      </Grid>
    ));
    expect(screen.getByText("Not divided").className).not.toContain(
      "border-kumo-hairline",
    );
  });

  it("keeps root and context-derived item styles reactive", () => {
    const [variant, setVariant] = createSignal<"3up" | "4up">("3up");
    const [gap, setGap] = createSignal<"none" | "lg">("none");
    render(() => (
      <>
        <Grid variant={variant()} gap={gap()} mobileDivider>
          <GridItem>Reactive item</GridItem>
        </Grid>
        <button
          type="button"
          onClick={() => {
            setVariant("4up");
            setGap("lg");
          }}
        >
          Change
        </button>
      </>
    ));

    const item = screen.getByText("Reactive item");
    expect(item.className).not.toContain("border-kumo-hairline");
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(item.parentElement?.className).toContain("gap-8");
    expect(item.className).toContain("border-kumo-hairline");
  });
});

describe("grid metadata", () => {
  it("preserves every layout and runtime fallback", () => {
    expect(Object.keys(KUMO_GRID_VARIANTS.variant)).toHaveLength(9);
    expect(gridVariants({ variant: "2-1" })).toContain(
      "md:grid-cols-[2fr_1fr]",
    );
    expect(gridItemVariants({ variant: "4up", mobileDivider: true })).toContain(
      "border-kumo-hairline",
    );

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(gridVariants({ variant: "invalid" as never })).toContain(
      "grid-cols-1 md:grid-cols-2",
    );
    warn.mockRestore();
  });
});
