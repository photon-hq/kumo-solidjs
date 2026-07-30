import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { Badge, badgeVariants, KUMO_BADGE_VARIANTS } from "./badge";

describe("Badge", () => {
  it("renders children in a span and merges className", () => {
    render(() => <Badge className="my-custom">Active</Badge>);
    const badge = screen.getByText("Active");

    expect(badge.tagName).toBe("SPAN");
    expect(badge.className).toContain("my-custom");
  });

  it("applies filled variant classes without a dot by default", () => {
    render(() => <Badge variant="error">Error</Badge>);
    const badge = screen.getByText("Error");

    expect(badge.className).toContain("bg-kumo-danger-tint");
    expect(badge.querySelector("[aria-hidden]")).toBeNull();
  });

  it("uses dot appearance classes and the semantic dot color", () => {
    render(() => (
      <Badge variant="success" appearance="dot">
        Healthy
      </Badge>
    ));
    const badge = screen.getByText("Healthy").closest("span")!;
    const dot = badge.querySelector("[aria-hidden='true']");

    expect(badge.className).toContain("bg-transparent");
    expect(badge.className).not.toContain("bg-kumo-success-tint");
    expect(dot?.className).toContain("bg-kumo-success");
    expect(dot?.getAttribute("aria-hidden")).toBe("true");
  });

  it.each([
    ["success", "bg-kumo-success"],
    ["warning", "bg-kumo-badge-orange"],
    ["error", "bg-kumo-badge-red"],
    ["neutral", "bg-kumo-badge-neutral"],
  ] as const)("maps %s to %s in dot appearance", (variant, expected) => {
    render(() => (
      <Badge variant={variant} appearance="dot">
        Status
      </Badge>
    ));

    expect(
      screen.getByText("Status").querySelector("[aria-hidden='true']")
        ?.className,
    ).toContain(expected);
  });

  it("does not render a dot for unsupported variants", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(() => (
      <Badge variant="primary" appearance="dot">
        No dot
      </Badge>
    ));

    expect(
      screen.getByText("No dot").querySelector("[aria-hidden='true']"),
    ).toBeNull();
    warn.mockRestore();
  });

  it("reacts when variant and appearance accessors change", () => {
    const [variant, setVariant] = createSignal<"success" | "error">("success");
    const [appearance, setAppearance] = createSignal<"filled" | "dot">(
      "filled",
    );
    render(() => (
      <>
        <Badge variant={variant()} appearance={appearance()}>
          Status
        </Badge>
        <button
          type="button"
          onClick={() => {
            setVariant("error");
            setAppearance("dot");
          }}
        >
          Change
        </button>
      </>
    ));

    const badge = screen.getByText("Status");
    expect(badge.className).toContain("bg-kumo-success-tint");

    fireEvent.click(screen.getByRole("button", { name: "Change" }));

    expect(badge.className).not.toContain("bg-kumo-success-tint");
    expect(badge.querySelector("[aria-hidden='true']")?.className).toContain(
      "bg-kumo-badge-red",
    );
  });
});

describe("badgeVariants", () => {
  it("preserves the React variant behavior and runtime fallbacks", () => {
    expect(badgeVariants()).toContain("rounded-full");
    expect(badgeVariants({ variant: "success" })).toContain(
      "bg-kumo-success-tint",
    );
    expect(
      badgeVariants({ variant: "success", appearance: "dot" }),
    ).not.toContain("bg-kumo-success-tint");

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(badgeVariants({ variant: "invalid" as never })).toBe(
      badgeVariants(),
    );
    warn.mockRestore();
  });

  it("keeps every variant entry machine-readable", () => {
    for (const [dimension, entries] of Object.entries(KUMO_BADGE_VARIANTS)) {
      for (const [key, entry] of Object.entries(entries)) {
        expect(entry.classes, `${dimension}.${key}.classes`).toBeDefined();
        expect(typeof entry.description).toBe("string");
      }
    }
  });
});
