import { describe, expect, it } from "vitest";
import { createKeyboardEngine, defaultTypingContext } from "./index";
import type { KeyboardKeyEvent } from "./types";

function key(value: string): KeyboardKeyEvent {
  return {
    key: value,
    code: value === " " ? "Space" : value.length === 1 ? `Key${value.toUpperCase()}` : value,
    modifiers: { shift: false, ctrl: false, alt: false, meta: false },
    timestamp: 1,
    platform: "test"
  };
}

describe("KeyboardEngine session API", () => {
  it("updates Romanized composition and returns candidates", () => {
    const engine = createKeyboardEngine();
    const sessionId = engine.beginSession(defaultTypingContext("romanized"));
    const update = engine.updateComposition(sessionId, "swasthya", 8);
    expect(update.compositionText).toBe("swasthya");
    expect(update.displayText).toBe("स्वास्थ्य");
    expect(update.primary?.text).toBe("स्वास्थ्य");
    expect(update.candidates.length).toBeGreaterThan(0);
  });

  it("processes native-style key strokes", () => {
    const engine = createKeyboardEngine();
    const sessionId = engine.beginSession(defaultTypingContext("romanized"));
    for (const char of "swas") {
      engine.processKeyStroke(sessionId, key(char));
    }
    const update = engine.processKeyStroke(sessionId, key("t"));
    expect(update.compositionText).toBe("swast");
    expect(update.candidates.some((candidate) => candidate.text.startsWith("स्व"))).toBe(true);
  });

  it("commits selected candidate and clears composition", () => {
    const engine = createKeyboardEngine();
    const sessionId = engine.beginSession(defaultTypingContext("romanized"));
    const update = engine.updateComposition(sessionId, "karyalaya", 9);
    const result = engine.commitCandidate(sessionId, update.primary?.id ?? "");
    expect(result.committedText).toBe("कार्यालय");
    expect(result.consumedRange).toEqual([0, 9]);
    const after = engine.updateComposition(sessionId, "", 0);
    expect(after.compositionText).toBe("");
  });

  it("preserves raw input in secure contexts", () => {
    const engine = createKeyboardEngine();
    const context = {
      ...defaultTypingContext("romanized"),
      secureInput: true,
      fieldType: "password" as const
    };
    const sessionId = engine.beginSession(context);
    const update = engine.updateComposition(sessionId, "swasthya", 8);
    expect(update.displayText).toBe("swasthya");
    expect(update.candidates).toHaveLength(0);
    expect(update.warnings.join(" ")).toMatch(/Secure/);
  });

  it("keeps Traditional mode as an honest placeholder until audit completes", () => {
    const engine = createKeyboardEngine();
    const sessionId = engine.beginSession(defaultTypingContext("traditional"));
    const update = engine.updateComposition(sessionId, "abc", 3);
    expect(update.displayText).toBe("abc");
    expect(update.candidates).toHaveLength(0);
    expect(update.warnings.join(" ")).toMatch(/Traditional layout mapping pending/);
  });

  it("supports proof hints, dictionary lookup, mode changes, and warm", async () => {
    const engine = createKeyboardEngine();
    const sessionId = engine.beginSession(defaultTypingContext("romanized"));
    expect(engine.getProofHints("सवस्थ्य")).toHaveLength(1);
    expect(engine.lookupDictionary("swasthya").some((row) => row.word === "स्वास्थ्य")).toBe(true);
    engine.setMode(sessionId, "traditional");
    expect(engine.updateComposition(sessionId, "x", 1).warnings.join(" ")).toMatch(/Traditional/);
    const warm = await engine.warm({ timeoutMs: 50 });
    expect(warm.loadedModules.length).toBeGreaterThan(0);
  });
});
