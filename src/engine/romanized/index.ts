import { normalizeNepaliText } from "../../core/normalize/normalizeNepaliText";
import { transliterateRomanized } from "../../core/transliteration/transliterateRomanized";
import type { Candidate as CoreCandidate } from "../../core/types";
import { classifyDocument } from "../classify";
import { extractProtectedSpans, restoreProtectedSpans } from "../protected";
import { attachProofread } from "../proofread";
import type { Candidate, ConversionResult, ConvertOptions, ConvertedToken, EngineMode, EngineWarning, ProtectedNode } from "../types";
import { nowMs } from "../util/time";
import { buildCandidateScore } from "./rank";

export function convertRomanized(input: string, options: ConvertOptions = {}): ConversionResult {
  const start = nowMs();
  const requestedMode = options.mode ?? "romanized-mixed";
  const mode = normalizeRomanizedMode(requestedMode);
  const classified = classifyDocument(input, { ...options, mode });
  const protectedResult = mode === "romanized-strict" ? undefined : extractProtectedSpans(input, mode);
  const conversion = protectedResult
    ? convertProtectedNodes(protectedResult.nodes)
    : convertText(input);
  const output = protectedResult ? restoreProtectedSpans(conversion.outputBeforeRestore, protectedResult.spans) : conversion.outputBeforeRestore;
  const normalizedOutput = normalizeNepaliText(output);
  const warnings: EngineWarning[] = [
    ...classified.warnings,
    ...(protectedResult?.spans.map((span): EngineWarning => ({
      code: "PROTECTED_SPAN_PRESERVED",
      message: `Preserved ${span.kind} span "${span.original}".`,
      severity: "info",
      range: span.range
    })) ?? [])
  ];

  return attachProofread({
    input,
    output: normalizedOutput,
    normalizedOutput,
    mode,
    documentConfidence: classified.documentConfidence,
    tokens: conversion.tokens,
    alternatives: conversion.alternatives,
    protectedSpans: protectedResult?.spans ?? [],
    warnings,
    diagnostics: [
      ...classified.diagnostics,
      ...(protectedResult
        ? [{
          code: "PROTECTED_SPANS_APPLIED",
          message: `Protected ${protectedResult.spans.length} spans before Romanized conversion.`,
          severity: "info" as const,
          data: { count: protectedResult.spans.length }
        }]
        : [])
    ],
    trace: {
      steps: [
        { name: "classify", message: `Recommended ${classified.modeRecommendation}.` },
        { name: "protect", message: `Protected ${protectedResult?.spans.length ?? 0} spans.` },
        { name: "convert", message: "Wrapped existing Romanized converter." }
      ]
    },
    timingMs: options.benchmark || options.development ? nowMs() - start : undefined,
    schemaVersion: 1
  }, options);
}

function convertProtectedNodes(nodes: ProtectedNode[]) {
  let outputBeforeRestore = "";
  const tokens: ConvertedToken[] = [];
  const alternatives: Candidate[] = [];

  for (const node of nodes) {
    if (node.kind === "protected") {
      outputBeforeRestore += node.span.placeholder;
      tokens.push({
        input: node.span.original,
        output: node.span.original,
        range: node.span.range,
        confidence: node.span.confidence,
        alternatives: [],
        protected: true
      });
      continue;
    }

    const converted = convertText(node.text, node.range[0]);
    outputBeforeRestore += converted.outputBeforeRestore;
    tokens.push(...converted.tokens);
    alternatives.push(...converted.alternatives);
  }

  return { outputBeforeRestore, tokens, alternatives };
}

function convertText(text: string, offset = 0) {
  const result = transliterateRomanized(text);
  const normalized = result.normalizedOutput;
  const alternatives = result.candidates.map(coreCandidateToEngineCandidate);
  const token: ConvertedToken = {
    input: text,
    output: normalized,
    range: [offset, offset + text.length],
    confidence: alternatives[0]?.confidence ?? 0.72,
    chosen: alternatives[0],
    alternatives
  };
  return {
    outputBeforeRestore: normalized,
    tokens: text ? [token] : [],
    alternatives
  };
}

function coreCandidateToEngineCandidate(candidate: CoreCandidate): Candidate {
  const source = mapCoreCandidateSource(candidate);
  return {
    text: candidate.text,
    normalizedText: candidate.normalizedText,
    source,
    confidence: Math.max(0.2, Math.min(0.98, candidate.score / 2000)),
    score: buildCandidateScore({
      source,
      rawScore: candidate.score,
      domainMatched: /domain|government|legal|education|office/.test(candidate.reason),
      namePlaceMatched: /name|surname|place/i.test(candidate.reason)
    }),
    evidence: [{ source: candidate.source, detail: candidate.reason, weight: candidate.score }],
    warnings: []
  };
}

function mapCoreCandidateSource(candidate: CoreCandidate): Candidate["source"] {
  const reason = candidate.reason.toLowerCase();
  if (reason.includes("phrase")) return "phrase";
  if (candidate.source === "variant") return "alias";
  if (candidate.source === "user-feedback") return "memory";
  if (candidate.source === "dictionary") return "dictionary";
  return "rule";
}

function normalizeRomanizedMode(mode: EngineMode): EngineMode {
  return mode.startsWith("romanized-") ? mode : "romanized-mixed";
}
