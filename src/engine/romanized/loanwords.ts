import { normalizeNepaliText } from "../../core/normalize/normalizeNepaliText";
import { normalizeRomanizedToken } from "../../core/transliteration/latinNormalize";
import { loadLexicalAuthority } from "../lexicon";
import type { Candidate, EngineMode } from "../types";
import { buildCandidateScore } from "./rank";

export function loanwordCandidates(token: string, mode: EngineMode): Candidate[] {
  const normalized = normalizeRomanizedToken(token);
  if (mode === "romanized-mixed" && shouldPreserveEnglishTerm(token)) return [];

  return loadLexicalAuthority().loanwords
    .filter((entry) => normalizeRomanizedToken(entry.input) === normalized)
    .map((entry): Candidate => ({
      text: entry.output,
      normalizedText: normalizeNepaliText(entry.output),
      source: "loanword",
      confidence: entry.reviewStatus === "reviewed" ? 0.84 : 0.65,
      score: buildCandidateScore({ source: "loanword", rawScore: entry.reviewStatus === "reviewed" ? 980 : 720 }),
      evidence: [{ source: entry.source, detail: `Loanword policy ${entry.modePolicy}`, weight: 980 }],
      warnings: entry.modePolicy === "candidate-only"
        ? [{ code: "LOANWORD_CANDIDATE_ONLY", message: `"${token}" is a loanword candidate, not a forced conversion.`, severity: "info" }]
        : []
    }));
}

export function shouldPreserveEnglishTerm(token: string): boolean {
  const normalized = normalizeRomanizedToken(token);
  return loadLexicalAuthority().englishPreserve.some((entry) => normalizeRomanizedToken(entry.value) === normalized);
}
