import { Toast } from "@msviderok/base-ui-solid/toast";
import {
  For,
  Show,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  getOwner,
  onCleanup,
  runWithOwner,
  splitProps,
  useContext,
  type Accessor,
  type ComponentProps,
  type JSX,
} from "solid-js";
import { Dynamic, Portal } from "solid-js/web";
import {
  CheckCircleIcon,
  InfoFillIcon,
  WarningIcon,
  WarningOctagonIcon,
  XIcon,
} from "../../internal/icons";
import { cn } from "../../utils/cn";
import {
  usePortalContainerAccessor,
  type PortalContainer,
} from "../../utils/portal-provider";
import { resolveVariant } from "../../utils/resolve-variant";
import { Button, type ButtonProps } from "../button";

/**
 * Toast styling configuration for Figma plugin consumption.
 * Toast has no user-facing variants but documents the styling structure.
 */
export const KUMO_TOAST_VARIANTS = {
  root: {
    classes:
      "rounded-lg border border-kumo-fill bg-kumo-control p-4 shadow-lg text-kumo-default",
    description: "Toast container with background, border, and shadow",
  },
  title: {
    classes: "text-[0.975rem] leading-5 font-medium text-kumo-default",
    description: "Toast title with primary text color",
  },
  description: {
    classes: "text-[0.925rem] leading-5 text-kumo-subtle",
    description: "Toast description with muted text color",
  },
  close: {
    classes:
      "absolute top-2 right-2 size-5 rounded text-kumo-subtle hover:bg-current/15",
    description: "Button-based close control with variant-aware hover tint",
  },
  variant: {
    default: {
      classes: "border-kumo-fill bg-kumo-base",
      description: "Default toast style",
    },
    success: {
      classes:
        "ring-[0.3px] ring-kumo-success bg-kumo-base [&_[data-toast-icon]]:text-kumo-success [&_[data-toast-title]]:text-kumo-success",
      description: "Success toast for confirmations and positive outcomes",
      icon: CheckCircleIcon,
    },
    error: {
      classes:
        "ring-[0.3px] ring-kumo-danger bg-kumo-base [&_[data-toast-icon]]:text-kumo-danger [&_[data-toast-title]]:text-kumo-danger",
      description: "Error toast for critical issues",
      icon: WarningOctagonIcon,
    },
    warning: {
      classes:
        "ring-[0.3px] ring-kumo-warning bg-kumo-base [&_[data-toast-icon]]:text-kumo-warning [&_[data-toast-title]]:text-kumo-warning",
      description: "Warning toast for cautionary messages",
      icon: WarningIcon,
    },
    info: {
      classes:
        "ring-[0.3px] ring-kumo-info bg-kumo-control [&_[data-toast-icon]]:text-kumo-info [&_[data-toast-title]]:text-kumo-info",
      description: "Info toast for neutral informational messages",
      icon: InfoFillIcon,
    },
  },
} as const;

export const KUMO_TOAST_DEFAULT_VARIANTS = {
  variant: "default",
} as const;

/**
 * Toast styling configuration for Figma plugin consumption.
 * Provides structured metadata for generating Toast components in Figma.
 */
export const KUMO_TOAST_STYLING = {
  container: {
    width: 300,
    padding: 16,
    borderRadius: 8,
    background: "bg-kumo-base",
    border: "ring-[0.3px] ring-kumo-hairline",
    shadow: "shadow-lg",
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 500,
    color: "text-color-surface",
  },
  description: {
    fontSize: 15,
    fontWeight: 400,
    color: "text-color-muted",
  },
  closeButton: {
    size: 20,
    iconSize: 16,
    iconName: "ph-x",
    iconColor: "text-color-muted",
    hoverBackground: "color-color-2",
    hoverColor: "text-color-label",
    borderRadius: 4,
  },
} as const;

export type KumoToastVariant = keyof typeof KUMO_TOAST_VARIANTS.variant;

export interface KumoToastVariantsProps {
  variant?: KumoToastVariant;
}

export function toastVariants({
  variant = KUMO_TOAST_DEFAULT_VARIANTS.variant,
}: KumoToastVariantsProps = {}) {
  return cn(
    "rounded-xl bg-clip-padding p-4 shadow-lg ring ring-kumo-line",
    resolveVariant(
      KUMO_TOAST_VARIANTS.variant,
      variant,
      KUMO_TOAST_DEFAULT_VARIANTS.variant,
    ).classes,
  );
}

type BaseToastObject = ComponentProps<typeof Toast.Root>["toast"];

type KumoToastOptionsBase = {
  variant?: KumoToastVariant;
  content?: JSX.Element;
  actions?: Array<ButtonProps>;
  bump?: boolean;
};

export type KumoToastOptions<Data extends object = Record<string, never>> =
  Omit<BaseToastObject, "data"> &
    KumoToastOptionsBase & {
      data?: Data;
    };

