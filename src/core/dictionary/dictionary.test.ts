import suggestionFixtures from "../../data/fixtures/suggestion-fixtures.json";
import { normalizeNepaliText } from "../normalize/normalizeNepaliText";
import { getSpellHints, levenshtein } from "./spellHints";
import { parseSeedWords, validateWordlist, wordEntries } from "./loadSeedWords";
import { suggestWords } from "./suggestWords";

describe("seed dictionary", () => {
  it("validates the bundled wordlist", () => {
    expect(validateWordlist()).toEqual([]);
  });

  it("normalizes every seed word", () => {
    for (const entry of parseSeedWords()) {
      expect(entry.normalizedWord).toBe(normalizeNepaliText(entry.word));
    }
  });

  it("contains practical seed coverage", () => {
    expect(wordEntries.length).toBeGreaterThan(180);
  });
});

describe("suggestWords", () => {
  it("returns prefix fixtures", () => {
    for (const fixture of suggestionFixtures) {
      expect(suggestWords(fixture.prefix)[0]?.word).toBe(fixture.expectedFirst);
    }
  });

  it("supports devanagari prefix lookup", () => {
    expect(suggestWords("विद्या").some((suggestion) => suggestion.word === "विद्यार्थी")).toBe(true);
  });
});

describe("spell hints", () => {
  it("flags unknown words gently", () => {
    const hints = getSpellHints("नेपाल सरकार झझझझ");
    expect(hints.some((hint) => hint.label === "Possible typo")).toBe(true);
  });

  it("does not flag known seed words", () => {
    expect(getSpellHints("नेपाल सरकार सेवा")).toEqual([]);
  });

  it("calculates edit distance", () => {
    expect(levenshtein("सरकर", "सरकार")).toBe(1);
  });
});
