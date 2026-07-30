import { createSignal, type JSX } from "solid-js";

import {
  TableOfContents,
  useTableOfContentsActiveId,
} from "@photon-ai/kumo-solid";

const headings = [
  { text: "Introduction" },
  { text: "Installation" },
  { text: "Usage" },
  { text: "API Reference" },
  { text: "Examples" },
];

function DemoWrapper({ children }: { children: JSX.Element }) {
  return <div class="min-w-48">{children}</div>;
}

export function TableOfContentsBasicDemo() {
  return (
    <DemoWrapper>
      <TableOfContents>
        <TableOfContents.Title>On this page</TableOfContents.Title>
        <TableOfContents.List>
          {headings.map((heading) => (
            <TableOfContents.Item
              active={heading.text === "Usage"}
              className="cursor-pointer"
            >
              {heading.text}
            </TableOfContents.Item>
          ))}
        </TableOfContents.List>
      </TableOfContents>
    </DemoWrapper>
  );
}

export function TableOfContentsInteractiveDemo() {
  const [active, setActive] = createSignal("Introduction");

  return (
    <DemoWrapper>
      <TableOfContents>
        <TableOfContents.Title>On this page</TableOfContents.Title>
        <TableOfContents.List>
          {headings.map((heading) => (
            <TableOfContents.Item
              active={heading.text === active()}
              onClick={() => setActive(heading.text)}
              className="cursor-pointer"
            >
              {heading.text}
            </TableOfContents.Item>
          ))}
        </TableOfContents.List>
      </TableOfContents>
    </DemoWrapper>
  );
}

export function TableOfContentsNoActiveDemo() {
  return (
    <DemoWrapper>
      <TableOfContents>
        <TableOfContents.Title>On this page</TableOfContents.Title>
        <TableOfContents.List>
          {headings.map((heading) => (
            <TableOfContents.Item className="cursor-pointer">
              {heading.text}
            </TableOfContents.Item>
          ))}
        </TableOfContents.List>
      </TableOfContents>
    </DemoWrapper>
  );
}

/** Shows both group modes: clickable group labels (with `href`) and plain title labels (without `href`). */
export function TableOfContentsGroupDemo() {
  return (
    <DemoWrapper>
      <TableOfContents>
        <TableOfContents.Title>On this page</TableOfContents.Title>
        <TableOfContents.List>
          <TableOfContents.Item active className="cursor-pointer">
            Overview
          </TableOfContents.Item>
          <TableOfContents.Group label="Examples" href="#examples-demo">
            <TableOfContents.Item className="cursor-pointer">
              Basic example
            </TableOfContents.Item>
            <TableOfContents.Item className="cursor-pointer">
              Advanced example
            </TableOfContents.Item>
          </TableOfContents.Group>
          <TableOfContents.Group label="Getting Started">
            <TableOfContents.Item className="cursor-pointer">
              Installation
            </TableOfContents.Item>
            <TableOfContents.Item className="cursor-pointer">
              Configuration
            </TableOfContents.Item>
          </TableOfContents.Group>
          <TableOfContents.Group label="API" href="#api-demo">
            <TableOfContents.Item className="cursor-pointer">
              Props
            </TableOfContents.Item>
            <TableOfContents.Item className="cursor-pointer">
              Events
            </TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents.List>
      </TableOfContents>
    </DemoWrapper>
  );
}

export function TableOfContentsWithoutTitleDemo() {
  return (
    <DemoWrapper>
      <TableOfContents>
        <TableOfContents.List>
          {headings.slice(0, 3).map((heading) => (
            <TableOfContents.Item
              active={heading.text === "Introduction"}
              className="cursor-pointer"
            >
              {heading.text}
            </TableOfContents.Item>
          ))}
        </TableOfContents.List>
      </TableOfContents>
    </DemoWrapper>
  );
}

const scrollspySections = [
  { id: "scrollspy-demo-overview", title: "Overview" },
  { id: "scrollspy-demo-install", title: "Installation" },
  { id: "scrollspy-demo-usage", title: "Usage" },
  { id: "scrollspy-demo-api", title: "API" },
];

/**
 * Live scroll tracking via `useTableOfContentsActiveId`, scoped to a custom
 * scroll container through the `root` option. Scroll the content — the active
 * item follows; click an item to jump.
 */
export function TableOfContentsScrollspyDemo() {
  const [root, setRoot] = createSignal<HTMLDivElement | null>(null);

  const { activeId, selectSection } = useTableOfContentsActiveId({
    ids: scrollspySections.map((s) => s.id),
    root,
    trackHash: false,
  });

  return (
    <div class="flex w-full max-w-xl gap-6">
      <div class="min-w-40">
        <TableOfContents>
          <TableOfContents.Title>On this page</TableOfContents.Title>
          <TableOfContents.List>
            {scrollspySections.map((section) => (
              <TableOfContents.Item
                render={(renderProps) => (
                  <button {...renderProps} type="button" />
                )}
                active={activeId() === section.id}
                onClick={() => {
                  selectSection(section.id);
                  root()
                    ?.querySelector(`#${section.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                {section.title}
              </TableOfContents.Item>
            ))}
          </TableOfContents.List>
        </TableOfContents>
      </div>
      <div
        ref={setRoot}
        class="h-64 flex-1 overflow-y-auto rounded-lg border border-kumo-hairline p-4"
      >
        {scrollspySections.map((section) => (
          <section>
            <h4 id={section.id} class="mb-2 scroll-mt-2 text-sm font-semibold">
              {section.title}
            </h4>
            <p class="mb-6 text-sm text-kumo-subtle">
              {Array.from(
                { length: 6 },
                () =>
                  `Scrollable placeholder copy for the ${section.title} section. `,
              ).join("")}
            </p>
          </section>
        ))}
        <div class="h-40" />
      </div>
    </div>
  );
}

/** Demonstrates using the `render` prop with a custom link component. */
export function TableOfContentsRenderPropDemo() {
  const [clicked, setClicked] = createSignal<string | null>(null);

  return (
    <DemoWrapper>
      <div class="space-y-3">
        <TableOfContents>
          <TableOfContents.List>
            {["Introduction", "Installation", "Usage"].map((text) => (
              <TableOfContents.Item
                render={(renderProps) => (
                  <button {...renderProps} type="button" />
                )}
                onClick={() => setClicked(text)}
                active={text === "Introduction"}
              >
                {text}
              </TableOfContents.Item>
            ))}
          </TableOfContents.List>
        </TableOfContents>
        {clicked() && (
          <p class="text-xs text-kumo-subtle">Clicked: {clicked()}</p>
        )}
      </div>
    </DemoWrapper>
  );
}