export type KumoToastManagerAddOptions<
  Data extends object = Record<string, never>,
> = Omit<
  KumoToastOptions<Data>,
  "height" | "id" | "limited" | "ref" | "transitionStatus"
> & {
  id?: string;
};

export interface KumoToastPromiseOptions<
  Value,
  Data extends object = Record<string, never>,
> {
  loading: KumoToastManagerAddOptions<Data>;
  success:
    | KumoToastManagerAddOptions<Data>
    | ((value: Value) => KumoToastManagerAddOptions<Data>);
  error:
    | KumoToastManagerAddOptions<Data>
    | ((error: Error) => KumoToastManagerAddOptions<Data>);
}

type BaseToastMethods = {
  add: (options: KumoToastManagerAddOptions<any>) => string;
  close: (id: string) => void;
  update: (
    id: string,
    options: Partial<KumoToastManagerAddOptions<any>>,
  ) => void;
  promise: (
    promise: Promise<any>,
    options: KumoToastPromiseOptions<any, any>,
  ) => Promise<any>;
  toasts?:
    | Accessor<Array<KumoToastOptions<any>>>
    | Array<KumoToastOptions<any>>;
};

const TOAST_LAYOUT_SETTLE_MS = 100;
const toastLayoutDeadlines = new WeakMap<
  BaseToastMethods["add"],
  Map<string, number>
>();

export type KumoToastManager = ReturnType<typeof createKumoToastManager>;

function layoutDeadlines(manager: BaseToastMethods) {
  let deadlines = toastLayoutDeadlines.get(manager.add);
  if (!deadlines) {
    deadlines = new Map();
    toastLayoutDeadlines.set(manager.add, deadlines);
  }
  return deadlines;
}

function markLayoutUnstable(manager: BaseToastMethods, id: string) {
  layoutDeadlines(manager).set(id, Date.now() + TOAST_LAYOUT_SETTLE_MS);
}

function closeWithStableTransition(
  manager: BaseToastMethods,
  close: (id: string) => void,
  id: string,
) {
  const deadlines = layoutDeadlines(manager);
  const deadline = deadlines.get(id) ?? 0;
  deadlines.delete(id);

  if (Date.now() > deadline) {
    close(id);
    return;
  }

  const globals = globalThis as typeof globalThis & {
    BASE_UI_ANIMATIONS_DISABLED?: boolean;
  };
  const previous = globals.BASE_UI_ANIMATIONS_DISABLED;
  globals.BASE_UI_ANIMATIONS_DISABLED = true;
  try {
    close(id);
  } finally {
    if (previous === undefined) {
      delete globals.BASE_UI_ANIMATIONS_DISABLED;
    } else {
      globals.BASE_UI_ANIMATIONS_DISABLED = previous;
    }
  }
}

function managerToasts(
  manager: BaseToastMethods,
): Array<KumoToastOptions<any>> | undefined {
  const value = manager.toasts;
  return typeof value === "function" ? value() : value;
}

function onNextFrame(callback: () => void) {
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(callback);
    return;
  }
  queueMicrotask(callback);
}

function withoutId(
  options: KumoToastManagerAddOptions<any>,
): Partial<KumoToastManagerAddOptions<any>> {
  const { id: _id, ...updates } = options;
  return updates;
}

function wrapManagerMethods<T extends BaseToastMethods>(
  manager: T,
  owner?: ReturnType<typeof getOwner>,
) {
  const rawAdd = manager.add.bind(manager);
  const rawClose = manager.close.bind(manager);
  const rawUpdate = manager.update.bind(manager);
  const rawPromise = manager.promise.bind(manager);
  const execute = <Value,>(callback: () => Value): Value =>
    owner ? (runWithOwner(owner, callback) as Value) : callback();

  return {
    ...manager,

    add<Data extends object>(options: KumoToastManagerAddOptions<Data>) {
      if (options.id) {
        const existingToast = managerToasts(manager)?.find(
          (toast) => toast.id === options.id,
        );

        if (existingToast?.transitionStatus === "ending") {
          return options.id;
        }

        if (existingToast) {
          markLayoutUnstable(manager, options.id);
          execute(() =>
            rawUpdate(options.id!, {
              ...withoutId(options),
              bump: false,
            }),
          );
          onNextFrame(() => {
            execute(() =>
              rawUpdate(options.id!, {
                bump: true,
                ...(options.timeout !== undefined
                  ? { timeout: options.timeout }
                  : undefined),
              }),
            );
          });
          return options.id;
        }
      }

      const id = execute(() => rawAdd(options));
      markLayoutUnstable(manager, id);
      return id;
    },

    close(id: string) {
      closeWithStableTransition(
        manager,
        (toastId) => execute(() => rawClose(toastId)),
        id,
      );
    },

    update<Data extends object>(
      id: string,
      options: Partial<KumoToastManagerAddOptions<Data>>,
    ) {
      execute(() => rawUpdate(id, options));
      markLayoutUnstable(manager, id);
    },

    promise<Value, Data extends object>(
      promise: Promise<Value>,
      options: KumoToastPromiseOptions<Value, Data>,
    ) {
      const success = options.success;
      const error = options.error;
      return execute(
        () =>
          rawPromise(promise, {
            loading: { ...options.loading },
            success:
              typeof success === "function"
                ? (value: Value) => ({ ...success(value) })
                : { ...success },
            error:
              typeof error === "function"
                ? (reason: Error) => ({ ...error(reason) })
                : { ...error },
          }) as Promise<Value>,
      );
    },
  };
}

