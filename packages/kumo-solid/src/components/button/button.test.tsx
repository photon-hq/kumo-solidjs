import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import {
  LinkProvider,
  type LinkComponentProps,
} from "../../utils/link-provider";
import { Button, LinkButton, RefreshButton, buttonVariants } from "./button";

const TestIcon = () => <svg data-testid="test-icon" />;

describe("Button", () => {
  it("wraps text children and defaults to type button", () => {
    render(() => <Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });

    expect(button.getAttribute("type")).toBe("button");
    expect(button.querySelector("span.contents")?.textContent).toBe("Save");
    expect(button.dataset.kumoComponent).toBe("Button");
  });

  it("renders a component icon without an empty text wrapper", () => {
    render(() => (
      <Button shape="square" icon={TestIcon} aria-label="Add item" />
    ));
    const button = screen.getByRole("button", { name: "Add item" });

    expect(screen.getByTestId("test-icon")).toBeTruthy();
    expect(button.querySelector("span.contents")).toBeNull();
  });

  it("keeps loading state reactive and disables interaction", () => {
    const [loading, setLoading] = createSignal(false);
    render(() => (
      <Button icon={TestIcon} loading={loading()}>
        Submit
      </Button>
    ));

    const button = screen.getByRole("button");
    expect(screen.queryByRole("status")).toBeNull();
    expect(button.hasAttribute("disabled")).toBe(false);

    setLoading(true);
    expect(screen.getByRole("status", { name: "Loading" })).toBeTruthy();
    expect(screen.queryByTestId("test-icon")).toBeNull();
    expect(button.hasAttribute("disabled")).toBe(true);

    setLoading(false);
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByTestId("test-icon")).toBeTruthy();
  });

  it("forwards DOM props, ref, and click handlers", () => {
    let ref: HTMLButtonElement | undefined;
    const onClick = vi.fn();
    render(() => (
      <Button ref={(element) => (ref = element)} onClick={onClick}>
        Click
      </Button>
    ));

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(ref).toBe(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("uses title as an icon-only accessible name and tooltip trigger", () => {
    render(() => <Button shape="square" icon={TestIcon} title="Remove item" />);
    const button = screen.getByRole("button", { name: "Remove item" });

    expect(button.getAttribute("title")).toBeNull();
    expect(button.dataset.baseUiTooltipTrigger).toBe("");
  });

  it("wraps a disabled titled button in an enabled tooltip trigger", () => {
    render(() => (
      <Button disabled title="Unavailable">
        Save
      </Button>
    ));
    const button = screen.getByRole("button", { name: "Save" });
    const trigger = button.parentElement;

    expect(button.hasAttribute("disabled")).toBe(true);
    expect(trigger?.tagName).toBe("SPAN");
    expect(trigger?.dataset.baseUiTooltipTrigger).toBe("");
    expect(trigger?.hasAttribute("disabled")).toBe(false);
  });

  it("preserves emphasis ring styling", () => {
    for (const variant of ["primary", "destructive"] as const) {
      const classes = buttonVariants({ variant });
      expect(classes).toContain("ring-(--kumo-button-emphasis-ring)");
      expect(classes).toContain("focus:ring-(--kumo-button-emphasis-ring)");
      expect(classes).toContain(
        "focus-visible:ring-(--kumo-button-emphasis-ring)",
      );
    }
  });
});

describe("RefreshButton", () => {
  it("provides the default accessible label", () => {
    render(() => <RefreshButton />);
    expect(screen.getByRole("button", { name: "Refresh" })).toBeTruthy();
  });
});

describe("LinkButton", () => {
  it("renders a native anchor and external link attributes", () => {
    render(() => (
      <LinkButton href="https://example.com" external>
        Docs
      </LinkButton>
    ));
    const link = screen.getByRole("link", { name: "Docs" });

    expect(link.getAttribute("href")).toBe("https://example.com");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("uses a configured Solid routing component", () => {
    const RouterLink = (props: LinkComponentProps) => (
      <a
        href={props.href}
        data-router-to={props.to}
        class={props.class}
        data-testid="router-link"
      >
        {props.children}
      </a>
    );

    render(() => (
      <LinkProvider component={RouterLink}>
        <LinkButton href="/workers">Workers</LinkButton>
      </LinkProvider>
    ));

    expect(screen.getByTestId("router-link").dataset.routerTo).toBe("/workers");
  });

  it("renders a disabled button and strips anchor-only props", () => {
    render(() => (
      <LinkButton
        href="/home"
        target="_blank"
        rel="noopener"
        download=""
        disabled
      >
        Home
      </LinkButton>
    ));
    const button = screen.getByRole("button", { name: "Home" });

    expect(button.dataset.kumoComponent).toBe("LinkButton");
    expect(button.hasAttribute("href")).toBe(false);
    expect(button.hasAttribute("target")).toBe(false);
    expect(button.hasAttribute("rel")).toBe(false);
    expect(button.hasAttribute("download")).toBe(false);
  });
});
