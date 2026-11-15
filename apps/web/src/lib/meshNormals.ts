/*
 * Build 114: an imported mesh's normals are kept only when they carry something of their own.
 * An STL's normals are each triangle's own face direction, the same at its three corners: the view
 * works out its own (smooth, as Meshmixer draws a scan) and ignores them, and every other use works
 * them out from the corners again. Kept, they doubled the memory a mesh takes (a 400,000-triangle
 * scan: 28 MB more) in the design, every undo state's store and the saved file.
 */

/** Whether per-corner normals are just each triangle's face (all three corners alike), checked on every triangle. */
export function areFacetNormals(normals: ArrayLike<number>) {
  for (let offset = 0; offset + 8 < normals.length; offset += 9) {
    for (let corner = 3; corner < 9; corner += 3) {
      if (
        Math.abs(normals[offset] - normals[offset + corner]) > 1e-4 ||
        Math.abs(normals[offset + 1] - normals[offset + corner + 1]) > 1e-4 ||
        Math.abs(normals[offset + 2] - normals[offset + corner + 2]) > 1e-4
      ) return false;
    }
  }
  return true;
}

/** The mesh without normals that are only its faces'; the same object when there is nothing to drop. */
export function withoutFacetNormals<T extends { normals?: number[] }>(mesh: T): T {
  if (!mesh.normals || !mesh.normals.length || !areFacetNormals(mesh.normals)) return mesh;
  const { normals: _dropped, ...rest } = mesh;
  void _dropped;
  return rest as T;
}
