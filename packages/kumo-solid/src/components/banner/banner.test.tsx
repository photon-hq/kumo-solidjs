import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { Link } from "../link";
import { Banner, KUMO_BANNER_DEFAULT_VARIANTS, bannerVariants } from "./banner";

describe("Banner", () => {
  it("matches the Kumo variant and size contract", () => {
    expect(KUMO_BANNER_DEFAULT_VARIANTS).toEqual({
      variant: "default",
      size: "base",
    });
    expect(bannerVariants({ variant: "secondary" })).toContain(
      "bg-kumo-contrast/5",
    );
    expect(bannerVariants({ size: "sm" })).toContain("items-center");
    expect(bannerVariants({ size: "sm" })).not.toContain("items-start");
  });

  it("forwards root props and supports structured and legacy content", () => {
    const { unmount } = render(() => (
      <Banner
        role="status"
        data-testid="banner"
        aria-live="polite"
        title="System status"
        description="Everything is healthy"
      />
    ));

    const banner = screen.getByTestId("banner");
    expect(banner.getAttribute("role")).toBe("status");
    expect(banner.getAttribute("aria-live")).toBe("polite");
    expect(screen.getByText("System status").tagName).toBe("P");
    expect(screen.getByText("Everything is healthy").tagName).toBe("P");

    unmount();
    render(() => <Banner text="Legacy notice" />);
    expect(screen.getByText("Legacy notice").tagName).toBe("P");
  });

  it("styles primary, secondary, and ghost actions from banner context", () => {
    render(() => (
      <>
        <Banner
          variant="error"
          title="Save failed"
          action={<Banner.Action data-testid="primary">Retry</Banner.Action>}
        />
        <Banner
          variant="error"
          title="Save failed"
          action={
            <Banner.Action variant="secondary" data-testid="secondary">
              Retry
            </Banner.Action>
          }
        />
        <Banner
          variant="alert"
          title="Session expiring"
          action={
            <Banner.Action variant="ghost" data-testid="ghost">
              Dismiss
            </Banner.Action>
          }
        />
      </>
    ));

    const primary = screen.getByTestId("primary");
    expect(primary.className).toContain("bg-(--kumo-button-emphasis-bg)");
    expect(
      primary.style.getPropertyValue("--kumo-button-emphasis-gradient-end"),
    ).toBe("var(--color-kumo-danger)");
    expect(screen.getByTestId("secondary").className).toContain(
      "ring-kumo-danger/50",
    );
    expect(screen.getByTestId("ghost").className).toContain(
      "hover:bg-kumo-warning/10",
    );
  });

  it("inherits xs action sizing from compact banners", () => {
    render(() => (
      <Banner
        size="sm"
        title="Heads up"
        action={<Banner.Action data-testid="cta">Details</Banner.Action>}
      />
    ));

    const cta = screen.getByTestId("cta");
    expect(cta.className).toContain("h-5");
    expect(cta.className).toContain("px-1.5");
  });

  it("renders compact title and description inline", () => {
    render(() => (
      <Banner size="sm" title="Heads up" description="More details here" />
    ));

    const title = screen.getByText("Heads up");
    const description = screen.getByText("More details here");
    expect(title.tagName).toBe("SPAN");
    expect(description.tagName).toBe("SPAN");
    expect(title.parentElement).toBe(description.parentElement);
    expect(title.parentElement?.className).toContain("items-baseline");
  });

  it("renders a Kumo Link inline but keeps button actions trailing", () => {
    const { container } = render(() => (
      <>
        <Banner
          size="sm"
          description="A DNS record already exists."
          action={
            <Link href="#manage" data-testid="link-action">
              Manage DNS
            </Link>
          }
        />
        <Banner
          size="sm"
          description="Another DNS record already exists."
          action={
            <Banner.Action data-testid="button-action">
              Manage DNS
            </Banner.Action>
          }
        />
      </>
    ));

    const link = screen.getByTestId("link-action");
    expect(link.parentElement?.className).toContain("ml-1.5");
    expect(link.parentElement?.parentElement).toBe(
      screen.getByText("A DNS record already exists."),
    );
    expect(
      screen.getByTestId("button-action").parentElement?.className,
    ).toContain("shrink-0");
    expect(
      container.querySelectorAll('[data-kumo-component="Button"]'),
    ).toHaveLength(1);
  });

  it("keeps variants, content, and action callbacks reactive", () => {
    const [variant, setVariant] = createSignal<"default" | "error">("default");
    const [title, setTitle] = createSignal("Initial");
    const onClick = vi.fn();

    render(() => (
      <Banner
        variant={variant()}
        title={title()}
        action={<Banner.Action onClick={onClick}>Act</Banner.Action>}
      />
    ));

    setVariant("error");
    setTitle("Updated");
    const action = screen.getByRole("button", { name: "Act" });
    expect(screen.getByText("Updated")).toBeTruthy();
    expect(
      action.style.getPropertyValue("--kumo-button-emphasis-gradient-end"),
    ).toBe("var(--color-kumo-danger)");
    fireEvent.click(action);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
