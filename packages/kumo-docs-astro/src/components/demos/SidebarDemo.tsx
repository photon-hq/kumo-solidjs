import { createMemo, createSignal, type Component, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  Sidebar,
  useSidebar,
  DropdownMenu,
  Breadcrumbs,
  type SidebarState,
} from "@photon-ai/kumo-solid";
import {
  HouseIcon,
  GlobeIcon,
  GearIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DatabaseIcon,
  CodeIcon,
  LockIcon,
  CubeIcon,
  BellIcon,
  CaretUpDownIcon,
  CheckIcon,
  StackIcon,
  StackSimpleIcon,
  UserIcon,
  ArrowsLeftRightIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ClockCounterClockwiseIcon,
  FileMagnifyingGlassIcon,
  ChartPieIcon,
} from "~/components/icons";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function DemoContainer({ children }: { children: JSX.Element }) {
  return (
    <div class="relative h-[540px] w-full overflow-hidden rounded-lg border border-kumo-line bg-kumo-base">
      {children}
    </div>
  );
}

function DemoMain({ children }: { children?: JSX.Element }) {
  return (
    <main class="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-base text-kumo-subtle">
      {children ?? "Main content area"}
    </main>
  );
}

function BrandLogo() {
  return (
    <div class="flex w-full min-w-0 items-center gap-2 px-3 transition-[padding] duration-(--sidebar-animation-duration) ease-(--sidebar-easing) group-data-[state=collapsed]/sidebar:px-2">
      <CubeIcon className="size-4 shrink-0 text-kumo-brand" weight="duotone" />
      <span class="flex-1 truncate text-sm font-semibold text-kumo-strong">
        Company
      </span>
    </div>
  );
}

const accounts = [
  { id: "1", name: "Company", icon: CubeIcon },
  { id: "2", name: "Personal", icon: StackIcon },
  { id: "3", name: "Staging", icon: StackSimpleIcon },
];

function AccountSwitcher() {
  const [active, setActive] = createSignal(accounts[0]);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        render={(renderProps) => (
          <button
            {...renderProps}
            type="button"
            class="flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-kumo-default transition-[padding] duration-(--sidebar-animation-duration) ease-(--sidebar-easing) outline-none hover:bg-kumo-tint focus-visible:ring-1 focus-visible:ring-kumo-line"
          >
            <Dynamic
              component={active().icon}
              className="size-4 shrink-0 text-kumo-brand"
              weight="duotone"
            />
            <span class="flex min-w-0 flex-1 items-center overflow-hidden text-left">
              {active().name}
            </span>
            <span class="w-4 shrink-0 overflow-hidden transition-[width] duration-(--sidebar-animation-duration) ease-(--sidebar-easing) group-data-[state=collapsed]/sidebar:w-0">
              <CaretUpDownIcon className="size-4 text-kumo-subtle" />
            </span>
          </button>
        )}
      />
      <DropdownMenu.Content className="w-(--anchor-width)">
        {accounts.map((account) => (
          <DropdownMenu.Item
            className="cursor-pointer gap-2"
            onClick={() => setActive(account)}
          >
            <account.icon className="size-4 text-kumo-brand" weight="duotone" />
            {account.name}
            {account.id === active().id && (
              <CheckIcon className="ml-auto size-4" />
            )}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

/** Initials from an account name: "Workers Prod" → "WP", "Company" → "CO". */
function initialsFor(name: string) {
  const words = name.trim().split(/\s+/);
  return (
    words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)
  ).toUpperCase();
}

/**
 * Squircle avatar with a hairline ring, so it sits on the surface rather than
 * floating. Muted neutral fill. Reads as an identity
 * affordance rather than decoration. Sized to the header row rather than to
 * iOS touch-target minimums — the whole row is generous, and an oversized mark
 * competes with the breadcrumb trail that should carry the emphasis.
 */
function AccountAvatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: `${size}px`, height: `${size}px` }}
      class="flex shrink-0 items-center justify-center rounded-[30%] bg-kumo-control text-kumo-default shadow-xs ring ring-kumo-line"
    >
      <span
        class="leading-none font-semibold tracking-tight"
        style={{ "font-size": `${size * 0.4}px` }}
      >
        {initialsFor(name)}
      </span>
    </span>
  );
}

/**
 * Avatar account switcher. The account name lives one tap away in the dropdown,
 * freeing the header row for the breadcrumb trail.
 */
