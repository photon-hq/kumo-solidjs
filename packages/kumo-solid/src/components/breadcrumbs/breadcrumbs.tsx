import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  splitProps,
  type JSX,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { CheckIcon, CopyIcon } from "../../internal/icons";
import { cn } from "../../utils/cn";
import { useLinkComponent } from "../../utils/link-provider";
import { resolveVariant } from "../../utils/resolve-variant";
import { Button } from "../button";
import { SkeletonLine } from "../loader";

export const KUMO_BREADCRUMBS_VARIANTS = {
  size: {
    sm: {
      classes: "text-sm h-10 gap-0.5",
      description: "Compact breadcrumbs for dense UIs",
    },
    base: {
      classes: "text-base h-12 gap-1",
      description: "Default breadcrumbs size",
    },
  },
} as const;

export const KUMO_BREADCRUMBS_DEFAULT_VARIANTS = {
  size: "base",
} as const;

export type KumoBreadcrumbsSize = keyof typeof KUMO_BREADCRUMBS_VARIANTS.size;

export interface KumoBreadcrumbsVariantsProps {
  size?: KumoBreadcrumbsSize;
}

export function breadcrumbsVariants({
  size = KUMO_BREADCRUMBS_DEFAULT_VARIANTS.size,
}: KumoBreadcrumbsVariantsProps = {}) {
  return cn(
    "group mr-4 flex min-w-0 grow items-center overflow-hidden whitespace-nowrap",
    resolveVariant(
      KUMO_BREADCRUMBS_VARIANTS.size,
      size,
      KUMO_BREADCRUMBS_DEFAULT_VARIANTS.size,
    ).classes,
  );
}

type BreadcrumbPartKind = "link" | "current" | "separator" | "extra";
const BREADCRUMB_PART = Symbol("kumo.breadcrumb.part");

type BreadcrumbRender = (() => JSX.Element) & {
  [BREADCRUMB_PART]?: BreadcrumbPartKind;
};

function deferBreadcrumbPart(
  kind: BreadcrumbPartKind,
  render: () => JSX.Element,
): JSX.Element {
  Object.defineProperty(render, BREADCRUMB_PART, {
    configurable: true,
    value: kind,
  });
  return render as unknown as JSX.Element;
}

function breadcrumbPart(value: unknown): BreadcrumbPartKind | undefined {
  if (typeof value !== "function") return undefined;
  return (value as BreadcrumbRender)[BREADCRUMB_PART];
}

interface BreadcrumbEntry {
  kind: BreadcrumbPartKind;
  value: unknown;
}

function collectBreadcrumbEntries(
  value: unknown,
  entries: BreadcrumbEntry[] = [],
): BreadcrumbEntry[] {
  const part = breadcrumbPart(value);
  if (part) {
    entries.push({ kind: part, value });
    return entries;
  }
  if (Array.isArray(value)) {
    for (const child of value) collectBreadcrumbEntries(child, entries);
    return entries;
  }
  if (typeof value === "function") {
    return collectBreadcrumbEntries(value(), entries);
  }
  if (value !== null && value !== undefined && value !== false) {
    entries.push({ kind: "extra", value });
  }
  return entries;
}

function renderBreadcrumbEntry(entry: BreadcrumbEntry) {
  return typeof entry.value === "function"
    ? (entry.value as () => JSX.Element)()
    : (entry.value as JSX.Element);
}

export interface BreadcrumbsItemProps {
  href: string;
  icon?: JSX.Element;
  children?: JSX.Element;
}

function Link(props: BreadcrumbsItemProps) {
  return deferBreadcrumbPart("link", () => {
    const LinkComponent = useLinkComponent();

    return (
      <Dynamic
        component={LinkComponent}
        data-kumo-component="Breadcrumbs"
        data-kumo-part="link"
        href={props.href}
        class="flex shrink-0 items-center gap-1 whitespace-nowrap text-kumo-subtle no-underline"
      >
        {props.icon ? (
          <span class="flex shrink-0 items-center">{props.icon}</span>
        ) : null}
        <span>{props.children}</span>
      </Dynamic>
    );
  });
}

export interface BreadcrumbsCurrentProps {
  loading?: boolean;
  icon?: JSX.Element;
  children?: JSX.Element;
}

