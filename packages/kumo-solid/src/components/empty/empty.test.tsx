import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { Empty, emptyVariants, KUMO_EMPTY_VARIANTS } from "./empty";

describe("Empty", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders optional content and exact default styling", () => {
    render(() => (
      <Empty
        icon={<span data-testid="icon">Icon</span>}
        title="No projects"
        description="Create your first project."
        contents={<a href="/new">Create one</a>}
        className="custom-empty"
      />
    ));

    const title = screen.getByRole("heading", { name: "No projects" });
    expect(title.parentElement?.className).toContain("px-10");
    expect(title.parentElement?.className).toContain("py-16");
    expect(title.parentElement?.className).toContain("custom-empty");
    expect(screen.getByTestId("icon")).not.toBeNull();
    expect(screen.getByText("Create your first project.")).not.toBeNull();
    expect(
      screen.getByRole("link", { name: "Create one" }).getAttribute("href"),
    ).toBe("/new");
  });

  it("copies a command and resets its visual state", () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(() => (
      <Empty title="No packages" commandLine="pnpm add @cloudflare/kumo" />
    ));

    const button = screen.getByRole("button", { name: "Copy command" });
    fireEvent.click(button);
    expect(writeText).toHaveBeenCalledWith("pnpm add @cloudflare/kumo");
    expect(button.querySelector(".animate-bounce-in")).not.toBeNull();

    vi.advanceTimersByTime(1000);
    expect(button.querySelector(".animate-bounce-in")).toBeNull();
  });

  it("keeps content, size, and command availability reactive", () => {
    const [large, setLarge] = createSignal(false);
    render(() => (
      <>
        <Empty
          size={large() ? "lg" : "sm"}
          title={large() ? "Large" : "Small"}
          commandLine={large() ? "pnpm build" : undefined}
        />
        <button type="button" onClick={() => setLarge(true)}>
          Change
        </button>
      </>
    ));

    const root = screen.getByRole("heading", { name: "Small" }).parentElement!;
    expect(root.className).toContain("px-6");
    expect(screen.queryByRole("button", { name: "Copy command" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(root.className).toContain("px-12");
    expect(screen.getByRole("heading", { name: "Large" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Copy command" })).not.toBeNull();
  });
});

describe("empty metadata", () => {
  it("preserves sizes, defaults, and invalid-value fallback", () => {
    expect(Object.keys(KUMO_EMPTY_VARIANTS.size)).toEqual(["sm", "base", "lg"]);
    expect(emptyVariants()).toContain("px-10 py-16 gap-6");
    expect(emptyVariants({ size: "lg" })).toContain("px-12 py-20 gap-8");

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(emptyVariants({ size: "invalid" as never })).toBe(emptyVariants());
    warn.mockRestore();
  });
});