function CompactAccountSwitcher() {
  const [active, setActive] = createSignal(accounts[0]);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        render={(renderProps) => (
          <button
            {...renderProps}
            type="button"
            aria-label={`Account: ${active().name}`}
            class="shrink-0 cursor-pointer rounded-full transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-kumo-line"
          >
            <AccountAvatar name={active().name} />
          </button>
        )}
      />
      <DropdownMenu.Content align="start">
        {accounts.map((account) => (
          <DropdownMenu.Item
            className="cursor-pointer gap-2"
            onClick={() => setActive(account)}
          >
            <AccountAvatar name={account.name} size={20} />
            {account.name}
            {account.id === active().id && (
              <CheckIcon className="ml-auto size-4" />
            )}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

// ---------------------------------------------------------------------------
// 1. Basic — absolute minimum: no header, no footer
// ---------------------------------------------------------------------------

/** Minimal sidebar with groups and active state. No header or footer. */
export function SidebarBasicDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider contained defaultOpen className="h-full min-h-0!">
        <Sidebar>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.GroupLabel>Overview</Sidebar.GroupLabel>
              <Sidebar.Menu>
                <Sidebar.MenuButton icon={HouseIcon} active>
                  Home
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={ChartBarIcon}>
                  Analytics
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={GlobeIcon}>
                  Domains
                </Sidebar.MenuButton>
              </Sidebar.Menu>
            </Sidebar.Group>

            <Sidebar.Group>
              <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.Collapsible defaultOpen>
                    <Sidebar.CollapsibleTrigger
                      render={(renderProps) => (
                        <Sidebar.MenuButton {...renderProps} icon={CodeIcon}>
                          Compute
                          <Sidebar.MenuChevron />
                        </Sidebar.MenuButton>
                      )}
                    />
                    <Sidebar.CollapsibleContent>
                      <Sidebar.MenuSub>
                        <Sidebar.MenuSubItem>
                          <Sidebar.Collapsible>
                            <Sidebar.CollapsibleTrigger
                              render={(renderProps) => (
                                <Sidebar.MenuSubButton {...renderProps}>
                                  Workers & Pages
                                  <Sidebar.MenuChevron />
                                </Sidebar.MenuSubButton>
                              )}
                            />
                            <Sidebar.CollapsibleContent>
                              <Sidebar.MenuSub>
                                <Sidebar.MenuSubButton>
                                  Overview
                                </Sidebar.MenuSubButton>
                                <Sidebar.MenuSubButton>
                                  Workers
                                </Sidebar.MenuSubButton>
                                <Sidebar.MenuSubButton>
                                  Pages
                                </Sidebar.MenuSubButton>
                              </Sidebar.MenuSub>
                            </Sidebar.CollapsibleContent>
                          </Sidebar.Collapsible>
                        </Sidebar.MenuSubItem>
                        <Sidebar.MenuSubButton>
                          Durable Objects
                        </Sidebar.MenuSubButton>
                      </Sidebar.MenuSub>
                    </Sidebar.CollapsibleContent>
                  </Sidebar.Collapsible>
                </Sidebar.MenuItem>
                <Sidebar.MenuButton icon={DatabaseIcon}>
                  Storage
                </Sidebar.MenuButton>
              </Sidebar.Menu>
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar>
        <DemoMain />
      </Sidebar.Provider>
    </DemoContainer>
  );
}

// ---------------------------------------------------------------------------
// 2. Toggle — expand/collapse with trigger + tooltips
// ---------------------------------------------------------------------------

function ToggleButton() {
  const { toggleSidebar, state } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      class="cursor-pointer rounded-lg border border-kumo-line bg-kumo-base px-3 py-1.5 text-base text-kumo-default transition-colors hover:bg-kumo-tint"
    >
      {state === "expanded" ? "Collapse" : "Expand"}
    </button>
  );
}

/** Interactive demo showing expand/collapse toggle with tooltips in collapsed state. */
export function SidebarToggleDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider contained defaultOpen className="h-full min-h-0!">
        <Sidebar>
          <Sidebar.Header>
            <BrandLogo />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.Menu>
                <Sidebar.MenuButton icon={HouseIcon} tooltip="Home" active>
                  Home
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={ChartBarIcon} tooltip="Analytics">
                  Analytics
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={CodeIcon} tooltip="Compute">
                  Compute
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={DatabaseIcon} tooltip="Storage">
                  Storage
                </Sidebar.MenuButton>
              </Sidebar.Menu>
            </Sidebar.Group>
          </Sidebar.Content>
          <Sidebar.Footer>
            <Sidebar.Trigger />
          </Sidebar.Footer>
        </Sidebar>
        <DemoMain>
          <ToggleButton />
          <p>Click the button or the sidebar trigger to toggle</p>
        </DemoMain>
      </Sidebar.Provider>
    </DemoContainer>
  );
}

// ---------------------------------------------------------------------------
// Loading — nav-item-shaped skeleton shown while nav resolves
// ---------------------------------------------------------------------------

