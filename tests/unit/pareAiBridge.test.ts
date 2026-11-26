import { createServer, type Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { handleBridge } from "../../mac/ai/bridge.mjs";
import { chatgptTools } from "../../mac/ai/ai.mjs";

let server: Server;
let base = "";

beforeAll(async () => {
  server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    if (!(await handleBridge(req, res, url))) res.writeHead(404).end();
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  base = `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}/api/layerling-mcp`;
});

afterAll(() => {
  server.close();
});

const post = (body: unknown) => fetch(base, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).then((response) => response.json());

describe("the desktop app's editor bridge for AI design (build 126)", () => {
  it("tells the editor to connect", async () => {
    expect(await fetch(`${base}?status=1`).then((response) => response.json())).toEqual({ remote: true, app: true });
  });

  it("hands a command to the open editor and returns its result", async () => {
    await post({ type: "heartbeat", editor: { editorId: "e1", editorNumber: 1, projectName: "Test" } });
    const command = post({ type: "command", action: "get_scene", params: {}, timeoutMs: 5000 });
    const polled = await post({ type: "poll", editorId: "e1" });
    expect(polled.command.action).toBe("get_scene");
    await post({ type: "result", editorId: "e1", result: { commandId: polled.command.id, ok: true, data: { shapeCount: 0 } } });
    expect(await command).toMatchObject({ ok: true, data: { shapeCount: 0 } });
  });

  it("gives ChatGPT a compact tool set that still reaches every editor tool", async () => {
    const tools = await chatgptTools();
    const names = tools.map((tool: { name: string }) => tool.name);
    expect(names).toContain("layerling_create_shape");
    expect(names).toContain("pare_use_tool");
    expect(JSON.stringify(tools).length).toBeLessThan(120_000);
  });
});
