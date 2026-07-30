import { Field as FieldBase } from "@msviderok/base-ui-solid/field";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vite-plus/test";
import { Field, fieldVariants, normalizeFieldError } from "./field";

describe("Field", () => {
  it("normalizes string, structured, and empty errors", () => {
    expect(normalizeFieldError("Required")).toEqual({
      message: "Required",
      match: true,
    });
    const structured = { message: "Too short", match: "tooShort" as const };
    expect(normalizeFieldError(structured)).toBe(structured);
    expect(normalizeFieldError(undefined)).toBeUndefined();
    expect(normalizeFieldError("")).toBeUndefined();
  });

  it("renders a label, optional marker, control, and description", () => {
    render(() => (
      <Field
        label="Email"
        required={false}
        description="Use your work address."
      >
        <FieldBase.Control render="input" type="email" />
      </Field>
    ));

    expect(screen.getByText("Email")).not.toBeNull();
    expect(screen.getByText("(optional)")).not.toBeNull();
    expect(screen.getByText("Use your work address.")).not.toBeNull();
    expect(screen.getByRole("textbox", { name: /Email/ })).not.toBeNull();
  });

  it("shows an error instead of a description and can hide its label", () => {
    render(() => (
      <Field
        label="Hidden label"
        hideLabel
        error={{ message: "Invalid value", match: true }}
        description="Not visible"
      >
        <FieldBase.Control render="input" aria-label="Custom name" />
      </Field>
    ));

    expect(screen.queryByText("Hidden label")).toBeNull();
    expect(screen.getByText("Invalid value")).not.toBeNull();
    expect(screen.queryByText("Not visible")).toBeNull();
  });

  it("keeps layout and feedback reactive", () => {
    const [controlFirst, setControlFirst] = createSignal(false);
    const [error, setError] = createSignal<string>();
    render(() => (
      <>
        <Field
          label="Setting"
          controlFirst={controlFirst()}
          description="Description"
          error={normalizeFieldError(error())}
        >
          <FieldBase.Control render="input" type="checkbox" />
        </Field>
        <button
          type="button"
          onClick={() => {
            setControlFirst(true);
            setError("Broken");
          }}
        >
          Change
        </button>
      </>
    ));

    const field = screen.getByText("Setting").closest("[class*='grid']")!;
    expect(field.className).not.toContain("flex-row-reverse");
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(field.className).toContain("flex-row-reverse");
    expect(screen.getByText("Broken")).not.toBeNull();
    expect(screen.queryByText("Description")).toBeNull();
  });

  it("preserves the control-first variant helper", () => {
    expect(fieldVariants()).toContain("grid gap-2");
    expect(fieldVariants({ controlFirst: true })).toContain("flex-row-reverse");
  });
});
