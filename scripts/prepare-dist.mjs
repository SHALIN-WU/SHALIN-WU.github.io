import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const ADMIN = path.join(ROOT, "admin");

const pkg = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
const versionFile = `window.ADMIN_VERSION = ${JSON.stringify(pkg.version)};\n`;
await writeFile(path.join(ADMIN, "version.js"), versionFile, "utf8");

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
await cp(path.join(ROOT, "site"), DIST, { recursive: true });
await cp(ADMIN, path.join(DIST, "admin"), { recursive: true });
await writeFile(
  path.join(DIST, "version.json"),
  JSON.stringify({ name: pkg.name, version: pkg.version }, null, 2) + "\n",
  "utf8"
);

console.log(`Prepared dist/ from site/ + admin/ (v${pkg.version})`);
