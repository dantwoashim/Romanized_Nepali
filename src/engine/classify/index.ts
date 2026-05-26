import type { ClassifiedDocument, ClassifiedSpan, ConvertOptions, EngineMode, EngineWarning } from "../types";
import { extractProtectedSpans, loanwordRoutingPolicy } from "../protected";
import { devanagariRatio } from "./devanagari";
import { digitSymbolRatio, englishDigitalLikelihood, latinRatio, romanizedLikelihood } from "./latin";
import { OFFICE_PATTERNS, clamp01 } from "./patterns";
import { preetiGlyphCoverage, preetiLikelihood, preetiPunctuationPatternScore, preetiSequenceLikelihood } from "./preeti";

const TOKEN_PATTERN = /\S+/g;

export function classifyDocument(input: string, options: ConvertOptions = {}): ClassifiedDocument {
  const protectedResult = extractProtectedSpans(input, options.mode ?? "auto");
  const protectedTokenCount = protectedResult.spans.length;
  const devanagari = devanagariRatio(input);
  const latin = latinRatio(input);
  const digitSymbol = digitSymbolRatio(input);
  const englishDigital = englishDigitalLikelihood(input, protectedTokenCount);
  const romanized = romanizedLikelihood(input);
  const preetiGlyph = preetiGlyphCoverage(input);
  const preetiSequence = preetiSequenceLikelihood(input);
  const preetiPunctuation = preetiPunctuationPatternScore(input);
  const preeti = preetiLikelihood(input, englishDigital);
  const officePattern = officePatternLikelihood(input);
  const warnings: EngineWarning[] = [];
  const diagnostics = [
    {
      code: "CLASSIFIER_SCORES",
      message: "Input classification scores computed.",
      severity: "info" as const,
      data: {
        devanagariRatio: devanagari,
        latinRatio: latin,
        digitSymbolRatio: digitSymbol,
        protectedTokenCount,
        preetiLikelihood: preeti,
        romanizedLikelihood: romanized,
        englishDigitalLikelihood: englishDigital,
        officePatternLikelihood: officePattern,
        preetiGlyphCoverage: preetiGlyph,
        preetiSequenceLikelihood: preetiSequence,
        preetiPunctuationPatternScore: preetiPunctuation
      }
    }
  ];

  const modeRecommendation = options.mode && options.mode !== "auto"
    ? options.mode
    : recommendMode({
      devanagari,
      latin,
      digitSymbol,
      protectedTokenCount,
      preeti,
      romanized,
      englishDigital,
      officePattern,
      preetiGlyph,
      preetiSequence,
      preetiPunctuation
    });
  const documentConfidence = confidenceForMode(modeRecommendation, { devanagari, preeti, romanized, englishDigital, officePattern });

  if (modeRecommendation === "unknown-diagnostic") {
    warnings.push({
      code: "LOW_CLASSIFICATION_CONFIDENCE",
      message: "Input is ambiguous; use strict/mixed mode explicitly before converting important documents.",
      severity: "warning"
    });
  }

  return {
    modeRecommendation,
    documentConfidence,
    spans: classifySpans(input, protectedResult.spans),
    warnings,
    diagnostics,
    stats: {
      devanagariRatio: devanagari,
      latinRatio: latin,
      digitSymbolRatio: digitSymbol,
      protectedTokenCount,
      preetiLikelihood: preeti,
      romanizedLikelihood: romanized,
      englishDigitalLikelihood: englishDigital,
      officePatternLikelihood: officePattern
    }
  };
}

