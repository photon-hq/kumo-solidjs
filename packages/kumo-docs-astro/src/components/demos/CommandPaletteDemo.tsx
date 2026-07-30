import { createMemo, createSignal, type JSX } from "solid-js";

import { CommandPalette, Button } from "@photon-ai/kumo-solid";
import {
  GearIcon,
  FileIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  HouseIcon,
  ChartLineIcon,
  UsersIcon,
} from "~/components/icons";

// Types for our demo data
interface CommandItem {
  id: string;
  title: string;
  icon?: JSX.Element;
}

interface CommandGroup {
  id: string;
  label: string;
  items: CommandItem[];
}

// Sample data
const sampleGroups: CommandGroup[] = [
  {
    id: "commands",
    label: "Commands",
    items: [
      {
        id: "new-project",
        title: "Create New Project",
        icon: <FolderIcon size={16} />,
      },
      { id: "settings", title: "Open Settings", icon: <GearIcon size={16} /> },
      {
        id: "search",
        title: "Search Files",
        icon: <MagnifyingGlassIcon size={16} />,
      },
    ],
  },
  {
    id: "pages",
    label: "Pages",
    items: [
      { id: "home", title: "Home", icon: <HouseIcon size={16} /> },
      {
        id: "dashboard",
        title: "Dashboard",
        icon: <ChartLineIcon size={16} />,
      },
      { id: "users", title: "Users", icon: <UsersIcon size={16} /> },
    ],
  },
];

// Helper to flatten groups into selectable items
const getSelectableItems = (groups: readonly CommandGroup[]) =>
  groups.flatMap((group) => group.items);

// Helper to filter groups and their items based on search query
const filterGroupsWithItems = (
  groups: CommandGroup[],
  query: string,
): CommandGroup[] => {
  if (!query) return groups;
  const lowerQuery = query.toLowerCase();
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.title.toLowerCase().includes(lowerQuery),
      ),
    }))
    .filter((group) => group.items.length > 0);
};

export function CommandPaletteBasicDemo() {
  const [open, setOpen] = createSignal(false);
  const [search, setSearch] = createSignal("");
  const [selectedItem, setSelectedItem] = createSignal<string | null>(null);

  const handleSelect = (item: CommandItem) => {
    setSelectedItem(item.title);
    setOpen(false);
    setSearch("");
  };

  // Filter groups based on search
  const filteredGroups = createMemo(() =>
    filterGroupsWithItems(sampleGroups, search()),
  );

  return (
    <div class="flex flex-col items-start gap-4">
      <Button onClick={() => setOpen(true)}>Open Command Palette</Button>
      {selectedItem() && (
        <p class="text-sm text-kumo-subtle">
          Last selected: <span class="text-kumo-default">{selectedItem()}</span>
        </p>
      )}

      <CommandPalette.Root
        open={open()}
        onOpenChange={setOpen}
        items={filteredGroups()}
        value={search()}
        onValueChange={setSearch}
        itemToStringValue={(group) => group.label}
        onSelect={(item, { newTab }) => {
          console.log("Selected:", item.title, newTab ? "(new tab)" : "");
          handleSelect(item);
        }}
        getSelectableItems={getSelectableItems}
      >
        <CommandPalette.Input placeholder="Type a command or search..." />
        <CommandPalette.List>
          <CommandPalette.Results>
            {(group: CommandGroup) => (
              <CommandPalette.Group items={group.items}>
                <CommandPalette.GroupLabel>
                  {group.label}
                </CommandPalette.GroupLabel>
                <CommandPalette.Items>
                  {(item: CommandItem) => (
                    <CommandPalette.Item
                      value={item}
                      onClick={() => handleSelect(item)}
                    >
                      <span class="flex items-center gap-3">
                        {item.icon && (
                          <span class="text-kumo-subtle">{item.icon}</span>
                        )}
                        <span>{item.title}</span>
                      </span>
                    </CommandPalette.Item>
                  )}
                </CommandPalette.Items>
              </CommandPalette.Group>
            )}
          </CommandPalette.Results>
          <CommandPalette.Empty>No commands found</CommandPalette.Empty>
        </CommandPalette.List>
        <CommandPalette.Footer>
          <span class="flex items-center gap-2">
            <kbd class="rounded border border-kumo-hairline bg-kumo-base px-1.5 py-0.5 text-[10px]">
              ↑↓
            </kbd>
            <span>Navigate</span>
          </span>
          <span class="flex items-center gap-2">
            <kbd class="rounded border border-kumo-hairline bg-kumo-base px-1.5 py-0.5 text-[10px]">
              ↵
            </kbd>
            <span>Select</span>
          </span>
        </CommandPalette.Footer>
      </CommandPalette.Root>
    </div>
  );
}

