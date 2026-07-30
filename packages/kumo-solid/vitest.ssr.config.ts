import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

const packageRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [solid({ ssr: true })],
  resolve: {
    conditions: ["node"],
  },
  test: {
    environment: "node",
    include: ["test/ssr.test.tsx"],
    setupFiles: [resolve(packageRoot, "test/setup.ts")],
  },
});
