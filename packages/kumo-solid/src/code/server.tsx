import type { JSX } from "solid-js";
import type { HighlighterCore } from "shiki/core";
import type { ShikiEngine, SupportedLanguage } from "./types";

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

export interface HighlightCodeOptions {
  engine?: ShikiEngine;
}

export interface CreateHighlighterOptions {
  engine?: ShikiEngine;
  languages: readonly SupportedLanguage[];
}

export interface ServerHighlighter {
  highlight: (code: string, language: SupportedLanguage) => string;
  dispose: () => void;
}

async function createEngine(engine: ShikiEngine) {
  return engine === "wasm"
    ? import("shiki/engine/oniguruma").then((module) =>
        module.createOnigurumaEngine(import("shiki/wasm")),
      )
    : import("shiki/engine/javascript").then((module) =>
        module.createJavaScriptRegexEngine(),
      );
}

export async function highlightCode(
  code: string,
  language: SupportedLanguage,
  options: HighlightCodeOptions = {},
): Promise<string> {
  const highlighter = await createServerHighlighter({
    engine: options.engine,
    languages: [language],
  });

  try {
    return highlighter.highlight(code, language);
  } finally {
    highlighter.dispose();
  }
}

export async function createServerHighlighter(
  options: CreateHighlighterOptions,
): Promise<ServerHighlighter> {
  const { createHighlighterCore } = await import("shiki/core");
  const [engine, githubLight, vesper, ...languageModules] = await Promise.all([
    createEngine(options.engine ?? "javascript"),
    import("@shikijs/themes/github-light"),
    import("@shikijs/themes/vesper"),
    ...options.languages.map((language) => BUNDLED_LANGS[language]()),
  ]);
  const highlighter: HighlighterCore = await createHighlighterCore({
    themes: [githubLight.default, vesper.default],
    langs: languageModules.map((module) => module.default) as never[],
    engine,
  });

  return {
    highlight: (code, language) =>
      highlighter.codeToHtml(code, {
        lang: language,
        themes: {
          light: "github-light",
          dark: "vesper",
        },
      }),
    dispose: () => highlighter.dispose(),
  };
}

export interface CodeBlockProps {
  html: string;
  className?: string;
}

export function CodeBlock(props: CodeBlockProps): JSX.Element {
  const containerClass = () =>
    props.className
      ? `group relative w-full min-w-0 rounded-md border border-kumo-fill bg-kumo-base ${props.className}`
      : "group relative w-full min-w-0 rounded-md border border-kumo-fill bg-kumo-base";

  return (
    <div class={containerClass()}>
      <div class="overflow-x-auto">
        <div
          class="kumo-shiki [&>pre]:p-4 [&>pre]:font-mono [&>pre]:text-sm [&>pre]:leading-relaxed"
          innerHTML={props.html}
        />
      </div>
    </div>
  );
}
