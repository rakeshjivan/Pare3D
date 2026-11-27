// Pare 3D (build 126): AI design in the app's own server.
//
// Two engines, chosen with the switch in the AI panel:
//  - ChatGPT, on the person's own ChatGPT plan through OpenAI's "Sign in with ChatGPT" for open-source
//    apps: dynamic client registration, PKCE, a 127.0.0.1 loopback callback, then Responses API
//    requests with the access token (https://developers.openai.com/siwc/token-sharing-open-source).
//    The agent loop runs here and drives the open editor through the bridge (bridge.mjs) with the
//    same tools the MCP server offers (scripts/layerling-mcp-tools.mjs).
//  - Gemini, through Google's own Gemini CLI, signed in with the person's Google account; Pare runs
//    it with its MCP server (scripts/layerling-mcp-server.mjs) pointed at this server's bridge.
//
/** Which serve.mjs this module fits; serve.mjs loads an updated copy (from the app files) only if it matches. */
export const AI_PROTOCOL = 1;

// Tokens stay in the app's data folder (owner-only file), never in the page, logs or URLs.
import { spawn } from "node:child_process";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { chmod, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { homedir, platform } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dispatchCommand, listEditors } from "./bridge.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const AUTH = "https://auth.openai.com";
const RESOURCE = "https://api.openai.com/v1";
// Only for the automated tests: a local stand-in for OpenAI's API.
const API = process.env.PARE3D_TEST_OPENAI || RESOURCE;
const APP_NAME = "Pare 3D";
const PLAN_SCOPE = "chatgpt.tokens.use.direct";
const MAX_STEPS = 40;
const MAX_OUTPUT_CHARS = 6000;

let dataDir = "";
let serverPort = 47177;

export function configureAi({ dataDirectory, port }) {
  dataDir = join(dataDirectory, "ai");
  serverPort = port;
}

// ---------- The editor's tools ----------

async function importFirst(names) {
  for (const name of names) {
    const path = join(here, name);
    if (existsSync(path)) return import(path);
  }
  return null;
}

