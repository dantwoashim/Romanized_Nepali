import { getPreetiEntry } from "../../core/preeti/preetiMap";
import { clamp01, PREETI_SEQUENCES, ratio } from "./patterns";

export function preetiGlyphCoverage(input: string): number {
  const chars = [...input].filter((char) => /[!-~]/.test(char));
  const mapped = chars.filter((char) => Boolean(getPreetiEntry(char))).length;
  return ratio(mapped, chars.length);
}

export function preetiSequenceLikelihood(input: string): number {
  if (!input) return 0;
  const hits = PREETI_SEQUENCES.filter((sequence) => input.includes(sequence)).length;
  return clamp01(hits / 3);
}

export function preetiPunctuationPatternScore(input: string): number {
  const suspicious = (input.match(/[|}{\][;]+/g) ?? []).length;
  return clamp01(suspicious / 4);
}

export function preetiLikelihood(input: string, englishDigitalLikelihood: number): number {
  const glyphMapCoverage = preetiGlyphCoverage(input);
  const sequenceLikelihood = preetiSequenceLikelihood(input);
  const punctuationPatternScore = preetiPunctuationPatternScore(input);
  const negativeEnglishLikelihood = 1 - englishDigitalLikelihood;
  return clamp01(
    0.42 * glyphMapCoverage +
    0.25 * sequenceLikelihood +
    0.17 * punctuationPatternScore +
    0.16 * negativeEnglishLikelihood
  );
}
