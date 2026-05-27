import { getPreetiEntry } from "../../core/preeti/preetiMap";
import { isKnownEnglishPreserveWord } from "./english";

export interface PreetiIslandScore {
  confidence: number;
  shouldConvert: boolean;
  shouldWarn: boolean;
  reason: string;
  features: Record<string, number | string | boolean>;
}

const HIGH_SIGNAL_PATTERNS = [
  /k\|/,
  /p\|/,
  /sfo\{/,
  /btf\{/,
  /;fOF;/,
  /nIo/,
  /clwsf/,
  /bz\{g/,
  /sfo\{qmd/,
  /k\|fKt/,
  /;ª\\/,
  /b\[9/,
  /j;'/,
  /s'6'/,
  /b'em\]/,
  /wgL/,
  /k'd/,
  /[{}|\\[\]]/
];

const PREETI_DEPENDENT_MARKS = new Set(["'", "\"", "]", "}", "[", "\\"]);

export function scorePreetiIsland(text: string, context: { surroundingNepali?: boolean; mixedToken?: boolean } = {}): PreetiIslandScore {
  if (!text) return emptyScore("Empty span.");
  const chars = [...text];
  const mapped = chars.filter((char) => Boolean(getPreetiEntry(char))).length;
  const profileGlyphCoverage = mapped / Math.max(1, chars.length);
  const knownSequenceHits = HIGH_SIGNAL_PATTERNS.filter((pattern) => pattern.test(text)).length;
  const knownSequenceCoverage = Math.min(1, knownSequenceHits / 3);
  const preetiPatternLikelihood = /[;|{}\\[\]'"]/.test(text) ? 0.85 : /[fF]|\]|M|0f|If|of/.test(text) ? 0.45 : 0.1;
  const surroundingNepaliContext = context.surroundingNepali ? 1 : 0;
  const englishWordLikelihood = isKnownEnglishPreserveWord(text) || /^[A-Z][a-z]+$/.test(text) ? 1 : /^[A-Za-z]+$/.test(text) ? 0.28 : 0;
  const protectedTokenLikelihood = /^(?:PDF|NID|PAN|VAT|DOB|URL|ID)$/i.test(text) || /\d/.test(text) ? 0.8 : 0;
  const dependentOnlyInMixed = context.mixedToken && chars.some((char) => PREETI_DEPENDENT_MARKS.has(char)) ? 0.35 : 0;
  const score =
    0.45 * profileGlyphCoverage +
    0.25 * knownSequenceCoverage +
    0.15 * preetiPatternLikelihood +
    0.1 * surroundingNepaliContext +
    dependentOnlyInMixed -
    0.2 * englishWordLikelihood -
    0.3 * protectedTokenLikelihood;
  const confidence = clamp(score);
  return {
    confidence,
    shouldConvert: confidence >= 0.52 || (context.mixedToken === true && confidence >= 0.38),
    shouldWarn: confidence >= 0.34 && confidence < 0.52,
    reason: confidence >= 0.52
      ? "Legacy profile coverage and high-signal patterns indicate a Preeti island."
      : confidence >= 0.34
        ? "Span has some Preeti signals but is not safe for silent conversion."
        : "Span does not have enough Preeti evidence.",
    features: {
      profileGlyphCoverage: round(profileGlyphCoverage),
      knownSequenceCoverage: round(knownSequenceCoverage),
      preetiPatternLikelihood: round(preetiPatternLikelihood),
      surroundingNepaliContext,
      englishWordLikelihood,
      protectedTokenLikelihood,
      dependentOnlyInMixed,
      score: round(score)
    }
  };
}

export function isPreetiDependentMarkRun(text: string): boolean {
  return [...text].some((char) => PREETI_DEPENDENT_MARKS.has(char));
}

function emptyScore(reason: string): PreetiIslandScore {
  return {
    confidence: 0,
    shouldConvert: false,
    shouldWarn: false,
    reason,
    features: {}
  };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(0.99, value));
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
