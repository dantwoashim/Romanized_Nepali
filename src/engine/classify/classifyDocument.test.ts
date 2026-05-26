import { classifyDocument } from "./index";

describe("classifyDocument", () => {
  it("classifies pure Devanagari as unicode passthrough", () => {
    const result = classifyDocument("नेपाल सरकारको सूचना");
    expect(result.modeRecommendation).toBe("unicode-passthrough");
    expect(result.documentConfidence).toBeGreaterThan(0.9);
  });

  it("classifies Romanized Nepali without protected terms as strict Romanized", () => {
    const result = classifyDocument("mero naam ramro cha");
    expect(result.modeRecommendation).toBe("romanized-strict");
    expect(result.spans.some((span) => span.kind === "romanized")).toBe(true);
  });

  it("classifies mixed English and Romanized text as Romanized mixed", () => {
    const result = classifyDocument("PDF ma naam wrong cha");
    expect(result.modeRecommendation).toBe("romanized-mixed");
    expect(result.spans.some((span) => span.routingPolicy === "protect")).toBe(true);
  });

  it("classifies Preeti-like text as strict Preeti when there is no protected span", () => {
    const result = classifyDocument("sfof{no");
    expect(result.modeRecommendation).toBe("preeti-strict");
    expect(result.stats.preetiLikelihood).toBeGreaterThan(0.55);
  });

  it("classifies Preeti-like mixed admin text as Preeti mixed", () => {
    const result = classifyDocument("sfof{no NID PDF email@test.com");
    expect(result.modeRecommendation).toBe("preeti-mixed");
    expect(result.spans.map((span) => span.text)).toEqual(expect.arrayContaining(["NID", "PDF", "email@test.com"]));
  });

  it("reports low-confidence unknown diagnostic for ambiguous Latin text", () => {
    const result = classifyDocument("abc xyz qqq");
    expect(result.modeRecommendation).toBe("unknown-diagnostic");
    expect(result.warnings.some((warning) => warning.code === "LOW_CLASSIFICATION_CONFIDENCE")).toBe(true);
  });
});
