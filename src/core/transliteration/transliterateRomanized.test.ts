import fixtures from "../../data/fixtures/romanized-fixtures.json";
import { normalizeNepaliText } from "../normalize/normalizeNepaliText";
import { transliterateRomanized } from "./transliterateRomanized";

interface RomanizedFixture {
  category: string;
  input: string;
  expected: string;
}

describe("transliterateRomanized", () => {
  it("ships with at least 500 romanized fixtures", () => {
    expect((fixtures as RomanizedFixture[]).length).toBeGreaterThanOrEqual(500);
  });

  it("matches the romanized fixture suite", () => {
    for (const fixture of fixtures as RomanizedFixture[]) {
      const result = transliterateRomanized(fixture.input);
      expect(result.normalizedOutput, fixture.input).toBe(fixture.expected);
      expect(result.normalizedOutput).toBe(normalizeNepaliText(result.output));
    }
  });

  it("exposes ambiguity candidates for sh/s/Sh, ch/chh/c, x/ksh, ri, gya, tra, and shra", () => {
    const sh = transliterateRomanized("shakti");
    expect(sh.normalizedOutput).toBe("शक्ति");
    expect(sh.candidates.some((candidate) => candidate.normalizedText.includes("ष"))).toBe(true);

    const ch = transliterateRomanized("chala");
    expect(ch.candidates.some((candidate) => candidate.normalizedText.includes("छ"))).toBe(true);

    const x = transliterateRomanized("xetra");
    expect(x.normalizedOutput).toBe("क्षेत्र");
    expect(x.candidates.some((candidate) => candidate.normalizedText.includes("क्श"))).toBe(true);

    const ri = transliterateRomanized("rishi");
    expect(ri.normalizedOutput).toBe("ऋषि");
    expect(ri.trace.some((trace) => trace.rule === "dictionary-rank")).toBe(true);

    expect(transliterateRomanized("gyan").normalizedOutput).toBe("ज्ञान");
    expect(transliterateRomanized("patra").normalizedOutput).toBe("पत्र");
    expect(transliterateRomanized("shram").normalizedOutput).toBe("श्रम");
  });

  it("preserves mixed English/Nepali desktop text", () => {
    expect(transliterateRomanized("NID form ko naam field").normalizedOutput).toBe("NID form को नाम field");
    expect(transliterateRomanized("PDF ma naam").normalizedOutput).toBe("PDF मा नाम");
  });

  it("preserves Arabic numerals by default", () => {
    expect(transliterateRomanized("nagarikta 123").normalizedOutput).toBe("नागरिकता 123");
  });
});
