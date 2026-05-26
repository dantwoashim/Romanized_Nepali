import { extractProtectedSpans } from "../protected";
import type { ConvertOptions, ConversionResult, EngineWarning, ProtectedNode } from "../types";
import { normalizeProofreadOutput } from "./normalization";
import { collectProofreadHints } from "./rules";
import { localDictionaryProofreadHints } from "./spellHints";
import type { ProofreadHint, ProofreadOptions, ProofreadResult } from "./types";

const AUTO_FIX_CONFIDENCE = 0.95;

export function applyProofread(input: string, options: ProofreadOptions = {}): ProofreadResult {
  const protectedResult = extractProtectedSpans(input, "romanized-mixed");
  const normalizedOptions = normalizeOptions(options);
  const hints = collectHintsForNodes(protectedResult.nodes, normalizedOptions);
  const applied = normalizedOptions.autoFix
    ? selectNonOverlapping(hints.filter((hint) => hint.action === "auto-fix" && hint.confidence >= AUTO_FIX_CONFIDENCE))
    : [];
  const fixedOutput = applyHints(input, applied);
  const output = normalizeProofreadOutput(normalizedOptions.autoFix ? finalizeAutoFixOutput(fixedOutput, normalizedOptions) : fixedOutput);
  const visibleHints = hints.filter((hint) => !applied.some((appliedHint) => sameRange(appliedHint, hint)));
  const warnings: EngineWarning[] = [
    ...applied.map((hint): EngineWarning => ({
      code: "PROOFREAD_AUTO_FIX_APPLIED",
      message: `${hint.ruleId}: ${hint.input} -> ${hint.suggestion}`,
      severity: "info",
      range: hint.range
    })),
    ...visibleHints.map((hint): EngineWarning => ({
      code: "PROOFREAD_HINT",
      message: `${hint.ruleId}: consider ${hint.suggestion}`,
      severity: hint.confidence >= AUTO_FIX_CONFIDENCE ? "info" : "warning",
      range: hint.range
    }))
  ];

  return {
    input,
    output,
    applied,
    hints: visibleHints,
    warnings
  };
}

export function shouldRunProofread(options: ConvertOptions): boolean {
  return Boolean(options.proofread);
}

export function proofreadOptionsFromConvertOptions(options: ConvertOptions): ProofreadOptions {
  if (typeof options.proofread === "object") return options.proofread;
  return { autoFix: Boolean(options.proofread) };
}

export function attachProofread(result: ConversionResult, options: ConvertOptions): ConversionResult {
  if (!shouldRunProofread(options)) return result;
  const proofread = applyProofread(result.normalizedOutput, proofreadOptionsFromConvertOptions(options));
  return {
    ...result,
    output: proofread.output,
    normalizedOutput: proofread.output,
    proofread,
    warnings: [...result.warnings, ...proofread.warnings],
    diagnostics: [
      ...result.diagnostics,
      {
        code: "PROOFREAD_APPLIED",
        message: `Proofread produced ${proofread.applied.length} auto-fixes and ${proofread.hints.length} hints.`,
        severity: "info",
        data: { applied: proofread.applied.length, hints: proofread.hints.length }
      }
    ]
  };
}

function collectHintsForNodes(nodes: ProtectedNode[], options: Required<Omit<ProofreadOptions, "protectedSpans">>): ProofreadHint[] {
  const hints: ProofreadHint[] = [];
  for (const node of nodes) {
    if (node.kind === "protected") continue;
    hints.push(...collectProofreadHints(node.text, node.range[0], options));
    hints.push(...localDictionaryProofreadHints(node.text, node.range[0]));
  }
  return selectNonOverlapping(hints);
}

function normalizeOptions(options: ProofreadOptions): Required<Omit<ProofreadOptions, "protectedSpans">> {
  return {
    autoFix: options.autoFix ?? false,
    normalizePluralHaru: options.normalizePluralHaru ?? true,
    normalizePostpositions: options.normalizePostpositions ?? true,
    normalizeDanda: options.normalizeDanda ?? true
  };
}

function selectNonOverlapping(hints: ProofreadHint[]): ProofreadHint[] {
  const selected: ProofreadHint[] = [];
  for (const hint of hints.sort((a, b) => a.range[0] - b.range[0] || b.confidence - a.confidence || b.range[1] - a.range[1])) {
    if (selected.some((existing) => rangesOverlap(existing.range, hint.range))) continue;
    selected.push(hint);
  }
  return selected;
}

function applyHints(input: string, hints: ProofreadHint[]): string {
  let output = input;
  for (const hint of hints.slice().sort((a, b) => b.range[0] - a.range[0])) {
    output = `${output.slice(0, hint.range[0])}${hint.suggestion}${output.slice(hint.range[1])}`;
  }
  return output;
}

function finalizeAutoFixOutput(input: string, options: Required<Omit<ProofreadOptions, "protectedSpans">>): string {
  let output = input;
  if (options.normalizePostpositions) {
    output = output.replace(/([\u0900-\u097F]+)\s+(को|का|की|ले|लाई|मा|बाट|सँग)(?=\s|$|[।,;:!?])/g, "$1$2");
  }
  if (options.normalizePluralHaru) {
    output = output
      .replace(/([\u0900-\u097F]+)\s+हरु\s*(मा|ले|लाई|बाट|सँग|को|का|की)?/g, "$1हरू$2")
      .replace(/([\u0900-\u097F]+)हरु(मा|ले|लाई|बाट|सँग|को|का|की)?/g, "$1हरू$2");
  }
  if (options.normalizeDanda) {
    output = output.replace(/।{2,}/g, "।");
  }
  return output;
}

function rangesOverlap(left: [number, number], right: [number, number]): boolean {
  return left[0] < right[1] && right[0] < left[1];
}

function sameRange(left: ProofreadHint, right: ProofreadHint): boolean {
  return left.range[0] === right.range[0] && left.range[1] === right.range[1] && left.ruleId === right.ruleId;
}

export type { ProofreadHint, ProofreadOptions, ProofreadResult } from "./types";
