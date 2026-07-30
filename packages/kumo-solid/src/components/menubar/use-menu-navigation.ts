import { createEffect, onCleanup, type Accessor } from "solid-js";

type MaybeAccessor<T> = T | Accessor<T>;

function access<T>(value: MaybeAccessor<T>): T {
  return typeof value === "function" ? (value as Accessor<T>)() : value;
}

export interface UseMenuNavigationProps {
  menuRef: MaybeAccessor<HTMLElement | null | undefined>;
  direction?: MaybeAccessor<"horizontal" | "vertical">;
}

/** Adds wrapping arrow-key navigation to focusable descendants of a menu. */
export function useMenuNavigation(props: UseMenuNavigationProps) {
  let activeElement: HTMLElement | null = null;

  createEffect(() => {
    const menu = access(props.menuRef);
    const direction = props.direction ? access(props.direction) : "horizontal";
    if (!menu) return;

    const focusableElements = Array.from(
      menu.querySelectorAll<HTMLElement>(
        'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (focusableElements.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!activeElement) return;

      const currentIndex = focusableElements.indexOf(activeElement);
      if (currentIndex < 0) return;

      const forwardKey =
        direction === "horizontal" ? "ArrowRight" : "ArrowDown";
      const backwardKey = direction === "horizontal" ? "ArrowLeft" : "ArrowUp";
      let nextIndex: number;

      if (event.key === forwardKey) {
        event.preventDefault();
        nextIndex = (currentIndex + 1) % focusableElements.length;
      } else if (event.key === backwardKey) {
        event.preventDefault();
        nextIndex =
          (currentIndex - 1 + focusableElements.length) %
          focusableElements.length;
      } else {
        return;
      }

      activeElement = focusableElements[nextIndex];
      activeElement.focus();
    };

    const addKeyListener = () =>
      document.addEventListener("keydown", handleKeyDown);
    const removeKeyListener = () =>
      document.removeEventListener("keydown", handleKeyDown);
    const handleFocusIn = () => {
      activeElement = document.activeElement as HTMLElement;
      addKeyListener();
    };
    const handleFocusOut = () => {
      activeElement = null;
      removeKeyListener();
    };

    menu.addEventListener("focusin", handleFocusIn);
    menu.addEventListener("focusout", handleFocusOut);
    onCleanup(() => {
      menu.removeEventListener("focusin", handleFocusIn);
      menu.removeEventListener("focusout", handleFocusOut);
      removeKeyListener();
    });
  });
}
