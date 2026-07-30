import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal, type JSX } from "solid-js";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import {
  KUMO_SIDEBAR_DEFAULT_VARIANTS,
  KUMO_SIDEBAR_STYLING,
  KUMO_SIDEBAR_VARIANTS,
  Sidebar,
  SidebarClose,
  SidebarCollapsible,
  SidebarCollapsibleContent,
  SidebarCollapsibleTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarLoading,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuChevron,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarResizeHandle,
  SidebarSeparator,
  SidebarSlidingView,
  SidebarSlidingViews,
  SidebarTrigger,
  useSidebar,
  type SidebarProviderProps,
} from "./sidebar";

function setMobileMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

beforeEach(() => {
  setMobileMatchMedia(false);
});

function TestSidebar(
  props: Omit<SidebarProviderProps, "children"> & {
    children: JSX.Element;
  },
) {
  return (
    <SidebarProvider {...props}>
      <Sidebar>{props.children}</Sidebar>
      <main data-testid="main">Main</main>
    </SidebarProvider>
  );
}

function StateReader() {
  const sidebar = useSidebar();
  return (
    <output
      data-testid="state"
      data-state={sidebar.state}
      data-open={String(sidebar.open)}
      data-peeking={String(sidebar.isPeeking)}
      data-width={String(sidebar.width)}
    />
  );
}

describe("Sidebar", () => {
  it("exposes the complete compound API and metadata", () => {
    expect(Sidebar.Provider).toBe(SidebarProvider);
    expect(Sidebar.Header).toBe(SidebarHeader);
    expect(Sidebar.Content).toBe(SidebarContent);
    expect(Sidebar.Footer).toBe(SidebarFooter);
    expect(Sidebar.Loading).toBe(SidebarLoading);
    expect(Sidebar.Group).toBe(SidebarGroup);
    expect(Sidebar.GroupLabel).toBe(SidebarGroupLabel);
    expect(Sidebar.Menu).toBe(SidebarMenu);
    expect(Sidebar.MenuItem).toBe(SidebarMenuItem);
    expect(Sidebar.MenuButton).toBe(SidebarMenuButton);
    expect(Sidebar.MenuBadge).toBe(SidebarMenuBadge);
    expect(Sidebar.MenuSub).toBe(SidebarMenuSub);
    expect(Sidebar.MenuSubItem).toBe(SidebarMenuSubItem);
    expect(Sidebar.MenuSubButton).toBe(SidebarMenuSubButton);
    expect(Sidebar.Separator).toBe(SidebarSeparator);
    expect(Sidebar.Trigger).toBe(SidebarTrigger);
    expect(Sidebar.Close).toBe(SidebarClose);
    expect(Sidebar.Rail).toBe(SidebarRail);
    expect(Sidebar.ResizeHandle).toBe(SidebarResizeHandle);
    expect(Sidebar.MenuChevron).toBe(SidebarMenuChevron);
    expect(Sidebar.Collapsible).toBe(SidebarCollapsible);
    expect(Sidebar.CollapsibleTrigger).toBe(SidebarCollapsibleTrigger);
    expect(Sidebar.CollapsibleContent).toBe(SidebarCollapsibleContent);
    expect(Sidebar.SlidingViews).toBe(SidebarSlidingViews);
    expect(Sidebar.SlidingView).toBe(SidebarSlidingView);
    expect(Sidebar).not.toHaveProperty("Input");
    expect(KUMO_SIDEBAR_VARIANTS.collapsible).toHaveProperty("offcanvas");
    expect(KUMO_SIDEBAR_DEFAULT_VARIANTS.side).toBe("left");
    expect(KUMO_SIDEBAR_STYLING.width.icon).toBe("57px");
    expect(SidebarResizeHandle.displayName).toBe("Sidebar.ResizeHandle");
  });

  it("rejects context consumers outside a provider", () => {
    function InvalidConsumer() {
      useSidebar();
      return null;
    }
    expect(() => render(() => <InvalidConsumer />)).toThrow(
      "useSidebar must be used within a Sidebar.Provider",
    );
  });

  it("toggles uncontrolled state and calls a supplied click handler", () => {
    const onClick = vi.fn();
    render(() => (
      <TestSidebar defaultOpen>
        <SidebarContent>
          <StateReader />
        </SidebarContent>
        <SidebarTrigger onClick={onClick} />
      </TestSidebar>
    ));

    const trigger = screen.getByRole("button", {
      name: "Collapse sidebar",
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalledOnce();
    expect(trigger.getAttribute("aria-label")).toBe("Expand sidebar");
    expect(screen.getByTestId("state").dataset.state).toBe("collapsed");
  });

  it("supports controlled state updates", () => {
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = createSignal(true);
      return (
        <SidebarProvider
          open={open()}
          onOpenChange={(next) => {
            onOpenChange(next);
            setOpen(next);
          }}
        >
          <Sidebar>
            <SidebarTrigger />
            <StateReader />
          </Sidebar>
        </SidebarProvider>
      );
    }
    render(() => <Controlled />);
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByTestId("state").dataset.open).toBe("false");
  });

  it("renders a fixed, non-collapsible sidebar", () => {
    render(() => (
      <TestSidebar collapsible="none" defaultOpen={false}>
        <SidebarContent>Navigation</SidebarContent>
      </TestSidebar>
    ));
    const sidebar = document.querySelector(
      "[data-sidebar='sidebar']",
    ) as HTMLElement;
    expect(sidebar.tagName).toBe("ASIDE");
    expect(sidebar.dataset.state).toBe("expanded");
    expect(sidebar.style.width).toBe("var(--sidebar-width)");
  });

  it("peeks only while a collapsed, peekable sidebar is engaged", () => {
    render(() => (
      <TestSidebar defaultOpen={false} peekable>
        <SidebarContent>
          <StateReader />
        </SidebarContent>
      </TestSidebar>
    ));
    const zone = document.querySelector(
      "[data-sidebar='peek-zone']",
    ) as HTMLElement;
    fireEvent.mouseEnter(zone);
    expect(screen.getByTestId("state").dataset.state).toBe("peeking");
    fireEvent.mouseLeave(zone);
    expect(screen.getByTestId("state").dataset.state).toBe("collapsed");
  });

  it("keeps contained layouts scoped to their parent", () => {
    const { unmount } = render(() => (
      <TestSidebar contained>
        <SidebarContent>Navigation</SidebarContent>
      </TestSidebar>
    ));
    expect(
      document.querySelector("[data-sidebar-wrapper]")?.className,
    ).not.toContain("min-h-svh");
    unmount();
    render(() => (
      <TestSidebar>
        <SidebarContent>Navigation</SidebarContent>
      </TestSidebar>
    ));
    expect(
      document.querySelector("[data-sidebar-wrapper]")?.className,
    ).toContain("min-h-svh");
  });
});

