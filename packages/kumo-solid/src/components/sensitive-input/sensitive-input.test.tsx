import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import {
  SensitiveInput,
  KUMO_SENSITIVE_INPUT_DEFAULT_VARIANTS,
  KUMO_SENSITIVE_INPUT_VARIANTS,
} from "./sensitive-input";
import { KUMO_INPUT_VARIANTS } from "../input";

describe("SensitiveInput", () => {
  it("starts masked when it has a value and exposes reveal instructions", () => {
    render(() => (
      <SensitiveInput label="API Key" defaultValue="secret-value" />
    ));

    const container = screen.getByRole("button", {
      name: "API Key, masked.",
    });
    const input = document.querySelector("input") as HTMLInputElement;

    expect(container.getAttribute("data-kumo-part")).toBe("masked-container");
    expect(input.type).toBe("password");
    expect(input.value).toBe("secret-value");
    expect(input.readOnly).toBe(true);
    expect(input.tabIndex).toBe(-1);
    expect(screen.getByText("Click or press Enter to reveal.")).not.toBeNull();
  });

  it("reveals through pointer and keyboard interactions and masks on Escape", () => {
    render(() => (
      <SensitiveInput aria-label="Secret" defaultValue="secret-value" />
    ));

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sensitive value, masked.",
      }),
    );
    const input = screen.getByRole("textbox", { name: "Secret" });
    expect(input.getAttribute("type")).toBe("text");

    fireEvent.keyDown(input, { key: "Escape" });
    expect(
      screen.getByRole("button", { name: "Sensitive value, masked." }),
    ).not.toBeNull();

    fireEvent.keyDown(
      screen.getByRole("button", {
        name: "Sensitive value, masked.",
      }),
      { key: "Enter" },
    );
    expect(screen.getByRole("textbox", { name: "Secret" })).not.toBeNull();
  });

  it("reveals typed empty values and preserves React-compatible callbacks", () => {
    const onInput = vi.fn();
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    render(() => (
      <SensitiveInput
        aria-label="Token"
        onInput={onInput}
        onChange={onChange}
        onValueChange={onValueChange}
      />
    ));
    const input = screen.getByLabelText("Token") as HTMLInputElement;

    fireEvent.input(input, { target: { value: "abc" } });
    expect(input.type).toBe("text");
    expect(input.value).toBe("abc");
    expect(onInput).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith("abc");
  });

  it("keeps controlled values reactive", () => {
    const [value, setValue] = createSignal("first");
    render(() => (
      <>
        <SensitiveInput aria-label="Controlled" value={value()} />
        <button type="button" onClick={() => setValue("second")}>
          Change
        </button>
      </>
    ));

    const input = document.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("first");
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(input.value).toBe("second");
  });

  it("copies the current value and announces success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const onCopy = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(() => (
      <SensitiveInput
        aria-label="Secret"
        defaultValue="copy-me"
        onCopy={onCopy}
      />
    ));

    fireEvent.click(screen.getByRole("button", { name: "Copy to clipboard" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("copy-me"));
    expect(onCopy).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Copied" })).not.toBeNull();
    expect(
      document.querySelector("[aria-live='polite']")?.textContent,
    ).toContain("Copied to clipboard");
  });

  it("integrates labels, descriptions, errors, disabled state, and refs", () => {
    let ref: HTMLInputElement | undefined;
    render(() => (
      <SensitiveInput
        ref={(element) => (ref = element)}
        label="Credential"
        description="Keep it safe"
        error="Invalid credential"
        disabled
      />
    ));

    const input = screen.getByLabelText("Credential") as HTMLInputElement;
    expect(ref).toBe(input);
    expect(input.disabled).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Invalid credential")).not.toBeNull();
    expect(screen.queryByText("Keep it safe")).toBeNull();
    expect(input.parentElement?.className).toContain("ring-kumo-danger");
  });
});

describe("sensitive input metadata", () => {
  it("preserves input variants and defaults", () => {
    expect(KUMO_SENSITIVE_INPUT_VARIANTS).toBe(KUMO_INPUT_VARIANTS);
    expect(KUMO_SENSITIVE_INPUT_DEFAULT_VARIANTS).toEqual({
      size: "base",
      variant: "default",
    });
  });
});
