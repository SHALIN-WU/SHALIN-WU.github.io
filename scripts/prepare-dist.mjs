import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
await cp(path.join(ROOT, "site"), DIST, { recursive: true });
await cp(path.join(ROOT, "admin"), path.join(DIST, "admin"), { recursive: true });

console.log("Prepared dist/ from site/ + admin/");
