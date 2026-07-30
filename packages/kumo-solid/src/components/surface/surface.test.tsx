import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { Surface, surfaceVariants, KUMO_SURFACE_VARIANTS } from "./surface";

describe("Surface", () => {
  it("preserves the compatibility wrapper output", () => {
    render(() => (
      <Surface
        color="secondary"
        className="custom-surface"
        data-testid="surface"
      >
        Content
      </Surface>
    ));
    const surface = screen.getByTestId("surface");

    expect(surface.tagName).toBe("DIV");
    expect(surface.className).toContain("overflow-visible");
    expect(surface.className).toContain("rounded-none");
    expect(surface.className).toContain("custom-surface");
    expect(surface.dataset.surfaceColor).toBe("secondary");
    expect(surface.dataset.deprecated).toBe("surface");
  });

  it("supports the deprecated as prop and prefers render", () => {
    const { unmount } = render(() => (
      <Surface as="section" data-testid="surface">
        Section
      </Surface>
    ));
    expect(screen.getByTestId("surface").tagName).toBe("SECTION");

    unmount();
    render(() => (
      <Surface as="section" render="article" data-testid="surface">
        Article
      </Surface>
    ));
    expect(screen.getByTestId("surface").tagName).toBe("ARTICLE");
  });

  it("keeps color and classes reactive", () => {
    const [color, setColor] = createSignal<"primary" | "secondary">("primary");
    const [className, setClassName] = createSignal("first");
    render(() => (
      <>
        <Surface
          color={color()}
          className={className()}
          data-testid="surface"
        />
        <button
          type="button"
          onClick={() => {
            setColor("secondary");
            setClassName("second");
          }}
        >
          Change
        </button>
      </>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(screen.getByTestId("surface").dataset.surfaceColor).toBe(
      "secondary",
    );
    expect(screen.getByTestId("surface").className).toContain("second");
  });

  it("preserves variant metadata and invalid-value fallback", () => {
    expect(Object.keys(KUMO_SURFACE_VARIANTS.color)).toEqual([
      "primary",
      "secondary",
    ]);
    expect(surfaceVariants()).toBe("");

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(surfaceVariants({ color: "invalid" as never })).toBe("");
    warn.mockRestore();
  });
});
