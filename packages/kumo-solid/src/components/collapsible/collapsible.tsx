import { Collapsible as CollapsibleBase } from "@msviderok/base-ui-solid/collapsible";
import { splitProps, type ComponentProps, type JSX } from "solid-js";
import { CaretDownIcon } from "../../internal/icons";
import { cn } from "../../utils/cn";

export const KUMO_COLLAPSIBLE_VARIANTS = {} as const;

export const KUMO_COLLAPSIBLE_DEFAULT_VARIANTS = {} as const;

export interface KumoCollapsibleVariantsProps {}

export function collapsibleVariants(_props: KumoCollapsibleVariantsProps = {}) {
  return cn();
}

type BaseRootProps = ComponentProps<typeof CollapsibleBase.Root>;
type BaseTriggerProps = ComponentProps<typeof CollapsibleBase.Trigger>;
type BasePanelProps = ComponentProps<typeof CollapsibleBase.Panel>;

export interface CollapsibleRootProps extends Omit<
  BaseRootProps,
  "class" | "children"
> {
  children?: JSX.Element;
  class?: string;
  className?: string;
}

function CollapsibleRoot(inputProps: CollapsibleRootProps) {
  const [props, elementProps] = splitProps(inputProps, ["class", "className"]);

  return (
    <CollapsibleBase.Root
      {...elementProps}
      class={cn(props.class, props.className)}
    />
  );
}

export interface CollapsibleTriggerProps extends Omit<
  BaseTriggerProps,
  "class" | "children"
> {
  children?: JSX.Element;
  class?: string;
  className?: string;
}

function CollapsibleTrigger(inputProps: CollapsibleTriggerProps) {
  const [props, elementProps] = splitProps(inputProps, ["class", "className"]);

  return (
    <CollapsibleBase.Trigger
      {...elementProps}
      data-kumo-component="Collapsible"
      data-kumo-part="trigger"
      class={cn("cursor-pointer", props.class, props.className)}
    />
  );
}

export interface CollapsiblePanelProps extends Omit<
  BasePanelProps,
  "class" | "children"
> {
  children?: JSX.Element;
  class?: string;
  className?: string;
}

function CollapsiblePanel(inputProps: CollapsiblePanelProps) {
  const [props, elementProps] = splitProps(inputProps, ["class", "className"]);

  return (
    <CollapsibleBase.Panel
      {...elementProps}
      class={cn(props.class, props.className)}
    />
  );
}

export interface CollapsibleDefaultTriggerProps extends Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "class" | "className"
> {
  children: JSX.Element;
  class?: string;
  className?: string;
}

function CollapsibleDefaultTrigger(inputProps: CollapsibleDefaultTriggerProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
  ]);

  return (
    <CollapsibleBase.Trigger
      {...elementProps}
      data-kumo-component="Collapsible"
      data-kumo-part="default-trigger"
      class={cn(
        "m-0 border-none bg-transparent p-0 shadow-none",
        "flex cursor-pointer items-center gap-1 text-sm text-kumo-link select-none",
        props.class,
        props.className,
      )}
    >
      <span class="contents">{props.children}</span>{" "}
      <CaretDownIcon class="h-4 w-4 transition-transform [[data-panel-open]_&]:rotate-180" />
    </CollapsibleBase.Trigger>
  );
}

export interface CollapsibleDefaultPanelProps extends Omit<
  BasePanelProps,
  "class" | "children"
> {
  children: JSX.Element;
  class?: string;
  className?: string;
}

function CollapsibleDefaultPanel(inputProps: CollapsibleDefaultPanelProps) {
  const [props, elementProps] = splitProps(inputProps, [
    "children",
    "class",
    "className",
  ]);

  return (
    <CollapsibleBase.Panel
      {...elementProps}
      class={cn(
        "my-2 space-y-4 border-l-2 border-kumo-fill pl-4",
        props.class,
        props.className,
      )}
    >
      {props.children}
    </CollapsibleBase.Panel>
  );
}

type CollapsibleComponent = typeof CollapsibleRoot & {
  Root: typeof CollapsibleRoot;
  Trigger: typeof CollapsibleTrigger;
  Panel: typeof CollapsiblePanel;
  DefaultTrigger: typeof CollapsibleDefaultTrigger;
  DefaultPanel: typeof CollapsibleDefaultPanel;
};

export const Collapsible = Object.assign(CollapsibleRoot, {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Panel: CollapsiblePanel,
  DefaultTrigger: CollapsibleDefaultTrigger,
  DefaultPanel: CollapsibleDefaultPanel,
}) as CollapsibleComponent;

export type CollapsibleProps = CollapsibleRootProps;
