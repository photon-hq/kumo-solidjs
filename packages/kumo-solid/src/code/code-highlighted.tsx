import {
  createMemo,
  createSignal,
  For,
  onCleanup,
  Show,
  type JSX,
} from "solid-js";
import { Button } from "../components/button";
import { cn } from "../utils/cn";
import type { CodeHighlightedProps } from "./types";
import { useShikiHighlighter } from "./use-shiki-highlighter";

export function CodeHighlighted(props: CodeHighlightedProps): JSX.Element {
  const shiki = useShikiHighlighter();
  const [copied, setCopied] = createSignal(false);
  let copyResetTimer: ReturnType<typeof setTimeout> | undefined;

  const labels = createMemo(() => ({
    ...shiki.labels(),
    ...props.labels,
  }));
  const html = createMemo(() => shiki.highlight(props.code, props.lang));
  const lineCount = createMemo(() => props.code.split("\n").length);
  const isSingleLine = () => lineCount() === 1;
  const hasLineNumbers = () =>
    Boolean(props.showLineNumbers && !isSingleLine());
  const containerClasses = () =>
    cn(
      "group relative m-0 w-full min-w-0 rounded-md border border-kumo-fill bg-kumo-base p-0",
      props.showCopyButton && isSingleLine() && "flex items-center",
      props.className,
    );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.code);
      setCopied(true);
      if (copyResetTimer) clearTimeout(copyResetTimer);
      copyResetTimer = setTimeout(() => setCopied(false), 2000);
    } catch (cause) {
      console.error(
        "[Kumo CodeHighlighted] Failed to copy to clipboard:",
        cause,
      );
    }
  };

  onCleanup(() => {
    if (copyResetTimer) clearTimeout(copyResetTimer);
  });

  const lineNumbers = () => (
    <div
      class="kumo-line-numbers shrink-0 py-4 pr-4 text-right font-mono text-sm opacity-40 select-none"
      aria-hidden="true"
    >
      <For each={Array.from({ length: lineCount() }, (_, index) => index + 1)}>
        {(lineNumber) => <div class="leading-relaxed">{lineNumber}</div>}
      </For>
    </div>
  );

  const copyButton = () => (
    <Show when={props.showCopyButton}>
      <div
        class={cn(
          isSingleLine() ? "shrink-0 px-2" : "absolute top-2 right-2",
          !copied() && "opacity-0 transition-opacity group-hover:opacity-100",
        )}
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          aria-label={copied() ? labels().copied : labels().copy}
        >
          {copied() ? labels().copied : labels().copy}
        </Button>
      </div>
    </Show>
  );

  const plainCode = () => (
    <div class={containerClasses()}>
      <Show
        when={hasLineNumbers()}
        fallback={
          <pre class="!m-0 min-w-0 flex-1 overflow-x-auto !p-4 font-mono text-sm leading-relaxed text-kumo-subtle">
            <code class="!m-0 !p-0">{props.code}</code>
          </pre>
        }
      >
        <div class="flex">
          {lineNumbers()}
          <pre class="!m-0 min-w-0 flex-1 overflow-x-auto !p-4 font-mono text-sm leading-relaxed text-kumo-subtle">
            <code class="!m-0 !p-0">{props.code}</code>
          </pre>
        </div>
      </Show>
      {copyButton()}
    </div>
  );

  const highlightedCode = () => (
    <div class={containerClasses()}>
      <Show
        when={hasLineNumbers()}
        fallback={
          <div class="overflow-x-auto">
            <div
              class="kumo-shiki [&_code]:!m-0 [&_code]:!border-0 [&_code]:!bg-transparent [&_code]:!p-0 [&>pre]:!m-0 [&>pre]:!rounded-none [&>pre]:!border-0 [&>pre]:!bg-transparent [&>pre]:!p-4 [&>pre]:font-mono [&>pre]:text-sm [&>pre]:leading-relaxed"
              innerHTML={processHighlightedHtml(
                html() ?? "",
                props.highlightLines,
              )}
            />
          </div>
        }
      >
        <div class="flex w-full">
          {lineNumbers()}
          <div class="min-w-0 flex-1 overflow-x-auto">
            <div
              class="kumo-shiki [&_code]:!m-0 [&_code]:!border-0 [&_code]:!bg-transparent [&_code]:!p-0 [&>pre]:!m-0 [&>pre]:!rounded-none [&>pre]:!border-0 [&>pre]:!bg-transparent [&>pre]:!p-4 [&>pre]:font-mono [&>pre]:text-sm [&>pre]:leading-relaxed"
              innerHTML={processHighlightedHtml(
                html() ?? "",
                props.highlightLines,
              )}
            />
          </div>
        </div>
      </Show>
      {copyButton()}
    </div>
  );

  return (
    <>
      {(() => {
        const initializationError = shiki.error();
        if (initializationError) {
          console.error(
            "[Kumo CodeHighlighted] Shiki initialization error:",
            initializationError,
          );
        }
        return shiki.isLoading() || html() === null
          ? plainCode()
          : highlightedCode();
      })()}
    </>
  );
}

function processHighlightedHtml(
  html: string,
  highlightLines?: readonly number[],
): string {
  if (!highlightLines?.length) return html;

  const highlighted = new Set(highlightLines);
  let lineNumber = 0;
  return html.replace(/<span class="line">/g, () => {
    lineNumber += 1;
    return highlighted.has(lineNumber)
      ? '<span class="line line-highlighted">'
      : '<span class="line">';
  });
}
