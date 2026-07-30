# Kumo SolidJS migration

The React package in `../kumo` remains the behavior and styling reference for
this SolidJS implementation. All 44 tracked component families have completed
the parity criteria below. The package remains private pending a separate
release and versioning decision.

`migration-status.json` tracks all component directories from the pinned React
source revision. Its test fails if upstream adds a component without a matching
ledger entry.

A component can be marked `complete` only after all of the following are true:

1. Its public props, variants, defaults, exports, and rendered structure match
   the React component where those concepts apply.
2. Interactive behavior, keyboard handling, focus management, ARIA state, and
   portal behavior are preserved using Solid primitives from
   `@photon-ai/base-ui-solid`.
3. Props remain reactive after mount; tests exercise changes through signals.
4. Browser rendering and Solid SSR/hydration are verified for relevant
   components.
5. Behavior tests and type-level API tests pass.

The checked-out `/Users/ryanzhu/Projects/base-ui-solid` repository is the
implementation reference for primitive API differences and Solid SSR behavior.
