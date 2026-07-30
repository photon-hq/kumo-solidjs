import { createSignal, splitProps, type JSX } from "solid-js";

import { Flow } from "@photon-ai/kumo-solid";
import { CaretDownIcon } from "~/components/icons";

type ExpandableNodeProps = Omit<
  JSX.LiHTMLAttributes<HTMLLIElement>,
  "children" | "ref" | "title"
> & {
  children: JSX.Element;
  ref?: (element: HTMLLIElement) => void;
  title: string;
};

function ExpandableNode(inputProps: ExpandableNodeProps) {
  const [props, rest] = splitProps(inputProps, ["children", "ref", "title"]);
  const [open, setOpen] = createSignal(false);
  return (
    <li
      ref={props.ref}
      {...rest}
      class="overflow-hidden rounded-lg bg-kumo-base shadow ring ring-kumo-hairline"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        class="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-kumo-default"
      >
        {props.title}
        <CaretDownIcon
          className={`size-4 text-kumo-subtle transition-transform ${open() ? "rotate-180" : ""}`}
        />
      </button>
      {open() && (
        <div class="border-t border-kumo-hairline px-3 py-2 text-sm text-kumo-subtle">
          {props.children}
        </div>
      )}
    </li>
  );
}

/** Basic flow diagram with sequential nodes */
export function FlowBasicDemo() {
  return (
    <Flow>
      <Flow.Node>Step 1</Flow.Node>
      <Flow.Node>Step 2</Flow.Node>
      <Flow.Node>Step 3</Flow.Node>
    </Flow>
  );
}

/** Vertical flow diagram with sequential nodes */
export function FlowVerticalDemo() {
  return (
    <Flow orientation="vertical">
      <Flow.Node>Step 1</Flow.Node>
      <Flow.Node>Step 2</Flow.Node>
      <Flow.Node>Step 3</Flow.Node>
    </Flow>
  );
}

/** Vertical flow diagram with parallel branching */
export function FlowVerticalParallelDemo() {
  return (
    <Flow orientation="vertical" align="center">
      <Flow.Node>Start</Flow.Node>
      <Flow.Parallel>
        <Flow.Node>Branch A</Flow.Node>
        <Flow.Node>Branch B</Flow.Node>
        <Flow.Node>Branch C</Flow.Node>
      </Flow.Parallel>
      <Flow.Node>End</Flow.Node>
    </Flow>
  );
}

/** Flow diagram with parallel branching */
export function FlowParallelDemo() {
  return (
    <Flow>
      <Flow.Node>Start</Flow.Node>
      <Flow.Parallel>
        <Flow.List>
          <Flow.Node>Branch A1</Flow.Node>
          <Flow.Node>Branch A2</Flow.Node>
        </Flow.List>
        <Flow.Node>Branch B</Flow.Node>
        <Flow.Node>Branch C</Flow.Node>
      </Flow.Parallel>
      <Flow.Node>End</Flow.Node>
    </Flow>
  );
}

/** Flow diagram with custom node styling using render prop */
export function FlowCustomContentDemo() {
  return (
    <Flow>
      <Flow.Node
        render={(renderProps) => (
          <li {...renderProps} class="size-4 rounded-full bg-kumo-hairline" />
        )}
      />
      <Flow.Node
        render={(renderProps) => (
          <li
            {...renderProps}
            class="rounded-lg bg-kumo-contrast px-3 py-2 font-medium text-kumo-inverse"
          >
            my-worker
          </li>
        )}
      />
    </Flow>
  );
}

/** Complex flow diagram example */
export function FlowComplexDemo() {
  return (
    <Flow>
      <Flow.Parallel>
        <Flow.Node>HTTP Trigger</Flow.Node>
        <Flow.Node>Cron Trigger</Flow.Node>
      </Flow.Parallel>
      <Flow.Node>Process Request</Flow.Node>
      <Flow.Parallel>
        <Flow.Node>Log Analytics</Flow.Node>
        <Flow.Node>Update Cache</Flow.Node>
        <Flow.Node>Send Notification</Flow.Node>
      </Flow.Parallel>
      <Flow.Node>Complete</Flow.Node>
    </Flow>
  );
}

/** Flow diagram with custom anchor points */
export function FlowAnchorDemo() {
  return (
    <Flow>
      <Flow.Node>Load balancer</Flow.Node>
      <Flow.Node
        render={(renderProps) => (
          <li
            {...renderProps}
            class="rounded-lg bg-kumo-overlay shadow-none ring ring-kumo-hairline"
          >
            <Flow.Anchor
              type="end"
              render={(renderProps) => (
                <div
                  {...renderProps}
                  class="flex h-10 items-center px-2.5 text-kumo-subtle"
                >
                  my-worker
                </div>
              )}
            />
            <Flow.Anchor
              type="start"
              render={(renderProps) => (
                <div
                  {...renderProps}
                  class="m-1.5 mt-0 rounded bg-kumo-base px-2 py-1.5 shadow ring ring-kumo-hairline"
                >
                  Bindings
                  <span class="ml-3 w-5 text-kumo-subtle">2</span>
                </div>
              )}
            />
          </li>
        )}
      />
      <Flow.Parallel>
        <Flow.Node>DATABASE</Flow.Node>
        <Flow.Node>OTHER_SERVICE</Flow.Node>
      </Flow.Parallel>
    </Flow>
  );
}

