import { describe, expect, it } from "vitest";
import { convertRomanized } from ".";
import { normalizeNepaliText } from "../../core/normalize/normalizeNepaliText";
import type { CorrectionMemoryEntry } from "../memory/types";
import { buildAliasCollisionReport } from "./aliasGraph";
import { buildApprovedAliasVariants, generateAliasVariants } from "./aliasFactory";
import { AliasTrie } from "./aliasTrie";
import { assessRomanizedConfidence } from "./confidence";
import { loanwordCandidates } from "./loanwords";
import { applyRomanizedNumberPolicy } from "./numbers";
import { generateSyllableCandidates } from "./syllables";
import { tokenizeRomanized } from "./tokenizer";

describe("Romanized candidate engine skeleton", () => {
  it("tokenizes words, protected spans, numbers, and ward-style identifiers", () => {
    const tokens = tokenizeRomanized("NID form ward-05 test@example.com 2083");
    expect(tokens.map((token) => [token.text, token.kind])).toEqual([
      ["NID", "word"],
      [" ", "space"],
      ["form", "word"],
      [" ", "space"],
      ["ward-05", "protected"],
      [" ", "space"],
      ["test@example.com", "protected"],
      [" ", "space"],
      ["2083", "number"]
    ]);
  });

  it("generates bounded syllable candidates for ri, aa, and x/ksh cases", () => {
    expect(generateSyllableCandidates("kri").map((candidate) => candidate.normalizedText)).toContain("कृ");
    expect(convertRomanized("maanab", { mode: "romanized-government" }).normalizedOutput).toBe("मानव");
    expect(generateSyllableCandidates("xetra").some((candidate) => candidate.normalizedText.includes("क्ष"))).toBe(true);
    expect(generateSyllableCandidates("sangkalpit").length).toBeLessThanOrEqual(6);
  });

  it("applies mode-aware number policy without corrupting IDs", () => {
    expect(applyRomanizedNumberPolicy("2083", "convert-devanagari", "Bi.Sam. 2083 saal")).toBe("२०८३");
    expect(applyRomanizedNumberPolicy("2079-080", "convert-devanagari", "Form No. 2079-080")).toBe("2079-080");
    expect(applyRomanizedNumberPolicy("9841000000", "convert-devanagari", "phone number")).toBe("9841000000");
  });

  it("keeps loanwords as candidates in normal modes and preserves mixed English through the facade", () => {
    expect(loanwordCandidates("digital", "romanized-strict").map((candidate) => candidate.normalizedText)).toContain("डिजिटल");
    expect(convertRomanized("PDF ma digital form cha", { mode: "romanized-mixed" }).normalizedOutput).toContain("PDF");
  });

  it("builds weighted alias variants, trie lookups, and collision reports", () => {
    const variants = generateAliasVariants("विश्व", ["vishwa"]);
    expect(variants.map((variant) => variant.alias)).toEqual(expect.arrayContaining(["vishwa", "bishwa"]));
    const approved = buildApprovedAliasVariants();
    const trie = new AliasTrie(approved);
    expect(trie.lookup("swasthya").some((variant) => variant.word === normalizeNepaliText("स्वास्थ्य"))).toBe(true);
    const collisions = buildAliasCollisionReport(approved);
    expect(collisions.variantCount).toBeGreaterThan(0);
    expect(collisions.aliasCount).toBeGreaterThan(0);
  });

  it("uses local correction memory as a bounded candidate source without touching protected spans", () => {
    const memory: CorrectionMemoryEntry[] = [{
      id: "test-memory-1",
      inputRomanized: "sxnra",
      normalizedInput: "sxnra",
      chosenOutput: "स्मरण",
      normalizedOutput: "स्मरण",
      rejectedAlternatives: [],
      context: { leftWindow: "", rightWindow: "" },
      source: "user-accept",
      frequency: 12,
      confidenceAtSelection: 0.7,
      timestamps: { firstSeen: "2026-05-26T00:00:00.000Z", lastUsed: "2026-05-26T00:00:00.000Z" },
      pinned: true
    }];
    const result = convertRomanized("sxnra", { mode: "romanized-strict", correctionMemoryEntries: memory });
    expect(result.normalizedOutput).toBe("स्मरण");
    expect(result.alternatives[0]?.source).toBe("memory");
  });

  it("marks suspicious Latin residue as ambiguous instead of silent success", () => {
    const confidence = assessRomanizedConfidence({
      sourceInput: "abcxyz",
      output: "abcxyz",
      mode: "romanized-strict",
      alternatives: []
    });
    expect(confidence.status).toBe("ambiguous");
    expect(confidence.warnings.some((warning) => warning.code === "ROMANIZED_LATIN_RESIDUE")).toBe(true);
  });

  it("candidate-gates collision-heavy personal names instead of silently pretending certainty", () => {
    for (const input of ["sita", "ram", "sharma", "neupane"]) {
      const result = convertRomanized(input, { mode: "romanized-name-heavy" });
      expect(result.alternatives.length, input).toBeGreaterThan(1);
      expect(result.warnings.some((warning) => warning.code === "ROMANIZED_ALIAS_COLLISION"), input).toBe(true);
    }
  });
});
