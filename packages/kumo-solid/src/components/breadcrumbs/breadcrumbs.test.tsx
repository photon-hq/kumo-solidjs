import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@solidjs/testing-library";
import type { JSX } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { LinkProvider, type LinkComponentProps } from "../../utils";
import {
  Breadcrumbs,
  KUMO_BREADCRUMBS_DEFAULT_VARIANTS,
  breadcrumbsVariants,
} from "./breadcrumbs";

describe("Breadcrumbs", () => {
  it("uses the same default size and styling contract as React Kumo", () => {
    expect(KUMO_BREADCRUMBS_DEFAULT_VARIANTS.size).toBe("base");
    expect(breadcrumbsVariants()).toContain("text-base");
    expect(breadcrumbsVariants({ size: "sm" })).toContain("text-sm");
  });

  it("renders the complete desktop trail and compact mobile trail", () => {
    const { container } = render(() => (
      <Breadcrumbs>
        <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
        <Breadcrumbs.Separator />
        <Breadcrumbs.Link href="/docs">Docs</Breadcrumbs.Link>
        <Breadcrumbs.Separator />
        <Breadcrumbs.Link href="/projects">Projects</Breadcrumbs.Link>
        <Breadcrumbs.Separator />
        <Breadcrumbs.Current>Current Project</Breadcrumbs.Current>
      </Breadcrumbs>
    ));

    const nav = screen.getByRole("navigation", { name: "breadcrumb" });
    const mobile = nav.firstElementChild as HTMLElement;
    const desktop = nav.lastElementChild as HTMLElement;

    expect(within(desktop).getAllByRole("link")).toHaveLength(3);
    expect(desktop.textContent).toContain("Home");
    expect(desktop.textContent).toContain("Docs");
    expect(desktop.textContent).toContain("Projects");
    expect(desktop.textContent).toContain("Current Project");
    expect(within(mobile).getAllByRole("link")).toHaveLength(1);
    expect(mobile.textContent).not.toContain("Home");
    expect(mobile.textContent).not.toContain("Docs");
    expect(mobile.textContent).toContain("...");
    expect(mobile.textContent).toContain("Projects");
    expect(mobile.textContent).toContain("Current Project");
    expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(2);
  });

  it("uses LinkProvider adapters with href-based Solid navigation props", () => {
    function RouterLink(props: LinkComponentProps): JSX.Element {
      return <a {...props} data-router-link="" href={`/app${props.href}`} />;
    }

    render(() => (
      <LinkProvider component={RouterLink}>
        <Breadcrumbs>
          <Breadcrumbs.Link href="/settings">Settings</Breadcrumbs.Link>
          <Breadcrumbs.Current>Profile</Breadcrumbs.Current>
        </Breadcrumbs>
      </LinkProvider>
    ));

    const links = screen.getAllByRole("link", { name: "Settings" });
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute("href")).toBe("/app/settings");
    expect(links[0].hasAttribute("data-router-link")).toBe(true);
  });

  it("copies deeplinks and exposes copied feedback", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(() => (
      <Breadcrumbs>
        <Breadcrumbs.Current>Section</Breadcrumbs.Current>
        <Breadcrumbs.Clipboard text="#section" />
      </Breadcrumbs>
    ));

    const copyButtons = screen.getAllByRole("button", { name: "Copy" });
    fireEvent.click(copyButtons[0]);

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("#section"));
    expect(copyButtons[0].querySelector(".text-kumo-success")).not.toBeNull();
  });

  it("renders loading current crumbs with deterministic skeletons", () => {
    const { container } = render(() => (
      <Breadcrumbs size="sm" className="custom-breadcrumbs">
        <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
        <Breadcrumbs.Separator />
        <Breadcrumbs.Current loading />
      </Breadcrumbs>
    ));

    const nav = screen.getByRole("navigation", { name: "breadcrumb" });
    expect(nav.className).toContain("custom-breadcrumbs");
    expect(nav.className).toContain("text-sm");
    expect(container.querySelectorAll(".skeleton-line")).toHaveLength(2);
  });
});
