import {
  For,
  Show,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  splitProps,
  useContext,
  type Accessor,
  type JSX,
} from "solid-js";
import {
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "../../internal/icons";
import { cn } from "../../utils/cn";
import { resolveVariant } from "../../utils/resolve-variant";
import { InputGroup } from "../input-group";
import { Select } from "../select";

const DEFAULT_PAGE_SIZE_OPTIONS = [25, 50, 100, 250] as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export interface PaginationLabels {
  navigation?: string;
  firstPage?: string;
  previousPage?: string;
  nextPage?: string;
  lastPage?: string;
  pageNumber?: string;
  pageSize?: string;
}

const DEFAULT_LABELS: Required<PaginationLabels> = {
  navigation: "Pagination",
  firstPage: "First page",
  previousPage: "Previous page",
  nextPage: "Next page",
  lastPage: "Last page",
  pageNumber: "Page number",
  pageSize: "Page size",
};

export const KUMO_PAGINATION_VARIANTS = {
  controls: {
    full: {
      classes: "",
      description:
        "Full pagination controls with first, previous, page input, next, and last buttons",
    },
    simple: {
      classes: "",
      description:
        "Simple pagination controls with only previous and next buttons",
    },
  },
} as const;

export type KumoPaginationControls =
  keyof typeof KUMO_PAGINATION_VARIANTS.controls;

export const KUMO_PAGINATION_DEFAULT_VARIANTS = {
  controls: "full",
} as const;

export interface KumoPaginationVariantsProps {
  controls?: KumoPaginationControls;
}

export function paginationVariants({
  controls = KUMO_PAGINATION_DEFAULT_VARIANTS.controls,
}: KumoPaginationVariantsProps = {}) {
  return cn(
    "flex items-center justify-between gap-2",
    resolveVariant(
      KUMO_PAGINATION_VARIANTS.controls,
      controls,
      KUMO_PAGINATION_DEFAULT_VARIANTS.controls,
    ).classes,
  );
}

interface PaginationContextValue {
  page: Accessor<number>;
  perPage: Accessor<number | undefined>;
  totalCount: Accessor<number | undefined>;
  maxPage: Accessor<number>;
  pageShowingRange: Accessor<string>;
  setPage: (page: number) => void;
  editingPage: Accessor<number>;
  setEditingPage: (page: number) => void;
  labels: Accessor<Required<PaginationLabels>>;
}

const PaginationContext = createContext<PaginationContextValue>();

function usePaginationContext() {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error(
      "Pagination compound components must be used within a Pagination component",
    );
  }
  return context;
}

export interface PaginationInfoRenderProps {
  page: number;
  perPage?: number;
  totalCount?: number;
  pageShowingRange: string;
}

export interface PaginationInfoProps {
  children?: (props: PaginationInfoRenderProps) => JSX.Element;
  class?: string;
  className?: string;
}

export function PaginationInfo(inputProps: PaginationInfoProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
  ]);
  const context = usePaginationContext();
  const content = () => {
    if (props.children) {
      return props.children({
        page: context.page(),
        perPage: context.perPage(),
        totalCount: context.totalCount(),
        pageShowingRange: context.pageShowingRange(),
      });
    }

    const totalCount = context.totalCount();
    return totalCount && totalCount > 0 ? (
      <>
        Showing <span class="tabular-nums">{context.pageShowingRange()}</span>{" "}
        of <span class="tabular-nums">{totalCount}</span>
      </>
    ) : null;
  };

  return (
    <div
      {...elementProps}
      data-slot="pagination-info"
      class={cn("text-sm text-kumo-subtle", props.class, props.className)}
    >
      {content()}
    </div>
  );
}

export interface PaginationPageSizeProps {
  value: number;
  onChange: (size: number) => void;
  options?: number[];
  label?: JSX.Element;
  class?: string;
  className?: string;
}

