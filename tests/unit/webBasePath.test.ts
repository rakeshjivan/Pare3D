import { describe, expect, it } from "vitest";
import { rebase } from "../../scripts/apply-base-path.mjs";
import { serviceWorkerSource } from "../../scripts/generate-service-worker.mjs";

describe("browser version under a folder (build 113)", () => {
  it("moves site addresses in HTML and CSS under the folder, once", () => {
    const html = `<a href="/guide/index.html"><img src="/assets/a.png"><link href="/Pare3D/_next/x.css"><a href="//cdn.example/x"><a href="https://example.com/">` + `<style>b{background:url(/assets/b.png)}</style>`;
    const out = rebase(html, "/Pare3D");
    expect(out).toContain(`href="/Pare3D/guide/index.html"`);
    expect(out).toContain(`src="/Pare3D/assets/a.png"`);
    expect(out).toContain(`href="/Pare3D/_next/x.css"`);
    expect(out).not.toContain("/Pare3D/Pare3D/");
    expect(out).toContain(`href="//cdn.example/x"`);
    expect(out).toContain("url(/Pare3D/assets/b.png)");
    expect(rebase(out, "/Pare3D")).toBe(out);
  });

  it("stores and serves the program's files under the folder", () => {
    const source = serviceWorkerSource("v1", ["/", "/manifold.wasm"], "/Pare3D");
    expect(source).toContain('const BASE = "/Pare3D";');
    const plain = serviceWorkerSource("v1", ["/", "/manifold.wasm"]);
    expect(plain).toContain('const BASE = "";');
  });
});