/** Loading state: nav-item-shaped skeleton rows shown until the nav is ready. */
export function SidebarLoadingDemo() {
  const [loading, setLoading] = createSignal(true);
  return (
    <DemoContainer>
      <Sidebar.Provider contained defaultOpen className="h-full min-h-0!">
        <Sidebar>
          <Sidebar.Header>
            <BrandLogo />
          </Sidebar.Header>
          {loading() ? (
            <Sidebar.Loading />
          ) : (
            <Sidebar.Content>
              <Sidebar.Group>
                <Sidebar.Menu>
                  <Sidebar.MenuButton icon={HouseIcon} active>
                    Home
                  </Sidebar.MenuButton>
                  <Sidebar.MenuButton icon={ChartBarIcon}>
                    Analytics
                  </Sidebar.MenuButton>
                  <Sidebar.MenuButton icon={CodeIcon}>
                    Compute
                  </Sidebar.MenuButton>
                  <Sidebar.MenuButton icon={DatabaseIcon}>
                    Storage
                  </Sidebar.MenuButton>
                </Sidebar.Menu>
              </Sidebar.Group>
            </Sidebar.Content>
          )}
          <Sidebar.Footer>
            <Sidebar.Trigger />
          </Sidebar.Footer>
        </Sidebar>
        <DemoMain>
          <button
            type="button"
            onClick={() => setLoading((l) => !l)}
            class="cursor-pointer rounded-lg border border-kumo-line bg-kumo-base px-3 py-1.5 text-base text-kumo-default transition-colors hover:bg-kumo-tint"
          >
            {loading() ? "Show loaded nav" : "Show loading"}
          </button>
          <p>Toggle to compare the loading state with the loaded nav</p>
        </DemoMain>
      </Sidebar.Provider>
    </DemoContainer>
  );
}

// ---------------------------------------------------------------------------
// 3. Resizable — drag handle with auto-collapse
// ---------------------------------------------------------------------------

/** Resizable sidebar with drag handle. Drag the right edge to resize. */
export function SidebarResizableDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider
        contained
        defaultOpen
        resizable
        defaultWidth={240}
        minWidth={180}
        maxWidth={400}
        className="h-full min-h-0!"
      >
        <Sidebar>
          <Sidebar.Header>
            <BrandLogo />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.Menu>
                <Sidebar.MenuButton icon={HouseIcon} active>
                  Home
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={ChartBarIcon}>
                  Analytics
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={DatabaseIcon}>
                  Storage
                </Sidebar.MenuButton>
              </Sidebar.Menu>
            </Sidebar.Group>
          </Sidebar.Content>
          <Sidebar.Footer>
            <Sidebar.Trigger />
          </Sidebar.Footer>
          <Sidebar.ResizeHandle />
        </Sidebar>
        <DemoMain>
          <p>Drag the sidebar edge to resize</p>
        </DemoMain>
      </Sidebar.Provider>
    </DemoContainer>
  );
}

// ---------------------------------------------------------------------------
// 4. Right Side — right-aligned, content only
// ---------------------------------------------------------------------------

/** Right-side sidebar variant. */
export function SidebarRightDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider
        contained
        defaultOpen
        side="right"
        className="h-full min-h-0!"
      >
        <DemoMain />
        <Sidebar>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.GroupLabel>Details</Sidebar.GroupLabel>
              <Sidebar.Menu>
                <Sidebar.MenuButton icon={GearIcon} active>
                  Properties
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={ChartBarIcon}>
                  Metrics
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={BellIcon}>Alerts</Sidebar.MenuButton>
              </Sidebar.Menu>
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>
    </DemoContainer>
  );
}

// ---------------------------------------------------------------------------
// 5. Peeking — hover to temporarily expand collapsed sidebar
// ---------------------------------------------------------------------------

function PeekStateIndicator() {
  const { state } = useSidebar();
  const labels: Record<SidebarState, string> = {
    expanded: "Expanded",
    collapsed: "Collapsed",
    peeking: "Peeking",
  };
  return (
    <div class="flex flex-col items-center gap-2">
      <span class="text font-medium text-kumo-default">
        State: {labels[state]}
      </span>
      <p>Collapse, then hover the sidebar to peek</p>
    </div>
  );
}

/** Peekable sidebar that temporarily expands on hover when collapsed. */
export function SidebarPeekingDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider
        contained
        defaultOpen
        peekable
        className="h-full min-h-0!"
      >
        <Sidebar>
          <Sidebar.Header>
            <BrandLogo />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.Menu>
                <Sidebar.MenuButton icon={HouseIcon} tooltip="Home" active>
                  Home
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={ChartBarIcon} tooltip="Analytics">
                  Analytics
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={CodeIcon} tooltip="Compute">
                  Compute
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={DatabaseIcon} tooltip="Storage">
                  Storage
                </Sidebar.MenuButton>
              </Sidebar.Menu>
            </Sidebar.Group>
          </Sidebar.Content>
          <Sidebar.Footer>
            <Sidebar.Trigger />
          </Sidebar.Footer>
        </Sidebar>
        <DemoMain>
          <PeekStateIndicator />
        </DemoMain>
      </Sidebar.Provider>
    </DemoContainer>
  );
}

