import { mergeProps as mergeBaseUIProps } from "@msviderok/base-ui-solid/merge-props";
import { Toolbar as ToolbarBase } from "@msviderok/base-ui-solid/toolbar";
import {
  children,
  createContext,
  splitProps,
  untrack,
  useContext,
  type Accessor,
  type Component,
  type ComponentProps,
  type JSX,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "../../utils/cn";
import { buttonVariants, type ButtonProps } from "../button";
import { Input as KumoInput, type InputProps } from "../input";
import {
  InputGroup,
  type InputGroupRootProps,
} from "../input-group/input-group";
import { InputGroupToolbarContext } from "../input-group/context";
import { Loader } from "../loader";
import { Tooltip } from "../tooltip";

export const KUMO_TOOLBAR_VARIANTS = {
  size: {
    xs: {
      classes: "text-xs",
      description: "Extra small toolbar for compact UIs",
    },
    sm: {
      classes: "text-xs",
      description: "Small toolbar for secondary controls",
    },
    base: {
      classes: "text-base",
      description: "Default toolbar size",
    },
    lg: {
      classes: "text-base",
      description: "Large toolbar for prominent controls",
    },
  },
} as const;

export const KUMO_TOOLBAR_DEFAULT_VARIANTS = {
  size: "base",
} as const;

export type ToolbarSize = keyof typeof KUMO_TOOLBAR_VARIANTS.size;

type BaseToolbarRootProps = ComponentProps<typeof ToolbarBase.Root>;

export interface ToolbarProps extends Omit<
  BaseToolbarRootProps,
  "children" | "class" | "className" | "loop"
> {
  /** Toolbar controls rendered as one grouped card. */
  children: JSX.Element;
  class?: string;
  className?: string;
  /** Whether keyboard navigation wraps at either end. */
  loopFocus?: boolean;
  /** Locks every toolbar item to this size. */
  size?: ToolbarSize;
}

export type ToolbarButtonProps = Omit<ButtonProps, "size" | "variant"> &
  Pick<ComponentProps<typeof ToolbarBase.Button>, "focusableWhenDisabled">;

export type ToolbarInputProps = Omit<
  InputProps,
  | "size"
  | "variant"
  | "label"
  | "labelTooltip"
  | "description"
  | "error"
  | "passwordManagerIgnore"
>;

export type ToolbarInputGroupProps = Omit<InputGroupRootProps, "size">;

const ToolbarSizeContext = createContext<{
  readonly disabled: Accessor<boolean>;
  readonly size: Accessor<ToolbarSize>;
}>({
  disabled: () => false,
  size: () => KUMO_TOOLBAR_DEFAULT_VARIANTS.size,
});

function hasRenderableChildren(value: JSX.Element) {
  if (value == null || value === false) return false;
  return !Array.isArray(value) || value.length > 0;
}

interface ToolbarButtonControlOptions {
  children: Accessor<JSX.Element>;
  className: Accessor<string | undefined>;
  disabled: Accessor<boolean | undefined>;
  focusableWhenDisabled: Accessor<boolean | undefined>;
  icon: Accessor<ButtonProps["icon"]>;
  loading: Accessor<boolean | undefined>;
  shape: Accessor<ButtonProps["shape"]>;
  size: Accessor<ToolbarSize>;
  style: Accessor<ButtonProps["style"]>;
  title: Accessor<ButtonProps["title"]>;
  toolbarDisabled: Accessor<boolean>;
}

type ToolbarButtonControlProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  kumoOptions: ToolbarButtonControlOptions;
};

function ToolbarButtonControl(inputProps: ToolbarButtonControlProps) {
  const [props, nativeProps] = splitProps(inputProps, ["kumoOptions"]);
  const options = props.kumoOptions;
  const disabled = () =>
    Boolean(
      options.toolbarDisabled() || options.loading() || options.disabled(),
    );
  const shape = () =>
    options.shape() ??
    (!hasRenderableChildren(options.children()) && options.icon()
      ? "square"
      : "base");
  const titleLabel = () => {
    const title = options.title();
    if (typeof title === "string") return title;
    if (typeof title === "number") return String(title);
    return undefined;
  };
  const ariaLabel = () =>
    nativeProps["aria-label"] ??
    (!hasRenderableChildren(options.children()) &&
    !nativeProps["aria-labelledby"] &&
    titleLabel()
      ? titleLabel()
      : undefined);
  const renderIcon = () => {
    const icon = options.icon();
    if (typeof icon === "function") {
      return <Dynamic component={icon as Component} />;
    }
    return icon;
  };
  const renderButton = (
    triggerProps?: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  ) => {
    const elementProps = mergeBaseUIProps<"button">([
      nativeProps,
      triggerProps,
    ]);

    return (
      <button
        {...(elementProps as unknown as JSX.ButtonHTMLAttributes<HTMLButtonElement>)}
        aria-disabled={disabled() ? true : nativeProps["aria-disabled"]}
        aria-label={ariaLabel()}
        class={cn(
          buttonVariants({
            shape: shape(),
            size: options.size(),
            variant: "ghost",
          }),
          options.disabled() && "cursor-not-allowed opacity-50",
          toolbarControlClassName(options.className()),
        )}
        data-disabled={disabled() ? "" : undefined}
        disabled={Boolean(
          options.loading() ||
          options.disabled() ||
          (options.toolbarDisabled() &&
            options.focusableWhenDisabled() === false),
        )}
        style={options.style()}
      >
        {options.loading() ? (
          <Loader size={options.size() === "lg" ? 16 : 14} />
        ) : (
          renderIcon()
        )}
        {hasRenderableChildren(options.children()) ? (
          <span class="contents">{options.children()}</span>
        ) : null}
      </button>
    );
  };

  return (
    <>
      {options.title() ? (
        options.disabled() || options.loading() ? (
          <Tooltip
            content={options.title()}
            render={(triggerProps) => (
              <span
                {...mergeBaseUIProps([{ class: "inline-flex" }, triggerProps])}
              >
                {renderButton()}
              </span>
            )}
          />
        ) : (
          <Tooltip
            content={options.title()}
            render={(triggerProps) =>
              renderButton(
                triggerProps as JSX.ButtonHTMLAttributes<HTMLButtonElement>,
              )
            }
          />
        )
      ) : (
        untrack(() => renderButton())
      )}
    </>
  );
}