describe("Sidebar menus", () => {
  it("auto-wraps menu buttons and preserves active state", () => {
    render(() => (
      <TestSidebar>
        <SidebarMenu>
          <SidebarMenuButton active>Home</SidebarMenuButton>
        </SidebarMenu>
      </TestSidebar>
    ));
    const button = screen.getByRole("button", { name: "Home" });
    expect(button.closest("li")?.dataset.sidebar).toBe("menu-item");
    expect(button.hasAttribute("data-active")).toBe(true);
  });

  it("does not add a second list item inside MenuItem", () => {
    render(() => (
      <TestSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Home</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </TestSidebar>
    ));
    expect(document.querySelectorAll("li")).toHaveLength(1);
  });

  it("renders primary and nested navigation links", () => {
    render(() => (
      <TestSidebar>
        <SidebarMenu>
          <SidebarMenuButton href="/home" target="_blank">
            Home
          </SidebarMenuButton>
          <SidebarMenuSub>
            <SidebarMenuSubButton href="/workers" target="_self">
              Workers
            </SidebarMenuSubButton>
          </SidebarMenuSub>
        </SidebarMenu>
      </TestSidebar>
    ));
    const home = screen.getByRole("link", { name: "Home" });
    const workers = screen.getByRole("link", { name: "Workers" });
    expect(home.getAttribute("href")).toBe("/home");
    expect(home.getAttribute("target")).toBe("_blank");
    expect(workers.getAttribute("href")).toBe("/workers");
    expect(workers.getAttribute("target")).toBe("_self");
  });

  it("merges tooltip trigger behavior into a collapsed menu button", () => {
    render(() => (
      <TestSidebar defaultOpen={false}>
        <SidebarMenu>
          <SidebarMenuButton tooltip="Go home">Home</SidebarMenuButton>
        </SidebarMenu>
      </TestSidebar>
    ));
    const button = screen.getByRole("button", { name: "Home" });
    expect(button.hasAttribute("data-base-ui-tooltip-trigger")).toBe(true);
  });
});

