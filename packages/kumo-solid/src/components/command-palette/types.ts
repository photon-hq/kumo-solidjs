import type { JSX, Ref } from "solid-js";
import type {
  SearchChangeDetails,
  SearchInputProps,
} from "../../internal/search-control";
import type { PortalContainer } from "../../utils/portal-provider";

/** A single inclusive highlight range: [startIndex, endIndex]. */
export type HighlightRange = [number, number];

export interface CommandPaletteRootProps<Group, Item = Group> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackdropClick?: (event: MouseEvent) => void;
  children?: JSX.Element;
  items: readonly Group[];
  value?: string;
  onValueChange?: (value: string) => void;
  onItemHighlighted?: (
    item: Group | undefined,
    details: { reason: string; event: Event; index: number },
  ) => void;
  itemToStringValue?: (item: Group) => string;
  filter?: (item: Group, query: string) => boolean;
  onSelect?: (item: Item, options: { newTab: boolean }) => void;
  getSelectableItems?: (items: readonly Group[]) => Item[];
  container?: PortalContainer;
}

export interface CommandPalettePanelProps<Group, Item = Group> {
  children?: JSX.Element;
  items: readonly Group[];
  value?: string;
  onValueChange?: (value: string) => void;
  onItemHighlighted?: (
    item: Group | undefined,
    details: { reason: string; event: Event; index: number },
  ) => void;
  itemToStringValue?: (item: Group) => string;
  filter?: (item: Group, query: string) => boolean;
  open?: boolean;
  class?: string;
  className?: string;
  onSelect?: (item: Item, options: { newTab: boolean }) => void;
  getSelectableItems?: (items: readonly Group[]) => Item[];
}

export interface CommandPaletteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackdropClick?: (event: MouseEvent) => void;
  children?: JSX.Element;
  container?: PortalContainer;
}

export interface CommandPaletteItemProps<Item = unknown> extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children" | "class" | "onClick" | "onPointerMove" | "ref"
> {
  value: Item;
  disabled?: boolean;
  children?: JSX.Element;
  class?: string;
  className?: string;
  onClick?: (event: MouseEvent & { currentTarget: HTMLDivElement }) => void;
}

export interface CommandPaletteFooterProps {
  children?: JSX.Element;
}

export interface CommandPaletteListProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children" | "class" | "ref"
> {
  children?: JSX.Element;
  class?: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export interface CommandPaletteGroupProps<Item = unknown> {
  children?: JSX.Element;
  items?: readonly Item[];
  class?: string;
  className?: string;
}

export interface CommandPaletteGroupLabelProps {
  children?: JSX.Element;
  class?: string;
  className?: string;
}

export interface CommandPaletteEmptyProps {
  children?: JSX.Element;
}

export interface CommandPaletteLoadingProps {
  children?: JSX.Element;
}

export interface CommandPaletteResultItemProps<Item = unknown> {
  title: string;
  breadcrumbs?: readonly string[];
  titleHighlights?: readonly HighlightRange[];
  breadcrumbHighlights?: readonly (readonly HighlightRange[])[];
  description?: string;
  icon?: JSX.Element;
  value: Item;
  onClick: (event: MouseEvent & { currentTarget: HTMLDivElement }) => void;
  showArrow?: boolean;
  external?: boolean;
  nonInteractive?: boolean;
}

export interface CommandPaletteInputProps extends Omit<
  SearchInputProps,
  "class"
> {
  autoFocus?: boolean;
  class?: string;
  className?: string;
  leading?: JSX.Element;
  trailing?: JSX.Element;
}

export type CommandPaletteChangeDetails = SearchChangeDetails;
