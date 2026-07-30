import { createEffect, createSignal, onCleanup, type Accessor } from "solid-js";

type MaybeAccessor<T> = T | Accessor<T>;

function access<T>(value: MaybeAccessor<T>): T {
  return typeof value === "function" ? (value as Accessor<T>)() : value;
}

export interface UseTableOfContentsActiveIdOptions {
  /** Section ids in document order. An accessor can be used for reactive ids. */
  ids: MaybeAccessor<string[]>;
  /** Activation-line offset in pixels. */
  offset?: MaybeAccessor<number>;
  /** Scroll container. Defaults to the viewport. */
  root?: MaybeAccessor<Element | null>;
  /** Track `location.hash` on mount and hash changes. @default true */
  trackHash?: MaybeAccessor<boolean>;
}

export interface UseTableOfContentsActiveIdResult {
  /** Reactive id of the currently active section. */
  activeId: Accessor<string | null>;
  /** Pin a section until scrolling settles. */
  selectSection: (id: string) => void;
}

const SCROLL_SETTLE_MS = 150;

/** SSR-safe table-of-contents scroll tracking for Solid applications. */
export function useTableOfContentsActiveId(
  options: UseTableOfContentsActiveIdOptions,
): UseTableOfContentsActiveIdResult {
  const [activeId, setActiveId] = createSignal<string | null>(null);
  let pinned = false;
  let settleTimer: number | undefined;
  let cancelPendingUnpin: (() => void) | undefined;

  createEffect(() => {
    const ids = access(options.ids);
    const offset = options.offset === undefined ? 0 : access(options.offset);
    const root = options.root === undefined ? null : access(options.root);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    const intersecting = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            intersecting.add(entry.target);
          } else {
            intersecting.delete(entry.target);
          }
        }

        const first = elements.find((element) => intersecting.has(element));
        if (first && !pinned) setActiveId(first.id);
      },
      { root, rootMargin: `-${offset}px 0px 0px 0px` },
    );

    for (const element of elements) observer.observe(element);
    onCleanup(() => observer.disconnect());
  });

  const selectSection = (id: string) => {
    cancelPendingUnpin?.();
    pinned = true;
    setActiveId(id);

    if (typeof window === "undefined") return;

    const root = options.root === undefined ? null : access(options.root);
    const scrollTarget: EventTarget = root ?? window;
    const armSettleTimer = () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        cancelPendingUnpin?.();
        pinned = false;
      }, SCROLL_SETTLE_MS);
    };

    scrollTarget.addEventListener("scroll", armSettleTimer, {
      passive: true,
    });
    cancelPendingUnpin = () => {
      window.clearTimeout(settleTimer);
      scrollTarget.removeEventListener("scroll", armSettleTimer);
      cancelPendingUnpin = undefined;
    };
    armSettleTimer();
  };

  onCleanup(() => cancelPendingUnpin?.());

  createEffect(() => {
    const trackHash =
      options.trackHash === undefined ? true : access(options.trackHash);
    if (!trackHash || typeof window === "undefined") return;

    const knownIds = new Set(access(options.ids));
    const syncFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id && knownIds.has(id)) selectSection(id);
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    onCleanup(() => window.removeEventListener("hashchange", syncFromHash));
  });

  return { activeId, selectSection };
}
