import { execSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const projectRoot = join(__dirname, "..");
const skipSeed = process.argv.includes("--skip-seed");

execSync("npx prisma generate", {
  cwd: projectRoot,
  stdio: "inherit",
});

execSync("npx prisma db push --accept-data-loss", {
  cwd: projectRoot,
  stdio: "inherit",
});

if (!skipSeed) {
  execSync("tsx prisma/seed.ts --reset", {
    cwd: projectRoot,
    stdio: "inherit",
  });
}
