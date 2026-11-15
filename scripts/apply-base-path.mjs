import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Build 113: the browser version is served from a folder (GitHub Pages: /Pare3D/), not the top of
// a site. Next puts that folder in front of its own files; the pages written outside Next (the
// guide) and a few addresses in the exported HTML still point at the top. This rewrites every
// href="/...", src="/..." and url(/...) in the export's HTML and CSS to carry the folder, and the
// manifest's id. Runs only when PARE_BASE_PATH is set; the Mac app's build never has it.

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const exportRoot = join(repositoryRoot, "apps", "web", ".next-export");

/** The text with its site addresses moved under `base`; addresses already there, and "//host" ones, stay. */
export function rebase(text, base) {
  const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const notYet = `(?!/)(?!${escaped.slice(1)}/)`;
  return text
    .replace(new RegExp(`(\\s(?:href|src|action|content)=")/${notYet}`, "g"), `$1${base}/`)
    .replace(new RegExp(`(\\s(?:href|src)=')/${notYet}`, "g"), `$1${base}/`)
    .replace(new RegExp(`url\\((["']?)/${notYet}`, "g"), `url($1${base}/`);
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  }));
  return nested.flat();
}

async function main() {
  const base = (process.env.PARE_BASE_PATH ?? "").replace(/\/+$/, "");
  if (!base) return;
  let changed = 0;
  for (const file of await listFiles(exportRoot)) {
    if (!/\.(html|css)$/.test(file)) continue;
    const text = await readFile(file, "utf8");
    const next = rebase(text, base);
    if (next !== text) {
      await writeFile(file, next);
      changed += 1;
    }
  }
  const manifestPath = join(exportRoot, "manifest.webmanifest");
  try {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    manifest.id = `${base}/`;
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  } catch {
    // no manifest in this export
  }
  console.log(`Base path ${base}: ${changed} HTML and CSS files rewritten`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
