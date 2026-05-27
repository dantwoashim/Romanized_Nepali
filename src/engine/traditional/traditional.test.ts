import { describe, expect, it } from "vitest";
import { getTraditionalLayout, hasVerifiedTraditionalLayout, mapTraditionalKeyEvent } from ".";
import type { KeyboardKeyEvent } from "../keyboard";

function key(value: string): KeyboardKeyEvent {
  return {
    key: value,
    code: `Key${value.toUpperCase()}`,
    modifiers: { shift: false, ctrl: false, alt: false, meta: false },
    timestamp: 1,
    platform: "test"
  };
}

describe("Traditional keyboard layout placeholder", () => {
  it("marks bundled Traditional layouts as pending audit", () => {
    expect(getTraditionalLayout("traditional-ltk-compatible").status).toBe("pending-audit");
    expect(getTraditionalLayout("traditional-standard").status).toBe("pending-audit");
    expect(hasVerifiedTraditionalLayout("traditional-ltk-compatible")).toBe(false);
  });

  it("passes keys through with an explicit warning while pending", () => {
    const mapped = mapTraditionalKeyEvent(key("a"), "traditional-ltk-compatible");
    expect(mapped.output).toBe("a");
    expect(mapped.warnings.join(" ")).toMatch(/pending source-of-truth audit/);
  });
});
