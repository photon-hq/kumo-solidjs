import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vite-plus/test";
import { Label, labelContentVariants, labelVariants } from "./label";

describe("Label", () => {
  it("renders a styled native label associated with a control", () => {
    render(() => (
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>
    ));

    const label = screen.getByText("Email");
    expect(label.tagName).toBe("LABEL");
    expect(label.getAttribute("for")).toBe("email");
    expect(label.className).toContain(labelVariants());
    expect(label.className).toContain(labelContentVariants());
  });

  it("renders the optional indicator", () => {
    render(() => <Label showOptional>Middle name</Label>);
    const indicator = screen.getByText("(optional)");

    expect(indicator.className).toContain("text-kumo-subtle");
  });

  it("renders content-only composition without a nested label", () => {
    const { container } = render(() => <Label asContent>Name</Label>);
    const root = container.firstElementChild as HTMLElement;

    expect(root.tagName).toBe("SPAN");
    expect(root.querySelector("label")).toBeNull();
    expect(root.className).toBe(labelContentVariants());
  });

  it("uses a Kumo button as the tooltip trigger", async () => {
    render(() => <Label tooltip="Why this is needed">Account name</Label>);

    const trigger = screen.getByRole("button", { name: "More information" });
    expect(trigger.dataset.kumoComponent).toBe("Button");
    expect(trigger.dataset.baseUiTooltipTrigger).toBe("");

    fireEvent.mouseEnter(trigger);
    fireEvent.mouseMove(trigger);
    expect(await screen.findByText("Why this is needed")).toBeTruthy();
  });

  it("keeps optional and content modes reactive", () => {
    const [optional, setOptional] = createSignal(false);
    const [asContent, setAsContent] = createSignal(false);
    const { container } = render(() => (
      <Label showOptional={optional()} asContent={asContent()}>
        Name
      </Label>
    ));

    expect(container.firstElementChild?.tagName).toBe("LABEL");
    expect(screen.queryByText("(optional)")).toBeNull();

    setOptional(true);
    setAsContent(true);
    expect(container.firstElementChild?.tagName).toBe("SPAN");
    expect(screen.getByText("(optional)")).toBeTruthy();
  });
});
