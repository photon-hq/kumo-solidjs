import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  type JSX,
} from "solid-js";
import type { HighlighterCore } from "shiki/core";
import { ShikiContext, type ShikiContextValue } from "./context";
import { LANGUAGE_ALIASES } from "./types";
import type {
  LanguageAlias,
  ShikiProviderProps,
  SupportedLanguage,
} from "./types";

const BUNDLED_LANGS: Record<
  SupportedLanguage,
  () => Promise<{ default: unknown }>
> = {
  javascript: () => import("@shikijs/langs/javascript"),
  typescript: () => import("@shikijs/langs/typescript"),
  jsx: () => import("@shikijs/langs/jsx"),
  tsx: () => import("@shikijs/langs/tsx"),
  json: () => import("@shikijs/langs/json"),
  jsonc: () => import("@shikijs/langs/jsonc"),
  html: () => import("@shikijs/langs/html"),
  css: () => import("@shikijs/langs/css"),
  python: () => import("@shikijs/langs/python"),
  yaml: () => import("@shikijs/langs/yaml"),
  markdown: () => import("@shikijs/langs/markdown"),
  graphql: () => import("@shikijs/langs/graphql"),
  sql: () => import("@shikijs/langs/sql"),
  bash: () => import("@shikijs/langs/bash"),
  shell: () => import("@shikijs/langs/shellscript"),
  diff: () => import("@shikijs/langs/diff"),
  hcl: () => import("@shikijs/langs/hcl"),
  toml: () => import("@shikijs/langs/toml"),
};

export function normalizeLanguage(lang: string): SupportedLanguage | null {
  if (lang in BUNDLED_LANGS) return lang as SupportedLanguage;
  if (lang in LANGUAGE_ALIASES) return LANGUAGE_ALIASES[lang as LanguageAlias];
  return null;
}

const DEFAULT_LABELS = {
  copy: "Copy",
  copied: "Copied!",
} satisfies Required<NonNullable<ShikiProviderProps["labels"]>>;

export function ShikiProvider(props: ShikiProviderProps): JSX.Element {
  const [highlighter, setHighlighter] = createSignal<HighlighterCore | null>(
    null,
  );
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<Error | null>(null);
  const [languages, setLanguages] = createSignal<readonly SupportedLanguage[]>(
    [],
  );
  const labels = createMemo(() => ({ ...DEFAULT_LABELS, ...props.labels }));

  createEffect(() => {
    const engine = props.engine;
    const requestedLanguages = [...props.languages];
    let cancelled = false;
    let activeHighlighter: HighlighterCore | null = null;

    setHighlighter(null);
    setLanguages([]);
    setError(null);
    setIsLoading(true);

    void (async () => {
      try {
        const { createHighlighterCore } = await import("shiki/core");
        const engineInstance =
          engine === "wasm"
            ? await import("shiki/engine/oniguruma").then((module) =>
                module.createOnigurumaEngine(import("shiki/wasm")),
              )
            : await import("shiki/engine/javascript").then((module) =>
                module.createJavaScriptRegexEngine(),
              );
        const [githubLight, vesper] = await Promise.all([
          import("@shikijs/themes/github-light"),
          import("@shikijs/themes/vesper"),
        ]);
        const validLanguages = [
          ...new Set(
            requestedLanguages
              .map(normalizeLanguage)
              .filter(
                (language): language is SupportedLanguage => language !== null,
              ),
          ),
        ];
        const languageModules = await Promise.all(
          validLanguages.map((language) => BUNDLED_LANGS[language]()),
        );

        activeHighlighter = await createHighlighterCore({
          themes: [githubLight.default, vesper.default],
          langs: languageModules.map((module) => module.default) as never[],
          engine: engineInstance,
        });

        if (cancelled) {
          activeHighlighter.dispose();
          activeHighlighter = null;
          return;
        }

        setLanguages(validLanguages);
        setHighlighter(activeHighlighter);
        setIsLoading(false);
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error ? cause : new Error("Failed to load Shiki"),
          );
          setIsLoading(false);
        }
      }
    })();

    onCleanup(() => {
      cancelled = true;
      activeHighlighter?.dispose();
    });
  });

  const context: ShikiContextValue = {
    highlighter,
    isLoading,
    error,
    languages,
    labels,
  };

  return (
    <ShikiContext.Provider value={context}>
      {props.children}
    </ShikiContext.Provider>
  );
}