let toolCache = null;
/** The MCP tools and, read from the MCP server's own source, the editor action each one sends. */
async function editorTools() {
  if (toolCache) return toolCache;
  const module = await importFirst(["layerling-mcp-tools.mjs", "../../scripts/layerling-mcp-tools.mjs"]);
  const serverPath = [join(here, "layerling-mcp-server.mjs"), join(here, "../../scripts/layerling-mcp-server.mjs")].find((path) => existsSync(path));
  const source = serverPath ? await readFile(serverPath, "utf8") : "";
  const actions = Object.fromEntries([...source.matchAll(/case "(layerling_\w+)":\s*return bridgeCommand\("(\w+)"/g)].map((match) => [match[1], match[2]]));
  const all = (module?.tools ?? []).filter((tool) => actions[tool.name]);
  toolCache = { all, actions, serverPath };
  return toolCache;
}

const CORE = [
  "read_scene", "list_objects", "select_objects", "delete_objects", "move_object", "create_shape", "update_object", "align_objects",
  "scale_objects", "lay_flat", "group_objects", "ungroup_objects", "boolean_cut", "intersect_objects", "separate_parts", "list_edges",
  "list_faces", "apply_edge_treatment", "hollow_object", "array_objects", "cut_out", "punch", "split_objects", "rename_project",
  "inspect_errors", "text_block", "check_print", "mate_faces", "offset_object",
].map((name) => `layerling_${name}`);
// The settings of create_shape and update_object that keep their description; all others keep name and type.
const DESCRIBED = new Set([
  "kind", "id", "ids", "name", "color", "x", "y", "z", "elevation", "width", "depth", "height", "length", "diameter", "radius",
  "rotationX", "rotationY", "rotationZ", "hole", "sides", "segments", "wall", "wallThickness", "topRadius", "bottomRadius",
  "cornerRadius", "text", "fontSize", "teeth", "threadSize", "screwSize", "gridfinityType", "position",
]);

const clip = (text, length) => (typeof text === "string" && text.length > length ? `${text.slice(0, length)}…` : text);

function slimSchema(schema, deep) {
  if (Array.isArray(schema)) return schema.map((item) => slimSchema(item, deep));
  if (!schema || typeof schema !== "object") return schema;
  const out = {};
  for (const [key, value] of Object.entries(schema)) {
    if (key === "examples") continue;
    if (key === "description") out.description = clip(value, 120);
    else if (key === "enum") out.enum = value.length > 60 ? value.slice(0, 60) : value;
    else out[key] = slimSchema(value, deep);
  }
  return out;
}

function shapeSchema(schema) {
  const properties = {};
  for (const [key, value] of Object.entries(schema.properties ?? {})) {
    const slim = {};
    if (value.type) slim.type = value.type;
    if (value.enum) slim.enum = value.enum.length > 60 ? value.enum.slice(0, 60) : value.enum;
    if (value.items) slim.items = value.items.type ? { type: value.items.type } : {};
    if (value.properties && DESCRIBED.has(key)) slim.properties = slimSchema(value.properties);
    if (DESCRIBED.has(key) && value.description) slim.description = clip(value.description, 160);
    properties[key] = slim;
  }
  return { type: "object", properties, ...(schema.required ? { required: schema.required } : {}) };
}

/** The function tools sent to ChatGPT: the core set, slimmed, plus two that reach every other tool. */
export async function chatgptTools() {
  const { all } = await editorTools();
  const core = all.filter((tool) => CORE.includes(tool.name)).map((tool) => ({
    type: "function",
    name: tool.name,
    description: clip(tool.description, 700),
    parameters: tool.name === "layerling_create_shape" || tool.name === "layerling_update_object" ? shapeSchema(tool.inputSchema) : slimSchema(tool.inputSchema),
  }));
  const others = all.filter((tool) => !CORE.includes(tool.name)).map((tool) => `${tool.name}: ${clip(tool.description.split(/(?<=\.)\s/)[0], 140)}`);
  core.push({
    type: "function",
    name: "pare_tool_help",
    description: "The full description and every setting of one tool, including the settings of create_shape or update_object shown here only by name. Call it before using a setting you have not seen described, or before pare_use_tool.",
    parameters: { type: "object", properties: { tool: { type: "string", description: "A tool name, such as layerling_create_shape or layerling_make_lid." } }, required: ["tool"] },
  });
  core.push({
    type: "function",
    name: "pare_use_tool",
    description: `Use any other editor tool by name. Look its settings up with pare_tool_help first. The other tools:\n${others.join("\n")}`,
    parameters: { type: "object", properties: { tool: { type: "string" }, arguments: { type: "object", description: "The tool's settings." } }, required: ["tool"] },
  });
  return core;
}

export async function runEditorTool(name, args) {
  const { all, actions } = await editorTools();
  if (name === "pare_tool_help") {
    const tool = all.find((candidate) => candidate.name === args?.tool);
    return tool ? { name: tool.name, description: tool.description, settings: tool.inputSchema } : { error: `No tool called ${args?.tool}.` };
  }
  if (name === "pare_use_tool") return runEditorTool(String(args?.tool || ""), args?.arguments ?? {});
  const action = actions[name];
  if (!action) return { error: `No tool called ${name}.` };
  const { editorNumber, editorId, timeoutMs, ...params } = args ?? {};
  const result = await dispatchCommand({ editorNumber, editorId, action, params, timeoutMs: typeof timeoutMs === "number" ? timeoutMs : 60_000 });
  return result.ok ? (result.data ?? { ok: true }) : { error: result.error || "The editor could not do that." };
}

/** A tool's result as text for the model: images left out, long answers cut. */
function resultText(value) {
  const text = JSON.stringify(value, (key, item) => (typeof item === "string" && item.startsWith("data:image") ? "[image]" : item));
  return clip(text ?? "null", MAX_OUTPUT_CHARS);
}

const INSTRUCTIONS = `You are the design assistant inside Pare 3D, a CAD app for 3D printing. You build and change the design that is open in the editor by calling its tools. Work in millimetres.

How the editor works:
- The workplane (build plate) is the x-z plane; y points up. read_scene reports each object's position.x and position.z on the plate and its elevation (height of its bottom above the plate), and width (x), depth (z) and height (y).
- Objects are solids or holes. A hole cuts away where it overlaps a solid once both are grouped (group_objects) or with boolean_cut. Make holes slightly larger than the part they take (0.2 to 0.4 mm clearance for printed fits).
- Start by calling layerling_read_scene to see what is there, unless you already know.
- Use layerling_create_shape for new parts (kind, sizes, position) and layerling_update_object to change one. Use pare_tool_help to see every setting of a shape kind before using settings you have not seen described.
- Round or bevel edges with layerling_list_edges then layerling_apply_edge_treatment; hollow parts with layerling_hollow_object; repeat parts with layerling_array_objects.
- Keep parts on the plate (elevation 0) unless asked otherwise, and inside a 180 mm cube unless the person gives other sizes.
- Give parts short, clear names. Every change can be undone by the person, so go ahead without asking unless the request is truly unclear.
- After building, check with layerling_read_scene (and layerling_inspect_errors if a step failed) and fix what is off.
- When you are done, answer in one to three short sentences: what you made or changed, with the main sizes. No lists of tool calls.

When the person has added a mesh (an STL, OBJ, 3MF or GLB made elsewhere): it is an imported object in the scene. Resize it with layerling_scale_objects, set it on the plate with layerling_lay_flat, cut it with layerling_split_objects or holes, combine it with other parts, and use the mesh tools (repair, simplify, smooth and the like; see pare_use_tool's list) where asked. Keep its look: do not rebuild it from shapes unless asked.

When the person gives a picture (a photo, drawing or sketch) to turn into a 3D model:
- Work out what the object is and its main parts, and its proportions from the picture.
- Use the sizes the person gives. Without any, make the longest side about 80 mm, or use the real size of a known object (a mug is about 95 mm tall) when that is clearly what it is.
- Build it from the editor's shapes, part by part: the main body first, then the features (holes, cut-outs, rounded edges, text, ridges, handles). Place each part where it sits in the picture, use holes for openings, and keep it printable (flat base on the plate, walls at least 1.2 mm).
- Name the parts after what they are, and group the finished model (layerling_group_objects) unless the person wants the parts separate.
- Check it with layerling_read_scene, fix what is off, and in your answer say it is a model built from shapes after the picture (not an exact copy), with its overall size.`;

// ---------- Jobs: one request from the panel, with its progress for the page to poll ----------

const jobs = new Map();

function newJob(engine) {
  const job = { id: randomUUID(), engine, status: "running", log: [], answer: "", stop: null, startedAt: Date.now() };
  jobs.set(job.id, job);
  for (const [id, old] of jobs) if (Date.now() - old.startedAt > 3_600_000) jobs.delete(id);
  return job;
}

const note = (job, kind, text) => job.log.push({ kind, text: clip(String(text), 400), at: Date.now() });

const TOOL_WORDS = {
  read_scene: "Looking at the design", list_objects: "Listing the parts", create_shape: "Making a shape", update_object: "Changing a part",
  delete_objects: "Removing parts", move_object: "Moving a part", align_objects: "Aligning", group_objects: "Combining",
  boolean_cut: "Cutting", apply_edge_treatment: "Rounding edges", list_edges: "Finding edges", hollow_object: "Hollowing",
  array_objects: "Repeating", split_objects: "Splitting", select_objects: "Selecting", text_block: "Adding text", check_print: "Checking the print",
  inspect_errors: "Checking for problems", rename_project: "Naming the design",
};
function toolWords(name, args) {
  if (name === "pare_tool_help") return `Reading up on ${String(args?.tool || "a tool").replace("layerling_", "").replaceAll("_", " ")}`;
  if (name === "pare_use_tool") return toolWords(String(args?.tool || ""), args?.arguments);
  const key = name.replace("layerling_", "");
  const base = TOOL_WORDS[key] ?? key.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
  return key === "create_shape" && args?.kind ? `Making a ${args.kind}` : base;
}

// ---------- ChatGPT: sign-in ----------

const base64url = (buffer) => Buffer.from(buffer).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const credentialsPath = () => join(dataDir, "chatgpt.json");

async function readJsonFile(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

async function writePrivate(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(value, null, 2), { mode: 0o600 });
  await chmod(temporary, 0o600).catch(() => undefined);
  await rename(temporary, path);
}

async function hostId() {
  const path = join(dataDir, "host.json");
  const saved = await readJsonFile(path);
  if (saved?.ext_agent_host_id) return saved.ext_agent_host_id;
  const id = `urn:uuid:${randomUUID()}`;
  await writePrivate(path, { ext_agent_host_id: id });
  return id;
}

function decodeJwt(token) {
  const [header, payload, signature] = String(token).split(".");
  return {
    header: JSON.parse(Buffer.from(header, "base64url").toString("utf8")),
    payload: JSON.parse(Buffer.from(payload, "base64url").toString("utf8")),
    signed: `${header}.${payload}`,
    signature: Buffer.from(signature, "base64url"),
  };
}

/** Checks an ID token's signature against OpenAI's published keys, and its issuer, audience, expiry and nonce. */
async function verifyIdToken(idToken, clientId, nonce) {
  const token = decodeJwt(idToken);
  const config = await (await fetch(`${AUTH}/.well-known/openid-configuration`)).json();
  const jwks = await (await fetch(config.jwks_uri || `${AUTH}/.well-known/jwks.json`)).json();
  const jwk = (jwks.keys ?? []).find((key) => key.kid === token.header.kid) ?? (jwks.keys ?? [])[0];
  if (!jwk) throw new Error("OpenAI's signing keys could not be read.");
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, token.signature, new TextEncoder().encode(token.signed));
  const claims = token.payload;
  const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!valid) throw new Error("The sign-in answer did not carry a valid signature.");
  if (claims.iss !== AUTH) throw new Error("The sign-in answer came from the wrong issuer.");
  if (!audience.includes(clientId)) throw new Error("The sign-in answer was meant for another app.");
  if (typeof claims.exp === "number" && claims.exp * 1000 < Date.now()) throw new Error("The sign-in answer had already expired.");
  if (nonce && claims.nonce !== nonce) throw new Error("The sign-in answer did not match this sign-in.");
  return claims;
}

