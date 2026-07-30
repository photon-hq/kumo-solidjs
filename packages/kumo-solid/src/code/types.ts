import type { Accessor, JSX } from "solid-js";

/**
 * Supported languages for syntax highlighting.
 *
 * Kumo bundles a curated subset of Shiki languages to keep bundle size small.
 */
export type SupportedLanguage =
  | "javascript"
  | "typescript"
  | "jsx"
  | "tsx"
  | "json"
  | "jsonc"
  | "html"
  | "css"
  | "python"
  | "yaml"
  | "markdown"
  | "graphql"
  | "sql"
  | "bash"
  | "shell"
  | "diff"
  | "hcl"
  | "toml";

export const LANGUAGE_ALIASES = {
  js: "javascript",
  cjs: "javascript",
  mjs: "javascript",
  ts: "typescript",
  cts: "typescript",
  mts: "typescript",
  sh: "bash",
  zsh: "bash",
  yml: "yaml",
  py: "python",
  md: "markdown",
  gql: "graphql",
} as const satisfies Record<string, SupportedLanguage>;

export type LanguageAlias = keyof typeof LANGUAGE_ALIASES;
export type LanguageInput = SupportedLanguage | LanguageAlias;
export type ShikiEngine = "javascript" | "wasm";

export interface CodeHighlightedLabels {
  copy?: string;
  copied?: string;
}

export interface ShikiProviderProps {
  engine: ShikiEngine;
  languages: readonly LanguageInput[];
  labels?: CodeHighlightedLabels;
  children?: JSX.Element;
}

/**
 * Reactive state is returned as Solid accessors. Call `isLoading()`,
 * `isReady()`, `error()`, and `labels()` inside reactive scopes.
 */
export interface UseShikiHighlighterResult {
  highlight: (
    code: string,
    lang: LanguageInput | (string & {}),
  ) => string | null;
  isLoading: Accessor<boolean>;
  isReady: Accessor<boolean>;
  error: Accessor<Error | null>;
  labels: Accessor<CodeHighlightedLabels>;
}

export interface CodeHighlightedProps {
  code: string;
  lang: LanguageInput | (string & {});
  showLineNumbers?: boolean;
  highlightLines?: readonly number[];
  showCopyButton?: boolean;
  labels?: CodeHighlightedLabels;
  className?: string;
}

/** @deprecated Use SupportedLanguage instead. */
export type BundledLanguage = SupportedLanguage;
