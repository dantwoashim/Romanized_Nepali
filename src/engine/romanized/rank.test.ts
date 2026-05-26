import { describe, expect, it } from "vitest";
import { capCandidates, displayedAlternatives } from "./candidates";
import { inferRomanizedContext } from "./context";
import { findPhraseMatches } from "./phraseMatch";
import { buildCandidateScore, CANDIDATE_LIMITS } from "./rank";
import type { Candidate } from "../types";

describe("Romanized ranking helpers", () => {
  it("uses score fields without candidate explosion penalties", () => {
    const score = buildCandidateScore({ source: "phrase", rawScore: 2200, domainMatched: true });

    expect(score.phraseBoost).toBe(2200);
    expect(score.domainScore).toBeGreaterThan(0);
    expect(score.total).toBeGreaterThan(score.phoneticScore);
    expect("candidateExplosionPenalty" in score).toBe(false);
  });

  it("caps candidates through hard limits", () => {
    const candidates = Array.from({ length: 20 }, (_, index): Candidate => ({
      text: String(index),
      normalizedText: String(index),
      source: "rule",
      confidence: 0.5,
      score: buildCandidateScore({ source: "rule", rawScore: index }),
      evidence: [],
      warnings: []
    }));

    expect(capCandidates(candidates)).toHaveLength(CANDIDATE_LIMITS.maxCandidatesPerToken);
    expect(displayedAlternatives(candidates)).toHaveLength(CANDIDATE_LIMITS.maxDisplayedAlternatives);
    expect(displayedAlternatives(candidates)[0].text).toBe("19");
  });

  it("finds reviewed phrases away from the sentence beginning", () => {
    const matches = findPhraseMatches("mero form ma jilla prashasan karyalaya ko naam wrong cha", "romanized-government");

    expect(matches[0]).toMatchObject({
      input: "jilla prashasan karyalaya",
      normalizedOutput: "जिल्ला प्रशासन कार्यालय"
    });
  });

  it("derives domain context from engine modes", () => {
    expect(inferRomanizedContext("romanized-legal")).toMatchObject({
      domains: ["legal"],
      preserveEnglish: true,
      nameHeavy: false
    });
    expect(inferRomanizedContext("romanized-strict").preserveEnglish).toBe(false);
  });
});