const signIn = { pending: null, server: null, error: "" };

function openInBrowser(url) {
  const system = platform();
  const [command, args] = system === "darwin" ? ["open", [url]] : system === "win32" ? ["cmd", ["/c", "start", "", url.replace(/&/g, "^&")]] : ["xdg-open", [url]];
  spawn(command, args, { stdio: "ignore", detached: true }).unref();
}

function listenOnLoopback(handler) {
  return new Promise((resolve, reject) => {
    const tryPort = (port) => {
      const server = createServer(handler);
      server.once("error", (error) => (port < 1465 ? tryPort(port + 1) : reject(error)));
      server.listen(port, "127.0.0.1", () => resolve({ server, port }));
    };
    tryPort(1455);
  });
}

function closeSignInServer() {
  signIn.server?.close();
  signIn.server = null;
}

const doneHtml = (title, text) =>
  `<!doctype html><meta charset="utf-8"><title>${title}</title><body style="font:16px -apple-system,system-ui,sans-serif;display:grid;place-items:center;height:90vh;color:#222"><div style="text-align:center"><h2>${title}</h2><p>${text}</p></div>`;

async function startChatgptSignIn() {
  closeSignInServer();
  signIn.error = "";
  const saved = await readJsonFile(credentialsPath());
  const verifier = base64url(randomBytes(32));
  const attempt = {
    state: base64url(randomBytes(16)),
    nonce: base64url(randomBytes(16)),
    verifier,
    clientId: saved?.client_id || "",
    startedAt: Date.now(),
  };
  const { server, port } = await listenOnLoopback(async (req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");
    if (url.pathname !== "/auth/callback") {
      res.writeHead(404).end();
      return;
    }
    try {
      await finishChatgptSignIn(attempt, url, redirectUri);
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(doneHtml("Signed in to ChatGPT", "You can close this window and go back to Pare 3D."));
    } catch (error) {
      signIn.error = error instanceof Error ? error.message : String(error);
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(doneHtml("Sign-in did not finish", signIn.error));
    } finally {
      signIn.pending = null;
      setTimeout(closeSignInServer, 1000);
    }
  });
  const redirectUri = `http://127.0.0.1:${port}/auth/callback`;
  signIn.server = server;
  signIn.pending = attempt;
  const params = new URLSearchParams({
    client_id: attempt.clientId || "dynamic_agent_client",
    ext_agent_host_id: await hostId(),
    response_type: "code",
    redirect_uri: redirectUri,
    scope: `openid profile email offline_access resource.invoke ${PLAN_SCOPE}`,
    resource: RESOURCE,
    state: attempt.state,
    nonce: attempt.nonce,
    code_challenge: base64url(createHash("sha256").update(verifier).digest()),
    code_challenge_method: "S256",
  });
  if (!attempt.clientId) params.set("agent_name_hint", APP_NAME);
  else {
    if (saved?.id_token) params.set("id_token_hint", saved.id_token);
    if (saved?.email) params.set("login_hint", saved.email);
  }
  openInBrowser(`${AUTH}/api/accounts/authorize?${params}`);
  // Nobody finished it within ten minutes: give the port back.
  setTimeout(() => {
    if (signIn.pending === attempt) {
      signIn.pending = null;
      closeSignInServer();
    }
  }, 600_000);
}

