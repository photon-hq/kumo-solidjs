import { splitProps, type JSX } from "solid-js";
import { cn } from "../../utils/cn";
import { resolveVariant } from "../../utils/resolve-variant";
import { Checkbox, type CheckboxChangeEventDetails } from "../checkbox";

/** Table layout and row variant definitions mapping names to their Tailwind classes. */
export const KUMO_TABLE_VARIANTS = {
  layout: {
    auto: {
      classes: "",
      description: "Auto table layout - columns resize based on content",
    },
    fixed: {
      classes: "table-fixed",
      description:
        "Fixed table layout - columns have equal width, controlled via colgroup",
    },
  },
  variant: {
    default: {
      classes: "",
      description: "Default row variant",
    },
    selected: {
      classes: "bg-kumo-tint",
      description: "Selected row variant",
    },
  },
  sticky: {
    left: {
      classes: "sticky left-0",
      description: "Pin column to the left edge of the scroll container",
    },
    right: {
      classes: "sticky right-0",
      description: "Pin column to the right edge of the scroll container",
    },
  },
} as const;

export const KUMO_TABLE_DEFAULT_VARIANTS = {
  layout: "auto",
  variant: "default",
} as const;

export type KumoTableStickyColumn = keyof typeof KUMO_TABLE_VARIANTS.sticky;
export type KumoTableRowVariant = keyof typeof KUMO_TABLE_VARIANTS.variant;
export type KumoTableLayout = keyof typeof KUMO_TABLE_VARIANTS.layout;

function stickyColumnClasses(
  side: KumoTableStickyColumn,
  element: "head" | "cell",
) {
  const base = resolveVariant(KUMO_TABLE_VARIANTS.sticky, side, "left").classes;
  const z = element === "head" ? "z-2" : "z-1";
  const fadePosition = side === "right" ? "before:-left-6" : "before:-right-6";
  const fadeBase =
    "before:pointer-events-none before:absolute before:inset-y-0 before:w-6";

  if (element === "cell") {
    const fade =
      side === "right"
        ? "before:bg-gradient-to-r before:from-transparent before:to-kumo-base"
        : "before:bg-gradient-to-l before:from-transparent before:to-kumo-base";
    return cn(base, z, "bg-kumo-base", fadeBase, fadePosition, fade);
  }

  const bg = "bg-kumo-base group-data-[compact]/header:bg-kumo-elevated";
  const fade =
    side === "right"
      ? "before:bg-gradient-to-r before:from-transparent before:to-kumo-base group-data-[compact]/header:before:to-kumo-elevated"
      : "before:bg-gradient-to-l before:from-transparent before:to-kumo-base group-data-[compact]/header:before:to-kumo-elevated";

  return cn(base, z, bg, fadeBase, fadePosition, fade);
}

export interface TableProps extends Omit<
  JSX.HTMLAttributes<HTMLTableElement>,
  "children"
> {
  children?: JSX.Element;
  className?: string;
  layout?: KumoTableLayout;
}

export interface TableHeaderProps extends Omit<
  JSX.HTMLAttributes<HTMLTableSectionElement>,
  "children"
> {
  children?: JSX.Element;
  className?: string;
  variant?: "default" | "compact";
  sticky?: boolean;
}

export interface TableHeadProps extends Omit<
  JSX.ThHTMLAttributes<HTMLTableCellElement>,
  "children"
> {
  children?: JSX.Element;
  className?: string;
  sticky?: KumoTableStickyColumn;
}

export interface TableRowProps extends Omit<
  JSX.HTMLAttributes<HTMLTableRowElement>,
  "children"
> {
  children?: JSX.Element;
  className?: string;
  variant?: KumoTableRowVariant;
}

export interface TableBodyProps extends Omit<
  JSX.HTMLAttributes<HTMLTableSectionElement>,
  "children"
> {
  children?: JSX.Element;
}

export interface TableCellProps extends Omit<
  JSX.TdHTMLAttributes<HTMLTableCellElement>,
  "children"
> {
  children?: JSX.Element;
  className?: string;
  sticky?: KumoTableStickyColumn;
}

export interface TableFooterProps extends Omit<
  JSX.HTMLAttributes<HTMLTableSectionElement>,
  "children"
> {
  children?: JSX.Element;
}

export interface TableResizeHandleProps extends Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  className?: string;
}

export type TableCheckCellProps = Omit<TableCellProps, "children"> & {
  checked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (
    checked: boolean,
    eventDetails?: CheckboxChangeEventDetails,
  ) => void;
  /** @deprecated Use `onCheckedChange` instead. */
  onValueChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
};

export type TableCheckHeadProps = Omit<TableHeadProps, "children"> & {
  checked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (
    checked: boolean,
    eventDetails?: CheckboxChangeEventDetails,
  ) => void;
  /** @deprecated Use `onCheckedChange` instead. */
  onValueChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
};

function TableRoot(inputProps: TableProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "layout",
    "ref",
  ]);

  return (
    <table
      {...elementProps}
      ref={props.ref}
      class={cn(
        "isolate w-full",
        resolveVariant(
          KUMO_TABLE_VARIANTS.layout,
          props.layout ?? KUMO_TABLE_DEFAULT_VARIANTS.layout,
          KUMO_TABLE_DEFAULT_VARIANTS.layout,
        ).classes,
        "[&_td]:border-b [&_td]:border-kumo-fill [&_tr:last-child_td]:border-b-0",
        "[&_td]:p-3",
        "[&_th]:border-b [&_th]:border-kumo-fill [&_th]:p-3 [&_th]:text-base [&_th]:font-semibold",
        "[&_th]:bg-kumo-base",
        "text-left text-base text-kumo-default",
        props.class,
        props.className,
      )}
    >
      {props.children}
    </table>
  );
}

