import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import {
  Autocomplete,
  KUMO_AUTOCOMPLETE_DEFAULT_VARIANTS,
  KUMO_AUTOCOMPLETE_VARIANTS,
} from "./autocomplete";

const countries = ["Argentina", "Brazil", "Canada"];

function Fixture(props: {
  error?: string;
  label?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <Autocomplete
      items={countries}
      label={props.label}
      error={props.error}
      onValueChange={(value) => props.onValueChange?.(value)}
    >
      <Autocomplete.InputGroup placeholder="Search countries…" />
      <Autocomplete.Content>
        <Autocomplete.List>
          {(item: string) => (
            <Autocomplete.Item value={item}>{item}</Autocomplete.Item>
          )}
        </Autocomplete.List>
      </Autocomplete.Content>
    </Autocomplete>
  );
}

describe("Autocomplete", () => {
  it("renders the accessible free-form input", () => {
    render(() => <Fixture />);
    const input = screen.getByRole("combobox");
    expect(input.getAttribute("aria-haspopup")).toBe("listbox");
    expect(input.getAttribute("aria-autocomplete")).toBe("list");
    expect(screen.getByPlaceholderText("Search countries…")).toBeTruthy();
  });

  it("preserves Kumo variants and display names", () => {
    expect(KUMO_AUTOCOMPLETE_VARIANTS.size.xs).toBeDefined();
    expect(KUMO_AUTOCOMPLETE_VARIANTS.size.lg).toBeDefined();
    expect(KUMO_AUTOCOMPLETE_DEFAULT_VARIANTS.size).toBe("base");
    expect(Autocomplete.displayName).toBe("Autocomplete.Root");
    expect(Autocomplete.InputGroup.displayName).toBe("Autocomplete.InputGroup");
    expect(Autocomplete.Content.displayName).toBe("Autocomplete.Content");
    expect(Autocomplete.Item.displayName).toBe("Autocomplete.Item");
  });

  it("integrates labels, errors, and error styling", () => {
    render(() => <Fixture label="Country" error="Country is required" />);
    expect(screen.getByText("Country")).toBeTruthy();
    expect(screen.getByText("Country is required")).toBeTruthy();
    expect(screen.getByRole("combobox").className).toContain(
      "ring-kumo-danger",
    );
  });

  it("opens while typing and filters suggestions", async () => {
    render(() => <Fixture />);
    const input = screen.getByRole("combobox");
    fireEvent.input(input, { target: { value: "bra" } });
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "Brazil" })).toBeTruthy(),
    );
    expect(screen.queryByRole("option", { name: "Canada" })).toBeNull();
  });

  it("keeps selected suggestions as editable free-form text", async () => {
    const onValueChange = vi.fn();
    render(() => <Fixture onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox");
    fireEvent.input(input, { target: { value: "can" } });
    fireEvent.click(await screen.findByRole("option", { name: "Canada" }));
    expect((input as HTMLInputElement).value).toBe("Canada");
    expect(onValueChange).toHaveBeenLastCalledWith("Canada");
  });

  it("supports controlled value updates", () => {
    const [value, setValue] = createSignal("");
    render(() => (
      <>
        <Autocomplete
          items={countries}
          value={value()}
          onValueChange={setValue}
        >
          <Autocomplete.InputGroup aria-label="Controlled country" />
        </Autocomplete>
        <button onClick={() => setValue("Argentina")}>Set value</button>
      </>
    ));
    fireEvent.click(screen.getByRole("button", { name: "Set value" }));
    expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe(
      "Argentina",
    );
  });
});
