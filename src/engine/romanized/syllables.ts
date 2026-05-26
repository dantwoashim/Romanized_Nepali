import { normalizeNepaliText } from "../../core/normalize/normalizeNepaliText";
import { composeRomanizedToken } from "../../core/transliteration/devanagariComposer";
import { normalizeRomanizedToken, normalizeRomanizedTokenForParsing } from "../../core/transliteration/latinNormalize";
import type { Candidate } from "../types";
import { capCandidates } from "./candidates";
import { buildCandidateScore } from "./rank";

export function generateSyllableCandidates(token: string, limit = 6): Candidate[] {
  const parseToken = normalizeRomanizedTokenForParsing(token);
  const normalizedInput = normalizeRomanizedToken(token);
  const raw = [
    {
      output: composeRomanizedToken(parseToken).output,
      score: 760,
      detail: "Longest-match syllable parse"
    },
    {
      output: composeRomanizedToken(parseToken, { genericConjunctMode: "all" }).output,
      score: 710,
      detail: "Broad conjunct syllable parse"
    },
    {
      output: composeRomanizedToken(parseToken, { genericHalanta: false }).output,
      score: 620,
      detail: "Non-conjunct syllable parse"
    }
  ];

  if (normalizedInput.startsWith("ri")) {
    raw.push({
      output: composeRomanizedToken(parseToken, { forceInitialRiAsVowel: true }).output,
      score: 650,
      detail: "Initial ri as vocalic ऋ"
    });
  }

  if (normalizedInput.includes("x")) {
    raw.push({
      output: composeRomanizedToken(parseToken.replace(/x/gi, "ksh")).output,
      score: 640,
      detail: "x as क्ष candidate"
    });
  }

  const candidates = raw.map((item): Candidate => ({
    text: item.output,
    normalizedText: normalizeNepaliText(item.output),
    source: "phonetic",
    confidence: Math.min(0.9, item.score / 1000),
    score: buildCandidateScore({ source: "rule", rawScore: item.score }),
    evidence: [{ source: "syllable-candidate", detail: item.detail, weight: item.score }],
    warnings: []
  }));

  return capCandidates(dedupeByText(candidates), limit);
}

function dedupeByText(candidates: Candidate[]): Candidate[] {
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    if (seen.has(candidate.normalizedText)) return false;
    seen.add(candidate.normalizedText);
    return true;
  });
}
