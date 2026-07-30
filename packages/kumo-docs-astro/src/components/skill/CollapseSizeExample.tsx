import { createSignal } from "solid-js";
import { Button, cn, LayerCard, Text } from "@photon-ai/kumo-solid";

interface CollapseSizeExampleProps {
  preserveContentSize?: boolean;
}

export function CollapseSizeExample({
  preserveContentSize = false,
}: CollapseSizeExampleProps) {
  const [open, setOpen] = createSignal(true);

  return (
    <div class={cn("grid w-full gap-4")}>
      <Button
        aria-expanded={open()}
        onClick={() => setOpen((current) => !current)}
        variant="secondary"
      >
        {open() ? "Close" : "Open"}
      </Button>
      <div
        class={cn("overflow-hidden rounded-lg ring ring-kumo-line")}
        style={{
          width: open() ? "16rem" : "0rem",
          "transition-duration": "500ms",
          "transition-property": "width",
          "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <LayerCard
          className={cn(
            "grid gap-1 p-4 ring-0",
            preserveContentSize ? "w-64" : "w-full min-w-0",
          )}
        >
          <Text as="h3" variant="heading3">
            Web Analytics
          </Text>
          <Text variant="secondary">
            Measure traffic without changing your code.
          </Text>
        </LayerCard>
      </div>
    </div>
  );
}