export function useKumoToastManager() {
  const manager = Toast.useToastManager();
  const wrapped = wrapManagerMethods(
    manager as unknown as BaseToastMethods,
    getOwner(),
  );

  return {
    ...wrapped,
    get toasts() {
      return manager.toasts() as Array<KumoToastOptions<any>>;
    },
  };
}

export function createKumoToastManager() {
  return wrapManagerMethods(
    Toast.createToastManager() as unknown as BaseToastMethods &
      ReturnType<typeof Toast.createToastManager>,
  );
}

export interface ToastyProps extends KumoToastVariantsProps {
  /** Application content. Toasts render via a portal above this. */
  children: JSX.Element;
  /**
   * Container element for the portal. Overrides KumoPortalProvider context.
   * @default document.body
   */
  container?: PortalContainer;
  /**
   * Optional manager created by createKumoToastManager for dispatching
   * notifications from outside the Solid owner tree.
   */
  toastManager?: KumoToastManager;
}

type ToastManagerEvent = {
  action: "add" | "close" | "promise" | "update";
  options: Record<string, any>;
};

function ExternalToastManagerBridge(props: {
  toastManager: KumoToastManager | undefined;
}) {
  const manager = useKumoToastManager();

  createEffect(() => {
    const externalManager = props.toastManager;
    if (!externalManager) return;

    const unsubscribe = externalManager[" subscribe"](
      ({ action, options }: ToastManagerEvent) => {
        const id = options.id as string | undefined;

        if (action === "close" && id) {
          manager.close(id);
          return;
        }

        if (action === "update" && id) {
          manager.update(id, options);
          return;
        }

        if (action === "promise" && options.promise) {
          const handledPromise = manager.promise(options.promise, {
            loading: options.loading,
            success: options.success,
            error: options.error,
          });
          options.setPromise?.(handledPromise);
          return;
        }

        manager.add(options);
      },
    );
    onCleanup(unsubscribe);
  });

  return null;
}

const ToastExpandedContext = createContext<Accessor<boolean>>(() => false);

function ToastViewportRender(
  renderProps: JSX.HTMLAttributes<HTMLDivElement>,
  state: { expanded: boolean },
) {
  return (
    <ToastExpandedContext.Provider value={() => state.expanded}>
      <div {...renderProps} />
    </ToastExpandedContext.Provider>
  );
}

/**
 * Toast notification provider and fixed bottom-right viewport.
 */
export function Toasty(inputProps: ToastyProps) {
  const [props, providerProps] = splitProps(inputProps, [
    "children",
    "container",
    "toastManager",
    "variant",
  ]);
  const contextContainer = usePortalContainerAccessor();
  const container = () => props.container ?? contextContainer() ?? undefined;

  return (
    <Toast.Provider {...providerProps}>
      <ExternalToastManagerBridge toastManager={props.toastManager} />
      {props.children}
      <Portal mount={container()}>
        <Toast.Viewport
          data-kumo-component="Toasty"
          data-kumo-part="viewport"
          class="fixed top-auto right-4 bottom-4 z-1 mx-auto flex w-[calc(100%-2rem)] sm:right-8 sm:bottom-8 sm:w-[340px]"
          render={ToastViewportRender}
        >
          <ToastList />
        </Toast.Viewport>
      </Portal>
    </Toast.Provider>
  );
}

/** Alias for Toasty. */
export const ToastProvider = Toasty;

const TOAST_CLOSE_CLASSES: Partial<Record<KumoToastVariant, string>> = {
  success: "text-kumo-success",
  error: "text-kumo-danger",
  warning: "text-kumo-warning",
  info: "text-kumo-info",
};

const TOAST_BACKGROUND_CLASSES: Partial<Record<KumoToastVariant, string>> = {
  success: "bg-kumo-success-tint/20",
  error: "bg-kumo-danger-tint/50",
  warning: "bg-kumo-warning-tint/50",
  info: "bg-kumo-info-tint/50",
};

