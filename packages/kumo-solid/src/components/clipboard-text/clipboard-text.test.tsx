import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import {
  ClipboardText,
  KUMO_CLIPBOARD_TEXT_DEFAULT_VARIANTS,
  clipboardTextVariants,
} from "./clipboard-text";

describe("ClipboardText", () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("matches Kumo's default size and visible structure", () => {
    render(() => <ClipboardText text="sk_live_abc123" />);

    expect(KUMO_CLIPBOARD_TEXT_DEFAULT_VARIANTS.size).toBe("lg");
    expect(clipboardTextVariants()).toContain("font-mono");
    expect(screen.getByText("sk_live_abc123")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Copy to clipboard" }),
    ).toBeTruthy();
  });

  it("copies text and announces copied state", async () => {
    const onCopy = vi.fn();
    render(() => <ClipboardText text="token-value" onCopy={onCopy} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy to clipboard" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("token-value"));
    expect(screen.getByText("Copied")).toBeTruthy();
    expect(onCopy).toHaveBeenCalledOnce();
  });

  it("copies textToCopy and supports localized action labels", async () => {
    render(() => (
      <ClipboardText
        text="visible-text"
        textToCopy="hidden-secret-value"
        labels={{ copyAction: "Copy secret" }}
      />
    ));

    fireEvent.click(screen.getByRole("button", { name: "Copy secret" }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("hidden-secret-value"),
    );
  });

  it("resets feedback from the most recent click", async () => {
    vi.useFakeTimers();
    render(() => <ClipboardText text="token-value" />);
    const button = screen.getByRole("button", { name: "Copy to clipboard" });

    fireEvent.click(button);
    await Promise.resolve();
    expect(screen.getByText("Copied")).toBeTruthy();

    await vi.advanceTimersByTimeAsync(1_000);
    fireEvent.click(button);
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(1_000);
    expect(screen.getByText("Copied")).toBeTruthy();

    await vi.advanceTimersByTimeAsync(500);
    expect(screen.queryByText("Copied")).toBeNull();
  });

  it("shows one anchored toast and remounts its bump animation", async () => {
    vi.useFakeTimers();
    render(() => (
      <ClipboardText
        text="npx kumo add button"
        tooltip={{ text: "Copy", copiedText: "Copied!", side: "top" }}
      />
    ));
    const button = screen.getByRole("button", { name: "Copy to clipboard" });

    fireEvent.click(button);
    await Promise.resolve();
    expect(screen.getAllByText("Copied!").length).toBeGreaterThanOrEqual(1);
    expect(document.querySelector(".animate-clipboard-toast-bump")).toBeNull();

    await vi.advanceTimersByTimeAsync(1_000);
    fireEvent.click(button);
    await Promise.resolve();
    const secondToast = document.querySelector(".animate-clipboard-toast-bump");
    expect(secondToast).toBeTruthy();
    expect(
      document.querySelectorAll(".animate-clipboard-toast-bump"),
    ).toHaveLength(1);

    fireEvent.click(button);
    await Promise.resolve();
    const thirdToast = document.querySelector(".animate-clipboard-toast-bump");
    expect(thirdToast).toBeTruthy();
    expect(thirdToast).not.toBe(secondToast);
  });

  it("shows hover tooltip text before copying", async () => {
    render(() => (
      <ClipboardText text="abc123" tooltip={{ text: "Copy token" }} />
    ));
    const button = screen.getByRole("button", { name: "Copy to clipboard" });

    fireEvent.mouseEnter(button);
    fireEvent.mouseMove(button);
    expect(await screen.findByText("Copy token")).toBeTruthy();
  });

  it("does not announce or call onCopy when clipboard access fails", async () => {
    const onCopy = vi.fn();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    writeText.mockRejectedValue(new Error("denied"));
    render(() => <ClipboardText text="token-value" onCopy={onCopy} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy to clipboard" }));
    await waitFor(() => expect(warn).toHaveBeenCalled());

    expect(screen.queryByText("Copied")).toBeNull();
    expect(onCopy).not.toHaveBeenCalled();
  });
});
