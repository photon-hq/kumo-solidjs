/**
 * Documentation-facing view of the generated Kumo registry.
 *
 * These types live with the docs so the Solid site can consume registry data
 * without pulling the React package into its runtime dependency graph.
 */
export type ComponentType = "component" | "block";

export interface PropSchema {
  type: string;
  required?: boolean;
  optional?: boolean;
  default?: string;
  description?: string;
  values?: readonly string[];
  descriptions?: Record<string, string>;
  classes?: Record<string, string>;
  stateClasses?: Record<string, Record<string, string>>;
}

export interface SubComponentSchema {
  name: string;
  description: string;
  props: Record<string, PropSchema>;
  isPassThrough?: boolean;
  baseComponent?: string;
  usageExamples?: string[];
  renderElement?: string;
}

export interface ComponentSchema {
  name: string;
  type: ComponentType;
  description: string;
  importPath: string;
  category: string;
  props: Record<string, PropSchema>;
  examples: readonly string[];
  colors: string[];
  baseStyles?: string;
  subComponents?: Record<string, SubComponentSchema>;
  styling?: Record<string, unknown>;
}

export interface BlockSchema extends ComponentSchema {
  type: "block";
  files: string[];
  dependencies: string[];
}

export interface ComponentRegistry {
  version: string;
  components: Record<string, ComponentSchema>;
  blocks?: Record<string, BlockSchema>;
  search: {
    byCategory: Record<string, string[]>;
    byName: string[];
    byType: Record<ComponentType, string[]>;
  };
}
