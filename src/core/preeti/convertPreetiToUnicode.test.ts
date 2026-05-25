import fixtures from "../../data/fixtures/preeti-fixtures.json";
import { normalizeNepaliText } from "../normalize/normalizeNepaliText";
import { convertPreetiToUnicode } from "./convertPreetiToUnicode";
import { getPreetiEntries } from "./preetiMap";

describe("convertPreetiToUnicode", () => {
  it("loads a documented mapping table", () => {
    expect(getPreetiEntries().length).toBeGreaterThan(90);
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

  it("preserves line breaks", () => {
    const result = convertPreetiToUnicode("sf\nsdf");
    expect(result.normalizedOutput).toBe("का\nकमा");
  });

  it("warns for every non-high-confidence mapping", () => {
    const result = convertPreetiToUnicode("1{[");
    expect(result.uncertainMappings).toHaveLength(3);
  });
});
