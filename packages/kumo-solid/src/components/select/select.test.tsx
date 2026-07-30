import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { KumoPortalProvider } from "../../utils/portal-provider";
import {
  Select,
  KUMO_SELECT_DEFAULT_VARIANTS,
  KUMO_SELECT_STYLING,
  selectVariants,
} from "./select";

async function openSelect(name: string) {
  const trigger = screen.getByRole("combobox", { name });
  fireEvent.mouseDown(trigger);
  return screen.findByRole("listbox");
}

describe("Select", () => {
  it("preserves Kumo variant metadata and size styling", () => {
    expect(KUMO_SELECT_DEFAULT_VARIANTS.size).toBe("base");
    expect(KUMO_SELECT_STYLING.icons.caret.size).toBe(20);
    expect(selectVariants({ size: "xs" })).toContain("h-5");

    render(() => (
      <Select aria-label="Pick one" size="xs" className="custom-select">
        <Select.Option value="a">Option A</Select.Option>
      </Select>
    ));

    const trigger = screen.getByRole("combobox", { name: "Pick one" });
    expect(trigger.className).toContain("h-5");
    expect(trigger.className).toContain("px-1.5");
    expect(trigger.className).toContain("custom-select");
  });

  it("associates visible labels and field feedback with the trigger", () => {
    render(() => (
      <Select
        label="Database"
        description="Choose the primary database"
        required={false}
      >
        <Select.Option value="postgres">PostgreSQL</Select.Option>
      </Select>
    ));

    const trigger = screen.getByRole("combobox", { name: /Database/ });
    expect(screen.getByText("Database")).toBeTruthy();
    expect(screen.getByText("(optional)")).toBeTruthy();
    expect(screen.getByText("Choose the primary database")).toBeTruthy();
    expect(trigger.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("supports the deprecated hidden-label shape without losing its name", () => {
    render(() => (
      <Select label="Database" hideLabel>
        <Select.Option value="postgres">PostgreSQL</Select.Option>
      </Select>
    ));

    const hiddenLabel = document.querySelector(".sr-only");
    expect(hiddenLabel?.textContent).toBe("Database");
    expect(screen.getByRole("combobox", { name: "Database" })).toBeTruthy();
  });

  it("renders placeholders and labels from both item formats", () => {
    const { unmount } = render(() => (
      <Select
        aria-label="Fruit"
        placeholder="Choose a fruit"
        value={null}
        items={{
          apple: "Apple",
          banana: { label: "Banana", disabled: true },
        }}
      />
    ));

    expect(screen.getByText("Choose a fruit")).toBeTruthy();
    unmount();

    render(() => (
      <Select
        aria-label="Database"
        placeholder="Choose a database"
        value="postgres"
        items={[
          { value: "postgres", label: "PostgreSQL" },
          { value: "mysql", label: "MySQL" },
        ]}
      />
    ));

    expect(screen.getByText("PostgreSQL")).toBeTruthy();
    expect(screen.queryByText("Choose a database")).toBeNull();
  });

  it("uses a matching null item label instead of the placeholder", () => {
    render(() => (
      <Select
        aria-label="Choice"
        placeholder="Choose one"
        value={null}
        items={[
          { value: null, label: "Placeholder item" },
          { value: "a", label: "Option A" },
        ]}
      />
    ));

    expect(screen.getByText("Placeholder item")).toBeTruthy();
    expect(screen.queryByText("Choose one")).toBeNull();
  });

  it("opens an accessible popup with disabled items, groups, and separators", async () => {
    render(() => (
      <Select aria-label="Food">
        <Select.Group>
          <Select.GroupLabel>Fruit</Select.GroupLabel>
          <Select.Option value="apple">Apple</Select.Option>
          <Select.Option value="banana" disabled>
            Banana
          </Select.Option>
        </Select.Group>
        <Select.Separator />
        <Select.Group>
          <Select.GroupLabel>Vegetables</Select.GroupLabel>
          <Select.Option value="carrot">Carrot</Select.Option>
        </Select.Group>
      </Select>
    ));

    const popup = await openSelect("Food");
    expect(popup.className).toContain("overflow-y-auto");
    expect(screen.getAllByRole("group")).toHaveLength(2);
    expect(screen.getByRole("separator")).toBeTruthy();
    expect(
      screen
        .getByRole("option", { name: "Banana" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
  });

  it("updates a controlled value and displays the selected manual label", async () => {
    const [value, setValue] = createSignal<string | null>(null);
    const onValueChange = vi.fn((next: string) => setValue(next));

    render(() => (
      <Select
        aria-label="Database"
        placeholder="Choose one"
        value={value()}
        onValueChange={onValueChange}
      >
        <Select.Option value="postgres">PostgreSQL</Select.Option>
        <Select.Option value="mysql">MySQL</Select.Option>
      </Select>
    ));

    await openSelect("Database");
    fireEvent.click(screen.getByRole("option", { name: "PostgreSQL" }));

    expect(onValueChange).toHaveBeenCalledWith("postgres", expect.anything());
    expect(await screen.findByText("PostgreSQL")).toBeTruthy();
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("matches controlled object values with isItemEqualToValue", async () => {
    interface Region {
      id: string;
      label: string;
    }
    const options: Region[] = [
      { id: "iad", label: "Virginia" },
      { id: "lhr", label: "London" },
    ];
    const [value, setValue] = createSignal<Region>({
      id: "lhr",
      label: "Fresh London object",
    });

    render(() => (
      <Select
        aria-label="Region"
        value={value()}
        onValueChange={setValue}
        items={options.map((option) => ({
          label: option.label,
          value: option,
        }))}
        isItemEqualToValue={(item, selected) => item.id === selected.id}
        renderValue={(selected) => selected.label}
      />
    ));

    expect(screen.getByText("Fresh London object")).toBeTruthy();
    await openSelect("Region");
    expect(
      screen
        .getByRole("option", { name: "London" })
        .getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("toggles multiple values and keeps the popup open", async () => {
    const [value, setValue] = createSignal<string[]>(["Name"]);
    const onValueChange = vi.fn((next: string[]) => setValue(next));

    render(() => (
      <Select<string, true>
        aria-label="Columns"
        multiple
        value={value()}
        onValueChange={onValueChange}
        renderValue={(selected) => selected.join(", ")}
      >
        <Select.Option value="Name">Name</Select.Option>
        <Select.Option value="Location">Location</Select.Option>
        <Select.Option value="Size">Size</Select.Option>
      </Select>
    ));

    const popup = await openSelect("Columns");
    expect(popup.getAttribute("aria-multiselectable")).toBe("true");
    expect(
      screen
        .getByRole("option", { name: "Name" })
        .getAttribute("aria-selected"),
    ).toBe("true");

    const locationOption = screen.getByRole("option", {
      name: "Location",
    });
    fireEvent.mouseMove(locationOption);
    fireEvent.click(locationOption);
    expect(onValueChange).toHaveBeenLastCalledWith(
      ["Name", "Location"],
      expect.anything(),
    );
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(screen.getByText("Name, Location")).toBeTruthy();

    const nameOption = screen.getByRole("option", { name: "Name" });
    fireEvent.mouseMove(nameOption);
    fireEvent.click(nameOption);
    expect(onValueChange).toHaveBeenLastCalledWith(
      ["Location"],
      expect.anything(),
    );
    expect(screen.getByRole("listbox")).toBeTruthy();
  });

  it("does not call renderValue for an empty value", () => {
    const renderValue = vi.fn((value: string) => `Selected: ${value}`);

    render(() => (
      <Select
        aria-label="Choice"
        value=""
        placeholder="Choose..."
        renderValue={renderValue}
      />
    ));

    expect(screen.getByText("Choose...")).toBeTruthy();
    expect(renderValue).not.toHaveBeenCalled();
  });

  it("uses a provider portal target and disables the trigger while loading", async () => {
    const portalContainer = document.createElement("div");
    document.body.append(portalContainer);
    const { unmount } = render(() => (
      <KumoPortalProvider container={portalContainer}>
        <Select aria-label="Portaled">
          <Select.Option value="a">Option A</Select.Option>
        </Select>
      </KumoPortalProvider>
    ));

    await openSelect("Portaled");
    await waitFor(() =>
      expect(portalContainer.querySelector('[role="listbox"]')).toBeTruthy(),
    );
    unmount();
    portalContainer.remove();

    render(() => <Select aria-label="Loading" loading />);
    const trigger = screen.getByRole("combobox", { name: "Loading" });
    expect(trigger.getAttribute("aria-disabled")).toBe("true");
    expect(document.querySelector(".skeleton-line")).toBeTruthy();
  });
});
