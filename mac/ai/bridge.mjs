// Pare 3D (build 126): the editor bridge in the app's own server.
//
// The open editor page heartbeats here, long-polls for commands and posts their results; whoever
// drives the editor (the AI panel's agent in ai.mjs, or an MCP client such as Gemini CLI running
// scripts/layerling-mcp-server.mjs) posts commands. The same protocol as the development server's
// /api/layerling-mcp route (apps/web/src/app/api/layerling-mcp/route.ts and lib/layerlingMcpStore.ts),
// in plain JavaScript for the app's Bun runtime. The server only listens on 127.0.0.1.

export const MCP_ROUTE = "/api/layerling-mcp";
const STALE_MS = 15_000;
const LONG_POLL_MS = 25_000;

const editors = new Map();
const queues = new Map();
const pending = new Map();
const pollWaiters = new Map();

function commandId() {
  return globalThis.crypto?.randomUUID?.() ?? `pare-ai-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function settleWaiter(editorId, waiter, command) {
  if (pollWaiters.get(editorId) !== waiter) return false;
  pollWaiters.delete(editorId);
  clearTimeout(waiter.timer);
  waiter.resolve(command);
  return true;
}

function prune(now = Date.now()) {
  for (const [editorId, editor] of editors) {
    if (pollWaiters.has(editorId) || now - editor.lastSeen <= STALE_MS) continue;
    editors.delete(editorId);
    queues.delete(editorId);
    for (const [id, entry] of pending) {
      if (entry.editorId !== editorId) continue;
      clearTimeout(entry.timer);
      pending.delete(id);
      entry.resolve({ commandId: id, ok: false, error: `Editor ${editor.editorNumber} is no longer open`, completedAt: now });
    }
  }
}

export function listEditors() {
  prune();
  return [...editors.values()].sort((a, b) => a.editorNumber - b.editorNumber);
}

function waitForCommand(editorId, closed) {
  const now = Date.now();
  const editor = editors.get(editorId);
  if (editor) editors.set(editorId, { ...editor, lastSeen: now });
  prune(now);
  const queued = queues.get(editorId)?.shift();
  if (queued) return Promise.resolve(queued);
  const existing = pollWaiters.get(editorId);
  if (existing) settleWaiter(editorId, existing, null);
  return new Promise((resolve) => {
    const waiter = { resolve, timer: null };
    waiter.timer = setTimeout(() => settleWaiter(editorId, waiter, null), LONG_POLL_MS);
    pollWaiters.set(editorId, waiter);
    closed.then(() => settleWaiter(editorId, waiter, null));
  });
}

/** Sends one command to an open editor (the only one, or the one with this number) and waits for its result. */
export function dispatchCommand({ editorId, editorNumber, action, params = {}, timeoutMs = 15_000 }) {
  prune();
  const editor = (editorId ? editors.get(editorId) : null)
    ?? (typeof editorNumber === "number" ? [...editors.values()].find((candidate) => candidate.editorNumber === editorNumber) : null)
    ?? (editors.size === 1 ? [...editors.values()][0] : null);
  if (!editor) {
    return Promise.resolve({
      commandId: "",
      ok: false,
      error: editors.size > 1 ? "More than one Pare 3D editor is open: say which (editorNumber)." : "No Pare 3D editor is open.",
      completedAt: Date.now(),
    });
  }
  const command = { id: commandId(), action, params, createdAt: Date.now() };
  const waiter = pollWaiters.get(editor.editorId);
  if (!waiter || !settleWaiter(editor.editorId, waiter, command)) {
    const queue = queues.get(editor.editorId) ?? [];
    queue.push(command);
    queues.set(editor.editorId, queue);
  }
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(command.id);
      resolve({ commandId: command.id, ok: false, error: `Timed out waiting for editor ${editor.editorNumber}`, completedAt: Date.now() });
    }, Math.max(1_000, Math.min(timeoutMs, 120_000)));
    pending.set(command.id, { editorId: editor.editorId, resolve, timer });
  });
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

const isObject = (value) => Boolean(value && typeof value === "object" && !Array.isArray(value));

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}

/** Answers /api/layerling-mcp. Returns false for any other path. */
export async function handleBridge(req, res, url) {
  if (url.pathname !== MCP_ROUTE) return false;
  if (req.method === "GET") {
    // The editor asks whether to connect at all: here, in the app, always.
    if (url.searchParams.has("status")) send(res, 200, { remote: true, app: true });
    else send(res, 200, { editors: listEditors() });
    return true;
  }
  if (req.method !== "POST") {
    send(res, 405, { error: "GET or POST" });
    return true;
  }
  const body = await readJson(req);
  if (!isObject(body) || typeof body.type !== "string") {
    send(res, 400, { error: "Invalid request." });
    return true;
  }
  if (body.type === "heartbeat") {
    if (!isObject(body.editor) || typeof body.editor.editorId !== "string") return send(res, 400, { error: "Invalid editor heartbeat." }), true;
    prune();
    editors.set(body.editor.editorId, { ...body.editor, lastSeen: Date.now() });
    if (!queues.has(body.editor.editorId)) queues.set(body.editor.editorId, []);
    send(res, 200, { ok: true, editors: listEditors() });
    return true;
  }
  if (body.type === "poll") {
    if (typeof body.editorId !== "string") return send(res, 400, { error: "Invalid editor poll." }), true;
    const closed = new Promise((resolve) => res.on("close", resolve));
    const command = await waitForCommand(body.editorId, closed);
    if (!res.writableEnded && !res.destroyed) send(res, 200, { command });
    else if (command) {
      // The page went away mid-poll: give the command back to the queue.
      const queue = queues.get(body.editorId) ?? [];
      queue.unshift(command);
      queues.set(body.editorId, queue);
    }
    return true;
  }
  if (body.type === "result") {
    const result = body.result;
    if (typeof body.editorId !== "string" || !isObject(result) || typeof result.commandId !== "string" || typeof result.ok !== "boolean") {
      send(res, 400, { error: "Invalid command result." });
      return true;
    }
    const entry = pending.get(result.commandId);
    if (entry && entry.editorId === body.editorId) {
      clearTimeout(entry.timer);
      pending.delete(result.commandId);
      entry.resolve({ ...result, completedAt: result.completedAt ?? Date.now() });
      send(res, 200, { ok: true });
    } else send(res, 200, { ok: false });
    return true;
  }
  if (body.type === "command") {
    if (typeof body.action !== "string") return send(res, 400, { error: "Invalid command action." }), true;
    const result = await dispatchCommand({
      editorId: typeof body.editorId === "string" ? body.editorId : undefined,
      editorNumber: typeof body.editorNumber === "number" ? body.editorNumber : undefined,
      action: body.action,
      params: isObject(body.params) ? body.params : {},
      timeoutMs: typeof body.timeoutMs === "number" ? body.timeoutMs : undefined,
    });
    send(res, result.ok ? 200 : 504, result);
    return true;
  }
  send(res, 400, { error: "Unknown request." });
  return true;
}