export function PaginationPageSize(inputProps: PaginationPageSizeProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "value",
    "onChange",
    "options",
    "label",
    "class",
    "className",
  ]);
  const context = usePaginationContext();
  const options = () =>
    props.options ?? (DEFAULT_PAGE_SIZE_OPTIONS as unknown as number[]);
  const label = () => (props.label === undefined ? "Per page:" : props.label);

  return (
    <div
      {...elementProps}
      data-slot="pagination-page-size"
      class={cn("flex items-center gap-2", props.class, props.className)}
    >
      <Show when={label()}>
        <span class="text-sm text-kumo-subtle">{label()}</span>
      </Show>
      <Select<number>
        aria-label={context.labels().pageSize}
        value={props.value}
        onValueChange={(value) => props.onChange(value)}
      >
        <For each={options()}>
          {(size) => <Select.Option value={size}>{size}</Select.Option>}
        </For>
      </Select>
    </div>
  );
}

export interface PaginationControlsProps extends KumoPaginationVariantsProps {
  pageSelector?: "input" | "dropdown";
  class?: string;
  className?: string;
}

export function PaginationControls(inputProps: PaginationControlsProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "controls",
    "pageSelector",
    "class",
    "className",
  ]);
  const context = usePaginationContext();
  const controls = () =>
    props.controls ?? KUMO_PAGINATION_DEFAULT_VARIANTS.controls;
  const pageSelector = () => props.pageSelector ?? "input";
  const goToPage = (page: number) => {
    context.setPage(page);
    context.setEditingPage(page);
  };
  const commitEditingPage = () => {
    const page = clamp(context.editingPage(), 1, context.maxPage());
    goToPage(page);
  };

  return (
    <div
      {...elementProps}
      data-slot="pagination-controls"
      class={cn("flex grow flex-col items-end", props.class, props.className)}
    >
      <nav aria-label={context.labels().navigation}>
        <InputGroup>
          <Show when={controls() === "full"}>
            <InputGroup.Button
              variant="secondary"
              aria-label={context.labels().firstPage}
              disabled={context.page() <= 1}
              onClick={() => goToPage(1)}
            >
              <CaretDoubleLeftIcon size={16} />
            </InputGroup.Button>
          </Show>
          <InputGroup.Button
            variant="secondary"
            aria-label={context.labels().previousPage}
            disabled={context.page() <= 1}
            onClick={() => goToPage(Math.max(context.page() - 1, 1))}
          >
            <CaretLeftIcon size={16} />
          </InputGroup.Button>
          <Show when={controls() === "full"}>
            <Show
              when={pageSelector() === "dropdown"}
              fallback={
                <InputGroup.Input
                  style={{ width: "50px" }}
                  className="text-center"
                  aria-label={context.labels().pageNumber}
                  value={context.editingPage()}
                  onValueChange={(value) => {
                    context.setEditingPage(Number(value));
                  }}
                  onBlur={commitEditingPage}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") commitEditingPage();
                  }}
                  autocomplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                  data-form-type="other"
                />
              }
            >
              <Select<number>
                aria-label={context.labels().pageNumber}
                className="rounded-none ring-kumo-hairline"
                value={context.page()}
                onValueChange={goToPage}
              >
                <For
                  each={Array.from(
                    { length: context.maxPage() },
                    (_, index) => index + 1,
                  )}
                >
                  {(page) => <Select.Option value={page}>{page}</Select.Option>}
                </For>
              </Select>
            </Show>
          </Show>
          <InputGroup.Button
            variant="secondary"
            aria-label={context.labels().nextPage}
            disabled={context.page() === context.maxPage()}
            onClick={() =>
              goToPage(Math.min(context.page() + 1, context.maxPage()))
            }
          >
            <CaretRightIcon size={16} />
          </InputGroup.Button>
          <Show when={controls() === "full"}>
            <InputGroup.Button
              variant="secondary"
              aria-label={context.labels().lastPage}
              disabled={context.page() === context.maxPage()}
              onClick={() => goToPage(context.maxPage())}
            >
              <CaretDoubleRightIcon size={16} />
            </InputGroup.Button>
          </Show>
        </InputGroup>
      </nav>
    </div>
  );
}

export interface PaginationSeparatorProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "className"
> {
  class?: string;
  className?: string;
}

