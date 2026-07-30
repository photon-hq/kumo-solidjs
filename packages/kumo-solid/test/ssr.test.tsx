// @vitest-environment node

import { createComponent } from "solid-js";
import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vite-plus/test";
import { Autocomplete } from "../src/components/autocomplete";
import { Badge } from "../src/components/badge";
import { Banner } from "../src/components/banner";
import { Button } from "../src/components/button";
import { Breadcrumbs } from "../src/components/breadcrumbs";
import { Checkbox } from "../src/components/checkbox";
import { ChartLegend, TimeseriesChart } from "../src/components/chart";
import { ClipboardText } from "../src/components/clipboard-text";
import { CloudflareLogo } from "../src/components/cloudflare-logo";
import { Code } from "../src/components/code";
import { Collapsible } from "../src/components/collapsible";
import { Combobox } from "../src/components/combobox";
import { CommandPalette } from "../src/components/command-palette";
import { DatePicker } from "../src/components/date-picker";
import { DateRangePicker } from "../src/components/date-range-picker";
import { Dialog } from "../src/components/dialog";
import { DropdownMenu } from "../src/components/dropdown";
import { Empty } from "../src/components/empty";
import { Flow } from "../src/components/flow";
import { Grid, GridItem } from "../src/components/grid";
import { Input, InputArea } from "../src/components/input";
import { InputGroup } from "../src/components/input-group";
import { Label } from "../src/components/label";
import { LayerCard } from "../src/components/layer-card";
import { Link } from "../src/components/link";
import { Loader, SkeletonLine } from "../src/components/loader";
import { MenuBar } from "../src/components/menubar";
import { Meter } from "../src/components/meter";
import { Pagination } from "../src/components/pagination";
import { Popover } from "../src/components/popover";
import { Radio } from "../src/components/radio";
import { Select } from "../src/components/select";
import { SensitiveInput } from "../src/components/sensitive-input";
import { Sidebar } from "../src/components/sidebar";
import { Surface } from "../src/components/surface";
import { Switch } from "../src/components/switch";
import { Table } from "../src/components/table";
import { TableOfContents } from "../src/components/table-of-contents";
import { Tabs } from "../src/components/tabs";
import { Text } from "../src/components/text";
import { Toasty } from "../src/components/toast";
import { Toolbar } from "../src/components/toolbar";
import { Tooltip } from "../src/components/tooltip";