function recommendMode(scores: {
  devanagari: number;
  latin: number;
  digitSymbol: number;
  protectedTokenCount: number;
  preeti: number;
  romanized: number;
  englishDigital: number;
  officePattern: number;
  preetiGlyph: number;
  preetiSequence: number;
  preetiPunctuation: number;
}): EngineMode {
  const hasStrongPreetiEvidence = scores.preetiGlyph > 0.5 && (scores.preetiSequence > 0 || scores.preetiPunctuation > 0.1);
  if (scores.devanagari > 0.55 && scores.latin < 0.2) return "unicode-passthrough";
  if (scores.romanized > 0.28 && (scores.protectedTokenCount > 0 || scores.englishDigital > 0.18 || scores.officePattern > 0.2)) return "romanized-mixed";
  if (scores.romanized > 0.28 && scores.latin > 0.45) return "romanized-strict";
  if (hasStrongPreetiEvidence && scores.preeti > 0.44 && (scores.protectedTokenCount > 0 || scores.englishDigital > 0.18 || scores.officePattern > 0.2)) return "preeti-mixed";
  if (hasStrongPreetiEvidence && scores.preeti > 0.56) return "preeti-strict";
  if (scores.devanagari > 0.25 && scores.latin > 0.2) return "romanized-mixed";
  return "unknown-diagnostic";
}

function confidenceForMode(
  mode: EngineMode,
  scores: { devanagari: number; preeti: number; romanized: number; englishDigital: number; officePattern: number }
): number {
  if (mode === "unicode-passthrough") return clamp01(0.75 + scores.devanagari * 0.25);
  if (mode.startsWith("preeti")) return clamp01(scores.preeti + scores.officePattern * 0.08);
  if (mode.startsWith("romanized")) return clamp01(scores.romanized + scores.englishDigital * 0.08);
  return 0.35;
}

function officePatternLikelihood(input: string): number {
  const hits = OFFICE_PATTERNS.filter((pattern) => pattern.test(input)).length;
  return clamp01(hits / 4);
}

function classifySpans(input: string, protectedSpans: Array<{ range: [number, number]; original: string; confidence: number; reason: string }>): ClassifiedSpan[] {
  const spans: ClassifiedSpan[] = protectedSpans.map((span) => ({
    kind: "latin-protected",
    range: span.range,
    text: span.original,
    confidence: span.confidence,
    routingPolicy: "protect",
    reason: span.reason
  }));

  for (const match of input.matchAll(TOKEN_PATTERN)) {
    const text = match[0];
    const start = match.index ?? 0;
    const range: [number, number] = [start, start + text.length];
    if (protectedSpans.some((span) => overlaps(range, span.range))) continue;
    spans.push(classifyToken(text, range));
  }

  return spans.sort((a, b) => a.range[0] - b.range[0]);
}

function classifyToken(text: string, range: [number, number]): ClassifiedSpan {
  if (/^[0-9.,/-]+$/.test(text)) {
    return { kind: "digit", range, text, confidence: 0.9, routingPolicy: "protect", reason: "Numeric token." };
  }
  if (/[\u0900-\u097F]/.test(text) && /[A-Za-z]/.test(text)) {
    return { kind: "mixed", range, text, confidence: 0.65, routingPolicy: "warn", reason: "Mixed Devanagari/Latin token." };
  }
  if (/[\u0900-\u097F]/.test(text)) {
    return { kind: "devanagari", range, text, confidence: 0.9, routingPolicy: "warn", reason: "Unicode Devanagari token." };
  }
  const loanword = loanwordRoutingPolicy(text);
  if (loanword) {
    return { kind: "latin-loanword-candidate", range, text, confidence: 0.62, routingPolicy: loanword, reason: "Possible English/Nepali loanword candidate." };
  }
  if (preetiGlyphCoverage(text) > 0.7 && preetiPunctuationPatternScore(text) > 0.1) {
    return { kind: "preeti", range, text, confidence: 0.68, routingPolicy: "warn", reason: "Preeti-like glyph token." };
  }
  if (romanizedLikelihood(text) > 0.2) {
    return { kind: "romanized", range, text, confidence: 0.68, routingPolicy: "convert-romanized", reason: "Romanized Nepali token cues." };
  }
  return { kind: "unknown", range, text, confidence: 0.35, routingPolicy: "warn", reason: "No strong classification signal." };
}

function overlaps(a: [number, number], b: [number, number]): boolean {
  return a[0] < b[1] && b[0] < a[1];
}
