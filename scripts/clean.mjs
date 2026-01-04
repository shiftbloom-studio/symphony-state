import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const targets = ["dist", "coverage"];

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

await Promise.all(
  targets.map((t) => rm(join(root, t), { recursive: true, force: true }))
);