describe("Sidebar.Collapsible", () => {
  function CollapsibleExample(props: {
    defaultOpen?: boolean;
    autoScrollOnOpen?: boolean;
  }) {
    return (
      <TestSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarCollapsible {...props}>
              <SidebarCollapsibleTrigger
                render={(triggerProps) => (
                  <SidebarMenuButton {...triggerProps}>
                    Compute
                    <SidebarMenuChevron />
                  </SidebarMenuButton>
                )}
              />
              <SidebarCollapsibleContent data-testid="collapsible">
                <SidebarMenuSubButton>Workers</SidebarMenuSubButton>
              </SidebarCollapsibleContent>
            </SidebarCollapsible>
          </SidebarMenuItem>
        </SidebarMenu>
      </TestSidebar>
    );
  }

  it("connects trigger and region, toggling aria-hidden and inert", () => {
    render(() => <CollapsibleExample />);
    const trigger = screen.getByRole("button", { name: /Compute/ });
    const content = screen.getByTestId("collapsible");
    expect(trigger.getAttribute("aria-controls")).toBe(content.id);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(content.getAttribute("role")).toBe("region");
    expect(content.hasAttribute("inert")).toBe(true);
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(content.getAttribute("aria-hidden")).toBe("false");
    expect(content.hasAttribute("inert")).toBe(false);
  });

  it("scrolls newly opened content into view when requested", () => {
    vi.useFakeTimers();
    const scrollIntoView = vi.fn();
    const original = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "scrollIntoView",
    );
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });
    try {
      render(() => <CollapsibleExample autoScrollOnOpen />);
      fireEvent.click(screen.getByRole("button", { name: /Compute/ }));
      vi.advanceTimersByTime(250);
      expect(scrollIntoView).toHaveBeenCalledWith({
        block: "nearest",
        behavior: "smooth",
      });
    } finally {
      if (original) {
        Object.defineProperty(
          HTMLElement.prototype,
          "scrollIntoView",
          original,
        );
      } else {
        Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
      }
      vi.useRealTimers();
    }
  });
});

