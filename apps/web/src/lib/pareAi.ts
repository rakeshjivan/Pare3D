/**
 * Pare 3D (build 126): AI design. The desktop app's own server (runtime 7) signs in to ChatGPT, runs the
 * design assistant and drives this editor through its bridge; this file is the page's side of that.
 * A plain browser, or an app installed before build 126, has none of it.
 */

export type AiEngine = "chatgpt" | "gemini";
export type AiStatus = {
  ok: boolean;
  /** Build 128 on: what the AI code running in the app's server can do (absent before). */
  features?: string[];
  /** Build 129: TRELLIS.2 on this computer, for a mesh from a picture. */
  meshMaker?: { installed: boolean; huggingFace: boolean };
  editors: number;
  chatgpt: { signedIn: boolean; email: string; signingIn: boolean; error: string };
  gemini: { installed: boolean; signedIn: boolean };
};
export type AiJob = {
  status: "running" | "done" | "error" | "stopped";
  log: { kind: "tool" | "warn"; text: string; at: number }[];
  logLength: number;
  answer: string;
  error: string;
  model: string;
};
export type AiModel = { id: string; name: string };

export const AI_ENGINE_KEY = "pare.aiEngine";
export const AI_MODEL_KEY = "pare.aiModel";
export const AI_ENGINE_EVENT = "pare3d:ai-engine";
export const OPEN_AI_EVENT = "pare3d:open-ai";
/** Build 129: files for the editor to import as usual (detail: { files: File[] }). */
export const IMPORT_FILES_EVENT = "pare3d:import-files";
const HEADERS = { "content-type": "application/json", "x-pare3d-send": "1" };

/** The desktop app serves Pare from this computer; the web version never has AI design. */
export function inDesktopApp() {
  return typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
}

export function readAiEngine(): AiEngine {
  try {
    return window.localStorage.getItem(AI_ENGINE_KEY) === "gemini" ? "gemini" : "chatgpt";
  } catch {
    return "chatgpt";
  }
}

export function writeAiEngine(engine: AiEngine) {
  try {
    window.localStorage.setItem(AI_ENGINE_KEY, engine);
  } catch {
    // Storage may be off: the switch still works for this visit.
  }
  window.dispatchEvent(new CustomEvent(AI_ENGINE_EVENT, { detail: engine }));
}

/** The server's AI status, or null when this app's server has no AI design (older than build 126). */
export async function aiStatus(): Promise<AiStatus | null> {
  try {
    const response = await fetch("/__ai/status", { cache: "no-store" });
    if (!response.ok) return null;
    const value = (await response.json()) as AiStatus;
    return value && value.ok ? value : null;
  } catch {
    return null;
  }
}

async function post<T>(path: string, body: unknown = {}): Promise<T> {
  const response = await fetch(`/__ai${path}`, { method: "POST", headers: HEADERS, body: JSON.stringify(body) });
  const value = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(value.error || `The AI request failed (${response.status}).`);
  return value;
}

export const signInChatgpt = () => post<{ ok: boolean }>("/chatgpt/signin");
export const signOutChatgpt = () => post<{ ok: boolean; revoked: boolean }>("/chatgpt/signout");
export const startAiRun = (body: { engine: AiEngine; prompt: string; history: { role: "user" | "assistant"; text: string }[]; model?: string; image?: string }) =>
  post<{ id: string }>("/run", body);
export const startMeshRun = (image: string) => post<{ id: string }>("/mesh", { image });

/** The mesh a finished picture-to-mesh request made, as a file to import. */
export async function meshFile(id: string): Promise<File> {
  const response = await fetch(`/__ai/mesh-file?id=${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("The mesh could not be fetched.");
  const name = response.headers.get("x-file-name") || "model.glb";
  return new File([await response.blob()], `from-picture${name.slice(name.lastIndexOf("."))}`);
}

export const stopAiRun = (id: string) => post<{ ok: boolean }>("/stop", { id });

export async function aiModels(): Promise<AiModel[]> {
  const response = await fetch("/__ai/models", { cache: "no-store" });
  const value = (await response.json().catch(() => ({}))) as { models?: AiModel[]; error?: string };
  if (!response.ok) throw new Error(value.error || "ChatGPT's models could not be listed.");
  return value.models ?? [];
}

export async function aiJob(id: string, after: number): Promise<AiJob> {
  const response = await fetch(`/__ai/job?id=${encodeURIComponent(id)}&after=${after}`, { cache: "no-store" });
  const value = (await response.json().catch(() => ({}))) as AiJob & { error?: string };
  if (!response.ok) throw new Error(value.error || "The AI request was lost.");
  return value;
}

/**
 * A picture for the AI, scaled so its longest side is at most 1280 px and sent as JPEG (on white, for
 * pictures with transparency): sharp enough to read shapes from, small enough for the request.
 */
export async function pictureForAi(file: Blob): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("The picture could not be read.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.88);
}
