import { createEffect, createMemo, createSignal, Show } from "solid-js";

import {
  TableOfContents as TOC,
  useTableOfContentsActiveId,
} from "@photon-ai/kumo-solid";
import { CaretDownIcon } from "~/components/icons";

export interface TocHeading {
  depth: number;
  slug: string;
  text: string;
}

interface HeadingGroup {
  h2: TocHeading;
  h3s: TocHeading[];
}

interface TableOfContentsProps {
  /** Static headings (MDX pages). Omit to scrape from the DOM (.astro pages). */
  headings?: TocHeading[];
  /**
   * - `"sidebar"` (default) — vertical list with active indicator bar
   * - `"select"` — native `<select>` jump menu for compact layouts
   */
  layout?: "sidebar" | "select";
}

/**
 * Scrape h2 and h3 elements from the rendered `.kumo-prose` container.
 * Only runs client-side for .astro pages that don't pass headings statically.
 */
function scrapeHeadings(): TocHeading[] {
  if (typeof document === "undefined") return [];

  const content = document.querySelector(".kumo-prose");
  if (!content) return [];

  return Array.from(content.querySelectorAll("h2, h3"))
    .filter((el) => el.id)
    .map((el) => ({
      depth: Number(el.tagName[1]),
      slug: el.id,
      text: el.textContent?.trim() ?? "",
    }));
}

/**
 * Group a flat list of headings into h2 → h3[] pairs for nested TOC rendering.
 * h3 headings that appear before any h2 are dropped.
 */
function groupHeadings(headings: TocHeading[]): HeadingGroup[] {
  const groups: HeadingGroup[] = [];
  for (const heading of headings) {
    if (heading.depth === 2) {
      groups.push({ h2: heading, h3s: [] });
    } else if (heading.depth === 3 && groups.length > 0) {
      groups[groups.length - 1].h3s.push(heading);
    }
  }
  return groups;
}

export function TableOfContents({
  headings: headingsProp,
  layout = "sidebar",
}: TableOfContentsProps) {
  // Track whether we've hydrated to avoid SSR/client mismatch when scraping
  const [hasMounted, setHasMounted] = createSignal(false);

  createEffect(() => {
    setHasMounted(true);
  });

  const headings = createMemo(() => {
    if (headingsProp && headingsProp.length > 0) {
      return headingsProp.filter((h) => h.depth <= 3);
    }
    // Only scrape after mount to avoid hydration mismatch
    if (!hasMounted()) return [];
    return scrapeHeadings();
  });

  // Scroll tracking + hash deep-linking via the shared kumo hook. It
  // highlights the topmost heading in view (offset by the fixed header) and
  // pins a clicked heading until the smooth scroll settles, so short trailing
  // sections stay reachable.
  const { activeId, selectSection } = useTableOfContentsActiveId({
    ids: () => headings().map((heading) => heading.slug),
    offset: 96, // sticky header height (top-24)
  });

  const renderContent = () => {
    if (layout === "select") {
      return (
        <nav aria-label="Table of contents" class="relative">
          <select
            aria-label="Jump to section"
            value={activeId() ?? headings()[0]?.slug ?? ""}
            onChange={(e) => {
              const slug = e.target.value;
              selectSection(slug);
              document
                .getElementById(slug)
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            class="w-full appearance-none p-4 text-base md:px-6 lg:px-12"
          >
            {groupHeadings(headings()).map((group) => (
              <optgroup label={group.h2.text}>
                <option value={group.h2.slug}>{group.h2.text}</option>
                {group.h3s.map((h3) => (
                  <option value={h3.slug}>
                    {"  "}
                    {h3.text}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <CaretDownIcon
            size={16}
            weight="bold"
            className="pointer-events-none absolute top-1/2 right-4.5 -translate-y-1/2 text-kumo-subtle md:right-6 lg:right-12"
          />
        </nav>
      );
    }

    return (
      <TOC>
        <TOC.Title>On this page</TOC.Title>
        <TOC.List>
          {groupHeadings(headings()).map((group) => {
            if (group.h3s.length === 0) {
              return (
                <TOC.Item
                  href={`#${group.h2.slug}`}
                  active={activeId() === group.h2.slug}
                  onClick={() => selectSection(group.h2.slug)}
                  className="overflow-visible text-pretty whitespace-pre-wrap"
                >
                  {group.h2.text}
                </TOC.Item>
              );
            }
            return (
              <TOC.Group
                label={group.h2.text}
                href={`#${group.h2.slug}`}
                active={activeId() === group.h2.slug}
                onClick={() => selectSection(group.h2.slug)}
              >
                {group.h3s.map((h3) => (
                  <TOC.Item
                    href={`#${h3.slug}`}
                    active={activeId() === h3.slug}
                    onClick={() => selectSection(h3.slug)}
                    className="overflow-visible text-pretty whitespace-pre-wrap"
                  >
                    {h3.text}
                  </TOC.Item>
                ))}
              </TOC.Group>
            );
          })}
        </TOC.List>
      </TOC>
    );
  };

  return <Show when={headings()[0]}>{(_heading) => renderContent()}</Show>;
}
