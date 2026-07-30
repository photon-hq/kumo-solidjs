import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createComponent, type Component } from "solid-js";
import { renderToString } from "solid-js/web";

type BuiltComponent = Component<Record<string, unknown>>;

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const built = (await import("@photon-ai/kumo-solid")) as unknown as {
  Autocomplete: BuiltComponent & {
    InputGroup: BuiltComponent;
  };
  Banner: BuiltComponent & {
    Action: BuiltComponent;
  };
  Breadcrumbs: BuiltComponent & {
    Current: BuiltComponent;
    Link: BuiltComponent;
    Separator: BuiltComponent;
  };
  Button: BuiltComponent;
  ClipboardText: BuiltComponent;
  CloudflareLogo: BuiltComponent;
  Code: BuiltComponent;
  Combobox: BuiltComponent & {
    TriggerValue: BuiltComponent;
  };
  CommandPalette: {
    Input: BuiltComponent;
    Panel: BuiltComponent;
  };
  ChartLegend: {
    SmallItem: BuiltComponent;
  };
  DatePicker: BuiltComponent;
  DateRangePicker: BuiltComponent;
  Dialog: BuiltComponent & {
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
  Flow: BuiltComponent & {
    Node: BuiltComponent;
  };
  Grid: BuiltComponent;
  GridItem: BuiltComponent;
  Input: BuiltComponent;
  InputArea: BuiltComponent;
  InputGroup: BuiltComponent & {
    Input: BuiltComponent;
    Suffix: BuiltComponent;
  };
  LayerCard: BuiltComponent & {
    Primary: BuiltComponent;
  };
  Link: BuiltComponent;
  MenuBar: BuiltComponent;
  Meter: BuiltComponent;
  Pagination: BuiltComponent;
  Popover: BuiltComponent & {
    Content: BuiltComponent;
    Title: BuiltComponent;
    Trigger: BuiltComponent;
  };
  Select: BuiltComponent;
  SensitiveInput: BuiltComponent;
  Sidebar: BuiltComponent & {
    Content: BuiltComponent;
    MenuButton: BuiltComponent;
    Provider: BuiltComponent;
  };
  Surface: BuiltComponent;
  Table: BuiltComponent & {
    Body: BuiltComponent;
    Cell: BuiltComponent;
    Head: BuiltComponent;
    Header: BuiltComponent;
    Row: BuiltComponent;
  };
  TableOfContents: BuiltComponent & {
    Item: BuiltComponent;
    List: BuiltComponent;
    Title: BuiltComponent;
  };
  Tabs: BuiltComponent;
  Toasty: BuiltComponent;
  TimeseriesChart: BuiltComponent;
  Toolbar: BuiltComponent & {
    Button: BuiltComponent;
    Input: BuiltComponent;
    InputGroup: BuiltComponent;
  };
};

function BuiltHydrationFixture() {
  return [
    createComponent(built.Banner, {
      title: "Hydrated notice",
      description: "Hydrated banner description",
      get action() {
        return createComponent(built.Banner.Action, {
          get children() {
            return "Hydrated retry";
          },
        });
      },
    }),
    createComponent(built.Button, {
      get children() {
        return "Hydrated action";
      },
    }),
    createComponent(built.Toasty, {
      get children() {
        return "Hydrated toast provider";
      },
    }),
    createComponent(built.LayerCard, {
      get children() {
        return createComponent(built.LayerCard.Primary, {
          get children() {
            return "Hydrated layer";
          },
        });
      },
    }),
    createComponent(built.Grid, {
      variant: "2up",
      get children() {
        return createComponent(built.GridItem, {
          get children() {
            return createComponent(built.Code, {
              code: "pnpm test",
            });
          },
        });
      },
    }),
    createComponent(built.Input, {
      label: "Hydrated email",
      value: "user@example.com",
    }),
    createComponent(built.InputArea, {
      "aria-label": "Hydrated notes",
      defaultValue: "Initial notes",
    }),
    createComponent(built.InputGroup, {
      label: "Hydrated domain",
      get children() {
        return [
          createComponent(built.InputGroup.Input, {
            defaultValue: "kumo",
          }),
          createComponent(built.InputGroup.Suffix, {
            get children() {
              return ".workers.dev";
            },
          }),
        ];
      },
    }),
    createComponent(built.SensitiveInput, {
      label: "Hydrated API key",
      defaultValue: "secret-value",
    }),
    createComponent(built.Select, {
      "aria-label": "Hydrated database",
      value: "postgres",
      items: [
        { label: "PostgreSQL", value: "postgres" },
        { label: "MySQL", value: "mysql" },
      ],
    }),
    createComponent(built.Autocomplete, {
      items: ["Workers", "Pages"],
      get children() {
        return createComponent(built.Autocomplete.InputGroup, {
          "aria-label": "Hydrated product search",
          placeholder: "Search products",
        });
      },
    }),
    createComponent(built.Combobox, {
      items: ["Virginia", "London"],
      defaultValue: "London",
      get children() {
        return createComponent(built.Combobox.TriggerValue, {
          "aria-label": "Hydrated region",
          placeholder: "Choose a region",
        });
      },
    }),
    createComponent(built.CommandPalette.Panel, {
      items: ["Create project"],
      get children() {
        return createComponent(built.CommandPalette.Input, {
          "aria-label": "Hydrated command search",
          autoFocus: false,
          placeholder: "Search commands",
        });
      },
    }),
    createComponent(built.Pagination, {
      page: 2,
      perPage: 10,
      totalCount: 100,
      setPage: () => undefined,
    }),
    createComponent(built.Tabs, {
      selectedValue: "analytics",
      tabs: [
        { label: "Hydrated overview", value: "overview" },
        { label: "Hydrated analytics", value: "analytics" },
      ],
    }),
    createComponent(built.Popover, {
      get children() {
        return [
          createComponent(built.Popover.Trigger, {
            get children() {
              return "Hydrated popover trigger";
            },
          }),
          createComponent(built.Popover.Content, {
            get children() {
              return createComponent(built.Popover.Title, {
                get children() {
                  return "Hydrated popover content";
                },
              });
            },
          }),
        ];
      },
    }),
    createComponent(built.Dialog.Root, {
      get children() {
        return [
          createComponent(built.Dialog.Trigger, {
            get children() {
              return "Hydrated dialog trigger";
            },
          }),
          createComponent(built.Dialog, {
            get children() {
              return createComponent(built.Dialog.Title, {
                get children() {
                  return "Hydrated dialog content";
                },
              });
            },
          }),
        ];
      },
    }),
    createComponent(built.DropdownMenu, {
      get children() {
        return [
          createComponent(built.DropdownMenu.Trigger, {
            get children() {
              return "Hydrated menu trigger";
            },
          }),
          createComponent(built.DropdownMenu.Content, {
            get children() {
              return createComponent(built.DropdownMenu.Item, {
                get children() {
                  return "Hydrated menu item";
                },
              });
            },
          }),
        ];
      },
    }),
    createComponent(built.Link, {
      href: "/hydrated",
      get children() {
        return "Hydrated link";
      },
    }),
    createComponent(built.Meter, {
      label: "Hydrated storage",
      value: 65,
    }),
    createComponent(built.Surface, {
      as: "section",
      get children() {
        return "Hydrated surface";
      },
    }),
    createComponent(built.Empty, {
      title: "Hydrated empty state",
    }),
    createComponent(built.Breadcrumbs, {
      get children() {
        return [
          createComponent(built.Breadcrumbs.Link, {
            href: "/hydrated-home",
            get children() {
              return "Hydrated home";
            },
          }),
          createComponent(built.Breadcrumbs.Separator, {}),
          createComponent(built.Breadcrumbs.Current, {
            get children() {
              return "Hydrated settings";
            },
          }),
        ];
      },
    }),
    createComponent(built.CloudflareLogo, {
      variant: "glyph",
      "aria-label": "Hydrated Cloudflare logo",
    }),
    createComponent(built.ClipboardText, {
      text: "Hydrated copy value",
    }),
    createComponent(built.DatePicker, {
      mode: "single",
      month: new Date(2025, 4, 1),
      selected: new Date(2025, 4, 12),
    }),
    createComponent(built.DateRangePicker, {
      timezone: "Hydrated UTC",
      onStartDateChange: () => undefined,
      onEndDateChange: () => undefined,
    }),
    createComponent(built.Table, {
      layout: "fixed",
      get children() {
        return [
          createComponent(built.Table.Header, {
            variant: "compact",
            get children() {
              return createComponent(built.Table.Row, {
                get children() {
                  return createComponent(built.Table.Head, {
                    get children() {
                      return "Hydrated worker";
                    },
                  });
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
                      return "Hydrated api";
                    },
                  });
                },
              });
            },
          }),
        ];
      },
    }),
    createComponent(built.TableOfContents, {
      get children() {
        return [
          createComponent(built.TableOfContents.Title, {
            get children() {
              return "Hydrated sections";
            },
          }),
          createComponent(built.TableOfContents.List, {
            get children() {
              return createComponent(built.TableOfContents.Item, {
                href: "#hydrated-intro",
                active: true,
                get children() {
                  return "Hydrated introduction";
                },
              });
            },
          }),
        ];
      },
    }),
    createComponent(built.MenuBar, {
      "aria-label": "Hydrated view options",
      isActive: 0,
      options: [
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
      ],
    }),
    createComponent(built.Toolbar, {
      size: "sm",
      get children() {
        return [
          createComponent(built.Toolbar.InputGroup, {
            "aria-label": "Hydrated toolbar search",
            get children() {
              return [
                createComponent(built.InputGroup.Input, {
                  defaultValue: "records",
                }),
                createComponent(built.InputGroup.Suffix, {
                  get children() {
                    return ".dns";
                  },
                }),
              ];
            },
          }),
          createComponent(built.Toolbar.Button, {
            get children() {
              return "Hydrated toolbar action";
            },
          }),
        ];
      },
    }),
    createComponent(built.ChartLegend.SmallItem, {
      name: "Hydrated requests",
      color: "#4290F0",
      value: "42",
    }),
    createComponent(built.TimeseriesChart, {
      echarts: {},
      loading: true,
      height: 180,
      data: [
        {
          name: "Hydrated requests",
          color: "#4290F0",
          data: [[1, 42]],
        },
      ],
    }),
    createComponent(built.Flow, {
      get children() {
        return [
          createComponent(built.Flow.Node, {
            id: "hydrated-start",
            get children() {
              return "Hydrated start";
            },
          }),
          createComponent(built.Flow.Node, {
            id: "hydrated-finish",
            get children() {
              return "Hydrated finish";
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
                    return "Hydrated sidebar home";
                  },
                });
              },
            });
          },
        });
      },
    }),
  ];
}

const hydrationHtml = renderToString(() =>
  createComponent(BuiltHydrationFixture, {}),
);

execFileSync(
  "pnpm",
  ["exec", "vitest", "run", "--config", "vitest.browser.config.ts"],
  {
    cwd: packageRoot,
    env: {
      ...process.env,
      KUMO_SOLID_HYDRATION_HTML: hydrationHtml,
    },
    stdio: "inherit",
  },
);