async function finishChatgptSignIn(attempt, url, redirectUri) {
  if (url.searchParams.get("state") !== attempt.state) throw new Error("This sign-in answer did not belong to the sign-in Pare 3D started.");
  if (url.searchParams.get("error")) {
    throw new Error(url.searchParams.get("error") === "access_denied" ? "Sign-in was cancelled." : url.searchParams.get("error_description") || url.searchParams.get("error"));
  }
  const code = url.searchParams.get("code");
  const issued = url.searchParams.get("client_id");
  if (!code) throw new Error("ChatGPT did not send a sign-in code.");
  let clientId = attempt.clientId;
  if (!clientId) {
    if (!issued) throw new Error("ChatGPT did not register Pare 3D. Try signing in again.");
    clientId = issued;
  } else if (issued && issued !== clientId) {
    throw new Error("ChatGPT answered for a different registration of Pare 3D.");
  }
  const response = await fetch(`${AUTH}/api/accounts/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", client_id: clientId, code, code_verifier: attempt.verifier, redirect_uri: redirectUri, resource: RESOURCE }),
  });
  const tokens = await response.json().catch(() => ({}));
  if (!response.ok || !tokens.access_token) throw new Error(tokens.error_description || tokens.error || `ChatGPT sign-in failed (${response.status}).`);
  const claims = await verifyIdToken(tokens.id_token, clientId, attempt.nonce);
  const scopes = String(tokens.scope || url.searchParams.get("scope") || "").split(/\s+/).filter(Boolean);
  if (!scopes.includes(PLAN_SCOPE)) {
    throw new Error("Signed in, but ChatGPT did not allow Pare 3D to use your plan. Sign in again and allow plan usage (a Plus or Pro plan is needed).");
  }
  const saved = await readJsonFile(credentialsPath());
  if (saved?.subject && saved.client_id === clientId && saved.subject !== claims.sub) {
    // Another ChatGPT account signed in: start that one's record afresh.
  }
  await writePrivate(credentialsPath(), {
    email: claims.email || "",
    issuer: AUTH,
    subject: claims.sub,
    client_id: clientId,
    ext_agent_host_id: await hostId(),
    id_token: tokens.id_token,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_type: tokens.token_type || "Bearer",
    expires_at: Date.now() + Number(tokens.expires_in || 3600) * 1000,
    scopes,
    saved_at: new Date().toISOString(),
  });
}

let refreshing = null;
/** The current access token, renewed shortly before it runs out (one renewal at a time). */
async function accessToken() {
  const saved = await readJsonFile(credentialsPath());
  if (!saved?.access_token) throw new Error("Sign in to ChatGPT first.");
  if (saved.expires_at - Date.now() > 120_000) return saved.access_token;
  refreshing ??= (async () => {
    const response = await fetch(`${AUTH}/api/accounts/oauth/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "refresh_token", client_id: saved.client_id, refresh_token: saved.refresh_token, resource: RESOURCE }),
    });
    const tokens = await response.json().catch(() => ({}));
    if (!response.ok || !tokens.access_token) {
      throw new Error(response.status === 400 || response.status === 401 ? "Your ChatGPT sign-in has run out. Sign in again." : `ChatGPT could not renew the sign-in (${response.status}).`);
    }
    const next = {
      ...saved,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || saved.refresh_token,
      id_token: tokens.id_token || saved.id_token,
      expires_at: Date.now() + Number(tokens.expires_in || 3600) * 1000,
      scopes: tokens.scope ? String(tokens.scope).split(/\s+/) : saved.scopes,
      saved_at: new Date().toISOString(),
    };
    await writePrivate(credentialsPath(), next);
    return next.access_token;
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