export function PaginationSeparator(inputProps: PaginationSeparatorProps) {
  const [props, elementProps] = splitProps(inputProps, ["class", "className"]);
  return (
    <div
      {...elementProps}
      data-slot="pagination-separator"
      class={cn(
        "mx-2 h-6 border-l border-kumo-hairline",
        props.class,
        props.className,
      )}
    />
  );
}

interface PaginationBaseProps {
  setPage: (page: number) => void;
  page?: number;
  perPage?: number;
  totalCount?: number;
  class?: string;
  className?: string;
  labels?: PaginationLabels;
}

export interface PaginationCompoundProps extends PaginationBaseProps {
  children: JSX.Element;
  controls?: never;
  text?: never;
}

export interface PaginationLegacyProps
  extends PaginationBaseProps, KumoPaginationVariantsProps {
  children?: never;
  text?: (props: {
    page?: number;
    perPage?: number;
    totalCount?: number;
    pageShowingRange: string;
  }) => JSX.Element;
}

export type PaginationProps = PaginationCompoundProps | PaginationLegacyProps;

function PaginationRoot(inputProps: PaginationProps) {
  const hasCompoundChildren = Object.prototype.hasOwnProperty.call(
    inputProps,
    "children",
  );
  const props = inputProps;
  const page = () => props.page ?? 1;
  const perPage = () => props.perPage;
  const totalCount = () => props.totalCount;
  const [editingPage, setEditingPage] = createSignal(page());
  const labels = createMemo<Required<PaginationLabels>>(() => ({
    ...DEFAULT_LABELS,
    ...props.labels,
  }));
  const pageShowingRange = createMemo(() => {
    let lower = page() * (perPage() ?? 1) - (perPage() ?? 0) + 1;
    let upper = Math.min(page() * (perPage() ?? 0), totalCount() ?? 0);

    if (Number.isNaN(lower)) lower = 0;
    if (Number.isNaN(upper)) upper = 0;
    return `${lower}-${upper}`;
  });
  const maxPage = createMemo(() =>
    Math.ceil((totalCount() ?? 1) / (perPage() ?? 1)),
  );

  createEffect(() => {
    setEditingPage(page());
  });

  const context: PaginationContextValue = {
    page,
    perPage,
    totalCount,
    maxPage,
    pageShowingRange,
    setPage: (nextPage) => props.setPage(nextPage),
    editingPage,
    setEditingPage,
    labels,
  };
  const controls = () =>
    "controls" in props
      ? (props.controls ?? KUMO_PAGINATION_DEFAULT_VARIANTS.controls)
      : KUMO_PAGINATION_DEFAULT_VARIANTS.controls;
  const text = () => ("text" in props ? props.text : undefined);
  const legacyText = () => {
    const renderText = text();
    if (renderText) {
      return renderText({
        page: page(),
        perPage: perPage(),
        totalCount: totalCount(),
        pageShowingRange: pageShowingRange(),
      });
    }
    const count = totalCount();
    return count && count > 0 ? (
      <>
        Showing <span class="tabular-nums">{pageShowingRange()}</span> of{" "}
        <span class="tabular-nums">{count}</span>
      </>
    ) : null;
  };

  return (
    <PaginationContext.Provider value={context}>
      <div
        data-slot="pagination"
        class={cn(
          "flex w-full items-center gap-2",
          props.class,
          props.className,
        )}
      >
        <Show
          when={hasCompoundChildren}
          fallback={
            <>
              <div
                aria-live="polite"
                aria-atomic="true"
                data-slot="pagination-info"
                class="grow text-sm text-kumo-subtle"
              >
                {legacyText()}
              </div>
              <PaginationControls controls={controls()} />
            </>
          }
        >
          {props.children}
        </Show>
      </div>
    </PaginationContext.Provider>
  );
}

type PaginationComponent = typeof PaginationRoot & {
  Controls: typeof PaginationControls;
  Info: typeof PaginationInfo;
  PageSize: typeof PaginationPageSize;
  Separator: typeof PaginationSeparator;
};

export const Pagination = Object.assign(PaginationRoot, {
  Controls: PaginationControls,
  Info: PaginationInfo,
  PageSize: PaginationPageSize,
  Separator: PaginationSeparator,
}) as PaginationComponent;
