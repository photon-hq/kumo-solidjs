import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { hydrate } from "solid-js/web";
import { describe, expect, it, vi } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import {
  Autocomplete as BuiltAutocomplete,
  Banner as BuiltBanner,
  Breadcrumbs as BuiltBreadcrumbs,
  Button as BuiltButton,
  Chart as BuiltChart,
  ChartLegend as BuiltChartLegend,
  ClipboardText as BuiltClipboardText,
  CloudflareLogo as BuiltCloudflareLogo,
  Code as BuiltCode,
  Collapsible as BuiltCollapsible,
  Combobox as BuiltCombobox,
  CommandPalette as BuiltCommandPalette,
  DatePicker as BuiltDatePicker,
  DateRangePicker as BuiltDateRangePicker,
  Dialog as BuiltDialog,
  DropdownMenu as BuiltDropdownMenu,
  Empty as BuiltEmpty,
  Flow as BuiltFlow,
  Grid as BuiltGrid,
  GridItem as BuiltGridItem,
  Input as BuiltInput,
  InputArea as BuiltInputArea,
  InputGroup as BuiltInputGroup,
  LayerCard as BuiltLayerCard,
  Link as BuiltLink,
  MenuBar as BuiltMenuBar,
  Meter as BuiltMeter,
  Pagination as BuiltPagination,
  Popover as BuiltPopover,
  Radio as BuiltRadio,
  Select as BuiltSelect,
  SensitiveInput as BuiltSensitiveInput,
  Sidebar as BuiltSidebar,
  Surface as BuiltSurface,
  Switch as BuiltSwitch,
  Table as BuiltTable,
  TableOfContents as BuiltTableOfContents,
  Tabs as BuiltTabs,
  Toasty as BuiltToasty,
  TimeseriesChart as BuiltTimeseriesChart,
  Toolbar as BuiltToolbar,
  createKumoToastManager as createBuiltKumoToastManager,
  useSidebar as useBuiltSidebar,
} from "@photon-ai/kumo-solid";
import { Button } from "../src/components/button";
import { Checkbox } from "../src/components/checkbox";
import { Empty } from "../src/components/empty";
import { Input, InputArea } from "../src/components/input";
import { Link } from "../src/components/link";
import { Meter } from "../src/components/meter";
import { Tooltip, TooltipProvider } from "../src/components/tooltip";

declare const __KUMO_SOLID_HYDRATION_HTML__: string;

function BuiltHydrationFixture(props: { onClick: () => void }) {
  return (
    <>
      <BuiltBanner
        title="Hydrated notice"
        description="Hydrated banner description"
        action={<BuiltBanner.Action>Hydrated retry</BuiltBanner.Action>}
      />
      <BuiltButton onClick={props.onClick}>Hydrated action</BuiltButton>
      <BuiltToasty>Hydrated toast provider</BuiltToasty>
      <BuiltLayerCard>
        <BuiltLayerCard.Primary>Hydrated layer</BuiltLayerCard.Primary>
      </BuiltLayerCard>
      <BuiltGrid variant="2up">
        <BuiltGridItem>
          <BuiltCode code="pnpm test" />
        </BuiltGridItem>
      </BuiltGrid>
      <BuiltInput label="Hydrated email" value="user@example.com" />
      <BuiltInputArea
        aria-label="Hydrated notes"
        defaultValue="Initial notes"
      />
      <BuiltInputGroup label="Hydrated domain">
        <BuiltInputGroup.Input defaultValue="kumo" />
        <BuiltInputGroup.Suffix>.workers.dev</BuiltInputGroup.Suffix>
      </BuiltInputGroup>
      <BuiltSensitiveInput
        label="Hydrated API key"
        defaultValue="secret-value"
      />
      <BuiltSelect
        aria-label="Hydrated database"
        value="postgres"
        items={[
          { label: "PostgreSQL", value: "postgres" },
          { label: "MySQL", value: "mysql" },
        ]}
      />
      <BuiltAutocomplete items={["Workers", "Pages"]}>
        <BuiltAutocomplete.InputGroup
          aria-label="Hydrated product search"
          placeholder="Search products"
        />
      </BuiltAutocomplete>
      <BuiltCombobox items={["Virginia", "London"]} defaultValue="London">
        <BuiltCombobox.TriggerValue
          aria-label="Hydrated region"
          placeholder="Choose a region"
        />
      </BuiltCombobox>
      <BuiltCommandPalette.Panel items={["Create project"]}>
        <BuiltCommandPalette.Input
          aria-label="Hydrated command search"
          autoFocus={false}
          placeholder="Search commands"
        />
      </BuiltCommandPalette.Panel>
      <BuiltPagination
        page={2}
        perPage={10}
        totalCount={100}
        setPage={() => undefined}
      />
      <BuiltTabs
        selectedValue="analytics"
        tabs={[
          { value: "overview", label: "Hydrated overview" },
          { value: "analytics", label: "Hydrated analytics" },
        ]}
      />
      <BuiltPopover>
        <BuiltPopover.Trigger>Hydrated popover trigger</BuiltPopover.Trigger>
        <BuiltPopover.Content>
          <BuiltPopover.Title>Hydrated popover content</BuiltPopover.Title>
        </BuiltPopover.Content>
      </BuiltPopover>
      <BuiltDialog.Root>
        <BuiltDialog.Trigger>Hydrated dialog trigger</BuiltDialog.Trigger>
        <BuiltDialog>
          <BuiltDialog.Title>Hydrated dialog content</BuiltDialog.Title>
        </BuiltDialog>
      </BuiltDialog.Root>
      <BuiltDropdownMenu>
        <BuiltDropdownMenu.Trigger>
          Hydrated menu trigger
        </BuiltDropdownMenu.Trigger>
        <BuiltDropdownMenu.Content>
          <BuiltDropdownMenu.Item>Hydrated menu item</BuiltDropdownMenu.Item>
        </BuiltDropdownMenu.Content>
      </BuiltDropdownMenu>
      <BuiltLink href="/hydrated">Hydrated link</BuiltLink>
      <BuiltMeter label="Hydrated storage" value={65} />
      <BuiltSurface as="section">Hydrated surface</BuiltSurface>
      <BuiltEmpty title="Hydrated empty state" />
      <BuiltBreadcrumbs>
        <BuiltBreadcrumbs.Link href="/hydrated-home">
          Hydrated home
        </BuiltBreadcrumbs.Link>
        <BuiltBreadcrumbs.Separator />
        <BuiltBreadcrumbs.Current>Hydrated settings</BuiltBreadcrumbs.Current>
      </BuiltBreadcrumbs>
      <BuiltCloudflareLogo
        variant="glyph"
        aria-label="Hydrated Cloudflare logo"
      />
      <BuiltClipboardText text="Hydrated copy value" />
      <BuiltDatePicker
        mode="single"
        month={new Date(2025, 4, 1)}
        selected={new Date(2025, 4, 12)}
      />
      <BuiltDateRangePicker
        timezone="Hydrated UTC"
        onStartDateChange={() => undefined}
        onEndDateChange={() => undefined}
      />
      <BuiltTable layout="fixed">
        <BuiltTable.Header variant="compact">
          <BuiltTable.Row>
            <BuiltTable.Head>Hydrated worker</BuiltTable.Head>
          </BuiltTable.Row>
        </BuiltTable.Header>
        <BuiltTable.Body>
          <BuiltTable.Row variant="selected">
            <BuiltTable.Cell>Hydrated api</BuiltTable.Cell>
          </BuiltTable.Row>
        </BuiltTable.Body>
      </BuiltTable>
      <BuiltTableOfContents>
        <BuiltTableOfContents.Title>
          Hydrated sections
        </BuiltTableOfContents.Title>
        <BuiltTableOfContents.List>
          <BuiltTableOfContents.Item href="#hydrated-intro" active>
            Hydrated introduction
          </BuiltTableOfContents.Item>
        </BuiltTableOfContents.List>
      </BuiltTableOfContents>
      <BuiltMenuBar
        aria-label="Hydrated view options"
        isActive={0}
        options={[
          {
            icon: "L",
            tooltip: "Hydrated list view",
            onClick: () => undefined,
          },
          {
            icon: "G",
            tooltip: "Hydrated grid view",
            onClick: () => undefined,
          },
        ]}
      />
      <BuiltToolbar size="sm">
        <BuiltToolbar.InputGroup aria-label="Hydrated toolbar search">
          <BuiltInputGroup.Input defaultValue="records" />
          <BuiltInputGroup.Suffix>.dns</BuiltInputGroup.Suffix>
        </BuiltToolbar.InputGroup>
        <BuiltToolbar.Button>Hydrated toolbar action</BuiltToolbar.Button>
      </BuiltToolbar>
      <BuiltChartLegend.SmallItem
        name="Hydrated requests"
        color="#4290F0"
        value="42"
      />
      <BuiltTimeseriesChart
        echarts={{} as never}
        loading
        height={180}
        data={[
          {
            name: "Hydrated requests",
            color: "#4290F0",
            data: [[1, 42]],
          },
        ]}
      />
      <BuiltFlow>
        <BuiltFlow.Node id="hydrated-start">Hydrated start</BuiltFlow.Node>
        <BuiltFlow.Node id="hydrated-finish">Hydrated finish</BuiltFlow.Node>
      </BuiltFlow>
      <BuiltSidebar.Provider contained defaultOpen>
        <BuiltSidebar>
          <BuiltSidebar.Content>
            <BuiltSidebar.MenuButton>
              Hydrated sidebar home
            </BuiltSidebar.MenuButton>
          </BuiltSidebar.Content>
        </BuiltSidebar>
      </BuiltSidebar.Provider>
    </>
  );
}