describe("Solid SSR", () => {
  it("renders charts, flows, and sidebars without browser globals", () => {
    const html = renderToString(() => (
      <>
        <ChartLegend.SmallItem name="Requests" color="#4290F0" value="42" />
        <TimeseriesChart
          echarts={{} as never}
          data={[
            {
              name: "Requests",
              color: "#4290F0",
              data: [[1, 42]],
            },
          ]}
          loading
          height={180}
        />
        <Flow>
          <Flow.Node id="start">Start</Flow.Node>
          <Flow.Node id="finish">Finish</Flow.Node>
        </Flow>
        <Sidebar.Provider contained defaultOpen>
          <Sidebar>
            <Sidebar.Content>
              <Sidebar.MenuButton>Home</Sidebar.MenuButton>
            </Sidebar.Content>
          </Sidebar>
        </Sidebar.Provider>
      </>
    ));

    expect(html).toContain("Requests");
    expect(html).toContain('aria-label="Loading chart"');
    expect(html).toContain('data-node-id="start"');
    expect(html).toContain("Finish");
    expect(html).toContain('data-sidebar="sidebar"');
    expect(html).toContain('data-sidebar="menu-button"');
    expect(html).toContain("Home");
  });

  it("renders Badge without a DOM", () => {
    const html = renderToString(() =>
      createComponent(Badge, {
        appearance: "dot",
        variant: "success",
        get children() {
          return "Healthy";
        },
      }),
    );

    expect(html).toContain("<span");
    expect(html).toContain("ring-kumo-hairline");
    expect(html).toContain("bg-kumo-success");
    expect(html).toContain("Healthy");
  });

  it("renders polymorphic Text without a DOM", () => {
    const html = renderToString(() => (
      <Text as="h2" variant="heading2">
        Overview
      </Text>
    ));

    expect(html).toContain("<h2");
    expect(html).toContain("text-2xl");
    expect(html).toContain(">Overview</h2>");
  });

  it("renders form and feedback components without a DOM", () => {
    const html = renderToString(() => (
      <div>
        <Loader size="sm" />
        <SkeletonLine minWidth={40} maxWidth={40} />
        <Button variant="primary">Save</Button>
        <Label>Email</Label>
        <Checkbox aria-label="Select item" checked />
      </div>
    ));

    expect(html).toContain('role="status"');
    expect(html).toContain("--skeleton-width:40%");
    expect(html).toContain('data-kumo-component="Button"');
    expect(html).toContain("<label");
    expect(html).toContain('role="checkbox"');
    expect(html).toContain('aria-checked="true"');
  });

  it("renders a closed Tooltip trigger without accessing the DOM", () => {
    const html = renderToString(() => (
      <Tooltip content="More detail">Details</Tooltip>
    ));

    expect(html).toContain('data-base-ui-tooltip-trigger=""');
    expect(html).toContain("Details");
    expect(html).not.toContain("More detail");
  });

  it("produces deterministic SkeletonLine output across SSR requests", () => {
    const renderSkeleton = () =>
      renderToString(() => (
        <SkeletonLine
          minWidth={30}
          maxWidth={90}
          minDuration={1}
          maxDuration={2}
        />
      ));

    expect(renderSkeleton()).toBe(renderSkeleton());
  });

  it("renders the layout, display, routing, and meter batch without a DOM", () => {
    const html = renderToString(() => (
      <>
        <LayerCard>
          <LayerCard.Secondary>Header</LayerCard.Secondary>
          <LayerCard.Primary>Body</LayerCard.Primary>
        </LayerCard>
        <Surface as="section">Surface</Surface>
        <Grid variant="2up" gap="sm">
          <GridItem>
            <Code.Block code="pnpm test" lang="bash" />
          </GridItem>
        </Grid>
        <Link href="/docs">Docs</Link>
        <Meter label="Storage" value={65} />
        <Empty title="No results" commandLine="pnpm add kumo" />
      </>
    ));

    expect(html).toContain("bg-kumo-elevated");
    expect(html).toContain("<section");
    expect(html).toContain("md:grid-cols-2");
    expect(html).toContain("pnpm test");
    expect(html).toContain('data-kumo-component="Link"');
    expect(html).toContain('role="meter"');
    expect(html).toContain("65%");
    expect(html).toContain("No results");
    expect(html).toContain("pnpm add kumo");
  });

  it("renders labeled inputs and textareas without running layout effects", () => {
    const html = renderToString(() => (
      <>
        <Input label="Email" value="user@example.com" />
        <InputArea
          label="Notes"
          defaultValue="Initial notes"
          autoResize
          minRows={3}
        />
      </>
    ));

    expect(html).toContain("<input");
    expect(html).toContain("Email");
    expect(html).toContain("user@example.com");
    expect(html).toContain("<textarea");
    expect(html).toContain("Notes");
    expect(html).toContain("Initial notes");
    expect(html).toContain('rows="3"');
    expect(html).not.toContain("height:");
  });

  it("renders radio and switch state accessibly without a DOM", () => {
    const html = renderToString(() => (
      <>
        <Radio.Group legend="Plan" defaultValue="pro">
          <Radio.Item label="Free" value="free" />
          <Radio.Item label="Pro" value="pro" />
        </Radio.Group>
        <Switch label="Email alerts" defaultChecked />
      </>
    ));

    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('aria-label="Plan"');
    expect(html).toContain('role="radio"');
    expect(html).toContain('aria-checked="true"');
    expect(html).toContain("Pro");
    expect(html).toContain('role="switch"');
    expect(html).toContain("Email alerts");
  });

  it("renders selected and placeholder Select values without a DOM", () => {
    const html = renderToString(() => (
      <>
        <Select
          aria-label="Database"
          value="postgres"
          items={[
            { value: "postgres", label: "PostgreSQL" },
            { value: "mysql", label: "MySQL" },
          ]}
        />
        <Select
          aria-label="Region"
          value={null}
          placeholder="Choose a region"
          items={{ iad: "Virginia", lhr: "London" }}
        />
      </>
    ));

    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-label="Database"');
    expect(html).toContain("PostgreSQL");
    expect(html).toContain("Choose a region");
    expect(html).not.toContain('role="listbox"');
  });

  it("renders search controls and command results without a DOM", () => {
    const html = renderToString(() => (
      <>
        <Autocomplete items={["Workers", "Pages"]}>
          <Autocomplete.InputGroup placeholder="Search products" />
        </Autocomplete>
        <Combobox
          items={["Virginia", "London"]}
          defaultValue="London"
          name="region"
        >
          <Combobox.TriggerValue placeholder="Choose a region" />
        </Combobox>
        <CommandPalette.Panel
          items={[{ title: "Create project" }]}
          itemToStringValue={(item) => item.title}
        >
          <CommandPalette.Input placeholder="Search commands" />
          <CommandPalette.List>
            <CommandPalette.Results>
              {(item: { title: string }) => (
                <CommandPalette.Item value={item}>
                  {item.title}
                </CommandPalette.Item>
              )}
            </CommandPalette.Results>
          </CommandPalette.List>
        </CommandPalette.Panel>
      </>
    ));

    expect(html).toContain('placeholder="Search products"');
    expect(html).toContain('aria-autocomplete="list"');
    expect(html).toContain("London");
    expect(html).toContain('type="hidden"');
    expect(html).toContain('name="region"');
    expect(html).toContain('placeholder="Search commands"');
    expect(html).toContain("Create project");
  });

  it("renders legacy and compound Pagination layouts without a DOM", () => {
    const html = renderToString(() => (
      <>
        <Pagination
          page={2}
          perPage={10}
          totalCount={100}
          setPage={() => undefined}
        />
        <Pagination
          page={3}
          perPage={25}
          totalCount={200}
          setPage={() => undefined}
        >
          <Pagination.Info />
          <Pagination.Controls controls="simple" />
        </Pagination>
      </>
    ));

    expect(html).toContain('data-slot="pagination"');
    expect(html).toContain('aria-label="Pagination"');
    expect(html).toContain('aria-label="Page number"');
    expect(html).toContain("11-20");
    expect(html).toContain("51-75");
    expect(html).toContain("100");
    expect(html).toContain("200");
  });

  it("renders selected segmented and underline tabs without a DOM", () => {
    const html = renderToString(() => (
      <>
        <Tabs
          selectedValue="analytics"
          tabs={[
            { value: "overview", label: "Overview" },
            { value: "analytics", label: "Analytics" },
          ]}
        />
        <Tabs
          variant="underline"
          size="sm"
          tabs={[
            { value: "activity", label: "Activity" },
            { value: "settings", label: "Settings" },
          ]}
        />
      </>
    ));

    expect(html.match(/role="tablist"/g)).toHaveLength(2);
    expect(html).toContain('role="tab"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain("Analytics");
    expect(html).toContain("ring-kumo-hairline/70");
    expect(html).toContain("border-kumo-hairline");
    expect(html).toContain('aria-label="Scroll tabs right"');
  });

  it("renders a closed Popover trigger without portal content", () => {
    const html = renderToString(() => (
      <Popover>
        <Popover.Trigger>Open details</Popover.Trigger>
        <Popover.Content>
          <Popover.Title>Deployment details</Popover.Title>
          <Popover.Description>
            Configuration for this deployment.
          </Popover.Description>
        </Popover.Content>
      </Popover>
    ));

    expect(html).toContain('data-kumo-component="Popover"');
    expect(html).toContain('data-kumo-part="trigger"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("Open details");
    expect(html).not.toContain("Deployment details");
    expect(html).not.toContain("kumo-popover-popup");
  });

  it("renders a closed Dialog trigger without portal content", () => {
    const html = renderToString(() => (
      <Dialog.Root>
        <Dialog.Trigger>Open dialog</Dialog.Trigger>
        <Dialog>
          <Dialog.Title>Deployment settings</Dialog.Title>
          <Dialog.Description>Configure this deployment.</Dialog.Description>
        </Dialog>
      </Dialog.Root>
    ));

    expect(html).toContain('data-kumo-component="Dialog"');
    expect(html).toContain('data-kumo-part="trigger"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("Open dialog");
    expect(html).not.toContain("Deployment settings");
    expect(html).not.toContain('role="dialog"');
  });

  it("renders a closed DropdownMenu trigger without portal content", () => {
    const html = renderToString(() => (
      <DropdownMenu>
        <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Edit</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    ));

    expect(html).toContain('data-kumo-component="DropdownMenu"');
    expect(html).toContain('data-kumo-part="trigger"');
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("Actions");
    expect(html).not.toContain("Edit");
    expect(html).not.toContain('role="menu"');
  });

  it("renders Toasty application content without portal markup", () => {
    const html = renderToString(() => (
      <Toasty>
        <span>Toast-ready application</span>
      </Toasty>
    ));

    expect(html).toContain("Toast-ready application");
    expect(html).not.toContain('data-kumo-part="viewport"');
    expect(html).not.toContain('data-kumo-part="root"');
  });

  it("renders compound and sensitive inputs without a DOM", () => {
    const html = renderToString(() => (
      <>
        <InputGroup label="Subdomain">
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input defaultValue="kumo" />
          <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
          <InputGroup.Button variant="secondary">Save</InputGroup.Button>
        </InputGroup>
        <SensitiveInput label="API key" defaultValue="secret-value" />
      </>
    ));

    expect(html).toContain('data-focus-mode="hybrid"');
    expect(html).toContain('data-slot="input-group-container-zone"');
    expect(html).toContain("Subdomain");
    expect(html).toContain(".workers.dev");
    expect(html).toContain(">Save</span>");
    expect(html).toContain('data-kumo-component="SensitiveInput"');
    expect(html).toContain('data-kumo-part="masked-container"');
    expect(html).toContain("API key, masked.");
    expect(html).toContain('type="password"');
  });

  it("renders navigation, branding, and disclosures without a DOM", () => {
    const html = renderToString(() => (
      <>
        <Breadcrumbs>
          <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Current>Settings</Breadcrumbs.Current>
        </Breadcrumbs>
        <CloudflareLogo variant="glyph" color="black" />
        <Collapsible.Root defaultOpen>
          <Collapsible.DefaultTrigger>Details</Collapsible.DefaultTrigger>
          <Collapsible.DefaultPanel>
            Disclosure content
          </Collapsible.DefaultPanel>
        </Collapsible.Root>
      </>
    ));

    expect(html).toContain('aria-label="breadcrumb"');
    expect(html).toContain('href="/"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('viewBox="0 0 49 22"');
    expect(html).toContain("text-black");
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain("Disclosure content");
  });

  it("renders banners and clipboard text without a DOM", () => {
    const html = renderToString(() => (
      <>
        <Banner
          variant="error"
          title="Save failed"
          description="Try the request again."
          action={<Banner.Action>Retry</Banner.Action>}
        />
        <ClipboardText text="npx kumo add banner" />
      </>
    ));

    expect(html).toContain("bg-kumo-danger-tint");
    expect(html).toContain("Save failed");
    expect(html).toContain("Try the request again.");
    expect(html).toContain("Retry");
    expect(html).toContain("npx kumo add banner");
    expect(html).toContain('aria-label="Copy to clipboard"');
  });

  it("renders a selected calendar without a DOM", () => {
    const html = renderToString(() => (
      <DatePicker
        mode="single"
        month={new Date(2025, 4, 1)}
        selected={new Date(2025, 4, 12)}
      />
    ));

    expect(html).toContain("rdp-root");
    expect(html).toContain("May 2025");
    expect(html).toContain('role="grid"');
    expect(html).toContain('data-day="2025-05-12"');
    expect(html).toContain("rdp-selected");
  });

  it("renders the legacy dual-calendar picker without a DOM", () => {
    const html = renderToString(() => (
      <DateRangePicker
        timezone="UTC"
        onStartDateChange={() => undefined}
        onEndDateChange={() => undefined}
      />
    ));

    expect(html).toContain("bg-kumo-overlay");
    expect(html.match(/aria-label="Edit month and year"/g)).toHaveLength(2);
    expect(html).toContain('aria-label="Previous month"');
    expect(html).toContain('aria-label="Next month"');
    expect(html).toContain("Timezone:");
    expect(html).toContain("UTC");
    expect(html).toContain("Reset Dates");
  });

  it("renders a selected table with sticky and check columns without a DOM", () => {
    const html = renderToString(() => (
      <Table layout="fixed">
        <Table.Header variant="compact" sticky>
          <Table.Row>
            <Table.CheckHead checked aria-label="Select all deployments" />
            <Table.Head sticky="right">Actions</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row variant="selected">
            <Table.CheckCell aria-label="Select api" />
            <Table.Cell sticky="right">Open</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    ));

    expect(html).toContain("<table");
    expect(html).toContain("table-fixed");
    expect(html).toContain('data-compact=""');
    expect(html).toContain("bg-kumo-tint");
    expect(html).toContain("right-0");
    expect(html).toContain('aria-label="Select all deployments"');
    expect(html).toContain('aria-label="Select api"');
  });

  it("renders table-of-contents navigation and render overrides without a DOM", () => {
    const html = renderToString(() => (
      <TableOfContents>
        <TableOfContents.Title>On this page</TableOfContents.Title>
        <TableOfContents.List>
          <TableOfContents.Item href="#intro" active>
            Introduction
          </TableOfContents.Item>
          <TableOfContents.Group label="API" href="#api">
            <TableOfContents.Item render="button" type="button">
              Select methods
            </TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents.List>
      </TableOfContents>
    ));

    expect(html).toContain("<nav");
    expect(html).toContain('aria-label="Table of contents"');
    expect(html).toContain('href="#intro"');
    expect(html).toContain('aria-current="true"');
    expect(html).toContain("<button");
    expect(html).toContain("Select methods");
    expect(html).toContain('data-kumo-part="group-link"');
  });

  it("renders a menu bar with named, active tooltip triggers without a DOM", () => {
    const html = renderToString(() => (
      <MenuBar
        aria-label="View options"
        isActive="grid"
        optionIds
        options={[
          {
            id: "list",
            icon: "L",
            tooltip: "List view",
            onClick: () => undefined,
          },
          {
            id: "grid",
            icon: "G",
            tooltip: "Grid view",
            onClick: () => undefined,
          },
        ]}
      />
    ));

    expect(html).toContain("<nav");
    expect(html).toContain('aria-label="View options"');
    expect(html).toContain('data-kumo-component="MenuBar"');
    expect(html).toContain('aria-label="Grid view"');
    expect(html).toContain("bg-kumo-base");
  });

  it("renders a compound toolbar without a DOM", () => {
    const html = renderToString(() => (
      <Toolbar size="sm">
        <Toolbar.InputGroup aria-label="Search DNS records">
          <InputGroup.Input defaultValue="api" />
          <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
        </Toolbar.InputGroup>
        <Toolbar.Button>Filter</Toolbar.Button>
      </Toolbar>
    ));

    expect(html).toContain('role="toolbar"');
    expect(html).toContain('data-kumo-component="Toolbar"');
    expect(html).toContain('aria-label="Search DNS records"');
    expect(html).toContain(".workers.dev");
    expect(html).toContain("Filter");
    expect(html).toContain("h-6.5");
  });
});
