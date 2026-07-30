import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const VIRTUAL_MODULE_ID = "virtual:kumo-registry";
const RESOLVED_VIRTUAL_MODULE_ID = "\0" + VIRTUAL_MODULE_ID;

function solidifyRegistryString(value: string): string {
  return value
    .replace(
      /https:\/\/base-ui\.com\/react\/components\/([a-z-]+)/g,
      "https://github.com/photon-hq/base-ui-solid/tree/master/packages/solid/src/$1",
    )
    .replace(/@cloudflare\/kumo(?!-solid)/g, "@photon-ai/kumo-solid")
    .replace(/@base-ui\/react/g, "@photon-ai/base-ui-solid")
    .replace(
      /@phosphor-icons\/react/g,
      "a Solid-compatible Phosphor icon package",
    )
    .replace(/React\.ReactNode|ReactNode/g, "JSX.Element")
    .replace(/React\.ReactElement|ReactElement/g, "JSX.Element")
    .replace(/React\.ComponentType/g, "Component")
    .replace(/React\.ElementType/g, "ValidComponent")
    .replace(
      /React\.HTMLAttributeAnchorTarget/g,
      "JSX.HTMLAttributeAnchorTarget",
    )
    .replace(
      /React\.HTMLInputAutoCompleteAttribute/g,
      "JSX.HTMLInputAutoCompleteAttribute",
    )
    .replace(/React\.MouseEvent/g, "MouseEvent")
    .replace(/\bReact nodes?\b/gi, "JSX content")
    .replace(/\bReact component\b/g, "Solid component")
    .replace(/\bReact tree\b/g, "Solid owner tree")
    .replace(
      /Next\.js `<Link>`, React Router `<NavLink>`/g,
      "Solid Router `<A>`",
    )
    .replace(/className=/g, "class=");
}

function solidifyRegistryValue(value: unknown): unknown {
  if (typeof value === "string") return solidifyRegistryString(value);
  if (Array.isArray(value)) return value.map(solidifyRegistryValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        solidifyRegistryValue(entry),
      ]),
    );
  }
  return value;
}

/**
 * Vite plugin that provides component registry data as a virtual module.
 * Loads the markdown file at dev time, no build step required.
 * Hot reloads when the registry file changes.
 *
 * @returns Astro/Vite compatible plugin
 */
export function kumoRegistryPlugin() {
  // Navigate from kumo-docs-astro/src/lib to kumo/ai/
  const registryFiles = {
    markdown: resolve(__dirname, "../../../kumo/ai/component-registry.md"),
    json: resolve(__dirname, "../../../kumo/ai/component-registry.json"),
  };

  return {
    name: "vite-plugin-kumo-registry",

    resolveId(id: string) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
    },

    async load(id: string) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        const [markdown, json] = await Promise.all([
          readFile(registryFiles.markdown, "utf8"),
          readFile(registryFiles.json, "utf8"),
        ]);
        const solidRegistry = solidifyRegistryValue(JSON.parse(json));
        const solidMarkdown = solidifyRegistryString(markdown);

        return `
export const kumoRegistryMarkdown = ${JSON.stringify(solidMarkdown)};
export const kumoRegistryJson = ${JSON.stringify(solidRegistry)};
`;
      }
    },

    configureServer(server: {
      watcher: {
        add: (paths: string[]) => void;
        on: (event: string, callback: (file: string) => void) => void;
      };
      moduleGraph: {
        getModuleById: (id: string) => unknown;
        invalidateModule: (mod: any) => void;
      };
      ws: { send: (message: { type: string }) => void };
    }) {
      // Watch registry files and trigger HMR when they change
      const registryFilePaths = Object.values(registryFiles);

      server.watcher.add(registryFilePaths);

      server.watcher.on("change", (file: string) => {
        if (
          registryFilePaths.some((registryFile) =>
            file.endsWith(registryFile.split("/").pop()!),
          )
        ) {
          const mod = server.moduleGraph.getModuleById(
            RESOLVED_VIRTUAL_MODULE_ID,
          );
          if (mod) {
            server.moduleGraph.invalidateModule(mod);
            server.ws.send({ type: "full-reload" });
          }
        }
      });
    },
  };
}
