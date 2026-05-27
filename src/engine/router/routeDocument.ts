import { normalizeNepaliText } from "../../core/normalize/normalizeNepaliText";
import { buildDocumentLattice } from "../lattice";
import { segmentDocument } from "../segmentation";
import type { SegmentationResult } from "../segmentation/types";
import type { ConvertOptions } from "../types";
import { verifyProtectedIntegrity, verifyUnicodeStructure } from "../verify";
import { routeSpan } from "./routeSpan";

export function routeDocument(input: string, options: ConvertOptions = {}) {
  const segmentation: SegmentationResult = segmentDocument(input, {
    ...options,
    surroundingMode: "mixed-office"
  });
  const spanCandidates = segmentation.spans.map((span) => routeSpan(span, options));
  const lattice = buildDocumentLattice(spanCandidates);
  const protectedTexts = segmentation.spans
    .filter((span) => ["url", "email", "phone", "file", "identifier", "date", "quoted-example", "english-preserve"].includes(span.kind))
    .map((span) => span.text);
  const structuralDiagnostics = [
    ...verifyProtectedIntegrity(input, lattice.output, protectedTexts),
    ...verifyUnicodeStructure(lattice.output)
  ];
  const diagnostics = [
    ...segmentation.diagnostics,
    ...lattice.diagnostics,
    ...structuralDiagnostics
  ];
  const output = structuralDiagnostics.some((diagnostic) => diagnostic.severity === "error")
    ? input
    : normalizeNepaliText(lattice.output);
  return {
    input,
    output,
    normalizedOutput: output,
    action: structuralDiagnostics.some((diagnostic) => diagnostic.severity === "error") ? "refuse" as const : lattice.action,
    confidence: structuralDiagnostics.some((diagnostic) => diagnostic.severity === "error") ? 0 : lattice.confidence,
    segmentation,
    spanCandidates,
    warnings: lattice.warnings,
    diagnostics,
    trace: [
      ...segmentation.trace.map((step) => `${step.spanId}:${step.kind}:${step.text}`),
      ...lattice.trace
    ]
  };
}
