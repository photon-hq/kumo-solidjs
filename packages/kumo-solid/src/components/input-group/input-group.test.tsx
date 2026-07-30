import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal, type Component } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { detectFocusMode, INPUT_GROUP_SIZE } from "./context";
import {
  InputGroup,
  KUMO_INPUT_GROUP_DEFAULT_VARIANTS,
  KUMO_INPUT_GROUP_VARIANTS,
} from "./input-group";

const MockIcon: Component<{ size?: number }> = (props) => (
  <svg data-testid="mock-icon" data-size={props.size ?? "none"} />
);

describe("InputGroup", () => {
  it("renders addons, input, suffix, and Field association", () => {
    const { container } = render(() => (
      <InputGroup label="Subdomain">
        <InputGroup.Addon>@</InputGroup.Addon>
        <InputGroup.Input placeholder="worker" />
        <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
      </InputGroup>
    ));

    expect(screen.getByText("@")).not.toBeNull();
    expect(screen.getByText(".workers.dev")).not.toBeNull();
    expect(screen.getByRole("textbox", { name: "Subdomain" })).not.toBeNull();
    expect(
      container.querySelector("div[data-slot='input-group']"),
    ).not.toBeNull();
    expect(container.querySelector("label label")).toBeNull();
  });

  it("uses a label container for standalone container mode", () => {
    const { container } = render(() => (
      <InputGroup>
        <InputGroup.Addon>@</InputGroup.Addon>
        <InputGroup.Input aria-label="Username" />
      </InputGroup>
    ));

    const group = container.querySelector(
      "label[data-slot='input-group']",
    ) as HTMLLabelElement;
    const input = screen.getByRole("textbox", { name: "Username" });
    fireEvent.click(group);
    expect(document.activeElement).toBe(input);
    expect(group.getAttribute("data-focus-mode")).toBe("container");
  });

  it("renders compact addon buttons, handles clicks, and sizes icons", () => {
    const onClick = vi.fn();
    const { container } = render(() => (
      <InputGroup size="base">
        <InputGroup.Input aria-label="Search" />
        <InputGroup.Addon align="end">
          <InputGroup.Button
            icon={MockIcon}
            tooltip="Search help"
            onClick={onClick}
          />
        </InputGroup.Addon>
      </InputGroup>
    ));

    const button = screen.getByRole("button", { name: "Search help" });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByTestId("mock-icon").getAttribute("data-size")).toBe(
      String(INPUT_GROUP_SIZE.base.iconSize),
    );
    expect(button.className).toContain("h-6.5");
    expect(
      container
        .querySelector("[data-slot='input-group']")
        ?.getAttribute("data-focus-mode"),
    ).toBe("container");
  });

  it("auto-detects individual mode for direct non-ghost buttons", () => {
    const { container } = render(() => (
      <InputGroup>
        <InputGroup.Button variant="secondary">Previous</InputGroup.Button>
        <InputGroup.Input aria-label="Page" />
        <InputGroup.Button variant="secondary">Next</InputGroup.Button>
      </InputGroup>
    ));

    const group = container.querySelector(
      "[data-slot='input-group']",
    ) as HTMLElement;
    expect(group.tagName).toBe("DIV");
    expect(group.getAttribute("data-focus-mode")).toBe("individual");
    expect(group.className).toContain("overflow-visible");
    expect(screen.getByRole("textbox").className).toContain("border-kumo-line");
    expect(screen.getByRole("button", { name: "Next" }).className).toContain(
      "h-full!",
    );
  });

  it("partitions addons and input from direct buttons in hybrid mode", () => {
    const { container } = render(() => (
      <InputGroup>
        <InputGroup.Addon>@</InputGroup.Addon>
        <InputGroup.Input aria-label="Email" />
        <InputGroup.Button variant="secondary">Submit</InputGroup.Button>
      </InputGroup>
    ));

    const group = container.querySelector(
      "[data-slot='input-group']",
    ) as HTMLElement;
    const zone = container.querySelector(
      "[data-slot='input-group-container-zone']",
    ) as HTMLElement;
    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: "Submit" });

    expect(group.getAttribute("data-focus-mode")).toBe("hybrid");
    expect(zone.contains(input)).toBe(true);
    expect(zone.contains(screen.getByText("@"))).toBe(true);
    expect(zone.contains(button)).toBe(false);
    expect(button.className).toContain("h-full!");
    expect(zone.className).toContain("border-kumo-line");
  });

  it("inherits disabled, error, required, and description state", () => {
    const { unmount } = render(() => (
      <InputGroup
        label="Email"
        disabled
        error={{ message: "Invalid email", match: true }}
      >
        <InputGroup.Input type="email" defaultValue="invalid" />
      </InputGroup>
    ));
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveProperty("disabled", true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Invalid email")).not.toBeNull();
    expect(
      input.closest("[data-slot='input-group']")?.getAttribute("data-disabled"),
    ).toBe("");

    unmount();
    render(() => (
      <InputGroup
        label="Password"
        required={false}
        description="At least eight characters"
      >
        <InputGroup.Input type="password" />
      </InputGroup>
    ));
    expect(screen.getByText("(optional)")).not.toBeNull();
    expect(screen.getByText("At least eight characters")).not.toBeNull();
  });

  it("keeps context size and disabled state reactive", () => {
    const [large, setLarge] = createSignal(false);
    render(() => (
      <>
        <InputGroup size={large() ? "lg" : "xs"} disabled={large()}>
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input aria-label="Reactive" />
        </InputGroup>
        <button type="button" onClick={() => setLarge(true)}>
          Change
        </button>
      </>
    ));

    const input = screen.getByRole("textbox", { name: "Reactive" });
    expect(input.className).toContain("px-1.5");
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(input.className).toContain("px-4");
    expect(input).toHaveProperty("disabled", true);
  });

  it("supports legacy Label and Description aliases", () => {
    render(() => (
      <InputGroup>
        <InputGroup.Label>@</InputGroup.Label>
        <InputGroup.Input aria-label="Legacy" />
        <InputGroup.Description>.example.com</InputGroup.Description>
      </InputGroup>
    ));

    expect(screen.getByText("@")).not.toBeNull();
    expect(screen.getByText(".example.com")).not.toBeNull();
  });

  it("warns when a subcomponent is rendered outside the root", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(() => <InputGroup.Input aria-label="Orphan" />);
    expect(warn).toHaveBeenCalledWith(
      "<InputGroup.Input> must be used within <InputGroup>. Falling back to default values.",
    );
    warn.mockRestore();
  });
});

