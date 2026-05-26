import {
  assertBundleEligible,
  loadLexicalAuthority,
  queryLexiconByRomanized,
  queryPhraseWindows,
  queryRuntimeDictionary,
  sourceManifestById,
  SOURCE_PRIORITY
} from "./index";

describe("lexical authority layer", () => {
  it("loads reviewed and imported lexicon sources with explicit priority", () => {
    const authority = loadLexicalAuthority();
    expect(SOURCE_PRIORITY[0]).toBe("protected-span-rule");
    expect(authority.sources.some((source) => source.id === "dictionary-ne" && source.reviewStatus === "imported-unreviewed")).toBe(true);
    expect(authority.entries.some((entry) => entry.reviewStatus === "reviewed")).toBe(true);
    expect(authority.entries.some((entry) => entry.reviewStatus === "imported-unreviewed")).toBe(true);
  });

  it("keeps source license gates explicit", () => {
    const manual = sourceManifestById("manual-curation");
    const wikipedia = sourceManifestById("local-wikipedia-frequency");
    expect(manual).toBeDefined();
    expect(() => assertBundleEligible(manual!)).not.toThrow();
    expect(wikipedia?.bundleEligible).toBe(false);
  });

  it("queries reviewed aliases and runtime dictionary rows without elevating generated rows above reviewed rows", () => {
    const authority = loadLexicalAuthority();
    expect(queryLexiconByRomanized(authority, "bhattary").some((entry) => entry.word === "भट्टराई")).toBe(true);
    const runtime = queryRuntimeDictionary("pokhrel");
    expect(runtime[0]?.word).toBe("पोखरेल");
    expect(runtime[0]?.reviewStatus).toBe("reviewed");
  });

  it("exposes sliding phrase windows through the authority facade", () => {
    const matches = queryPhraseWindows("mero form ma jilla prashasan karyalaya ko naam wrong cha");
    expect(matches.map((match) => match.output)).toContain("जिल्ला प्रशासन कार्यालय");
    expect(matches.every((match) => match.tokenLength >= 2)).toBe(true);
  });

  it("loads loanword and English-preserve dictionaries separately", () => {
    const authority = loadLexicalAuthority();
    expect(authority.loanwords.some((entry) => entry.input === "digital" && entry.output === "डिजिटल")).toBe(true);
    expect(authority.englishPreserve.some((entry) => entry.value === "PDF")).toBe(true);
    expect(authority.englishPreserve.some((entry) => entry.value === "Form No.")).toBe(true);
  });
});
