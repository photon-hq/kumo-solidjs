import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import {
  Code,
  CodeBlock,
  codeVariants,
  KUMO_CODE_STYLING,
  KUMO_CODE_VARIANTS,
} from "./code";

describe("Code", () => {
  it("renders code, styles, and className on a pre element", () => {
    render(() => (
      <Code
        code="const answer = 42;"
        lang="ts"
        className="custom-code"
        style={{ color: "currentColor" }}
      />
    ));

    const code = screen.getByText("const answer = 42;");
    expect(code.tagName).toBe("PRE");
    expect(code.className).toContain("font-mono");
    expect(code.className).toContain("custom-code");
    expect(code.getAttribute("style")).toContain("color: currentcolor");
  });

  it("exposes matching compound and standalone block components", () => {
    const { unmount } = render(() => (
      <Code.Block code="pnpm test" lang="bash" />
    ));
    expect(screen.getByText("pnpm test").parentElement?.className).toContain(
      "border-kumo-fill",
    );

    unmount();
    render(() => <CodeBlock code="pnpm build" />);
    expect(screen.getByText("pnpm build")).not.toBeNull();
  });

  it("reacts to code, language, and class changes", () => {
    const [code, setCode] = createSignal("one");
    const [lang, setLang] = createSignal<"ts" | "bash">("ts");
    const [className, setClassName] = createSignal("first");
    render(() => (
      <>
        <Code code={code()} lang={lang()} className={className()} />
        <button
          type="button"
          onClick={() => {
            setCode("two");
            setLang("bash");
            setClassName("second");
          }}
        >
          Change
        </button>
      </>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(screen.getByText("two").className).toContain("second");
  });
});

describe("code metadata", () => {
  it("preserves variants, styling metadata, defaults, and fallbacks", () => {
    expect(Object.keys(KUMO_CODE_VARIANTS.lang)).toEqual([
      "ts",
      "tsx",
      "jsonc",
      "bash",
      "css",
    ]);
    expect(KUMO_CODE_STYLING.typography.fontFamily).toBe("font-mono");
    expect(codeVariants()).toContain("text-kumo-subtle");

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(codeVariants({ lang: "invalid" as never })).toBe(codeVariants());
    warn.mockRestore();
  });
});