async function signOutChatgpt() {
  const saved = await readJsonFile(credentialsPath());
  let revoked = false;
  if (saved?.refresh_token) {
    try {
      const config = await (await fetch(`${AUTH}/.well-known/openid-configuration`)).json();
      if (config.revocation_endpoint) {
        const response = await fetch(config.revocation_endpoint, {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ token: saved.refresh_token, token_type_hint: "refresh_token", client_id: saved.client_id }),
        });
        revoked = response.ok;
      }
    } catch {
      revoked = false;
    }
  }
  // Keep the registration (client id) so the next sign-in is a returning one; drop every token.
  if (saved) await writePrivate(credentialsPath(), { client_id: saved.client_id, email: saved.email });
  return { revoked };
}

let modelCache = null;
async function chatgptModels() {
  if (modelCache && Date.now() - modelCache.at < 600_000) return modelCache.models;
  const response = await fetch(`${API}/models`, { headers: { authorization: `Bearer ${await accessToken()}` } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error?.message || `ChatGPT did not list its models (${response.status}).`);
  // The plan's catalogue comes as a "models" array (OpenAI's own API lists "data"; both are read).
  const models = (body.models ?? body.data ?? [])
    .filter((model) => (model.visibility ?? "list") === "list")
    .map((model) => ({ id: model.slug || model.id, name: model.display_name || model.slug || model.id }));
  modelCache = { at: Date.now(), models };
  return models;
}

// ---------- ChatGPT: the agent loop ----------

async function* sseEvents(response) {
  const decoder = new TextDecoder();
  let buffer = "";
  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    let index;
    while ((index = buffer.indexOf("\n\n")) >= 0) {
      const block = buffer.slice(0, index);
      buffer = buffer.slice(index + 2);
      const data = block.split("\n").filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).join("\n");
      if (!data || data === "[DONE]") continue;
      try {
        yield JSON.parse(data);
      } catch {
        // Not JSON: skip it.
      }
    }
  }
}

