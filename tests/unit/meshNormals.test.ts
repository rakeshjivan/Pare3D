import { describe, expect, it } from "vitest";
import { areFacetNormals, withoutFacetNormals } from "@/lib/meshNormals";

describe("face-only normals are not kept (build 114)", () => {
  it("tells a triangle's own normals from smooth ones", () => {
    expect(areFacetNormals([0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0])).toBe(true);
    expect(areFacetNormals([0, 0, 1, 0, 0.6, 0.8, 0, 0, 1])).toBe(false);
  });

  it("drops only face-only normals and leaves the rest of the mesh as it was", () => {
    const flat = { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: [0, 0, 1, 0, 0, 1, 0, 0, 1], triangleCount: 1 };
    const dropped = withoutFacetNormals(flat);
    expect(dropped.normals).toBeUndefined();
    expect(dropped.positions).toBe(flat.positions);
    const smooth = { positions: flat.positions, normals: [0, 0, 1, 0, 0.6, 0.8, 0, 0, 1] };
    expect(withoutFacetNormals(smooth)).toBe(smooth);
    const none = { positions: flat.positions };
    expect(withoutFacetNormals(none)).toBe(none);
  });
});
