/*
 * Pare 3D is one studio: CAD Studio. The studio is kept as a label on a design so designs saved by
 * older builds still open.
 */
export type PareStudio = "cad";

export const PARE_STUDIOS: readonly PareStudio[] = ["cad"];

export function isPareStudio(value: unknown): value is PareStudio {
  return value === "cad";
}