function Current(props: BreadcrumbsCurrentProps) {
  return deferBreadcrumbPart("current", () =>
    props.loading ? (
      <div class="flex w-[125px] min-w-0 items-center gap-1">
        {props.icon ? (
          <span class="flex shrink-0 items-center">{props.icon}</span>
        ) : null}
        <SkeletonLine />
      </div>
    ) : (
      <div
        class="flex max-w-full min-w-0 items-center gap-1 font-medium"
        aria-current="page"
      >
        {props.icon ? (
          <span class="flex shrink-0 items-center">{props.icon}</span>
        ) : null}
        <span class="truncate">{props.children}</span>
      </div>
    ),
  );
}

function Separator() {
  return deferBreadcrumbPart("separator", () => (
    <span
      class="flex shrink-0 items-center text-kumo-inactive"
      aria-hidden="true"
    >
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M10.75 8.75L14.25 12L10.75 15.25"
        />
      </svg>
    </span>
  ));
}

function MobileEllipsis() {
  return (
    <span class="flex shrink-0 items-center text-kumo-subtle" aria-hidden>
      ...
    </span>
  );
}

export interface BreadcrumbsClipboardProps {
  text: string;
}

function Clipboard(props: BreadcrumbsClipboardProps) {
  return deferBreadcrumbPart("extra", () => {
    const [isCopied, setIsCopied] = createSignal(false);

    createEffect(() => {
      if (!isCopied()) return;
      const timeout = setTimeout(() => setIsCopied(false), 2_000);
      onCleanup(() => clearTimeout(timeout));
    });

    const handleCopyDeeplink = async () => {
      if (!props.text) return;

      try {
        await navigator.clipboard.writeText(props.text);
        setIsCopied(true);
      } catch (error) {
        console.error("Failed to copy deeplink:", error);
      }
    };

    return (
      <Button
        variant="ghost"
        shape="square"
        size="sm"
        className="opacity-0 transition-[opacity] group-hover:opacity-100"
        onClick={handleCopyDeeplink}
        title="Click to copy"
        aria-label="Copy"
      >
        {isCopied() ? <CheckIcon class="text-kumo-success" /> : <CopyIcon />}
      </Button>
    );
  });
}

export interface BreadcrumbsProps
  extends
    Omit<JSX.HTMLAttributes<HTMLElement>, "children" | "class" | "className">,
    KumoBreadcrumbsVariantsProps {
  children?: JSX.Element;
  class?: string;
  className?: string;
}

export function Breadcrumb(inputProps: BreadcrumbsProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "size",
    "class",
    "className",
  ]);
  const entries = createMemo(() => collectBreadcrumbEntries(props.children));
  const mobileEntries = createMemo(() => {
    const allEntries = entries();
    const breadcrumbItems = allEntries.filter(
      (entry) => entry.kind === "link" || entry.kind === "current",
    );

    if (breadcrumbItems.length <= 2) return allEntries;

    const [parentItem, currentItem] = breadcrumbItems.slice(-2);
    return [
      {
        kind: "extra",
        value: () => <MobileEllipsis />,
      },
      {
        kind: "separator",
        value: Separator(),
      },
      parentItem,
      {
        kind: "separator",
        value: Separator(),
      },
      currentItem,
      ...allEntries.filter((entry) => entry.kind === "extra"),
    ] satisfies BreadcrumbEntry[];
  });

  return (
    <nav
      {...elementProps}
      class={cn(
        breadcrumbsVariants({
          size: props.size ?? KUMO_BREADCRUMBS_DEFAULT_VARIANTS.size,
        }),
        props.class,
        props.className,
      )}
      aria-label={elementProps["aria-label"] ?? "breadcrumb"}
    >
      <div class="contents sm:hidden">
        {mobileEntries().map(renderBreadcrumbEntry)}
      </div>
      <div class="hidden sm:contents">
        {entries().map(renderBreadcrumbEntry)}
      </div>
    </nav>
  );
}

type BreadcrumbComponent = typeof Breadcrumb & {
  Link: typeof Link;
  Current: typeof Current;
  Separator: typeof Separator;
  Clipboard: typeof Clipboard;
};

export const Breadcrumbs = Object.assign(Breadcrumb, {
  Link,
  Current,
  Separator,
  Clipboard,
}) as BreadcrumbComponent;