function toolbarControlClassName(className?: string) {
  return cn(
    "relative min-w-0 border-0 bg-transparent shadow-none ring-0 focus-within:z-2 focus:z-2 focus-visible:z-2",
    "rounded-none first:rounded-l-lg last:rounded-r-lg only:rounded-lg",
    "not-first:border-l not-first:border-kumo-line",
    "focus:ring-[1.5px] focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand",
    className,
  );
}

/** Groups toolbar controls into one compact card with shared sizing. */
function Root(inputProps: ToolbarProps) {
  const [props, rootProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
    "disabled",
    "loopFocus",
    "size",
  ]);
  const size = () => props.size ?? KUMO_TOOLBAR_DEFAULT_VARIANTS.size;
  const contextValue = {
    disabled: () => props.disabled ?? false,
    size,
  };

  return (
    <ToolbarBase.Root
      {...rootProps}
      disabled={props.disabled}
      loop={props.loopFocus}
      data-kumo-component="Toolbar"
      class={cn(
        "inline-flex w-fit items-stretch rounded-lg bg-kumo-control shadow-xs ring ring-kumo-line",
        KUMO_TOOLBAR_VARIANTS.size[size()].classes,
        props.class,
        props.className,
      )}
    >
      <ToolbarSizeContext.Provider value={contextValue}>
        {props.children}
      </ToolbarSizeContext.Provider>
    </ToolbarBase.Root>
  );
}

function Button(inputProps: ToolbarButtonProps) {
  const [props, buttonProps] = splitProps(inputProps, [
    "children",
    "className",
    "disabled",
    "focusableWhenDisabled",
    "icon",
    "loading",
    "shape",
    "style",
    "title",
    "type",
  ]);
  const toolbar = useContext(ToolbarSizeContext);
  const resolvedChildren = children(() => props.children);
  const controlOptions: ToolbarButtonControlOptions = {
    children: () => resolvedChildren(),
    className: () => props.className,
    disabled: () => props.disabled,
    focusableWhenDisabled: () => props.focusableWhenDisabled,
    icon: () => props.icon,
    loading: () => props.loading,
    shape: () => props.shape,
    size: toolbar.size,
    style: () => props.style,
    title: () => props.title,
    toolbarDisabled: toolbar.disabled,
  };
  const buttonRender = {
    component: ToolbarButtonControl,
    kumoOptions: controlOptions,
  };

  return (
    <ToolbarBase.Button
      {...buttonProps}
      data-kumo-component="Toolbar.Button"
      disabled={Boolean(props.loading || props.disabled)}
      focusableWhenDisabled={props.focusableWhenDisabled}
      type={props.type ?? "button"}
      render={
        buttonRender as ComponentProps<typeof ToolbarBase.Button>["render"]
      }
    />
  );
}

function Input(inputProps: ToolbarInputProps) {
  const [props, inputElementProps] = splitProps(inputProps, [
    "class",
    "className",
    "style",
  ]);
  const toolbar = useContext(ToolbarSizeContext);
  const inputRender = {
    component: KumoInput,
    get className() {
      return toolbarControlClassName(cn(props.class, props.className));
    },
    get size() {
      return toolbar.size();
    },
    get style() {
      return props.style;
    },
  };

  return (
    <ToolbarBase.Input
      {...inputElementProps}
      data-kumo-component="Toolbar.Input"
      render={inputRender as ComponentProps<typeof ToolbarBase.Input>["render"]}
    />
  );
}

function InputGroupRoot(inputProps: ToolbarInputGroupProps) {
  const [props, inputGroupProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
  ]);
  const toolbar = useContext(ToolbarSizeContext);
  const toolbarInputContext = {
    get ariaLabel() {
      return inputGroupProps["aria-label"];
    },
    get ariaLabelledBy() {
      return inputGroupProps["aria-labelledby"];
    },
  };

  return (
    <InputGroupToolbarContext.Provider value={toolbarInputContext}>
      <InputGroup
        {...inputGroupProps}
        className={toolbarControlClassName(cn(props.class, props.className))}
        size={toolbar.size()}
      >
        {props.children}
      </InputGroup>
    </InputGroupToolbarContext.Provider>
  );
}

type ToolbarComponent = typeof Root & {
  Button: typeof Button;
  Input: typeof Input;
  InputGroup: typeof InputGroupRoot;
};

export const Toolbar = Object.assign(Root, {
  Button,
  Input,
  InputGroup: InputGroupRoot,
}) as ToolbarComponent;