function ToastBackground(props: { variant?: KumoToastVariant }) {
  return (
    <div
      aria-hidden="true"
      data-toast-background
      class={cn(
        "absolute inset-0 rounded-[11px] bg-kumo-base/90",
        props.variant && TOAST_BACKGROUND_CLASSES[props.variant],
      )}
    />
  );
}

function ToastIcon(props: { variant?: KumoToastVariant }) {
  const config = () =>
    props.variant && props.variant !== "default"
      ? resolveVariant(
          KUMO_TOAST_VARIANTS.variant,
          props.variant,
          KUMO_TOAST_DEFAULT_VARIANTS.variant,
        )
      : undefined;
  const icon = () => {
    const value = config();
    return value && "icon" in value ? value.icon : undefined;
  };

  return (
    <Show when={icon()}>
      {(Icon) => (
        <Dynamic
          component={Icon()}
          data-toast-icon
          class="mt-0.5 h-4 w-4 shrink-0"
        />
      )}
    </Show>
  );
}

function ToastDefaultContent(props: { toast: KumoToastOptions<any> }) {
  return (
    <div class="flex items-start gap-2">
      <ToastIcon variant={props.toast.variant} />
      <div class="flex flex-col gap-1 overflow-hidden">
        <Toast.Title
          data-toast-title
          class="text-[0.975rem] leading-5 font-medium text-kumo-default"
        />
        <Toast.Description class="text-[0.925rem] leading-5 text-kumo-default/70" />

        <Show when={props.toast.actions}>
          {(actions) => (
            <div class="mt-2 flex min-w-0 flex-nowrap gap-2 overflow-x-auto p-px">
              <For each={actions()}>
                {(actionProps) => <Button {...actionProps} />}
              </For>
            </div>
          )}
        </Show>
      </div>
    </div>
  );
}

function ToastList() {
  const manager = useKumoToastManager();
  const expanded = useContext(ToastExpandedContext);
  const toasts = createMemo(() => {
    const ids = new Set<string>();
    return manager.toasts.filter((toast) => {
      if (ids.has(toast.id)) return false;
      ids.add(toast.id);
      return true;
    });
  });
  const [measuredFrontmostHeight, setMeasuredFrontmostHeight] =
    createSignal<number>();
  createEffect(() => {
    const height = toasts()[0]?.height;
    if (height) setMeasuredFrontmostHeight(height);
  });

  return (
    <For each={toasts()}>
      {(toast, index) => {
        const [measuredHeight, setMeasuredHeight] = createSignal(toast.height);
        createEffect(() => {
          if (toast.height) setMeasuredHeight(toast.height);
        });

        return (
          <Toast.Root
            toast={toast}
            data-kumo-component="Toasty"
            data-kumo-part="root"
            data-toast-id={toast.id}
            class={cn(
              "absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] mr-0 h-[var(--height)] w-full origin-bottom select-none",
              toastVariants({ variant: toast.variant }),
              "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
              "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]",
              "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
              "data-[ending-style]:opacity-0 data-[expanded]:h-[var(--toast-height)] data-[expanded]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))] data-[limited]:opacity-0 data-[starting-style]:[transform:translateY(150%)]",
              "data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-[expanded]:data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
              "data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-[expanded]:data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
              "data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-[expanded]:data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
              "data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] data-[expanded]:data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
              "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
              toast.bump && "animate-toast-bump",
            )}
            style={
              {
                "--toast-height": measuredHeight()
                  ? `${measuredHeight()}px`
                  : "auto",
                "--toast-frontmost-height": measuredFrontmostHeight()
                  ? `${measuredFrontmostHeight()}px`
                  : "auto",
              } as JSX.CSSProperties
            }
          >
            <ToastBackground variant={toast.variant} />
            <div
              data-toast-content
              data-behind={index() > 0 ? "" : undefined}
              data-expanded={expanded() ? "" : undefined}
              class="isolate flex flex-col gap-1 transition-opacity [transition-duration:250ms] data-[behind]:pointer-events-none data-[behind]:opacity-0 data-[expanded]:pointer-events-auto data-[expanded]:opacity-100"
            >
              <Show
                when={toast.content !== undefined}
                fallback={<ToastDefaultContent toast={toast} />}
              >
                {toast.content}
              </Show>
              <Button
                data-kumo-part="close"
                aria-label="Close"
                variant="ghost"
                size="sm"
                shape="square"
                className={cn(
                  "absolute top-2 right-2 size-5 rounded text-kumo-subtle hover:bg-current/15",
                  toast.variant && TOAST_CLOSE_CLASSES[toast.variant],
                )}
                icon={<XIcon class="h-3 w-3" />}
                onClick={() => manager.close(toast.id)}
              />
            </div>
          </Toast.Root>
        );
      }}
    </For>
  );
}

export { Toast };