const USAGE_ERRORS = {
  subscription_sharing_usage_limit_exceeded: "You have reached the ChatGPT usage this app may use for now. Try again later; ChatGPT's settings show the usage this app may have.",
  subscription_sharing_usage_unavailable: "ChatGPT plan usage is not available for this account right now.",
};

// Request fields Pare would like but can do without; one the route refuses is left out from then on.
const OPTIONAL_FIELDS = { parallel_tool_calls: false, include: ["reasoning.encrypted_content"] };

async function responsesTurn(job, { model, input, tools, optional }) {
  const controller = new AbortController();
  job.stop = () => controller.abort();
  const response = await fetch(`${API}/responses`, {
    method: "POST",
    signal: controller.signal,
    headers: { authorization: `Bearer ${await accessToken()}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      instructions: INSTRUCTIONS,
      input,
      tools,
      store: false,
      stream: true,
      ...optional,
    }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(USAGE_ERRORS[body?.error?.code] || body?.error?.message || `ChatGPT answered ${response.status}.`);
    error.status = response.status;
    error.param = body?.error?.param;
    throw error;
  }
  const items = [];
  let text = "";
  let completed = false;
  for await (const event of sseEvents(response)) {
    if (event.type === "response.output_text.delta") text += event.delta || "";
    else if (event.type === "response.output_item.done" && event.item) items.push(event.item);
    else if (event.type === "response.completed") completed = true;
    else if (event.type === "response.failed" || event.type === "error") {
      const code = event.response?.error?.code || event.error?.code || "unknown_error";
      throw new Error(USAGE_ERRORS[code] || event.response?.error?.message || event.error?.message || `ChatGPT stopped (${code}).`);
    } else if (event.type === "response.incomplete") throw new Error("ChatGPT stopped before it was finished. Try again, perhaps with a shorter request.");
  }
  if (!completed) throw new Error("The connection to ChatGPT broke off. Try again.");
  return { items, text };
}

async function runChatgpt(job, { prompt, history = [], model, image }) {
  const tools = await chatgptTools();
  const chosen = model || (await chatgptModels())[0]?.id;
  if (!chosen) throw new Error("ChatGPT listed no models for this account. Check that your plan is Plus or Pro, then sign out in the AI panel and sign in again.");
  job.model = chosen;
  const input = [
    ...history.slice(-12).map((turn) => ({ role: turn.role === "assistant" ? "assistant" : "user", content: clip(String(turn.text || ""), 2000) })),
    image
      ? { role: "user", content: [{ type: "input_text", text: prompt }, { type: "input_image", image_url: image, detail: "high" }] }
      : { role: "user", content: prompt },
  ];
  const optional = { ...OPTIONAL_FIELDS };
  for (let step = 0; step < MAX_STEPS; step += 1) {
    if (job.status !== "running") return;
    let turn;
    try {
      turn = await responsesTurn(job, { model: chosen, input, tools, optional });
    } catch (error) {
      const refused = error.status === 400 ? Object.keys(optional).find((field) => field === error.param || String(error.message).includes(field)) : undefined;
      if (refused) {
        delete optional[refused];
        step -= 1;
        continue;
      }
      throw error;
    }
    const calls = turn.items.filter((item) => item.type === "function_call");
    for (const item of turn.items) {
      if (item.type === "reasoning" && !item.encrypted_content) continue;
      if (item.type === "message") continue;
      // Nothing is stored at OpenAI (store: false): a call goes back as its content, without an item id.
      if (item.type === "function_call") input.push({ type: "function_call", call_id: item.call_id, name: item.name, arguments: item.arguments || "{}" });
      else input.push(item);
    }
    if (calls.length === 0) {
      job.answer = turn.text.trim() || "Done.";
      return;
    }
    if (turn.text.trim()) input.push({ role: "assistant", content: turn.text.trim() });
    for (const call of calls) {
      if (job.status !== "running") return;
      let args = {};
      try {
        args = JSON.parse(call.arguments || "{}");
      } catch {
        args = {};
      }
      note(job, "tool", toolWords(call.name, args));
      let output;
      try {
        output = await runEditorTool(call.name, args);
      } catch (error) {
        output = { error: error instanceof Error ? error.message : String(error) };
      }
      if (output?.error) note(job, "warn", output.error);
      input.push({ type: "function_call_output", call_id: call.call_id, output: resultText(output) });
    }
  }
  job.answer = "I stopped after many steps. Look at what is there and tell me what to change next.";
}

// ---------- Gemini, through Google's Gemini CLI ----------

function searchPath() {
  const home = homedir();
  const extra = platform() === "win32"
    ? [join(process.env.APPDATA || join(home, "AppData", "Roaming"), "npm")]
    : ["/opt/homebrew/bin", "/usr/local/bin", join(home, ".npm-global", "bin"), join(home, ".local", "bin"), join(home, ".volta", "bin"), join(home, ".bun", "bin"), "/usr/bin", "/bin"];
  return [...new Set([...(process.env.PATH || "").split(platform() === "win32" ? ";" : ":"), ...extra])].filter(Boolean);
}

function findGemini() {
  const names = platform() === "win32" ? ["gemini.cmd", "gemini.exe", "gemini"] : ["gemini"];
  for (const folder of searchPath()) for (const name of names) if (existsSync(join(folder, name))) return join(folder, name);
  return null;
}

const geminiSignedIn = () => existsSync(join(homedir(), ".gemini", "oauth_creds.json")) || Boolean(process.env.GEMINI_API_KEY);

async function geminiWorkspace() {
  const folder = join(dataDir, "gemini");
  const { serverPath } = await editorTools();
  await mkdir(join(folder, ".gemini"), { recursive: true });
  // Only Pare's tools: no shell, no file writing, no web (--yolo approves every tool call).
  const blocked = ["run_shell_command", "write_file", "replace", "edit", "web_fetch", "google_web_search", "save_memory"];
  await writeFile(join(folder, ".gemini", "settings.json"), JSON.stringify({
    excludeTools: blocked,
    tools: { exclude: blocked },
    mcpServers: {
      pare3d: {
        command: process.execPath,
        args: [serverPath],
        env: { LAYERLING_URL: `http://127.0.0.1:${serverPort}`, LAYERLING_MCP_OPEN_EDITOR: "0" },
        trust: true,
        timeout: 120_000,
      },
    },
  }, null, 2));
  await writeFile(join(folder, "GEMINI.md"), `${INSTRUCTIONS}\n\nThe editor's tools are the pare3d MCP server's tools (names starting layerling_). There is exactly one editor open; you do not need layerling_list_editors or layerling_open_editor. Do not write files or run shell commands: only use the pare3d tools.\n`);
  return folder;
}

