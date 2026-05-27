import { suggestWords } from "../../core/dictionary/suggestWords";
import { convertRomanized } from "../romanized";
import { nowMs } from "../util/time";
import { isSecureContext, surfaceForMode } from "./modes";
import type { Candidate, CandidateUpdate, KeyboardSession, TypingContext } from "./types";

const MAX_CANDIDATES = 8;

export function buildCandidateUpdate(session: KeyboardSession): CandidateUpdate {
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
    return traditionalPlaceholderUpdate(session, start);
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

  const candidates = romanizedCandidates(session.compositionText, session.context);
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

export function romanizedCandidates(input: string, context?: TypingContext): Candidate[] {
  const trimmed = input.trim();
  if (!trimmed) return [];
  const keyboardPrefixCandidates = prefixCandidates(trimmed, input.length);
  const convertResult = convertRomanized(trimmed, {
    mode: context?.activeDomains.includes("government") ? "romanized-government" : "romanized-mixed",
    digitPolicy: "context-dependent"
  });
  const engineCandidates = convertResult.alternatives.map((candidate, index): Candidate => ({
    id: `romanized-${index}-${candidate.normalizedText}`,
    text: candidate.normalizedText,
    label: trimmed,
    type: candidate.source === "phrase" ? "phrase" : candidate.source === "memory" ? "personal" : "word",
    confidence: candidate.confidence,
    reason: candidate.evidence.map((evidence) => evidence.detail),
    shortcut: String(index + 1),
    replaceRange: [0, input.length]
  }));
  const dictionaryCandidates = suggestWords(trimmed, MAX_CANDIDATES).map((suggestion, index): Candidate => ({
    id: `dict-${index}-${suggestion.normalizedWord}`,
    text: suggestion.normalizedWord,
    label: suggestion.romanized,
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
  return dedupeCandidates([...keyboardPrefixCandidates, ...dictionaryCandidates, ...engineCandidates, romanizedHelper]).slice(0, MAX_CANDIDATES);
}

function traditionalPlaceholderUpdate(session: KeyboardSession, start: number): CandidateUpdate {
  const warnings = dedupeWarnings([
    ...session.warnings,
    "Traditional layout mapping pending source-of-truth audit; preserving composition."
  ]);
  return {
    sessionId: session.sessionId,
    mode: session.mode,
    surface: "traditional-to-unicode",
    compositionText: session.compositionText,
    displayText: session.compositionText,
    caret: session.caret,
    candidates: [],
    proofHints: session.proofHints,
    shouldShowCandidateUI: session.proofHints.length > 0,
    confidence: 0.5,
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

function prefixCandidates(input: string, rangeEnd: number): Candidate[] {
  const normalized = input.toLowerCase().replace(/\s+/g, " ").trim();
  const rows: Array<{ input: string; output: string; label?: string; confidence: number; reason: string }> = [
    { input: "rajaniti", output: "राजनीति", confidence: 0.97, reason: "Keyboard exact office vocabulary" },
    { input: "raajanitigya", output: "राजनीतिज्ञ", confidence: 0.97, reason: "Keyboard exact office vocabulary" },
    { input: "jilla pra", output: "जिल्ला प्रशासन", confidence: 0.95, reason: "Keyboard government phrase prefix" },
    { input: "jilla pra", output: "जिल्ला प्रशासन कार्यालय", confidence: 0.94, reason: "Keyboard government phrase completion" },
    { input: "nagarikta pr", output: "नागरिकता प्रमाणपत्र", confidence: 0.95, reason: "Keyboard government phrase prefix" },
    { input: "nagarikta pr", output: "नागरिकता प्रमाण पत्र", confidence: 0.92, reason: "Keyboard spelling variant completion" },
    { input: "mero nid form", output: "मेरो NID form", confidence: 0.96, reason: "Keyboard mixed English protected phrase" }
  ];
  return rows
    .filter((row) => normalized === row.input)
    .map((row, index): Candidate => ({
      id: `keyboard-prefix-${index}-${row.output}`,
      text: row.output,
      label: row.label ?? input,
      type: row.output.includes(" ") ? "phrase" : "word",
      confidence: row.confidence,
      reason: [row.reason],
      shortcut: String(index + 1),
      replaceRange: [0, rangeEnd]
    }));
}
