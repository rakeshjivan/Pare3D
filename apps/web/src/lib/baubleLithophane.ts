import { adjustBrightness, LITHOPHANE_MAX_POINTS, type LithophaneOptions } from "@/lib/lithophane";

/*
 * Build 111: a Christmas bauble lithophane - a hollow ball with the photo wrapped all the way
 * round it, lit from inside through an opening for a fairy light, a tree-light bulb or an LED base.
 *
 * A flat picture cannot cover a ball without changing somewhere. The wrap here is shape-true
 * (the Mercator way, as on a world map): every small part of the picture keeps its proportions,
 * so a face stays a face and a circle stays round. What changes is size: things near the top and
 * bottom of the band print smaller (at 45 degrees, at 71%). The template shows where, so faces and
 * words go in the middle. The band's height follows the photo's proportions, like a flat
 * lithophane; a photo too tall for the ball is cut at the top and bottom, never squashed.
 *
 * The picture band is the relief; above and below it the ball is a plain shell as thick as the
 * thickest part. The opening has an optional collar that grips the light. With the opening at the
 * bottom the ball stands over a light; with it at the top it hangs, and has a small flat to print on.
 * Sizes in mm.
 */

export type BaubleOpeningAt = "top" | "bottom";

/** Asks the editor to open the bauble maker (from the command search). */
export const OPEN_BAUBLE_EVENT = "pare3d:open-bauble";

/** Collar round the opening: wall thickness and how far it stands out of the ball. */
export const BAUBLE_COLLAR = { wall: 2, height: 6 } as const;
/** The flat a hanging bauble prints on, as a share of its diameter, and the floor's thickness. */
export const BAUBLE_FOOT = { share: 0.28, floor: 1.6 } as const;
/** The picture keeps this far (in latitude) from the opening and the foot. */
const BAUBLE_EDGE_MARGIN = (8 * Math.PI) / 180;
/** The lowest a band reaches on a ball with no foot (the round end). */
const BAUBLE_POLE_LIMIT = (72 * Math.PI) / 180;
/** Template pixels per mm round the middle (about 380 dpi). */
export const BAUBLE_TEMPLATE_PX_PER_MM = 15;

/** Ready lights: the opening they need and where it goes. */
export const BAUBLE_LIGHTS = [
  { id: "fairy", opening: 7, at: "top" },
  { id: "bulb", opening: 13, at: "top" },
  { id: "base", opening: 40, at: "bottom" },
] as const satisfies ReadonlyArray<{ id: string; opening: number; at: BaubleOpeningAt }>;

/** Template bands: how far above and below the middle the picture reaches. */
export const BAUBLE_BANDS = [
  { id: "slim", degrees: 30 },
  { id: "standard", degrees: 45 },
  { id: "tall", degrees: 55 },
] as const;

export const mercator = (latitude: number) => Math.log(Math.tan(Math.PI / 4 + latitude / 2));
export const fromMercator = (value: number) => 2 * Math.atan(Math.exp(value)) - Math.PI / 2;

type BaubleSettings = Pick<LithophaneOptions, "diameter" | "opening" | "openingAt" | "collar" | "copies" | "maxThickness"> & { flatBase?: boolean };

/** The ball's fixed parts: radii, opening and how far up and down a picture may reach. */
export function baubleFrame(o: BaubleSettings) {
  const radius = o.diameter / 2;
  const shell = o.maxThickness;
  const innerRadius = radius - shell;
  const collar = o.collar ? BAUBLE_COLLAR : null;
  // The opening never takes more than most of the inside, so the collar still has a sphere to sit on.
  const hole = Math.min(o.opening / 2, innerRadius * 0.75 - (collar ? collar.wall : 0));
  const outerEdge = hole + (collar ? collar.wall : 0);
  // Where the opening (or the collar round it) leaves the outside of the ball.
  const openingLatitude = Math.acos(Math.min(1, outerEdge / radius));
  // A hanging ball is round underneath unless asked for a small flat to print on; one standing over a light is round there.
  const foot = o.openingAt === "top" && o.flatBase ? radius * BAUBLE_FOOT.share : 0;
  const footLatitude = foot ? -Math.acos(foot / radius) : -Math.PI / 2;
  const top = openingLatitude - BAUBLE_EDGE_MARGIN;
  const bottom = foot ? footLatitude + BAUBLE_EDGE_MARGIN : -BAUBLE_POLE_LIMIT;
  return { radius, innerRadius, shell, hole, collar, outerEdge, openingLatitude, foot, footLatitude, top, bottom };
}

