import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal, splitProps, type JSX } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { LinkProvider, type LinkComponentProps } from "../../utils";
import { Link, linkVariants, KUMO_LINK_VARIANTS } from "./link";

describe("Link", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders an anchor with default styles and native attributes", () => {
    render(() => (
      <Link
        href="https://example.com"
        target="_blank"
        rel="noopener noreferrer"
        className="custom-link"
      >
        External
      </Link>
    ));
    const link = screen.getByRole("link", { name: "External" });

    expect(link.getAttribute("href")).toBe("https://example.com");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("data-kumo-component")).toBe("Link");
    expect(link.className).toContain("underline");
    expect(link.className).toContain("custom-link");
  });

  it("renders all variants and the external icon", () => {
    render(() => (
      <Link href="/docs" variant="plain">
        Docs <Link.ExternalIcon data-testid="external-icon" />
      </Link>
    ));

    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.className).not.toContain("underline");
    expect(
      screen.getByTestId("external-icon").getAttribute("aria-hidden"),
    ).toBe("true");
  });

  it("uses the configured LinkProvider component", () => {
    function RouterLink(inputProps: LinkComponentProps) {
      const [props, rest] = splitProps(inputProps, ["href", "to"]);
      return <a href={props.href ?? props.to} data-router="true" {...rest} />;
    }

    render(() => (
      <LinkProvider component={RouterLink}>
        <Link href="/dashboard">Dashboard</Link>
      </LinkProvider>
    ));

    const link = screen.getByRole("link", { name: "Dashboard" });
    expect(link.getAttribute("href")).toBe("/dashboard");
    expect(link.getAttribute("data-router")).toBe("true");
  });

  it("lets render bypass LinkProvider using the Solid render callback", () => {
    function ProviderLink(inputProps: LinkComponentProps) {
      return <a data-provider="true" {...inputProps} />;
    }

    render(() => (
      <LinkProvider component={ProviderLink}>
        <Link
          href="/direct"
          render={(renderProps: JSX.HTMLAttributes<HTMLAnchorElement>) => (
            <a data-direct="true" {...renderProps} />
          )}
        >
          Direct
        </Link>
      </LinkProvider>
    ));

    const link = screen.getByRole("link", { name: "Direct" });
    expect(link.getAttribute("data-direct")).toBe("true");
    expect(link.getAttribute("data-provider")).toBeNull();
  });

  it("keeps href, variant, content, and ref reactive", () => {
    const [href, setHref] = createSignal("/one");
    const [variant, setVariant] = createSignal<"inline" | "current">("inline");
    const [content, setContent] = createSignal("One");
    let ref: HTMLAnchorElement | undefined;
    render(() => (
      <>
        <Link
          ref={(element) => (ref = element)}
          href={href()}
          variant={variant()}
        >
          {content()}
        </Link>
        <button
          type="button"
          onClick={() => {
            setHref("/two");
            setVariant("current");
            setContent("Two");
          }}
        >
          Change
        </button>
      </>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    const link = screen.getByRole("link", { name: "Two" });
    expect(ref).toBe(link);
    expect(link.getAttribute("href")).toBe("/two");
    expect(link.className).toContain("text-current");
  });

  it("retains `to` compatibility and warns only for deprecated usage", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { unmount } = render(() => <Link to="/legacy">Legacy</Link>);
    expect(
      screen.getByRole("link", { name: "Legacy" }).getAttribute("href"),
    ).toBe("/legacy");
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("The `to` prop is deprecated"),
    );

    unmount();
    warn.mockClear();
    render(() => <Link href="/modern">Modern</Link>);
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("link metadata", () => {
  it("preserves classes, defaults, and invalid-value fallback", () => {
    expect(KUMO_LINK_VARIANTS.variant.inline.classes).toContain(
      "text-kumo-link",
    );
    expect(linkVariants({ variant: "current" })).toContain("text-current");
    expect(linkVariants({ variant: "plain" })).not.toContain("underline");

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(linkVariants({ variant: "invalid" as never })).toBe(linkVariants());
    warn.mockRestore();
  });
});
