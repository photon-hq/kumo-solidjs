import { mergeProps as mergeBaseUIProps } from "@msviderok/base-ui-solid/merge-props";
import { For, type JSX } from "solid-js";
import { cn } from "../../utils/cn";
import { Tooltip } from "../tooltip";
import { useMenuNavigation } from "./use-menu-navigation";

/** MenuBar variant definitions (reserved for future additions). */
export const KUMO_MENUBAR_VARIANTS = {} as const;
export const KUMO_MENUBAR_DEFAULT_VARIANTS = {} as const;

export interface KumoMenuBarVariantsProps {}

export function menuBarVariants(_props: KumoMenuBarVariantsProps = {}) {
  return cn(
    "flex rounded-lg border border-kumo-recessed bg-kumo-recessed pl-px shadow-xs transition-colors",
  );
}

export interface MenuOptionProps {
  /** Icon element rendered at 18px. */
  icon: JSX.Element;
  /** Unique identifier used when `optionIds` is enabled. */
  id?: number | string;
  /** Called when the option is activated. */
  onClick: () => void;
  /** Accessible name and tooltip text. */
  tooltip: string;
}

export interface MenuBarProps {
  class?: string;
  className?: string;
  /** Currently active option index or id. */
  isActive?: number | boolean | string;
  options: MenuOptionProps[];
  /** Match active state against each option id instead of its index. */
  optionIds?: boolean;
  /** Accessible label for the navigation region. */
  "aria-label"?: string;
}

interface MenuOptionInternalProps extends MenuOptionProps {
  activeValue?: number | boolean | string;
  value?: number | string;
}

function MenuOption(props: MenuOptionInternalProps) {
  return (
    <Tooltip
      content={props.tooltip}
      render={(triggerProps) => {
        const buttonProps = mergeBaseUIProps<"button">(
          triggerProps as JSX.ButtonHTMLAttributes<HTMLButtonElement>,
          {
            type: "button",
            "data-kumo-component": "MenuBar",
            "data-kumo-part": "option",
            get "aria-label"() {
              return props.tooltip;
            },
            get class() {
              return cn(
                "relative -ml-px flex h-full w-11 cursor-pointer items-center justify-center rounded-md border-none bg-kumo-recessed transition-colors first:rounded-l-lg last:rounded-r-lg focus:z-3 focus:ring-kumo-focus/50 focus:outline-none focus-visible:z-3 focus-visible:ring-2 focus-visible:ring-kumo-brand [&>svg]:size-[18px]",
                props.activeValue === props.value &&
                  "z-2 bg-kumo-base shadow-xs transition-colors",
              );
            },
            onClick: props.onClick,
          } as JSX.ButtonHTMLAttributes<HTMLButtonElement>,
        );

        return (
          <button
            {...(buttonProps as JSX.ButtonHTMLAttributes<HTMLButtonElement>)}
          >
            {props.icon}
          </button>
        );
      }}
    />
  );
}

/** Horizontal icon-button toolbar with wrapping arrow-key navigation. */
export function MenuBar(props: MenuBarProps) {
  let menuRef: HTMLElement | undefined;
  useMenuNavigation({ menuRef: () => menuRef, direction: "horizontal" });

  return (
    <nav
      ref={(element) => {
        menuRef = element;
      }}
      aria-label={props["aria-label"] ?? "Menu"}
      class={cn(
        "isolate flex rounded-lg bg-kumo-recessed pl-px shadow-xs ring ring-kumo-line transition-colors",
        props.class,
        props.className,
      )}
    >
      <For each={props.options}>
        {(option, index) => (
          <MenuOption
            {...option}
            activeValue={props.isActive}
            value={props.optionIds ? option.id : index()}
          />
        )}
      </For>
    </nav>
  );
}
