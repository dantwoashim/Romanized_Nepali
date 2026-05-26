import { normalizeNepaliText } from "../../core/normalize/normalizeNepaliText";
import { convertPreetiToUnicode } from "../../core/preeti/convertPreetiToUnicode";
import { classifyDocument } from "../classify";
import { extractProtectedSpans, restoreProtectedSpans } from "../protected";
import { attachProofread } from "../proofread";
import type { ConversionResult, ConvertOptions, ConvertedToken, EngineMode, EngineWarning, ProtectedNode } from "../types";
import { nowMs } from "../util/time";
export { diagnoseLegacyInput } from "./diagnostics";
export { parseLegacyGlyphs } from "./parseGlyphs";
export { getLegacyProfile, listLegacyProfiles } from "./profile";
export type { LegacyAtom } from "./atoms";
export type { LegacyFontProfile, LegacyProfileId } from "./profile";

export function convertPreeti(input: string, options: ConvertOptions = {}): ConversionResult {
  const start = nowMs();
  const requestedMode = options.mode ?? "preeti-mixed";
  const mode = normalizePreetiMode(requestedMode);
  const classified = classifyDocument(input, { ...options, mode });

  if (mode === "preeti-strict") {
    const result = convertPreetiToUnicode(input);
    const protectedLike = extractProtectedSpans(input, "preeti-mixed").spans;
    const warnings: EngineWarning[] = [
      ...classified.warnings,
      ...result.warnings.map((warning): EngineWarning => ({
        code: warning.code,
        message: warning.message,
        severity: warning.severity,
        range: warning.position === undefined ? undefined : [warning.position, warning.position + (warning.sourceChar?.length ?? 1)]
      })),
      ...(protectedLike.length > 0
        ? [{
            code: "STRICT_PREETI_MIXED_CONTENT_WARNING",
            message: "Strict Preeti mode saw English/digital-like spans; use preeti-mixed for mixed documents.",
            severity: "warning" as const
          }]
        : [])
    ];
    return attachProofread({
      input,
      output: result.normalizedOutput,
      normalizedOutput: result.normalizedOutput,
      mode,
      documentConfidence: classified.documentConfidence,
      tokens: [{
        input,
        output: result.normalizedOutput,
        range: [0, input.length],
        confidence: classified.documentConfidence,
        alternatives: []
      }],
      alternatives: [],
      protectedSpans: [],
      warnings,
      diagnostics: [
        ...classified.diagnostics,
        {
          code: "STRICT_PREETI_PATH",
          message: "Strict Preeti conversion called the existing converter without protected-span shielding.",
          severity: "info" as const
        }
      ],
      trace: {
        steps: [
          { name: "classify", message: `Recommended ${classified.modeRecommendation}.` },
          { name: "convert", message: "Wrapped existing strict Preeti converter." }
        ]
      },
      timingMs: options.benchmark || options.development ? nowMs() - start : undefined,
      schemaVersion: 1
    }, options);
  }

  const protectedResult = extractProtectedSpans(input, mode);
  const converted = convertProtectedNodes(protectedResult.nodes);
  const output = restoreProtectedSpans(converted.outputBeforeRestore, protectedResult.spans);
  const normalizedOutput = normalizeNepaliText(output);
  const warnings: EngineWarning[] = [
    ...classified.warnings,
    ...converted.warnings,
    ...protectedResult.spans.map((span): EngineWarning => ({
      code: "PROTECTED_SPAN_PRESERVED",
      message: `Preserved ${span.kind} span "${span.original}".`,
      severity: "info",
      range: span.range
    }))
  ];

  return attachProofread({
    input,
    output: normalizedOutput,
    normalizedOutput,
    mode,
    documentConfidence: classified.documentConfidence,
    tokens: converted.tokens,
    alternatives: [],
    protectedSpans: protectedResult.spans,
    warnings,
    diagnostics: [
      ...classified.diagnostics,
      {
        code: "PROTECTED_SPANS_APPLIED",
        message: `Protected ${protectedResult.spans.length} spans before legacy-font conversion.`,
        severity: "info" as const,
        data: { count: protectedResult.spans.length }
      }
    ],
    trace: {
      steps: [
        { name: "classify", message: `Recommended ${classified.modeRecommendation}.` },
        { name: "protect", message: `Protected ${protectedResult.spans.length} spans.` },
        { name: "convert", message: "Wrapped existing Preeti converter over text nodes." }
      ]
    },
    timingMs: options.benchmark || options.development ? nowMs() - start : undefined,
    schemaVersion: 1
  }, options);
}

function convertProtectedNodes(nodes: ProtectedNode[]) {
  let outputBeforeRestore = "";
  const tokens: ConvertedToken[] = [];
  const warnings: EngineWarning[] = [];

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

    const result = convertPreetiToUnicode(node.text);
    outputBeforeRestore += result.normalizedOutput;
    tokens.push({
      input: node.text,
      output: result.normalizedOutput,
      range: node.range,
      confidence: 0.75,
      alternatives: []
    });
    warnings.push(...result.warnings.map((warning): EngineWarning => ({
      code: warning.code,
      message: warning.message,
      severity: warning.severity,
      range: warning.position === undefined ? undefined : [node.range[0] + warning.position, node.range[0] + warning.position + (warning.sourceChar?.length ?? 1)]
    })));
  }

  return { outputBeforeRestore, tokens, warnings };
}

function normalizePreetiMode(mode: EngineMode): EngineMode {
  return mode === "preeti-strict" ? "preeti-strict" : "preeti-mixed";
}
