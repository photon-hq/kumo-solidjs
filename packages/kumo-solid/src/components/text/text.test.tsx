import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vite-plus/test";
import { Text } from "./text";

describe("Text", () => {
  it("renders body copy as a paragraph by default", () => {
    const { container } = render(() => <Text>Body copy</Text>);

    expect(container.querySelector("p")?.textContent).toBe("Body copy");
  });

  it.each([
    ["heading1", "h1"],
    ["heading2", "h2"],
    ["heading3", "h3"],
  ] as const)("renders %s using the required %s element", (variant, as) => {
    const { container } = render(() => (
      <Text variant={variant} as={as}>
        Heading
      </Text>
    ));

    expect(container.querySelector(as)?.textContent).toBe("Heading");
  });

  it.each([
    "span",
    "dt",
    "dd",
    "label",
    "code",
    "pre",
    "li",
    "figcaption",
    "legend",
    "em",
    "strong",
    "small",
    "abbr",
    "time",
  ] as const)("supports the %s semantic override", (as) => {
    const { container } = render(() => <Text as={as}>Content</Text>);

    expect(container.querySelector(as)?.textContent).toBe("Content");
  });

  it("preserves Kumo typography modifiers and DOM props", () => {
    render(() => (
      <Text
        variant="secondary"
        size="sm"
        bold
        truncate
        DANGEROUS_className="custom"
        id="copy"
        data-testid="copy"
      >
        Copy
      </Text>
    ));
    const text = screen.getByTestId("copy");

    expect(text.id).toBe("copy");
    expect(text.className).toContain("text-kumo-subtle");
    expect(text.className).toContain("text-sm");
    expect(text.className).toContain("font-medium");
    expect(text.className).toContain("truncate");
    expect(text.className).toContain("custom");
  });

  it("uses optically smaller monospace sizing", () => {
    const { container } = render(() => (
      <>
        <Text variant="mono">Default mono</Text>
        <Text variant="mono" size="lg">
          Large mono
        </Text>
      </>
    ));
    const [defaultMono, largeMono] = Array.from(
      container.querySelectorAll("span"),
    );

    expect(defaultMono.className).toContain("text-sm");
    expect(largeMono.className).toContain("text-base");
  });

  it("forwards its ref to the selected element", () => {
    let element: HTMLElement | undefined;
    render(() => (
      <Text as="label" ref={(next) => (element = next)}>
        Label
      </Text>
    ));

    expect(element).toBe(screen.getByText("Label"));
  });

  it("reacts to variant, size, and element changes", () => {
    const [alternate, setAlternate] = createSignal(false);
    const { container } = render(() => (
      <>
        <Text
          variant={alternate() ? "error" : "secondary"}
          size={alternate() ? "lg" : "sm"}
          as={alternate() ? "span" : "p"}
        >
          Reactive copy
        </Text>
        <button type="button" onClick={() => setAlternate(true)}>
          Change
        </button>
      </>
    ));

    expect(container.querySelector("p")?.className).toContain(
      "text-kumo-subtle",
    );

    fireEvent.click(screen.getByRole("button", { name: "Change" }));

    expect(container.querySelector("p")).toBeNull();
    expect(container.querySelector("span")?.className).toContain(
      "text-kumo-danger",
    );
    expect(container.querySelector("span")?.className).toContain("text-lg");
  });
});
