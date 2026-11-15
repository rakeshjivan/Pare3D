/*
 * Build 113: the browser version of Pare 3D lives under a folder of its web address
 * (rakeshjivan.github.io/Pare3D/), not at the top. Next adds the folder to its own files and
 * links; addresses the program writes itself ("/en/index.html", "/occt/...") go through
 * withBase. Empty in the Mac app and every other build, where nothing changes.
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

/** A site address ("/x/y") under the folder the program is served from. Other addresses pass unchanged. */
export function withBase(path: string): string {
  if (!BASE_PATH || !path.startsWith("/") || path.startsWith("//") || path.startsWith(`${BASE_PATH}/`)) return path;
  return `${BASE_PATH}${path}`;
}

/** Build 113: the browser version (GitHub Pages), as against the Mac app and its local server. */
export const PARE_WEB = process.env.NEXT_PUBLIC_PARE_WEB === "true";
