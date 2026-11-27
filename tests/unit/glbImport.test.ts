import { describe, expect, it } from "vitest";
import { glbAsStl } from "../../apps/web/src/lib/glbImport";

/** A 30 x 60 x 20 mm box as a GLB, 60 mm along glTF's y (up). */
function boxGlb() {
  const v = [[0, 0, 0], [30, 0, 0], [30, 60, 0], [0, 60, 0], [0, 0, 20], [30, 0, 20], [30, 60, 20], [0, 60, 20]];
  const f = [[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5], [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7]];
  const positions = new Float32Array(v.flat());
  const indices = new Uint16Array(f.flat());
  const bin = new Uint8Array(Math.ceil((positions.byteLength + indices.byteLength) / 4) * 4);
  bin.set(new Uint8Array(positions.buffer), 0);
  bin.set(new Uint8Array(indices.buffer), positions.byteLength);
  const gltf = {
    asset: { version: "2.0" }, scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] }],
    buffers: [{ byteLength: bin.byteLength }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: positions.byteLength }, { buffer: 0, byteOffset: positions.byteLength, byteLength: indices.byteLength }],
    accessors: [{ bufferView: 0, componentType: 5126, count: 8, type: "VEC3", min: [0, 0, 0], max: [30, 60, 20] }, { bufferView: 1, componentType: 5123, count: 36, type: "SCALAR" }],
  };
  let json = new TextEncoder().encode(JSON.stringify(gltf));
  const padded = new Uint8Array(Math.ceil(json.length / 4) * 4).fill(0x20);
  padded.set(json);
  json = padded;
  const total = 12 + 8 + json.length + 8 + bin.length;
  const out = new DataView(new ArrayBuffer(total));
  out.setUint32(0, 0x46546c67, true); out.setUint32(4, 2, true); out.setUint32(8, total, true);
  out.setUint32(12, json.length, true); out.setUint32(16, 0x4e4f534a, true);
  new Uint8Array(out.buffer).set(json, 20);
  out.setUint32(20 + json.length, bin.length, true); out.setUint32(24 + json.length, 0x004e4942, true);
  new Uint8Array(out.buffer).set(bin, 28 + json.length);
  return new File([out.buffer], "skull.glb");
}

describe("GLB import (build 130)", () => {
  it("turns a GLB into an STL standing up (glTF y up becomes z up)", async () => {
    const stl = await glbAsStl(boxGlb());
    expect(stl.name).toBe("skull.stl");
    const view = new DataView(await stl.arrayBuffer());
    const count = view.getUint32(80, true);
    expect(count).toBe(12);
    let zMax = -Infinity;
    for (let index = 0; index < count; index += 1) for (let corner = 0; corner < 3; corner += 1) zMax = Math.max(zMax, view.getFloat32(84 + index * 50 + 12 + corner * 12 + 8, true));
    expect(Math.round(zMax)).toBe(60);
  });
});
