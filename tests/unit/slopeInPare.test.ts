import { describe, expect, it } from "vitest";
import { cadModifierProfileForShape } from "@/lib/cadProfileExtrusion";
import { transformMesh } from "@/lib/editorMeshCore";
import { shapeHasShapeDeform } from "@/lib/workplaneShapes";
import type { WorkplaneShape } from "@/types/layerling";

const box = { id: "b", name: "Box", kind: "box", x: 0, z: 0, size: 20, width: 20, depth: 20, height: 10, rotation: 0, rotationX: 0, rotationZ: 0, color: "#c00", hole: false } as unknown as WorkplaneShape;

describe("slope and narrow along in Pare (build 116)", () => {
  it("counts as a deformation, so the exact and primitive paths step aside", () => {
    const sloped = { ...box, slopeEnd: 4, slopeSide: "back" as const };
    expect(shapeHasShapeDeform(sloped)).toBe(true);
    expect(cadModifierProfileForShape(sloped)).toBeNull();
    const rounded = { ...box, kind: "roundedBox", cornerFillet: 3, topBottomFillet: 0 } as WorkplaneShape;
    expect(cadModifierProfileForShape(rounded)).not.toBeNull();
    expect(cadModifierProfileForShape({ ...rounded, slopeEnd: 4 })).toBeNull();
  });

  it("lowers the back of the exported mesh and narrows its far end", () => {
    const vertices: Array<[number, number, number]> = [
      [-10, 0, -10], [10, 0, -10], [10, 0, 10], [-10, 0, 10],
      [-10, 10, -10], [10, 10, -10], [10, 10, 10], [-10, 10, 10],
    ];
    const faces: Array<[number, number, number]> = [[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5], [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7]];
    const sloped = transformMesh({ name: "b", vertices, faces }, { ...box, slopeEnd: 4, slopeSide: "back" });
    const topBack = Math.max(...sloped.vertices.filter((v) => v[2] < -9.9).map((v) => v[1]));
    const topFront = Math.max(...sloped.vertices.filter((v) => v[2] > 9.9).map((v) => v[1]));
    expect(topBack).toBeCloseTo(4, 3);
    expect(topFront).toBeCloseTo(10, 3);
    const narrowed = transformMesh({ name: "b", vertices, faces }, { ...box, narrowEnd: 6, narrowSide: "back" });
    const backXs = narrowed.vertices.filter((v) => v[2] < -9.9).map((v) => v[0]);
    expect(Math.max(...backXs) - Math.min(...backXs)).toBeCloseTo(6, 3);
  });
});
