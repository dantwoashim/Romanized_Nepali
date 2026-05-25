import fixtures from "../../data/fixtures/normalization-fixtures.json";
import { normalizeCopyOutput, normalizeNepaliText } from "./normalizeNepaliText";

describe("normalizeNepaliText", () => {
  it("matches normalization fixtures", () => {
    for (const fixture of fixtures) {
      if ("expected" in fixture) {
        expect(normalizeNepaliText(fixture.input)).toBe(fixture.expected);
      }
      if ("expectedCopy" in fixture) {
        expect(normalizeCopyOutput(fixture.input)).toBe(fixture.expectedCopy);
      }
    }
  });

  it("is idempotent", () => {
    for (const fixture of fixtures) {
      const once = normalizeNepaliText(fixture.input);
      expect(normalizeNepaliText(once)).toBe(once);
    }
  });

  it("does not insert ZWJ or ZWNJ", () => {
    const value = normalizeNepaliText("नेपाल सरकार");
    expect(value).not.toContain("\u200D");
    expect(value).not.toContain("\u200C");
  });
});
