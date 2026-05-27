import { describe, expect, it } from "vitest";
import {
  clampRange,
  deleteAfterCaret,
  deleteBeforeCaret,
  insertAtCaret,
  replaceByUtf16Range,
  sliceByUtf16Range,
  validateRange
} from "./ranges";

describe("keyboard UTF-16 range helpers", () => {
  it("validates and clamps ASCII ranges", () => {
    expect(validateRange("abc", [0, 2])).toBe(true);
    expect(validateRange("abc", [-1, 2])).toBe(false);
    expect(clampRange("abc", [-5, 99])).toEqual([0, 3]);
    expect(sliceByUtf16Range("abc", [1, 3])).toBe("bc");
  });

  it("replaces mixed Latin and Devanagari text by native UTF-16 offsets", () => {
    const input = "formमा";
    expect(replaceByUtf16Range(input, [4, 6], "लाई")).toBe("formलाई");
  });

  it("inserts at a clamped caret", () => {
    expect(insertAtCaret("स्व", 99, "ा")).toEqual({ text: "स्वा", caret: 4 });
  });

  it("deletes without splitting surrogate pairs", () => {
    expect(deleteBeforeCaret("a🙂b", 3)).toEqual({ text: "ab", caret: 1 });
    expect(deleteAfterCaret("a🙂b", 1)).toEqual({ text: "ab", caret: 1 });
  });
});
