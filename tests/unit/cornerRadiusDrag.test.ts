import { describe, expect, it } from "vitest";
import { cornerRadiusDragPatch } from "@/lib/roundedBoxGeometry";

describe("corner radius dot (build 115)", () => {
  it("turns a plain box into a rounded box with flat top on the first pull", () => {
    expect(cornerRadiusDragPatch({ kind: "box", width: 20, depth: 30, size: 20 }, -4)).toEqual({ kind: "roundedBox", cornerFillet: 4, topBottomFillet: 0 });
  });
  it("grows away from the corner, shrinks towards it, within half the narrow side", () => {
    const start = { kind: "roundedBox", width: 20, depth: 30, size: 20, cornerFillet: 5 };
    expect(cornerRadiusDragPatch(start, -3)).toEqual({ cornerFillet: 8 });
    expect(cornerRadiusDragPatch(start, 2)).toEqual({ cornerFillet: 3 });
    expect(cornerRadiusDragPatch(start, -40)).toEqual({ cornerFillet: 10 });
    expect(cornerRadiusDragPatch(start, 40)).toEqual({ cornerFillet: 0 });
  });
});
