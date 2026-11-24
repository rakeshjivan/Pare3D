import * as THREE from "three";
import type { ThreeState } from "@/components/workplane/ViewportOverlays";
import type { GimbalView } from "@/components/workplane/transformOverlayTypes";
import type { HandleStyle } from "@/lib/handleStyle";
import type { ViewLook } from "@/lib/viewLook";
import type { MeasurementAccuracy } from "@/types/layerling";
import { formatMeasure } from "@/components/workplane/ViewportOverlays";
import { t } from "@/lib/i18n";

/**
 * Pare 3D's own parts of the 3D view, kept apart from layerling's files so its updates merge cleanly:
 * the view look (build 85), adaptive resolution, the gimbal (builds 99 and 104) and the flags they share.
 */

type RotationAxis = "x" | "y" | "z";

export const GIMBAL_SPACE_KEY = "pare3d.gimbalSpace";

const initialGimbalSpace: "local" | "world" = (() => {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(GIMBAL_SPACE_KEY) === "world" ? "world" : "local";
  } catch {
    return "local";
  }
})();

/** Mutable view state the viewport's files share. */
export const pv = {
  /** Build 85: the look of the view - the workplane, no workplane, or Meshmixer's dark background. */
  viewLook: "plate" as ViewLook,
  /** Build 88: fast mode as last set, for the pixel budget when the window changes size. */
  viewFastMode: false,
  /** Build 90: the selection's handles, sizes and lines put away (right-click menu), so a mesh is not resized by accident. */
  transformHandlesHidden: false,
  /** Build 99: the box or the gimbal - set from the switch beside Snap Grid. */
  handleStyle: "box" as HandleStyle,
  /** Build 87: Sculpt's per-frame stroke work, run at the start of the render loop's frame. */
  beforeFrame: null as (() => void) | null,
  /** Build 87: set when only the sculpted surface changed this frame. */
  sculptFrameOnly: false,
  /** Build 104 (gimbal 2): Ctrl (Cmd) held - a gimbal moves and turns freely, without snapping. */
  gimbalCtrlHeld: false,
  /** Build 104 (gimbal 2): the gimbal's axes - the part's own (local) or the plate's (world); remembered. */
  gimbalSpace: initialGimbalSpace,
};

const MESHMIXER_BACKGROUND = "#444240";
export const baseLight = new WeakMap<object, { ambient: number; key: number; fill: number; background: string }>();
export function applyViewLook(state: ThreeState | null) {
  if (!state) return;
  const base = baseLight.get(state);
  if (!base) return;
  state.workplaneLayer.visible = pv.viewLook === "plate";
  const dark = pv.viewLook === "dark";
  state.scene.background = new THREE.Color(dark ? MESHMIXER_BACKGROUND : base.background);
  // Build 88: Meshmixer's lighting in the dark look - nearly all of it from the camera, so faces turned
  // to you are bright and hollows and creases fall dark, with only a little soft grey all round (the
  // light blue ground light of the workplane look made scans dull and flat).
  // Build 93: the light looks too take most of their light from just above and left of the eye - with the
  // even light of earlier builds a near-white scan washed out against the white workplane (only its
  // outline showed). Less even light, the sun and fill turned down (the shadow and a coloured part's look
  // kept), so a scan's faces turned away and its creases shade as they do in the dark look.
  state.lights.ambient.intensity = dark ? 0.35 : base.ambient * 0.33;
  state.lights.ambient.groundColor.set(dark ? "#505050" : "#d6edf5");
  state.lights.key.intensity = dark ? 0 : base.key * 0.39;
  state.lights.fill.intensity = dark ? 0 : base.fill * 0.25;
  let head = state.scene.getObjectByName("ViewHeadlight") as THREE.DirectionalLight | undefined;
  if (!head) {
    head = new THREE.DirectionalLight("#ffffff", 3.0);
    head.name = "ViewHeadlight";
    state.scene.add(head, head.target);
  }
  head.intensity = dark ? 3.0 : 2.4;
  head.visible = true;
  state.needsRender = true;
}
/** Before each frame: the headlight where the camera is, aimed where it looks. */
const headOffset = new THREE.Vector3();
export function placeHeadlight(state: Pick<ThreeState, "scene" | "camera" | "controls">) {
  const head = state.scene.getObjectByName("ViewHeadlight") as THREE.DirectionalLight | undefined;
  if (!head) return;
  // Build 88: a little above and to the left of the eye, as Meshmixer lights - faces square to the view
  // still shade, and creases fall dark (a light right at the eye leaves a scan flat and washed out).
  const target = state.controls.target;
  const distance = state.camera.position.distanceTo(target) || 1;
  headOffset.set(-0.25, 0.35, 1).normalize().applyQuaternion(state.camera.quaternion).multiplyScalar(distance);
  head.position.copy(target).add(headOffset);
  head.target.position.copy(target);
  head.target.updateMatrixWorld();
}

/**
 * Fork: adaptive resolution. While the camera or a shape moves, the view is drawn at one pixel
 * per screen point (as Fast mode does), and it goes back to full Retina sharpness
 * ADAPTIVE_SETTLE_MS after the movement stops. Keyed by the viewport's state object.
 */
export const ADAPTIVE_SETTLE_MS = 180;
const adaptiveResolutionStates = new WeakMap<object, { base: number; low: boolean; lastMotion: number }>();
/**
 * Movement is read from the pointer and the wheel over the view: a drag with a button held
 * (orbit, pan, moving a shape or a handle), a scroll or a pinch. A click alone changes nothing.
 */