describe("Kumo Solid browser behavior", () => {
  it("hydrates the browser bundle over output from the SSR bundle", () => {
    const onClick = vi.fn();
    const errors = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const root = document.createElement("div");
    root.innerHTML = __KUMO_SOLID_HYDRATION_HTML__;
    document.body.append(root);
    (
      globalThis as typeof globalThis & {
        _$HY: {
          events: unknown[];
          completed: WeakSet<object>;
          r: Record<string, unknown>;
          fe: () => void;
        };
      }
    )._$HY = {
      events: [],
      completed: new WeakSet(),
      r: {},
      fe: () => undefined,
    };

    const dispose = hydrate(
      () => <BuiltHydrationFixture onClick={onClick} />,
      root,
    );
    const button = within(root).getByRole("button", {
      name: "Hydrated action",
    });
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledOnce();
    expect(errors).not.toHaveBeenCalled();
    expect(within(root).getByText("Hydrated toast provider")).toBeTruthy();
    expect(within(root).getByText("Hydrated notice")).toBeTruthy();
    expect(within(root).getByText("Hydrated banner description")).toBeTruthy();
    expect(
      within(root).getByRole("button", { name: "Hydrated retry" }),
    ).toBeTruthy();
    expect(within(root).getByText("Hydrated copy value")).toBeTruthy();
    expect(within(root).getByRole("toolbar")).toBeTruthy();
    expect(
      within(root).getByRole("textbox", {
        name: "Hydrated toolbar search",
      }),
    ).toBeTruthy();
    expect(
      within(root).getByRole("button", {
        name: "Hydrated toolbar action",
      }),
    ).toBeTruthy();
    expect(within(root).getByText("Hydrated requests")).toBeTruthy();
    expect(
      within(root).getByRole("status", { name: "Loading chart" }),
    ).toBeTruthy();
    expect(within(root).getByText("Hydrated start")).toBeTruthy();
    expect(within(root).getByText("Hydrated finish")).toBeTruthy();
    expect(within(root).getByText("Hydrated sidebar home")).toBeTruthy();
    expect(
      within(root).getByRole("button", {
        name: /May 12, 2025, selected/,
      }),
    ).toBeTruthy();
    expect(within(root).getByText("Timezone: Hydrated UTC")).toBeTruthy();
    expect(
      within(root).getAllByRole("textbox", {
        name: "Edit month and year",
      }),
    ).toHaveLength(2);
    expect(within(root).getByText("Hydrated worker").tagName).toBe("TH");
    expect(
      within(root).getByText("Hydrated api").closest("tr")?.classList,
    ).toContain("bg-kumo-tint");
    expect(
      within(root)
        .getByRole("link", { name: "Hydrated introduction" })
        .getAttribute("aria-current"),
    ).toBe("true");
    expect(
      within(root).getByRole("button", {
        name: "Hydrated popover trigger",
      }),
    ).toBeTruthy();
    expect(within(root).queryByText("Hydrated popover content")).toBeNull();
    expect(
      within(root).getByRole("button", {
        name: "Hydrated dialog trigger",
      }),
    ).toBeTruthy();
    expect(within(root).queryByText("Hydrated dialog content")).toBeNull();
    expect(
      within(root).getByRole("button", {
        name: "Hydrated menu trigger",
      }),
    ).toBeTruthy();
    expect(within(root).queryByText("Hydrated menu item")).toBeNull();
    expect(
      within(root)
        .getByRole("button", { name: "Hydrated list view" })
        .classList.contains("bg-kumo-base"),
    ).toBe(true);
    expect(
      within(root)
        .getByRole("link", { name: "Hydrated link" })
        .getAttribute("href"),
    ).toBe("/hydrated");
    expect(
      within(root)
        .getByRole("meter", { name: "Hydrated storage" })
        .getAttribute("aria-valuetext"),
    ).toBe("65%");
    expect(within(root).getByText("Hydrated layer")).toBeTruthy();
    expect(within(root).getByText("Hydrated empty state")).toBeTruthy();
    expect(
      within(root).getAllByRole("link", { name: "Hydrated home" }),
    ).toHaveLength(2);
    expect(
      within(root).getByRole("img", { name: "Hydrated Cloudflare logo" }),
    ).toBeTruthy();
    expect(
      within(root).getByRole("textbox", { name: "Hydrated email" }),
    ).toHaveProperty("value", "user@example.com");
    expect(
      within(root).getByRole("textbox", { name: "Hydrated notes" }),
    ).toHaveProperty("value", "Initial notes");
    expect(
      within(root).getByRole("textbox", { name: "Hydrated domain" }),
    ).toHaveProperty("value", "kumo");
    expect(
      within(root).getByRole("combobox", {
        name: "Hydrated database",
      }),
    ).toHaveTextContent("PostgreSQL");
    expect(
      within(root).getByRole("combobox", {
        name: "Hydrated product search",
      }),
    ).toHaveAttribute("placeholder", "Search products");
    expect(
      within(root).getByRole("combobox", {
        name: "Hydrated region",
      }),
    ).toHaveTextContent("London");
    expect(
      within(root).getByRole("combobox", {
        name: "Hydrated command search",
      }),
    ).toHaveAttribute("placeholder", "Search commands");
    expect(
      within(root).getByRole("navigation", { name: "Pagination" }),
    ).toBeTruthy();
    expect(within(root).getByText("11-20")).toBeTruthy();
    expect(
      within(root)
        .getByRole("tab", { name: "Hydrated analytics" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    const sensitiveInput = within(root).getByRole("button", {
      name: "Hydrated API key, masked.",
    });
    const sensitiveInputRect = sensitiveInput.getBoundingClientRect();
    fireEvent.click(sensitiveInput, {
      clientX: sensitiveInputRect.left + 1,
      clientY: sensitiveInputRect.top + 1,
    });
    expect(
      within(root).getByRole("textbox", { name: "Hydrated API key" }),
    ).toHaveProperty("value", "secret-value");
    dispose();
    errors.mockRestore();
    root.remove();
  });

  it("toggles a labeled checkbox through native browser events", () => {
    const onCheckedChange = vi.fn();
    render(() => (
      <Checkbox label="Email alerts" onCheckedChange={onCheckedChange} />
    ));
    const checkbox = screen.getByRole("checkbox", { name: "Email alerts" });

    fireEvent.click(checkbox);
    expect(checkbox.getAttribute("aria-checked")).toBe("true");
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.any(Event));
  });

  it("opens a rendered tooltip on real pointer hover", async () => {
    render(() => (
      <Tooltip
        content="Browser tooltip"
        delay={0}
        render={(triggerProps) => <Button {...triggerProps}>Details</Button>}
      />
    ));
    const trigger = screen.getByRole("button", { name: "Details" });

    await userEvent.hover(trigger);
    const popup = await screen.findByText("Browser tooltip");
    await userEvent.hover(popup);
    expect(screen.getByText("Browser tooltip")).toBeTruthy();
    await userEvent.unhover(popup);
    await waitFor(() => {
      expect(screen.queryByText("Browser tooltip")).toBeNull();
    });
  });

  it("opens a hovered tooltip alongside a controlled-open sibling", async () => {
    render(() => (
      <TooltipProvider>
        <Tooltip
          content="Initially open tooltip"
          open
          render={(triggerProps) => (
            <Button {...triggerProps}>Initial trigger</Button>
          )}
        />
        <Tooltip
          content="Hovered tooltip"
          render={(triggerProps) => (
            <Button {...triggerProps}>Hovered trigger</Button>
          )}
        />
      </TooltipProvider>
    ));

    expect(await screen.findByText("Initially open tooltip")).toBeTruthy();
    await userEvent.hover(
      screen.getByRole("button", { name: "Hovered trigger" }),
    );
    expect(await screen.findByText("Hovered tooltip")).toBeTruthy();

    // Let delay-group effects settle so a controlled-open sibling cannot
    // immediately reclaim the group and close the hovered tooltip.
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(screen.getByText("Hovered tooltip")).toBeTruthy();
    expect(screen.getByText("Initially open tooltip")).toBeTruthy();

    await userEvent.unhover(
      screen.getByRole("button", { name: "Hovered trigger" }),
    );
    await waitFor(() => {
      expect(screen.queryByText("Hovered tooltip")).toBeNull();
    });
    expect(screen.getByText("Initially open tooltip")).toBeTruthy();
  });

  it("opens only the innermost nested tooltip on hover", async () => {
    render(() => (
      <Tooltip
        content="Parent tooltip"
        delay={0}
        render={(parentProps) => (
          <span {...parentProps}>
            <span data-testid="parent-trigger-area">Parent trigger</span>
            <Tooltip content="Child tooltip" delay={0}>
              Child trigger
            </Tooltip>
          </span>
        )}
      />
    ));
    const child = screen.getByRole("button", { name: "Child trigger" });

    await userEvent.hover(child);
    expect(await screen.findByText("Child tooltip")).toBeTruthy();
    expect(screen.queryByText("Parent tooltip")).toBeNull();

    await userEvent.hover(screen.getByTestId("parent-trigger-area"));
    expect(await screen.findByText("Parent tooltip")).toBeTruthy();
    await waitFor(() => {
      expect(screen.queryByText("Child tooltip")).toBeNull();
    });

    await userEvent.hover(child);
    expect(await screen.findByText("Child tooltip")).toBeTruthy();
    await waitFor(() => {
      expect(screen.queryByText("Parent tooltip")).toBeNull();
    });
  });

  it("updates a loading button after mount", () => {
    const [loading, setLoading] = createSignal(false);
    render(() => <Button loading={loading()}>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });

    expect(button.hasAttribute("disabled")).toBe(false);
    setLoading(true);
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("status", { name: "Loading" })).toBeTruthy();
  });

  it("copies an Empty command through the browser clipboard API", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(() => <Empty title="No packages" commandLine="pnpm add kumo" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy command" }));
    expect(writeText).toHaveBeenCalledWith("pnpm add kumo");
  });

  it("updates Link navigation and Meter output after mount", () => {
    const [href, setHref] = createSignal("/one");
    const [value, setValue] = createSignal(20);
    render(() => (
      <>
        <Link href={href()}>Destination</Link>
        <Meter label="Usage" value={value()} />
        <button
          type="button"
          onClick={() => {
            setHref("/two");
            setValue(80);
          }}
        >
          Change
        </button>
      </>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(
      screen.getByRole("link", { name: "Destination" }).getAttribute("href"),
    ).toBe("/two");
    expect(
      screen
        .getByRole("meter", { name: "Usage" })
        .getAttribute("aria-valuetext"),
    ).toBe("80%");
  });

  it("connects Input labels and resizes InputArea in the browser", () => {
    const onValueChange = vi.fn();
    let textarea: HTMLTextAreaElement | undefined;
    render(() => (
      <>
        <Input label="Browser email" onValueChange={onValueChange} />
        <InputArea
          ref={(element) => {
            textarea = element;
            Object.defineProperty(element, "scrollHeight", {
              configurable: true,
              value: 80,
            });
          }}
          aria-label="Browser notes"
          autoResize
          style={{
            "box-sizing": "border-box",
            "border-width": "0",
            padding: "0",
          }}
        />
      </>
    ));

    const input = screen.getByRole("textbox", { name: "Browser email" });
    fireEvent.input(input, { target: { value: "user@example.com" } });
    expect(onValueChange).toHaveBeenCalledWith(
      "user@example.com",
      expect.any(Event),
    );
    expect(textarea?.style.height).toBe("80px");
  });

  it("selects radios and toggles switches through native browser events", () => {
    const onValueChange = vi.fn();
    const onCheckedChange = vi.fn();
    render(() => (
      <>
        <BuiltRadio.Group
          legend="Browser plan"
          defaultValue="free"
          onValueChange={onValueChange}
        >
          <BuiltRadio.Item label="Browser free" value="free" />
          <BuiltRadio.Item label="Browser pro" value="pro" />
        </BuiltRadio.Group>
        <BuiltSwitch label="Browser alerts" onCheckedChange={onCheckedChange} />
      </>
    ));

    const pro = screen.getByRole("radio", { name: "Browser pro" });
    fireEvent.click(pro);
    expect(pro.getAttribute("aria-checked")).toBe("true");
    expect(onValueChange).toHaveBeenCalledWith(
      "pro",
      expect.objectContaining({
        reason: "none",
        event: expect.any(Event),
      }),
    );

    const alerts = screen.getByRole("switch", {
      name: "Browser alerts",
    });
    fireEvent.click(alerts);
    expect(alerts.getAttribute("aria-checked")).toBe("true");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("runs built compound and sensitive input interactions", async () => {
    const onValueChange = vi.fn();
    const onCopy = vi.fn();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const { container } = render(() => (
      <>
        <BuiltInputGroup label="Browser domain">
          <BuiltInputGroup.Input onValueChange={onValueChange} />
          <BuiltInputGroup.Suffix>.workers.dev</BuiltInputGroup.Suffix>
        </BuiltInputGroup>
        <BuiltSensitiveInput
          aria-label="Browser secret"
          defaultValue="copy-secret"
          onCopy={onCopy}
        />
      </>
    ));

    const input = within(container).getByRole("textbox", {
      name: "Browser domain",
    });
    fireEvent.input(input, { target: { value: "kumo" } });
    expect(onValueChange).toHaveBeenCalledWith("kumo", expect.any(Event));

    fireEvent.click(
      within(container).getByRole("button", { name: "Copy to clipboard" }),
    );
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("copy-secret"));
    expect(onCopy).toHaveBeenCalledOnce();
  });

  it("runs built collapsible interactions", () => {
    const { container } = render(() => (
      <BuiltCollapsible>
        <BuiltCollapsible.DefaultTrigger>
          Browser details
        </BuiltCollapsible.DefaultTrigger>
        <BuiltCollapsible.DefaultPanel>
          Browser disclosure content
        </BuiltCollapsible.DefaultPanel>
      </BuiltCollapsible>
    ));

    const trigger = within(container).getByRole("button", {
      name: "Browser details",
    });
    expect(
      within(container).queryByText("Browser disclosure content"),
    ).toBeNull();

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(
      within(container).getByText("Browser disclosure content"),
    ).toBeTruthy();
  });

  it("runs built banner reactivity and clipboard interactions", async () => {
    const [variant, setVariant] = createSignal<"default" | "error">("default");
    const onCopy = vi.fn();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const { container } = render(() => (
      <>
        <BuiltBanner
          variant={variant()}
          title="Browser notice"
          action={<BuiltBanner.Action>Resolve</BuiltBanner.Action>}
        />
        <BuiltClipboardText
          text="visible-value"
          textToCopy="copied-value"
          onCopy={onCopy}
        />
      </>
    ));

    expect(container.querySelector(".bg-kumo-info-tint")).toBeTruthy();
    setVariant("error");
    expect(container.querySelector(".bg-kumo-danger-tint")).toBeTruthy();

    fireEvent.click(
      within(container).getByRole("button", { name: "Copy to clipboard" }),
    );
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("copied-value"));
    expect(onCopy).toHaveBeenCalledOnce();
    expect(within(container).getByText("Copied")).toBeTruthy();
  });

  it("runs built DatePicker selection and navigation", () => {
    const [selected, setSelected] = createSignal<Date>();
    const [month, setMonth] = createSignal(new Date(2025, 4, 1));
    const onChange = vi.fn((value: Date | undefined) => setSelected(value));
    const { container } = render(() => (
      <BuiltDatePicker
        mode="single"
        month={month()}
        selected={selected()}
        onChange={onChange}
        onMonthChange={setMonth}
      />
    ));

    const day = within(container).getByRole("button", {
      name: /May 18, 2025/,
    });
    fireEvent.click(day);
    expect(onChange).toHaveBeenCalled();
    expect(day.closest("td")?.classList.contains("rdp-selected")).toBe(true);

    fireEvent.click(
      within(container).getByRole("button", {
        name: "Go to the Next Month",
      }),
    );
    expect(within(container).getByText("June 2025")).toBeTruthy();
  });

  it("runs built DateRangePicker selection and navigation", () => {
    const onStartDateChange = vi.fn();
    const onEndDateChange = vi.fn();
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 10);
    const end = new Date(now.getFullYear(), now.getMonth(), 14);
    const format = (date: Date) =>
      date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    const { container } = render(() => (
      <BuiltDateRangePicker
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
      />
    ));

    fireEvent.click(
      within(container).getByRole("button", { name: format(start) }),
    );
    fireEvent.click(
      within(container).getByRole("button", { name: format(end) }),
    );
    expect(onStartDateChange).toHaveBeenCalledWith(expect.any(Date));
    expect(onEndDateChange).toHaveBeenCalledWith(expect.any(Date));

    const before = (
      within(container).getAllByRole("textbox", {
        name: "Edit month and year",
      })[0] as HTMLInputElement
    ).value;
    fireEvent.click(
      within(container).getByRole("button", { name: "Next month" }),
    );
    const after = (
      within(container).getAllByRole("textbox", {
        name: "Edit month and year",
      })[0] as HTMLInputElement
    ).value;
    expect(after).not.toBe(before);
  });

  it("runs built Table selection and checkbox interactions", () => {
    const [selected, setSelected] = createSignal(false);
    const onCheckedChange = vi.fn();
    const { container } = render(() => (
      <>
        <BuiltTable>
          <BuiltTable.Header sticky>
            <BuiltTable.Row>
              <BuiltTable.CheckHead
                aria-label="Select all browser rows"
                onCheckedChange={onCheckedChange}
              />
              <BuiltTable.Head sticky="right">Actions</BuiltTable.Head>
            </BuiltTable.Row>
          </BuiltTable.Header>
          <BuiltTable.Body>
            <BuiltTable.Row variant={selected() ? "selected" : "default"}>
              <BuiltTable.CheckCell aria-label="Select browser api" />
              <BuiltTable.Cell sticky="right">Open</BuiltTable.Cell>
            </BuiltTable.Row>
          </BuiltTable.Body>
        </BuiltTable>
        <button type="button" onClick={() => setSelected(true)}>
          Select browser row
        </button>
      </>
    ));

    fireEvent.click(
      within(container).getByRole("checkbox", {
        name: "Select all browser rows",
      }),
    );
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.any(Event));

    const row = within(container).getByText("Open").closest("tr");
    expect(row?.classList.contains("bg-kumo-tint")).toBe(false);
    fireEvent.click(
      within(container).getByRole("button", { name: "Select browser row" }),
    );
    expect(row?.classList.contains("bg-kumo-tint")).toBe(true);
  });

  it("runs built TableOfContents render overrides and reactive state", () => {
    const [active, setActive] = createSignal(false);
    const onClick = vi.fn();
    const { container } = render(() => (
      <BuiltTableOfContents aria-label="Browser sections">
        <BuiltTableOfContents.List>
          <BuiltTableOfContents.Item
            render="button"
            type="button"
            active={active()}
            onClick={() => {
              onClick();
              setActive(true);
            }}
          >
            Browser introduction
          </BuiltTableOfContents.Item>
        </BuiltTableOfContents.List>
      </BuiltTableOfContents>
    ));

    const item = within(container).getByRole("button", {
      name: "Browser introduction",
    });
    expect(item.hasAttribute("aria-current")).toBe(false);
    fireEvent.click(item);
    expect(onClick).toHaveBeenCalledOnce();
    expect(item.getAttribute("aria-current")).toBe("true");
    expect(item.classList.contains("border-kumo-brand")).toBe(true);
  });

  it("runs built MenuBar activation and arrow-key navigation", () => {
    const [active, setActive] = createSignal(0);
    const onGridClick = vi.fn(() => setActive(1));
    const { container } = render(() => (
      <BuiltMenuBar
        aria-label="Browser views"
        isActive={active()}
        options={[
          {
            icon: "L",
            tooltip: "Browser list view",
            onClick: () => setActive(0),
          },
          {
            icon: "G",
            tooltip: "Browser grid view",
            onClick: onGridClick,
          },
        ]}
      />
    ));
    const list = within(container).getByRole("button", {
      name: "Browser list view",
    });
    const grid = within(container).getByRole("button", {
      name: "Browser grid view",
    });

    fireEvent.click(grid);
    expect(onGridClick).toHaveBeenCalledOnce();
    expect(grid.classList.contains("bg-kumo-base")).toBe(true);

    list.focus();
    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(document.activeElement).toBe(grid);
    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(document.activeElement).toBe(list);
  });

  it("runs built Toolbar sizing, activation, and composite navigation", async () => {
    const [compact, setCompact] = createSignal(false);
    const onFilter = vi.fn(() => setCompact(true));
    const { container } = render(() => (
      <BuiltToolbar size={compact() ? "xs" : "lg"}>
        <BuiltToolbar.InputGroup aria-label="Browser toolbar search">
          <BuiltInputGroup.Input defaultValue="" />
          <BuiltInputGroup.Suffix>.workers.dev</BuiltInputGroup.Suffix>
        </BuiltToolbar.InputGroup>
        <BuiltToolbar.Button onClick={onFilter}>Filter</BuiltToolbar.Button>
        <BuiltToolbar.Button>Settings</BuiltToolbar.Button>
      </BuiltToolbar>
    ));
    const input = within(container).getByRole("textbox", {
      name: "Browser toolbar search",
    });
    const filter = within(container).getByRole("button", { name: "Filter" });
    const settings = within(container).getByRole("button", {
      name: "Settings",
    });

    input.focus();
    fireEvent.keyDown(input, { key: "ArrowRight" });
    await Promise.resolve();
    expect(document.activeElement).toBe(filter);

    fireEvent.keyDown(filter, { key: "ArrowRight" });
    await Promise.resolve();
    expect(document.activeElement).toBe(settings);

    fireEvent.click(filter);
    expect(onFilter).toHaveBeenCalledOnce();
    expect(filter.className).toContain("h-5");
    expect(input.closest('[data-slot="input-group"]')?.className).toContain(
      "h-5",
    );
  });

  it("runs built Select single and multiple selection behavior", async () => {
    const [database, setDatabase] = createSignal<string | null>(null);
    const [columns, setColumns] = createSignal<string[]>(["Name"]);
    const onDatabaseChange = vi.fn((value: string) => setDatabase(value));
    const onColumnsChange = vi.fn((value: string[]) => setColumns(value));

    render(() => (
      <>
        <BuiltSelect
          aria-label="Browser database"
          placeholder="Choose a database"
          value={database()}
          onValueChange={onDatabaseChange}
          items={[
            { label: "PostgreSQL", value: "postgres" },
            { label: "MySQL", value: "mysql" },
          ]}
        />
        <BuiltSelect<string, true>
          aria-label="Browser columns"
          multiple
          value={columns()}
          onValueChange={onColumnsChange}
          renderValue={(value) => value.join(", ")}
        >
          <BuiltSelect.Option value="Name">Name</BuiltSelect.Option>
          <BuiltSelect.Option value="Location">Location</BuiltSelect.Option>
        </BuiltSelect>
      </>
    ));

    const databaseTrigger = screen.getByRole("combobox", {
      name: "Browser database",
    });
    fireEvent.mouseDown(databaseTrigger);
    const postgres = await screen.findByRole("option", {
      name: "PostgreSQL",
    });
    fireEvent.mouseMove(postgres);
    fireEvent.click(postgres);
    expect(onDatabaseChange).toHaveBeenCalledWith(
      "postgres",
      expect.anything(),
    );
    expect(databaseTrigger).toHaveTextContent("PostgreSQL");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());

    const columnsTrigger = screen.getByRole("combobox", {
      name: "Browser columns",
    });
    fireEvent.mouseDown(columnsTrigger);
    const location = await screen.findByRole("option", {
      name: "Location",
    });
    fireEvent.mouseMove(location);
    fireEvent.click(location);
    expect(onColumnsChange).toHaveBeenCalledWith(
      ["Name", "Location"],
      expect.anything(),
    );
    expect(columnsTrigger).toHaveTextContent("Name, Location");
    expect(screen.getByRole("listbox")).toBeTruthy();
  });

  it("runs built Autocomplete filtering and selection behavior", async () => {
    const onValueChange = vi.fn();
    render(() => (
      <BuiltAutocomplete
        items={["Workers", "Pages", "R2"]}
        onValueChange={onValueChange}
      >
        <BuiltAutocomplete.InputGroup
          aria-label="Browser product search"
          placeholder="Search products"
        />
        <BuiltAutocomplete.Content>
          <BuiltAutocomplete.List>
            {(item: string) => (
              <BuiltAutocomplete.Item value={item}>
                {item}
              </BuiltAutocomplete.Item>
            )}
          </BuiltAutocomplete.List>
        </BuiltAutocomplete.Content>
      </BuiltAutocomplete>
    ));

    const input = screen.getByRole("combobox", {
      name: "Browser product search",
    }) as HTMLInputElement;
    fireEvent.input(input, { target: { value: "work" } });
    const workers = await screen.findByRole("option", {
      name: "Workers",
    });
    expect(screen.queryByRole("option", { name: "Pages" })).toBeNull();
    fireEvent.click(workers);
    expect(input.value).toBe("Workers");
    expect(onValueChange).toHaveBeenLastCalledWith(
      "Workers",
      expect.anything(),
    );
  });

  it("runs built Combobox selection and form serialization", async () => {
    const [region, setRegion] = createSignal<string | null>(null);
    const onValueChange = vi.fn((value: string | null) => setRegion(value));
    const { container } = render(() => (
      <BuiltCombobox
        items={["Virginia", "London"]}
        value={region()}
        onValueChange={onValueChange}
        name="browser-region"
      >
        <BuiltCombobox.TriggerInput
          aria-label="Browser region"
          placeholder="Choose a region"
        />
        <BuiltCombobox.Content>
          <BuiltCombobox.List>
            {(item: string) => (
              <BuiltCombobox.Item value={item}>{item}</BuiltCombobox.Item>
            )}
          </BuiltCombobox.List>
        </BuiltCombobox.Content>
      </BuiltCombobox>
    ));

    const input = screen.getByRole("combobox", {
      name: "Browser region",
    }) as HTMLInputElement;
    fireEvent.click(input);
    const london = await screen.findByRole("option", { name: "London" });
    fireEvent.pointerMove(london, { pointerType: "mouse" });
    await waitFor(() => expect(london).toHaveAttribute("data-highlighted", ""));
    fireEvent.click(london);
    expect(onValueChange).toHaveBeenCalledWith("London", expect.anything());
    expect(input.value).toBe("London");
    expect(
      container.querySelector<HTMLInputElement>(
        'input[type="hidden"][name="browser-region"]',
      )?.value,
    ).toBe("London");
  });

  it("runs built CommandPalette keyboard selection and closing", async () => {
    const [open, setOpen] = createSignal(true);
    const onOpenChange = vi.fn((nextOpen: boolean) => setOpen(nextOpen));
    const onSelect = vi.fn();
    const commands = [
      { id: "create", title: "Create project" },
      { id: "settings", title: "Open settings" },
    ];
    render(() => (
      <BuiltCommandPalette.Root
        open={open()}
        onOpenChange={onOpenChange}
        items={commands}
        itemToStringValue={(item) => item.title}
        getSelectableItems={(items) => [...items]}
        onSelect={onSelect}
      >
        <BuiltCommandPalette.Input
          aria-label="Browser command search"
          placeholder="Search commands"
        />
        <BuiltCommandPalette.List>
          <BuiltCommandPalette.Results>
            {(item: { id: string; title: string }) => (
              <BuiltCommandPalette.Item value={item}>
                {item.title}
              </BuiltCommandPalette.Item>
            )}
          </BuiltCommandPalette.Results>
        </BuiltCommandPalette.List>
      </BuiltCommandPalette.Root>
    ));

    const input = await screen.findByRole("combobox", {
      name: "Browser command search",
    });
    await waitFor(() =>
      expect(document.querySelector("[data-highlighted]")).toBeTruthy(),
    );
    fireEvent.keyDown(input, { key: "Enter", metaKey: true });
    expect(onSelect).toHaveBeenCalledWith(commands[0], {
      newTab: true,
    });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() =>
      expect(
        screen.queryByRole("combobox", {
          name: "Browser command search",
        }),
      ).toBeNull(),
    );
  });

  it("runs built Pagination navigation and reactive page state", async () => {
    const [page, setPage] = createSignal(1);
    const onPageChange = vi.fn((value: number) => setPage(value));

    render(() => (
      <BuiltPagination
        page={page()}
        perPage={10}
        totalCount={100}
        setPage={onPageChange}
      />
    ));

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    await waitFor(() => expect(screen.getByText("11-20")).toBeTruthy());
    expect(
      (
        screen.getByRole("textbox", {
          name: "Page number",
        }) as HTMLInputElement
      ).value,
    ).toBe("2");
  });

  it("runs built Tabs controlled, keyboard, and custom-link behavior", async () => {
    const [value, setValue] = createSignal("overview");
    const onValueChange = vi.fn((nextValue: string) => setValue(nextValue));

    render(() => (
      <BuiltTabs
        value={value()}
        activateOnFocus
        onValueChange={onValueChange}
        tabs={[
          { value: "overview", label: "Browser overview" },
          { value: "analytics", label: "Browser analytics" },
          {
            value: "docs",
            label: "Browser docs",
            render: (renderProps) => (
              <a {...renderProps} href="#browser-docs" />
            ),
          },
        ]}
      />
    ));

    const overview = screen.getByRole("tab", {
      name: "Browser overview",
    });
    const analytics = screen.getByRole("tab", {
      name: "Browser analytics",
    });
    const docs = screen.getByRole("tab", { name: "Browser docs" });

    fireEvent.click(analytics);
    expect(onValueChange).toHaveBeenCalledWith("analytics");
    expect(analytics.getAttribute("aria-selected")).toBe("true");

    analytics.focus();
    fireEvent.keyDown(analytics, { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(docs));
    expect(onValueChange).toHaveBeenLastCalledWith("docs");
    expect(docs.getAttribute("aria-selected")).toBe("true");
    expect(docs.tagName).toBe("A");
    expect(docs.getAttribute("href")).toBe("#browser-docs");
    expect(overview.getAttribute("aria-selected")).toBe("false");
  });

  it("runs built Popover open, labeling, and close behavior", async () => {
    const onOpenChange = vi.fn();
    render(() => (
      <BuiltPopover onOpenChange={onOpenChange}>
        <BuiltPopover.Trigger>Browser popover trigger</BuiltPopover.Trigger>
        <BuiltPopover.Content side="right" class="browser-popover">
          <BuiltPopover.Title>Browser popover title</BuiltPopover.Title>
          <BuiltPopover.Description>
            Browser popover description
          </BuiltPopover.Description>
          <BuiltPopover.Close>Browser popover close</BuiltPopover.Close>
        </BuiltPopover.Content>
      </BuiltPopover>
    ));

    fireEvent.click(
      screen.getByRole("button", { name: "Browser popover trigger" }),
    );
    const title = await screen.findByText("Browser popover title");
    const popup = title.closest('[data-kumo-part="content"]');
    expect(popup?.className).toContain("browser-popover");
    expect(popup?.getAttribute("aria-labelledby")).toBe(title.id);
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(true);

    fireEvent.click(
      screen.getByRole("button", { name: "Browser popover close" }),
    );
    expect(onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);
    await waitFor(() =>
      expect(screen.queryByText("Browser popover title")).toBeNull(),
    );
  });

  it("runs built Dialog and alert-dialog behavior", async () => {
    const onOpenChange = vi.fn();
    render(() => (
      <>
        <BuiltDialog.Root onOpenChange={onOpenChange}>
          <BuiltDialog.Trigger>Browser dialog trigger</BuiltDialog.Trigger>
          <BuiltDialog size="lg" class="browser-dialog">
            <BuiltDialog.Title>Browser dialog title</BuiltDialog.Title>
            <BuiltDialog.Description>
              Browser dialog description
            </BuiltDialog.Description>
            <BuiltDialog.Close>Browser dialog close</BuiltDialog.Close>
          </BuiltDialog>
        </BuiltDialog.Root>
        <BuiltDialog.Root role="alertdialog">
          <BuiltDialog.Trigger>Browser alert trigger</BuiltDialog.Trigger>
          <BuiltDialog>
            <BuiltDialog.Title>Browser alert title</BuiltDialog.Title>
            <BuiltDialog.Close>Browser alert close</BuiltDialog.Close>
          </BuiltDialog>
        </BuiltDialog.Root>
      </>
    ));

    fireEvent.click(
      screen.getByRole("button", { name: "Browser dialog trigger" }),
    );
    const dialog = await screen.findByRole("dialog");
    const title = screen.getByText("Browser dialog title");
    expect(dialog.className).toContain("browser-dialog");
    expect(dialog.className).toContain("sm:w-[32rem]");
    expect(dialog.getAttribute("aria-labelledby")).toBe(title.id);
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(true);

    fireEvent.click(
      screen.getByRole("button", { name: "Browser dialog close" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);

    fireEvent.click(
      screen.getByRole("button", { name: "Browser alert trigger" }),
    );
    const alertDialog = await screen.findByRole("alertdialog");
    expect(alertDialog.getAttribute("aria-labelledby")).toBe(
      screen.getByText("Browser alert title").id,
    );
    const alertBackdrop = screen
      .getAllByRole("presentation", { hidden: true })
      .find((element) => element.classList.contains("bg-kumo-recessed"));
    expect(alertBackdrop).toBeTruthy();
    fireEvent.click(alertBackdrop!);
    expect(screen.getByRole("alertdialog")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Browser alert close" }),
    );
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  });

  it("runs built DropdownMenu keyboard and selection behavior", async () => {
    const [checked, setChecked] = createSignal(false);
    const onCheckedChange = vi.fn((nextChecked: boolean) =>
      setChecked(nextChecked),
    );
    const onDelete = vi.fn();
    render(() => (
      <BuiltDropdownMenu>
        <BuiltDropdownMenu.Trigger>
          Browser menu trigger
        </BuiltDropdownMenu.Trigger>
        <BuiltDropdownMenu.Content class="browser-menu">
          <BuiltDropdownMenu.Item onClick={onDelete} variant="danger">
            Browser delete
          </BuiltDropdownMenu.Item>
          <BuiltDropdownMenu.CheckboxItem
            checked={checked()}
            onCheckedChange={onCheckedChange}
          >
            Browser sidebar
          </BuiltDropdownMenu.CheckboxItem>
          <BuiltDropdownMenu.LinkItem href="/browser-settings">
            Browser settings
          </BuiltDropdownMenu.LinkItem>
        </BuiltDropdownMenu.Content>
      </BuiltDropdownMenu>
    ));

    const trigger = screen.getByRole("button", {
      name: "Browser menu trigger",
    });
    fireEvent.click(trigger);
    const menu = await screen.findByRole("menu");
    expect(menu.className).toContain("browser-menu");

    const deleteItem = screen.getByRole("menuitem", {
      name: "Browser delete",
    });
    const checkboxItem = screen.getByRole("menuitemcheckbox", {
      name: "Browser sidebar",
    });
    await waitFor(() => expect(document.activeElement).toBe(deleteItem));
    fireEvent.keyDown(deleteItem, { key: "ArrowDown" });
    await waitFor(() => expect(document.activeElement).toBe(checkboxItem));

    fireEvent.click(checkboxItem);
    expect(onCheckedChange.mock.calls[0]?.[0]).toBe(true);
    expect(checkboxItem.getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("menu")).toBeTruthy();
    expect(
      screen
        .getByRole("menuitem", { name: "Browser settings" })
        .getAttribute("href"),
    ).toBe("/browser-settings");

    fireEvent.click(deleteItem);
    expect(onDelete).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it("lays out built Flow nodes and connector geometry in Chromium", async () => {
    const { container } = render(() => (
      <div style={{ width: "640px", height: "280px" }}>
        <BuiltFlow className="h-full">
          <BuiltFlow.Node id="browser-start">Browser start</BuiltFlow.Node>
          <BuiltFlow.Parallel>
            <BuiltFlow.Node id="browser-a">Browser A</BuiltFlow.Node>
            <BuiltFlow.Node id="browser-b">Browser B</BuiltFlow.Node>
          </BuiltFlow.Parallel>
          <BuiltFlow.Node id="browser-finish">Browser finish</BuiltFlow.Node>
        </BuiltFlow>
      </div>
    ));

    await waitFor(() =>
      expect(
        container.querySelector('[data-testid="browser-start-browser-a"]'),
      ).toBeTruthy(),
    );
    const paths = container.querySelectorAll("svg path[data-testid]");
    expect(paths.length).toBeGreaterThanOrEqual(4);
    for (const path of paths) {
      expect(path.getAttribute("d")).toMatch(/^M /);
    }
  });

  it("runs built Sidebar desktop and mobile focus behavior", async () => {
    const Desktop = () => (
      <BuiltSidebar.Provider contained defaultOpen mobileBreakpoint={1}>
        <BuiltSidebar>
          <BuiltSidebar.Content>
            <BuiltSidebar.MenuButton>Browser home</BuiltSidebar.MenuButton>
          </BuiltSidebar.Content>
          <BuiltSidebar.Footer>
            <BuiltSidebar.Trigger />
          </BuiltSidebar.Footer>
        </BuiltSidebar>
      </BuiltSidebar.Provider>
    );
    const desktop = render(() => <Desktop />);
    const trigger = within(desktop.container).getByRole("button", {
      name: "Collapse sidebar",
    });
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(
      desktop.container
        .querySelector("[data-sidebar='sidebar']")
        ?.getAttribute("data-state"),
    ).toBe("collapsed");
    desktop.unmount();

    function MobileToggle() {
      const sidebar = useBuiltSidebar();
      return (
        <button type="button" onClick={sidebar.toggleSidebar}>
          Open browser sidebar
        </button>
      );
    }
    const mobile = render(() => (
      <BuiltSidebar.Provider contained mobileBreakpoint={9999}>
        <MobileToggle />
        <BuiltSidebar>
          <BuiltSidebar.Content>
            <BuiltSidebar.MenuButton>
              Browser mobile home
            </BuiltSidebar.MenuButton>
          </BuiltSidebar.Content>
        </BuiltSidebar>
      </BuiltSidebar.Provider>
    ));
    const opener = within(mobile.container).getByRole("button", {
      name: "Open browser sidebar",
    });
    opener.focus();
    fireEvent.click(opener);
    await waitFor(() =>
      expect(document.activeElement).toBe(
        within(mobile.container).getByRole("button", {
          name: "Browser mobile home",
        }),
      ),
    );
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(document.activeElement).toBe(opener));
  });

  it("runs the built Chart lifecycle and reactive event bridge", async () => {
    const instance = {
      setOption: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      resize: vi.fn(),
      dispose: vi.fn(),
    };
    const factory = {
      init: vi.fn(() => instance),
    };
    const firstClick = vi.fn();
    const secondClick = vi.fn();
    function BrowserChart() {
      const [click, setClick] = createSignal(firstClick);
      return (
        <>
          <button type="button" onClick={() => setClick(() => secondClick)}>
            Update chart event
          </button>
          <BuiltChart
            echarts={factory as never}
            options={{
              aria: { enabled: true },
              tooltip: {
                dangerousHtmlFormatter: () => "<b>Browser value</b>",
              },
              series: [],
            }}
            onEvents={{ click: click() }}
          />
        </>
      );
    }
    const { unmount } = render(() => <BrowserChart />);
    await waitFor(() => expect(instance.setOption).toHaveBeenCalled());
    const prepared = instance.setOption.mock.calls[0][0] as {
      tooltip: { formatter: () => string };
    };
    expect(prepared.tooltip.formatter()).toBe("<b>Browser value</b>");
    const clickBridge = instance.on.mock.calls.find(
      (call) => call[0] === "click",
    )?.[1] as (params: unknown) => void;
    clickBridge({});
    expect(firstClick).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Update chart event" }));
    clickBridge({});
    expect(secondClick).toHaveBeenCalledOnce();
    unmount();
    expect(instance.dispose).toHaveBeenCalledOnce();
  });

  it("runs built Toasty external dispatch, updates, actions, and close", async () => {
    const manager = createBuiltKumoToastManager();
    const onUndo = vi.fn();
    const onClose = vi.fn();
    render(() => (
      <BuiltToasty toastManager={manager}>
        <span>Browser toast application</span>
      </BuiltToasty>
    ));

    manager.add({
      id: "browser-toast",
      title: "Browser toast saved",
      description: "The change is ready.",
      variant: "success",
      actions: [{ children: "Undo browser toast", onClick: onUndo }],
      onClose,
      timeout: 0,
    });

    const title = await screen.findByText("Browser toast saved");
    const root = title.closest(
      '[data-toast-id="browser-toast"]',
    ) as HTMLElement;
    expect(root.getAttribute("role")).toBe("dialog");
    expect(root.className).toContain("ring-kumo-success");
    expect(root.querySelector("[data-toast-icon]")).toBeTruthy();
    expect(screen.getByText("The change is ready.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Undo browser toast" }));
    expect(onUndo).toHaveBeenCalledOnce();

    manager.update("browser-toast", {
      title: "Browser toast updated",
      variant: "warning",
    });
    const updated = await screen.findByText("Browser toast updated");
    expect(
      updated.closest('[data-toast-id="browser-toast"]')?.className,
    ).toContain("ring-kumo-warning");

    manager.add({
      id: "browser-toast",
      title: "Browser toast deduplicated",
      variant: "info",
      timeout: 0,
    });
    expect(await screen.findByText("Browser toast deduplicated")).toBeTruthy();
    expect(
      document.querySelectorAll('[data-toast-id="browser-toast"]'),
    ).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByText("Browser toast deduplicated")).toBeNull(),
    );

    const onAutoClose = vi.fn();
    manager.add({
      id: "browser-auto-toast",
      title: "Browser toast auto closes",
      timeout: 25,
      onClose: onAutoClose,
    });
    expect(await screen.findByText("Browser toast auto closes")).toBeTruthy();
    await waitFor(
      () => expect(screen.queryByText("Browser toast auto closes")).toBeNull(),
      { timeout: 1_500 },
    );
    expect(onAutoClose).toHaveBeenCalledOnce();
  });
});