// Simple flat list example
interface SimpleItem {
  id: string;
  title: string;
}

const simpleItems: SimpleItem[] = [
  { id: "1", title: "Copy" },
  { id: "2", title: "Paste" },
  { id: "3", title: "Cut" },
  { id: "4", title: "Delete" },
  { id: "5", title: "Select All" },
];

export function CommandPaletteSimpleDemo() {
  const [open, setOpen] = createSignal(false);
  const [search, setSearch] = createSignal("");

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Simple Palette</Button>

      <CommandPalette.Root
        open={open()}
        onOpenChange={setOpen}
        items={simpleItems}
        value={search()}
        onValueChange={setSearch}
        itemToStringValue={(item) => item.title}
        onSelect={(item) => {
          console.log("Selected:", item.title);
          setOpen(false);
        }}
        getSelectableItems={(items) => [...items]}
      >
        <CommandPalette.Input placeholder="Search actions..." />
        <CommandPalette.List>
          <CommandPalette.Results>
            {(item: SimpleItem) => (
              <CommandPalette.Item
                value={item}
                onClick={() => {
                  console.log("Clicked:", item.title);
                  setOpen(false);
                }}
              >
                {item.title}
              </CommandPalette.Item>
            )}
          </CommandPalette.Results>
          <CommandPalette.Empty>No actions found</CommandPalette.Empty>
        </CommandPalette.List>
      </CommandPalette.Root>
    </div>
  );
}

// With loading state
export function CommandPaletteLoadingDemo() {
  const [open, setOpen] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const [search, setSearch] = createSignal("");

  const handleOpen = () => {
    setOpen(true);
    setLoading(true);
    // Simulate loading
    setTimeout(() => setLoading(false), 1500);
  };

  // Filter groups based on search
  const filteredGroups = createMemo(() =>
    filterGroupsWithItems(sampleGroups, search()),
  );

  return (
    <div>
      <Button onClick={handleOpen}>Open with Loading</Button>

      <CommandPalette.Root
        open={open()}
        onOpenChange={setOpen}
        items={loading() ? [] : filteredGroups()}
        value={search()}
        onValueChange={setSearch}
        itemToStringValue={(group) => group.label}
        getSelectableItems={getSelectableItems}
      >
        <CommandPalette.Input placeholder="Search..." />
        <CommandPalette.List>
          {loading() ? (
            <CommandPalette.Loading />
          ) : (
            <>
              <CommandPalette.Results>
                {(group: CommandGroup) => (
                  <CommandPalette.Group items={group.items}>
                    <CommandPalette.GroupLabel>
                      {group.label}
                    </CommandPalette.GroupLabel>
                    <CommandPalette.Items>
                      {(item: CommandItem) => (
                        <CommandPalette.Item
                          value={item}
                          onClick={() => setOpen(false)}
                        >
                          <span class="flex items-center gap-3">
                            {item.icon && (
                              <span class="text-kumo-subtle">{item.icon}</span>
                            )}
                            <span>{item.title}</span>
                          </span>
                        </CommandPalette.Item>
                      )}
                    </CommandPalette.Items>
                  </CommandPalette.Group>
                )}
              </CommandPalette.Results>
              <CommandPalette.Empty>No results found</CommandPalette.Empty>
            </>
          )}
        </CommandPalette.List>
      </CommandPalette.Root>
    </div>
  );
}

