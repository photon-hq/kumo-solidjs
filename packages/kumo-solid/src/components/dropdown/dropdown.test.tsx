import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { KumoPortalProvider } from "../../utils/portal-provider";
import {
  DropdownMenu,
  KUMO_DROPDOWN_DEFAULT_VARIANTS,
  KUMO_DROPDOWN_VARIANTS,
  dropdownVariants,
} from "./dropdown";

function TestIcon(props: { class?: string }) {
  return <svg data-testid="test-icon" class={props.class} />;
}

function BasicMenu(props: {
  onOpenChange?: (open: boolean) => void;
  onEdit?: () => void;
}) {
  return (
    <DropdownMenu onOpenChange={props.onOpenChange}>
      <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={props.onEdit}>Edit</DropdownMenu.Item>
        <DropdownMenu.Item variant="danger">Delete</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

describe("DropdownMenu", () => {
  it("preserves the Kumo variant contract", () => {
    expect(KUMO_DROPDOWN_DEFAULT_VARIANTS.variant).toBe("default");
    expect(Object.keys(KUMO_DROPDOWN_VARIANTS.variant)).toEqual([
      "default",
      "danger",
    ]);
    expect(dropdownVariants()).toBe("");
    expect(dropdownVariants({ variant: "danger" })).toContain(
      "text-kumo-danger",
    );
  });

  it("renders a closed accessible trigger without menu content", () => {
    render(() => <BasicMenu />);

    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.getAttribute("data-kumo-component")).toBe("DropdownMenu");
    expect(screen.queryByText("Edit")).toBeNull();
  });

  it("opens, styles, activates, and closes menu items", async () => {
    const onOpenChange = vi.fn();
    const onEdit = vi.fn();
    render(() => <BasicMenu onOpenChange={onOpenChange} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    const menu = await screen.findByRole("menu");
    expect(menu.className).toContain("bg-kumo-control");
    expect(menu.className).toContain("ring-kumo-line");
    expect(menu.getAttribute("data-kumo-part")).toBe("content");
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(true);

    const dangerItem = screen.getByRole("menuitem", {
      name: "Delete",
    });
    expect(dangerItem.className).toContain("text-kumo-danger");

    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledOnce();
    expect(onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("supports keyboard navigation and Escape focus restoration", async () => {
    render(() => (
      <DropdownMenu>
        <DropdownMenu.Trigger>Keyboard actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>First action</DropdownMenu.Item>
          <DropdownMenu.Item>Second action</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    ));

    const trigger = screen.getByRole("button", {
      name: "Keyboard actions",
    });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const first = await screen.findByRole("menuitem", {
      name: "First action",
    });
    const second = screen.getByRole("menuitem", {
      name: "Second action",
    });
    await waitFor(() => expect(document.activeElement).toBe(first));

    fireEvent.keyDown(first, { key: "ArrowDown" });
    await waitFor(() => expect(document.activeElement).toBe(second));
    fireEvent.keyDown(second, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it("keeps controlled open state reactive", async () => {
    const [open, setOpen] = createSignal(false);
    const onOpenChange = vi.fn((nextOpen: boolean) => setOpen(nextOpen));
    render(() => (
      <DropdownMenu open={open()} onOpenChange={onOpenChange}>
        <DropdownMenu.Trigger>Controlled actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Controlled item</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Controlled actions" }));
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(true);
    expect(await screen.findByText("Controlled item")).toBeTruthy();

    setOpen(false);
    await waitFor(() =>
      expect(screen.queryByText("Controlled item")).toBeNull(),
    );
  });

  it("toggles checkbox items without closing by default", async () => {
    const [checked, setChecked] = createSignal(false);
    const onCheckedChange = vi.fn((nextChecked: boolean) =>
      setChecked(nextChecked),
    );
    render(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenu.Trigger>Display options</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.CheckboxItem
            checked={checked()}
            onCheckedChange={onCheckedChange}
          >
            Show sidebar
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu>
    ));

    const item = await screen.findByRole("menuitemcheckbox", {
      name: "Show sidebar",
    });
    expect(item.getAttribute("aria-checked")).toBe("false");
    expect(item.querySelector("svg")).toBeNull();
    fireEvent.click(item);
    expect(onCheckedChange.mock.calls[0]?.[0]).toBe(true);
    expect(item.getAttribute("aria-checked")).toBe("true");
    expect(item.querySelector("svg")).toBeTruthy();
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it("updates radio groups and renders the selected indicator", async () => {
    const [value, setValue] = createSignal("light");
    const onValueChange = vi.fn((nextValue: string) => setValue(nextValue));
    render(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenu.Trigger>Theme options</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.RadioGroup
            value={value()}
            onValueChange={onValueChange}
          >
            <DropdownMenu.RadioItem value="light">
              Light
              <DropdownMenu.RadioItemIndicator />
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="dark">
              Dark
              <DropdownMenu.RadioItemIndicator />
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu>
    ));

    const light = await screen.findByRole("menuitemradio", {
      name: "Light",
    });
    const dark = screen.getByRole("menuitemradio", { name: "Dark" });
    expect(light.getAttribute("aria-checked")).toBe("true");
    expect(light.querySelector("svg")).toBeTruthy();
    expect(dark.querySelector("svg")).toBeNull();

    fireEvent.click(dark);
    expect(onValueChange.mock.calls[0]?.[0]).toBe("dark");
    expect(dark.getAttribute("aria-checked")).toBe("true");
    expect(dark.querySelector("svg")).toBeTruthy();
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it("supports links, legacy hrefs, icons, selected state, and helpers", async () => {
    render(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenu.Trigger>Resource links</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Group>
            <DropdownMenu.Label inset>Resources</DropdownMenu.Label>
            <DropdownMenu.LinkItem href="/settings" icon={TestIcon}>
              Settings
              <DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
            </DropdownMenu.LinkItem>
            <DropdownMenu.Item href="https://example.com" selected inset>
              External docs
            </DropdownMenu.Item>
          </DropdownMenu.Group>
          <DropdownMenu.Separator />
        </DropdownMenu.Content>
      </DropdownMenu>
    ));

    const settings = await screen.findByRole("menuitem", {
      name: /Settings/,
    });
    expect(settings.tagName).toBe("A");
    expect(settings.getAttribute("href")).toBe("/settings");
    expect(settings.querySelector('[data-testid="test-icon"]')).toBeTruthy();
    expect(settings.textContent).toContain("⌘S");

    const external = screen.getByRole("menuitem", {
      name: "External docs",
    });
    expect(external.tagName).toBe("A");
    expect(external.getAttribute("target")).toBe("_blank");
    expect(external.getAttribute("rel")).toBe("noreferrer");
    expect(external.className).toContain("pl-8");
    expect(external.querySelector("svg")).toBeTruthy();
    expect(screen.getByRole("separator")).toBeTruthy();
    expect(screen.getByText("Resources").className).toContain("pl-8");
  });

  it("supports custom triggers and nested submenu content", async () => {
    render(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenu.Trigger
          render={(renderProps) => (
            <button {...renderProps} data-testid="custom-trigger" />
          )}
        >
          Custom actions
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Sub defaultOpen>
            <DropdownMenu.SubTrigger icon={TestIcon}>
              Language
            </DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item>English</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu>
    ));

    expect(screen.getByTestId("custom-trigger").textContent).toBe(
      "Custom actions",
    );
    const submenuTrigger = await screen.findByRole("menuitem", {
      name: "Language",
    });
    expect(submenuTrigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(submenuTrigger.querySelectorAll("svg")).toHaveLength(2);
    expect(await screen.findByText("English")).toBeTruthy();
    expect(screen.getAllByRole("menu")).toHaveLength(2);
  });

  it("uses the Kumo portal context and content override", async () => {
    const contextContainer = document.createElement("div");
    const overrideContainer = document.createElement("div");
    document.body.append(contextContainer, overrideContainer);
    const result = render(() => (
      <KumoPortalProvider container={contextContainer}>
        <DropdownMenu defaultOpen modal={false}>
          <DropdownMenu.Trigger>Context trigger</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Context item</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
        <DropdownMenu defaultOpen modal={false}>
          <DropdownMenu.Trigger>Override trigger</DropdownMenu.Trigger>
          <DropdownMenu.Content container={overrideContainer}>
            <DropdownMenu.Item>Override item</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </KumoPortalProvider>
    ));

    await screen.findByText("Context item");
    expect(contextContainer.textContent).toContain("Context item");
    expect(overrideContainer.textContent).toContain("Override item");

    result.unmount();
    contextContainer.remove();
    overrideContainer.remove();
  });
});
