import { normalizeNepaliText } from "../core/normalize/normalizeNepaliText";
import { classifyDocument } from "./classify";
import { convertPreeti } from "./legacy";
import { attachProofread } from "./proofread";
import { extractProtectedSpans, restoreProtectedSpans } from "./protected";
import { convertRomanized } from "./romanized";
import type { ConversionResult, ConvertOptions, EngineMode } from "./types";
import { nowMs } from "./util/time";

export function convert(input: string, options: ConvertOptions = {}): ConversionResult {
  const start = nowMs();
  const classified = classifyDocument(input, options);
  const mode = resolveMode(options.mode, classified.modeRecommendation);

  if (mode.startsWith("romanized-")) {
    return convertRomanized(input, { ...options, mode });
  }

  if (mode === "preeti-strict" || mode === "preeti-mixed" || mode === "legacy-profile") {
    return convertPreeti(input, { ...options, mode: mode === "legacy-profile" ? "preeti-mixed" : mode });
  }

  if (mode === "unicode-passthrough" || mode === "proofread-only") {
    const output = normalizeNepaliText(input);
    return attachProofread({
      input,
      output,
      normalizedOutput: output,
      mode,
      documentConfidence: classified.documentConfidence,
      tokens: [{
        input,
        output,
        range: [0, input.length],
        confidence: classified.documentConfidence,
        alternatives: []
      }],
      alternatives: [],
      protectedSpans: [],
      warnings: classified.warnings,
      diagnostics: classified.diagnostics,
      trace: { steps: [{ name: "passthrough", message: "Normalized Unicode text without conversion." }] },
      timingMs: options.benchmark || options.development ? nowMs() - start : undefined,
      schemaVersion: 1
    }, options);
  }

  return {
    input,
    output: input,
    normalizedOutput: normalizeNepaliText(input),
    mode: "unknown-diagnostic",
    documentConfidence: classified.documentConfidence,
    tokens: [],
    alternatives: [],
    protectedSpans: [],
    warnings: [
      ...classified.warnings,
      {
        code: "UNKNOWN_DIAGNOSTIC_MODE",
        message: "Input was not converted because classification confidence is low.",
        severity: "warning"
      }
    ],
    diagnostics: classified.diagnostics,
    trace: { steps: [{ name: "diagnostic", message: "No converter selected for ambiguous input." }] },
    timingMs: options.benchmark || options.development ? nowMs() - start : undefined,
    schemaVersion: 1
  };
}

function resolveMode(requested: EngineMode | undefined, recommended: EngineMode): EngineMode {
  if (requested && requested !== "auto") return requested === "romanized-health" ? "romanized-mixed" : requested;
  return recommended;
}

export { classifyDocument } from "./classify";
export { extractProtectedSpans, restoreProtectedSpans } from "./protected";
export { convertPreeti } from "./legacy";
export { convertRomanized } from "./romanized";
export * from "./lexicon";
export * from "./memory";
export * from "./proofread";
export * from "./romanized/candidates";
export * from "./romanized/context";
export * from "./romanized/phraseMatch";
export * from "./romanized/rank";
export type * from "./types";
