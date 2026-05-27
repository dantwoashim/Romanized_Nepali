import { describe, expect, it } from "vitest";
import { segmentDocument } from "./segmenter";

describe("UniversalSpanSegmenter", () => {
  it("assigns every character to exactly one span", () => {
    const input = `मृत्य' btf{ PDF email@test.com English tokenharu`;
    const result = segmentDocument(input, { mode: "mixed-unicode-legacy-repair" });
    expect(result.spans.map((span) => span.text).join("")).toBe(input);
    for (let index = 1; index < result.spans.length; index += 1) {
      expect(result.spans[index - 1].range[1]).toBe(result.spans[index].range[0]);
    }
  });

  it("detects protected digital spans before conversion", () => {
    const input = `Form No. 2079-080 ward-05 PDF email@test.com`;
    const result = segmentDocument(input, { mode: "romanized-mixed-office" });
    expect(result.spans.map((span) => [span.kind, span.text])).toContainEqual(["identifier", "Form No. 2079-080"]);
    expect(result.spans.map((span) => [span.kind, span.text])).toContainEqual(["identifier", "ward-05"]);
    expect(result.spans.map((span) => [span.kind, span.text])).toContainEqual(["identifier", "PDF"]);
    expect(result.spans.map((span) => [span.kind, span.text])).toContainEqual(["email", "email@test.com"]);
  });

  it("detects Preeti legacy islands inside Unicode tokens", () => {
    const result = segmentDocument(`मृत्य' btf{ बहाद'/ yfkf`, { mode: "mixed-unicode-legacy-repair" });
    expect(result.spans.map((span) => [span.kind, span.text])).toEqual([
      ["unicode-nepali", "मृत्य"],
      ["preeti-legacy", "'"],
      ["whitespace", " "],
      ["preeti-legacy", "btf{"],
      ["whitespace", " "],
      ["unicode-nepali", "बहाद"],
      ["preeti-legacy", "'/"],
      ["whitespace", " "],
      ["preeti-legacy", "yfkf"]
    ]);
  });

  it("parses English stems with Nepali suffixes", () => {
    const result = segmentDocument("English tokenharu fileharu systemmaa recordko", { mode: "romanized-mixed-office" });
    expect(result.spans.map((span) => [span.kind, span.text])).toContainEqual(["english-with-nepali-suffix", "tokenharu"]);
    expect(result.spans.map((span) => [span.kind, span.text])).toContainEqual(["english-with-nepali-suffix", "fileharu"]);
    expect(result.spans.map((span) => [span.kind, span.text])).toContainEqual(["english-with-nepali-suffix", "systemmaa"]);
    expect(result.spans.map((span) => [span.kind, span.text])).toContainEqual(["english-with-nepali-suffix", "recordko"]);
  });

  it("does not split known Nepali Romanized words as English suffixes", () => {
    const result = segmentDocument("shabdaharu pani", { mode: "romanized-mixed-office" });
    expect(result.spans.map((span) => [span.kind, span.text])).toEqual([
      ["romanized-nepali", "shabdaharu"],
      ["whitespace", " "],
      ["romanized-nepali", "pani"]
    ]);
  });

  it("warns instead of auto-converting low-confidence Preeti-like spans", () => {
    const result = segmentDocument("abc[def", { mode: "mixed-unicode-legacy-repair" });
    expect(result.spans[0].kind).toBe("unknown-risky");
    expect(result.spans[0].legalActions).toContain("warn");
  });
});
