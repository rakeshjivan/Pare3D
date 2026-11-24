import { describe, expect, it } from "vitest";
import { meshPartCount, soupPartCount } from "@/lib/meshPartCount";

/** Two cubes as a triangle soup, `gap` apart along x. */
function twoCubes(gap: number) {
  const cube = (ox: number) => {
    const v = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]].map(([x, y, z]) => [x + ox, y, z]);
    const f = [[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5], [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7]];
    return f.flatMap((face) => face.flatMap((index) => v[index]));
  };
  return [...cube(0), ...cube(1 + gap)];
}

function asMesh(positions: number[]) {
  const vertices: number[][] = [];
  for (let i = 0; i < positions.length; i += 3) vertices.push([positions[i], positions[i + 1], positions[i + 2]]);
  const faces: number[][] = [];
  for (let i = 0; i + 2 < vertices.length; i += 3) faces.push([i, i + 1, i + 2]);
  return { vertices, faces } as never;
}

describe("counting the parts of a flat triangle soup", () => {
  it("gives the same count as the corner-list version", () => {
    for (const gap of [0, 0.0001, 0.5]) {
      const soup = twoCubes(gap);
      expect(soupPartCount(soup, 0.001)).toBe(meshPartCount(asMesh(soup), 0.001));
    }
  });

  it("counts two separate cubes as two and two touching ones as one", () => {
    expect(soupPartCount(twoCubes(0.5), 0.001)).toBe(2);
    expect(soupPartCount(twoCubes(0), 0.001)).toBe(1);
    expect(soupPartCount([], 0.001)).toBe(0);
  });
});