async function runGemini(job, { prompt, history = [], image }) {
  const gemini = findGemini();
  if (!gemini) throw new Error("Gemini CLI is not installed. See Gemini in the AI panel for how to set it up.");
  if (!geminiSignedIn()) throw new Error("Sign in to Gemini CLI once first: open Terminal, type gemini, and choose Sign in with Google.");
  const folder = await geminiWorkspace();
  const earlier = history.slice(-8).map((turn) => `${turn.role === "assistant" ? "You" : "Me"}: ${clip(String(turn.text || ""), 800)}`).join("\n");
  let request = prompt;
  if (image) {
    const [, type, data] = /^data:image\/(png|jpeg|webp);base64,(.+)$/.exec(image) ?? [];
    const name = `picture.${type === "jpeg" ? "jpg" : type}`;
    await writeFile(join(folder, name), Buffer.from(data, "base64"));
    request = `${prompt}\n\nThe picture: @${name}`;
  }
  const fullPrompt = earlier ? `Our conversation so far:\n${earlier}\n\nNow: ${request}` : request;
  await new Promise((resolve, reject) => {
    const child = spawn(gemini, ["-p", fullPrompt, "--yolo"], {
      cwd: folder,
      env: { ...process.env, PATH: searchPath().join(platform() === "win32" ? ";" : ":"), NO_COLOR: "1" },
      stdio: ["ignore", "pipe", "pipe"],
      shell: platform() === "win32",
    });
    job.stop = () => child.kill();
    let output = "";
    let errors = "";
    child.stdout.on("data", (chunk) => {
      output += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString("utf8");
      errors += text;
      for (const line of text.split("\n")) {
        const tool = line.match(/layerling_(\w+)/);
        if (tool) note(job, "tool", toolWords(`layerling_${tool[1]}`, {}));
      }
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        job.answer = output.trim() || "Done.";
        resolve();
      } else if (/auth|login|credential|sign in/i.test(errors)) reject(new Error("Gemini needs you to sign in again: open Terminal, type gemini, and choose Sign in with Google."));
      else if (/quota|429|rate/i.test(errors)) reject(new Error("Gemini's daily allowance is used up. Try again tomorrow, or switch to ChatGPT."));
      else reject(new Error(clip(errors.trim().split("\n").filter(Boolean).pop() || `Gemini stopped (${code}).`, 300)));
    });
  });
}