/** Flow diagram with vertically centered nodes */
export function FlowCenteredDemo() {
  return (
    <Flow align="center">
      <Flow.Node
        render={(renderProps) => (
          <li {...renderProps} class="size-4 rounded-full bg-kumo-hairline" />
        )}
      />
      <Flow.Node>my-worker</Flow.Node>
      <Flow.Node
        render={(renderProps) => (
          <li
            {...renderProps}
            class="rounded-md bg-kumo-base px-3 py-6 shadow ring ring-kumo-hairline"
          >
            Taller node
          </li>
        )}
      />
    </Flow>
  );
}

/** Large flow diagram demonstrating panning */
export function FlowPanningDemo() {
  return (
    <Flow className="rounded-lg border border-kumo-hairline">
      <Flow.Node>Start</Flow.Node>
      <Flow.Node>Authenticate</Flow.Node>
      <Flow.Node>Validate</Flow.Node>
      <Flow.Node>Transform</Flow.Node>
      <Flow.Node>Process</Flow.Node>
      <Flow.Node>Store</Flow.Node>
      <Flow.Node>Notify</Flow.Node>
      <Flow.Node>Log</Flow.Node>
      <Flow.Node>Complete</Flow.Node>
      <Flow.Node>End</Flow.Node>
    </Flow>
  );
}

/** Flow diagram with disabled nodes */
export function FlowDisabledDemo() {
  return (
    <Flow>
      <Flow.Node>Request</Flow.Node>
      <Flow.Parallel>
        <Flow.Node>Primary Handler</Flow.Node>
        <Flow.Node disabled>Backup Handler (disabled)</Flow.Node>
      </Flow.Parallel>
      <Flow.Node>Response</Flow.Node>
    </Flow>
  );
}

/** Flow diagram with right-aligned parallel nodes */
export function FlowParallelAlignEndDemo() {
  return (
    <Flow>
      <Flow.Node>Start</Flow.Node>
      <Flow.Parallel align="end">
        <Flow.Node>Short</Flow.Node>
        <Flow.Node>Medium Length</Flow.Node>
        <Flow.Node>Very Long Node Name</Flow.Node>
      </Flow.Parallel>
      <Flow.Node>End</Flow.Node>
    </Flow>
  );
}

/** Flow diagram with parallel branches containing nested node sequences */
export function FlowParallelNestedListDemo() {
  return (
    <Flow>
      <Flow.Parallel>
        <Flow.List>
          <Flow.Node>Client Users</Flow.Node>
          <Flow.Node>Engineering Team Access</Flow.Node>
        </Flow.List>
        <Flow.List>
          <Flow.Parallel>
            <Flow.Node>All Authenticated Users</Flow.Node>
            <Flow.Node>Client Users</Flow.Node>
            <Flow.Node>Site Users</Flow.Node>
          </Flow.Parallel>
          <Flow.Node>Contractor Access</Flow.Node>
        </Flow.List>
      </Flow.Parallel>
      <Flow.Node>Destinations</Flow.Node>
    </Flow>
  );
}

/** Flow diagram with two sequential parallel groups back-to-back */
export function FlowSequentialParallelDemo() {
  return (
    <Flow>
      <Flow.Node>Incoming Request</Flow.Node>
      <Flow.Parallel>
        <Flow.Node>Validate Headers</Flow.Node>
        <Flow.Node>Check Auth Token</Flow.Node>
      </Flow.Parallel>
      <Flow.Parallel>
        <Flow.Node>Write to DB</Flow.Node>
        <Flow.Node>Update Cache</Flow.Node>
      </Flow.Parallel>
      <Flow.Node>Return Response</Flow.Node>
    </Flow>
  );
}

/** Flow diagram where a node can be dynamically added and removed */
export function FlowDynamicNodeDemo() {
  const [showMiddle, setShowMiddle] = createSignal(false);

  return (
    <div class="flex flex-col items-center gap-6">
      <button
        type="button"
        onClick={() => setShowMiddle((v) => !v)}
        class="rounded-md bg-kumo-elevated px-3 py-1.5 text-sm font-medium text-kumo-default ring ring-kumo-line transition-colors hover:bg-kumo-base"
      >
        {showMiddle() ? "Remove middle node" : "Add middle node"}
      </button>
      <Flow>
        <Flow.Node>Start</Flow.Node>
        {showMiddle() && <Flow.Node>Middle</Flow.Node>}
        <Flow.Node>End</Flow.Node>
      </Flow>
    </div>
  );
}

/** Flow diagram with expandable nodes in a parallel group */
export function FlowExpandableDemo() {
  return (
    <Flow>
      <Flow.Node>Incoming Request</Flow.Node>
      <Flow.Parallel>
        <Flow.Node
          render={(renderProps) => (
            <ExpandableNode {...renderProps} title="Auth Service">
              <p>Validates JWT tokens and session cookies.</p>
              <p class="mt-1">Connects to identity provider via OAuth 2.0.</p>
            </ExpandableNode>
          )}
        />
        <Flow.Node
          render={(renderProps) => (
            <ExpandableNode {...renderProps} title="Rate Limiter">
              <p>Enforces per-IP request limits.</p>
              <p class="mt-1">Sliding window: 100 req/min.</p>
            </ExpandableNode>
          )}
        />
      </Flow.Parallel>
      <Flow.Node>Route to Origin</Flow.Node>
    </Flow>
  );
}
