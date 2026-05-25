import { normalizeNepaliText } from "../normalize/normalizeNepaliText";
import type { Candidate, Suggestion } from "../types";

export function uniqueRankedCandidates(candidates: Candidate[], limit = 8): Candidate[] {
  const seen = new Set<string>();
  return candidates
    .map((candidate) => ({
      ...candidate,
      normalizedText: normalizeNepaliText(candidate.normalizedText || candidate.text)
    }))
    .filter((candidate) => {
      if (!candidate.normalizedText || seen.has(candidate.normalizedText)) return false;
      seen.add(candidate.normalizedText);
      return true;
    })
    .sort((a, b) => b.score - a.score || a.normalizedText.localeCompare(b.normalizedText))
    .slice(0, limit);
}

export function suggestionToCandidate(suggestion: Suggestion, reason: string): Candidate {
  return {
    text: suggestion.word,
    normalizedText: suggestion.normalizedWord,
    score: suggestion.score,
    source: suggestion.source.includes("alias") ? "variant" : "dictionary",
    reason
  };
}
