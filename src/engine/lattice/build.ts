import type { CandidateScore } from "../types";
import type { ConversionAction } from "../segmentation/types";
import type { DocumentLattice, SpanCandidate } from "./types";

export function buildDocumentLattice(candidates: SpanCandidate[]): DocumentLattice {
  const output = candidates.map((candidate) => candidate.output).join("").normalize("NFC");
  const confidence = candidates.length === 0
    ? 0
    : Math.min(...candidates.map((candidate) => candidate.confidence));
  const action = resolveDocumentAction(candidates);
  return {
    output,
    action,
    confidence,
    candidates,
    warnings: candidates.flatMap((candidate) => candidate.warnings),
    diagnostics: candidates.flatMap((candidate) => candidate.diagnostics),
    trace: candidates.flatMap((candidate) => candidate.trace)
  };
}

export function emptyCandidateScore(total = 0): CandidateScore {
  return {
    phraseBoost: 0,
    aliasBoost: 0,
    phoneticScore: 0,
    dictionaryScore: 0,
    hunspellScore: 0,
    frequencyScore: 0,
    domainScore: 0,
    contextScore: 0,
    namePlaceScore: 0,
    loanwordScore: 0,
    userMemoryBoost: 0,
    englishCorruptionPenalty: 0,
    protectedSpanPenalty: 0,
    unknownTokenPenalty: 0,
    malformedOutputPenalty: 0,
    badMatraPenalty: 0,
    mixedScriptPenalty: 0,
    rareWordPenalty: 0,
    total
  };
}

function resolveDocumentAction(candidates: SpanCandidate[]): ConversionAction {
  if (candidates.some((candidate) => candidate.action === "refuse")) return "refuse";
  if (candidates.some((candidate) => candidate.action === "warn")) return "warn";
  if (candidates.some((candidate) => candidate.action === "candidates")) return "candidates";
  if (candidates.every((candidate) => candidate.action === "preserve")) return "preserve";
  return "auto";
}