/**
 * Where the picture goes, built (like every ball here) with the opening at the top; a ball with
 * the opening at the bottom is turned over afterwards, so its picture is read upside down here.
 * Heights are "mm round the middle": at the middle a mm of picture is a mm of ball.
 */
export function baubleLayout(o: LithophaneOptions, imageWidth: number, imageHeight: number) {
  const frame = baubleFrame(o);
  const copies = Math.max(1, Math.round(o.copies));
  const around = Math.PI * o.diameter;
  const naturalHeight = (around / copies) * (imageHeight / Math.max(1, imageWidth));
  const top = mercator(frame.top);
  const bottom = mercator(frame.bottom);
  let half = (naturalHeight / 2 + o.border) / frame.radius;
  let pictureHeight = naturalHeight;
  let middle = 0;
  if (2 * half > top - bottom) {
    // Too tall for the ball: keep the middle of the photo and cut its top and bottom.
    half = (top - bottom) / 2;
    pictureHeight = Math.max(1, 2 * (half * frame.radius - o.border));
    middle = (top + bottom) / 2;
  } else {
    // Centred on the middle of the ball when it fits; moved up or down just enough when it doesn't.
    middle = Math.min(top - half, Math.max(bottom + half, 0));
  }
  const kept = Math.min(1, pictureHeight / naturalHeight);
  let step = o.resolution;
  const bandHeight = 2 * half * frame.radius;
  const count = (s: number) => Math.max(8, Math.round(around / s)) * (Math.round(bandHeight / s) + 1);
  while (count(step) > LITHOPHANE_MAX_POINTS) step *= 1.1;
  const columns = Math.max(8, Math.round(around / step));
  const rows = Math.round(bandHeight / step) + 1;
  const borderRows = o.border > 0 ? Math.max(1, Math.round(o.border / step)) : 0;
  return {
    frame,
    copies,
    columns,
    rows,
    borderRows,
    step,
    topMercator: middle + half,
    bottomMercator: middle - half,
    pictureTop: fromMercator(middle + half - o.border / frame.radius),
    pictureBottom: fromMercator(middle - half + o.border / frame.radius),
    kept,
  };
}

/** Thickness at every point of the band, row by row from the top, the first column at the back. */
export function baubleThicknessMap(o: LithophaneOptions, imageWidth: number, imageHeight: number, sample: (u: number, v: number) => number) {
  const layout = baubleLayout(o, imageWidth, imageHeight);
  const { columns, rows, borderRows, copies, kept } = layout;
  const pictureRows = Math.max(2, rows - 2 * borderRows);
  const flip = o.openingAt === "bottom";
  const thickness = new Float32Array(columns * rows);
  for (let row = 0; row < rows; row += 1) {
    const pictureRow = row - borderRows;
    const inBand = pictureRow >= 0 && pictureRow < pictureRows;
    for (let column = 0; column < columns; column += 1) {
      if (!inBand) {
        thickness[row * columns + column] = o.maxThickness;
        continue;
      }
      // Each copy covers its share of the way round; the picture's middle faces the front.
      const around = (column / columns) * copies;
      const u = around - Math.floor(around);
      let v = 0.5 + (pictureRow / (pictureRows - 1) - 0.5) * kept;
      if (flip) v = 1 - v;
      const light = adjustBrightness(sample(u, v), o);
      thickness[row * columns + column] = o.minThickness + (1 - light) * (o.maxThickness - o.minThickness);
    }
  }
  return { thickness, layout };
}

type Vec3 = [number, number, number];

/**
 * The ball as triangle positions, y up, centred on the y axis. It is one closed solid: the smooth
 * outside, the relief inside the band, the plain shell above and below, the opening (and collar)
 * at the top, and the flat or round end at the bottom. Turned over when the opening goes below.
 */
