import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { CommandPalette } from "./command-palette";

interface TestItem {
  id: string;
  title: string;
}

interface TestGroup {
  id: string;
  label: string;
  items: TestItem[];
}

const groups: TestGroup[] = [
  {
    id: "commands",
    label: "Commands",
    items: [
      { id: "create", title: "Create project" },
      { id: "settings", title: "Open settings" },
    ],
  },
  {
    id: "pages",
    label: "Pages",
    items: [{ id: "dashboard", title: "Dashboard" }],
  },
];

const selectable = (items: readonly TestGroup[]) =>
  items.flatMap((group) => group.items);

function Fixture(props: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (item: TestItem, options: { newTab: boolean }) => void;
  items?: TestGroup[];
}) {
  const [query, setQuery] = createSignal("");
  return (
    <CommandPalette.Root
      open={props.open ?? true}
      onOpenChange={props.onOpenChange ?? (() => undefined)}
      items={props.items ?? groups}
      value={query()}
      onValueChange={setQuery}
      itemToStringValue={(group: TestGroup) => group.label}
      onSelect={props.onSelect}
      getSelectableItems={selectable}
    >
      <CommandPalette.Input placeholder="Search commands…" />
      <CommandPalette.List>
        <CommandPalette.Results>
          {(group: TestGroup) => (
            <CommandPalette.Group items={group.items}>
              <CommandPalette.GroupLabel>
                {group.label}
              </CommandPalette.GroupLabel>
              <CommandPalette.Items>
                {(item: TestItem) => (
                  <CommandPalette.Item value={item}>
                    {item.title}
                  </CommandPalette.Item>
                )}
              </CommandPalette.Items>
            </CommandPalette.Group>
          )}
        </CommandPalette.Results>
        <CommandPalette.Empty>No commands found</CommandPalette.Empty>
      </CommandPalette.List>
      <CommandPalette.Footer>Navigate with arrows</CommandPalette.Footer>
    </CommandPalette.Root>
  );
}

describe("CommandPalette", () => {
  it("renders only while open with dialog and combobox semantics", () => {
    const { unmount } = render(() => <Fixture />);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("combobox")).toBeTruthy();
    unmount();
    render(() => <Fixture open={false} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders groups, items, and footer", () => {
    render(() => <Fixture />);
    expect(screen.getByText("Commands")).toBeTruthy();
    expect(screen.getByText("Create project")).toBeTruthy();
    expect(screen.getByText("Dashboard")).toBeTruthy();
    expect(screen.getByText("Navigate with arrows")).toBeTruthy();
  });

  it("closes from Escape", () => {
    const onOpenChange = vi.fn();
    render(() => <Fixture onOpenChange={onOpenChange} />);
    fireEvent.keyDown(screen.getByRole("combobox"), {
      key: "Escape",
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes from the backdrop", () => {
    const onOpenChange = vi.fn();
    render(() => <Fixture onOpenChange={onOpenChange} />);
    const backdrop = document.querySelector(
      '[class*="opacity-80"]',
    ) as HTMLElement;
    fireEvent.click(backdrop);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("supports arrow navigation and modified Enter selection", async () => {
    const onSelect = vi.fn();
    render(() => <Fixture onSelect={onSelect} />);
    const input = screen.getByRole("combobox");
    await waitFor(() =>
      expect(document.querySelector("[data-highlighted]")).toBeTruthy(),
    );
    fireEvent.keyDown(input, { key: "Enter", metaKey: true });
    expect(onSelect).toHaveBeenCalledWith(expect.anything(), { newTab: true });
  });

  it("shows an empty state", () => {
    render(() => <Fixture items={[]} />);
    expect(screen.getByText("No commands found")).toBeTruthy();
  });

  it("renders loading and highlighted text helpers", () => {
    const { unmount } = render(() => (
      <CommandPalette.Loading>Fetching</CommandPalette.Loading>
    ));
    expect(screen.getByText("Fetching")).toBeTruthy();
    unmount();
    render(() => (
      <CommandPalette.HighlightedText
        text="Autocomplete"
        highlights={[
          [0, 1],
          [2, 3],
        ]}
      />
    ));
    const highlighted = screen.getByText("Auto");
    expect(highlighted.tagName).toBe("MARK");
    expect(highlighted.className).toContain("bg-kumo-warning/50");
  });

  it("renders rich result details", () => {
    render(() => (
      <CommandPalette.Panel
        items={[{ title: "Workers" }]}
        itemToStringValue={(item: { title: string }) => item.title}
      >
        <CommandPalette.List>
          <CommandPalette.Results>
            {(item: { title: string }) => (
              <CommandPalette.ResultItem
                value={item}
                title={item.title}
                breadcrumbs={["Compute"]}
                description="Documentation"
                external
                onClick={() => undefined}
              />
            )}
          </CommandPalette.Results>
        </CommandPalette.List>
      </CommandPalette.Panel>
    ));
    expect(screen.getByText("Compute")).toBeTruthy();
    expect(screen.getByText("Workers")).toBeTruthy();
    expect(screen.getByText("Documentation")).toBeTruthy();
  });
});