export function adaptiveResolution(state: object, canvas?: HTMLElement) {
  let entry = adaptiveResolutionStates.get(state);
  if (!entry) {
    const base = typeof window === "undefined" ? 1 : Math.min(Math.max(1, window.devicePixelRatio || 1), 2);
    const created = { base, low: false, lastMotion: -Infinity };
    entry = created;
    adaptiveResolutionStates.set(state, created);
    if (canvas && typeof window !== "undefined") {
      let held = false;
      const mark = () => {
        created.lastMotion = performance.now();
      };
      canvas.addEventListener("pointerdown", () => {
        held = true;
      });
      window.addEventListener("pointerup", () => {
        held = false;
      });
      window.addEventListener("pointercancel", () => {
        held = false;
      });
      window.addEventListener("pointermove", (event) => {
        if (held && event.buttons !== 0) mark();
      });
      canvas.addEventListener("wheel", mark, { passive: true });
    }
  }
  return entry;
}

/**
 * Build 99: the gimbal on the screen - an arrow along each axis to move by, and a ring round each to turn
 * on, about `center`, a fixed size on the screen however near the camera is. An arrow or ring seen edge
 * on is left out (nothing to take hold of).
 */
const GIMBAL_ARROW = 86;
export const GIMBAL_RING = 66;
/** Build 104 (gimbal 2): the outer ring that turns a part about the line of sight. */
export const GIMBAL_VIEW_RING = 104;

/** Build 104 (gimbal 2): Ctrl (Cmd) held - a gimbal moves and turns freely, without snapping. */
/** Build 104 (gimbal 2): the gimbal's axes - the part's own (local) or the plate's (world); remembered. */
export type GimbalSpace = "local" | "world";
export const WORLD_GIMBAL_AXES: Record<RotationAxis, THREE.Vector3> = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
};
export function gimbalAxesFor(frame: { xAxis: THREE.Vector3; yAxis: THREE.Vector3; zAxis: THREE.Vector3 }): Record<RotationAxis, THREE.Vector3> {
  return pv.gimbalSpace === "world" ? WORLD_GIMBAL_AXES : { x: frame.xAxis, y: frame.yAxis, z: frame.zAxis };
}

/** Build 104 (gimbal 2): what the readout says while a gimbal handle is held or waits for a number. */
export function gimbalReadoutText(kind: "move" | "turn", transform: { typed?: string; awaitingType?: boolean }, delta: number, snap: "snap" | "fine" | "free", accuracy: MeasurementAccuracy) {
  const unit = kind === "move" ? " mm" : "°";
  if (transform.typed !== undefined && (transform.typed !== "" || transform.awaitingType)) {
    const shown = transform.typed === "" ? "…" : transform.typed;
    return `${t(kind === "move" ? "gimbal.typeDistance" : "gimbal.typeAngle")}: ${shown}${unit}  ·  ${t("gimbal.enterToApply")}`;
  }
  const value = kind === "move"
    ? `${delta >= 0 ? "+" : "−"}${formatMeasure(Math.abs(delta), accuracy)}`
    : `${delta >= 0 ? "+" : "−"}${Number(Math.abs(delta).toFixed(1))}°`;
  const hint = snap === "free" ? t("gimbal.free") : snap === "fine" ? t("gimbal.fine") : t(kind === "move" ? "gimbal.snapMove" : "gimbal.snapTurn");
  return `${value}  ·  ${hint}`;
}

export function gimbalGeometry(
  project: (point: THREE.Vector3) => { x: number; y: number; visible: boolean },
  center: THREE.Vector3,
  axes: Record<RotationAxis, THREE.Vector3>,
  cameraDistance: number,
): GimbalView {
  const c = project(center);
  const step = Math.max(0.05, cameraDistance * 0.01);
  // Screen pixels per millimetre at the middle, the largest of the three axes (all three see the same distance).
  const perMm = Math.max(0.0001, ...(["x", "y", "z"] as const).map((axis) => {
    const p = project(center.clone().addScaledVector(axes[axis], step));
    return Math.hypot(p.x - c.x, p.y - c.y) / step;
  }));
  const arrows: GimbalView["arrows"] = [];
  const rings: GimbalView["rings"] = [];
  (["x", "y", "z"] as const).forEach((axis) => {
    const a = axes[axis].clone().normalize();
    const tipWorld = center.clone().addScaledVector(a, GIMBAL_ARROW / perMm);
    const tip = project(tipWorld);
    const length = Math.hypot(tip.x - c.x, tip.y - c.y);
    // Pointing at the camera (or away): too short on the screen to take hold of.
    if (tip.visible && length > 18) arrows.push({ axis, x: tip.x, y: tip.y });
    // The ring: the circle round this axis, drawn through 48 points.
    const u = Math.abs(a.y) < 0.9 ? new THREE.Vector3(0, 1, 0).cross(a).normalize() : new THREE.Vector3(1, 0, 0).cross(a).normalize();
    const v = a.clone().cross(u).normalize();
    const r = GIMBAL_RING / perMm;
    const points: string[] = [];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let k = 0; k <= 48; k += 1) {
      const angle = (k / 48) * Math.PI * 2;
      const p = project(center.clone().addScaledVector(u, Math.cos(angle) * r).addScaledVector(v, Math.sin(angle) * r));
      points.push(`${k ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    }
    // Seen edge on, a ring is a line: no ring to take hold of. Build 104: one seen nearly edge on fades,
    // so the rings that are easy to take hold of stand out.
    const narrow = Math.min(maxX - minX, maxY - minY);
    const wide = Math.max(maxX - minX, maxY - minY, 1);
    if (narrow > 10) rings.push({ axis, path: points.join(" "), opacity: Math.max(0.3, Math.min(1, (narrow / wide) * 2.2)) });
  });
  return { x: c.x, y: c.y, arrows, rings, viewRadius: GIMBAL_VIEW_RING };
}
