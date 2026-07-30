import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

for (const target of ["browser", "server"]) {
  execFileSync("pnpm", ["exec", "vp", "pack"], {
    cwd: packageRoot,
    env: {
      ...process.env,
      KUMO_SOLID_BUILD_TARGET: target,
    },
    stdio: "inherit",
  });
}
