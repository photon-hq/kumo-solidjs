import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vite-plus/test";

type MigrationStatus = {
  sourceRevision: string;
  components: Record<
    string,
    { status: "pending" | "in-progress" | "complete" }
  >;
};

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const reactComponents = join(packageRoot, "..", "kumo", "src", "components");
const status = JSON.parse(
  readFileSync(join(packageRoot, "migration-status.json"), "utf8"),
) as MigrationStatus;
const sourceComponents = readdirSync(reactComponents, {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

describe("migration coverage", () => {
  it("tracks every React Kumo component directory", () => {
    expect(Object.keys(status.components).sort()).toEqual(sourceComponents);
  });

  it("pins the React source revision used for parity decisions", () => {
    expect(status.sourceRevision).toMatch(/^[a-f0-9]{7,40}$/);
  });

  it("requires implementation, barrel, and tests before complete status", () => {
    for (const [component, entry] of Object.entries(status.components)) {
      if (entry.status !== "complete") continue;

      const componentRoot = join(packageRoot, "src", "components", component);
      const implementationFiles = readdirSync(componentRoot).filter(
        (file) => file.endsWith(".tsx") && !file.endsWith(".test.tsx"),
      );
      expect(
        implementationFiles.length > 0,
        `${component} implementation`,
      ).toBe(true);
      expect(
        existsSync(join(componentRoot, "index.ts")),
        `${component} barrel`,
      ).toBe(true);
      expect(
        existsSync(join(componentRoot, `${component}.test.tsx`)),
        `${component} behavior tests`,
      ).toBe(true);
    }
  });

  it("preserves every React component subpath export", () => {
    const solidComponents = join(packageRoot, "src", "components");
    const componentIndexes = sourceComponents.flatMap((component) => [
      join(reactComponents, component, "index.ts"),
      join(solidComponents, component, "index.ts"),
    ]);
    const program = ts.createProgram(componentIndexes, {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      jsx: ts.JsxEmit.Preserve,
      skipLibCheck: true,
    });
    const checker = program.getTypeChecker();
    const exportsFor = (file: string) => {
      const source = program.getSourceFile(file);
      const symbol = source && checker.getSymbolAtLocation(source);
      expect(source, `${file} source`).toBeDefined();
      expect(symbol, `${file} module symbol`).toBeDefined();
      return new Set(
        symbol
          ? checker.getExportsOfModule(symbol).map((entry) => entry.name)
          : [],
      );
    };

    for (const component of sourceComponents) {
      const reactExports = exportsFor(
        join(reactComponents, component, "index.ts"),
      );
      const solidExports = exportsFor(
        join(solidComponents, component, "index.ts"),
      );
      const missing = [...reactExports]
        .filter((name) => !solidExports.has(name))
        .sort();

      expect(missing, `${component} missing exports`).toEqual([]);
    }
  });
});
