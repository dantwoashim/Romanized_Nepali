import type { CandidateScore } from "../types";

export const CANDIDATE_LIMITS = {
  maxCandidatesPerToken: 12,
  maxRawPhoneticCandidatesPerToken: 6,
  maxDisplayedAlternatives: 5,
  maxPhraseWindow: 5
} as const;

export function buildCandidateScore(input: {
  source: string;
  rawScore: number;
  domainMatched?: boolean;
  namePlaceMatched?: boolean;
  protectedSpanPenalty?: number;
  englishCorruptionPenalty?: number;
}): CandidateScore {
  const score: CandidateScore = {
    phraseBoost: input.source.includes("phrase") ? input.rawScore : 0,
    aliasBoost: input.source.includes("alias") || input.source === "variant" ? input.rawScore : 0,
    phoneticScore: input.source === "rule" ? input.rawScore : 0,
    dictionaryScore: input.source === "dictionary" ? input.rawScore : 0,
    hunspellScore: input.source.includes("dictionary-ne") ? Math.floor(input.rawScore / 2) : 0,
    frequencyScore: Math.min(200, Math.floor(input.rawScore / 10)),
    domainScore: input.domainMatched ? 120 : 0,
    contextScore: 0,
    namePlaceScore: input.namePlaceMatched ? 120 : 0,
    loanwordScore: input.source.includes("loanword") ? 80 : 0,
    userMemoryBoost: input.source === "user-feedback" ? input.rawScore : 0,
    englishCorruptionPenalty: input.englishCorruptionPenalty ?? 0,
    protectedSpanPenalty: input.protectedSpanPenalty ?? 0,
    unknownTokenPenalty: 0,
    malformedOutputPenalty: 0,
    badMatraPenalty: 0,
    mixedScriptPenalty: 0,
    rareWordPenalty: 0,
    total: 0
  };
  score.total =
    score.phraseBoost +
    score.aliasBoost +
    score.phoneticScore +
    score.dictionaryScore +
    score.hunspellScore +
    score.frequencyScore +
    score.domainScore +
    score.contextScore +
    score.namePlaceScore +
    score.loanwordScore +
    score.userMemoryBoost -
    score.englishCorruptionPenalty -
    score.protectedSpanPenalty -
    score.unknownTokenPenalty -
    score.malformedOutputPenalty -
    score.badMatraPenalty -
    score.mixedScriptPenalty -
    score.rareWordPenalty;
  return score;
}
