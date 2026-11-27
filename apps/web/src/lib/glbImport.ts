/**
 * Pare 3D (build 129): GLB files (the format image-to-3D tools such as TRELLIS give) come in as meshes.
 * Each .glb is turned into a binary STL of its geometry, in millimetres as given, before the usual mesh
 * import; colours and textures are left behind, as for an STL.
 */
import { Mesh, Scene } from "three";

export function isGlbFile(file: File) {
  return /\.glb$/i.test(file.name);
}

export async function glbAsStl(file: File): Promise<File> {
  const [{ GLTFLoader }, { STLExporter }] = await Promise.all([import("three/examples/jsm/loaders/GLTFLoader.js"), import("three/examples/jsm/exporters/STLExporter.js")]);
  const gltf = await new GLTFLoader().parseAsync(await file.arrayBuffer(), "");
  const scene = new Scene();
  // glTF has y up; an STL (and Pare's mesh import) has z up, as slicers do: stand it up.
  gltf.scene.rotation.x = Math.PI / 2;
  scene.add(gltf.scene);
  scene.updateMatrixWorld(true);
  let meshes = 0;
  scene.traverse((object) => {
    if ((object as Mesh).isMesh) meshes += 1;
  });
  if (!meshes) throw new Error(`${file.name} has no mesh in it.`);
  const stl = new STLExporter().parse(scene, { binary: true }) as DataView;
  const bytes = new Uint8Array(stl.byteLength);
  bytes.set(new Uint8Array(stl.buffer, stl.byteOffset, stl.byteLength));
  return new File([bytes], file.name.replace(/\.glb$/i, ".stl"), { type: "model/stl" });
}

/** The files with every .glb turned into an STL; one that cannot be read is left as it was, for the import to report. */
export async function withGlbAsStl(files: File[]): Promise<File[]> {
  if (!files.some(isGlbFile)) return files;
  return Promise.all(files.map(async (file) => (isGlbFile(file) ? glbAsStl(file).catch(() => file) : file)));
}
