import { createMemo } from "solid-js";
import { marked } from "marked";
import { cn } from "@photon-ai/kumo-solid";
import { Text } from "@photon-ai/kumo-solid";

const GITHUB_COMMIT_URL = "https://github.com/cloudflare/kumo/commit/";

// Override prose defaults for rendered markdown inside changelog entries.
const proseStyles = cn(
  "kumo-prose prose prose-sm max-w-none flex-1",
  "[&>:first-child]:mt-0 [&>:last-child]:mb-0",
  "[&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base",
  "[&_:is(h1,h2,h3)]:font-semibold [&_:is(h1,h2,h3)]:text-kumo-default",
  "[&_pre]:overflow-x-auto [&_pre]:text-base",
);

interface ChangelogEntryProps {
  hash: string;
  text: string;
}

export function ChangelogEntry({ hash, text }: ChangelogEntryProps) {
  const html = createMemo(() => {
    const escaped = text.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    return String(marked.parse(escaped, { async: false }));
  });

  return (
    <li class="mb-3 flex flex-col gap-1 last:mb-0 md:mb-0 md:flex-row md:items-baseline md:gap-3.5">
      <a
        href={`${GITHUB_COMMIT_URL}${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        class="shrink-0 text-xs text-kumo-subtle transition-colors hover:text-kumo-default"
      >
        <Text as="span" variant="mono-secondary">
          {hash}
        </Text>
      </a>
      <div class={proseStyles} innerHTML={html()} />
    </li>
  );
}
