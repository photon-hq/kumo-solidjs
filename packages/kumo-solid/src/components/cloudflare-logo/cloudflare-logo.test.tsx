import { render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vite-plus/test";
import {
  CloudflareLogo,
  PoweredByCloudflare,
  generateCloudflareLogoSvg,
  KUMO_CLOUDFLARE_LOGO_DEFAULT_VARIANTS,
} from "./cloudflare-logo";

describe("CloudflareLogo", () => {
  it("renders the full brand-color logo by default", () => {
    render(() => <CloudflareLogo className="custom-logo" />);

    const logo = screen.getByRole("img", { name: "Cloudflare logo" });
    expect(KUMO_CLOUDFLARE_LOGO_DEFAULT_VARIANTS).toEqual({
      variant: "full",
      color: "color",
    });
    expect(logo.getAttribute("viewBox")).toBe("0 0 425.6 143.63");
    expect(logo.classList.contains("text-kumo-default")).toBe(true);
    expect(logo.classList.contains("custom-logo")).toBe(true);
    expect(logo.querySelectorAll("path")).toHaveLength(12);
    expect(logo.querySelector("path")?.getAttribute("fill")).toBe("#F48120");
  });

  it("renders reactive glyph and color variants", () => {
    const [variant, setVariant] = createSignal<"full" | "glyph">("full");
    const [color, setColor] = createSignal<"color" | "black">("color");
    render(() => <CloudflareLogo variant={variant()} color={color()} />);

    const initialLogo = screen.getByRole("img", { name: "Cloudflare logo" });
    expect(initialLogo.getAttribute("viewBox")).toBe("0 0 425.6 143.63");
    setVariant("glyph");
    setColor("black");

    const logo = screen.getByRole("img", { name: "Cloudflare logo" });
    expect(logo.getAttribute("viewBox")).toBe("0 0 49 22");
    expect(logo.classList.contains("text-black")).toBe(true);
    expect(logo.querySelectorAll("path")).toHaveLength(2);
    expect(logo.querySelector("path")?.getAttribute("fill")).toBe(
      "currentColor",
    );
  });

  it("forwards SVG attributes, accessible labels, and refs", () => {
    let ref: SVGSVGElement | undefined;
    render(() => (
      <CloudflareLogo
        variant="glyph"
        aria-label="Cloudflare glyph"
        width="49"
        ref={(element) => {
          ref = element;
        }}
      />
    ));

    const logo = screen.getByRole("img", { name: "Cloudflare glyph" });
    expect(logo.getAttribute("width")).toBe("49");
    expect(ref).toBe(logo);
  });

  it("renders the powered-by link with safe defaults and overrides", () => {
    render(() => (
      <PoweredByCloudflare
        color="white"
        href="https://example.com/cloudflare"
        target="_self"
      />
    ));

    const link = screen.getByRole("link", { name: /Powered by Cloudflare/ });
    expect(link.getAttribute("href")).toBe("https://example.com/cloudflare");
    expect(link.getAttribute("target")).toBe("_self");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.className).toContain("bg-black");
    expect(withinLogo(link).getAttribute("viewBox")).toBe("0 0 49 22");
  });

  it("generates standalone SVG markup with matching path and color data", () => {
    const glyph = generateCloudflareLogoSvg({
      variant: "glyph",
      color: "black",
    });
    const full = generateCloudflareLogoSvg();

    expect(glyph).toContain('viewBox="0 0 49 22"');
    expect(glyph).toContain('fill="black"');
    expect(glyph.match(/<path/g) ?? []).toHaveLength(2);
    expect(full).toContain('viewBox="0 0 425.6 143.63"');
    expect(full).toContain('fill="#404041"');
    expect(full.match(/<path/g) ?? []).toHaveLength(12);
  });
});

function withinLogo(link: HTMLElement) {
  const logo = link.querySelector("svg");
  if (!logo) throw new Error("Expected the powered-by badge to contain a logo");
  return logo;
}
