import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { KumoPortalProvider } from "../../utils/portal-provider";
import {
  Dialog,
  KUMO_DIALOG_DEFAULT_VARIANTS,
  KUMO_DIALOG_STYLING,
  KUMO_DIALOG_VARIANTS,
  dialogVariants,
} from "./dialog";

function BasicDialog(props: { onOpenChange?: (open: boolean) => void }) {
  return (
    <Dialog.Root onOpenChange={props.onOpenChange}>
      <Dialog.Trigger>Open dialog</Dialog.Trigger>
      <Dialog class="custom-dialog">
        <Dialog.Title>Deployment settings</Dialog.Title>
        <Dialog.Description>Configure this deployment.</Dialog.Description>
        <Dialog.Close>Close dialog</Dialog.Close>
      </Dialog>
    </Dialog.Root>
  );
}

describe("Dialog", () => {
  it("preserves the Kumo variant and styling contract", () => {
    expect(KUMO_DIALOG_DEFAULT_VARIANTS).toEqual({
      size: "base",
      role: "dialog",
    });
    expect(Object.keys(KUMO_DIALOG_VARIANTS.size)).toEqual([
      "base",
      "sm",
      "lg",
      "xl",
    ]);
    expect(KUMO_DIALOG_STYLING.dimensions.xl.width).toBe(768);
    expect(dialogVariants()).toContain("sm:w-96");
    expect(dialogVariants({ size: "sm" })).toContain("sm:w-72");
    expect(dialogVariants({ size: "lg" })).toContain("sm:w-[32rem]");
    expect(dialogVariants({ size: "xl" })).toContain("sm:w-[48rem]");
  });

  it("renders a closed accessible trigger without dialog content", () => {
    render(() => <BasicDialog />);

    const trigger = screen.getByRole("button", {
      name: "Open dialog",
    });
    expect(trigger.getAttribute("data-kumo-component")).toBe("Dialog");
    expect(trigger.getAttribute("data-kumo-part")).toBe("trigger");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(screen.queryByText("Deployment settings")).toBeNull();
  });

  it("opens, labels, describes, styles, and closes the dialog", async () => {
    const onOpenChange = vi.fn();
    render(() => <BasicDialog onOpenChange={onOpenChange} />);

    const trigger = screen.getByRole("button", {
      name: "Open dialog",
    });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = await screen.findByRole("dialog");
    const title = screen.getByText("Deployment settings");
    const description = screen.getByText("Configure this deployment.");
    expect(dialog.getAttribute("aria-labelledby")).toBe(title.id);
    expect(dialog.getAttribute("aria-describedby")).toBe(description.id);
    expect(dialog.getAttribute("data-kumo-component")).toBe("Dialog");
    expect(dialog.getAttribute("data-kumo-part")).toBe("content");
    expect(dialog.className).toContain("bg-kumo-base");
    expect(dialog.className).toContain("sm:w-96");
    expect(dialog.className).toContain("custom-dialog");
    expect(
      document.querySelector('[role="presentation"].bg-kumo-recessed'),
    ).toBeTruthy();
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it("keeps controlled open state reactive", async () => {
    const [open, setOpen] = createSignal(false);
    const onOpenChange = vi.fn((nextOpen: boolean) => setOpen(nextOpen));
    render(() => (
      <Dialog.Root open={open()} onOpenChange={onOpenChange}>
        <Dialog.Trigger>Controlled trigger</Dialog.Trigger>
        <Dialog>
          <Dialog.Title>Controlled dialog</Dialog.Title>
        </Dialog>
      </Dialog.Root>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Controlled trigger" }));
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(true);
    expect(await screen.findByText("Controlled dialog")).toBeTruthy();

    setOpen(false);
    await waitFor(() =>
      expect(screen.queryByText("Controlled dialog")).toBeNull(),
    );
  });

  it("supports custom trigger and close renders with class aliases", async () => {
    render(() => (
      <Dialog.Root>
        <Dialog.Trigger
          className="custom-trigger"
          render={(renderProps) => <a {...renderProps} href="#custom-dialog" />}
        >
          Custom trigger
        </Dialog.Trigger>
        <Dialog size="xl" className="custom-content">
          <Dialog.Title className="custom-title">Custom dialog</Dialog.Title>
          <Dialog.Description class="custom-description">
            Custom description
          </Dialog.Description>
          <Dialog.Close
            className="custom-close"
            render={(renderProps) => (
              <button {...renderProps} data-testid="custom-close" />
            )}
          >
            Custom close
          </Dialog.Close>
        </Dialog>
      </Dialog.Root>
    ));

    const trigger = screen.getByRole("button", {
      name: "Custom trigger",
    });
    expect(trigger.tagName).toBe("A");
    expect(trigger.getAttribute("href")).toBe("#custom-dialog");
    expect(trigger.hasAttribute("type")).toBe(false);
    expect(trigger.className).toContain("custom-trigger");

    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog");
    expect(dialog.className).toContain("sm:w-[48rem]");
    expect(dialog.className).toContain("custom-content");
    expect(screen.getByText("Custom dialog").className).toContain(
      "custom-title",
    );
    expect(screen.getByText("Custom description").className).toContain(
      "custom-description",
    );

    const close = screen.getByTestId("custom-close");
    expect(close.getAttribute("type")).toBe("button");
    expect(close.className).toContain("custom-close");
    fireEvent.click(close);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("keeps standard dialogs open when pointer dismissal is disabled", () => {
    const onOpenChange = vi.fn();
    render(() => (
      <div data-testid="outside">
        <Dialog.Root
          defaultOpen
          modal={false}
          disablePointerDismissal
          onOpenChange={onOpenChange}
        >
          <Dialog>
            <Dialog.Title>Persistent dialog</Dialog.Title>
          </Dialog>
        </Dialog.Root>
      </div>
    ));

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("uses alert-dialog semantics and requires an explicit close", async () => {
    const onOpenChange = vi.fn();
    render(() => (
      <div data-testid="alert-outside">
        <Dialog.Root role="alertdialog" defaultOpen onOpenChange={onOpenChange}>
          <Dialog>
            <Dialog.Title>Delete deployment?</Dialog.Title>
            <Dialog.Description>
              This action cannot be undone.
            </Dialog.Description>
            <Dialog.Close>Cancel deletion</Dialog.Close>
          </Dialog>
        </Dialog.Root>
      </div>
    ));

    const alertDialog = await screen.findByRole("alertdialog");
    expect(alertDialog).toBeTruthy();
    fireEvent.mouseDown(screen.getByTestId("alert-outside"));
    expect(screen.getByRole("alertdialog")).toBeTruthy();
    expect(onOpenChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Cancel deletion" }));
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  });

  it("closes a standard dialog on Escape", async () => {
    const onOpenChange = vi.fn();
    render(() => (
      <Dialog.Root defaultOpen onOpenChange={onOpenChange}>
        <Dialog>
          <Dialog.Title>Keyboard dialog</Dialog.Title>
        </Dialog>
      </Dialog.Root>
    ));

    expect(await screen.findByRole("dialog")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
    expect(onOpenChange.mock.calls[0]?.[2]).toBe("escape-key");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("uses the Kumo portal context and content override", async () => {
    const contextContainer = document.createElement("div");
    const overrideContainer = document.createElement("div");
    document.body.append(contextContainer, overrideContainer);
    const result = render(() => (
      <KumoPortalProvider container={contextContainer}>
        <Dialog.Root defaultOpen>
          <Dialog>
            <Dialog.Title>Context dialog</Dialog.Title>
          </Dialog>
        </Dialog.Root>
        <Dialog.Root defaultOpen>
          <Dialog container={overrideContainer}>
            <Dialog.Title>Override dialog</Dialog.Title>
          </Dialog>
        </Dialog.Root>
      </KumoPortalProvider>
    ));

    await screen.findByText("Context dialog");
    expect(contextContainer.textContent).toContain("Context dialog");
    expect(overrideContainer.textContent).toContain("Override dialog");

    result.unmount();
    contextContainer.remove();
    overrideContainer.remove();
  });
});
