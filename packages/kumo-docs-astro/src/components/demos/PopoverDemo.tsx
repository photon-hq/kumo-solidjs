import { createSignal } from "solid-js";

import { Popover, Button } from "@photon-ai/kumo-solid";
import { BellIcon, DotsThree } from "~/components/icons";

export function PopoverHeroDemo() {
  return (
    <Popover>
      <Popover.Trigger
        render={(renderProps) => (
          <Button
            {...renderProps}
            shape="square"
            icon={BellIcon}
            aria-label="Notifications"
          />
        )}
      />
      <Popover.Content>
        <Popover.Title>Notifications</Popover.Title>
        <Popover.Description>
          You are all caught up. Good job!
        </Popover.Description>
      </Popover.Content>
    </Popover>
  );
}

export function PopoverBasicDemo() {
  return (
    <Popover>
      <Popover.Trigger render={(renderProps) => <Button {...renderProps} />}>
        Open Popover
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Popover Title</Popover.Title>
        <Popover.Description>
          This is a basic popover with a title and description.
        </Popover.Description>
      </Popover.Content>
    </Popover>
  );
}

export function PopoverWithCloseDemo() {
  return (
    <Popover>
      <Popover.Trigger render={(renderProps) => <Button {...renderProps} />}>
        Open Settings
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Settings</Popover.Title>
        <Popover.Description>
          Configure your preferences below.
        </Popover.Description>
        <div class="mt-3">
          <Popover.Close
            render={(renderProps) => (
              <Button {...renderProps} variant="secondary" size="sm" />
            )}
          >
            Close
          </Popover.Close>
        </div>
      </Popover.Content>
    </Popover>
  );
}

export function PopoverPositionDemo() {
  return (
    <div class="flex flex-wrap gap-4">
      <Popover>
        <Popover.Trigger
          render={(renderProps) => (
            <Button {...renderProps} variant="secondary" />
          )}
        >
          Bottom
        </Popover.Trigger>
        <Popover.Content side="bottom">
          <Popover.Title>Bottom</Popover.Title>
          <Popover.Description>
            Popover on bottom (default).
          </Popover.Description>
        </Popover.Content>
      </Popover>

      <Popover>
        <Popover.Trigger
          render={(renderProps) => (
            <Button {...renderProps} variant="secondary" />
          )}
        >
          Top
        </Popover.Trigger>
        <Popover.Content side="top">
          <Popover.Title>Top</Popover.Title>
          <Popover.Description>Popover on top.</Popover.Description>
        </Popover.Content>
      </Popover>

      <Popover>
        <Popover.Trigger
          render={(renderProps) => (
            <Button {...renderProps} variant="secondary" />
          )}
        >
          Left
        </Popover.Trigger>
        <Popover.Content side="left">
          <Popover.Title>Left</Popover.Title>
          <Popover.Description>Popover on left.</Popover.Description>
        </Popover.Content>
      </Popover>

      <Popover>
        <Popover.Trigger
          render={(renderProps) => (
            <Button {...renderProps} variant="secondary" />
          )}
        >
          Right
        </Popover.Trigger>
        <Popover.Content side="right">
          <Popover.Title>Right</Popover.Title>
          <Popover.Description>Popover on right.</Popover.Description>
        </Popover.Content>
      </Popover>
    </div>
  );
}

export function PopoverCustomContentDemo() {
  return (
    <Popover>
      <Popover.Trigger render={(renderProps) => <Button {...renderProps} />}>
        User Profile
      </Popover.Trigger>
      <Popover.Content className="w-64">
        <div class="flex items-center gap-3">
          <div class="size-10 rounded-full bg-kumo-recessed" />
          <div>
            <Popover.Title>Jane Doe</Popover.Title>
            <p class="text-sm text-kumo-subtle">jane@example.com</p>
          </div>
        </div>
        <div class="mt-3 flex gap-2 border-t border-kumo-hairline pt-3">
          <Button variant="secondary" size="sm" className="flex-1">
            Profile
          </Button>
          <Popover.Close
            render={(renderProps) => (
              <Button
                {...renderProps}
                variant="ghost"
                size="sm"
                className="flex-1"
              />
            )}
          >
            Sign Out
          </Popover.Close>
        </div>
      </Popover.Content>
    </Popover>
  );
}

export function PopoverOpenOnHoverDemo() {
  return (
    <Popover>
      <Popover.Trigger
        openOnHover
        delay={200}
        render={(renderProps) => (
          <Button {...renderProps} variant="secondary" />
        )}
      >
        Hover Me
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Hover Triggered</Popover.Title>
        <Popover.Description>
          This popover opens on hover with a 200ms delay. It can still contain
          interactive content like buttons and links.
        </Popover.Description>
        <div class="mt-3">
          <Popover.Close
            render={(renderProps) => (
              <Button {...renderProps} variant="secondary" size="sm" />
            )}
          >
            Got it
          </Popover.Close>
        </div>
      </Popover.Content>
    </Popover>
  );
}

/** Popover anchored to a virtual element instead of a trigger. */
export function PopoverVirtualAnchorDemo() {
  const [selectedRow, setSelectedRow] = createSignal<string | null>(null);
  const [anchorRect, setAnchorRect] = createSignal<DOMRect | null>(null);
  const rowRefs = new Map<string, HTMLTableRowElement>();

  const rows = [
    { id: "1", name: "api-gateway", status: "Active" },
    { id: "2", name: "auth-service", status: "Active" },
    { id: "3", name: "worker-prod", status: "Paused" },
  ];

  const handleEdit = (id: string) => {
    const row = rowRefs.get(id);
    if (row) {
      setAnchorRect(row.getBoundingClientRect());
      setSelectedRow(id);
    }
  };
  const virtualAnchor = () => {
    const rect = anchorRect();
    return rect ? { getBoundingClientRect: () => rect } : undefined;
  };

  return (
    <div class="w-full">
      <div class="overflow-hidden rounded-lg border border-kumo-hairline">
        <table class="w-full text-sm">
          <thead class="bg-kumo-elevated">
            <tr>
              <th class="px-4 py-2 text-left font-medium">Name</th>
              <th class="px-4 py-2 text-left font-medium">Status</th>
              <th class="w-12 px-4 py-2"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-kumo-hairline">
            {rows.map((row) => (
              <tr
                ref={(el) => {
                  if (el) rowRefs.set(row.id, el);
                }}
                class={
                  selectedRow() === row.id ? "bg-kumo-recessed" : "bg-kumo-base"
                }
              >
                <td class="px-4 py-2 font-mono">{row.name}</td>
                <td class="px-4 py-2 text-kumo-subtle">{row.status}</td>
                <td class="px-4 py-2">
                  <Button
                    size="xs"
                    variant="ghost"
                    shape="square"
                    icon={DotsThree}
                    aria-label={`Actions for ${row.name}`}
                    onClick={() => handleEdit(row.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Popover
        open={!!selectedRow()}
        onOpenChange={(open) => !open && setSelectedRow(null)}
      >
        <Popover.Content side="left" anchor={virtualAnchor()}>
          <Popover.Title>
            Edit {rows.find((r) => r.id === selectedRow())?.name}
          </Popover.Title>
          <Popover.Description>
            The popover anchors to the selected row, not the icon button.
          </Popover.Description>
          <div class="mt-3">
            <Popover.Close
              render={(renderProps) => (
                <Button {...renderProps} size="sm" variant="secondary" />
              )}
            >
              Close
            </Popover.Close>
          </div>
        </Popover.Content>
      </Popover>
    </div>
  );
}
