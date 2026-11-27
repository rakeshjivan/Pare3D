"""Pare 3D (build 134): rebuild a generated mesh as one closed, printable solid.

Image-to-3D meshes (TRELLIS.2 without its Metal clean-up in particular) come out with holes, loose
bits and inner walls. This rebuilds the object from its volume instead of patching its surface:

1. The surface is sampled densely and marked in a voxel grid (about RESOLUTION cells along the
   longest side).
2. A closing (dilate, fill the inside, erode back) seals gaps up to a few cells wide and fills the
   inside, so the object is a solid volume.
3. Only the largest connected piece is kept (specks and floaters go).
4. A smooth surface is laid over that volume with surface nets (one vertex per boundary cell, at the
   mean of the edge crossings), after filling the voxel patterns that touch only at an edge or a corner,
   so that every edge has exactly two faces: a closed manifold.
5. Light Taubin smoothing (which keeps it closed), then a binary STL.

Usage: python watertight.py input(.glb/.obj/.stl) output.stl [resolution]
Runs in trellis-silicon's own environment: numpy, scipy, trimesh and fast_simplification only.
"""
import sys

import numpy as np
import trimesh
from scipy import ndimage

RESOLUTION = 440


def load(path):
    loaded = trimesh.load(path, force="mesh", process=False)
    if isinstance(loaded, trimesh.Scene):
        loaded = loaded.dump(concatenate=True)
    return trimesh.Trimesh(vertices=np.asarray(loaded.vertices, dtype=np.float64), faces=np.asarray(loaded.faces), process=True)


def occupancy(mesh, resolution):
    lo, hi = mesh.bounds
    pitch = float((hi - lo).max()) / resolution
    pad = 6
    origin = lo - pad * pitch
    shape = np.ceil((hi - lo) / pitch).astype(int) + 2 * pad + 1
    # Points close enough together that every cell the surface passes through gets one.
    count = int(min(40_000_000, max(200_000, mesh.area / (pitch * 0.35) ** 2)))
    points, _ = trimesh.sample.sample_surface(mesh, count)
    points = np.vstack([points, mesh.vertices])
    index = np.floor((points - origin) / pitch).astype(int)
    index = np.clip(index, 0, shape - 1)
    grid = np.zeros(shape, dtype=bool)
    grid[index[:, 0], index[:, 1], index[:, 2]] = True
    return grid, origin, pitch


def solidify(grid):
    """The smallest closing that gives the surface an inside: holes wider than a few cells need more."""
    ball = ndimage.generate_binary_structure(3, 1)
    shell = int(grid.sum())
    for close in (2, 3, 5, 8, 12, 16):
        sealed = ndimage.binary_dilation(grid, ball, iterations=close)
        filled = ndimage.binary_fill_holes(sealed)
        if filled.sum() > sealed.sum() + shell * 0.5:
            break
    print(f"Pare: sealed gaps up to about {2 * close} cells", flush=True)
    solid = ndimage.binary_erosion(filled, ball, iterations=close, border_value=0)
    solid |= ndimage.binary_fill_holes(grid)
    labels, count = ndimage.label(solid)
    if count > 1:
        sizes = ndimage.sum(solid, labels, range(1, count + 1))
        solid = labels == (int(np.argmax(sizes)) + 1)
    return solid