export function baublePositions(map: { thickness: Float32Array; layout: ReturnType<typeof baubleLayout> }, o: LithophaneOptions): number[] {
  const { thickness, layout } = map;
  const { columns, rows, frame } = layout;
  const angles = new Float64Array(columns);
  const sines = new Float64Array(columns);
  const cosines = new Float64Array(columns);
  for (let column = 0; column < columns; column += 1) {
    // The seam (column 0) at the back, so the picture's middle is at the front (+z).
    angles[column] = (2 * Math.PI * column) / columns - Math.PI;
    sines[column] = Math.sin(angles[column]);
    cosines[column] = Math.cos(angles[column]);
  }
  const point = (ring: number, y: number, column: number): Vec3 => {
    const c = column % columns;
    return [ring * sines[c], y, ring * cosines[c]];
  };
  const positions: number[] = [];
  const same = (a: Vec3, b: Vec3) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
  const tri = (a: Vec3, b: Vec3, c: Vec3) => {
    if (same(a, b) || same(b, c) || same(a, c)) return;
    positions.push(...a, ...b, ...c);
  };
  /*
   * A ring of quads between two profile points, all the way round. Profiles are walked clockwise
   * in the (distance from axis, height) plane - down the outside, up the inside - which makes
   * (k, j), (k+1, j), (k, j+1) face out of the solid.
   */
  const strip = (a: (column: number) => Vec3, b: (column: number) => Vec3) => {
    for (let column = 0; column < columns; column += 1) {
      const next = column + 1;
      tri(a(column), b(column), a(next));
      tri(b(column), b(next), a(next));
    }
  };
  const revolve = (profile: Array<[number, number]>) => {
    for (let index = 0; index < profile.length - 1; index += 1) {
      const [ringA, yA] = profile[index];
      const [ringB, yB] = profile[index + 1];
      strip((column) => point(ringA, yA, column), (column) => point(ringB, yB, column));
    }
  };
  const sphere = (radius: number, from: number, to: number) => {
    // Points on a sphere's outline from one latitude to another, about every 2 degrees, both ends included.
    const count = Math.max(1, Math.ceil(Math.abs(to - from) / ((2 * Math.PI) / 180)));
    const out: Array<[number, number]> = [];
    for (let index = 0; index <= count; index += 1) {
      // The ends exactly as given, so the rings meet the band's to the last digit.
    const latitude = index === 0 ? from : index === count ? to : from + ((to - from) * index) / count;
      out.push([radius * Math.cos(latitude), radius * Math.sin(latitude)]);
    }
    return out;
  };
  const latitudeOfRow = (row: number) => fromMercator(layout.topMercator - ((layout.topMercator - layout.bottomMercator) * row) / (rows - 1));
  const bandTop = latitudeOfRow(0);
  const bandBottom = latitudeOfRow(rows - 1);
  const { radius, innerRadius, hole } = frame;

  // The band: outside going down, inside going up. The relief is on the outside (seen on screen,
  // a textured ball when unlit) or, with a smooth outside, on the inside; the light only sees thickness.
  const reliefOutside = o.reliefOutside !== false;
  const depthAt = (row: number, column: number) => (row === 0 || row === rows - 1 ? frame.shell : thickness[row * columns + (column % columns)]);
  const surface = (outer: boolean) => (row: number, column: number): Vec3 => {
    const latitude = latitudeOfRow(row);
    const r = outer
      ? (reliefOutside ? innerRadius + depthAt(row, column) : radius)
      : (reliefOutside ? innerRadius : radius - depthAt(row, column));
    return point(r * Math.cos(latitude), r * Math.sin(latitude), column);
  };
  const outside = surface(true);
  const inside = surface(false);
  for (let row = 0; row < rows - 1; row += 1) {
    strip((column) => outside(row, column), (column) => outside(row + 1, column));
  }
  for (let row = rows - 1; row > 0; row -= 1) {
    strip((column) => inside(row, column), (column) => inside(row - 1, column));
  }

  // Above the band: up the inside to the opening, up its wall (and the collar), down the outside.
  const top: Array<[number, number]> = [];
  const innerOpening = Math.acos(Math.min(1, hole / innerRadius));
  top.push(...sphere(innerRadius, bandTop, innerOpening));
  if (frame.collar) {
    const outerOpening = Math.acos(Math.min(1, frame.outerEdge / radius));
    const collarTop = radius * Math.sin(outerOpening) + frame.collar.height;
    top.push([hole, collarTop], [frame.outerEdge, collarTop]);
    top.push(...sphere(radius, outerOpening, bandTop));
  } else {
    const outerOpening = Math.acos(Math.min(1, hole / radius));
    top.push(...sphere(radius, outerOpening, bandTop));
  }
  revolve(top);

  // Below the band: down the outside to the flat (or the round end), across, and up the inside.
  const bottom: Array<[number, number]> = [];
  if (frame.foot) {
    const footY = -Math.sqrt(radius * radius - frame.foot * frame.foot);
    bottom.push(...sphere(radius, bandBottom, frame.footLatitude), [0, footY]);
    const floorY = footY + Math.max(BAUBLE_FOOT.floor, frame.shell);
    if (floorY > -innerRadius) {
      const floorRing = Math.sqrt(innerRadius * innerRadius - floorY * floorY);
      bottom.push([0, floorY], [floorRing, floorY], ...sphere(innerRadius, Math.asin(floorY / innerRadius), bandBottom).slice(1));
    } else {
      bottom.push(...sphere(innerRadius, -Math.PI / 2, bandBottom));
    }
  } else {
    bottom.push(...sphere(radius, bandBottom, -Math.PI / 2));
    bottom.push(...sphere(innerRadius, -Math.PI / 2, bandBottom));
  }
  // Points on the axis are where a ring closes; the outside and inside each end there in their own point.
  revolve(bottom.map(([ring, y]) => [Math.abs(ring) < 1e-9 ? 0 : ring, y] as [number, number]));
  // Between the outside's last point on the axis and the inside's first, there is no surface.
  if (o.openingAt === "bottom") {
    // Turned over: heights mirror, so every triangle's corners swap order to keep facing out.
    const flipped = new Array<number>(positions.length);
    for (let index = 0; index < positions.length; index += 9) {
      for (let corner = 0; corner < 3; corner += 1) {
        const from = index + [0, 2, 1][corner] * 3;
        const to = index + corner * 3;
        flipped[to] = positions[from];
        flipped[to + 1] = -positions[from + 1];
        flipped[to + 2] = positions[from + 2];
      }
    }
    return flipped;
  }
  return positions;
}

