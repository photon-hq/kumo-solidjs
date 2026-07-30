import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  Show,
} from "solid-js";
import { Banner, Button, Dialog, Input, cn } from "@photon-ai/kumo-solid";
import { CheckIcon, CopyIcon, WarningCircle, XIcon } from "../../icons";

export const KUMO_DELETE_RESOURCE_VARIANTS = {
  size: {
    sm: {
      classes: "",
      description: "Small dialog for simple delete confirmations",
    },
    base: {
      classes: "",
      description: "Default delete confirmation dialog size",
    },
  },
} as const;

export const KUMO_DELETE_RESOURCE_DEFAULT_VARIANTS = {
  size: "base",
} as const;

export type KumoDeleteResourceSize =
  keyof typeof KUMO_DELETE_RESOURCE_VARIANTS.size;

export interface KumoDeleteResourceVariantsProps {
  size?: KumoDeleteResourceSize;
}

export interface DeleteResourceProps extends KumoDeleteResourceVariantsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType: string;
  resourceName: string;
  onDelete: () => void | Promise<void>;
  isDeleting?: boolean;
  caseSensitive?: boolean;
  deleteButtonText?: string;
  className?: string;
  errorMessage?: string;
}

export function DeleteResource(props: DeleteResourceProps) {
  const [confirmationInput, setConfirmationInput] = createSignal("");
  const [copied, setCopied] = createSignal(false);
  let copyResetTimer: ReturnType<typeof setTimeout> | undefined;

  const normalized = (value: string) =>
    props.caseSensitive === false ? value.toLowerCase() : value;
  const isConfirmed = createMemo(
    () => normalized(confirmationInput()) === normalized(props.resourceName),
  );

  createEffect(() => {
    if (!props.open) {
      setConfirmationInput("");
      setCopied(false);
    }
  });

  const handleDelete = async () => {
    if (!isConfirmed() || props.isDeleting) return;
    await props.onDelete();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(props.resourceName);
    setCopied(true);
    if (copyResetTimer) clearTimeout(copyResetTimer);
    copyResetTimer = setTimeout(() => setCopied(false), 1500);
  };

  onCleanup(() => {
    if (copyResetTimer) clearTimeout(copyResetTimer);
  });

  return (
    <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
      <Dialog
        size={props.size ?? KUMO_DELETE_RESOURCE_DEFAULT_VARIANTS.size}
        className={cn("p-0", props.className)}
      >
        <div class="flex items-center justify-between border-b border-kumo-line px-6 py-4">
          <Dialog.Title className="text-lg font-semibold">
            Delete {props.resourceName}
          </Dialog.Title>
          <Dialog.Close
            render={(closeProps) => (
              <Button
                {...closeProps}
                variant="ghost"
                shape="square"
                size="sm"
                aria-label="Close"
                disabled={props.isDeleting}
              >
                <XIcon size={18} />
              </Button>
            )}
          />
        </div>

        <div class="flex flex-col gap-4 p-6">
          <div class="flex flex-col gap-2">
            <Show when={props.errorMessage}>
              {(message) => (
                <Banner
                  icon={<WarningCircle />}
                  variant="error"
                  description={message()}
                />
              )}
            </Show>
            <p class="max-w-prose text-base text-pretty text-kumo-subtle">
              This action cannot be undone. This will permanently delete the{" "}
              <span class="font-medium text-kumo-default">
                {props.resourceName}
              </span>{" "}
              {props.resourceType.toLowerCase()}.
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-1.5 text-base">
              <span>
                Type{" "}
                <button
                  class="group inline rounded-md bg-kumo-tint px-2 py-1 font-mono text-sm font-semibold hover:cursor-pointer hover:bg-kumo-fill"
                  onClick={handleCopy}
                  aria-label={`Copy ${props.resourceName} to clipboard`}
                >
                  {props.resourceName}
                  <Show
                    when={copied()}
                    fallback={
                      <CopyIcon
                        size={12}
                        weight="bold"
                        className="ml-1.5 inline text-kumo-subtle group-hover:text-kumo-default"
                      />
                    }
                  >
                    <CheckIcon
                      size={12}
                      weight="bold"
                      className="ml-1.5 inline"
                    />
                  </Show>
                </button>{" "}
                to confirm:
              </span>
            </div>
            <Input
              placeholder={props.resourceName}
              value={confirmationInput()}
              onValueChange={setConfirmationInput}
              disabled={props.isDeleting}
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck={false}
              aria-label={`Type ${props.resourceName} to confirm deletion`}
              className="w-full"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 border-t border-kumo-line px-6 py-4">
          <Dialog.Close
            render={(closeProps) => (
              <Button
                {...closeProps}
                variant="secondary"
                disabled={props.isDeleting}
              >
                Cancel
              </Button>
            )}
          />
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed() || props.isDeleting}
            loading={props.isDeleting}
          >
            {props.deleteButtonText || `Delete ${props.resourceType}`}
          </Button>
        </div>
      </Dialog>
    </Dialog.Root>
  );
}
