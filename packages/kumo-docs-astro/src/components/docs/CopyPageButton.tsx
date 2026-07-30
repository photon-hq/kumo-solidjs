import { createSignal, onCleanup } from "solid-js";

import { Button, DropdownMenu } from "@photon-ai/kumo-solid";
import {
  CopySimpleIcon,
  LinkSimpleIcon,
  FileMdIcon,
  CaretDownIcon,
  CheckIcon,
} from "~/components/icons";
import { OpenAiLogo } from "~/components/icons";
import { ClaudeIcon } from "./icons/ClaudeIcon";
import { cn } from "@photon-ai/kumo-solid";

interface CopyPageButtonProps {
  align?: "start" | "center" | "end";
}

export function CopyPageButton({ align = "end" }: CopyPageButtonProps) {
  const [copied, setCopied] = createSignal(false);
  let copyResetTimer: ReturnType<typeof setTimeout> | undefined;

  const getMarkdownUrl = () => {
    const url = new URL(window.location.href);

    // /components/badge/ -> /components/badge.md
    // /changelog/2/ -> /changelog.md (paginated pages share one .md)
    let path = url.pathname.replace(/\/+$/, "");
    path = path.replace(/^\/changelog\/.*/, "/changelog");

    return `${url.origin}${path}.md`;
  };

  const onCopySuccess = () => {
    setCopied(true);
    if (copyResetTimer) clearTimeout(copyResetTimer);
    copyResetTimer = setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMarkdown = async () => {
    onCopySuccess();

    try {
      const markdownUrl = getMarkdownUrl();
      const response = await fetch(markdownUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const markdown = await response.text();

      await navigator.clipboard.writeText(markdown);
    } catch (error) {
      console.error("Failed to copy page as Markdown:", error);
    }
  };

  const handleCopyPageLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch (error) {
      console.error("Failed to copy page link:", error);
    }
  };

  const handleViewMarkdown = () => window.open(getMarkdownUrl(), "_blank");

  const getAIPromptUrl = (baseUrl: string) => {
    const markdownUrl = getMarkdownUrl();
    const prompt = encodeURIComponent(
      `Read through this Kumo documentation: ${markdownUrl}. I'll need your help to understand it, so be prepared to explain concepts, share examples, and assist with debugging.`,
    );
    return `${baseUrl}?q=${prompt}`;
  };

  const handleOpenInClaude = () =>
    window.open(getAIPromptUrl("https://claude.ai/new"), "_blank");

  const handleOpenInChatGPT = () =>
    window.open(getAIPromptUrl("https://chatgpt.com"), "_blank");

  onCleanup(() => {
    if (copyResetTimer) clearTimeout(copyResetTimer);
  });

  return (
    <div class="flex items-center" data-copy-ignore>
      <Button
        className="gap-1.5 rounded-r-none border-r-0"
        icon={copied() ? <CheckIcon size={16} /> : <CopySimpleIcon size={16} />}
        onClick={handleCopyMarkdown}
        size="sm"
        variant="secondary"
      >
        <span>Copy page</span>
      </Button>
      <DropdownMenu>
        <DropdownMenu.Trigger
          render={(renderProps) => (
            <Button
              {...renderProps}
              variant="secondary"
              size="sm"
              shape="square"
              aria-label="Copy page options"
              className={cn("rounded-l-none")}
            >
              <CaretDownIcon size={12} />
            </Button>
          )}
        />
        <DropdownMenu.Content align={align}>
          <DropdownMenu.Item icon={LinkSimpleIcon} onClick={handleCopyPageLink}>
            Copy page link
          </DropdownMenu.Item>
          <DropdownMenu.Item icon={FileMdIcon} onClick={handleViewMarkdown}>
            View Page as Markdown
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            icon={<ClaudeIcon className="mr-2" />}
            onClick={handleOpenInClaude}
          >
            Open in Claude
          </DropdownMenu.Item>
          <DropdownMenu.Item icon={OpenAiLogo} onClick={handleOpenInChatGPT}>
            Open in ChatGPT
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
}