/** The template's size and its guide lines, for a band reaching `degrees` above and below the middle. */
export function baubleTemplate(o: Pick<LithophaneOptions, "diameter" | "copies">, degrees: number) {
  const copies = Math.max(1, Math.round(o.copies));
  const radius = o.diameter / 2;
  const half = mercator((degrees * Math.PI) / 180);
  const widthMm = (Math.PI * o.diameter) / copies;
  const heightMm = 2 * half * radius;
  const widthPx = Math.round(widthMm * BAUBLE_TEMPLATE_PX_PER_MM);
  const heightPx = Math.round(heightMm * BAUBLE_TEMPLATE_PX_PER_MM);
  // Lines every 15 degrees, with how big the picture prints there.
  const lines: Array<{ degrees: number; y: number; scale: number }> = [];
  for (let latitude = -Math.floor(degrees / 15) * 15; latitude <= degrees; latitude += 15) {
    const y = heightPx / 2 - (mercator((latitude * Math.PI) / 180) / half) * (heightPx / 2);
    lines.push({ degrees: latitude, y, scale: Math.cos((latitude * Math.PI) / 180) });
  }
  // The zone that prints at 90% or more: for faces and words.
  const safeHalf = (mercator(Math.acos(0.9)) / half) * (heightPx / 2);
  return { widthPx, heightPx, widthMm, heightMm, copies, lines, safeTop: heightPx / 2 - safeHalf, safeBottom: heightPx / 2 + safeHalf };
}
