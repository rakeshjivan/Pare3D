import { describe, expect, it } from "vitest";

describe("handle style switch (build 99)", () => {
  it("starts as the box, switches to the gimbal, and a design opened starts with the box again", async () => {
    const listeners: Array<() => void> = [];
    (globalThis as unknown as { window: unknown }).window = {
      addEventListener: (_: string, fn: () => void) => { listeners.push(fn); },
      removeEventListener: () => {},
      dispatchEvent: () => { listeners.forEach((fn) => fn()); return true; },
    };
    const { handleStyle, setHandleStyle, resetHandleStyle } = await import("@/lib/handleStyle");
    expect(handleStyle()).toBe("box");
    let heard = 0;
    (globalThis as unknown as { window: { addEventListener: (e: string, f: () => void) => void } }).window.addEventListener("x", () => { heard += 1; });
    setHandleStyle("gimbal");
    expect(handleStyle()).toBe("gimbal");
    expect(heard).toBe(1);
    resetHandleStyle();
    expect(handleStyle()).toBe("box");
  });
});
