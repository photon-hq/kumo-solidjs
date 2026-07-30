import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Resolve once — components come from the Solid port while the canonical
// stylesheet still lives in the React package until the style generator is
// shared at the workspace level.
const kumoSolidRoot = resolve(__dirname, "../../../kumo-solid");
const kumoSolidSrc = resolve(kumoSolidRoot, "src");
const kumoRoot = resolve(__dirname, "../../../kumo");
const kumoStylesSrc = resolve(kumoRoot, "src/styles");

/**
 * Map every `@photon-ai/kumo-solid` sub-path export to its source equivalent.
 *
 * In dev mode Vite will resolve these to the raw .ts/.tsx source files,
 * which means file-watcher-based HMR works instantly — no rebuild of
 * the kumo package required.
 *
 * In production builds (astro build) this plugin is NOT loaded, so the
 * normal package.json `exports` field is used (dist/), which validates
 * the real consumer experience.
 */
const aliases: Record<string, string> = {
  // Main barrel — resolves to source index.ts
  "@photon-ai/kumo-solid": resolve(kumoSolidSrc, "index.ts"),

  // CSS styles — resolve to source CSS
  "@photon-ai/kumo-solid/styles/tailwind": resolve(kumoStylesSrc, "kumo.css"),
  "@photon-ai/kumo-solid/styles/standalone": resolve(
    kumoStylesSrc,
    "kumo-standalone.css",
  ),
  "@photon-ai/kumo-solid/styles": resolve(kumoStylesSrc, "kumo.css"),
};

/**
 * Vite plugin that rewires `@photon-ai/kumo-solid` imports to the raw source
 * files of the sibling package during `astro dev`.
 *
 * **Why not just use `resolve.alias`?**
 * `resolve.alias` is a simple prefix match — it can't distinguish
 * `@photon-ai/kumo-solid` from similarly prefixed packages without a trailing
 * slash, and it can't handle the overlapping sub-path exports cleanly.
 * A plugin gives us exact-match control.
 */
export function kumoHmrPlugin() {
  return {
    name: "vite-plugin-kumo-hmr",
    enforce: "pre" as const,

    resolveId(source: string) {
      // Exact match first (most imports)
      if (aliases[source]) {
        return aliases[source];
      }

      // Sub-path component imports: @photon-ai/kumo-solid/components/button
      // → packages/kumo-solid/src/components/button/index.ts
      if (source.startsWith("@photon-ai/kumo-solid/components/")) {
        const componentName = source.replace(
          "@photon-ai/kumo-solid/components/",
          "",
        );
        return resolve(kumoSolidSrc, `components/${componentName}/index.ts`);
      }

      // Utils barrel
      if (source === "@photon-ai/kumo-solid/utils") {
        return resolve(kumoSolidSrc, "utils/index.ts");
      }

      // Catch-all for any other @photon-ai/kumo-solid/styles/* CSS imports
      if (source.startsWith("@photon-ai/kumo-solid/styles/")) {
        const styleName = source.replace("@photon-ai/kumo-solid/styles/", "");
        return resolve(kumoStylesSrc, `${styleName}.css`);
      }

      return undefined;
    },

    configResolved(config: { server: { fs: { allow: string[] } } }) {
      // Append Kumo sources to the existing allow list rather than replacing it.
      // Using config() would shallow-merge and override Astro/Vite defaults.
      if (config.server?.fs?.allow) {
        config.server.fs.allow.push(kumoSolidRoot, kumoRoot);
      }
    },
  };
}
