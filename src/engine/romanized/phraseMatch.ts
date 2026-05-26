import { findPhraseMatches as findCorePhraseMatches } from "../../core/transliteration/phraseRanker";
import type { EngineMode } from "../types";
import { CANDIDATE_LIMITS } from "./rank";

export interface EnginePhraseMatch {
  input: string;
  output: string;
  normalizedOutput: string;
  range: [number, number];
  tokenRange: [number, number];
  score: number;
  domain: string;
  reason: string;
}

export function findPhraseMatches(input: string, mode: EngineMode = "romanized-mixed"): EnginePhraseMatch[] {
  const maxWindow = mode === "romanized-strict" ? 4 : CANDIDATE_LIMITS.maxPhraseWindow;
  return findCorePhraseMatches(input, maxWindow).map((match) => ({
    input: match.input,
    output: match.output,
    normalizedOutput: match.normalizedOutput,
    range: match.range,
    tokenRange: match.tokenRange,
    score: match.score,
    domain: match.domain,
    reason: match.reason
  }));
}
