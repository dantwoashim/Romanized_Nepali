import { isKnownEnglishPreserveWord, isKnownLoanwordCandidate, isLikelyEnglishRun } from "./english";

export function classifyRomanizedRun(text: string): {
  kind: "romanized-nepali" | "english-preserve" | "loanword-candidate" | "unknown-risky";
  confidence: number;
  reason: string;
} {
  if (!/^[A-Za-z]+$/.test(text)) {
    return { kind: "unknown-risky", confidence: 0.25, reason: "Latin-symbol run is not a clean Romanized word." };
  }
  if (isKnownEnglishPreserveWord(text) || isLikelyEnglishRun(text)) {
    return { kind: "english-preserve", confidence: 0.9, reason: "Known English/document word should be preserved." };
  }
  if (isKnownLoanwordCandidate(text)) {
    return { kind: "loanword-candidate", confidence: 0.78, reason: "Known technical loanword can preserve or convert by policy." };
  }
  const romanizedLikelihood = /(?:aa|ai|au|chh|ch|kh|gh|th|dh|ph|bh|sh|gy|ksh|ri|ng|ny|ya|ko|ka|maa|haru|bhayo|chha)/i.test(text) ? 0.78 : 0.58;
  return { kind: "romanized-nepali", confidence: romanizedLikelihood, reason: "Latin word has Romanized Nepali features." };
}
