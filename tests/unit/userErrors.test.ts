import { describe, expect, it } from "vitest";
import { ERROR_RULES, localizedError } from "@/lib/userErrors";
import { MESSAGES_EN } from "@/lib/messages.en";

describe("error messages for people", () => {
  it("explains that the browser ran out of memory (#383)", () => {
    for (const raw of ["Array buffer allocation failed", "RangeError: Invalid array length", "Out of memory"]) {
      expect(localizedError(raw)).toBe(MESSAGES_EN["error.outOfMemory"]);
    }
  });

  it("shows known texts from the message table, and others as they are", () => {
    expect(localizedError("The stored CAD feature could not be restored as a valid solid")).toBe(MESSAGES_EN["error.storedBodyRestore"]);
    expect(localizedError("Something unexpected could not be written")).toBe("Something unexpected could not be written");
  });

  it("has a text for every rule", () => {
    for (const rule of ERROR_RULES) expect(MESSAGES_EN[rule.key], rule.key).toBeTruthy();
  });
});
