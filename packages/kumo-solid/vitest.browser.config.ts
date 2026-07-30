import { defineConfig } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";
import solid from "vite-plugin-solid";

export default defineConfig({
  define: {
    __KUMO_SOLID_HYDRATION_HTML__: JSON.stringify(
      process.env.KUMO_SOLID_HYDRATION_HTML ?? "",
    ),
  },
  optimizeDeps: {
    include: [
      "vite-plus/test/browser",
      "@photon-ai/base-ui-solid/checkbox",
      "@photon-ai/base-ui-solid/checkbox-group",
      "@photon-ai/base-ui-solid/collapsible",
      "@photon-ai/base-ui-solid/dialog",
      "@photon-ai/base-ui-solid/alert-dialog",
      "@photon-ai/base-ui-solid/field",
      "@photon-ai/base-ui-solid/fieldset",
      "@photon-ai/base-ui-solid/input",
      "@photon-ai/base-ui-solid/menu",
      "@photon-ai/base-ui-solid/merge-props",
      "@photon-ai/base-ui-solid/meter",
      "@photon-ai/base-ui-solid/popover",
      "@photon-ai/base-ui-solid/radio",
      "@photon-ai/base-ui-solid/radio-group",
      "@photon-ai/base-ui-solid/select",
      "@photon-ai/base-ui-solid/switch",
      "@photon-ai/base-ui-solid/tabs",
      "@photon-ai/base-ui-solid/toast",
      "@photon-ai/base-ui-solid/toolbar",
      "@photon-ai/base-ui-solid/tooltip",
      "@photon-ai/base-ui-solid/use-render",
    ],
  },
  plugins: [solid()],
  resolve: {
    dedupe: ["solid-js", "solid-js/web"],
  },
  test: {
    environment: "happy-dom",
    include: ["test/browser.test.tsx"],
    setupFiles: ["./test/setup.ts"],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
    testTimeout: 5_000,
  },
});
