import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { InputArea } from "./input-area";
import {
  Input,
  inputVariants,
  KUMO_INPUT_DEFAULT_VARIANTS,
  KUMO_INPUT_VARIANTS,
} from "./input";
import {
  InputGroup as LegacyInputGroup,
  KUMO_INPUT_GROUP_DEFAULT_VARIANTS,
  KUMO_INPUT_GROUP_VARIANTS,
  type KumoInputGroupFocusMode,
  type KumoInputGroupVariantsProps,
} from "./index";

describe("Input", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders native attributes, classes, a ref, and password hints", () => {
    let ref: HTMLInputElement | undefined;
    render(() => (
      <Input
        ref={(element) => (ref = element)}
        aria-label="Email"
        type="email"
        placeholder="you@example.com"
        disabled
        passwordManagerIgnore
        className="custom-input"
      />
    ));
    const input = screen.getByRole("textbox", { name: "Email" });

    expect(ref).toBe(input);
    expect(input.getAttribute("type")).toBe("email");
    expect(input.getAttribute("placeholder")).toBe("you@example.com");
    expect((input as HTMLInputElement).disabled).toBe(true);
    expect(input.className).toContain("custom-input");
    expect(input.className).toContain("keeper-ignore");
    expect(input.getAttribute("data-1p-ignore")).toBe("true");
    expect(input.getAttribute("data-bwignore")).toBe("true");
    expect(input.getAttribute("data-form-type")).toBe("other");
    expect(input.getAttribute("data-lpignore")).toBe("true");
  });

  it("wraps labels, descriptions, optional markers, and errors in Field", () => {
    const { unmount } = render(() => (
      <Input
        label="Username"
        required={false}
        description="Choose a public name."
      />
    ));
    expect(screen.getByRole("textbox", { name: /Username/ })).not.toBeNull();
    expect(screen.getByText("(optional)")).not.toBeNull();
    expect(screen.getByText("Choose a public name.")).not.toBeNull();

    unmount();
    render(() => <Input aria-label="Email" error="Invalid email" />);
    expect(screen.getByText("Invalid email")).not.toBeNull();
    expect(screen.getByRole("textbox").className).toContain("ring-kumo-danger");
  });

  it("warns for deprecated error variants and missing accessible names", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { unmount } = render(() => (
      <Input aria-label="Named" variant="error" />
    ));
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('variant="error" is deprecated'),
    );

    unmount();
    warn.mockClear();
    render(() => <Input />);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("must have an accessible name"),
    );
  });

  it("keeps size, error styling, label, and value reactive", () => {
    const [large, setLarge] = createSignal(false);
    const [value, setValue] = createSignal("one");
    render(() => (
      <>
        <Input
          label={large() ? "Updated" : "Initial"}
          size={large() ? "lg" : "xs"}
          error={large() ? "Broken" : undefined}
          value={value()}
          onValueChange={setValue}
        />
        <button type="button" onClick={() => setLarge(true)}>
          Change
        </button>
      </>
    ));

    const input = screen.getByRole("textbox", { name: "Initial" });
    expect(input.className).toContain("h-5");
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(screen.getByRole("textbox", { name: "Updated" })).toBe(input);
    expect(input.className).toContain("h-10");
    expect(input.className).toContain("ring-kumo-danger");
    expect(screen.getByText("Broken")).not.toBeNull();
  });

  it("fires onValueChange while typing without duplicating native change", () => {
    const onValueChange = vi.fn();
    render(() => <Input aria-label="Typing" onValueChange={onValueChange} />);
    const input = screen.getByRole("textbox", { name: "Typing" });

    fireEvent.input(input, { target: { value: "typed" } });
    fireEvent.change(input, { target: { value: "typed" } });
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith("typed", expect.any(Event));
  });

  it("preserves variant metadata and focus helpers", () => {
    expect(KUMO_INPUT_DEFAULT_VARIANTS).toEqual({
      size: "base",
      variant: "default",
    });
    expect(Object.keys(KUMO_INPUT_VARIANTS.size)).toEqual([
      "xs",
      "sm",
      "base",
      "lg",
    ]);
    expect(inputVariants()).toContain("h-9");
    expect(inputVariants({ size: "lg" })).toContain("h-10");
    expect(inputVariants({ variant: "error" })).toContain("ring-kumo-danger");
    expect(inputVariants({ parentFocusIndicator: true })).toContain(
      "focus-within",
    );
  });

  it("preserves the legacy InputGroup subpath exports", () => {
    const focusMode: KumoInputGroupFocusMode = "container";
    const variants: KumoInputGroupVariantsProps = { focusMode };

    expect(typeof LegacyInputGroup).toBe("function");
    expect(KUMO_INPUT_GROUP_DEFAULT_VARIANTS).toEqual({ size: "base" });
    expect(KUMO_INPUT_GROUP_VARIANTS.size.lg.classes).toBe("h-11 text-base");
    expect(variants.focusMode).toBe("container");
  });
});

