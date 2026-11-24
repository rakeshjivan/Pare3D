import { pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
(globalThis as unknown as { window: unknown }).window = { location: { href: pathToFileURL(resolve("apps/web/public") + "/").href } };
import { OcctKernel, type ShapeHandle } from "occt-wasm";
import { edgeIsConvex } from "@/lib/cadEdgeConvexity";

const HASH = 1 << 24;

describe("fillet and chamfer extras (build 32)", () => {
  let cad: OcctKernel;
  beforeAll(async () => {
    const wasm = join(dirname(fileURLToPath(import.meta.resolve("occt-wasm"))), "occt-wasm.wasm");
    cad = await OcctKernel.init({ wasm });
  });

  function classify(solid: ShapeHandle) {
    const faces = cad.getSubShapes(solid, "face");
    const byHash = new Map(faces.map((face) => [cad.hashCode(face, HASH), face]));
    const map = cad.edgeToFaceMap(solid, HASH);
    const adjacent = new Map<number, number[]>();
    for (let index = 0; index < map.length; ) {
      const hash = map[index++];
      const count = map[index++];
      adjacent.set(hash, [...new Set([...(adjacent.get(hash) ?? []), ...map.slice(index, index + count)])]);
      index += count;
    }
    return cad.getSubShapes(solid, "edge").map((edge) => {
      const faceHashes = adjacent.get(cad.hashCode(edge, HASH)) ?? [];
      const points = Array.from(cad.wireframe(edge, 0.1).points);
      const z = points.filter((_, index) => index % 3 === 2);
      return {
        z: Math.min(...z),
        zTop: Math.max(...z),
        convex: faceHashes.length === 2 ? edgeIsConvex(cad, points, byHash.get(faceHashes[0])!, byHash.get(faceHashes[1])!) : null,
      };
    });
  }

  it("tells a pocket's inside edges from the outside ones", () => {
    const pocket = cad.cut(cad.makeBox(20, 20, 10), cad.makeBoxFromCorners({ x: 5, y: 5, z: 4 }, { x: 15, y: 15, z: 11 }));
    const edges = classify(pocket);
    // The pocket's floor rim (z = 4) and its upright corners (z 4..10) are inside edges; everything else sticks out.
    const inside = edges.filter((edge) => edge.convex === false);
    const outside = edges.filter((edge) => edge.convex === true);
    expect(inside.length).toBe(8);
    expect(outside.length).toBe(16);
    expect(inside.every((edge) => Math.abs(edge.z - 4) < 1e-6)).toBe(true);
  });

  it("calls every edge of a box and a cylinder's rims outside edges", () => {
    expect(classify(cad.makeBox(10, 10, 10)).every((edge) => edge.convex === true)).toBe(true);
    const rims = classify(cad.makeCylinder(5, 10)).filter((edge) => edge.convex !== null);
    expect(rims.length).toBe(2);
    expect(rims.every((edge) => edge.convex === true)).toBe(true);
  });
});
