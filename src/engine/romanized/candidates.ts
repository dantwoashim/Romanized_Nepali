import type { Candidate } from "../types";
import { CANDIDATE_LIMITS } from "./rank";

export function capCandidates(candidates: Candidate[], limit: number = CANDIDATE_LIMITS.maxCandidatesPerToken): Candidate[] {
  return candidates
    .slice()
    .sort((a, b) => b.score.total - a.score.total)
    .slice(0, limit);
}

export function displayedAlternatives(candidates: Candidate[]): Candidate[] {
  return capCandidates(candidates, CANDIDATE_LIMITS.maxDisplayedAlternatives);
}
