import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isPareStudio } from "../../apps/web/src/lib/pareStudio";

describe("Pare 3D is CAD Studio only", () => {
  it("knows one studio", () => {
    expect(isPareStudio("cad")).toBe(true);
    expect(isPareStudio("dental")).toBe(false);
    expect(isPareStudio("home")).toBe(false);
    expect(isPareStudio(undefined)).toBe(false);
  });

  it("ships CAD Studio's Home picture", () => {
    expect(existsSync("apps/web/public/assets/home/cad-hero.webp")).toBe(true);
  });

  it("has no dental code left in the app", () => {
    const words = /dental|wax-?up|waxStudio|intraoral|occlus|articulator|model builder/i;
    const found: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (/\.(ts|tsx|css|mjs)$/.test(entry.name) && words.test(readFileSync(path, "utf8"))) found.push(path);
      }
    };
    walk("apps/web/src");
    expect(found).toEqual([]);
  });
});
