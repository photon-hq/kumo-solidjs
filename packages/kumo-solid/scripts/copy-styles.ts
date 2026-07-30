import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceStyles = join(packageRoot, "..", "kumo", "src", "styles");
const outputStyles = join(packageRoot, "dist", "styles");

if (!existsSync(sourceStyles)) {
  throw new Error(`React Kumo style source was not found at ${sourceStyles}`);
}

mkdirSync(outputStyles, { recursive: true });

for (const file of readdirSync(sourceStyles)) {
  if (!file.endsWith(".css") || file === "kumo-standalone.css") continue;
  copyFileSync(join(sourceStyles, file), join(outputStyles, file));
}

const standaloneOutput = join(outputStyles, "kumo-standalone.css");
rmSync(standaloneOutput, { force: true });
execFileSync(
  "pnpm",
  [
    "exec",
    "tailwindcss",
    "-i",
    join(sourceStyles, "kumo-standalone.css"),
    "-o",
    standaloneOutput,
    "--minify",
  ],
  { cwd: packageRoot, stdio: "inherit" },
);