def well_composed(solid):
    """Fill the voxel patterns that touch only along an edge or at a corner (in either the solid or the
    space round it); without them every boundary edge is shared by exactly two faces, so the surface laid
    over the volume is a closed manifold."""
    solid = solid.copy()
    for _ in range(50):
        changed = 0
        for axis in range(3):
            u, v = [d for d in range(3) if d != axis]
            def take(du, dv):
                index = [slice(None)] * 3
                index[u] = slice(du, solid.shape[u] - 1 + du)
                index[v] = slice(dv, solid.shape[v] - 1 + dv)
                return tuple(index)
            a, b, c, d = solid[take(0, 0)], solid[take(1, 0)], solid[take(0, 1)], solid[take(1, 1)]
            diagonal = (a & d & ~b & ~c) | (b & c & ~a & ~d)
            if diagonal.any():
                changed += int(diagonal.sum())
                view = solid[take(0, 0)]
                view |= diagonal  # fill one of the two empty corners of each such square
                solid[take(0, 0)] = view
                view = solid[take(1, 0)]
                view |= diagonal
                solid[take(1, 0)] = view
        n = solid.shape
        cube = [solid[i:n[0] - 1 + i, j:n[1] - 1 + j, k:n[2] - 1 + k] for i in (0, 1) for j in (0, 1) for k in (0, 1)]
        total = sum(c.astype(np.int8) for c in cube)
        for first, second in ((0, 7), (1, 6), (2, 5), (3, 4)):
            lone = cube[first] & cube[second] & (total == 2)
            hollow = ~cube[first] & ~cube[second] & (total == 6)
            fix = lone | hollow
            if fix.any():
                changed += int(fix.sum())
                i, j, k = ((first >> 2) & 1, (first >> 1) & 1, first & 1)
                # fill the corner next to the first one along x (or the empty one itself for hollow)
                ni = 1 - i
                target = solid[ni:n[0] - 1 + ni, j:n[1] - 1 + j, k:n[2] - 1 + k]
                target |= lone
                solid[ni:n[0] - 1 + ni, j:n[1] - 1 + j, k:n[2] - 1 + k] = target
                target = solid[i:n[0] - 1 + i, j:n[1] - 1 + j, k:n[2] - 1 + k]
                target |= hollow
                solid[i:n[0] - 1 + i, j:n[1] - 1 + j, k:n[2] - 1 + k] = target
                total = sum(c.astype(np.int8) for c in [solid[a:n[0] - 1 + a, b:n[1] - 1 + b, c:n[2] - 1 + c] for a in (0, 1) for b in (0, 1) for c in (0, 1)])
                cube = [solid[a:n[0] - 1 + a, b:n[1] - 1 + b, c:n[2] - 1 + c] for a in (0, 1) for b in (0, 1) for c in (0, 1)]
        if not changed:
            break
    return solid


def surface_nets(field, level):
    """Vertices in the cells that the level crosses; a quad round every grid edge it crosses."""
    nx, ny, nz = field.shape
    inside = field > level
    # Cells are the cubes between 2x2x2 neighbouring samples.
    corners = [(i, j, k) for i in (0, 1) for j in (0, 1) for k in (0, 1)]
    c = np.stack([inside[i:nx - 1 + i, j:ny - 1 + j, k:nz - 1 + k] for i, j, k in corners])
    mixed = c.any(0) & ~c.all(0)
    cell_index = -np.ones(mixed.shape, dtype=np.int64)
    cells = np.argwhere(mixed)
    cell_index[mixed] = np.arange(len(cells))
    # Vertex: mean of the crossing points on the cell's 12 edges.
    acc = np.zeros((len(cells), 3))
    hits = np.zeros(len(cells))
    edges = [((0, 0, 0), (1, 0, 0)), ((0, 1, 0), (1, 1, 0)), ((0, 0, 1), (1, 0, 1)), ((0, 1, 1), (1, 1, 1)),
             ((0, 0, 0), (0, 1, 0)), ((1, 0, 0), (1, 1, 0)), ((0, 0, 1), (0, 1, 1)), ((1, 0, 1), (1, 1, 1)),
             ((0, 0, 0), (0, 0, 1)), ((1, 0, 0), (1, 0, 1)), ((0, 1, 0), (0, 1, 1)), ((1, 1, 0), (1, 1, 1))]
    ci, cj, ck = cells.T
    for a, b in edges:
        va = field[ci + a[0], cj + a[1], ck + a[2]]
        vb = field[ci + b[0], cj + b[1], ck + b[2]]
        cross = (va > level) != (vb > level)
        t = np.where(cross, (level - va) / np.where(va == vb, 1, vb - va), 0)
        point = np.stack([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]), a[2] + t * (b[2] - a[2])], 1)
        acc += np.where(cross[:, None], point, 0)
        hits += cross
    vertices = cells + acc / np.maximum(hits, 1)[:, None]
    # Quads: every grid edge whose two samples differ is surrounded by four cells.
    faces = []
    for axis in range(3):
        u, v = ((1, 2), (2, 0), (0, 1))[axis]  # right-handed, so every quad winds the same way
        n = field.shape[axis]
        a = np.take(inside, np.arange(0, n - 1), axis=axis)
        b = np.take(inside, np.arange(1, n), axis=axis)
        pts = np.argwhere(a != b)
        # the four cells round the edge must lie inside the cell grid
        ok = (pts[:, u] >= 1) & (pts[:, v] >= 1) & (pts[:, u] <= field.shape[u] - 2) & (pts[:, v] <= field.shape[v] - 2)
        pts = pts[ok]
        flip = inside[tuple(pts.T)]
        quad = []
        for du, dv in ((-1, -1), (0, -1), (0, 0), (-1, 0)):
            q = pts.copy()
            q[:, u] += du
            q[:, v] += dv
            quad.append(cell_index[tuple(q.T)])
        quad = np.stack(quad, 1)
        quad = np.where(flip[:, None], quad, quad[:, ::-1])
        faces.append(np.concatenate([quad[:, [0, 1, 2]], quad[:, [0, 2, 3]]]))
    faces = np.concatenate(faces)
    faces = faces[(faces >= 0).all(1)]
    return vertices, faces


