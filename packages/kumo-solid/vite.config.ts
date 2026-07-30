import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";
import solid from "vite-plugin-solid";

const packageRoot = fileURLToPath(new URL(".", import.meta.url));
const isServerBuild = process.env.KUMO_SOLID_BUILD_TARGET === "server";
const componentRoot = resolve(packageRoot, "src/components");
const componentEntries = Object.fromEntries(
  readdirSync(componentRoot, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        existsSync(resolve(componentRoot, entry.name, "index.ts")),
    )
    .map((entry) => [
      `components/${entry.name}`,
      resolve(componentRoot, entry.name, "index.ts"),
    ]),
);
const packEntries = {
  index: resolve(packageRoot, "src/index.ts"),
  ...componentEntries,
  code: resolve(packageRoot, "src/code/index.ts"),
  "code/server": resolve(packageRoot, "src/code/server.tsx"),
  utils: resolve(packageRoot, "src/utils/index.ts"),
};

export default defineConfig({
  plugins: [
    solid({
      ssr: isServerBuild,
      solid: {
        generate: isServerBuild ? "ssr" : "dom",
        hydratable: true,
      },
    }),
  ],
  lint: {
    jsPlugins: [
      "../../lint/kumo-plugin.js",
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
    plugins: ["eslint", "typescript"],
    categories: {
      correctness: "error",
    },
    rules: {
      "kumo/no-cross-package-imports": "error",
      "kumo/no-primitive-colors": "error",
      "kumo/no-tailwind-dark-variant": "error",
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  pack: {
    entry: packEntries,
    format: "esm",
    platform: isServerBuild ? "node" : "browser",
    target: "es2022",
    outDir: isServerBuild ? "dist/ssr" : "dist",
    dts: isServerBuild
      ? false
      : {
          sourcemap: false,
        },
    sourcemap: true,
    fromVite: true,
    deps: {
      neverBundle: /^[^./]/,
    },
    outputOptions: {
      entryFileNames: "[name].js",
      chunkFileNames: "chunks/[name]-[hash:16].js",
    },
  },
});
