import fixtures from "../../data/fixtures/preeti-fixtures.json";
import heldOutFixtures from "../../data/fixtures/preeti-heldout-fixtures.json";
import userSubmittedFixtures from "../../data/fixtures/preeti-user-submitted-fixtures.json";
import { normalizeNepaliText } from "../normalize/normalizeNepaliText";
import { convertPreetiToUnicode } from "./convertPreetiToUnicode";
import { getPreetiEntries } from "./preetiMap";
import { cleanupHalanta, reorderLeadingShortI, repairInternalShortIClusters } from "./preetiPostRules";

describe("convertPreetiToUnicode", () => {
  it("loads a documented mapping table", () => {
    expect(getPreetiEntries().length).toBeGreaterThan(90);
  });

  it("ships with at least 10,000 real Preeti round-trip fixtures", () => {
    expect(fixtures.length).toBeGreaterThanOrEqual(10000);
    const categories = new Set(fixtures.map((fixture) => fixture.category));
    for (const category of [
      "dictionary-ne-reph",
      "dictionary-ne-conjunct",
      "dictionary-ne-half-letter",
      "word-level",
      "mixed-english"
    ]) {
      expect(categories.has(category), category).toBe(true);
    }
    expect(fixtures.filter((fixture) => fixture.source === "dictionary-ne@2.0.0-roundtrip").length).toBeGreaterThanOrEqual(9900);
    expect(heldOutFixtures.length).toBeGreaterThanOrEqual(5);
    expect(Array.isArray(userSubmittedFixtures)).toBe(true);
  });

  it("converts fixture examples and normalizes output", () => {
    for (const fixture of fixtures) {
      const result = convertPreetiToUnicode(fixture.input);
      expect(result.normalizedOutput).toBe(fixture.expected);
      expect(result.normalizedOutput).toBe(normalizeNepaliText(result.output));
      if ("warningCode" in fixture) {
        expect(result.warnings.some((warning) => warning.code === fixture.warningCode)).toBe(true);
      }
    }
  });

  it("handles a real-looking multiline paragraph", () => {
    const paragraphFixture = fixtures.find((fixture) => fixture.category === "paragraph");
    expect(paragraphFixture).toBeDefined();
    const result = convertPreetiToUnicode(paragraphFixture!.input);
    expect(result.normalizedOutput).toBe(paragraphFixture!.expected);
    expect(result.normalizedOutput).toContain("\n");
  });

  it("preserves line breaks", () => {
    const result = convertPreetiToUnicode("sf\nsdf");
    expect(result.normalizedOutput).toBe("का\nकमा");
  });

  it("reports preserved English and acronym tokens as informational warnings", () => {
    const result = convertPreetiToUnicode("NID form l/kf]6{ 123");
    expect(result.normalizedOutput).toBe("NID form रिपोर्ट 123");
    expect(result.warnings.filter((warning) => warning.code === "PRESERVED_ENGLISH_TOKEN").map((warning) => warning.sourceChar)).toEqual([
      "NID",
      "form",
      "123"
    ]);
  });

  it("preserves existing Unicode and English runs without applying Preeti postrules to them", () => {
    const result = convertPreetiToUnicode("Form No 7 भरियो");
    expect(result.normalizedOutput).toBe("Form No 7 भरियो");
    expect(result.warnings.some((warning) => warning.code === "PRESERVED_UNICODE_TOKEN" && warning.sourceChar === "भरियो")).toBe(true);
    expect(result.warnings.some((warning) => warning.code === "UNCERTAIN_PREETI_MAPPING")).toBe(false);
  });

  it("does not emit mapping warnings for preserved technical English tokens", () => {
    const result = convertPreetiToUnicode("URL link email test");
    expect(result.normalizedOutput).toBe("URL link email test");
    expect(result.warnings.every((warning) => warning.code === "PRESERVED_ENGLISH_TOKEN")).toBe(true);
  });

  it("covers hard benchmark cases for matra reorder, reph, conjuncts, English, punctuation, and line breaks", () => {
    const hardCases = [
      { input: "ls", expected: "कि", reason: "short-i matra after consonant" },
      { input: "ls/0f", expected: "किरण", reason: "short-i matra before reph-bearing word" },
      { input: "lg0f{o", expected: "निर्णय", reason: "reph repositioning" },
      { input: "k|fy{gf", expected: "प्रार्थना", reason: "reph and aa matra" },
      { input: "sd{rf/L", expected: "कर्मचारी", reason: "reph plus long-i matra" },
      { input: "sfof{no", expected: "कार्यालय", reason: "reph inside office word" },
      { input: "/fi6«", expected: "राष्ट्र", reason: "common conjunct with reph mark" },
      { input: ">4f", expected: "श्रद्धा", reason: "shra/ddha conjuncts" },
      { input: "If]q", expected: "क्षेत्र", reason: "ksha/tra conjuncts" },
      { input: "1fkg", expected: "ज्ञापन", reason: "gya conjunct" },
      { input: "NID form l/kf]6{ 123", expected: "NID form रिपोर्ट 123", reason: "preserved English tokens and numbers" },
      {
        input: ";/sf/sf] ;\"rgf\nsfof{nodf btf{ eof].",
        expected: "सरकारको सूचना\nकार्यालयमा दर्ता भयो।",
        reason: "long government sentence with line break and punctuation"
      }
    ];

    for (const fixture of hardCases) {
      expect(convertPreetiToUnicode(fixture.input).normalizedOutput, fixture.reason).toBe(fixture.expected);
    }
  });

  it("repairs the reviewed Preeti R shorthand for उच्चतम् on the selected baseline path", () => {
    expect(convertPreetiToUnicode("pRtd\\").normalizedOutput).toBe("उच्चतम्");
    expect(convertPreetiToUnicode("pRrtd\\").normalizedOutput).toBe("उच्चतम्");
  });

  it("maps boundary h-question Preeti suffixes without leaking literal question marks", () => {
    const cases = [
      { input: "b'ikl/0ffdx?", expected: "दुष्परिणामहरू" },
      { input: "nIox?", expected: "लक्ष्यहरू" },
      { input: "x?,", expected: "हरू," },
      { input: "x?.", expected: "हरू।" },
      { input: "x?।", expected: "हरू।" },
      { input: "x?)", expected: "हरू)" },
      { input: "x?\n", expected: "हरू\n" },
      { input: "x? ", expected: "हरू " }
    ];

    for (const fixture of cases) {
      expect(convertPreetiToUnicode(`sfof{no ${fixture.input}`).normalizedOutput).toBe(`कार्यालय ${fixture.expected}`);
    }
    expect(convertPreetiToUnicode("sfg'gL k|sl|of ;'? eof].").normalizedOutput).toBe("कानुनी प्रक्रिया सुरु भयो।");
    expect(convertPreetiToUnicode("URL?").normalizedOutput).toBe("URL?");
  });

  it("repairs the known Preeti daayitwabodh sequence without changing unrelated text", () => {
    expect(convertPreetiToUnicode("bfloTjabf]w").normalizedOutput).toBe("दायित्वबोध");
  });

  it("keeps held-out clean-room fixtures separate from generated fixtures", () => {
    for (const fixture of heldOutFixtures) {
      const result = convertPreetiToUnicode(fixture.input);
      expect(result.normalizedOutput, fixture.name).toBe(fixture.expected);
    }
  });

  it("applies clean-room postrules without external maps", () => {
    expect(reorderLeadingShortI("िक")).toBe("कि");
    expect(reorderLeadingShortI("िक्ल")).toBe("क्लि");
    expect(repairInternalShortIClusters("प्रकि्रया")).toBe("प्रक्रिया");
    expect(cleanupHalanta("क््ा")).toBe("का");
  });

  it("warns for every non-high-confidence mapping", () => {
    const result = convertPreetiToUnicode("1{[");
    expect(result.uncertainMappings).toHaveLength(3);
  });
});
