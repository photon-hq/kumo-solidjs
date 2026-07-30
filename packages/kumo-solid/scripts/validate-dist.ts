import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createComponent, type Component } from "solid-js";
import { renderToString } from "solid-js/web";

type ExportTarget = string | ExportConditions;
interface ExportConditions {
  [condition: string]: ExportTarget;
}
type BuiltComponent = Component<Record<string, unknown>>;

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(
  readFileSync(join(packageRoot, "package.json"), "utf8"),
) as {
  exports: Record<string, ExportTarget>;
};

function targets(value: ExportTarget): string[] {
  if (typeof value === "string") return [value];
  return Object.values(value).flatMap(targets);
}

function assertExportTarget(target: string) {
  const relativeTarget = target.replace(/^\.\//, "");

  if (!relativeTarget.includes("*")) {
    if (!existsSync(join(packageRoot, relativeTarget))) {
      throw new Error(`Missing package export target: ${target}`);
    }
    return;
  }

  const directory = join(packageRoot, dirname(relativeTarget));
  const filename = relativeTarget.slice(relativeTarget.lastIndexOf("/") + 1);
  const [prefix, suffix] = filename.split("*");
  const matchingFiles = existsSync(directory)
    ? readdirSync(directory).filter(
        (file) => file.startsWith(prefix) && file.endsWith(suffix),
      )
    : [];

  if (matchingFiles.length === 0) {
    throw new Error(`Package export pattern has no matching files: ${target}`);
  }
}

for (const value of Object.values(packageJson.exports)) {
  for (const target of targets(value)) {
    assertExportTarget(target);
  }
}

const built = (await import("@photon-ai/kumo-solid")) as unknown as {
  Autocomplete: BuiltComponent & {
    Content: BuiltComponent;
    InputGroup: BuiltComponent;
    Item: BuiltComponent;
    List: BuiltComponent;
  };
  Badge: BuiltComponent;
  Banner: BuiltComponent & {
    Action: BuiltComponent;
  };
  Breadcrumbs: BuiltComponent & {
    Current: BuiltComponent;
    Link: BuiltComponent;
    Separator: BuiltComponent;
  };
  Button: BuiltComponent;
  Checkbox: BuiltComponent;
  ClipboardText: BuiltComponent;
  CloudflareLogo: BuiltComponent;
  Code: BuiltComponent;
  Collapsible: BuiltComponent & {
    DefaultPanel: BuiltComponent;
    DefaultTrigger: BuiltComponent;
  };
  Combobox: BuiltComponent & {
    Content: BuiltComponent;
    Item: BuiltComponent;
    List: BuiltComponent;
    TriggerInput: BuiltComponent;
    TriggerValue: BuiltComponent;
  };
  CommandPalette: {
    Input: BuiltComponent;
    Item: BuiltComponent;
    List: BuiltComponent;
    Panel: BuiltComponent;
    Results: BuiltComponent;
    Root: BuiltComponent;
  };
  ChartLegend: {
    SmallItem: BuiltComponent;
  };
  DatePicker: BuiltComponent;
  DateRangePicker: BuiltComponent;
  Dialog: BuiltComponent & {
    Close: BuiltComponent;
    Description: BuiltComponent;
    Root: BuiltComponent;
    Title: BuiltComponent;
    Trigger: BuiltComponent;
  };
  DropdownMenu: BuiltComponent & {
    Content: BuiltComponent;
    Item: BuiltComponent;
    Trigger: BuiltComponent;
  };
  Empty: BuiltComponent;
  Field: BuiltComponent;
  Flow: BuiltComponent & {
    Node: BuiltComponent;
  };
  Grid: BuiltComponent;
  GridItem: BuiltComponent;
  Input: BuiltComponent;
  InputArea: BuiltComponent;
  InputGroup: BuiltComponent & {
    Addon: BuiltComponent;
    Button: BuiltComponent;
    Input: BuiltComponent;
    Suffix: BuiltComponent;
  };
  LayerCard: BuiltComponent & {
    Primary: BuiltComponent;
  };
  Link: BuiltComponent;
  MenuBar: BuiltComponent;
  Meter: BuiltComponent;
  Pagination: BuiltComponent & {
    Controls: BuiltComponent;
    Info: BuiltComponent;
  };
  Popover: BuiltComponent & {
    Close: BuiltComponent;
    Content: BuiltComponent;
    Description: BuiltComponent;
    Title: BuiltComponent;
    Trigger: BuiltComponent;
  };
  Radio: BuiltComponent & {
    Item: BuiltComponent;
  };
  Select: BuiltComponent & {
    Option: BuiltComponent;
  };
  SensitiveInput: BuiltComponent;
  Sidebar: BuiltComponent & {
    Content: BuiltComponent;
    MenuButton: BuiltComponent;
    Provider: BuiltComponent;
  };
  Surface: BuiltComponent;
  Switch: BuiltComponent;
  Table: BuiltComponent & {
    Body: BuiltComponent;
    Cell: BuiltComponent;
    CheckHead: BuiltComponent;
    Head: BuiltComponent;
    Header: BuiltComponent;
    Row: BuiltComponent;
  };
  TableOfContents: BuiltComponent & {
    Group: BuiltComponent;
    Item: BuiltComponent;
    List: BuiltComponent;
    Title: BuiltComponent;
  };
  Tabs: BuiltComponent;
  Text: BuiltComponent;
  Toasty: BuiltComponent;
  TimeseriesChart: BuiltComponent;
  Toolbar: BuiltComponent & {
    Button: BuiltComponent;
    Input: BuiltComponent;
    InputGroup: BuiltComponent;
  };
  createKumoToastManager: unknown;
  useTableOfContentsActiveId: unknown;
};

const finalFamilyHtml = renderToString(() => [
  createComponent(built.ChartLegend.SmallItem, {
    name: "Requests",
    color: "#4290F0",
    value: "42",
  }),
  createComponent(built.TimeseriesChart, {
    echarts: {},
    loading: true,
    height: 180,
    data: [
      {
        name: "Requests",
        color: "#4290F0",
        data: [[1, 42]],
      },
    ],
  }),
  createComponent(built.Flow, {
    get children() {
      return [
        createComponent(built.Flow.Node, {
          id: "start",
          get children() {
            return "Start";
          },
        }),
        createComponent(built.Flow.Node, {
          id: "finish",
          get children() {
            return "Finish";
          },
        }),
      ];
    },
  }),
  createComponent(built.Sidebar.Provider, {
    contained: true,
    defaultOpen: true,
    get children() {
      return createComponent(built.Sidebar, {
        get children() {
          return createComponent(built.Sidebar.Content, {
            get children() {
              return createComponent(built.Sidebar.MenuButton, {
                get children() {
                  return "Home";
                },
              });
            },
          });
        },
      });
    },
  }),
]);

const autocompleteHtml = renderToString(() =>
  createComponent(built.Autocomplete, {
    items: ["Workers", "Pages"],
    get children() {
      return createComponent(built.Autocomplete.InputGroup, {
        placeholder: "Search products",
      });
    },
  }),
);
const comboboxHtml = renderToString(() =>
  createComponent(built.Combobox, {
    items: ["Virginia", "London"],
    defaultValue: "London",
    name: "region",
    get children() {
      return createComponent(built.Combobox.TriggerValue, {
        placeholder: "Choose a region",
      });
    },
  }),
);
const commandItems = [{ title: "Create project" }];
const commandPaletteHtml = renderToString(() =>
  createComponent(built.CommandPalette.Panel, {
    items: commandItems,
    itemToStringValue: (item: { title: string }) => item.title,
    get children() {
      return [
        createComponent(built.CommandPalette.Input, {
          placeholder: "Search commands",
        }),
        createComponent(built.CommandPalette.List, {
          get children() {
            return createComponent(built.CommandPalette.Results, {
              get children() {
                return (item: { title: string }) =>
                  createComponent(built.CommandPalette.Item, {
                    value: item,
                    get children() {
                      return item.title;
                    },
                  });
              },
            });
          },
        }),
      ];
    },
  }),
);
const badgeHtml = renderToString(() =>
  createComponent(built.Badge, {
    variant: "success",
    get children() {
      return "Ready";
    },
  }),
);
const bannerHtml = renderToString(() =>
  createComponent(built.Banner, {
    variant: "error",
    title: "Save failed",
    description: "Try again.",
    get action() {
      return createComponent(built.Banner.Action, {
        get children() {
          return "Retry";
        },
      });
    },
  }),
);
const breadcrumbsHtml = renderToString(() =>
  createComponent(built.Breadcrumbs, {
    get children() {
      return [
        createComponent(built.Breadcrumbs.Link, {
          href: "/",
          get children() {
            return "Home";
          },
        }),
        createComponent(built.Breadcrumbs.Separator, {}),
        createComponent(built.Breadcrumbs.Current, {
          get children() {
            return "Settings";
          },
        }),
      ];
    },
  }),
);
const textHtml = renderToString(() =>
  createComponent(built.Text, {
    as: "h2",
    variant: "heading2",
    get children() {
      return "Heading";
    },
  }),
);
const buttonHtml = renderToString(() =>
  createComponent(built.Button, {
    variant: "primary",
    get children() {
      return "Save";
    },
  }),
);
const checkboxHtml = renderToString(() =>
  createComponent(built.Checkbox, {
    "aria-label": "Select item",
    checked: true,
  }),
);
const clipboardTextHtml = renderToString(() =>
  createComponent(built.ClipboardText, {
    text: "npx kumo add banner",
  }),
);
const cloudflareLogoHtml = renderToString(() =>
  createComponent(built.CloudflareLogo, {
    variant: "glyph",
    color: "black",
  }),
);
const codeHtml = renderToString(() =>
  createComponent(built.Code, {
    code: "pnpm test",
    lang: "bash",
  }),
);
const collapsibleHtml = renderToString(() =>
  createComponent(built.Collapsible, {
    defaultOpen: true,
    get children() {
      return [
        createComponent(built.Collapsible.DefaultTrigger, {
          get children() {
            return "Details";
          },
        }),
        createComponent(built.Collapsible.DefaultPanel, {
          get children() {
            return "Disclosure content";
          },
        }),
      ];
    },
  }),
);
const datePickerHtml = renderToString(() =>
  createComponent(built.DatePicker, {
    mode: "single",
    month: new Date(2025, 4, 1),
    selected: new Date(2025, 4, 12),
  }),
);
const dateRangePickerHtml = renderToString(() =>
  createComponent(built.DateRangePicker, {
    timezone: "UTC",
    onStartDateChange: () => undefined,
    onEndDateChange: () => undefined,
  }),
);
const dialogHtml = renderToString(() =>
  createComponent(built.Dialog.Root, {
    get children() {
      return [
        createComponent(built.Dialog.Trigger, {
          get children() {
            return "Open dialog";
          },
        }),
        createComponent(built.Dialog, {
          get children() {
            return [
              createComponent(built.Dialog.Title, {
                get children() {
                  return "Deployment settings";
                },
              }),
              createComponent(built.Dialog.Description, {
                get children() {
                  return "Configure this deployment.";
                },
              }),
            ];
          },
        }),
      ];
    },
  }),
);
const dropdownMenuHtml = renderToString(() =>
  createComponent(built.DropdownMenu, {
    get children() {
      return [
        createComponent(built.DropdownMenu.Trigger, {
          get children() {
            return "Actions";
          },
        }),
        createComponent(built.DropdownMenu.Content, {
          get children() {
            return createComponent(built.DropdownMenu.Item, {
              get children() {
                return "Edit";
              },
            });
          },
        }),
      ];
    },
  }),
);
const emptyHtml = renderToString(() =>
  createComponent(built.Empty, {
    title: "No results",
  }),
);
const fieldHtml = renderToString(() =>
  createComponent(built.Field, {
    label: "Field label",
    description: "Field description",
    get children() {
      return createComponent(built.Input, {
        "aria-label": "Field control",
      });
    },
  }),
);
const gridHtml = renderToString(() =>
  createComponent(built.Grid, {
    variant: "2up",
    get children() {
      return createComponent(built.GridItem, {
        get children() {
          return "Grid item";
        },
      });
    },
  }),
);
const layerCardHtml = renderToString(() =>
  createComponent(built.LayerCard, {
    get children() {
      return createComponent(built.LayerCard.Primary, {
        get children() {
          return "Layer content";
        },
      });
    },
  }),
);
const inputHtml = renderToString(() =>
  createComponent(built.Input, {
    label: "Email",
    value: "user@example.com",
  }),
);
const inputAreaHtml = renderToString(() =>
  createComponent(built.InputArea, {
    "aria-label": "Notes",
    autoResize: true,
    defaultValue: "Initial notes",
    minRows: 3,
  }),
);
const inputGroupHtml = renderToString(() =>
  createComponent(built.InputGroup, {
    label: "Subdomain",
    get children() {
      return [
        createComponent(built.InputGroup.Addon, {
          get children() {
            return "@";
          },
        }),
        createComponent(built.InputGroup.Input, {
          defaultValue: "kumo",
        }),
        createComponent(built.InputGroup.Suffix, {
          get children() {
            return ".workers.dev";
          },
        }),
        createComponent(built.InputGroup.Button, {
          variant: "secondary",
          get children() {
            return "Save";
          },
        }),
      ];
    },
  }),
);
const linkHtml = renderToString(() =>
  createComponent(built.Link, {
    href: "/docs",
    get children() {
      return "Docs";
    },
  }),
);
const menuBarHtml = renderToString(() =>
  createComponent(built.MenuBar, {
    "aria-label": "View options",
    isActive: "grid",
    optionIds: true,
    options: [
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
    ],
  }),
);
const toolbarHtml = renderToString(() =>
  createComponent(built.Toolbar, {
    size: "sm",
    get children() {
      return [
        createComponent(built.Toolbar.InputGroup, {
          "aria-label": "Search DNS records",
          get children() {
            return [
              createComponent(built.InputGroup.Input, {
                defaultValue: "api",
              }),
              createComponent(built.InputGroup.Suffix, {
                get children() {
                  return ".workers.dev";
                },
              }),
            ];
          },
        }),
        createComponent(built.Toolbar.Button, {
          get children() {
            return "Filter";
          },
        }),
      ];
    },
  }),
);
const meterHtml = renderToString(() =>
  createComponent(built.Meter, {
    label: "Storage",
    value: 65,
  }),
);
const paginationHtml = renderToString(() =>
  createComponent(built.Pagination, {
    page: 2,
    perPage: 10,
    totalCount: 100,
    setPage: () => undefined,
    get children() {
      return [
        createComponent(built.Pagination.Info, {}),
        createComponent(built.Pagination.Controls, {}),
      ];
    },
  }),
);
const popoverHtml = renderToString(() =>
  createComponent(built.Popover, {
    get children() {
      return [
        createComponent(built.Popover.Trigger, {
          get children() {
            return "Open details";
          },
        }),
        createComponent(built.Popover.Content, {
          get children() {
            return [
              createComponent(built.Popover.Title, {
                get children() {
                  return "Deployment details";
                },
              }),
              createComponent(built.Popover.Description, {
                get children() {
                  return "Deployment configuration";
                },
              }),
            ];
          },
        }),
      ];
    },
  }),
);
const radioHtml = renderToString(() =>
  createComponent(built.Radio, {
    legend: "Plan",
    defaultValue: "pro",
    get children() {
      return [
        createComponent(built.Radio.Item, {
          label: "Free",
          value: "free",
        }),
        createComponent(built.Radio.Item, {
          label: "Pro",
          value: "pro",
        }),
      ];
    },
  }),
);
const selectHtml = renderToString(() =>
  createComponent(built.Select, {
    "aria-label": "Database",
    value: "postgres",
    items: [
      { label: "PostgreSQL", value: "postgres" },
      { label: "MySQL", value: "mysql" },
    ],
  }),
);
const sensitiveInputHtml = renderToString(() =>
  createComponent(built.SensitiveInput, {
    label: "API key",
    defaultValue: "secret-value",
  }),
);
const surfaceHtml = renderToString(() =>
  createComponent(built.Surface, {
    as: "section",
    get children() {
      return "Surface";
    },
  }),
);
const switchHtml = renderToString(() =>
  createComponent(built.Switch, {
    label: "Email alerts",
    defaultChecked: true,
  }),
);
const tableHtml = renderToString(() =>
  createComponent(built.Table, {
    layout: "fixed",
    get children() {
      return [
        createComponent(built.Table.Header, {
          variant: "compact",
          sticky: true,
          get children() {
            return createComponent(built.Table.Row, {
              get children() {
                return [
                  createComponent(built.Table.CheckHead, {
                    checked: true,
                    "aria-label": "Select all deployments",
                  }),
                  createComponent(built.Table.Head, {
                    get children() {
                      return "Worker";
                    },
                  }),
                ];
              },
            });
          },
        }),
        createComponent(built.Table.Body, {
          get children() {
            return createComponent(built.Table.Row, {
              variant: "selected",
              get children() {
                return createComponent(built.Table.Cell, {
                  get children() {
                    return "api";
                  },
                });
              },
            });
          },
        }),
      ];
    },
  }),
);
const tableOfContentsHtml = renderToString(() =>
  createComponent(built.TableOfContents, {
    get children() {
      return [
        createComponent(built.TableOfContents.Title, {
          get children() {
            return "On this page";
          },
        }),
        createComponent(built.TableOfContents.List, {
          get children() {
            return [
              createComponent(built.TableOfContents.Item, {
                href: "#intro",
                active: true,
                get children() {
                  return "Introduction";
                },
              }),
              createComponent(built.TableOfContents.Group, {
                label: "API",
                href: "#api",
                get children() {
                  return createComponent(built.TableOfContents.Item, {
                    render: "button",
                    type: "button",
                    get children() {
                      return "Select methods";
                    },
                  });
                },
              }),
            ];
          },
        }),
      ];
    },
  }),
);
const tabsHtml = renderToString(() =>
  createComponent(built.Tabs, {
    selectedValue: "analytics",
    variant: "underline",
    tabs: [
      { label: "Overview", value: "overview" },
      { label: "Analytics", value: "analytics" },
      { label: "Settings", value: "settings" },
    ],
  }),
);
const toastyHtml = renderToString(() =>
  createComponent(built.Toasty, {
    get children() {
      return "Toast-ready application";
    },
  }),
);

if (
  !autocompleteHtml.includes('role="combobox"') ||
  !autocompleteHtml.includes('aria-autocomplete="list"') ||
  !autocompleteHtml.includes('placeholder="Search products"')
) {
  throw new Error(
    `Built Autocomplete failed its SSR smoke test: ${autocompleteHtml}`,
  );
}

if (
  !comboboxHtml.includes('role="combobox"') ||
  !comboboxHtml.includes("London") ||
  !comboboxHtml.includes('type="hidden"') ||
  !comboboxHtml.includes('name="region"')
) {
  throw new Error(`Built Combobox failed its SSR smoke test: ${comboboxHtml}`);
}

if (
  !commandPaletteHtml.includes('role="combobox"') ||
  !commandPaletteHtml.includes('placeholder="Search commands"') ||
  !commandPaletteHtml.includes("Create project")
) {
  throw new Error(
    `Built CommandPalette failed its SSR smoke test: ${commandPaletteHtml}`,
  );
}

if (
  !badgeHtml.includes("<span") ||
  !badgeHtml.includes("bg-kumo-success-tint") ||
  !badgeHtml.includes("Ready") ||
  !badgeHtml.endsWith("</span>")
) {
  throw new Error(`Built Badge failed its SSR smoke test: ${badgeHtml}`);
}

if (
  !bannerHtml.includes("bg-kumo-danger-tint") ||
  !bannerHtml.includes("Save failed") ||
  !bannerHtml.includes("Try again.") ||
  !bannerHtml.includes("Retry")
) {
  throw new Error(`Built Banner failed its SSR smoke test: ${bannerHtml}`);
}

if (
  !breadcrumbsHtml.includes('aria-label="breadcrumb"') ||
  !breadcrumbsHtml.includes('href="/"') ||
  !breadcrumbsHtml.includes('aria-current="page"') ||
  !breadcrumbsHtml.includes("Settings")
) {
  throw new Error(
    `Built Breadcrumbs failed its SSR smoke test: ${breadcrumbsHtml}`,
  );
}

if (
  !textHtml.includes("<h2") ||
  !textHtml.includes("text-2xl") ||
  !textHtml.includes("Heading") ||
  !textHtml.endsWith("</h2>")
) {
  throw new Error(`Built Text failed its SSR smoke test: ${textHtml}`);
}

if (
  !buttonHtml.includes('data-kumo-component="Button"') ||
  !buttonHtml.includes("bg-(--kumo-button-emphasis-bg)") ||
  !buttonHtml.includes("Save")
) {
  throw new Error(`Built Button failed its SSR smoke test: ${buttonHtml}`);
}

if (
  !checkboxHtml.includes('role="checkbox"') ||
  !checkboxHtml.includes('aria-checked="true"') ||
  !checkboxHtml.includes('aria-label="Select item"')
) {
  throw new Error(`Built Checkbox failed its SSR smoke test: ${checkboxHtml}`);
}

if (
  !clipboardTextHtml.includes("npx kumo add banner") ||
  !clipboardTextHtml.includes('aria-label="Copy to clipboard"') ||
  !clipboardTextHtml.includes("font-mono")
) {
  throw new Error(
    `Built ClipboardText failed its SSR smoke test: ${clipboardTextHtml}`,
  );
}

if (
  !cloudflareLogoHtml.includes('viewBox="0 0 49 22"') ||
  !cloudflareLogoHtml.includes("text-black") ||
  !cloudflareLogoHtml.includes('fill="currentColor"')
) {
  throw new Error(
    `Built CloudflareLogo failed its SSR smoke test: ${cloudflareLogoHtml}`,
  );
}

if (
  !codeHtml.includes("<pre") ||
  !codeHtml.includes("font-mono") ||
  !codeHtml.includes("pnpm test")
) {
  throw new Error(`Built Code failed its SSR smoke test: ${codeHtml}`);
}

if (
  !collapsibleHtml.includes('aria-expanded="true"') ||
  !collapsibleHtml.includes("border-kumo-fill") ||
  !collapsibleHtml.includes("Disclosure content")
) {
  throw new Error(
    `Built Collapsible failed its SSR smoke test: ${collapsibleHtml}`,
  );
}

if (
  !datePickerHtml.includes("rdp-root") ||
  !datePickerHtml.includes("May 2025") ||
  !datePickerHtml.includes('role="grid"') ||
  !datePickerHtml.includes('data-day="2025-05-12"') ||
  !datePickerHtml.includes("rdp-selected")
) {
  throw new Error(
    `Built DatePicker failed its SSR smoke test: ${datePickerHtml}`,
  );
}

if (
  !dateRangePickerHtml.includes("bg-kumo-overlay") ||
  dateRangePickerHtml.match(/aria-label="Edit month and year"/g)?.length !==
    2 ||
  !dateRangePickerHtml.includes('aria-label="Previous month"') ||
  !dateRangePickerHtml.includes('aria-label="Next month"') ||
  !dateRangePickerHtml.includes("Timezone:") ||
  !dateRangePickerHtml.includes("UTC") ||
  !dateRangePickerHtml.includes("Reset Dates")
) {
  throw new Error(
    `Built DateRangePicker failed its SSR smoke test: ${dateRangePickerHtml}`,
  );
}

if (
  !dialogHtml.includes('data-kumo-component="Dialog"') ||
  !dialogHtml.includes('data-kumo-part="trigger"') ||
  !dialogHtml.includes('aria-haspopup="dialog"') ||
  !dialogHtml.includes('aria-expanded="false"') ||
  !dialogHtml.includes("Open dialog") ||
  dialogHtml.includes("Deployment settings")
) {
  throw new Error(`Built Dialog failed its SSR smoke test: ${dialogHtml}`);
}

if (
  !dropdownMenuHtml.includes('data-kumo-component="DropdownMenu"') ||
  !dropdownMenuHtml.includes('data-kumo-part="trigger"') ||
  !dropdownMenuHtml.includes('aria-haspopup="menu"') ||
  !dropdownMenuHtml.includes('aria-expanded="false"') ||
  !dropdownMenuHtml.includes("Actions") ||
  dropdownMenuHtml.includes("Edit")
) {
  throw new Error(
    `Built DropdownMenu failed its SSR smoke test: ${dropdownMenuHtml}`,
  );
}

if (
  !emptyHtml.includes("bg-kumo-control") ||
  !emptyHtml.includes("No results")
) {
  throw new Error(`Built Empty failed its SSR smoke test: ${emptyHtml}`);
}

if (
  !fieldHtml.includes("Field label") ||
  !fieldHtml.includes("Field description") ||
  !fieldHtml.includes("<input")
) {
  throw new Error(`Built Field failed its SSR smoke test: ${fieldHtml}`);
}

if (!gridHtml.includes("md:grid-cols-2") || !gridHtml.includes("Grid item")) {
  throw new Error(`Built Grid failed its SSR smoke test: ${gridHtml}`);
}

if (
  !layerCardHtml.includes("bg-kumo-elevated") ||
  !layerCardHtml.includes("ring-kumo-fill") ||
  !layerCardHtml.includes("Layer content")
) {
  throw new Error(
    `Built LayerCard failed its SSR smoke test: ${layerCardHtml}`,
  );
}

if (
  !inputHtml.includes("<input") ||
  !inputHtml.includes("Email") ||
  !inputHtml.includes("user@example.com")
) {
  throw new Error(`Built Input failed its SSR smoke test: ${inputHtml}`);
}

if (
  !inputAreaHtml.includes("<textarea") ||
  !inputAreaHtml.includes("Initial notes") ||
  !inputAreaHtml.includes('rows="3"')
) {
  throw new Error(
    `Built InputArea failed its SSR smoke test: ${inputAreaHtml}`,
  );
}

if (
  !inputGroupHtml.includes('data-focus-mode="hybrid"') ||
  !inputGroupHtml.includes('data-slot="input-group-container-zone"') ||
  !inputGroupHtml.includes(".workers.dev") ||
  !inputGroupHtml.includes("Save")
) {
  throw new Error(
    `Built InputGroup failed its SSR smoke test: ${inputGroupHtml}`,
  );
}

if (
  !linkHtml.includes('data-kumo-component="Link"') ||
  !linkHtml.includes('href="/docs"') ||
  !linkHtml.includes("Docs")
) {
  throw new Error(`Built Link failed its SSR smoke test: ${linkHtml}`);
}

if (
  !menuBarHtml.includes("<nav") ||
  !menuBarHtml.includes('aria-label="View options"') ||
  !menuBarHtml.includes('data-kumo-component="MenuBar"') ||
  !menuBarHtml.includes('aria-label="Grid view"') ||
  !menuBarHtml.includes("bg-kumo-base")
) {
  throw new Error(`Built MenuBar failed its SSR smoke test: ${menuBarHtml}`);
}

if (
  !toolbarHtml.includes('role="toolbar"') ||
  !toolbarHtml.includes('data-kumo-component="Toolbar"') ||
  !toolbarHtml.includes('aria-label="Search DNS records"') ||
  !toolbarHtml.includes(".workers.dev") ||
  !toolbarHtml.includes("Filter") ||
  !toolbarHtml.includes("h-6.5")
) {
  throw new Error(`Built Toolbar failed its SSR smoke test: ${toolbarHtml}`);
}

if (
  !meterHtml.includes('role="meter"') ||
  !meterHtml.includes("Storage") ||
  !meterHtml.includes("65%")
) {
  throw new Error(`Built Meter failed its SSR smoke test: ${meterHtml}`);
}

if (
  !paginationHtml.includes('data-slot="pagination"') ||
  !paginationHtml.includes('aria-label="Pagination"') ||
  !paginationHtml.includes('aria-label="Page number"') ||
  !paginationHtml.includes("11-20") ||
  !paginationHtml.includes("100")
) {
  throw new Error(
    `Built Pagination failed its SSR smoke test: ${paginationHtml}`,
  );
}

if (
  !popoverHtml.includes('data-kumo-component="Popover"') ||
  !popoverHtml.includes('data-kumo-part="trigger"') ||
  !popoverHtml.includes('aria-expanded="false"') ||
  !popoverHtml.includes("Open details") ||
  popoverHtml.includes("Deployment details")
) {
  throw new Error(`Built Popover failed its SSR smoke test: ${popoverHtml}`);
}

if (
  !radioHtml.includes('role="radiogroup"') ||
  !radioHtml.includes('aria-label="Plan"') ||
  !radioHtml.includes('role="radio"') ||
  !radioHtml.includes('aria-checked="true"') ||
  !radioHtml.includes("Pro")
) {
  throw new Error(`Built Radio failed its SSR smoke test: ${radioHtml}`);
}

if (
  !selectHtml.includes('role="combobox"') ||
  !selectHtml.includes('aria-label="Database"') ||
  !selectHtml.includes('data-kumo-component="Select"') ||
  !selectHtml.includes("PostgreSQL")
) {
  throw new Error(`Built Select failed its SSR smoke test: ${selectHtml}`);
}

if (
  !sensitiveInputHtml.includes('data-kumo-component="SensitiveInput"') ||
  !sensitiveInputHtml.includes('data-kumo-part="masked-container"') ||
  !sensitiveInputHtml.includes("API key, masked.") ||
  !sensitiveInputHtml.includes('type="password"')
) {
  throw new Error(
    `Built SensitiveInput failed its SSR smoke test: ${sensitiveInputHtml}`,
  );
}

if (
  !surfaceHtml.includes("<section") ||
  !surfaceHtml.includes('data-deprecated="surface"') ||
  !surfaceHtml.includes("Surface")
) {
  throw new Error(`Built Surface failed its SSR smoke test: ${surfaceHtml}`);
}

if (
  !switchHtml.includes('role="switch"') ||
  !switchHtml.includes('aria-checked="true"') ||
  !switchHtml.includes("Email alerts")
) {
  throw new Error(`Built Switch failed its SSR smoke test: ${switchHtml}`);
}

if (
  !tableHtml.includes("<table") ||
  !tableHtml.includes("table-fixed") ||
  !tableHtml.includes('data-compact=""') ||
  !tableHtml.includes('aria-label="Select all deployments"') ||
  !tableHtml.includes("bg-kumo-tint") ||
  !tableHtml.includes("api")
) {
  throw new Error(`Built Table failed its SSR smoke test: ${tableHtml}`);
}

if (
  !tableOfContentsHtml.includes("<nav") ||
  !tableOfContentsHtml.includes('aria-label="Table of contents"') ||
  !tableOfContentsHtml.includes('href="#intro"') ||
  !tableOfContentsHtml.includes('aria-current="true"') ||
  !tableOfContentsHtml.includes("<button") ||
  !tableOfContentsHtml.includes("Select methods") ||
  typeof built.useTableOfContentsActiveId !== "function"
) {
  throw new Error(
    `Built TableOfContents failed its SSR smoke test: ${tableOfContentsHtml}`,
  );
}

if (
  !tabsHtml.includes('role="tablist"') ||
  !tabsHtml.includes('role="tab"') ||
  !tabsHtml.includes('aria-selected="true"') ||
  !tabsHtml.includes("Analytics") ||
  !tabsHtml.includes("border-kumo-hairline") ||
  !tabsHtml.includes('aria-label="Scroll tabs right"')
) {
  throw new Error(`Built Tabs failed its SSR smoke test: ${tabsHtml}`);
}

if (
  !toastyHtml.includes("Toast-ready application") ||
  toastyHtml.includes('data-kumo-part="viewport"') ||
  typeof built.createKumoToastManager !== "function"
) {
  throw new Error(`Built Toasty failed its SSR smoke test: ${toastyHtml}`);
}

if (
  !finalFamilyHtml.includes("Requests") ||
  !finalFamilyHtml.includes('aria-label="Loading chart"') ||
  !finalFamilyHtml.includes('data-node-id="start"') ||
  !finalFamilyHtml.includes("Finish") ||
  !finalFamilyHtml.includes('data-sidebar="sidebar"') ||
  !finalFamilyHtml.includes('data-sidebar="menu-button"') ||
  !finalFamilyHtml.includes("Home")
) {
  throw new Error(
    `Built Chart/Flow/Sidebar family failed its SSR smoke test: ${finalFamilyHtml}`,
  );
}
