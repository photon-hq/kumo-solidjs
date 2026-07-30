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
      "@msviderok/base-ui-solid/checkbox",
      "@msviderok/base-ui-solid/checkbox-group",
      "@msviderok/base-ui-solid/collapsible",
      "@msviderok/base-ui-solid/dialog",
      "@msviderok/base-ui-solid/alert-dialog",
      "@msviderok/base-ui-solid/field",
      "@msviderok/base-ui-solid/fieldset",
      "@msviderok/base-ui-solid/input",
      "@msviderok/base-ui-solid/menu",
      "@msviderok/base-ui-solid/merge-props",
      "@msviderok/base-ui-solid/meter",
      "@msviderok/base-ui-solid/popover",
      "@msviderok/base-ui-solid/radio",
      "@msviderok/base-ui-solid/radio-group",
      "@msviderok/base-ui-solid/select",
      "@msviderok/base-ui-solid/switch",
      "@msviderok/base-ui-solid/tabs",
      "@msviderok/base-ui-solid/toast",
      "@msviderok/base-ui-solid/toolbar",
      "@msviderok/base-ui-solid/tooltip",
      "@msviderok/base-ui-solid/use-render",
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