describe("InputGroup focus detection", () => {
  it("distinguishes container, individual, and hybrid layouts", () => {
    expect(
      detectFocusMode([
        <InputGroup.Addon>@</InputGroup.Addon>,
        <InputGroup.Input aria-label="One" />,
      ]),
    ).toBe("container");
    expect(
      detectFocusMode([
        <InputGroup.Input aria-label="Two" />,
        <InputGroup.Button variant="secondary">Go</InputGroup.Button>,
      ]),
    ).toBe("individual");
    expect(
      detectFocusMode([
        <InputGroup.Addon>@</InputGroup.Addon>,
        <InputGroup.Input aria-label="Three" />,
        <InputGroup.Button variant="primary">Go</InputGroup.Button>,
      ]),
    ).toBe("hybrid");
  });

  it("preserves metadata and static directional padding tokens", () => {
    expect(KUMO_INPUT_GROUP_DEFAULT_VARIANTS).toEqual({ size: "base" });
    expect(KUMO_INPUT_GROUP_VARIANTS.size.lg.classes).toBe("h-11 text-base");
    for (const size of ["xs", "sm", "base", "lg"] as const) {
      expect(INPUT_GROUP_SIZE[size].addonOuterStart).toMatch(/^pl-/);
      expect(INPUT_GROUP_SIZE[size].addonOuterEnd).toMatch(/^pr-/);
    }
  });
});
