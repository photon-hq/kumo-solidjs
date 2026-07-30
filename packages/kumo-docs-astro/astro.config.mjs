// @ts-check
import { defineConfig } from "astro/config";
import solid from "@astrojs/solid-js";
import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import tailwindcss from "@tailwindcss/vite";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { kumoColorsPlugin } from "./src/lib/vite-plugin-kumo-colors.js";
import { kumoRegistryPlugin } from "./src/lib/vite-plugin-kumo-registry.js";
import { kumoHmrPlugin } from "./src/lib/vite-plugin-kumo-hmr.js";
import { markdownPages } from "./src/lib/astro-markdown-pages.js";
import { remarkHeadingComponents } from "./src/lib/remark-heading-components.js";

import sitemap from "@astrojs/sitemap";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

function getBuildInfo() {
  // Read version from the SolidJS Kumo package used by this site.
  const kumoPkg = JSON.parse(
    readFileSync(resolve(__dirname, "../kumo-solid/package.json"), "utf-8"),
  );

  // Read version from the docs-astro package
  const docsPkg = JSON.parse(
    readFileSync(resolve(__dirname, "package.json"), "utf-8"),
  );

  let commitHash = "unknown";
  let commitDate = "unknown";
  let branch = "unknown";

  try {
    commitHash = execSync("git rev-parse --short HEAD", {
      encoding: "utf-8",
    }).trim();
    commitDate = execSync("git log -1 --format=%cI", {
      encoding: "utf-8",
    }).trim();
    branch = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf-8",
    }).trim();
  } catch (error) {
    console.warn(
      "[kumo-docs-astro] Git info unavailable during build:",
      error instanceof Error ? error.message : error,
    );
    console.warn(
      "[kumo-docs-astro] This may happen with shallow clones. Set GIT_DEPTH=0 or fetch-depth: 0 in CI.",
    );
  }

  return {
    kumoVersion: kumoPkg.version,
    docsVersion: docsPkg.version,
    commitHash,
    commitDate,
    branch,
    buildDate: new Date().toISOString(),
  };
}

const buildInfo = getBuildInfo();

// Detect dev mode: `astro dev` sets this in process.argv
const isDev = process.argv.includes("dev");

// Component source lives in kumo-solid. Styles continue to come from the
// canonical Kumo token source so the migrated docs render pixel-for-pixel.
const kumoStylesSrc = resolve(__dirname, "../kumo/src/styles");

// https://astro.build/config
export default defineConfig({
  integrations: [
    mdx(),
    solid(),
    sitemap(),
    markdownPages({ passthroughPaths: ["/skill.md"] }),
  ],
  site: "https://kumo-ui.com/",
  // Prefetch linked pages so navigation feels instant. `hover` fetches the
  // target page's HTML + assets as soon as a link is hovered/focused, so by
  // the time the user clicks it's usually already cached.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  markdown: {
    processor: unified({ remarkPlugins: [remarkHeadingComponents] }),
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "vesper",
      },
      defaultColor: false,
    },
  },
  vite: {
    plugins: [
      // In dev mode, resolve @photon-ai/kumo-solid imports to raw source files
      // for instant HMR. In production builds, the normal package.json
      // exports (dist/) are used — preserving the real consumer experience.
      // IMPORTANT: Must come BEFORE tailwindcss() so CSS @import statements
      // like `@import "@photon-ai/kumo-solid/styles"` are aliased to source
      // before Tailwind processes them.
      ...(isDev ? [kumoHmrPlugin()] : []),
      tailwindcss(),
      kumoColorsPlugin(),
      kumoRegistryPlugin(),
    ],

    // In dev mode, add resolve.alias for CSS @import statements that may bypass
    // Vite plugins. This ensures `@import "@photon-ai/kumo-solid/styles"` resolves
    // to source files without requiring a build step.
    resolve: isDev
      ? {
          alias: {
            "@photon-ai/kumo-solid/styles/tailwind": resolve(
              kumoStylesSrc,
              "kumo.css",
            ),
            "@photon-ai/kumo-solid/styles/standalone": resolve(
              kumoStylesSrc,
              "kumo-standalone.css",
            ),
            "@photon-ai/kumo-solid/styles": resolve(kumoStylesSrc, "kumo.css"),
          },
        }
      : undefined,

    define: {
      __KUMO_VERSION__: JSON.stringify(buildInfo.kumoVersion),
      __DOCS_VERSION__: JSON.stringify(buildInfo.docsVersion),
      __BUILD_VERSION__: JSON.stringify(buildInfo.kumoVersion), // Alias for backwards compatibility
      __BUILD_COMMIT__: JSON.stringify(buildInfo.commitHash),
      __BUILD_COMMIT_DATE__: JSON.stringify(buildInfo.commitDate),
      __BUILD_BRANCH__: JSON.stringify(buildInfo.branch),
      __BUILD_DATE__: JSON.stringify(buildInfo.buildDate),
    },
  },
});