function TableHeader(inputProps: TableHeaderProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "variant",
    "sticky",
    "ref",
  ]);
  const isCompact = () => (props.variant ?? "default") === "compact";

  return (
    <thead
      {...elementProps}
      ref={props.ref}
      class={cn(
        "group/header",
        isCompact() &&
          "text-xs text-kumo-strong [&_th]:bg-kumo-elevated [&_th]:py-2",
        props.sticky && "[&_th]:sticky [&_th]:top-0 [&_th]:z-1",
        props.class,
        props.className,
      )}
      data-compact={isCompact() ? "" : undefined}
    >
      {props.children}
    </thead>
  );
}

function TableHead(inputProps: TableHeadProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "sticky",
    "ref",
  ]);

  return (
    <th
      {...elementProps}
      ref={props.ref}
      class={cn(
        "group relative",
        props.sticky && stickyColumnClasses(props.sticky, "head"),
        props.class,
        props.className,
      )}
    >
      {props.children}
    </th>
  );
}

function TableRow(inputProps: TableRowProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "variant",
    "ref",
  ]);

  return (
    <tr
      {...elementProps}
      ref={props.ref}
      class={cn(
        resolveVariant(
          KUMO_TABLE_VARIANTS.variant,
          props.variant ?? KUMO_TABLE_DEFAULT_VARIANTS.variant,
          KUMO_TABLE_DEFAULT_VARIANTS.variant,
        ).classes,
        props.class,
        props.className,
      )}
    >
      {props.children}
    </tr>
  );
}

function TableBody(inputProps: TableBodyProps) {
  const [props, elementProps] = splitProps(inputProps, ["children", "ref"]);
  return (
    <tbody {...elementProps} ref={props.ref}>
      {props.children}
    </tbody>
  );
}

function TableCell(inputProps: TableCellProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "sticky",
    "ref",
  ]);

  return (
    <td
      {...elementProps}
      ref={props.ref}
      class={cn(
        props.sticky && stickyColumnClasses(props.sticky, "cell"),
        props.class,
        props.className,
      )}
    >
      {props.children}
    </td>
  );
}

function TableFooter(inputProps: TableFooterProps) {
  const [props, elementProps] = splitProps(inputProps, ["children", "ref"]);
  return (
    <tfoot {...elementProps} ref={props.ref}>
      {props.children}
    </tfoot>
  );
}

function TableResizeHandle(inputProps: TableResizeHandleProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "class",
    "className",
    "ref",
  ]);

  return (
    <button
      {...elementProps}
      ref={props.ref}
      type="button"
      aria-label="Resize column"
      class={cn(
        "invisible h-full group-hover:visible",
        "w-[10px]",
        "flex items-center justify-center",
        "cursor-col-resize touch-none select-none",
        "absolute top-0 right-0",
        "m-0 bg-kumo-base p-0",
        "focus-visible:ring-2 focus-visible:ring-kumo-brand",
        props.class,
        props.className,
      )}
    >
      <span class="h-5 w-[2px] rounded bg-kumo-hairline" />
    </button>
  );
}

function TableCheckCell(inputProps: TableCheckCellProps) {
  const [props, cellProps] = splitProps(inputProps, [
    "checked",
    "indeterminate",
    "onCheckedChange",
    "onValueChange",
    "label",
    "disabled",
    "class",
    "className",
    "aria-label",
  ]);

  return (
    <TableCell
      {...cellProps}
      class={cn("w-10 leading-none", props.class, props.className)}
    >
      <Checkbox
        checked={props.checked}
        indeterminate={props.indeterminate}
        onCheckedChange={(checked, eventDetails) => {
          props.onCheckedChange?.(checked, eventDetails);
          props.onValueChange?.(checked);
        }}
        aria-label={props["aria-label"] ?? props.label ?? "Select row"}
        disabled={props.disabled}
        className="relative before:absolute before:-inset-3 before:content-['']"
      />
    </TableCell>
  );
}

function TableCheckHead(inputProps: TableCheckHeadProps) {
  const [props, headProps] = splitProps(inputProps, [
    "checked",
    "indeterminate",
    "onCheckedChange",
    "onValueChange",
    "label",
    "disabled",
    "class",
    "className",
    "aria-label",
  ]);

  return (
    <TableHead
      {...headProps}
      class={cn("w-10 leading-none", props.class, props.className)}
    >
      <Checkbox
        checked={props.checked}
        indeterminate={props.indeterminate}
        onCheckedChange={(checked, eventDetails) => {
          props.onCheckedChange?.(checked, eventDetails);
          props.onValueChange?.(checked);
        }}
        aria-label={props["aria-label"] ?? props.label ?? "Select all rows"}
        disabled={props.disabled}
        className="relative before:absolute before:-inset-3 before:content-['']"
      />
    </TableHead>
  );
}

/** Semantic table with styled rows, cells, sticky columns, and selection support. */
export const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  Head: TableHead,
  Row: TableRow,
  Body: TableBody,
  Cell: TableCell,
  CheckCell: TableCheckCell,
  CheckHead: TableCheckHead,
  Footer: TableFooter,
  ResizeHandle: TableResizeHandle,
});
