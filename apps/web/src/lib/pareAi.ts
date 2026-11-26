/**
 * Pare 3D (build 126): AI design. The desktop app's own server (runtime 7) signs in to ChatGPT, runs the
 * design assistant and drives this editor through its bridge; this file is the page's side of that.
 * A plain browser, or an app installed before build 126, has none of it.
 */

export type AiEngine = "chatgpt" | "gemini";
export type AiStatus = {
  ok: boolean;
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
export const startAiRun = (body: { engine: AiEngine; prompt: string; history: { role: "user" | "assistant"; text: string }[]; model?: string }) =>
  post<{ id: string }>("/run", body);
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
