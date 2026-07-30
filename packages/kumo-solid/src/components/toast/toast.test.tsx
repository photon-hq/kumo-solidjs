import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@solidjs/testing-library";
import { onMount } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { KumoPortalProvider } from "../../utils/portal-provider";
import {
  KUMO_TOAST_DEFAULT_VARIANTS,
  KUMO_TOAST_STYLING,
  KUMO_TOAST_VARIANTS,
  Toasty,
  createKumoToastManager,
  toastVariants,
  useKumoToastManager,
} from "./toast";

describe("Toasty", () => {
  it("preserves the Kumo variant and styling contract", () => {
    expect(KUMO_TOAST_DEFAULT_VARIANTS.variant).toBe("default");
    expect(Object.keys(KUMO_TOAST_VARIANTS.variant)).toEqual([
      "default",
      "success",
      "error",
      "warning",
      "info",
    ]);
    expect(KUMO_TOAST_STYLING.container.width).toBe(300);
    expect(toastVariants()).toContain("rounded-xl");
    expect(toastVariants({ variant: "success" })).toContain(
      "ring-kumo-success",
    );
    expect(toastVariants({ variant: "error" })).toContain("ring-kumo-danger");
  });

  it("accepts in-tree dispatch without an external manager", async () => {
    function TriggerOnMount() {
      const manager = useKumoToastManager();
      onMount(() => {
        manager.add({ title: "from inside", timeout: 0 });
      });
      return null;
    }

    render(() => (
      <Toasty>
        <TriggerOnMount />
      </Toasty>
    ));

    const title = await screen.findByText("from inside");
    const root = title.closest('[data-kumo-part="root"]');
    expect(root?.getAttribute("role")).toBe("dialog");
    expect(root?.getAttribute("data-kumo-component")).toBe("Toasty");
    expect(screen.getByRole("region").getAttribute("aria-label")).toBe(
      "1 notification (F6)",
    );
  });

  it("dispatches outside the Solid tree through an external manager", async () => {
    const manager = createKumoToastManager();
    render(() => (
      <Toasty toastManager={manager}>
        <div>Application</div>
      </Toasty>
    ));

    manager.add({
      title: "from outside",
      description: "External notification",
      timeout: 0,
    });

    expect(await screen.findByText("from outside")).toBeTruthy();
    expect(screen.getByText("External notification")).toBeTruthy();
  });

  it("updates and bumps one toast when an id is dispatched twice", async () => {
    const manager = createKumoToastManager();
    render(() => (
      <Toasty toastManager={manager}>
        <div />
      </Toasty>
    ));

    manager.add({
      id: "deployment",
      title: "Deployment queued",
      timeout: 0,
    });
    manager.add({
      id: "deployment",
      title: "Deployment started",
      timeout: 0,
    });

    expect(await screen.findByText("Deployment started")).toBeTruthy();
    expect(screen.queryByText("Deployment queued")).toBeNull();
    expect(
      document.querySelectorAll('[data-toast-id="deployment"]'),
    ).toHaveLength(1);
    await waitFor(() =>
      expect(
        document.querySelector('[data-toast-id="deployment"]')?.className,
      ).toContain("animate-toast-bump"),
    );
  });

  it("converges external and in-tree dispatch on one provider", async () => {
    const manager = createKumoToastManager();
    let inTreeAdd:
      | ((options: { title: string; timeout: number }) => string)
      | undefined;

    function CaptureManager() {
      const inTreeManager = useKumoToastManager();
      inTreeAdd = inTreeManager.add;
      return null;
    }

    render(() => (
      <Toasty toastManager={manager}>
        <CaptureManager />
      </Toasty>
    ));

    manager.add({ title: "external toast", timeout: 0 });
    inTreeAdd?.({ title: "in-tree toast", timeout: 0 });

    expect(await screen.findByText("external toast")).toBeTruthy();
    expect(screen.getByText("in-tree toast")).toBeTruthy();
    expect(document.querySelectorAll('[data-kumo-part="root"]')).toHaveLength(
      2,
    );
  });

  it("renders every semantic variant with its icon and tint", async () => {
    const manager = createKumoToastManager();
    render(() => (
      <Toasty toastManager={manager}>
        <div />
      </Toasty>
    ));

    for (const variant of ["success", "error", "warning", "info"] as const) {
      manager.add({
        id: variant,
        title: `${variant} toast`,
        variant,
        timeout: 0,
      });
    }

    for (const variant of ["success", "error", "warning", "info"] as const) {
      const title = await screen.findByText(`${variant} toast`);
      const root = title.closest(`[data-toast-id="${variant}"]`) as HTMLElement;
      expect(root.querySelector("[data-toast-icon]")).toBeTruthy();
      expect(root.className).toContain(
        variant === "error" ? "ring-kumo-danger" : `ring-kumo-${variant}`,
      );
      expect(
        root.querySelector("[data-toast-background]")?.className,
      ).toContain(
        variant === "error"
          ? "bg-kumo-danger-tint/50"
          : `bg-kumo-${variant}-tint`,
      );
    }
  });

  it("supports title-only, description-only, and custom content", async () => {
    const manager = createKumoToastManager();
    render(() => (
      <Toasty toastManager={manager}>
        <div />
      </Toasty>
    ));

    manager.add({
      id: "title",
      title: "Title only",
      timeout: 0,
    });
    manager.add({
      id: "description",
      description: "Description only",
      timeout: 0,
    });
    manager.add({
      id: "custom",
      content: "Custom content",
      timeout: 0,
    });

    expect(await screen.findByText("Title only")).toBeTruthy();
    expect(screen.getByText("Description only")).toBeTruthy();
    const custom = screen.getByText("Custom content");
    expect(
      custom
        .closest("[data-toast-content]")
        ?.querySelector("[data-toast-title]"),
    ).toBeNull();
  });

  it("runs actions and closes with the accessible close button", async () => {
    const manager = createKumoToastManager();
    const onUndo = vi.fn();
    render(() => (
      <Toasty toastManager={manager}>
        <div />
      </Toasty>
    ));

    manager.add({
      id: "action",
      title: "Record deleted",
      actions: [{ children: "Undo", onClick: onUndo }],
      timeout: 0,
    });

    const title = await screen.findByText("Record deleted");
    const root = title.closest('[data-kumo-part="root"]') as HTMLElement;
    fireEvent.click(within(root).getByRole("button", { name: "Undo" }));
    expect(onUndo).toHaveBeenCalledOnce();

    fireEvent.click(within(root).getByRole("button", { name: "Close" }));
    await waitFor(() =>
      expect(screen.queryByText("Record deleted")).toBeNull(),
    );
    expect(screen.getByRole("region").getAttribute("aria-label")).toBe(
      "0 notifications (F6)",
    );
  });

  it("reacts to updates and resolves promise notifications", async () => {
    const manager = createKumoToastManager();
    render(() => (
      <Toasty toastManager={manager}>
        <div />
      </Toasty>
    ));

    const id = manager.add({
      title: "Waiting",
      variant: "info",
      timeout: 0,
    });
    expect(await screen.findByText("Waiting")).toBeTruthy();

    manager.update(id, {
      title: "Updated",
      variant: "warning",
    });
    const updated = await screen.findByText("Updated");
    expect(updated.closest('[data-kumo-part="root"]')?.className).toContain(
      "ring-kumo-warning",
    );

    let resolvePromise: ((value: string) => void) | undefined;
    const pending = new Promise<string>((resolve) => {
      resolvePromise = resolve;
    });
    const handled = manager.promise(pending, {
      loading: {
        title: "Saving",
        variant: "info",
        timeout: 0,
      },
      success: (value) => ({
        title: `Saved ${value}`,
        variant: "success",
        timeout: 0,
      }),
      error: () => ({
        title: "Save failed",
        variant: "error",
        timeout: 0,
      }),
    });

    expect(await screen.findByText("Saving")).toBeTruthy();
    resolvePromise?.("settings");
    await expect(handled).resolves.toBe("settings");
    expect(await screen.findByText("Saved settings")).toBeTruthy();
  });

  it("uses high-priority semantics and the portal provider or override", async () => {
    const contextContainer = document.createElement("div");
    const overrideContainer = document.createElement("div");
    document.body.append(contextContainer, overrideContainer);
    const contextManager = createKumoToastManager();
    const overrideManager = createKumoToastManager();
    const result = render(() => (
      <KumoPortalProvider container={contextContainer}>
        <Toasty toastManager={contextManager}>
          <div />
        </Toasty>
        <Toasty toastManager={overrideManager} container={overrideContainer}>
          <div />
        </Toasty>
      </KumoPortalProvider>
    ));

    contextManager.add({
      title: "Urgent context toast",
      priority: "high",
      timeout: 0,
    });
    overrideManager.add({
      title: "Override toast",
      timeout: 0,
    });

    const urgent = await screen.findByText("Urgent context toast");
    expect(
      urgent.closest('[data-kumo-part="root"]')?.getAttribute("role"),
    ).toBe("alertdialog");
    expect(contextContainer.textContent).toContain("Urgent context toast");
    expect(overrideContainer.textContent).toContain("Override toast");
    expect(contextContainer.textContent).not.toContain("Override toast");

    result.unmount();
    contextContainer.remove();
    overrideContainer.remove();
  });
});