/** Demonstrates disabling browser autocomplete and spellcheck on the command palette input. */
export function CommandPaletteNoAutocompleteDemo() {
  const [open, setOpen] = createSignal(false);
  const [search, setSearch] = createSignal("");

  const filteredGroups = createMemo(() =>
    filterGroupsWithItems(sampleGroups, search()),
  );

  return (
    <div class="flex flex-col items-start gap-4">
      <Button onClick={() => setOpen(true)}>
        Open Palette (No Autocomplete)
      </Button>

      <CommandPalette.Root
        open={open()}
        onOpenChange={setOpen}
        items={filteredGroups()}
        value={search()}
        onValueChange={setSearch}
        itemToStringValue={(group) => group.label}
        onSelect={(item) => {
          console.log("Selected:", item.title);
          setOpen(false);
          setSearch("");
        }}
        getSelectableItems={getSelectableItems}
      >
        <CommandPalette.Input
          placeholder="Search commands..."
          autoComplete="off"
          autocorrect="off"
          autocapitalize="none"
          spellcheck={false}
          data-1p-ignore="true"
          data-lpignore="true"
        />
        <CommandPalette.List>
          <CommandPalette.Results>
            {(group: CommandGroup) => (
              <CommandPalette.Group items={group.items}>
                <CommandPalette.GroupLabel>
                  {group.label}
                </CommandPalette.GroupLabel>
                <CommandPalette.Items>
                  {(item: CommandItem) => (
                    <CommandPalette.Item
                      value={item}
                      onClick={() => {
                        setOpen(false);
                        setSearch("");
                      }}
                    >
                      <span class="flex items-center gap-3">
                        {item.icon && (
                          <span class="text-kumo-subtle">{item.icon}</span>
                        )}
                        <span>{item.title}</span>
                      </span>
                    </CommandPalette.Item>
                  )}
                </CommandPalette.Items>
              </CommandPalette.Group>
            )}
          </CommandPalette.Results>
          <CommandPalette.Empty>No commands found</CommandPalette.Empty>
        </CommandPalette.List>
      </CommandPalette.Root>
    </div>
  );
}

// ResultItem with breadcrumbs and highlights
interface SearchResult {
  id: string;
  title: string;
  breadcrumbs: string[];
  icon?: JSX.Element;
}

const searchResults: SearchResult[] = [
  {
    id: "1",
    title: "Button",
    breadcrumbs: ["Components"],
    icon: <FileIcon size={16} />,
  },
  {
    id: "2",
    title: "Dialog",
    breadcrumbs: ["Components"],
    icon: <FileIcon size={16} />,
  },
  {
    id: "3",
    title: "Page Header",
    breadcrumbs: ["Blocks"],
    icon: <FileIcon size={16} />,
  },
];

export function CommandPaletteResultItemDemo() {
  const [open, setOpen] = createSignal(false);
  const [search, setSearch] = createSignal("");

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open with ResultItem</Button>

      <CommandPalette.Root
        open={open()}
        onOpenChange={setOpen}
        items={searchResults}
        value={search()}
        onValueChange={setSearch}
        itemToStringValue={(item) => item.title}
        getSelectableItems={(items) => [...items]}
      >
        <CommandPalette.Input placeholder="Search documentation..." />
        <CommandPalette.List>
          <CommandPalette.Results>
            {(item: SearchResult) => (
              <CommandPalette.ResultItem
                value={item}
                title={item.title}
                breadcrumbs={item.breadcrumbs}
                icon={item.icon}
                onClick={() => {
                  console.log("Navigate to:", item.title);
                  setOpen(false);
                }}
              />
            )}
          </CommandPalette.Results>
          <CommandPalette.Empty>No pages found</CommandPalette.Empty>
        </CommandPalette.List>
        <CommandPalette.Footer>
          <span class="flex items-center gap-2">
            <kbd class="rounded border border-kumo-hairline bg-kumo-base px-1.5 py-0.5 text-[10px]">
              ↑↓
            </kbd>
            <span>Navigate</span>
          </span>
          <span class="flex items-center gap-2">
            <kbd class="rounded border border-kumo-hairline bg-kumo-base px-1.5 py-0.5 text-[10px]">
              ⌘↵
            </kbd>
            <span>Open in new tab</span>
          </span>
        </CommandPalette.Footer>
      </CommandPalette.Root>
    </div>
  );
}
