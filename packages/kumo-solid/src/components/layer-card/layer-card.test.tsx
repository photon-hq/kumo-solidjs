import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vite-plus/test";
import { LayerCard, layerCardVariants } from "./layer-card";

describe("LayerCard", () => {
  it("renders direct content as a simple surface", () => {
    render(() => (
      <LayerCard className="custom-card" data-testid="card">
        Content
      </LayerCard>
    ));
    const card = screen.getByTestId("card");

    expect(card.className).toContain("bg-kumo-base");
    expect(card.className).toContain("ring-kumo-line");
    expect(card.className).toContain("custom-card");
    expect(card.className).not.toContain("bg-kumo-elevated");
  });

  it("detects compound sections, including through a fragment", () => {
    render(() => (
      <LayerCard data-testid="card">
        <>
          <LayerCard.Secondary data-testid="secondary">
            Header
          </LayerCard.Secondary>
          <LayerCard.Primary data-testid="primary">Content</LayerCard.Primary>
        </>
      </LayerCard>
    ));
    const card = screen.getByTestId("card");

    expect(card.className).toContain("bg-kumo-elevated");
    expect(screen.getByTestId("secondary").className).toContain(
      "text-kumo-subtle",
    );
    expect(screen.getByTestId("primary").className).toContain("ring-kumo-fill");
  });

  it("passes attributes and refs through sections and supports render", () => {
    let ref: HTMLDivElement | undefined;
    render(() => (
      <LayerCard render="section" data-testid="card">
        <LayerCard.Primary
          ref={(element) => (ref = element)}
          aria-label="primary section"
        >
          Content
        </LayerCard.Primary>
      </LayerCard>
    ));

    expect(screen.getByTestId("card").tagName).toBe("SECTION");
    expect(ref).toBe(screen.getByLabelText("primary section"));
  });

  it("reacts when compound sections are conditionally introduced", () => {
    const [structured, setStructured] = createSignal(false);
    render(() => (
      <>
        <LayerCard data-testid="card">
          {structured() ? (
            <LayerCard.Primary>Structured</LayerCard.Primary>
          ) : (
            "Simple"
          )}
        </LayerCard>
        <button type="button" onClick={() => setStructured(true)}>
          Change
        </button>
      </>
    ));

    const card = screen.getByTestId("card");
    expect(card.className).toContain("ring-kumo-line");
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(card.className).toContain("ring-kumo-hairline");
    expect(screen.getByText("Structured")).not.toBeNull();
  });

  it("preserves the surface variant helper", () => {
    expect(layerCardVariants()).toContain("shadow-xs");
    expect(layerCardVariants()).toContain("ring-kumo-line");
  });
});
