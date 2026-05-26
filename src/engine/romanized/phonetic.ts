import type { Candidate } from "../types";
import { CANDIDATE_LIMITS } from "./rank";
import { generateSyllableCandidates } from "./syllables";

export function phoneticCandidatesForToken(token: string): Candidate[] {
  return generateSyllableCandidates(token, CANDIDATE_LIMITS.maxRawPhoneticCandidatesPerToken);
}
