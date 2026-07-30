import { mergeProps as mergeBaseUIProps } from "@msviderok/base-ui-solid/merge-props";
import { useRender } from "@msviderok/base-ui-solid/use-render";
import { Show, splitProps, type JSX } from "solid-js";
import { cn } from "../../utils/cn";

/** TableOfContents item state variant definitions. */
export const KUMO_TABLE_OF_CONTENTS_VARIANTS = {
  state: {
    default: {
      classes:
        "text-kumo-subtle hover:border-kumo-line hover:text-kumo-default hover:font-medium",
      description: "Inactive section link",
    },
    active: {
      classes: "border-kumo-brand font-medium text-kumo-default",
      description: "Currently visible / active section",
    },
  },
} as const;

export const KUMO_TABLE_OF_CONTENTS_DEFAULT_VARIANTS = {
  state: "default",
} as const;

export type KumoTableOfContentsState =
  keyof typeof KUMO_TABLE_OF_CONTENTS_VARIANTS.state;

const ITEM_BASE =
  "block w-full truncate border-l-2 border-transparent py-0.5 pl-4 text-sm text-left no-underline";
const NESTED_UL_CLASSES =
  "flex flex-col gap-2 border-l-2 border-kumo-hairline [&>li>a]:pl-7 [&>li>button]:pl-7";

export interface TableOfContentsProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "children"
> {
  children?: JSX.Element;
  className?: string;
}

export interface TableOfContentsTitleProps extends Omit<
  JSX.HTMLAttributes<HTMLParagraphElement>,
  "children"
> {
  children?: JSX.Element;
  className?: string;
}

export interface TableOfContentsListProps extends Omit<
  JSX.HTMLAttributes<HTMLUListElement>,
  "children"
> {
  children?: JSX.Element;
  className?: string;
}

export type TableOfContentsItemProps = Omit<
  useRender.ComponentProps<"a">,
  "children" | "class" | "className" | "render"
> & {
  children?: JSX.Element;
  class?: string;
  className?: string;
  /** Whether this item represents the currently active section. */
  active?: boolean;
  /**
   * Solid render override for router links or buttons.
   *
   * @example
   * ```tsx
   * <TableOfContents.Item render="button">Introduction</TableOfContents.Item>
   * ```
   */
  render?: useRender.RenderProp;
};

export interface TableOfContentsGroupProps extends Omit<
  JSX.HTMLAttributes<HTMLLIElement>,
  "children" | "onClick" | "title"
> {
  children?: JSX.Element;
  className?: string;
  /** Label displayed above the group's items. */
  label: string;
  /** URL the group label links to. */
  href?: string;
  /** Whether the linked group label represents the active section. */
  active?: boolean;
  onClick?: JSX.EventHandlerUnion<HTMLAnchorElement, MouseEvent>;
}

function TableOfContentsRoot(inputProps: TableOfContentsProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "aria-label",
    "ref",
  ]);

  return (
    <nav
      {...elementProps}
      ref={props.ref}
      aria-label={props["aria-label"] ?? "Table of contents"}
      class={cn(props.class, props.className)}
    >
      {props.children}
    </nav>
  );
}

function TableOfContentsTitle(inputProps: TableOfContentsTitleProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "ref",
  ]);

  return (
    <p
      {...elementProps}
      ref={props.ref}
      class={cn(
        "mb-3 text-xs font-semibold tracking-wide text-kumo-subtle uppercase",
        props.class,
        props.className,
      )}
    >
      {props.children}
    </p>
  );
}

function TableOfContentsList(inputProps: TableOfContentsListProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "ref",
  ]);

  return (
    <ul
      {...elementProps}
      ref={props.ref}
      class={cn(
        "flex flex-col gap-2 border-l-2 border-kumo-hairline",
        props.class,
        props.className,
      )}
    >
      {props.children}
    </ul>
  );
}

function TableOfContentsItem(inputProps: TableOfContentsItemProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "active",
    "render",
    "ref",
  ]);
  const element = useRender({
    get render() {
      return props.render ?? "a";
    },
    ref: props.ref,
    props: mergeBaseUIProps<"a">(
      {
        get "aria-current"() {
          return props.active ? ("true" as const) : undefined;
        },
        "data-kumo-component": "TableOfContents",
        "data-kumo-part": "item",
        get class() {
          return cn(
            ITEM_BASE,
            props.active
              ? KUMO_TABLE_OF_CONTENTS_VARIANTS.state.active.classes
              : KUMO_TABLE_OF_CONTENTS_VARIANTS.state.default.classes,
            props.class,
            props.className,
          );
        },
      } as JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
      elementProps,
    ),
    get children() {
      return <span class="block min-w-0 leading-5">{props.children}</span>;
    },
  });

  return <li class="-ml-0.5">{element()}</li>;
}

function TableOfContentsGroup(inputProps: TableOfContentsGroupProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "label",
    "href",
    "active",
    "onClick",
    "ref",
  ]);

  const nestedItems = () => <ul class={NESTED_UL_CLASSES}>{props.children}</ul>;

  return (
    <Show
      when={props.href}
      fallback={
        <li
          {...elementProps}
          ref={props.ref}
          class={cn(
            "-ml-0.5 flex flex-col gap-2",
            props.class,
            props.className,
          )}
        >
          <p class="py-0.5 pl-4 text-sm leading-5 font-medium text-kumo-subtle">
            {props.label}
          </p>
          {nestedItems()}
        </li>
      }
    >
      {(href) => (
        <li
          {...elementProps}
          ref={props.ref}
          class={cn(
            "-ml-0.5 flex flex-col gap-2",
            props.class,
            props.className,
          )}
        >
          <a
            href={href()}
            onClick={props.onClick}
            aria-current={props.active ? "true" : undefined}
            data-kumo-component="TableOfContents"
            data-kumo-part="group-link"
            class={cn(
              ITEM_BASE,
              props.active
                ? KUMO_TABLE_OF_CONTENTS_VARIANTS.state.active.classes
                : KUMO_TABLE_OF_CONTENTS_VARIANTS.state.default.classes,
            )}
          >
            <span class="block min-w-0 leading-5">{props.label}</span>
          </a>
          {nestedItems()}
        </li>
      )}
    </Show>
  );
}

/** Presentational compound component for section navigation. */
export const TableOfContents = Object.assign(TableOfContentsRoot, {
  Title: TableOfContentsTitle,
  List: TableOfContentsList,
  Item: TableOfContentsItem,
  Group: TableOfContentsGroup,
});
