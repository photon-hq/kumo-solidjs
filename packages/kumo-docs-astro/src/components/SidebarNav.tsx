import { createRef } from "~/lib/solid-reactivity";
import { createEffect, createSignal, onCleanup } from "solid-js";

import { cn, Button } from "@photon-ai/kumo-solid";
import { CaretDownIcon, MagnifyingGlassIcon, XIcon } from "~/components/icons";
import { KumoMenuIcon } from "./KumoMenuIcon";
import { SearchDialog } from "./SearchDialog";
import { ThemeToggle } from "./ThemeToggle";

interface NavItem {
  label: string;
  href: string;
}

function normalizePathname(pathname: string) {
  if (!pathname) return "/";
  if (pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

function isActivePath(activePath: string, href: string) {
  const normalized = normalizePathname(href);
  return activePath === normalized || activePath.startsWith(normalized + "/");
}

const staticPages: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Installation", href: "/installation" },
  { label: "Contributing", href: "/contributing" },
  { label: "Colors", href: "/colors" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Figma Resources", href: "/figma" },
  { label: "CLI", href: "/cli" },
  { label: "Design skill", href: "/skill" },
  { label: "Registry", href: "/registry" },
  { label: "Changelog", href: "/changelog" },
];

const componentItems: NavItem[] = [
  { label: "Autocomplete", href: "/components/autocomplete" },
  { label: "Badge", href: "/components/badge" },
  { label: "Banner", href: "/components/banner" },
  { label: "Breadcrumbs", href: "/components/breadcrumbs" },
  { label: "Button", href: "/components/button" },
  { label: "Checkbox", href: "/components/checkbox" },
  { label: "Clipboard Text", href: "/components/clipboard-text" },
  { label: "Cloudflare Logo", href: "/components/cloudflare-logo" },
  { label: "CodeHighlighted", href: "/components/code-highlighted" },
  { label: "Collapsible", href: "/components/collapsible" },
  { label: "Combobox", href: "/components/combobox" },
  { label: "Command Palette", href: "/components/command-palette" },
  { label: "Date Picker", href: "/components/date-picker" },
  { label: "Dialog", href: "/components/dialog" },
  { label: "Dropdown", href: "/components/dropdown" },
  { label: "Empty", href: "/components/empty" },
  { label: "Flow", href: "/components/flow" },
  { label: "Grid", href: "/components/grid" },
  { label: "Input", href: "/components/input" },
  { label: "InputArea", href: "/components/input-area" },
  { label: "InputGroup", href: "/components/input-group" },
  { label: "Label", href: "/components/label" },
  { label: "Layer Card", href: "/components/layer-card" },
  { label: "Link", href: "/components/link" },
  { label: "Loader", href: "/components/loader" },
  { label: "MenuBar", href: "/components/menu-bar" },
  { label: "Meter", href: "/components/meter" },
  { label: "Pagination", href: "/components/pagination" },
  { label: "Popover", href: "/components/popover" },
  { label: "Radio", href: "/components/radio" },
  { label: "Select", href: "/components/select" },
  { label: "Sensitive Input", href: "/components/sensitive-input" },
  { label: "Sidebar", href: "/components/sidebar" },
  { label: "Skeleton Line", href: "/components/skeleton-line" },
  { label: "Switch", href: "/components/switch" },
  { label: "Table", href: "/components/table" },
  { label: "Table of Contents", href: "/components/table-of-contents" },
  { label: "Tabs", href: "/components/tabs" },
  { label: "Text", href: "/components/text" },
  { label: "Toolbar", href: "/components/toolbar" },
  { label: "Toast", href: "/components/toast" },
  { label: "Tooltip", href: "/components/tooltip" },
];

const chartItems: NavItem[] = [
  { label: "Charts", href: "/charts" },
  { label: "Colors", href: "/charts/colors" },
  { label: "Timeseries", href: "/charts/timeseries" },
  { label: "Maps", href: "/charts/maps" },
  { label: "Sankey", href: "/charts/sankey" },
  { label: "Custom Chart", href: "/charts/custom" },
];

// Blocks are CLI-installed components that you own and can customize
// Solid blocks are currently copied from src/components/kumo.
const blockItems: NavItem[] = [
  { label: "Page Header", href: "/blocks/page-header" },
  { label: "Resource List", href: "/blocks/resource-list" },
  { label: "Delete Resource", href: "/blocks/delete-resource" },
];

const LI_STYLE =
  "block rounded-lg text-kumo-subtle hover:text-kumo-default hover:bg-kumo-tint p-2 my-[.05rem] cursor-pointer transition-colors no-underline relative z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-kumo-brand";
const LI_ACTIVE_STYLE = "font-medium text-kumo-default bg-kumo-tint";

interface SidebarNavProps {
  currentPath: string;
}

export function SidebarNav({ currentPath }: SidebarNavProps) {
  const [sidebarOpen, setSidebarOpen] = createSignal(true);
  const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);
  const [componentsOpen, setComponentsOpen] = createSignal(true);
  const [chartsOpen, setChartsOpen] = createSignal(true);
  const [blocksOpen, setBlocksOpen] = createSignal(true);

  // The sidebar is persisted across view-transition navigations
  // (`transition:persist`), so the `currentPath` prop is only correct for the
  // first render. Track the live pathname client-side and update it on each
  // soft navigation so the active-link highlight stays in sync.
  const [livePath, setLivePath] = createSignal(currentPath);
  createEffect(() => {
    const sync = () => setLivePath(window.location.pathname);
    sync();
    document.addEventListener("astro:page-load", sync);
    onCleanup(() => document.removeEventListener("astro:page-load", sync));
  });
  const activePath = () => normalizePathname(livePath());

  const [searchOpen, setSearchOpen] = createSignal(false);

  // Refs for scroll containers
  const mobileScrollRef = createRef<HTMLDivElement>(null);
  const desktopScrollRef = createRef<HTMLDivElement>(null);

  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const toggleMobileMenu = () => setMobileMenuOpen((v) => !v);
  const preventPointerFocus = (
    e: MouseEvent & { currentTarget: HTMLElement },
  ) => {
    e.preventDefault();
  };

  // Keyboard shortcut: Cmd+K / Ctrl+K + custom event from headers
  createEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    const handleOpenSearch = () => setSearchOpen(true);

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("kumo:open-search", handleOpenSearch);
    onCleanup(() => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("kumo:open-search", handleOpenSearch);
    });
  });

  // Save scroll position on scroll and navigation
  createEffect(() => {
    const STORAGE_KEY = "kumo-sidebar-scroll";

    // Save scroll position before navigation
    const handleBeforeUnload = () => {
      const scrollPosition =
        mobileScrollRef.current?.scrollTop ||
        desktopScrollRef.current?.scrollTop ||
        0;
      sessionStorage.setItem(STORAGE_KEY, scrollPosition.toString());
    };

    // Save on scroll for more reliable restoration
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      sessionStorage.setItem(STORAGE_KEY, target.scrollTop.toString());
    };

    // Listen for navigation events
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Attach scroll listeners to both containers
    const mobileContainer = mobileScrollRef.current;
    const desktopContainer = desktopScrollRef.current;

    if (mobileContainer) {
      mobileContainer.addEventListener("scroll", handleScroll);
    }
    if (desktopContainer) {
      desktopContainer.addEventListener("scroll", handleScroll);
    }

    onCleanup(() => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (mobileContainer) {
        mobileContainer.removeEventListener("scroll", handleScroll);
      }
      if (desktopContainer) {
        desktopContainer.removeEventListener("scroll", handleScroll);
      }
    });
  });

  // Shared nav content for both mobile and desktop
  const navContent = () => (
    <>
      <button
        onClick={() => setSearchOpen(true)}
        class="mb-3 flex w-full items-center gap-2 rounded-lg bg-kumo-control px-3 py-2 text-sm text-kumo-subtle ring-1 ring-kumo-line transition-all hover:ring-kumo-hairline focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand focus-visible:ring-inset"
      >
        <MagnifyingGlassIcon size={16} className="shrink-0" />
        <span>Search...</span>
      </button>

      <ul class="flex flex-col gap-px">
        {staticPages.map((item) => (
          <li>
            <a
              href={item.href}
              onMouseDown={preventPointerFocus}
              class={cn(
                LI_STYLE,
                isActivePath(activePath(), item.href) && LI_ACTIVE_STYLE,
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      <div class="my-4 border-b border-kumo-hairline" />

      <div class="mb-4">
        {/* Components Section */}
        <button
          type="button"
          class="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-kumo-default transition-colors hover:bg-kumo-tint focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand focus-visible:ring-inset"
          onClick={() => setComponentsOpen(!componentsOpen())}
        >
          <span>Components</span>
          <CaretDownIcon
            size={12}
            className={cn(
              "text-kumo-subtle transition-transform duration-200",
              !componentsOpen() && "-rotate-90",
            )}
          />
        </button>
        <ul
          class={cn(
            "mt-1 flex flex-col gap-px overflow-x-visible overflow-y-hidden transition-all duration-300 ease-in-out",
            componentsOpen()
              ? "max-h-[2000px] opacity-100"
              : "max-h-0 opacity-0",
          )}
        >
          {componentItems.map((item) => (
            <li>
              <a
                href={item.href}
                onMouseDown={preventPointerFocus}
                class={cn(
                  LI_STYLE,
                  "pl-4",
                  activePath() === normalizePathname(item.href) &&
                    LI_ACTIVE_STYLE,
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div class="mb-4">
        <button
          type="button"
          class="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-kumo-default transition-colors hover:bg-kumo-tint focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand focus-visible:ring-inset"
          onClick={() => setChartsOpen(!chartsOpen())}
        >
          <span>Charts</span>
          <CaretDownIcon
            size={12}
            className={cn(
              "text-kumo-subtle transition-transform duration-200",
              !chartsOpen() && "-rotate-90",
            )}
          />
        </button>
        <ul
          class={cn(
            "mt-1 flex flex-col gap-px overflow-x-visible overflow-y-hidden transition-all duration-300 ease-in-out",
            chartsOpen() ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          {chartItems.map((item) => (
            <li>
              <a
                href={item.href}
                onMouseDown={preventPointerFocus}
                class={cn(
                  LI_STYLE,
                  "pl-4",
                  livePath() === item.href && LI_ACTIVE_STYLE,
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        {/* Blocks Section */}
        <button
          type="button"
          class="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-kumo-default transition-colors hover:bg-kumo-tint focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand focus-visible:ring-inset"
          onClick={() => setBlocksOpen(!blocksOpen())}
        >
          <span>Blocks</span>
          <CaretDownIcon
            size={12}
            className={cn(
              "text-kumo-subtle transition-transform duration-200",
              !blocksOpen() && "-rotate-90",
            )}
          />
        </button>
        <ul
          class={cn(
            "mt-1 flex flex-col gap-px overflow-x-visible overflow-y-hidden transition-all duration-300 ease-in-out",
            blocksOpen() ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          {blockItems.map((item) => (
            <li>
              <a
                href={item.href}
                onMouseDown={preventPointerFocus}
                class={cn(
                  LI_STYLE,
                  "pl-4",
                  activePath() === normalizePathname(item.href) &&
                    LI_ACTIVE_STYLE,
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header bar with hamburger */}
      <div
        class={cn(
          "fixed inset-x-0 top-0 z-50 flex h-12 items-center justify-between border-b border-kumo-hairline bg-kumo-canvas px-3 md:px-6 lg:hidden",
        )}
      >
        <Button
          variant="ghost"
          shape="square"
          aria-label="Open menu"
          onClick={toggleMobileMenu}
        >
          <KumoMenuIcon />
        </Button>
        <h1 class="text-base font-medium">Kumo</h1>
        <ThemeToggle />
      </div>

      {/* Mobile slide-out drawer */}
      <aside
        aria-hidden={!mobileMenuOpen()}
        inert={!mobileMenuOpen()}
        class={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-kumo-hairline bg-kumo-canvas lg:hidden",
          "transition-transform duration-300 will-change-transform",
          mobileMenuOpen() ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div class="flex h-12 flex-none items-center justify-between border-b border-kumo-hairline px-3">
          <h1 class="text-base font-medium">Kumo</h1>
          <Button
            variant="ghost"
            shape="square"
            aria-label="Close menu"
            onClick={toggleMobileMenu}
          >
            <XIcon size={20} />
          </Button>
        </div>
        <div
          ref={(element) => (mobileScrollRef.current = element)}
          data-sidebar-scroll="mobile"
          class="min-h-0 grow overflow-y-auto overscroll-contain px-3 py-4 text-sm text-kumo-subtle"
          style={{ "scroll-behavior": "auto" }}
        >
          {navContent()}
        </div>
      </aside>

      {/* Desktop: Left rail that always stays put */}
      <div
        class={cn(
          "fixed inset-y-0 left-0 z-50 hidden w-12 bg-kumo-canvas lg:block",
          "border-r border-kumo-hairline",
        )}
      >
        <div class="relative h-12 border-b border-kumo-hairline">
          <div class="absolute inset-0 grid place-items-center">
            <Button
              variant="ghost"
              shape="square"
              aria-label="Toggle sidebar"
              aria-pressed={sidebarOpen()}
              onClick={toggleSidebar}
            >
              <KumoMenuIcon />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop: Kumo brand label - always visible, panel slides behind it */}
      <div class="pointer-events-none fixed top-0 left-12 z-50 hidden h-12 items-center px-3 font-medium select-none lg:flex">
        <h1 class="text-base">Kumo</h1>
      </div>

      {/* Desktop: Sliding panel that opens to the right of the rail */}
      <aside
        data-sidebar-open={sidebarOpen()}
        class={cn(
          "fixed inset-y-0 left-12 z-40 hidden w-64 flex-col bg-kumo-canvas lg:flex",
          "transition-transform duration-300 ease-out will-change-transform",
          sidebarOpen()
            ? "translate-x-0 border-r border-kumo-hairline"
            : "-translate-x-full",
        )}
      >
        <div class="h-12 flex-none border-b border-kumo-hairline" />

        <div
          ref={(element) => (desktopScrollRef.current = element)}
          data-sidebar-scroll="desktop"
          class="min-h-0 grow overflow-y-auto overscroll-contain px-3 py-4 text-sm text-kumo-subtle"
        >
          {navContent()}
        </div>
      </aside>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen()} onOpenChange={setSearchOpen} />
    </>
  );
}
