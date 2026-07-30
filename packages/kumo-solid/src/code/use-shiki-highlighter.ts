import { useContext } from "solid-js";
import { ShikiContext } from "./context";
import { normalizeLanguage } from "./provider";
import type { UseShikiHighlighterResult } from "./types";

export function useShikiHighlighter(): UseShikiHighlighterResult {
  const context = useContext(ShikiContext);

  if (!context) {
    throw new Error(
      "useShikiHighlighter must be used within a ShikiProvider. " +
        "Wrap your app with <ShikiProvider> from '@photon-ai/kumo-solid/code'.",
    );
  }

  const highlight = (code: string, lang: string): string | null => {
    if (context.isLoading()) return null;

    const highlighter = context.highlighter();
    if (!highlighter) return null;

    const normalizedLanguage = normalizeLanguage(lang);
    if (
      !normalizedLanguage ||
      !highlighter.getLoadedLanguages().includes(normalizedLanguage)
    ) {
      console.warn(
        `[Kumo CodeHighlighted] Language "${lang}" is not in the ShikiProvider's languages list. ` +
          `Add it to the languages array. Rendering as plain text.`,
      );
      return null;
    }

    try {
      return highlighter.codeToHtml(code, {
        lang: normalizedLanguage,
        themes: {
          light: "github-light",
          dark: "vesper",
        },
      });
    } catch (cause) {
      console.warn(
        `[Kumo CodeHighlighted] Failed to highlight code with language "${lang}":`,
        cause,
      );
      return null;
    }
  };

  return {
    highlight,
    isLoading: context.isLoading,
    isReady: () => !context.isLoading() && context.highlighter() !== null,
    error: context.error,
    labels: context.labels,
  };
}
