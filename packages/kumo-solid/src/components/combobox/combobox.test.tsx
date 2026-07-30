import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import {
  Combobox,
  KUMO_COMBOBOX_DEFAULT_VARIANTS,
  KUMO_COMBOBOX_VARIANTS,
} from "./combobox";

const fruits = ["Apple", "Banana", "Cherry", "Date"];

function Fixture(props: {
  error?: string;
  label?: string;
  onValueChange?: (value: string | null) => void;
}) {
  return (
    <Combobox
      items={fruits}
      label={props.label}
      error={props.error}
      onValueChange={(value) => props.onValueChange?.(value)}
    >
      <Combobox.TriggerInput placeholder="Pick a fruit…" />
      <Combobox.Content>
        <Combobox.Empty />
        <Combobox.List>
          {(item: string) => <Combobox.Item value={item}>{item}</Combobox.Item>}
        </Combobox.List>
      </Combobox.Content>
    </Combobox>
  );
}

describe("Combobox", () => {
  it("renders the input and options trigger with accessible semantics", () => {
    render(() => <Fixture />);
    const input = screen.getByRole("combobox");
    expect(input.getAttribute("aria-haspopup")).toBe("listbox");
    expect(screen.getByRole("button", { name: "Show options" })).toBeTruthy();
  });

  it("preserves variants and compound display names", () => {
    expect(KUMO_COMBOBOX_VARIANTS.size.xs).toBeDefined();
    expect(KUMO_COMBOBOX_VARIANTS.inputSide.top).toBeDefined();
    expect(KUMO_COMBOBOX_DEFAULT_VARIANTS.size).toBe("base");
    expect(KUMO_COMBOBOX_DEFAULT_VARIANTS.inputSide).toBe("right");
    expect(Combobox.displayName).toBe("Combobox.Root");
    expect(Combobox.TriggerInput.displayName).toBe("Combobox.TriggerInput");
    expect(Combobox.TriggerValue.displayName).toBe("Combobox.TriggerValue");
  });

  it("integrates field labels and validation styling", () => {
    render(() => <Fixture label="Fruit" error="Selection required" />);
    expect(screen.getByText("Fruit")).toBeTruthy();
    expect(screen.getByText("Selection required")).toBeTruthy();
    expect(screen.getByRole("combobox").className).toContain(
      "ring-kumo-danger",
    );
  });

  it("opens from the input and filters options", async () => {
    render(() => <Fixture />);
    const input = screen.getByRole("combobox");
    fireEvent.click(input);
    expect(await screen.findByRole("listbox")).toBeTruthy();
    fireEvent.input(input, { target: { value: "ban" } });
    expect(await screen.findByRole("option", { name: "Banana" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "Apple" })).toBeNull();
  });

  it("anchors the popup to the full input and shows all items on reopen", async () => {
    render(() => (
      <Combobox items={fruits} defaultValue="Apple">
        <Combobox.TriggerInput placeholder="Pick a fruit…" />
        <Combobox.Content>
          <Combobox.List>
            {(item: string) => (
              <Combobox.Item value={item}>{item}</Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Content>
      </Combobox>
    ));
    const input = screen.getByRole("combobox") as HTMLInputElement;
    const anchor = input.parentElement;
    expect(anchor).not.toBeNull();
    if (!anchor) return;
    anchor.getBoundingClientRect = () => new DOMRect(100, 200, 320, 36);

    fireEvent.click(input);

    const listbox = await screen.findByRole("listbox");
    const popup = listbox.closest<HTMLElement>('[data-kumo-part="content"]');
    expect(popup?.style.getPropertyValue("--anchor-width")).toBe("320px");
    expect(popup?.style.getPropertyValue("--anchor-height")).toBe("36px");
    expect(popup?.style.getPropertyValue("--available-height")).toBe(
      `${window.innerHeight - 245}px`,
    );
    expect(screen.getAllByRole("option")).toHaveLength(fruits.length);
    await waitFor(() =>
      expect(
        screen
          .getByRole("option", { name: "Apple" })
          .hasAttribute("data-highlighted"),
      ).toBe(true),
    );
  });

  it("selects an option, fills the input, and closes", async () => {
    const onValueChange = vi.fn();
    render(() => <Fixture onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.click(input);
    fireEvent.click(await screen.findByRole("option", { name: "Cherry" }));
    expect(input.value).toBe("Cherry");
    expect(onValueChange).toHaveBeenCalledWith("Cherry");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());

    fireEvent.click(input);
    expect(await screen.findAllByRole("option")).toHaveLength(fruits.length);
    await waitFor(() =>
      expect(
        screen
          .getByRole("option", { name: "Cherry" })
          .hasAttribute("data-highlighted"),
      ).toBe(true),
    );
  });

  it("supports keyboard navigation and selection", async () => {
    render(() => <Fixture />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() =>
      expect(document.querySelector("[data-highlighted]")).toBeTruthy(),
    );
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input.value).toBe("Apple");
  });

  it("highlights an option when it is hovered", async () => {
    render(() => <Fixture />);
    fireEvent.click(screen.getByRole("combobox"));

    const apple = await screen.findByRole("option", { name: "Apple" });
    const banana = screen.getByRole("option", { name: "Banana" });
    fireEvent.pointerMove(banana, { pointerType: "mouse" });

    await waitFor(() =>
      expect(banana.hasAttribute("data-highlighted")).toBe(true),
    );
    expect(apple.hasAttribute("data-highlighted")).toBe(false);
  });

  it("renders TriggerValue and opens it as a combobox button", async () => {
    render(() => (
      <Combobox items={fruits} defaultValue="Apple">
        <Combobox.TriggerValue placeholder="Select fruit" />
        <Combobox.Content>
          <Combobox.List>
            {(item: string) => (
              <Combobox.Item value={item}>{item}</Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Content>
      </Combobox>
    ));
    const trigger = screen.getByRole("combobox");
    expect(trigger.textContent).toContain("Apple");
    fireEvent.click(trigger);
    expect(await screen.findByRole("listbox")).toBeTruthy();
  });

  it("supports multiple selection chips and removal", async () => {
    const [value, setValue] = createSignal<string[]>(["Apple"]);
    render(() => (
      <Combobox
        items={fruits}
        multiple
        value={value()}
        onValueChange={setValue}
      >
        <Combobox.TriggerMultipleWithInput
          placeholder="Choose fruits"
          renderItem={(item: string) => <Combobox.Chip>{item}</Combobox.Chip>}
        />
        <Combobox.Content>
          <Combobox.List>
            {(item: string) => (
              <Combobox.Item value={item}>{item}</Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Content>
      </Combobox>
    ));
    expect(screen.getByText("Apple")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    await waitFor(() => expect(screen.queryByText("Apple")).toBeNull());
  });

  it("keeps hidden form values in sync for uncontrolled selection", async () => {
    const { container } = render(() => (
      <Combobox items={fruits} defaultValue="Apple" name="fruit">
        <Combobox.TriggerInput />
        <Combobox.Content>
          <Combobox.List>
            {(item: string) => (
              <Combobox.Item value={item}>{item}</Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Content>
      </Combobox>
    ));
    const hiddenValue = () =>
      container.querySelector<HTMLInputElement>(
        'input[type="hidden"][name="fruit"]',
      );

    expect(hiddenValue()?.value).toBe("Apple");
    const input = screen.getByRole("combobox");
    fireEvent.click(input);
    fireEvent.input(input, { target: { value: "ban" } });
    fireEvent.click(await screen.findByRole("option", { name: "Banana" }));
    expect(hiddenValue()?.value).toBe("Banana");
  });
});
