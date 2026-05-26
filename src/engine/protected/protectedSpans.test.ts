import { EngineCorruption } from "../types";
import { extractProtectedSpans, restoreProtectedSpans } from "./index";

function originals(input: string) {
  return extractProtectedSpans(input, "romanized-mixed").spans.map((span) => span.original);
}

describe("protected span engine", () => {
  it("preserves email, URL, phone, acronyms, IDs, office labels, quoted examples, and file names", () => {
    const input =
      'PDF file report.docx ko Form No. 2079-080 ward-05 email@test.com https://example.com/form?id=2079-080 phone 9841000000 "swasthya"';
    const result = extractProtectedSpans(input, "romanized-mixed");
    const found = result.spans.map((span) => span.original);

    for (const expected of [
      "PDF",
      "report.docx",
      "Form No.",
      "2079-080",
      "ward-05",
      "email@test.com",
      "https://example.com/form?id=2079-080",
      "9841000000",
      '"swasthya"'
    ]) {
      expect(found, expected).toContain(expected);
    }

    const restored = restoreProtectedSpans(result.protectedText, result.spans);
    expect(restored).toBe(input);
  });

  it("protects soft English phrases only in mixed/document modes", () => {
    expect(originals("user le correct final output herna parcha")).toEqual(["user", "correct", "final output"]);
    expect(extractProtectedSpans("user le correct final output herna parcha", "romanized-strict").spans).toHaveLength(0);
  });

  it("uses conflict resolution so URLs win over nested IDs and date-like fragments", () => {
    const result = extractProtectedSpans("open https://example.com/form?id=2079-080 now", "romanized-mixed");
    expect(result.spans.map((span) => span.original)).toContain("https://example.com/form?id=2079-080");
    expect(result.spans.map((span) => span.original)).not.toContain("2079-080");
  });

  it("throws on missing placeholders, duplicates, and sentinel leakage", () => {
    const { spans } = extractProtectedSpans("PDF ma naam", "romanized-mixed");
    expect(() => restoreProtectedSpans("placeholder removed", spans)).toThrow(EngineCorruption);
    expect(() => restoreProtectedSpans(`${spans[0].placeholder} ${spans[0].placeholder}`, spans)).toThrow(EngineCorruption);
    expect(() => restoreProtectedSpans("\uE000LKH_leak_0\uE001", [])).toThrow(EngineCorruption);
  });

  it("restores protected originals byte-exactly while normalizing surrounding text", () => {
    const result = extractProtectedSpans("क\u093f PDF", "romanized-mixed");
    const restored = restoreProtectedSpans(result.protectedText, result.spans);
    expect(restored).toBe("कि PDF");
    expect(restored.includes("PDF")).toBe(true);
  });
});
