import { isSupportRib } from "@/lib/supportRibMark";
import { bedOverhangs, shapeBedFootprint, shapeVerticalExtent } from "@/lib/printBed";
import { overhangDownwardLimit } from "@/lib/overhangLimits";
import { shapeBelowBed } from "@/lib/cutBelowBed";
import { isNonSolidShapeKind, shapeDepth, shapeWidth } from "@/lib/workplaneShapes";
import { meshForShape, type MeshData } from "@/lib/editorMeshCore";
import { weldOnGrid } from "@/lib/gridWeld";
import { displayShapeName } from "@/lib/shapeCatalog";
import type { ClearanceBox } from "@/lib/clearanceCheck";
import type { WorkplaneShape } from "@/types/layerling";

/*
 * Fork (build 19): "Ready to print?" - a quick look at the design before it goes to the slicer, for
 * the things that most often spoil a first print. Each finding names the parts it is about, so
 * the panel can select them.
 */

export type PrintIssueKind = "nothing" | "outside" | "belowBed" | "floating" | "looseHole" | "thin" | "overhang" | "hidden";

export type PrintIssue = {
  kind: PrintIssueKind;
  /** "problem" will most likely spoil the print; "advice" is worth a look. */
  level: "problem" | "advice";
  ids: string[];
  names: string[];
  /** The figure the message gives: mm, mm², a count. */
  amount?: number;
};

/** Thinner than this across, a wall is under two lines of a 0.4 mm nozzle. */
export const THIN_WALL_MM = 0.8;
/** Below this a part counts as resting on the plate or on another part. */
const REST_TOLERANCE = 0.2;
/** Overhang area worth mentioning, mm² - a chamfer or a small bridge does not count. */
const OVERHANG_AREA_MM2 = 40;

type Options = {
  bed?: { width: number; depth: number; height?: number } | null;
  overhangAngle: number;
  meshFor: (shape: WorkplaneShape) => MeshData;
};

function overlaps(a: ReturnType<typeof shapeBedFootprint>, b: ReturnType<typeof shapeBedFootprint>) {
  return a.minX < b.maxX && b.minX < a.maxX && a.minZ < b.maxZ && b.minZ < a.maxZ;
}

