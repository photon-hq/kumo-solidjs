import { type JSX } from "solid-js";

import { Tabs } from "@photon-ai/kumo-solid";
import type { TabsItem } from "@photon-ai/kumo-solid";
import { cn } from "@photon-ai/kumo-solid";

export const KUMO_PAGE_HEADER_VARIANTS = {
  spacing: {
    compact: {
      classes: "gap-1",
      description: "Compact spacing between header elements",
    },
    base: {
      classes: "gap-2",
      description: "Default spacing between header elements",
    },
    relaxed: {
      classes: "gap-4",
      description: "Relaxed spacing for more prominent headers",
    },
  },
} as const;

export const KUMO_PAGE_HEADER_DEFAULT_VARIANTS = {
  spacing: "base",
} as const;

export type KumoPageHeaderSpacing =
  keyof typeof KUMO_PAGE_HEADER_VARIANTS.spacing;

export interface KumoPageHeaderVariantsProps {
  spacing?: KumoPageHeaderSpacing;
}

export function pageHeaderVariants({
  spacing = KUMO_PAGE_HEADER_DEFAULT_VARIANTS.spacing,
}: KumoPageHeaderVariantsProps = {}) {
  return cn(
    "flex flex-col",
    KUMO_PAGE_HEADER_VARIANTS.spacing[spacing].classes,
  );
}

export interface PageHeaderProps extends KumoPageHeaderVariantsProps {
  breadcrumbs: JSX.Element;
  title?: string;
  description?: string;
  tabs?: TabsItem[];
  defaultTab?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children?: JSX.Element;
}

export function PageHeader({
  breadcrumbs,
  title,
  description,
  tabs,
  defaultTab,
  onValueChange,
  spacing = "base",
  className,
  children,
}: PageHeaderProps) {
  return (
    <div class={cn(pageHeaderVariants({ spacing }), className)}>
      <div class="border-b border-kumo-hairline">{breadcrumbs}</div>

      {(title || description) && (
        <div class="flex flex-col gap-2 py-3 pl-3">
          {title && (
            <h1 class="font-heading text-3xl font-semibold tracking-tight text-kumo-default">
              {title}
            </h1>
          )}
          {description && (
            <p class="max-w-prose text-base text-kumo-subtle">{description}</p>
          )}
        </div>
      )}

      {tabs && (
        <div class="flex w-full items-center justify-between border-b border-kumo-hairline pt-1 pb-3 pl-3">
          <Tabs
            tabs={tabs}
            selectedValue={defaultTab}
            onValueChange={(nextValue) => {
              const stringValue = String(nextValue);
              onValueChange?.(stringValue);
            }}
          />

          <div class="flex items-center gap-2">{children}</div>
        </div>
      )}
    </div>
  );
}
