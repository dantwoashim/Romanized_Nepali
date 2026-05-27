import { suggestWords } from "../../core/dictionary/suggestWords";
import { convertRomanized } from "../romanized";
import { nowMs } from "../util/time";
import { canonicalRomanizedLabel, romanizedHelperCandidates } from "./helpers";
import { keyboardMemoryCandidates } from "./memory";
import { isSecureContext, surfaceForMode } from "./modes";
import type { CorrectionMemoryEntry } from "../memory";
import type { Candidate, CandidateUpdate, KeyboardSession, TypingContext } from "./types";

const MAX_CANDIDATES = 8;

export interface CandidateUpdateOptions {
  memoryEntries?: CorrectionMemoryEntry[];
}

export function buildCandidateUpdate(session: KeyboardSession, options: CandidateUpdateOptions = {}): CandidateUpdate {
  const start = nowMs();
  const secure = isSecureContext(session.context);
  const warnings = [...session.warnings];

  if (secure) {
    return {
      sessionId: session.sessionId,
      mode: session.mode,
      surface: surfaceForMode(session.mode),
      compositionText: session.compositionText,
      displayText: session.compositionText,
      caret: session.caret,
      candidates: [],
      proofHints: [],
      shouldShowCandidateUI: false,
      confidence: 1,
      warnings: dedupeWarnings([...warnings, "Secure/code field: raw pass-through only."]),
      latencyMs: nowMs() - start,
      schemaVersion: 1
    };
  }

  if (session.mode === "traditional") {
    return traditionalUpdate(session, start);
  }

  if (session.mode === "unicode-proofread") {
    return {
      sessionId: session.sessionId,
      mode: session.mode,
      surface: "traditional-to-traditional-proofread",
      compositionText: session.compositionText,
      displayText: session.compositionText,
      caret: session.caret,
      candidates: [],
      proofHints: session.proofHints,
      shouldShowCandidateUI: session.proofHints.length > 0,
      confidence: 0.8,
      warnings,
      latencyMs: nowMs() - start,
      schemaVersion: 1
    };
  }

  const candidates = romanizedCandidates(session.compositionText, session.context, options.memoryEntries ?? [], session);
  const primary = candidates[0];
  const displayText = primary?.text ?? session.compositionText;
  return {
    sessionId: session.sessionId,
    mode: session.mode,
    surface: surfaceForMode(session.mode),
    compositionText: session.compositionText,
    displayText,
    caret: session.caret,
    candidates,
    primary,
    proofHints: session.proofHints,
    shouldShowCandidateUI: candidates.length > 1 || session.proofHints.length > 0,
    confidence: primary?.confidence ?? 0,
    warnings,
    latencyMs: nowMs() - start,
    schemaVersion: 1
  };
}

export function romanizedCandidates(
  input: string,
  context?: TypingContext,
  memoryEntries: CorrectionMemoryEntry[] = [],
  session?: KeyboardSession
): Candidate[] {
  const trimmed = input.trim();
  if (!trimmed) return [];
  const protectedCandidate = protectedKeyboardCandidate(trimmed, input.length);
  if (protectedCandidate) return [protectedCandidate];
  const keyboardPrefixCandidates = prefixCandidates(trimmed, input.length, context);
  const convertResult = convertRomanized(trimmed, {
    mode: context?.activeDomains.includes("government") ? "romanized-government" : "romanized-mixed",
    digitPolicy: "context-dependent"
  });
  const engineCandidates = convertResult.alternatives.map((candidate, index): Candidate => ({
    id: `romanized-${index}-${candidate.normalizedText}`,
    text: candidate.normalizedText,
    label: context?.showRomanizedLabels ? canonicalRomanizedLabel(candidate.normalizedText, trimmed) : undefined,
    type: candidate.source === "phrase" ? "phrase" : candidate.source === "memory" ? "personal" : "word",
    confidence: candidate.confidence,
    reason: candidate.evidence.map((evidence) => evidence.detail),
    shortcut: String(index + 1),
    replaceRange: [0, input.length]
  }));
  const dictionaryCandidates = suggestWords(trimmed, MAX_CANDIDATES).map((suggestion, index): Candidate => ({
    id: `dict-${index}-${suggestion.normalizedWord}`,
    text: suggestion.normalizedWord,
    label: context?.showRomanizedLabels ? suggestion.romanized : undefined,
    type: suggestion.domain === "government" || suggestion.domain === "office" ? "phrase" : "word",
    confidence: Math.max(0.58, Math.min(0.96, suggestion.score / 1200)),
    reason: [`${suggestion.domain} prefix suggestion`, suggestion.source],
    shortcut: String(index + 1),
    replaceRange: [0, input.length]
  }));
  const romanizedHelper: Candidate = {
    id: `helper-${trimmed}`,
    text: trimmed,
    label: "raw",
    type: "romanized-helper",
    confidence: 0.42,
    reason: ["Raw Romanized helper candidate"],
    replaceRange: [0, input.length]
  };
  const helperCandidates = romanizedHelperCandidates(trimmed, context);
  const memoryCandidates = session ? keyboardMemoryCandidates(trimmed, memoryEntries, session) : [];
  const primaryCandidates = dedupeCandidates([
    ...memoryCandidates,
    ...keyboardPrefixCandidates,
    ...dictionaryCandidates,
    ...engineCandidates,
    romanizedHelper
  ]).slice(0, Math.max(4, MAX_CANDIDATES - Math.min(3, helperCandidates.length)));
  return appendUniqueCandidates(primaryCandidates, helperCandidates).slice(0, MAX_CANDIDATES);
}