/** The area of a body's downward faces steeper than the printer manages, not counting the bottom resting on `base`. */
export function overhangArea(mesh: MeshData, base: number, angle: number) {
  const limit = overhangDownwardLimit(angle);
  let area = 0;
  for (const [a, b, c] of mesh.faces) {
    const p = mesh.vertices[a];
    const q = mesh.vertices[b];
    const r = mesh.vertices[c];
    if (!p || !q || !r) continue;
    const ux = q[0] - p[0], uy = q[1] - p[1], uz = q[2] - p[2];
    const vx = r[0] - p[0], vy = r[1] - p[1], vz = r[2] - p[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const length = Math.hypot(nx, ny, nz);
    if (length < 1e-9) continue;
    if (-ny / length <= limit) continue;
    if (Math.min(p[1], q[1], r[1]) <= base + REST_TOLERANCE) continue;
    area += length / 2;
  }
  return area;
}

export function checkForPrinting(shapes: readonly WorkplaneShape[], options: Options): PrintIssue[] {
  const issues: PrintIssue[] = [];
  const visible = shapes.filter((shape) => !isNonSolidShapeKind(shape.kind));
  const printed = visible.filter((shape) => !shape.hole && !shape.hidden);
  const named = (list: readonly WorkplaneShape[]) => ({ ids: list.map((shape) => shape.id), names: list.map((shape) => shape.name) });
  if (printed.length === 0) return [{ kind: "nothing", level: "problem", ids: [], names: [] }];

  if (options.bed) {
    const outside = bedOverhangs(printed, options.bed.width, options.bed.depth, options.bed.height).map((entry) => entry.shape);
    if (outside.length) issues.push({ kind: "outside", level: "problem", ...named(outside) });
  }

  // Fork (build 30): sunk below the plate - the slicer cuts that off, often by surprise.
  const sunk = printed.filter((shape) => {
    try {
      return shapeBelowBed(shape) !== null;
    } catch {
      return false;
    }
  });
  if (sunk.length) issues.push({ kind: "belowBed", level: "advice", ...named(sunk) });

  // Floating: above the lowest part, and nothing printed under it to stand on.
  const extents = new Map(printed.map((shape) => [shape.id, shapeVerticalExtent(shape)]));
  const footprints = new Map(printed.map((shape) => [shape.id, shapeBedFootprint(shape)]));
  const base = Math.min(...[...extents.values()].map((extent) => extent.minY));
  const floating = printed.filter((shape) => {
    const own = extents.get(shape.id)!;
    if (own.minY <= base + REST_TOLERANCE) return false;
    return !printed.some((other) => other.id !== shape.id
      && extents.get(other.id)!.maxY >= own.minY - REST_TOLERANCE
      && extents.get(other.id)!.minY < own.minY
      && overlaps(footprints.get(shape.id)!, footprints.get(other.id)!));
  });
  if (floating.length) issues.push({ kind: "floating", level: "problem", ...named(floating) });

  // A hole on its own is not printed and cuts nothing: it has to be grouped with what it should cut.
  const looseHoles = visible.filter((shape) => shape.hole && !shape.hidden);
  if (looseHoles.length) issues.push({ kind: "looseHole", level: "problem", ...named(looseHoles) });

  // A support rib is two lines thick and its bridges overhang on purpose (Discussion #1385).
  const thin = printed.filter((shape) => !isSupportRib(shape) && Math.min(shapeWidth(shape), shapeDepth(shape)) < THIN_WALL_MM);
  if (thin.length) issues.push({ kind: "thin", level: "advice", ...named(thin), amount: THIN_WALL_MM });

  const overhanging: WorkplaneShape[] = [];
  let worst = 0;
  for (const shape of printed.filter((entry) => !isSupportRib(entry))) {
    try {
      const area = overhangArea(options.meshFor(shape), base, options.overhangAngle);
      if (area >= OVERHANG_AREA_MM2) {
        overhanging.push(shape);
        worst = Math.max(worst, area);
      }
    } catch {
      // A body whose mesh cannot be read is left out of this one check.
    }
  }
  if (overhanging.length) issues.push({ kind: "overhang", level: "advice", ...named(overhanging), amount: Math.round(worst) });

  const hidden = visible.filter((shape) => shape.hidden && !shape.hole);
  if (hidden.length) issues.push({ kind: "hidden", level: "advice", ...named(hidden) });
  return issues;
}

export type PrintCheckOpenMesh = { id: string; name: string; openEdges: number; nonManifoldEdges: number; box: ClearanceBox };

const OPEN_EDGE_SHIFT = 2 ** 26;
/** Open edges (one face only) and edges with more than two faces of an indexed mesh. */
function meshEdgeReport(indices: Uint32Array) {
  const count = new Map<number, number>();
  for (let t = 0; t < indices.length; t += 3) {
    for (let k = 0; k < 3; k += 1) {
      const a = indices[t + k], b = indices[t + ((k + 1) % 3)];
      const key = a < b ? a * OPEN_EDGE_SHIFT + b : b * OPEN_EDGE_SHIFT + a;
      count.set(key, (count.get(key) ?? 0) + 1);
    }
  }
  let openEdges = 0, nonManifoldEdges = 0;
  count.forEach((c) => {
    if (c === 1) openEdges += 1;
    else if (c > 2) nonManifoldEdges += 1;
  });
  return { openEdges, nonManifoldEdges };
}

/**
 * Edges that one triangle uses (the surface is open there) and edges that three or more share, for every checked
 * object that is a mesh: an import, or what a cut made of one. The editor's own shapes are closed. Counted as the
 * surface texture counts them (surfaceMeshReport), on corners joined where they lie within a ten-thousandth of a
 * millimetre, by number (weldOnGrid): text keys took close to a second for 200,000 triangles.
 */
export function printCheckOpenMeshes(shapes: readonly WorkplaneShape[]): PrintCheckOpenMesh[] {
  const found: PrintCheckOpenMesh[] = [];
  for (const shape of shapes) {
    if (!shape.importedMesh) continue;
    const mesh = meshForShape(shape);
    if (!mesh.faces.length) continue;
    const { ids, count } = weldOnGrid(mesh.vertices, 1e-4);
    const corners: number[] = [];
    for (const [a, b, c] of mesh.faces) {
      // A triangle folded onto a line has no edges of its own.
      if (ids[a] !== ids[b] && ids[b] !== ids[c] && ids[c] !== ids[a]) corners.push(ids[a], ids[b], ids[c]);
    }
    const report = meshEdgeReport(Uint32Array.from(corners));
    if (!report.openEdges && !report.nonManifoldEdges) continue;
    const box: ClearanceBox = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
    for (const vertex of mesh.vertices) {
      for (let axis = 0; axis < 3; axis += 1) {
        box.min[axis] = Math.min(box.min[axis], vertex[axis]);
        box.max[axis] = Math.max(box.max[axis], vertex[axis]);
      }
    }
    found.push({ id: shape.id, name: displayShapeName(shape), openEdges: report.openEdges, nonManifoldEdges: report.nonManifoldEdges, box });
  }
  return found;
}
