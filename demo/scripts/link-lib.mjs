import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const demoRoot = path.resolve(scriptDir, "..");
const libRoot = path.resolve(demoRoot, "..");
const pkgDir = path.join(
  demoRoot,
  "node_modules",
  "@shiftbloom-studio",
  "symphony-state"
);

function removePath(targetPath) {
  fs.rmSync(targetPath, { recursive: true, force: true });
}

function copyLibrarySnapshot() {
  fs.mkdirSync(pkgDir, { recursive: true });
  fs.cpSync(path.join(libRoot, "dist"), path.join(pkgDir, "dist"), {
    recursive: true,
    force: true
  });
  fs.copyFileSync(path.join(libRoot, "package.json"), path.join(pkgDir, "package.json"));
}

if (!fs.existsSync(path.join(libRoot, "dist"))) {
  console.log("Building symphony-state library (dist/ not found)...");
  execFileSync("npm", ["install", "--ignore-scripts"], {
    cwd: libRoot,
    stdio: "inherit",
    shell: true
  });
  execFileSync("npm", ["run", "build"], {
    cwd: libRoot,
    stdio: "inherit",
    shell: true
  });
  console.log("Library built");
}

if (!fs.existsSync(pkgDir)) {
  copyLibrarySnapshot();
  console.log("Copied dist files directly");
} else {
  const stats = fs.lstatSync(pkgDir);
  if (stats.isSymbolicLink()) {
    removePath(pkgDir);
    copyLibrarySnapshot();
    console.log("Replaced symlink with real copy");
  } else if (
    !fs.existsSync(path.join(pkgDir, "dist")) ||
    !fs.existsSync(path.join(pkgDir, "package.json"))
  ) {
    removePath(pkgDir);
    copyLibrarySnapshot();
    console.log("Copied dist files directly");
  } else {
    console.log("Already set up");
  }
}