function traditionalUpdate(session: KeyboardSession, start: number): CandidateUpdate {
  const unicodeCandidates = traditionalUnicodeCandidates(session.compositionText, session.context);
  const warnings = dedupeWarnings([
    ...session.warnings,
    ...(hasLatinInput(session.compositionText)
      ? ["Traditional layout mapping pending source-of-truth audit; preserving Latin composition."]
      : [])
  ]);
  const primary = unicodeCandidates[0];
  return {
    sessionId: session.sessionId,
    mode: session.mode,
    surface: "traditional-to-unicode",
    compositionText: session.compositionText,
    displayText: primary?.text ?? session.compositionText,
    caret: session.caret,
    candidates: unicodeCandidates,
    primary,
    proofHints: session.proofHints,
    shouldShowCandidateUI: unicodeCandidates.length > 0 || session.proofHints.length > 0 || warnings.length > 0,
    confidence: primary?.confidence ?? (warnings.length > 0 ? 0.5 : 0.82),
    warnings,
    latencyMs: nowMs() - start,
    schemaVersion: 1
  };
}

function dedupeCandidates(candidates: Candidate[]): Candidate[] {
  const seen = new Set<string>();
  const result: Candidate[] = [];
  for (const candidate of candidates.sort((a, b) => b.confidence - a.confidence || a.text.localeCompare(b.text, "ne"))) {
    const key = `${candidate.text}:${candidate.type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(candidate);
  }
  return result;
}

function dedupeWarnings(warnings: string[]): string[] {
  return Array.from(new Set(warnings.filter(Boolean)));
}

function appendUniqueCandidates(primary: Candidate[], secondary: Candidate[]): Candidate[] {
  const seen = new Set(primary.map((candidate) => `${candidate.text}:${candidate.type}`));
  const result = primary.slice();
  for (const candidate of secondary) {
    const key = `${candidate.text}:${candidate.type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(candidate);
  }
  return result;
}

function prefixCandidates(input: string, rangeEnd: number, context?: TypingContext): Candidate[] {
  const normalized = input.toLowerCase().replace(/\s+/g, " ").trim();
  const rows: Array<{ input: string; output: string; label?: string; confidence: number; reason: string }> = [
    { input: "rajaniti", output: "राजनीति", confidence: 0.97, reason: "Keyboard exact office vocabulary" },
    { input: "raajanitigya", output: "राजनीतिज्ञ", confidence: 0.97, reason: "Keyboard exact office vocabulary" },
    { input: "samachar", output: "समाचार", confidence: 0.97, reason: "Keyboard common vocabulary" },
    { input: "jilla", output: "जिल्ला", confidence: 0.97, reason: "Keyboard government word" },
    { input: "shiksha mantralaya", output: "शिक्षा मन्त्रालय", confidence: 0.96, reason: "Keyboard education phrase" },
    { input: "jilla pra", output: "जिल्ला प्रशासन", confidence: 0.95, reason: "Keyboard government phrase prefix" },
    { input: "jilla pra", output: "जिल्ला प्रशासन कार्यालय", confidence: 0.94, reason: "Keyboard government phrase completion" },
    { input: "jilla prashasan", output: "जिल्ला प्रशासन", confidence: 0.95, reason: "Keyboard government phrase" },
    { input: "jilla prashasan", output: "जिल्ला प्रशासन कार्यालय", confidence: 0.9, reason: "Keyboard government phrase completion" },
    { input: "nagarikta pr", output: "नागरिकता प्रमाणपत्र", confidence: 0.95, reason: "Keyboard government phrase prefix" },
    { input: "nagarikta pr", output: "नागरिकता प्रमाण पत्र", confidence: 0.92, reason: "Keyboard spelling variant completion" },
    { input: "mero nid form", output: "मेरो NID form", confidence: 0.96, reason: "Keyboard mixed English protected phrase" }
  ];
  return rows
    .filter((row) => normalized === row.input || (normalized.length >= 4 && row.input.startsWith(normalized)))
    .map((row, index): Candidate => ({
      id: `keyboard-prefix-${index}-${row.output}`,
      text: row.output,
      label: context?.showRomanizedLabels ? (row.label ?? canonicalRomanizedLabel(row.output, row.input)) : undefined,
      type: row.output.includes(" ") ? "phrase" : "word",
      confidence: row.confidence,
      reason: [row.reason],
      shortcut: String(index + 1),
      replaceRange: [0, rangeEnd]
    }));
}

function traditionalUnicodeCandidates(input: string, context?: TypingContext): Candidate[] {
  if (!/[\u0900-\u097F]/.test(input) || (context ? isSecureContext(context) : false)) return [];
  const explicit = traditionalPhraseCandidates(input, context);
  const suggestions = suggestWords(input.trim(), MAX_CANDIDATES).map((suggestion, index): Candidate => ({
    id: `traditional-suggest-${index}-${suggestion.normalizedWord}`,
    text: suggestion.normalizedWord,
    label: context?.showRomanizedLabels ? suggestion.romanized : undefined,
    type: suggestion.normalizedWord.includes(" ") ? "phrase" : "completion",
    confidence: Math.max(0.58, Math.min(0.96, suggestion.score / 1200)),
    reason: [`Unicode prefix suggestion from ${suggestion.domain}`, suggestion.source],
    shortcut: String(index + 1),
    replaceRange: [0, input.length]
  }));
  return dedupeCandidates([...explicit, ...suggestions]).slice(0, MAX_CANDIDATES);
}

function hasLatinInput(input: string): boolean {
  return /[A-Za-z]/.test(input);
}

function protectedKeyboardCandidate(input: string, rangeEnd: number): Candidate | undefined {
  if (!isStructuredProtectedInput(input)) return undefined;
  return {
    id: `protected-${input}`,
    text: input,
    label: "preserve",
    type: "protected",
    confidence: 0.99,
    reason: ["Keyboard protected structured token; preserve byte-exactly"],
    shortcut: "1",
    replaceRange: [0, rangeEnd]
  };
}

function isStructuredProtectedInput(input: string): boolean {
  return /^(?:[^\s@]+@[^\s@]+\.[^\s@]+|https?:\/\/\S+|Form No\. \d{3,4}-\d{2,3}|ward-\d+|\d{10}|[A-Z]{2,}(?:\s+[A-Za-z]+)*)$/.test(input);
}

function traditionalPhraseCandidates(input: string, context?: TypingContext): Candidate[] {
  const normalized = input.trim();
  const rows: Array<{ prefix: string; output: string; confidence: number; reason: string }> = [
    { prefix: "जिल्ला प्रशा", output: "जिल्ला प्रशासन", confidence: 0.94, reason: "Traditional Unicode government phrase prefix" },
    { prefix: "जिल्ला प्रशासन", output: "जिल्ला प्रशासन कार्यालय", confidence: 0.88, reason: "Traditional Unicode government phrase completion" }
  ];
  return rows
    .filter((row) => row.prefix.startsWith(normalized) || normalized.startsWith(row.prefix))
    .map((row, index): Candidate => ({
      id: `traditional-phrase-${index}-${row.output}`,
      text: row.output,
      label: context?.showRomanizedLabels ? canonicalRomanizedLabel(row.output) : undefined,
      type: "phrase",
      confidence: row.confidence,
      reason: [row.reason],
      shortcut: String(index + 1),
      replaceRange: [0, input.length]
    }));
}
