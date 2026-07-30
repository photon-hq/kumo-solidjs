# Docs Site (`@cloudflare/kumo-docs-astro`)

Astro documentation site for Kumo Solid. SolidJS islands architecture using
Astro's official Solid integration. The production target remains Cloudflare
Workers at `kumo-ui.com`.

**Parent:** See [root AGENTS.md](../../AGENTS.md) for monorepo context.

## STRUCTURE

```
kumo-docs-astro/
├── src/
│   ├── pages/
│   │   ├── index.astro              # Homepage (HomeGrid showcase)
│   │   ├── components/{name}.{mdx,astro} # 42 component doc pages
│   │   ├── blocks/{name}.mdx        # 3 block doc pages
│   │   └── api/                     # JSON endpoints (version, component-registry)
│   ├── components/
│   │   ├── demos/                   # 57 files: Solid *Demo.tsx (feed registry)
│   │   ├── docs/                    # Doc components (PropsTable, CodeBlock, etc.)
│   │   └── kumo/                    # Installed blocks (via CLI, not package imports)
│   ├── layouts/                     # BaseLayout → MainLayout → DocLayout
│   ├── lib/
│   │   ├── vite-plugin-kumo-colors.ts    # virtual:kumo-colors
│   │   ├── vite-plugin-kumo-registry.ts  # virtual:kumo-registry
│   │   ├── vite-plugin-kumo-hmr.ts       # Dev-only: rewires kumo-solid → source
│   │   └── component-registry.ts         # Server-side registry access
│   └── styles/global.css            # Tailwind entry + @source to kumo dist
├── scripts/
│   └── extract-demo-examples.ts     # Parses demos → dist/demo-metadata.json
├── astro.config.mjs                 # Solid + Tailwind + 3 custom Vite plugins
└── wrangler.jsonc                   # CF Workers deployment (static assets)
```

## WHERE TO LOOK

| Task               | Location                                        | Notes                              |
| ------------------ | ----------------------------------------------- | ---------------------------------- |
| Component doc page | `src/pages/components/{name}.astro`             | Uses DocLayout + ComponentExample  |
| Demo examples      | `src/components/demos/{Name}Demo.tsx`           | Naming is load-bearing (see below) |
| Props table        | `src/components/docs/PropsTable.astro`          | Server-rendered from registry      |
| Layout/nav         | `src/layouts/`, `src/components/SidebarNav.tsx` | Nav items are hard-coded           |
| Color tokens page  | `src/pages/colors.astro` + `ColorsDemo.tsx`     | Uses `virtual:kumo-colors`         |
| Registry viewer    | `src/pages/registry.astro` + `RegistryDemo.tsx` | Uses `virtual:kumo-registry`       |
| Solid blocks       | `src/components/kumo/{block}/`                  | Source-copied; Solid CLI pending   |

## CONVENTIONS

### Demo File Naming (CRITICAL)

Demo extraction relies on exact naming:

- **File**: `{Component}Demo.tsx` (e.g., `ButtonDemo.tsx`)
- **Exports**: Functions ending in `Demo` suffix (e.g., `export function ButtonPrimaryDemo()`)
- **Both forms work**: `export function FooDemo()` and `export const FooDemo = () =>`
- **JSDoc** on demos becomes the `description` field in metadata

Wrong naming = function not extracted = missing from component registry.

### Hydration Directives

| Directive             | When                                         |
| --------------------- | -------------------------------------------- |
| `client:visible`      | Most component demos (lazy)                  |
| `client:load`         | Interactive: Dialog, Search, Toast, Registry |
| `client:only="solid-js"` | Client-only islands that intentionally skip SSR |
| `client:idle`         | Low priority: CopyPageButton                 |

### Two Registry Access Patterns

- **Server-side** (`.astro` files): Import from `~/lib/component-registry.ts`
- **Client-side** (Solid demos): Use `virtual:kumo-registry` Vite module
- Do NOT mix them.

### Page Template

Pattern: `DocLayout` (title, sourceFile) → `ComponentSection` → `ComponentExample` → `<DemoComponent client:visible />`

Imports: `~/layouts/DocLayout.astro`, `~/components/docs/ComponentExample.astro`, `~/components/demos/{Name}Demo`

### Visual Regression

`ComponentExample` supports `vrSection` and `vrTitle` props for screenshot targeting by visual regression tests.

## ANTI-PATTERNS

| Pattern                             | Why                             | Instead                                  |
| ----------------------------------- | ------------------------------- | ---------------------------------------- |
| Demo function without `Demo` suffix | Won't be extracted for registry | Always suffix with `Demo`                |
| Manually updating PropsTable        | Data comes from registry        | Registry auto-generated at build time    |
| Forgetting `@source` in global.css  | Tailwind misses Kumo classes    | Keep the `kumo-solid` source scan        |
| Using system `prefers-color-scheme` | Site uses `data-mode` attribute | Use ThemeToggle / `localStorage.theme`   |

## NOTES

- **Build order**: `codegen:demos` runs first in `build` script; produces `dist/demo-metadata.json` consumed by kumo registry codegen
- **`dist/` is gitignored**: If `dist/demo-metadata.json` is missing, `codegen:registry` produces incomplete output
- **SidebarNav is manual**: Adding a component page requires updating `SidebarNav.tsx` arrays (`staticPages`, `componentItems`, `chartItems`, `blockItems`)
- **HomeGrid is manual**: New components need adding to the showcase grid + `componentRoutes`
- **Search uses CommandPalette**: Client-side search powered by component registry API; works in dev mode without build step
- **BaseLayout has blocking inline script**: Reads `localStorage.theme` synchronously to prevent dark mode FOUC
- **`global.css`**: `@custom-variant dark` overrides Tailwind dark to match `[data-mode="dark"]`
- **HMR plugin dev-only**: In development, `@photon-ai/kumo-solid` imports are rewritten to source for instant HMR
- **Dual theme code blocks**: Shiki uses github-light/vesper themes, switches via `[data-mode]` CSS
- **Solid blocks**: `src/components/kumo/` contains the source-copied
  PageHeader, ResourceList, and DeleteResource blocks. The upstream CLI still
  emits React and must not be advertised as a Solid installer.