// ---------------------------------------------------------------------------
// 6. Auto Scroll — keep long collapsible content in view
// ---------------------------------------------------------------------------

/** Long sidebar where opening a lower collapsible scrolls its revealed content into view. */
export function SidebarAutoScrollDemo() {
  return (
    <div class="relative h-[420px] w-full overflow-hidden rounded-lg border border-kumo-line bg-kumo-base">
      <Sidebar.Provider contained defaultOpen className="h-full min-h-0!">
        <Sidebar>
          <Sidebar.Header>
            <BrandLogo />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.GroupLabel>Overview</Sidebar.GroupLabel>
              <Sidebar.Menu>
                <Sidebar.MenuButton icon={HouseIcon} active>
                  Home
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={ChartBarIcon}>
                  Analytics
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={GlobeIcon}>
                  Domains
                </Sidebar.MenuButton>
              </Sidebar.Menu>
            </Sidebar.Group>

            <Sidebar.Group>
              <Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
              <Sidebar.Menu>
                <Sidebar.MenuButton icon={DatabaseIcon}>
                  Storage
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={ShieldCheckIcon}>
                  Security
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={LockIcon}>
                  Zero Trust
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={GearIcon}>
                  Settings
                </Sidebar.MenuButton>
              </Sidebar.Menu>
            </Sidebar.Group>

            <Sidebar.Group>
              <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.Collapsible autoScrollOnOpen>
                    <Sidebar.CollapsibleTrigger
                      render={(renderProps) => (
                        <Sidebar.MenuButton {...renderProps} icon={CodeIcon}>
                          Workers
                          <Sidebar.MenuChevron />
                        </Sidebar.MenuButton>
                      )}
                    />
                    <Sidebar.CollapsibleContent>
                      <Sidebar.MenuSub>
                        <Sidebar.MenuSubButton>Overview</Sidebar.MenuSubButton>
                        <Sidebar.MenuSubButton>
                          Deployments
                        </Sidebar.MenuSubButton>
                        <Sidebar.MenuSubButton>
                          Observability
                        </Sidebar.MenuSubButton>
                        <Sidebar.MenuSubButton>Settings</Sidebar.MenuSubButton>
                      </Sidebar.MenuSub>
                    </Sidebar.CollapsibleContent>
                  </Sidebar.Collapsible>
                </Sidebar.MenuItem>
                <Sidebar.MenuButton icon={CubeIcon}>
                  Containers
                  <Sidebar.MenuBadge>Beta</Sidebar.MenuBadge>
                </Sidebar.MenuButton>
              </Sidebar.Menu>
            </Sidebar.Group>
          </Sidebar.Content>
          <Sidebar.Footer>
            <Sidebar.Trigger />
          </Sidebar.Footer>
        </Sidebar>
        <DemoMain>
          <p>Open Workers near the bottom of the list</p>
        </DemoMain>
      </Sidebar.Provider>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 7. Sliding Views — animated horizontal transitions between surfaces
// ---------------------------------------------------------------------------

/** Sidebar with animated sliding views between Account and Zone navigation. */
export function SidebarSlidingViewsDemo() {
  const [surface, setSurface] = createSignal<"account" | "zone">("account");

  return (
    <DemoContainer>
      <Sidebar.Provider contained defaultOpen className="h-full min-h-0!">
        <Sidebar>
          <Sidebar.Header>
            <button
              type="button"
              onClick={() =>
                setSurface((s) => (s === "account" ? "zone" : "account"))
              }
              class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-kumo-default transition-colors hover:bg-kumo-tint"
            >
              <ArrowsLeftRightIcon className="size-4 shrink-0 text-kumo-brand" />
              <span class="flex-1 text-left font-semibold text-kumo-strong">
                {surface() === "account" ? "Account Nav" : "Zone Nav"}
              </span>
            </button>
          </Sidebar.Header>

          <Sidebar.SlidingViews
            activeKey={surface()}
            direction={surface() === "zone" ? "left" : "right"}
          >
            <Sidebar.SlidingView value="account">
              <Sidebar.Content>
                <Sidebar.Group>
                  <Sidebar.GroupLabel>Account</Sidebar.GroupLabel>
                  <Sidebar.Menu>
                    <Sidebar.MenuButton icon={HouseIcon} active>
                      Home
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={UserIcon}>
                      Members
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={ChartBarIcon}>
                      Analytics
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={GearIcon}>
                      Settings
                    </Sidebar.MenuButton>
                  </Sidebar.Menu>
                </Sidebar.Group>
              </Sidebar.Content>
            </Sidebar.SlidingView>

            <Sidebar.SlidingView value="zone">
              <Sidebar.Content>
                <Sidebar.Group>
                  <Sidebar.GroupLabel>Zone</Sidebar.GroupLabel>
                  <Sidebar.Menu>
                    <Sidebar.MenuButton icon={GlobeIcon} active>
                      Overview
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={ShieldCheckIcon}>
                      Security
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={LockIcon}>
                      SSL/TLS
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={DatabaseIcon}>
                      Caching
                    </Sidebar.MenuButton>
                  </Sidebar.Menu>
                </Sidebar.Group>
              </Sidebar.Content>
            </Sidebar.SlidingView>
          </Sidebar.SlidingViews>
        </Sidebar>
        <DemoMain>
          <div class="flex flex-col items-center gap-2">
            <p class="font-medium text-kumo-default">
              Active: {surface() === "account" ? "Account" : "Zone"} surface
            </p>
            <p>Click the header button to slide between views</p>
          </div>
        </DemoMain>
      </Sidebar.Provider>
    </DemoContainer>
  );
}

// ---------------------------------------------------------------------------
// 8. Full — kitchen sink showcasing every subcomponent
// ---------------------------------------------------------------------------

/** Kitchen sink sidebar showcasing every subcomponent: header with account switcher, groups with labels, collapsible sections with nested expandable, badges, sliding views via Domains, and a footer trigger. */
export function SidebarFullDemo() {
  const [surface, setSurface] = createSignal<"account" | "domain">("account");

  return (
    <DemoContainer>
      <Sidebar.Provider
        contained
        defaultOpen
        peekable
        className="h-full min-h-0!"
      >
        <Sidebar>
          <Sidebar.Header>
            <AccountSwitcher />
          </Sidebar.Header>
          <Sidebar.SlidingViews
            activeKey={surface()}
            direction={surface() === "domain" ? "left" : "right"}
          >
            <Sidebar.SlidingView value="account">
              <Sidebar.Content>
                <Sidebar.Group>
                  <Sidebar.Menu>
                    <Sidebar.MenuButton
                      icon={MagnifyingGlassIcon}
                      tooltip="Search"
                      className="mb-3 ring ring-kumo-line transition-[margin] duration-(--sidebar-animation-duration) group-data-[state=collapsed]/sidebar:mb-0 group-data-[state=collapsed]/sidebar:ring-transparent"
                    >
                      Quick search&hellip;
                    </Sidebar.MenuButton>
                  </Sidebar.Menu>
                </Sidebar.Group>
                <Sidebar.Group>
                  <Sidebar.Menu>
                    <Sidebar.MenuButton icon={HouseIcon} active>
                      Home
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={ChartBarIcon}>
                      Analytics & Logs
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton
                      icon={GlobeIcon}
                      onClick={() => setSurface("domain")}
                    >
                      Domains
                    </Sidebar.MenuButton>
                  </Sidebar.Menu>
                </Sidebar.Group>

                <Sidebar.Group>
                  <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
                  <Sidebar.Menu>
                    <Sidebar.MenuItem>
                      <Sidebar.Collapsible defaultOpen>
                        <Sidebar.CollapsibleTrigger
                          render={(renderProps) => (
                            <Sidebar.MenuButton
                              {...renderProps}
                              icon={CodeIcon}
                            >
                              Compute
                              <Sidebar.MenuChevron />
                            </Sidebar.MenuButton>
                          )}
                        />
                        <Sidebar.CollapsibleContent>
                          <Sidebar.MenuSub>
                            <Sidebar.MenuSubItem>
                              <Sidebar.Collapsible>
                                <Sidebar.CollapsibleTrigger
                                  render={(renderProps) => (
                                    <Sidebar.MenuSubButton {...renderProps}>
                                      Workers & Pages
                                      <Sidebar.MenuChevron />
                                    </Sidebar.MenuSubButton>
                                  )}
                                />
                                <Sidebar.CollapsibleContent>
                                  <Sidebar.MenuSub>
                                    <Sidebar.MenuSubButton>
                                      Overview
                                    </Sidebar.MenuSubButton>
                                    <Sidebar.MenuSubButton>
                                      Workers
                                    </Sidebar.MenuSubButton>
                                    <Sidebar.MenuSubButton>
                                      Pages
                                    </Sidebar.MenuSubButton>
                                  </Sidebar.MenuSub>
                                </Sidebar.CollapsibleContent>
                              </Sidebar.Collapsible>
                            </Sidebar.MenuSubItem>
                            <Sidebar.MenuSubButton>
                              Durable Objects
                            </Sidebar.MenuSubButton>
                            <Sidebar.MenuSubButton>
                              Containers
                              <Sidebar.MenuBadge>Beta</Sidebar.MenuBadge>
                            </Sidebar.MenuSubButton>
                          </Sidebar.MenuSub>
                        </Sidebar.CollapsibleContent>
                      </Sidebar.Collapsible>
                    </Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={DatabaseIcon}>
                      Storage
                    </Sidebar.MenuButton>
                  </Sidebar.Menu>
                </Sidebar.Group>

                <Sidebar.Group>
                  <Sidebar.GroupLabel>Protect & Connect</Sidebar.GroupLabel>
                  <Sidebar.Menu>
                    <Sidebar.MenuButton icon={ShieldCheckIcon}>
                      Security
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={LockIcon}>
                      Zero Trust
                      <Sidebar.MenuBadge>Beta</Sidebar.MenuBadge>
                    </Sidebar.MenuButton>
                  </Sidebar.Menu>
                </Sidebar.Group>
              </Sidebar.Content>
            </Sidebar.SlidingView>

            <Sidebar.SlidingView value="domain">
              <Sidebar.Content>
                <Sidebar.Group>
                  <Sidebar.Menu>
                    <Sidebar.MenuButton
                      icon={ArrowLeftIcon}
                      onClick={() => setSurface("account")}
                    >
                      Back
                    </Sidebar.MenuButton>
                  </Sidebar.Menu>
                </Sidebar.Group>
                <Sidebar.Group>
                  <Sidebar.GroupLabel>example.com</Sidebar.GroupLabel>
                  <Sidebar.Menu>
                    <Sidebar.MenuButton icon={GlobeIcon} active>
                      Overview
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={ShieldCheckIcon}>
                      Security
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={LockIcon}>
                      SSL/TLS
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={ChartBarIcon}>
                      Analytics
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={DatabaseIcon}>
                      Caching
                    </Sidebar.MenuButton>
                  </Sidebar.Menu>
                </Sidebar.Group>
              </Sidebar.Content>
            </Sidebar.SlidingView>
          </Sidebar.SlidingViews>

          <Sidebar.Footer>
            <Sidebar.Trigger />
          </Sidebar.Footer>
        </Sidebar>
        <DemoMain />
      </Sidebar.Provider>
    </DemoContainer>
  );
}

// ---------------------------------------------------------------------------
// 9. Mobile — navigation drawer with Escape to close
// ---------------------------------------------------------------------------

function MobileToggleButton() {
  const { toggleSidebar, openMobile } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      class="cursor-pointer rounded-lg border border-kumo-line bg-kumo-base px-3 py-1.5 text-base text-kumo-default transition-colors hover:bg-kumo-tint"
    >
      {openMobile ? "Close sidebar" : "Open sidebar"}
    </button>
  );
}

/** Mobile sidebar demo. Uses a high `mobileBreakpoint` to force mobile mode at any viewport width. */
export function SidebarMobileDemo() {
  return (
    <div class="relative h-[540px] w-full overflow-hidden rounded-lg border border-kumo-line bg-kumo-base">
      <Sidebar.Provider contained mobileBreakpoint={9999} className="h-full">
        <Sidebar>
          <Sidebar.Header>
            <BrandLogo />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.GroupLabel>Overview</Sidebar.GroupLabel>
              <Sidebar.Menu>
                <Sidebar.MenuButton icon={HouseIcon} active>
                  Home
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={ChartBarIcon}>
                  Analytics
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={GlobeIcon}>
                  Domains
                </Sidebar.MenuButton>
              </Sidebar.Menu>
            </Sidebar.Group>

            <Sidebar.Group>
              <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
              <Sidebar.Menu>
                <Sidebar.MenuButton icon={CodeIcon}>Compute</Sidebar.MenuButton>
                <Sidebar.MenuButton icon={DatabaseIcon}>
                  Storage
                </Sidebar.MenuButton>
              </Sidebar.Menu>
            </Sidebar.Group>
          </Sidebar.Content>
          <Sidebar.Footer>
            <Sidebar.Trigger />
          </Sidebar.Footer>
        </Sidebar>
        <DemoMain>
          <MobileToggleButton />
          <p>Click the button to open the mobile sidebar</p>
          <p class="text-sm text-kumo-subtle">
            Press Escape or click the backdrop to close
          </p>
        </DemoMain>
      </Sidebar.Provider>
    </div>
  );
}
// ---------------------------------------------------------------------------
// 10. Full-screen mobile — nav fills the viewport, route lives in breadcrumbs
// ---------------------------------------------------------------------------

/** A node in the nav tree. Leaves are navigable; branches expand. */
interface NavNode {
  label: string;
  icon?: Component;
  /** Small status pill, e.g. "Beta" / "New". */
  badge?: string;
  children?: NavNode[];
}

/** Status pill used beside nav labels. */
function NavBadge({ children }: { children: JSX.Element }) {
  return (
    <span class="ml-1.5 shrink-0 rounded-full border border-dashed border-kumo-line px-1.5 py-px text-[10px] font-medium text-kumo-subtle">
      {children}
    </span>
  );
}

/** Quick search affordance pinned above the nav list. */
function QuickSearch() {
  return (
    <button
      type="button"
      class="group flex h-8 w-full shrink-0 cursor-pointer items-center gap-2 overflow-x-clip rounded-lg border-0 bg-kumo-base px-3 text-left text-sm font-normal !text-kumo-default shadow-xs ring ring-kumo-line transition-[color,background,border,box-shadow] duration-250 select-none not-disabled:hover:bg-kumo-tint focus:ring-kumo-focus/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand"
    >
      <MagnifyingGlassIcon className="size-4 shrink-0" />
      <span class="flex-1 text-left">Quick search...</span>
      <kbd class="shrink-0 font-sans text-xs text-kumo-subtle">⌘K</kbd>
    </button>
  );
}

/**
 * The nav tree. Breadcrumbs are derived from this, so the trail can never drift
 * out of sync with the sidebar — selecting a leaf yields its full ancestry.
 */
const NAV_TREE: { group: string | null; items: NavNode[] }[] = [
  {
    group: null,
    items: [
      { label: "Account home", icon: HouseIcon },
      { label: "Recents", icon: ClockCounterClockwiseIcon },
      { label: "Domains", icon: GlobeIcon },
    ],
  },
  {
    group: "Observe",
    items: [
      {
        label: "Investigate",
        icon: FileMagnifyingGlassIcon,
        children: [
          { label: "Log Explorer" },
          { label: "Trace", badge: "Beta" },
          { label: "Logpush" },
        ],
      },
      {
        label: "Analytics",
        icon: ChartPieIcon,
        children: [
          { label: "Dashboards", badge: "New" },
          { label: "Account analytics" },
          { label: "Web analytics" },
        ],
      },
    ],
  },
  {
    group: "Build",
    items: [
      {
        label: "Compute",
        icon: CodeIcon,
        children: [
          { label: "Workers & Pages" },
          { label: "Observability" },
          { label: "Workers for Platforms" },
          { label: "Containers" },
          { label: "Durable Objects" },
          { label: "Queues" },
          { label: "Workflows" },
          { label: "Browser Run" },
          { label: "VPC", badge: "Beta" },
        ],
      },
      {
        label: "Storage & Databases",
        icon: DatabaseIcon,
        children: [
          { label: "R2 Object Storage" },
          { label: "KV" },
          { label: "D1 SQL Database" },
          { label: "Hyperdrive" },
        ],
      },
    ],
  },
  {
    group: "Secure",
    items: [
      {
        label: "Access",
        icon: LockIcon,
        children: [{ label: "Applications" }, { label: "Service Auth" }],
      },
      { label: "WAF", icon: ShieldCheckIcon },
    ],
  },
];

/**
 * Renders a nav subtree. Branches are collapsible and auto-open when they are
 * on the selected path; leaves select and close the nav.
 */
function NavSubtree(props: {
  nodes: NavNode[];
  path: string[];
  selected: string[];
  onSelect: (path: string[]) => void;
}) {
  return (
    <Sidebar.MenuSub>
      {props.nodes.map((node) => {
        const nodePath = [...props.path, node.label];
        const onSelectedPath = () =>
          nodePath.every((part, index) => props.selected[index] === part);

        if (!node.children) {
          return (
            <Sidebar.MenuSubItem>
              <Sidebar.MenuSubButton
                active={
                  onSelectedPath() && props.selected.length === nodePath.length
                }
                onClick={() => props.onSelect(nodePath)}
              >
                {node.label}
                {node.badge && <NavBadge>{node.badge}</NavBadge>}
              </Sidebar.MenuSubButton>
            </Sidebar.MenuSubItem>
          );
        }

        return (
          <Sidebar.MenuSubItem>
            <Sidebar.Collapsible defaultOpen={onSelectedPath()}>
              <Sidebar.CollapsibleTrigger
                render={(renderProps) => (
                  <Sidebar.MenuSubButton {...renderProps}>
                    {node.label}
                    <Sidebar.MenuChevron />
                  </Sidebar.MenuSubButton>
                )}
              />
              <Sidebar.CollapsibleContent>
                <NavSubtree
                  nodes={node.children}
                  path={nodePath}
                  selected={props.selected}
                  onSelect={props.onSelect}
                />
              </Sidebar.CollapsibleContent>
            </Sidebar.Collapsible>
          </Sidebar.MenuSubItem>
        );
      })}
    </Sidebar.MenuSub>
  );
}

/** Closes the mobile nav after a leaf is chosen, mirroring real navigation. */
function NavTree(props: {
  selected: string[];
  onSelect: (path: string[]) => void;
}) {
  const { setOpenMobile } = useSidebar();
  const select = (path: string[]) => {
    props.onSelect(path);
    setOpenMobile(false);
  };

  return (
    <>
      {NAV_TREE.map(({ group, items }) => (
        <Sidebar.Group>
          {group && <Sidebar.GroupLabel>{group}</Sidebar.GroupLabel>}
          <Sidebar.Menu>
            {items.map((node) => {
              const nodePath = [node.label];
              const onSelectedPath = () => props.selected[0] === node.label;

              if (!node.children) {
                return (
                  <Sidebar.MenuButton
                    icon={node.icon}
                    active={onSelectedPath() && props.selected.length === 1}
                    onClick={() => select(nodePath)}
                  >
                    {node.label}
                  </Sidebar.MenuButton>
                );
              }

              return (
                <Sidebar.MenuItem>
                  <Sidebar.Collapsible defaultOpen={onSelectedPath()}>
                    <Sidebar.CollapsibleTrigger
                      render={(renderProps) => (
                        <Sidebar.MenuButton {...renderProps} icon={node.icon}>
                          {node.label}
                          <Sidebar.MenuChevron />
                        </Sidebar.MenuButton>
                      )}
                    />
                    <Sidebar.CollapsibleContent>
                      <NavSubtree
                        nodes={node.children}
                        path={nodePath}
                        selected={props.selected}
                        onSelect={select}
                      />
                    </Sidebar.CollapsibleContent>
                  </Sidebar.Collapsible>
                </Sidebar.MenuItem>
              );
            })}
          </Sidebar.Menu>
        </Sidebar.Group>
      ))}
    </>
  );
}

/**
 * Full-screen mobile nav. The sheet covers the viewport instead of leaving a
 * sliver of the page behind, so nav items get comfortable touch targets. The
 * current route is carried by breadcrumbs derived from the nav tree itself.
 */
export function SidebarFullScreenMobileDemo() {
  // Deep default selection, so the trail starts in a realistic overflow state.
  const [selected, setSelected] = createSignal([
    "Analytics",
    "Account analytics",
  ]);
  // Narrower than the demo box, so overflow collapsing is visible without
  // needing to resize the browser.
  const [width, setWidth] = createSignal(390);

  // Trail derived from the selection: ancestors collapse, leaf is current.
  const ancestors = createMemo(() => selected().slice(0, -1));
  const current = createMemo(() => selected()[selected().length - 1]);
  // No overflow machinery: render the trail plainly and let the leaf truncate
  // when it runs out of room. Simpler, and the route stays readable because it
  // is the only thing allowed to shrink.
  // No account crumb — the avatar to the left already carries it, and at phone
  // widths every crumb spent on context is width taken from the actual route.
  const trail = ancestors;

  return (
    <div class="flex flex-col gap-3">
      {/* Width control — stands in for resizing a real phone viewport. */}
      <label class="flex items-center gap-3 text-sm text-kumo-subtle">
        <span class="shrink-0">Viewport</span>
        <input
          type="range"
          min={280}
          max={720}
          value={width()}
          onInput={(e) => setWidth(Number(e.target.value))}
          class="flex-1 cursor-pointer"
        />
        <span class="w-14 shrink-0 text-right tabular-nums">{width()}px</span>
      </label>

      <div
        class="relative h-[540px] overflow-hidden rounded-lg border border-kumo-line bg-kumo-base"
        style={{ width: `${width()}px` }}
      >
        <Sidebar.Provider contained mobileBreakpoint={9999} className="h-full">
          <Sidebar fullScreenOnMobile>
            {/* Single row: avatar, then the trail takes the rest of the width.
                Mirrors the product header — account mark, then breadcrumbs. */}
            <Sidebar.Header className="gap-2 px-3.5">
              <CompactAccountSwitcher />
              <div class="min-w-0 flex-1">
                <Breadcrumbs size="sm">
                  {trail().map((label) => (
                    <>
                      <Breadcrumbs.Link href="#">{label}</Breadcrumbs.Link>
                      <Breadcrumbs.Separator />
                    </>
                  ))}
                  <Breadcrumbs.Current>{current()}</Breadcrumbs.Current>
                </Breadcrumbs>
              </div>
              <Sidebar.Close />
            </Sidebar.Header>
            <Sidebar.Content>
              <div class="pt-1 pb-2">
                <QuickSearch />
              </div>
              <NavTree selected={selected()} onSelect={setSelected} />
            </Sidebar.Content>
          </Sidebar>

          <div class="flex min-w-0 flex-1 flex-col">
            <header class="flex h-12 shrink-0 items-center gap-2 border-b border-kumo-line px-3">
              <Sidebar.Trigger />
              <div class="min-w-0 flex-1">
                <Breadcrumbs size="sm">
                  {trail().map((label) => (
                    <>
                      <Breadcrumbs.Link href="#">{label}</Breadcrumbs.Link>
                      <Breadcrumbs.Separator />
                    </>
                  ))}
                  <Breadcrumbs.Current>{current()}</Breadcrumbs.Current>
                </Breadcrumbs>
              </div>
            </header>
            <DemoMain>
              <p class="text-kumo-default">{current()}</p>
              <p class="text-sm text-kumo-subtle">
                Drill into the nav — the trail is derived from the tree, so it
                always matches where you are.
              </p>
            </DemoMain>
          </div>
        </Sidebar.Provider>
      </div>
    </div>
  );
}