describe("Sidebar.SlidingViews", () => {
  it("reactively moves accessibility state between views", () => {
    function SlidingExample() {
      const [active, setActive] = createSignal("account");
      return (
        <TestSidebar>
          <button type="button" onClick={() => setActive("zone")}>
            Switch
          </button>
          <SidebarSlidingViews activeKey={active()}>
            <SidebarSlidingView value="account">
              <span>Account</span>
            </SidebarSlidingView>
            <SidebarSlidingView value="zone">
              <span>Zone</span>
            </SidebarSlidingView>
          </SidebarSlidingViews>
        </TestSidebar>
      );
    }
    render(() => <SlidingExample />);
    const account = screen
      .getByText("Account")
      .closest("[data-sidebar='sliding-view']") as HTMLElement;
    const zone = screen
      .getByText("Zone")
      .closest("[data-sidebar='sliding-view']") as HTMLElement;
    expect(account.getAttribute("aria-hidden")).toBe("false");
    expect(zone.hasAttribute("inert")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Switch" }));
    expect(account.hasAttribute("inert")).toBe(true);
    expect(zone.getAttribute("aria-hidden")).toBe("false");
    expect(zone.parentElement?.getAttribute("style")).toContain(
      "translateX(-100%)",
    );
  });
});

describe("Sidebar.ResizeHandle", () => {
  it("provides keyboard resizing and clamps width", () => {
    render(() => (
      <TestSidebar
        defaultOpen
        resizable
        defaultWidth={240}
        minWidth={230}
        maxWidth={250}
      >
        <SidebarResizeHandle data-testid="resize" />
        <StateReader />
      </TestSidebar>
    ));
    const handle = screen.getByTestId("resize");
    expect(handle.getAttribute("aria-label")).toBe("Resize sidebar");
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(screen.getByTestId("state").dataset.width).toBe("250");
    fireEvent.keyDown(handle, { key: "End" });
    expect(screen.getByTestId("state").dataset.width).toBe("250");
    fireEvent.keyDown(handle, { key: "Home" });
    expect(screen.getByTestId("state").dataset.open).toBe("false");
  });

  it("resizes with pointer movement and reports the new width", () => {
    const onWidthChange = vi.fn();
    render(() => (
      <TestSidebar
        defaultOpen
        resizable
        defaultWidth={240}
        minWidth={180}
        maxWidth={400}
        onWidthChange={onWidthChange}
      >
        <SidebarResizeHandle data-testid="resize" />
      </TestSidebar>
    ));
    const sidebar = document.querySelector(
      "[data-sidebar='sidebar']",
    ) as HTMLElement;
    sidebar.getBoundingClientRect = () => ({ width: 240 }) as DOMRect;
    fireEvent.pointerDown(screen.getByTestId("resize"), {
      clientX: 240,
    });
    fireEvent.pointerMove(document, { clientX: 300 });
    fireEvent.pointerUp(document);
    expect(onWidthChange).toHaveBeenCalledWith(300);
  });
});

describe("Sidebar mobile behavior", () => {
  function MobileToggle() {
    const sidebar = useSidebar();
    return (
      <button
        type="button"
        data-testid="mobile-toggle"
        onClick={sidebar.toggleSidebar}
      >
        Open sidebar
      </button>
    );
  }

  function MobileExample() {
    return (
      <SidebarProvider mobileBreakpoint={9999}>
        <MobileToggle />
        <Sidebar>
          <SidebarContent>
            <SidebarMenuButton>Home</SidebarMenuButton>
          </SidebarContent>
        </Sidebar>
        <button type="button" data-testid="outside">
          Outside
        </button>
      </SidebarProvider>
    );
  }

  it("keeps closed navigation inaccessible", () => {
    setMobileMatchMedia(true);
    render(() => <MobileExample />);
    const navigation = document.querySelector(
      "nav[data-sidebar='sidebar']",
    ) as HTMLElement;
    expect(navigation.getAttribute("aria-hidden")).toBe("true");
    expect(navigation.hasAttribute("inert")).toBe(true);
  });

  it("focuses the first item on open and restores the opener on Escape", async () => {
    setMobileMatchMedia(true);
    render(() => <MobileExample />);
    const toggle = screen.getByTestId("mobile-toggle");
    const navigation = document.querySelector(
      "nav[data-sidebar='sidebar']",
    ) as HTMLElement;
    toggle.focus();
    fireEvent.click(toggle);
    await waitFor(() =>
      expect(navigation.getAttribute("aria-hidden")).toBe("false"),
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Home" }),
      ),
    );
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() =>
      expect(navigation.getAttribute("aria-hidden")).toBe("true"),
    );
    await waitFor(() => expect(document.activeElement).toBe(toggle));
  });

  it("does not close when focus moves to portaled or external content", async () => {
    setMobileMatchMedia(true);
    render(() => <MobileExample />);
    const navigation = document.querySelector(
      "nav[data-sidebar='sidebar']",
    ) as HTMLElement;
    fireEvent.click(screen.getByTestId("mobile-toggle"));
    await waitFor(() =>
      expect(navigation.getAttribute("aria-hidden")).toBe("false"),
    );
    const outside = screen.getByTestId("outside");
    outside.focus();
    fireEvent.focusOut(navigation, { relatedTarget: outside });
    expect(navigation.getAttribute("aria-hidden")).toBe("false");
  });
});

describe("Sidebar.Loading", () => {
  it("renders a labeled status with all placeholder rows", () => {
    let element: HTMLDivElement | undefined;
    render(() => (
      <TestSidebar>
        <SidebarLoading
          ref={(node) => {
            element = node;
          }}
          label="Loading navigation"
          className="custom-loading"
        />
      </TestSidebar>
    ));
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-label")).toBe("Loading navigation");
    expect(status.querySelectorAll(".skeleton-line")).toHaveLength(14);
    expect(element).toBe(status);
    expect(status.classList.contains("custom-loading")).toBe(true);
  });
});
