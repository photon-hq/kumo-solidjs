import { createContext, type Accessor } from "solid-js";
import type { HighlighterCore } from "shiki/core";
import type { CodeHighlightedLabels, SupportedLanguage } from "./types";

export interface ShikiContextValue {
  highlighter: Accessor<HighlighterCore | null>;
  isLoading: Accessor<boolean>;
  error: Accessor<Error | null>;
  languages: Accessor<readonly SupportedLanguage[]>;
  labels: Accessor<CodeHighlightedLabels>;
}

export const ShikiContext = createContext<ShikiContextValue>();
