import { describe, expect, it } from "vitest";
import { baubleFrame, baubleLayout, baublePositions, baubleTemplate, baubleThicknessMap, fromMercator, mercator } from "@/lib/baubleLithophane";
import { normalizeLithophane } from "@/lib/lithophane";

/** Every edge used twice, once each way: a closed solid with its faces turned the same way. */
function edgeReport(positions: number[]) {
  const key = (index: number) => `${positions[index].toFixed(6)},${positions[index + 1].toFixed(6)},${positions[index + 2].toFixed(6)}`;
  const edges = new Map<string, number>();
  for (let index = 0; index < positions.length; index += 9) {
    const corners = [key(index), key(index + 3), key(index + 6)];
    for (let corner = 0; corner < 3; corner += 1) {
      const a = corners[corner], b = corners[(corner + 1) % 3];
      edges.set(`${a}|${b}`, (edges.get(`${a}|${b}`) ?? 0) + 1);
    }
  }
  let open = 0, doubled = 0;
  for (const [edge, count] of edges) {
    const [a, b] = edge.split("|");
    if (count > 1) doubled += 1;
    if (!edges.has(`${b}|${a}`)) open += 1;
  }
  return { open, doubled };
}

function volume(positions: number[]) {
  let sum = 0;
  for (let index = 0; index < positions.length; index += 9) {
    const [ax, ay, az, bx, by, bz, cx, cy, cz] = positions.slice(index, index + 9);
    sum += ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx);
  }
  return sum / 6;
}

function bounds(positions: number[]) {
  let minY = Infinity, maxY = -Infinity, maxR = 0;
  for (let index = 0; index < positions.length; index += 3) {
    minY = Math.min(minY, positions[index + 1]);
    maxY = Math.max(maxY, positions[index + 1]);
    maxR = Math.max(maxR, Math.hypot(positions[index], positions[index + 2]));
  }
  return { minY, maxY, maxR };
}

const stripe = (u: number, v: number) => ((Math.floor(u * 8) + Math.floor(v * 4)) % 2 ? 0.9 : 0.1);

describe("Christmas bauble lithophane", () => {
  const cases: Array<{ name: string; patch: Record<string, unknown> }> = [
    { name: "hanging, with collar and flat", patch: { flatBase: true } },
    { name: "hanging, round underneath", patch: {} },
    { name: "hanging, no collar", patch: { collar: false } },
    { name: "standing over a light", patch: { openingAt: "bottom" as const, opening: 40 } },
    { name: "three copies round", patch: { copies: 3, diameter: 60 } },
    { name: "smooth outside, picture inside", patch: { reliefOutside: false } },
  ];
  for (const entry of cases) {
    it(`is one closed solid: ${entry.name}`, () => {
      const o = normalizeLithophane({ shape: "bauble", resolution: 1, ...entry.patch });
      const map = baubleThicknessMap(o, 900, 300, stripe);
      const positions = baublePositions(map, o);
      const report = edgeReport(positions);
      expect(report.open).toBe(0);
      expect(report.doubled).toBe(0);
      const solid = volume(positions);
      expect(solid).toBeGreaterThan(0);
      // Never more than a full ball, never less than the shell at its thinnest.
      const r = o.diameter / 2;
      expect(solid).toBeLessThan((4 / 3) * Math.PI * r ** 3 - (4 / 3) * Math.PI * (r - o.maxThickness) ** 3 + 2000);
      expect(bounds(positions).maxR).toBeLessThanOrEqual(r + 1e-6);
    });
  }

  it("keeps the picture's proportions where it lies (shape-true wrap)", () => {
    const o = normalizeLithophane({ shape: "bauble", resolution: 0.5 });
    const layout = baubleLayout(o, 900, 300);
    const r = o.diameter / 2;
    for (const row of [layout.borderRows + 2, Math.round(layout.rows / 2), layout.rows - layout.borderRows - 3]) {
      const span = layout.topMercator - layout.bottomMercator;
      const latitude = fromMercator(layout.topMercator - (span * row) / (layout.rows - 1));
      const next = fromMercator(layout.topMercator - (span * (row + 1)) / (layout.rows - 1));
      const across = (2 * Math.PI * r * Math.cos(latitude)) / layout.columns;
      const down = r * Math.abs(latitude - next);
      // One column and one row cover the same share of picture, so across and down stay alike.
      expect(across / down).toBeGreaterThan(0.97);
      expect(across / down).toBeLessThan(1.03);
    }
  });

  it("follows the photo's proportions and cuts a photo too tall for the ball", () => {
    const o = normalizeLithophane({ shape: "bauble" });
    const wide = baubleLayout(o, 4000, 1000);
    expect(wide.kept).toBe(1);
    expect(fromMercator(wide.topMercator)).toBeLessThan(baubleFrame(o).top + 1e-9);
    const square = baubleLayout(o, 1000, 1000);
    expect(square.kept).toBeLessThan(1);
    expect(fromMercator(square.topMercator)).toBeCloseTo(baubleFrame(o).top, 6);
    expect(fromMercator(square.bottomMercator)).toBeCloseTo(baubleFrame(o).bottom, 6);
  });

  it("makes the opening and collar the size asked", () => {
    const o = normalizeLithophane({ shape: "bauble", resolution: 1, opening: 13 });
    const positions = baublePositions(baubleThicknessMap(o, 900, 300, () => 0.5), o);
    const top = bounds(positions).maxY;
    let nearest = Infinity;
    for (let index = 0; index < positions.length; index += 3) {
      if (Math.abs(positions[index + 1] - top) < 1e-6) nearest = Math.min(nearest, Math.hypot(positions[index], positions[index + 2]));
    }
    expect(nearest).toBeCloseTo(6.5, 1);
  });

  it("sizes the template for the ball and the band", () => {
    const template = baubleTemplate({ diameter: 80, copies: 1 }, 45);
    expect(template.widthPx).toBe(Math.round(Math.PI * 80 * 15));
    expect(template.heightPx).toBe(Math.round(2 * mercator(Math.PI / 4) * 40 * 15));
    expect(template.safeTop).toBeGreaterThan(0);
    expect(template.safeBottom).toBeLessThan(template.heightPx);
    const twice = baubleTemplate({ diameter: 80, copies: 2 }, 45);
    expect(twice.widthPx).toBe(Math.round((Math.PI * 80 * 15) / 2));
    expect(twice.heightPx).toBe(template.heightPx);
  });
});
