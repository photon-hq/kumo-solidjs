/**
 * Mutable holder for values that should survive reactive updates without
 * participating in dependency tracking. This is the Solid equivalent of the
 * small subset of React refs used by the docs demos.
 */
export function createRef<T>(initialValue: T): { current: T };
export function createRef<T>(initialValue: null): { current: T | null };
export function createRef<T>(initialValue: T | null): { current: T | null } {
  return { current: initialValue };
}
