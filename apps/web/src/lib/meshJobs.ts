/**
 * Fork (build 35): runs heavy mesh work in a worker (workers/meshJobs.worker.ts). Where a worker
 * cannot start - an old browser, the tests - the same work runs here as before.
 * Pare 3D is CAD only: Round a mesh, Remesh, surface textures and the fit check.
 */
import { withBase } from "@/lib/basePath";
import type { MeshRoundMode, MeshRoundResult } from "@/lib/meshRound";
import type { FitReport } from "@/lib/partTools";
import type { WorkplaneShape } from "@/types/layerling";
import type { SurfaceTextureOptions, SurfaceTextureResult } from "@/lib/surfaceTexture";
import type { RemeshOptions, RemeshResult } from "@/lib/meshRemesh";

export type MeshJobRequest =
  | { id: number; base: string; kind: "round"; positions: Float32Array; radius: number; mode: MeshRoundMode }
  | { id: number; base: string; kind: "fit"; shapes: WorkplaneShape[]; clearance: number }
  | { id: number; base: string; kind: "texture"; positions: Float32Array; options: SurfaceTextureOptions }
  | { id: number; base: string; kind: "remesh"; positions: Float32Array; options: RemeshOptions };
export type MeshJobResponse =
  | { id: number; ok: true; kind?: "round"; result: { positions: Float32Array; voxel: number; coarse: boolean } }
  | { id: number; ok: true; kind: "fit"; report: FitReport }
  | { id: number; ok: true; kind: "texture"; texture: SurfaceTextureResult }
  | { id: number; ok: true; kind: "remesh"; remesh: { positions: Float32Array; voxel: number; coarse: boolean; triangles: number } }
  | { id: number; ok: false; error: string };

let worker: Worker | null = null;
let failed = false;
let nextId = 1;
const pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>();

function meshWorker(): Worker | null {
  if (failed || typeof window === "undefined" || typeof Worker === "undefined") return null;
  if (worker) return worker;
  try {
    worker = new Worker(new URL("../workers/meshJobs.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<MeshJobResponse>) => {
      const reply = event.data;
      const waiting = pending.get(reply.id);
      if (!waiting) return;
      pending.delete(reply.id);
      if (!reply.ok) waiting.reject(new Error(reply.error));
      else if (reply.kind === "fit") waiting.resolve(reply.report);
      else if (reply.kind === "texture") waiting.resolve(reply.texture);
      else if (reply.kind === "remesh") waiting.resolve({ ...reply.remesh, positions: Array.from(reply.remesh.positions) });
      else waiting.resolve({ positions: Array.from(reply.result.positions), voxel: reply.result.voxel, coarse: reply.result.coarse });
    };
    worker.onerror = () => {
      // A worker that cannot load: everything waiting runs here instead, and later jobs too.
      failed = true;
      worker?.terminate();
      worker = null;
      const stranded = [...pending.values()];
      pending.clear();
      stranded.forEach((waiting) => waiting.reject(new Error("worker-unavailable")));
    };
    return worker;
  } catch {
    failed = true;
    return null;
  }
}

/**
 * Build 116: the mesh worker closed once nothing is waiting on it - a big job leaves its WebAssembly memory
 * grown, and a worker only gives it back by closing. It starts again with the next job.
 * Returns whether it was closed (not while a job is under way).
 */
export function recycleMeshWorkers(): boolean {
  if (pending.size) return false;
  try { worker?.terminate(); } catch { /* gone */ }
  worker = null;
  return true;
}

/** Stops every job running in the background: the worker is ended, and what was waiting is turned down with "stopped". */
export function stopMeshJobs() {
  worker?.terminate();
  worker = null;
  const stranded = [...pending.values()];
  pending.clear();
  stranded.forEach((waiting) => waiting.reject(new Error("stopped")));
}

async function roundHere(positions: ArrayLike<number>, radius: number, mode: MeshRoundMode) {
  const { roundMeshPositions } = await import("@/lib/meshRound");
  return roundMeshPositions(positions, radius, mode);
}

/** Rounds a closed mesh (world positions) - in the worker when one runs. */
export async function roundMeshInBackground(positions: ArrayLike<number>, radius: number, mode: MeshRoundMode): Promise<MeshRoundResult> {
  const target = meshWorker();
  if (!target) return roundHere(positions, radius, mode);
  const id = nextId;
  nextId += 1;
  const data = Float32Array.from(positions as ArrayLike<number>);
  try {
    return await new Promise<MeshRoundResult>((resolve, reject) => {
      pending.set(id, { resolve: resolve as (value: unknown) => void, reject });
      const request: MeshJobRequest = { id, base: new URL(withBase("/"), window.location.href).href, kind: "round", positions: data, radius, mode };
      target.postMessage(request, [data.buffer]);
    });
  } catch (error) {
    if (error instanceof Error && error.message === "worker-unavailable") return roundHere(positions, radius, mode);
    throw error;
  }
}

/** Build 69: Remesh, Offset or Thicken a part (world positions), in the worker when one runs. */
export async function remeshInBackground(positions: ArrayLike<number>, options: RemeshOptions): Promise<RemeshResult> {
  const here = async () => (await import("@/lib/meshRemesh")).remeshPositions(positions, options);
  const target = meshWorker();
  if (!target) return here();
  const id = nextId;
  nextId += 1;
  const data = Float32Array.from(positions as ArrayLike<number>);
  try {
    return await new Promise<RemeshResult>((resolve, reject) => {
      pending.set(id, { resolve: resolve as (value: unknown) => void, reject });
      const request: MeshJobRequest = { id, base: new URL(withBase("/"), window.location.href).href, kind: "remesh", positions: data, options };
      target.postMessage(request, [data.buffer]);
    });
  } catch (error) {
    if (error instanceof Error && error.message === "worker-unavailable") return here();
    throw error;
  }
}

/** Fork (build 55): a surface texture on a part (world positions), in the worker when one runs. */
export async function textureMeshInBackground(positions: ArrayLike<number>, options: SurfaceTextureOptions): Promise<SurfaceTextureResult> {
  const here = async () => (await import("@/lib/surfaceTexture")).textureMeshPositions(positions, options);
  const target = meshWorker();
  if (!target) return here();
  const id = nextId;
  nextId += 1;
  const data = Float32Array.from(positions as ArrayLike<number>);
  try {
    return await new Promise<SurfaceTextureResult>((resolve, reject) => {
      pending.set(id, { resolve: resolve as (value: unknown) => void, reject });
      const request: MeshJobRequest = { id, base: new URL(withBase("/"), window.location.href).href, kind: "texture", positions: data, options };
      target.postMessage(request, [data.buffer]);
    });
  } catch (error) {
    if (error instanceof Error && error.message === "worker-unavailable") return here();
    throw error;
  }
}

/** Fit check (build 37) in the worker when one runs, so a big assembly keeps the window working. */
export async function checkFitInBackground(shapes: readonly WorkplaneShape[], clearance: number): Promise<FitReport> {
  const here = async () => (await import("@/lib/partTools")).checkFit(shapes, clearance);
  const target = meshWorker();
  if (!target) return here();
  const id = nextId;
  nextId += 1;
  try {
    return await new Promise<FitReport>((resolve, reject) => {
      pending.set(id, { resolve: resolve as (value: unknown) => void, reject });
      const request: MeshJobRequest = { id, base: new URL(withBase("/"), window.location.href).href, kind: "fit", shapes: shapes as WorkplaneShape[], clearance };
      target.postMessage(request);
    });
  } catch {
    // Whatever went wrong in the worker, the check is run here instead.
    return here();
  }
}