describe("InputArea", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a bare textarea and preserves value callbacks and refs", () => {
    const onInput = vi.fn();
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    let ref: HTMLTextAreaElement | undefined;
    render(() => (
      <InputArea
        ref={(element) => (ref = element)}
        aria-label="Notes"
        onInput={onInput}
        onChange={onChange}
        onValueChange={onValueChange}
      />
    ));
    const textarea = screen.getByRole("textbox", { name: "Notes" });

    fireEvent.input(textarea, { target: { value: "Longer value" } });
    fireEvent.change(textarea, { target: { value: "Longer value" } });
    expect(ref).toBe(textarea);
    expect(onInput).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith("Longer value");
  });

  it("associates a wrapped textarea and renders feedback", () => {
    render(() => (
      <InputArea label="Notes" description="Add context." required={false} />
    ));

    expect(screen.getByRole("textbox", { name: /Notes/ })).not.toBeNull();
    expect(screen.getByText("Add context.")).not.toBeNull();
    expect(screen.getByText("(optional)")).not.toBeNull();
  });

  it("auto-resizes to content height and restores styles on cleanup", () => {
    vi.spyOn(
      HTMLTextAreaElement.prototype,
      "scrollHeight",
      "get",
    ).mockReturnValue(80);
    const [enabled, setEnabled] = createSignal(true);
    render(() => (
      <>
        <InputArea
          aria-label="Notes"
          autoResize={enabled()}
          defaultValue="Initial"
        />
        <button type="button" onClick={() => setEnabled(false)}>
          Disable
        </button>
      </>
    ));
    const textarea = screen.getByRole("textbox", { name: "Notes" });

    expect(textarea.style.height).toBe("80px");
    expect(textarea.style.overflowY).toBe("hidden");
    expect(textarea.className).toContain("field-sizing-content");

    fireEvent.click(screen.getByRole("button", { name: "Disable" }));
    expect(textarea.style.height).toBe("");
    expect(textarea.style.overflowY).toBe("");
    expect(textarea.className).not.toContain("field-sizing-content");
  });

  it("clamps auto-resize to maxRows with unitless line height", () => {
    vi.spyOn(
      HTMLTextAreaElement.prototype,
      "scrollHeight",
      "get",
    ).mockReturnValue(500);
    render(() => (
      <InputArea
        aria-label="Notes"
        autoResize
        maxRows={4}
        style={{ "line-height": "1.5", "font-size": "16px" }}
      />
    ));
    const textarea = screen.getByRole("textbox", { name: "Notes" });

    expect(textarea.style.height).toBe("96px");
    expect(textarea.style.overflowY).toBe("auto");
  });

  it("reacts to controlled values and error state", () => {
    vi.spyOn(
      HTMLTextAreaElement.prototype,
      "scrollHeight",
      "get",
    ).mockReturnValue(64);
    const [value, setValue] = createSignal("one");
    const [error, setError] = createSignal<string>();
    render(() => (
      <>
        <InputArea
          label="Notes"
          autoResize
          value={value()}
          error={error()}
          onValueChange={setValue}
        />
        <button
          type="button"
          onClick={() => {
            setValue("two");
            setError("Invalid");
          }}
        >
          Change
        </button>
      </>
    ));
    const textarea = screen.getByRole("textbox", { name: "Notes" });

    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect((textarea as HTMLTextAreaElement).value).toBe("two");
    expect(textarea.className).toContain("ring-kumo-danger");
    expect(screen.getByText("Invalid")).not.toBeNull();
    expect(textarea.style.height).toBe("64px");
  });
});
