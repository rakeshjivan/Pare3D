import { afterEach, describe, expect, it } from "vitest";
import { setLanguage } from "@/lib/i18n";
import { displayShapeName, hasOwnShapeName, renamedShapeName } from "@/lib/shapeCatalog";

describe("displayShapeName", () => {
  afterEach(() => setLanguage("en", false));

  it("leaves a name somebody typed alone", () => {
    expect(displayShapeName({ name: "Deckel", kind: "box" })).toBe("Deckel");
    // "Box" on a cylinder is not the catalogue name for it, so it was chosen.
    expect(displayShapeName({ name: "Box", kind: "cylinder" })).toBe("Box");
  });

  it("switches back with the language", () => {
    setLanguage("en", false);
    expect(displayShapeName({ name: "Sketch extrusion", kind: "mesh" })).toBe("Sketch body");
    expect(displayShapeName({ name: "Box", kind: "box" })).toBe("Box");
  });
});

describe("renamedShapeName", () => {
  afterEach(() => setLanguage("en", false));

  it("stores a new name, trimmed", () => {
    expect(renamedShapeName({ name: "Box", kind: "box" }, "  Lid  ")).toBe("Lid");
    expect(renamedShapeName({ name: "Lid", kind: "box" }, "Base")).toBe("Base");
  });

  it("changes nothing when the shown name is confirmed as it is", () => {
    expect(renamedShapeName({ name: "Lid", kind: "box" }, "Lid")).toBeUndefined();
    expect(renamedShapeName({ name: "Lid", kind: "box" }, " Lid ")).toBeUndefined();
  });

  it("does not store the translated name of an untouched shape", () => {
    // Confirming the shown name keeps the stored one.
    expect(renamedShapeName({ name: "Sketch extrusion", kind: "mesh" }, "Sketch body")).toBeUndefined();
  });

  it("clears the name when the field is emptied, which shows the default again", () => {
    const shape = { name: "Lid", kind: "box" as const };
    expect(renamedShapeName(shape, "   ")).toBe("");
    expect(displayShapeName({ ...shape, name: "" })).toBe("Box");
  });
});

// The export window suggests the name of a single body only when somebody gave it one (forum, 26.10.2026).
describe("hasOwnShapeName", () => {
  afterEach(() => setLanguage("en", false));

  it("tells a typed name from one the editor handed out", () => {
    expect(hasOwnShapeName({ name: "Lid", kind: "box" })).toBe(true);
    expect(hasOwnShapeName({ name: "Box", kind: "cylinder" })).toBe(true);
    expect(hasOwnShapeName({ name: "Box", kind: "box" })).toBe(false);
    expect(hasOwnShapeName({ name: "Group", kind: "mesh" })).toBe(false);
    expect(hasOwnShapeName({ name: "Hull", kind: "mesh" })).toBe(false);
    expect(hasOwnShapeName({ name: "  ", kind: "box" })).toBe(false);
  });
});
