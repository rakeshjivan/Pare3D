# Pare 3D

**3D design for 3D printing.**

Pare 3D is a free, open-source design program that runs on your own computer. Put shapes on a plate, cut holes, round edges and print. It also has Sculpt tools for editing scans and meshes.

Nothing is uploaded: designs stay on the computer they were opened on, with no account, no cloud and no subscription.

[Download](https://github.com/rakeshjivan/Pare3D/releases/latest) · [User guide](#user-guide) · [Run from source](#run-from-source) · [Licences and credits](#licences-and-credits)

## What it does

### Sculpt

- **Brushes for scans and meshes:** add, smooth, flatten, pinch, inflate, attract and more.
- **Select, then act:** paint, lasso or double-click a face group, then grow, shrink, smooth, delete, extrude or soft-transform it. A movable bar keeps those actions at hand.
- **Deviation from the original**, Freeze (mask), symmetry, and Remesh, Offset, Thicken and Make solid for the whole part.

### Designing

- **Shapes, solids and holes, group and ungroup**, plus chamfer and fillet on any edge, hollowing to an even wall, splitting with a plane, sketches extruded or revolved into exact bodies, threads, gears, patterns and text.
- **Box or gimbal.** Move and turn parts with the box and handles, or with a gimbal like Meshmixer's and Bambu Studio's (arrows to move along, rings to turn on). You choose with the switch beside Snap Grid.
- **Import and export:** STL, OBJ, 3MF (with colours), STEP and SVG in; STL, 3MF, OBJ, STEP, PNG and PDF or SVG drawings out.
- **Your printer's plate**, with more than 220 printers to choose from, and sending to a Bambu Lab printer's slicer in one step.

## User guide

The guide comes with the program: **User guide** at the bottom of the window opens it, step by step and with pictures.

## Download

The [latest release](https://github.com/rakeshjivan/Pare3D/releases/latest) has the Pare 3D app for **Mac** and **Windows** (and **Linux**). The app keeps itself up to date, works offline, and keeps your designs on your computer.

## Run from source

You need [Node.js](https://nodejs.org) 22.18 or newer.

```bash
git clone https://github.com/rakeshjivan/Pare3D.git
cd Pare3D
npm install
npm run dev
```

Then open `http://127.0.0.1:3000/`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run typecheck` | TypeScript checks |
| `npm run test` | Unit tests |
| `npm run export` | Static export for plain web hosting (in `apps/web/.next-export/`) |
| `npm run guide` | Builds the user guide from `docs/guide` |
| `npm run mcp:layerling` | Starts the MCP server for AI clients |

**Static hosting.** The export is plain files that any web server can serve. They must be at the root of an address, not in a subfolder, and folders starting with `_` must be served. Installing as an app and offline use need `https://`.

**Docker.** `docker compose -f docker/compose.yml up -d --build` builds and runs it on port 3000. See [`docker/`](docker/) for the files.

**AI clients (MCP).** The development server includes an MCP server that lets an AI client such as Claude, Codex or Gemini drive an open editor. It can create shapes, change sizes, group, cut, round edges, read the scene and take pictures. The tools keep their original names (`layerling_…`). Setup files are in `.mcp.json`, `docs/mcp/` and `docs/skills/layerling-mcp-skill`, and the user guide's chapter *Building with an AI* explains the setup step by step.

## Licences and credits

Copyright (C) 2026 Rakesh Jivan and the Pare 3D contributors.

Pare 3D is free software, licensed under the **GNU Affero General Public License v3.0 only** (`AGPL-3.0-only`); see [LICENSE](LICENSE). If you change Pare 3D and let people use your version over a network, the licence asks you to offer them its source code.

**Where the code comes from.** Pare 3D began as a modified version of [layerling](https://github.com/henmedia/layerling) (copyright (C) 2026 layerling contributors). layerling is itself a modified version of [SketchForge-3D](https://github.com/Formsmith746/SketchForge-3D) (copyright (C) 2026 SketchForge contributors). Both are licensed under the AGPL-3.0, and their copyright notices are kept in the source. Pare 3D has been changed substantially since, and the full history is in this repository.

**Libraries.** three.js, Manifold, OpenCascade (through occt-wasm and brepjs), meshoptimizer, three-mesh-bvh, three-bvh-csg, opentype.js, fflate, qrcode-generator, React, Next.js and Lucide. Each keeps its own licence; see `package.json`.

**Trademarks.** Meshmixer is a trademark of Autodesk, Inc.; Bambu Lab and Bambu Studio of Bambu Lab. Pare 3D is an independent project and is not affiliated with, endorsed or sponsored by any of them.

## Feedback

Problems and suggestions are welcome: use **Report a problem / suggest** in the program, or open an [issue](https://github.com/rakeshjivan/Pare3D/issues).
