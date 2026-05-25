import fixtures from "../../data/fixtures/preeti-fixtures.json";
import { normalizeNepaliText } from "../normalize/normalizeNepaliText";
import { convertPreetiToUnicode } from "./convertPreetiToUnicode";
import { getPreetiEntries } from "./preetiMap";

describe("convertPreetiToUnicode", () => {
  it("loads a documented mapping table", () => {
    expect(getPreetiEntries().length).toBeGreaterThan(90);
  });

  it("ships with at least 10,000 Preeti fixtures across document-like categories", () => {
    expect(fixtures.length).toBeGreaterThanOrEqual(10000);
    const categories = new Set(fixtures.map((fixture) => fixture.category));
    for (const category of [
      "paragraph-generated",
      "table-generated",
      "form-generated",
      "name-date-generated",
      "ambiguous-generated",
      "mixed-english-generated",
      "multiline-generated"
    ]) {
      expect(categories.has(category), category).toBe(true);
    }
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

  it("warns for every non-high-confidence mapping", () => {
    const result = convertPreetiToUnicode("1{[");
    expect(result.uncertainMappings).toHaveLength(3);
  });
});