// ---------- HTTP ----------

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    return {};
  }
}

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}

async function status() {
  const saved = await readJsonFile(credentialsPath());
  const gemini = findGemini();
  return {
    ok: true,
    editors: listEditors().length,
    chatgpt: { signedIn: Boolean(saved?.access_token), email: saved?.access_token ? saved.email || "" : "", signingIn: Boolean(signIn.pending), error: signIn.error },
    gemini: { installed: Boolean(gemini), signedIn: geminiSignedIn() },
  };
}

/** Answers /__ai/... Returns false for any other path. */
export async function handleAi(req, res, url) {
  if (!url.pathname.startsWith("/__ai")) return false;
  const path = url.pathname.slice("/__ai".length) || "/";
  try {
    if (path === "/" || path === "/status") return send(res, 200, await status()), true;
    if (req.method !== "POST" && path !== "/job" && path !== "/models") return send(res, 405, { error: "POST only" }), true;
    if (path === "/chatgpt/signin") {
      await startChatgptSignIn();
      return send(res, 200, { ok: true }), true;
    }
    if (path === "/chatgpt/signout") return send(res, 200, { ok: true, ...(await signOutChatgpt()) }), true;
    if (path === "/models") return send(res, 200, { models: await chatgptModels() }), true;
    if (path === "/run") {
      const body = await readBody(req);
      // Build 128: a picture to turn into a 3D model (a data URL the panel has already scaled down).
      const image = typeof body.image === "string" && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(body.image) && body.image.length < 12_000_000 ? body.image : "";
      const prompt = String(body.prompt || "").trim() || (image ? "Make a 3D model of what is in this picture." : "");
      if (!prompt) return send(res, 400, { error: "Say what to make or change." }), true;
      if (listEditors().length === 0) return send(res, 409, { error: "Open a design in the editor first." }), true;
      const engine = body.engine === "gemini" ? "gemini" : "chatgpt";
      const job = newJob(engine);
      const run = engine === "gemini" ? runGemini : runChatgpt;
      run(job, { prompt, history: Array.isArray(body.history) ? body.history : [], model: typeof body.model === "string" ? body.model : "", image })
        .then(() => {
          if (job.status === "running") job.status = "done";
        })
        .catch((error) => {
          if (job.status !== "running") return;
          job.status = "error";
          job.error = error?.name === "AbortError" ? "Stopped." : error instanceof Error ? error.message : String(error);
        });
      return send(res, 200, { id: job.id }), true;
    }
    if (path === "/job") {
      const job = jobs.get(url.searchParams.get("id") || "");
      if (!job) return send(res, 404, { error: "No such request." }), true;
      const after = Number(url.searchParams.get("after") || 0);
      return send(res, 200, { status: job.status, log: job.log.slice(after), logLength: job.log.length, answer: job.answer, error: job.error || "", model: job.model || "" }), true;
    }
    if (path === "/stop") {
      const body = await readBody(req);
      const job = jobs.get(String(body.id || ""));
      if (job && job.status === "running") {
        job.status = "stopped";
        job.stop?.();
      }
      return send(res, 200, { ok: true }), true;
    }
    send(res, 404, { error: "Unknown AI request." });
  } catch (error) {
    send(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
  return true;
}