def main():
    source, target = sys.argv[1], sys.argv[2]
    resolution = int(sys.argv[3]) if len(sys.argv) > 3 else RESOLUTION
    mesh = load(source)
    if source.lower().endswith(".glb"):
        # glTF has y up; the STL goes out with z up, as slicers and Pare's import expect (as for a GLB import).
        mesh.apply_transform(trimesh.transformations.rotation_matrix(np.pi / 2, [1, 0, 0]))
    # Already closed (TRELLIS.2's own remesh): tidy it and keep its detail. Floaters under 0.5% of the
    # surface go; what is left must be closed, consistently wound and positive in volume for slicers.
    mesh.update_faces(mesh.nondegenerate_faces())
    mesh.update_faces(mesh.unique_faces())
    mesh.remove_unreferenced_vertices()
    parts = mesh.split(only_watertight=False)
    total = sum(part.area for part in parts) or 1
    kept = [part for part in parts if part.area >= 0.005 * total]
    if kept and all(part.is_watertight and part.is_winding_consistent for part in kept):
        closed = trimesh.util.concatenate(kept)
        trimesh.repair.fix_normals(closed, multibody=True)
        if all(part.volume > 0 for part in closed.split(only_watertight=False)):
            closed.export(target)
            # The STL as a slicer reads it (vertices welded by position) must still be closed.
            if not trimesh.load(target).is_watertight:
                print("Pare: closed in memory but not as an STL; rebuilding", flush=True)
                return rebuild(mesh, target, resolution)
            print(f"Pare: already closed, kept as made ({len(closed.faces):,} triangles, {len(kept)} part(s), {len(parts) - len(kept)} speck(s) removed)", flush=True)
            return
    rebuild(mesh, target, resolution)


def rebuild(mesh, target, resolution):
    print(f"Pare: rebuilding {len(mesh.faces):,} triangles as a closed solid", flush=True)
    grid, origin, pitch = occupancy(mesh, resolution)
    solid = solidify(grid)
    # One cell of growth keeps every part at least three cells thick, so no two pieces of surface meet at
    # one point (a slicer reads those as non-manifold); the inset below takes it back.
    solid = well_composed(ndimage.binary_dilation(solid, ndimage.generate_binary_structure(3, 1)))
    vertices, faces = surface_nets(solid.astype(np.float32), 0.5)
    vertices = origin + (vertices + 0.5) * pitch
    out = trimesh.Trimesh(vertices=vertices, faces=faces, process=True)
    trimesh.repair.fix_normals(out, multibody=False)
    trimesh.smoothing.filter_taubin(out, lamb=0.5, nu=-0.53, iterations=6)
    # The marked cells reach about half a cell past the real surface, and the growth one more. Moving the
    # surface back along its normals can fold thin parts onto themselves, so the size is put back with a
    # uniform scale about the centre instead (the mesh is resized to the wanted size anyway).
    extent = float(out.extents.max())
    scale = max(0.5, (extent - 3 * pitch) / extent)
    centre = out.bounds.mean(axis=0)
    out.vertices = centre + (out.vertices - centre) * scale
    # No decimation here: it would tear the closed surface again. Pare's Simplify mesh can thin it later.
    out.export(target)
    check = trimesh.load(target)
    print(f"Pare: written STL closed={check.is_watertight}", flush=True)
    print(f"Pare: closed solid {len(out.faces):,} triangles, watertight={out.is_watertight}, volume={out.volume:.1f}", flush=True)


if __name__ == "__main__":
    main()
